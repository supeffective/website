import { getPokemonEntry, isShinyLocked } from '@/lib/data-client/pokemon'

import { DexPokemon, DexPokemonList } from '../types'
import { convertPokemonListToStorable } from './convertPokemonListToStorable'

export const convertPokemonListToNormalized = (
  storedPokemonList: DexPokemonList,
  schemaVersion: number,
): DexPokemonList => {
  return convertPokemonListToStorable(storedPokemonList, schemaVersion).map((pkm: DexPokemon | null) => {
    if (pkm === null) return null

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
