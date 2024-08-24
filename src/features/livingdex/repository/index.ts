import { PATREON_NO_TIER } from '@/config/patreon'
import { dexToLoadedDex, loadedDexToDex, sanitizeDate } from '@/features/livingdex/parser/support'
import createMemoizedCallback from '@/lib/utils/caching/createMemoizedCallback'
import { PrismaTypes, getPrismaClient } from '@/prisma/getPrismaClient'

import { SessionMembership } from '@/features/users/auth/types'
import { isShinyLocked } from '../../../lib/data-client/pokemon'
import {
  DexPokemon,
  LivingDexRepository,
  LivingDexResolvedUserLimits,
  LivingDexUserLimits,
  LoadedDex,
  LoadedDexList,
} from './types'

const DEFAULT_DEX_LIST_LIMIT = 50

export const isCatchable = (pokemon: DexPokemon): boolean => {
  return !(pokemon.shiny && isShinyLocked(pokemon.pid))
}

export function legacyCanCreateMoreDexes(): boolean {
  return true
}

export function recalculateCounters(dex: LoadedDex): LoadedDex {
  const counters = dex.boxes.reduce(
    (accumulator, box) => {
      return box.pokemon.reduce((acc, pokemon) => {
        if (!pokemon) {
          return accumulator
        }
        if (pokemon.shiny && !pokemon.shinyLocked) {
          accumulator.totalShiny++
          if (pokemon.caught) {
            accumulator.caughtShiny++
          }
          return accumulator
        }

        if (!pokemon.shiny) {
          accumulator.totalRegular++
          if (pokemon.caught) {
            accumulator.caughtRegular++
          }
        }
        return accumulator
      }, accumulator)
    },
    {
      caughtRegular: 0,
      totalRegular: 0,
      caughtShiny: 0,
      totalShiny: 0,
    },
  )

  return {
    ...dex,
    ...counters,
  }
}

export const getLegacyLivingDexRepository = createMemoizedCallback((): LivingDexRepository => {
  const collectionName = 'dexes'
  const prismaDb = getPrismaClient().livingDex

  const getById = async (id: string) => {
    return prismaDb
      .findFirst({ where: { id } })
      .catch((error) => {
        console.error('Error getting dex', error)
        throw error
      })
      .then((dex) => {
        if (!dex) {
          return null
        }
        if (typeof dex.data !== 'string') {
          throw new Error(`Invalid dex data for dex ${id}`)
        }

        return dexToLoadedDex(dex)
      })
  }

  const repoApi: LivingDexRepository = {
    getById,
    getLimitsForUser: async (membership: SessionMembership | null): Promise<LivingDexUserLimits> => {
      if (membership) {
        return {
          maxDexes: membership.rewardMaxDexes,
        }
      }

      return {
        maxDexes: PATREON_NO_TIER.perks.dexLimit,
      }
    },
    getResolvedLimitsForUser: async (
      userId: string,
      membership: SessionMembership | null,
    ): Promise<LivingDexResolvedUserLimits> => {
      const dexes = await repoApi.getManyByUser(userId)
      const limits = await repoApi.getLimitsForUser(membership)
      return repoApi.calculateResolvedLimits(dexes, limits)
    },
    calculateResolvedLimits: (dexes: LoadedDexList, limits: LivingDexUserLimits) => {
      return {
        ...limits,
        remainingDexes: limits.maxDexes - dexes.length,
      }
    },
    getManyByUser: async (userUid: string) => {
      return prismaDb
        .findMany({
          where: { userId: userUid },
          orderBy: {
            lastUpdateTime: 'desc',
          },
          take: DEFAULT_DEX_LIST_LIMIT,
        })
        .catch((error) => {
          console.error('Error getting many dexes', error)
          throw error
        })
        .then((dexes) => dexes.map((dex) => dexToLoadedDex(dex)))
    },
    import: async (dexes: LoadedDex[], userId: string) => {
      const createManyArgs: {
        data: Array<PrismaTypes.LivingDexCreateManyInput>
      } = {
        data: [],
      }
      for (const dex of dexes) {
        dex.userId = userId

        if (!dex.id) {
          throw new Error('Cannot import a dex that has no ID')
        }

        const existingDex = await getById(dex.id)

        if (existingDex) {
          throw new Error(`Dex ${dex.id} already exists`)
        }

        const dexToSave = loadedDexToDex(userId, dex)

        createManyArgs.data.push({
          id: dex.id,
          specVer: dexToSave.specVer,
          userId,
          data: dexToSave.data,
          gameId: dexToSave.gameId,
          title: dexToSave.title,
          creationTime: sanitizeDate(dexToSave.creationTime),
          lastUpdateTime: sanitizeDate(dexToSave.lastUpdateTime),
        })
      }

      return prismaDb.createMany(createManyArgs).then((result) => result.count)
    },
    save: async (dex: LoadedDex, userId: string) => {
      dex.updatedAt = new Date()
      dex.userId = userId

      const dexToSave = loadedDexToDex(userId, dex)

      if (!dex.id) {
        return prismaDb
          .create({
            data: {
              specVer: dexToSave.specVer,
              userId,
              data: dexToSave.data,
              gameId: dexToSave.gameId,
              title: dexToSave.title,
              creationTime: new Date(),
              lastUpdateTime: sanitizeDate(dexToSave.lastUpdateTime),
            },
          })
          .then((result) => ({ ...dex, id: result.id }))
      }

      return prismaDb
        .update({
          where: { id: dex.id as string },
          data: {
            title: dexToSave.title,
            specVer: dexToSave.specVer,
            data: dexToSave.data,
            lastUpdateTime: sanitizeDate(dexToSave.lastUpdateTime),
            userId,
          },
        })
        .catch((error) => {
          console.error('Error saving dex', error)
          throw error
        })
        .then((result) => ({ ...dex, id: result.id }))
    },
    remove: async (id: string) => {
      return prismaDb
        .delete({ where: { id } })
        .catch((error) => {
          console.error('Error removing dex', error)
          throw error
        })
        .then(/* void */)
    },
  }

  return repoApi
})
