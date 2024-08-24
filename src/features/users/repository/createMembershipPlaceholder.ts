import { PATREON_NO_TIER, patreonCampaign } from '@/config/patreon'
import { Membership } from '@prisma/client'
import { SessionMembership } from '../auth/types'
import { getSerializableSessionMembershipNotNull } from './getSerializableSessionMembership'

export function createMembershipPlaceholder(userId: string): Membership {
  return {
    id: '_PLACEHOLDER_',
    currentTier: PATREON_NO_TIER.tierId,
    highestTier: PATREON_NO_TIER.tierId,
    rewardMaxDexes: PATREON_NO_TIER.perks.dexLimit,
    rewardFeaturedStreamer: false, // PATREON_NO_TIER.perks.featuredStreamer,
    patreonUserId: null,
    patreonMemberId: null,
    patreonCampaignId: patreonCampaign.campaignId,
    patronStatus: null,
    provider: 'patreon',
    expiresAt: null,
    totalContributed: 0,
    overridenRewards: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId,
  }
}

export function createSessionMembershipPlaceholder(userId: string): SessionMembership {
  return getSerializableSessionMembershipNotNull(createMembershipPlaceholder(userId))
}
