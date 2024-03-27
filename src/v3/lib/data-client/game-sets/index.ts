import createMemoizedCallback from '@/v3/lib/utils/caching/createMemoizedCallback'

import { fetchData } from '..'
import { getGameById } from '../games'
import { LegacyGameSet, LegacyGameSetDict } from './types'

export { getGameSetIds as getSupportedGameSetIds }

const rawEntries: LegacyGameSet[] = await fetchRawEntries()

async function fetchRawEntries() {
  const data: LegacyGameSet[] = await fetchData('/legacy-gamesets.min.json')

  if (!Array.isArray(data)) {
    const err = 'Fetch failed for legacy-gamesets.min.json: Response was not an array'
    console.error(err, data)
    throw new Error(err)
  }

  return data
}

export const getGameSets = createMemoizedCallback((): LegacyGameSetDict => {
  return rawEntries.reduce((acc: any, item) => {
    acc[item.id] = item
    return acc
  }, {})
})

export const getGameSetIds = createMemoizedCallback((): string[] => {
  return rawEntries.map((entry) => entry.id)
})

export function getGameSetById(id: string): LegacyGameSet {
  const data = getGameSets()[id]
  if (data === undefined) {
    throw new Error(`Game set "${id}" not found`)
  }
  return data
}

export function getGameSetByGameId(id: string): LegacyGameSet {
  return getGameSetById(getGameById(id).setId)
}
