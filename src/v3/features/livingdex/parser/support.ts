import { LivingDex } from '@prisma/client'

import { migratePokemonId } from '@/v3/lib/data-client/migrations'
import { SerializableDate } from '@/v3/lib/utils/serialization/jsonSerializable'

import { getLivingDexFormat, parseLivingDex, serializeLivingDex } from '.'
import { getGameSetByGameId } from '../../../lib/data-client/game-sets'
import { getPokemonEntry, isShinyLocked } from '../../../lib/data-client/pokemon'
import { convertPokemonListToStorable } from '../repository/converters/convertPokemonListToStorable'
import { getPresetByIdForGameSet, getPresets } from '../repository/presets'
import { normalizeDexWithPreset } from '../repository/presets/normalizeDexWithPreset'
import { DEX_SCHEMA_VERSION, DexBox, LoadedDex, NullableDexPokemon, StorableDex } from '../repository/types'
import {
  DeserializedLivingDexDoc,
  LIVINGDEX_DOC_SPEC_VERSION_LAST,
  LivingDexDocBox,
  LivingDexDocPokemon,
} from './types'

export function convertDexFromLegacyToV4(dex: LoadedDex): DeserializedLivingDexDoc {
  if (!dex.userId) {
    throw new Error(`LoadedDex has no userId`)
  }

  const createdAt = sanitizeDate(dex.createdAt)
  const updatedAt = sanitizeDate(dex.updatedAt)

  return {
    $id: dex.id,
    creationTime: createdAt.toISOString(),
    lastUpdateTime: updatedAt.toISOString(),
    gameId: dex.gameId,
    title: dex.title,
    ownerId: dex.userId,
    format: LIVINGDEX_DOC_SPEC_VERSION_LAST,
    legacyPresetId: dex.presetId,
    legacyPresetVersion: dex.presetVersion,
    boxes: dex.boxes.map(
      (box, i): LivingDexDocBox => ({
        title: box.title ?? `Box ${i + 1}`,
        shiny: box.shiny,
        pokemon: box.pokemon.map((pokemon): LivingDexDocPokemon | null => {
          if (!pokemon) {
            return null
          }

          if (!pokemon.pid) {
            throw new Error(`Pokemon has no id`)
          }

          const emblemMarks = []

          if (pokemon.alpha) {
            emblemMarks.push('alpha')
          }

          if (pokemon.gmax) {
            emblemMarks.push('gmax')
          }

          return {
            id: pokemon.pid,
            captured: pokemon.caught,
            shiny: pokemon.shiny,
            originMark: undefined,
            nature: undefined,
            pokerus: undefined,
            level: undefined,
            dynamaxLevel: undefined,
            teraType: undefined,
            ball: undefined,
            item: undefined,
            language: undefined,
            evs: [],
            ivs: [],
            moves: [],
            emblemMarks: emblemMarks,
          }
        }),
      }),
    ),
  }
}

export function convertDexFromV4ToLegacy(dexRecord: LivingDex, dex: DeserializedLivingDexDoc): StorableDex {
  if (!dex.legacyPresetId || !dex.legacyPresetVersion) {
    throw new Error(`Dex has no legacy preset ID or version`)
  }

  return {
    id: dexRecord.id,
    createdAt: dexRecord.creationTime,
    updatedAt: dexRecord.lastUpdateTime,
    userId: dexRecord.userId,
    title: dexRecord.title || 'Untitled',
    sver: DEX_SCHEMA_VERSION,
    preset: [getGameSetByGameId(dex.gameId).id, dex.gameId, dex.legacyPresetId, dex.legacyPresetVersion],
    caught: [0, 0], //  [caught, total]
    caughtShiny: [0, 0],
    boxes: dex.boxes.map(
      (box): DexBox => ({
        title: box.title,
        shiny: box.shiny,
        pokemon: box.pokemon.map((pokemon): NullableDexPokemon => {
          if (!pokemon) {
            return null
          }

          const pkmEntry = getPokemonEntry(migratePokemonId(pokemon.id))

          return {
            pid: pkmEntry.id,
            nid: pkmEntry.nid,
            caught: pokemon.captured,
            shiny: pokemon.shiny,
            alpha: pokemon.emblemMarks.includes('alpha'),
            gmax: pokemon.emblemMarks.includes('gmax'),
          }
        }),
      }),
    ),
  }
}

export function convertDexFromV4ToLegacyStd(
  id: string | undefined,
  userId: string,
  dex: DeserializedLivingDexDoc,
): StorableDex {
  if (!dex.legacyPresetId || !dex.legacyPresetVersion) {
    throw new Error(`Dex has no legacy preset ID or version`)
  }

  return {
    id: id,
    createdAt: sanitizeDate(dex.creationTime),
    updatedAt: sanitizeDate(dex.lastUpdateTime),
    userId: userId,
    title: dex.title || 'Untitled',
    sver: DEX_SCHEMA_VERSION,
    preset: [getGameSetByGameId(dex.gameId).id, dex.gameId, dex.legacyPresetId, dex.legacyPresetVersion],
    caught: [0, 0], //  [caught, total]
    caughtShiny: [0, 0],
    boxes: dex.boxes.map(
      (box): DexBox => ({
        title: box.title,
        shiny: box.shiny,
        pokemon: box.pokemon.map((pokemon): NullableDexPokemon => {
          if (!pokemon) {
            return null
          }

          const pkmEntry = getPokemonEntry(pokemon.id)

          return {
            pid: pokemon.id,
            nid: pkmEntry.nid,
            caught: pokemon.captured,
            shiny: pokemon.shiny,
            alpha: pokemon.emblemMarks.includes('alpha'),
            gmax: pokemon.emblemMarks.includes('gmax'),
          }
        }),
      }),
    ),
  }
}

