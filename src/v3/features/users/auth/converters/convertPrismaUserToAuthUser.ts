import { User } from '@/v3/lib/prisma/types'

import { AuthUser } from '../types'

export function convertPrismaUserToAuthUser(user: User): AuthUser {
  return {
    uid: user.id,
    emailVerified: !!user.emailVerified,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.image,
    providerId: 'email',
    userName: user.userName,
    isDisabled: user.isDisabled || false,
  }
}
