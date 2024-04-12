import { ApiResponse, apiErrors } from '@/lib/utils/types'

import { AuthUser, AuthUserState } from '../types'

export function apiGuard(
  session: AuthUserState | null,
  resourceOwnerId?: string,
): ApiResponse & ({ allowed: false } | { allowed: true; user: AuthUser }) {
  if (!session || !session.currentUser || !session.isAuthenticated()) {
    return { ...apiErrors.notAuthenticated, allowed: false }
  }

  // is not verified or is not operable (disabled, etc)
  if (!session.isOperable() || !session.isVerified()) {
    return { ...apiErrors.notAuthorized, allowed: false }
  }

  // is not the owner of the resource
  if (resourceOwnerId !== undefined && resourceOwnerId !== session.currentUser.uid) {
    return { ...apiErrors.notAuthorized, allowed: false }
  }

  return {
    statusCode: 200,
    allowed: true,
    user: session.currentUser,
  }
}
