import { isCatchable } from '../index'
import { DexPokemonList } from '../types'

// TODO: add cap-pikachus (to include -cap at the end)
const _pokemonIdRenamesVerLessThan3: { [key: string]: string } = {
  'greninja-battle-bond': 'greninja--battle-bond',
  'zygarde-power-construct': 'zygarde--power-construct',
  'zygarde-10-power-construct': 'zygarde-10--power-construct',
  'rockruff-own-tempo': 'rockruff--own-tempo',
  vivillon: 'vivillon-meadow',
  'vivillon-icy-snow': 'vivillon',
}

export const convertPokemonListToStorable = (
  storedPokemonList: DexPokemonList,
  schemaVersion: number,
): DexPokemonList => {
  return storedPokemonList.map((pkm) => {
    const rawPkm = pkm as any
    if (pkm === null) return null

    if (schemaVersion < 3) {
      // Fixes for legacy schemas
      if (_pokemonIdRenamesVerLessThan3[pkm.pid] !== undefined) {
        pkm.pid = _pokemonIdRenamesVerLessThan3[pkm.pid]
      } else if (rawPkm.abilityType === 'special' && rawPkm.ability) {
        pkm.pid = `${pkm.pid}--${rawPkm.ability}` as string
      }
    }

    return {
      pid: pkm.pid,
      nid: pkm.nid,
      caught: pkm.caught && isCatchable(pkm),
      shiny: pkm.shiny,
      gmax: pkm.gmax,
      alpha: pkm.alpha,
    }
  })
}
