import createMemoizedCallback from '@/v3/lib/utils/caching/createMemoizedCallback'
import { SimpleSearchIndex } from '@/v3/lib/utils/search/SimpleSearchIndex'

import { fetchData } from '..'
import { migratePokemonId } from '../migrations'
import { PokemonEntry, PokemonEntryMap, PokemonEntrySearchIndex, RawLegacyPokemonEntry } from './types'

const rawEntries: RawLegacyPokemonEntry[] = await fetchRawEntries()

async function fetchRawEntries() {
  const data: RawLegacyPokemonEntry[] = await fetchData('/legacy-pokemon.min.json')

  if (!Array.isArray(data)) {
    const err = 'Fetch failed for legacy-pokemon.min.json: Response was not an array'
    console.error(err, data)
    throw new Error(err)
  }

  return data
}

export const getPokemonEntries = createMemoizedCallback((): PokemonEntry[] => {
  return rawEntries.map(_transformPokemon)
})

export const getPokemonIds = createMemoizedCallback((): string[] => {
  return getPokemonEntries().map((entry) => entry.id)
})

const _getPokemonEntryMap = createMemoizedCallback((): PokemonEntryMap => {
  const map: PokemonEntryMap = new Map<string, PokemonEntry>()
  getPokemonEntries().forEach((entry) => {
    map.set(entry.id, entry)
  })
  return map
})

export const getPokemonSearchIndex = createMemoizedCallback((): PokemonEntrySearchIndex => {
  const index = new SimpleSearchIndex<PokemonEntry[]>()
  index.buildWithTokens(getPokemonEntries(), [
    [
      'num',
      (pk: PokemonEntry) => {
        if (pk.dexNum !== null && pk.dexNum > 5000) {
          pk.dexNum = null
        }
        const dexNum = (pk.dexNum === null ? 0 : pk.dexNum).toString()
        return [dexNum, dexNum.padStart(3, '0'), dexNum.padStart(4, '0')]
      },
    ],
    ['name', (pk: PokemonEntry) => [pk.id, pk.name, pk.name.replace(/ /g, '').replace(/\s/g, '')]],
    ['type', (pk: PokemonEntry) => [pk.type1, pk.type2].filter((t) => t) as string[]],
    ['base', (pk: PokemonEntry) => [pk.form.baseSpecies || pk.id]],
    ['color', (pk: PokemonEntry) => [pk.color || '']],
    ['id', (pk: PokemonEntry) => [pk.id || '']],
    ['obtainable', (pk: PokemonEntry) => pk.location.obtainableIn],
  ])

  return index
})

export function getPokemonEntry(pokemonId: string): PokemonEntry {
  const safeId = migratePokemonId(pokemonId)
  const map = _getPokemonEntryMap()
  if (map.has(safeId)) {
    return map.get(safeId)!
  }

  throw new Error(`Pokemon with ID '${safeId}' does not exist.`)
}

export function isShinyLocked(pokemonId: string): boolean {
  return !getPokemonEntry(pokemonId).shiny.released
}

function _transformPokemon(pokemon: RawLegacyPokemonEntry): PokemonEntry {
  return {
    id: pokemon.id,
    nid: pokemon.nid,
    dexNum: pokemon.dexNum,
    name: pokemon.name,
    type1: pokemon.type1,
    type2: pokemon.type2,
    color: pokemon.color,
    shiny: {
      base: pokemon.shinyBase,
      released: pokemon.shinyReleased,
    },
    form: {
      isForm: pokemon.isForm,
      baseSpecies: pokemon.baseSpecies,
      isFemaleForm: pokemon.isFemaleForm,
      isMaleForm: pokemon.hasGenderDifferences && !pokemon.isFemaleForm,
      hasGenderForms: pokemon.hasGenderDifferences,
      hasGmax: pokemon.canGmax,
      isGmax: pokemon.isGmax,
    },
    location: {
      obtainableIn: pokemon.obtainableIn,
      eventOnlyIn: pokemon.eventOnlyIn,
      storableIn: pokemon.storableIn,
    },
    refs: pokemon.refs,
  }
}
