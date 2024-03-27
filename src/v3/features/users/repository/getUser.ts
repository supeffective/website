import { User } from '@/v3/lib/prisma/types'

import { getPrismaClient } from '../../../lib/prisma/getPrismaClient'

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getPrismaClient()

  const user = await client.user.findFirst({
    where: {
      email,
    },
  })

  return user || null
}

export async function hasTooManyValidVerificationTokens(email: string, max: number): Promise<boolean> {
  const client = getPrismaClient()

  const tokensCount = await client.verificationToken.count({
    where: {
      identifier: email,
      expires: {
        gt: new Date(),
      },
    },
  })

  if (tokensCount > max) {
    console.warn(`User ${email} has too many valid verification tokens: ${tokensCount}`)
    return true
  }

  return false
}
