import createMemoizedCallback from '@/v3/lib/utils/caching/createMemoizedCallback'

import { fetchData } from '..'
import { LegacyGame, LegacyGameDict } from './types'

export { getGameIds as getSupportedGameIds }

const rawEntries: LegacyGame[] = await fetchRawEntries()

async function fetchRawEntries() {
  const data: LegacyGame[] = await fetchData('/legacy-games.min.json')

  if (!Array.isArray(data)) {
    const err = 'Fetch failed for legacy-games.min.json: Response was not an array'
    console.error(err, data)
    throw new Error(err)
  }

  return data
}

export const getGames = createMemoizedCallback((): LegacyGameDict => {
  return rawEntries.reduce((acc: any, item) => {
    acc[item.id] = item
    return acc
  }, {})
})

export const getGameIds = createMemoizedCallback((): string[] => {
  return rawEntries.map((entry) => entry.id)
})

export function getGameById(id: string): LegacyGame {
  const absId = _getAbsoluteGameId(id)
  const data = getGames()[absId]
  if (data === undefined) {
    throw new Error(`Game ${absId} not found`)
  }
  return data
}

function _getAbsoluteGameId(gameId: string): string {
  switch (gameId) {
    case 'lgp':
      return 'lgpe-lgp'
    case 'lge':
      return 'lgpe-lge'
    case 'sw':
      return 'swsh-sw'
    case 'sh':
      return 'swsh-sh'
    case 'bd':
      return 'bdsp-bd'
    case 'sp':
      return 'bdsp-sp'
    case 's':
      return 'sv-s'
    case 'v':
      return 'sv-v'
  }
  return gameId as string
}
