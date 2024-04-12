import { getGameById } from '@/lib/data-client/games'

import { DEX_SCHEMA_VERSION, DexBox, LoadedDex } from '../types'
import { createBoxTitle } from './createBoxTitle'
import { createDexPokemonFromPid } from './createDexPokemonFromPid'
import { normalizePresetBoxes } from './normalizePresetBoxes'
import { PresetDex } from './types'

export const createDexFromPreset = (gameId: string, preset: PresetDex, userId: string | undefined): LoadedDex => {
  const game = getGameById(gameId)
  const timestamp = new Date()
  let totalRegular = 0
  let totalShiny = 0

  // TODO exclude pokemon that cannot be shiny (e.g. Cap Pikachus) - we need a list of all of them
  //    Mark them as "disabled" when generating the component if box.shiny=true but pkm.shiny=false
  const generateBoxes = (shiny: boolean): DexBox[] => {
    const initialIndex = shiny ? preset.boxes.length : 0
    const boxes = normalizePresetBoxes(gameId, preset)
    return boxes.map((box, index) => ({
      title: createBoxTitle(preset.gameSet, box.title, index + 1 + initialIndex),
      shiny: shiny,
      pokemon: box.pokemon.map((pokemon) => {
        if (pokemon === null) {
          return null
        }
        shiny ? totalShiny++ : totalRegular++
        return createDexPokemonFromPid(box.title || '', pokemon, shiny)
      }),
    }))
  }

  const nonShinyBoxes = generateBoxes(false)
  const allBoxes = nonShinyBoxes.concat(generateBoxes(true))

  const dex: LoadedDex = {
    id: undefined,
    userId: userId,
    createdAt: timestamp,
    updatedAt: timestamp,

    title: game.name + ' - Living Dex',
    schemaVersion: DEX_SCHEMA_VERSION,
    gameId: game.id,
    gameSetId: game.setId,
    presetId: preset.id,
    presetVersion: preset.version,
    caughtRegular: 0,
    totalRegular: 0,
    caughtShiny: 0,
    totalShiny: 0,
    boxes: allBoxes,
    lostPokemon: [],
  }

  dex.totalRegular = totalRegular
  dex.totalShiny = totalShiny

  return dex
}
