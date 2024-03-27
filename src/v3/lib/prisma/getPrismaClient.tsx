import { Prisma, PrismaClient } from '@prisma/client'

import createMemoizedCallback from '@/v3/lib/utils/caching/createMemoizedCallback'
import { isDevelopmentEnv } from '@/v3/lib/utils/env'

// based on https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const detectServerSide = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Prisma is not available on the client side.')
  }
}

export const getPrismaClient = createMemoizedCallback((): PrismaClient => {
  detectServerSide()

  const logLevels: Prisma.LogLevel[] = isDevelopmentEnv() ? ['warn', 'error'] : ['warn', 'error']

  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: logLevels,
    })

  if (process.env['NODE_ENV'] !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
})

export { Prisma as PrismaTypes }
