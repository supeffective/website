import { signIn, signOut } from 'next-auth/react'

import { User } from '@/prisma/types'

import { AuthApi, AuthStatus, AuthUser, NextSession } from '../types'
import { convertPrismaUserToAuthUser } from './convertPrismaUserToAuthUser'

export function convertNextSessionToAuthApi(nextSession: NextSession): AuthApi {
  const nextUser = _transformNextAuthUserObject(nextSession)
  const emailVerified = nextUser?.emailVerified || false

  return {
    currentUser: nextUser,
    isAuthenticated: () => nextUser !== null && nextSession.status === 'authenticated',
    isUnauthenticated: () => nextUser === null && nextSession.status === 'unauthenticated',
    status: nextSession.status as AuthStatus,
    signIn: async (email: string, redirect?: boolean, callbackUrl?: string) =>
      await signIn('email', {
        email,
        redirect,
        callbackUrl,
      }),
    signOut: async (redirect?: boolean, callbackUrl?: string) => signOut({ callbackUrl, redirect }),
    isLoading: () => nextSession.status === 'loading',
    isVerified: () => emailVerified,
    isOperable: () => {
      return nextUser !== null && !nextUser.isDisabled && nextUser.email !== null && emailVerified
    },
  }
}

function _transformNextAuthUserObject(nextSession: NextSession): AuthUser | null {
  if (!nextSession.data?.user) {
    return null
  }

  return convertPrismaUserToAuthUser(nextSession.data.user as User)
}
