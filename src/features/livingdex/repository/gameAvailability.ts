import { getSupportedGameIds } from '../../../lib/data-client/games'
import { LoadedDexList } from './types'

export function getUsedGameSets(userDexes: LoadedDexList): string[] {
  const gameSets = new Set<string>()
  userDexes.forEach((dex) => {
    if (dex.gameSetId && !gameSets.has(dex.gameSetId)) {
      gameSets.add(dex.gameSetId)
    }
  })
  return Array.from(gameSets)
}

export function getUsedGames(userDexes: LoadedDexList): string[] {
  const games = new Set<string>()
  userDexes.forEach((dex) => {
    if (dex.gameId && !games.has(dex.gameId)) {
      games.add(dex.gameId)
    }
  })
  return Array.from(games)
}

export function countGameDexes(userDexes: LoadedDexList, gameId: string): number {
  const counter = {
    count: 0,
  }
  userDexes.forEach((dex) => {
    if (dex.gameId === gameId) {
      counter.count++
    }
  })
  return counter.count
}

// export function getAvailableGameSets(userDexes: LoadedDexList): string[] {
//   const usedGameSets = new Set(getUsedGameSets(userDexes))
//   return getSupportedGameSetIds().filter(gameSetId => !usedGameSets.has(gameSetId))
// }

export function getAvailableGames(): string[] {
  return getSupportedGameIds().map((gameId) => gameId)
}

export function hasUsedGameSet(userDexes: LoadedDexList, gameSetId: string): boolean {
  return getUsedGameSets(userDexes).includes(gameSetId)
}

export function hasUsedGame(userDexes: LoadedDexList, gameId: string): boolean {
  return getUsedGames(userDexes).includes(gameId)
}
