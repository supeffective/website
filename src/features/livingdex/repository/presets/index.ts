import { getGameSetByGameId } from '@/lib/data-client/game-sets'
import createMemoizedCallback from '@/lib/utils/caching/createMemoizedCallback'

import rawPresetsJson from '@/lib/data-client/box-presets/legacy-boxpresets.min.json'
import { PresetDex, PresetDexMap } from './types'

const rawPresets: PresetDexMap = fetchRawEntries()

function fetchRawEntries() {
  const data = rawPresetsJson

  if (typeof data !== 'object') {
    const err = 'Fetch failed for legacy-boxpresets.min.json: Response was not an object'
    console.error(err, data)
    throw new Error(err)
  }

  return data
}

export const getPresets = createMemoizedCallback(() => {
  return rawPresets
})

export function getPresetsForGame(gameId: string): { [presetId: string]: PresetDex } {
  return getPresets()[getGameSetByGameId(gameId).id] || {}
}

export function getPresetByIdForGame(gameId: string, presetId: string): PresetDex | undefined {
  return getPresetByIdForGameSet(getGameSetByGameId(gameId).id, presetId)
}

export function getPresetByIdForGameSet(gameSetId: string, presetId: string): PresetDex | undefined {
  const presets = getPresets()[gameSetId]
  return presets ? presets[presetId] : undefined
}
