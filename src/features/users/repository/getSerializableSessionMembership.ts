import { patreonPaidTierIds } from '@/config/patreon'
import { Membership } from '@prisma/client'
import { SessionMembership } from '../auth/types'

export function getSerializableSessionMembership(membership: Membership | null): SessionMembership | null {
  if (!membership) {
    return null
  }

  const { id, ...rest } = membership

  const sessionMembership: SessionMembership = {
    ...rest,
    isSubscriptionTier: patreonPaidTierIds.includes(membership.currentTier as string),
  }

  return JSON.parse(JSON.stringify(sessionMembership))
}

export function getSerializableSessionMembershipNotNull(membership: Membership): SessionMembership {
  const data = getSerializableSessionMembership(membership)

  if (!data) {
    throw new Error('getSerializableSessionMembershipNotNull: Membership is null')
  }

  return data
}
