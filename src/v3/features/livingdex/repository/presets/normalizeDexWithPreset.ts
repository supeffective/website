import { getPokemonEntry, isShinyLocked } from '@/v3/lib/data-client/pokemon'

import { isCatchable, recalculateCounters } from '../index'
import { DexBox, DexPokemon, LoadedDex } from '../types'
import { createBoxTitle } from './createBoxTitle'
import { createDexFromPreset } from './createDexFromPreset'
import { createDexPokemonFromPid } from './createDexPokemonFromPid'
import { normalizePresetBoxes } from './normalizePresetBoxes'
import { PresetDex, PresetDexBox } from './types'

const _LEFTOVER_BOX_NAME = 'TERU-SAMA'

export const normalizeDexWithPreset = (oldDex: LoadedDex, preset: PresetDex, sideBySideShinies = true): LoadedDex => {
  // Create the new dex
  const newDex = createDexFromPreset(oldDex.gameId, preset, oldDex.userId)
  newDex.id = oldDex.id // Important!  otherwise we will create duplicated dexes
  newDex.title = oldDex.title
  newDex.createdAt = oldDex.createdAt

  // fully generate all boxes, taking all the available pokemon info from the old one
  const presetBoxes = normalizePresetBoxes(newDex.gameId, preset)
  const [nonShinyBoxes, nonShinyLost] = _matchBoxes(false, oldDex.boxes, preset, presetBoxes, sideBySideShinies)
  const [shinyBoxes, shinyLost] = _matchBoxes(true, oldDex.boxes, preset, presetBoxes, sideBySideShinies)
  newDex.boxes = sideBySideShinies
    ? nonShinyBoxes.flatMap((box, i) => [box, shinyBoxes[i]])
    : nonShinyBoxes.concat(shinyBoxes)

  // rewrite titles:

  newDex.boxes = newDex.boxes.map((box, i) => {
    box.title = createBoxTitle(newDex.gameSetId, box.title?.startsWith('Box') ? null : box.title, i + 1)
    return box
  })

  newDex.lostPokemon = nonShinyLost.pokemon.concat(shinyLost.pokemon)

  return recalculateCounters(newDex)
}

function _matchBoxes(
  asShiny: boolean,
  oldBoxes: DexBox[],
  preset: PresetDex,
  presetBoxes: PresetDexBox[],
  sideBySideShinies = true,
): [DexBox[], DexBox] {
  // Collect all the pokemon
  const pkmHashMap: { [key: string]: (DexPokemon | null)[] } = {}
  oldBoxes.map((box) => {
    box.pokemon.map((pokemon) => {
      if (pokemon === null || pokemon.shiny !== asShiny) {
        return
      }
      if (pkmHashMap[pokemon.pid] === undefined) {
        pkmHashMap[pokemon.pid] = []
      }
      pkmHashMap[pokemon.pid].push(pokemon)
    })
  })

  const initialBoxIndex = sideBySideShinies ? 0 : asShiny ? presetBoxes.length : 0

  const newBoxes = presetBoxes.map((box, boxIndex) => ({
    title: createBoxTitle(preset.gameSet as string, box.title, boxIndex + 1 + initialBoxIndex),
    shiny: asShiny,
    pokemon: box.pokemon.map((pokemon) => {
      if (pokemon === null) {
        return null
      }
      let pid, caught, shiny, shinyLocked, gmax, alpha

      if (typeof pokemon === 'object') {
        pid = pokemon.pid
        caught = pokemon.caught === true
        shiny = pokemon.shiny === true
        shinyLocked = pokemon.shinyLocked === true
        gmax = pokemon.gmax === true
        alpha = pokemon.alpha === true
      } else {
        pid = pokemon as string
        caught = false
        shiny = false
        shinyLocked = false
        gmax = false
        alpha = false
      }

      const oldPokemonSet = pkmHashMap[pid]
      if (oldPokemonSet === undefined || oldPokemonSet === null || oldPokemonSet.length === 0) {
        // this pokemon was not found, add new entry
        return createDexPokemonFromPid(box.title || '', pokemon, asShiny || shiny)
      }

      const oldPokemon = oldPokemonSet.shift()
      if (oldPokemon === null || oldPokemon === undefined) {
        throw new Error('Unexpected error: old pokemon was null or undefined in migration hashmap')
      }

      const _pkmEntry = getPokemonEntry(pid)

      return {
        pid: pid,
        nid: _pkmEntry.nid,
        caught: (oldPokemon.caught && isCatchable({ ...oldPokemon, shiny: asShiny })) || caught,
        shiny: asShiny || shiny,
        shinyLocked: isShinyLocked(pid) || shinyLocked,
        shinyBase: getPokemonEntry(pid).shiny.base,
        gmax: oldPokemon.gmax || gmax,
        alpha: oldPokemon.alpha || alpha,
      }
    }),
  }))

  // put remaining Pokemon of hashMap, inside a new box in newBoxes
  const dupesBox: DexBox = {
    title: _LEFTOVER_BOX_NAME,
    pokemon: [],
    shiny: asShiny,
  }

  Object.keys(pkmHashMap).map((pid) => {
    if (pkmHashMap[pid].length === 0) {
      return
    }
    pkmHashMap[pid].forEach((pokemon) => {
      if (pokemon === null) {
        return
      }
      if (!pokemon.caught) {
        // do not need to keep uncaught leftover pokemon
        return
      }
      const pkmEntry = getPokemonEntry(pokemon.pid)
      dupesBox.pokemon.push({
        pid: pokemon.pid,
        nid: pkmEntry.nid,
        caught: true, // at this point, this is always true
        shiny: asShiny,
        shinyLocked: isShinyLocked(pokemon.pid),
        shinyBase: pkmEntry.shiny.base,
        gmax: pokemon.gmax,
        alpha: pokemon.alpha,
      })
    })
  })

  if (dupesBox.pokemon.length > 0) {
    console.log('These pokemon do not fit in the current dex: ', dupesBox)
  }

  return [newBoxes, dupesBox]
}