export const findFirstPokemonInBoxes = (pokemonId: string, boxes: DexBox[]): NullableDexPokemon => {
  let pokemon: NullableDexPokemon = null

  boxes.some((box) => {
    pokemon = box.pokemon.find((pkm) => pkm?.pid === pokemonId) || null
    return !!pokemon
  })

  return pokemon
}

export function dexToLoadedDex(dex: LivingDex): LoadedDex {
  const dataMd = convertDexFromV4ToLegacy(dex, parseLivingDex(dex.data))
  const loadedDex = _convertLegacyStorableDexToLoadedDex(dex.id, dataMd)

  // TODO: fix something wrong going on with dates in
  //  parseLivingDex,  convertDexFromV4ToLegacy or convertFirebaseStorableDexToLoadedDex
  loadedDex.createdAt = dex.creationTime
  loadedDex.updatedAt = dex.lastUpdateTime
  loadedDex.id = dex.id
  loadedDex.title = dex.title || 'Untitled'

  return loadedDex
}

export function loadedDexToDex(userId: string, loadedDex: LoadedDex): Omit<LivingDex, 'id'> {
  return {
    specVer: LIVINGDEX_DOC_SPEC_VERSION_LAST,
    userId: userId,
    data: serializeLivingDex(
      convertDexFromLegacyToV4(loadedDex),
      getLivingDexFormat(LIVINGDEX_DOC_SPEC_VERSION_LAST),
      false,
    ),
    gameId: loadedDex.gameId,
    title: loadedDex.title,
    creationTime: loadedDex.createdAt ?? new Date(),
    lastUpdateTime: loadedDex.updatedAt ?? new Date(),
  }
}

function _convertLegacyStorableDexToLoadedDex(id: string, doc: StorableDex): LoadedDex {
  doc.id = id
  const presets = getPresets()
  const dex = _documentToDex(doc)
  const preset = getPresetByIdForGameSet(dex.gameSetId, dex.presetId)

  if (preset) {
    return normalizeDexWithPreset(dex, preset)
  }

  // TODO find workaround for this case:
  console.error(`Preset ${dex.presetId} not found for game ${dex.gameId}`)
  return normalizeDexWithPreset(dex, presets['home']['fully-sorted'])
}

const defaultGame = 'home'
const defaultGameSet = 'home'
const defaultPreset = 'fully-sorted'
const defaultPresetVersion = 0

function _documentToDex(doc: StorableDex): LoadedDex {
  const boxes: DexBox[] = doc.boxes || []

  let gameId: string = defaultGame
  let gameSetId: string = defaultGameSet
  let presetId = defaultPreset
  let presetVersion = defaultPresetVersion

  if (doc.game) {
    // legacy support
    gameId = doc.game as string
    if (gameId === 'home') {
      presetId = 'grouped-region'
      gameSetId = 'home'
    }
  }

  if (doc.preset && Array.isArray(doc.preset)) {
    // uses new preset field
    if (doc.preset.length === 3) {
      // uses beta preset field
      ;[gameId, presetId, presetVersion] = doc.preset as [string, string, number]
      gameSetId = getGameSetByGameId(gameId).id
    }
    if (doc.preset.length === 4) {
      // uses final preset field
      ;[gameSetId, gameId, presetId, presetVersion] = doc.preset as [string, string, string, number]
    }
  }

  const schemaVersion = doc.sver || 0

  return {
    id: doc.id,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,

    title: doc.title,
    schemaVersion: schemaVersion,
    gameId: gameId,
    gameSetId: gameSetId,
    presetId: presetId,
    presetVersion: presetVersion,

    // counters will be recalculated
    caughtRegular: -1,
    totalRegular: -1,
    caughtShiny: -1,
    totalShiny: -1,

    boxes: boxes.map((box) => {
      return {
        title: '', // title will be replaced with preset name
        pokemon: _normalizePokemonList(box.pokemon, schemaVersion),
        shiny: box.shiny || false,
      }
    }),
    lostPokemon: [],
  }
}

export function sanitizeDate(
  date: Date | SerializableDate | { seconds: number; nanoseconds: number } | string | undefined,
): Date {
  if (date === undefined) {
    return new Date()
  }

  if (date instanceof Date) {
    return date
  }

  if (typeof date === 'string') {
    return new Date(date)
  }

  if ('seconds' in date) {
    return new Date(Number(date.seconds) * 1000)
  }

  if (typeof date === 'object' && Object.keys(date).length === 2) {
    return new Date(date._value)
  }

  if (typeof date === 'object' && date._type && date._type === 'Date' && date._value) {
    return new Date(date._value)
  }

  return new Date('2023-01-01T00:00:00.000Z')
}

function _normalizePokemonList(storedPokemonList: NullableDexPokemon[], schemaVersion: number): NullableDexPokemon[] {
  return convertPokemonListToStorable(storedPokemonList, schemaVersion).map((pkm: NullableDexPokemon) => {
    if (pkm === null) {
      return null
    }

    const pkmEntry = getPokemonEntry(pkm.pid)

    return {
      pid: pkm.pid,
      nid: pkmEntry.nid,
      caught: pkm.caught,
      shiny: pkm.shiny,
      shinyLocked: isShinyLocked(pkm.pid),
      shinyBase: pkmEntry.shiny.base,
      gmax: pkm.gmax,
      alpha: pkm.alpha,
    }
  })
}
