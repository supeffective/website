import { User } from '@/prisma/types'

import { AuthStatus, AuthUserState } from '../types'
import { convertPrismaUserToAuthUser } from './convertPrismaUserToAuthUser'

export function convertPrismaUserToAuthUserState(prismaUser: User | null): AuthUserState {
  if (!prismaUser) {
    return {
      status: AuthStatus.Unauthenticated,
      membership: null,
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
    membership: null,
    isAuthenticated: () => true,
    isUnauthenticated: () => false,
    isLoading: () => false,
    isVerified: () => user.emailVerified,
    isOperable: () => {
      return user !== null && !user.isDisabled && user.email !== null && user.emailVerified
    },
  }
}
