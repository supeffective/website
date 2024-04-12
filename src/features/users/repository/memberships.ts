import { PATREON_NO_TIER, PATREON_TIERS_BY_ID, patreonCampaign } from '@/config/patreon'
import { PatreonTier } from '@/lib/patreon/types'
import type { PatreonProfileResponse } from '@/lib/patreon/types-api'
import { fetchOauthPatreonIdentity, findHighestPatreonTier } from '@/lib/patreon/utils'
import { Membership } from '@/prisma/types'

import { getPrismaClient } from '../../../prisma/getPrismaClient'

type OauthData = {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  scope: string | null
}

async function fetchPatreonOAuthData(userId: string): Promise<OauthData | null> {
  const client = getPrismaClient()

  const record = await client.account.findFirst({
    where: {
      userId,
      provider: 'patreon',
      type: 'oauth',
    },
  })

  if (!record || !record.access_token) {
    return null
  }

  return {
    accessToken: record.access_token,
    refreshToken: record.refresh_token,
    expiresAt: record.expires_at ? new Date(record.expires_at * 1000) : null,
    scope: record.scope,
  }
}

export class PatreonAccessTokenExpiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PatreonAccessTokenExpiredError'
  }
}

async function fetchPatreonIdentity(userId: string): Promise<PatreonProfileResponse | null> {
  const oauthData = await fetchPatreonOAuthData(userId)

  if (!oauthData) {
    return null
  }

  if (oauthData.expiresAt && oauthData.expiresAt < new Date()) {
    throw new PatreonAccessTokenExpiredError('Patreon access token expired')
  }

  const profile = await fetchOauthPatreonIdentity(oauthData.accessToken)

  return profile
}

async function fetchPatreonIdAndTier(userId: string): Promise<[string, PatreonTier] | [null, null]> {
  const profile = await fetchPatreonIdentity(userId)

  if (!profile) {
    return [null, null]
  }

  return [profile.data.id, findHighestPatreonTier(profile)]
}

export async function getActivePatreonMembershipByUserId(userId: string): Promise<Membership | null> {
  const membership = await getPatreonMembershipByUserId(userId)

  if (!membership) {
    return getPatreonMembershipViaOauth(userId)
  }

  if (membership.expiresAt && membership.expiresAt < new Date()) {
    // membership expired
    return null
  }

  return membership
}

async function getPatreonMembershipViaOauth(userId: string): Promise<Membership | null> {
  try {
    const [patronId, tier] = await fetchPatreonIdAndTier(userId)

    if (!tier || !patronId) {
      return null
    }

    return {
      ...createMembershipPlaceholder(userId),
      patreonMemberId: patronId,
      currentTier: tier.tierId,
      highestTier: tier.tierId,
      overridenRewards: true,
      rewardMaxDexes: tier.perks.dexLimit,
      rewardFeaturedStreamer: false, //tier.perks.featuredStreamer,
    }
  } catch (error) {
    if (error instanceof PatreonAccessTokenExpiredError) {
      return null
    }

    throw error
  }
}

async function getPatreonMembershipByUserId(userId: string): Promise<Membership | null> {
  const client = getPrismaClient()

  const record = await client.membership.findFirst({
    where: {
      userId,
    },
  })

  return record || null
}

export async function getPatreonMembershipByMemberId(patreonMemberId: string): Promise<Membership | null> {
  const client = getPrismaClient()

  const record = await client.membership.findFirst({
    where: {
      patreonMemberId,
    },
  })

  return record || null
}

// export async function linkPatreonAccount(
//   userId: string,
//   accessToken: string,
//   creatorAccessToken: string
// ): Promise<Membership | undefined> {
//   const patron: any = undefined // await patreon.getIdentity(accessToken)

//   if (!patron) {
//     throw new Error('linkPatreonAccount: patreon.getIdentity call failed')
//   }

//   return
// }

export async function addPatreonMembership(
  userId: string,
  data: {
    currentTier: string
    patreonUserId: string
    patreonMemberId: string
    patronStatus: string
    provider: string
    totalContributed: number
  },
): Promise<Membership | null> {
  const client = getPrismaClient()
  const tier = PATREON_TIERS_BY_ID[data.currentTier]
  if (!tier) {
    throw new Error(`Invalid tier ${data.currentTier}`)
  }

  const record = await client.membership.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      currentTier: tier.tierId,
      highestTier: tier.tierId,
      rewardMaxDexes: tier.perks.dexLimit,
      rewardFeaturedStreamer: false, //tier.perks.featuredStreamer,
      patreonCampaignId: patreonCampaign.campaignId,
      userId,
    },
  })

  return record
}

export async function updatePatreonMembership(
  userId: string,
  patreonMemberId: string,
  data: {
    currentTier: string
    patronStatus: string
    totalContributed: number
  },
): Promise<number> {
  const client = getPrismaClient()
  const tier = PATREON_TIERS_BY_ID[data.currentTier]
  if (!tier) {
    throw new Error(`Invalid tier ${data.currentTier}`)
  }

  const record = await client.membership.updateMany({
    where: {
      userId,
      patreonMemberId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
      currentTier: tier.tierId,
      rewardMaxDexes: tier.perks.dexLimit,
      rewardFeaturedStreamer: false, //tier.perks.featuredStreamer,
    },
  })

  return record.count
}

export async function removePatreonMembership(userId: string, patreonMemberId: string | null): Promise<number> {
  const client = getPrismaClient()

  const result = await client.membership.deleteMany({
    where: {
      userId,
      patreonMemberId,
    },
  })

  const accountResult = await client.account.deleteMany({
    where: {
      userId,
      provider: 'patreon',
      type: 'oauth',
    },
  })

  return result.count + accountResult.count
}

export function createMembershipPlaceholder(userId: string): Membership {
  return {
    id: '-1',
    currentTier: PATREON_NO_TIER.tierId,
    highestTier: PATREON_NO_TIER.tierId,
    rewardMaxDexes: PATREON_NO_TIER.perks.dexLimit,
    rewardFeaturedStreamer: false, // PATREON_NO_TIER.perks.featuredStreamer,
    patreonMemberId: null,
    patreonCampaignId: patreonCampaign.campaignId,
    patreonUserId: null,
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
