import { findPokemonInBoxes } from './helpers'
import { type MiddlewareContext, createMiddlewarePipeline } from './middleware'
import type { DeserializedLivingDexDoc } from './types'

function _fix_munkidori({ dex }: MiddlewareContext<DeserializedLivingDexDoc>): DeserializedLivingDexDoc {
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

function _fix_tatsugiri_stretchy({ dex }: MiddlewareContext<DeserializedLivingDexDoc>): DeserializedLivingDexDoc {
  const corruptedHits = findPokemonInBoxes('tatsugiri-sketchy', dex)
  const shouldFix = corruptedHits.length > 0

  if (!shouldFix) {
    return dex
  }

  for (const [boxIndex, pokemonIndex] of corruptedHits) {
    dex.boxes[boxIndex].pokemon[pokemonIndex]!.id = 'tatsugiri-stretchy'
  }

  return dex
}

function _fix_maushold_four({ dex }: MiddlewareContext<DeserializedLivingDexDoc>): DeserializedLivingDexDoc {
  const corruptedHits = findPokemonInBoxes('maushold-four', dex)
  const corruptedHits_three = findPokemonInBoxes('maushold', dex)
  const shouldFix = corruptedHits.length > 0

  if (!shouldFix) {
    return dex
  }

  for (const [boxIndex, pokemonIndex] of corruptedHits_three) {
    dex.boxes[boxIndex].pokemon[pokemonIndex]!.id = 'maushold-three'
  }

  for (const [boxIndex, pokemonIndex] of corruptedHits) {
    dex.boxes[boxIndex].pokemon[pokemonIndex]!.id = 'maushold'
  }

  return dex
}

const fixes = [_fix_munkidori, _fix_tatsugiri_stretchy, _fix_maushold_four]

export const applyDefaultMiddlewares = createMiddlewarePipeline(...fixes)
