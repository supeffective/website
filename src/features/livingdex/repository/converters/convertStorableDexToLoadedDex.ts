import { getGameSetByGameId } from '@/lib/data-client/game-sets'

import { DexBox, LoadedDex, StorableDex } from '../types'
import { convertPokemonListToNormalized } from './convertPokemonListToNormalized'

// todo move to config.json
const defaultGame = 'home'
const defaultGameSet = 'home'
const defaultPreset = 'fully-sorted'
const defaultPresetVersion = 0

export const convertStorableDexToLoadedDex = (doc: StorableDex): LoadedDex => {
  const boxes: Array<DexBox> = doc.boxes || []

  let game: string = defaultGame
  let gameSet: string = defaultGameSet
  let preset = defaultPreset
  let presetVersion = defaultPresetVersion

  if (doc.game) {
    // legacy support
    game = doc.game as string
    if (game === 'home') {
      preset = 'grouped-region'
      gameSet = 'home'
    }
  }

  if (doc.preset && Array.isArray(doc.preset)) {
    const docPreset = doc.preset as Array<any>
    // uses new preset field
    if (docPreset.length === 3) {
      // uses beta preset field
      ;[game, preset, presetVersion] = docPreset as [string, string, number]
      gameSet = getGameSetByGameId(game).id
    }
    if (docPreset.length === 4) {
      // uses final preset field
      ;[gameSet, game, preset, presetVersion] = docPreset as [string, string, string, number]
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
    gameId: game,
    gameSetId: gameSet,
    presetId: preset,
    presetVersion: presetVersion,

    // counters will be recalculated
    caughtRegular: -1,
    totalRegular: -1,
    caughtShiny: -1,
    totalShiny: -1,

    boxes: boxes.map((box, i) => {
      return {
        title: box.title || `Box ${i + 1}`, // title will be replaced with preset name
        pokemon: convertPokemonListToNormalized(box.pokemon, schemaVersion),
        shiny: box.shiny || false,
      }
    }),
    lostPokemon: [],
  }
}
