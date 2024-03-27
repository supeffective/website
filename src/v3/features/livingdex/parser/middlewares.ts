import { findPokemonInBoxes } from './helpers'
import { MiddlewareContext, createMiddlewarePipeline } from './middleware'
import { DeserializedLivingDexDoc } from './types'

function _mw_MunkidoriIds({ dex }: MiddlewareContext<DeserializedLivingDexDoc>): DeserializedLivingDexDoc {
  const corruptedHits = findPokemonInBoxes('monkidori', dex)
  const shouldFix = corruptedHits.length > 0

  if (!shouldFix) {
    return dex
  }

  for (const [boxIndex, pokemonIndex] of corruptedHits) {
    dex.boxes[boxIndex].pokemon[pokemonIndex]!.id = 'munkidori'
  }

  return dex
}

export const applyDefaultMiddlewares = createMiddlewarePipeline(_mw_MunkidoriIds)
