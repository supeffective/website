import { getServerSession } from 'next-auth/next'

import { User } from '@/v3/lib/prisma/types'
import { isServerSide } from '@/v3/lib/utils/env'

import { convertPrismaUserToAuthUserState } from '../converters/convertPrismaUserToAuthUserState'
import { AuthUserState } from '../types'
import authOptions from './authOptions'

export async function getSession(req?: any, res?: any): Promise<AuthUserState | null> {
  if (!isServerSide()) {
    throw new Error('getSession() is not available on the client side.')
  }
  const session: any = await getServerSession(req, res, authOptions)

  if (!session) {
    return null
  }

  return convertPrismaUserToAuthUserState(session.user ? (session.user as User) : null)
}
