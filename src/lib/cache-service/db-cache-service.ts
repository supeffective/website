import { getPrismaClient } from '@/prisma/getPrismaClient'
import { FetchCache, PrismaClient } from '@prisma/client'

export type CacheEntry<T> = FetchCache & {
  isStale: boolean
  deserializedValue: T
}

export class DbCacheService {
  constructor(private db: PrismaClient) {}

  private async getRaw(key: string): Promise<CacheEntry<undefined> | null> {
    const cacheEntry = await this.db.fetchCache.findUnique({
      where: {
        key,
      },
    })

    if (!cacheEntry) {
      return null
    }

    return {
      ...cacheEntry,
      isStale: cacheEntry.expiresAt < new Date(),
      deserializedValue: undefined,
    }
  }

  public async get<T = any>(key: string): Promise<CacheEntry<T> | null> {
    const entry = await this.getRaw(key)
    if (!entry) {
      return null
    }

    return {
      ...entry,
      deserializedValue: JSON.parse(entry.value),
    }
  }

  private async putRaw(key: string, value: string, expirationSeconds: number): Promise<CacheEntry<undefined>> {
    const now = new Date()
    const entry = await this.db.fetchCache.upsert({
      where: {
        key,
      },
      create: {
        key,
        value,
        expiresAt: new Date(now.getTime() + expirationSeconds * 1000),
        createdAt: now,
        updatedAt: now,
      },
      update: {
        value,
        expiresAt: new Date(now.getTime() + expirationSeconds * 1000),
        updatedAt: now,
      },
    })

    return {
      ...entry,
      isStale: false,
      deserializedValue: undefined,
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  public async put(key: string, value: any, expirationSeconds: number): Promise<CacheEntry<undefined>> {
    return await this.putRaw(key, JSON.stringify(value), expirationSeconds)
  }

  public async expire(...keys: string[]): Promise<number> {
    const now = new Date()
    const result = await this.db.fetchCache.updateMany({
      where: {
        key: {
          in: keys,
        },
      },
      data: {
        expiresAt: now,
        updatedAt: now,
      },
    })

    return result.count
  }

  public async remove(...keys: string[]): Promise<number> {
    const result = await this.db.fetchCache.deleteMany({
      where: {
        key: {
          in: keys,
        },
      },
    })

    return result.count
  }
}

export const dbCacheService = new DbCacheService(getPrismaClient())
