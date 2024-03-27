import { User } from '@/v3/lib/prisma/types'

import { AuthStatus, AuthUserState } from '../types'
import { convertPrismaUserToAuthUser } from './convertPrismaUserToAuthUser'

export function convertPrismaUserToAuthUserState(prismaUser: User | null): AuthUserState {
  if (!prismaUser) {
    return {
      status: AuthStatus.Unauthenticated,
      currentUser: null,
      isAuthenticated: () => false,
      isUnauthenticated: () => true,
      isLoading: () => false,
      isVerified: () => false,
      isOperable: () => false,
    }
  }

  const user = convertPrismaUserToAuthUser(prismaUser)
  return {
    status: AuthStatus.Authenticated,
    currentUser: user,
    isAuthenticated: () => true,
    isUnauthenticated: () => false,
    isLoading: () => false,
    isVerified: () => user.emailVerified,
    isOperable: () => {
      return user !== null && !user.isDisabled && user.email !== null && user.emailVerified
    },
  }
}
