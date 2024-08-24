import { findHighestPatreonTier } from '@/lib/patreon/findHighestPatreonTier'
import { PatreonTier, PatreonUserData } from '@/lib/patreon/types'
import { Membership } from '@/prisma/types'

import { patreonCampaign } from '@/config/patreon'
import { dbCacheService } from '@/lib/cache-service/db-cache-service'
import { getPatreonClient } from '@/lib/patreon/getPatreonClient'
import { getPrismaClient } from '../../../prisma/getPrismaClient'

type OauthData = {
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  scope: string | null
}

class PatreonAccessTokenExpiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PatreonAccessTokenExpiredError'
  }
}

export async function getActivePatreonMembershipByUserId(userId: string): Promise<Membership | null> {
  // TODO: PATREON_MEMBERSHIP
  // TODO cache API requests for 1-2h instead of saving memberships on DB, because pledges get cancelled and we dont sync them currently
  const membership = await getPatreonMembershipByUserId(userId)

  if (!membership || membership.patreonUserId || membership.patreonMemberId) {
    // If the membership is linked to a Patreon user, we cannot trust the data in the DB (it might be outdated)
    // It it is not linked, it means it is a custom membership and we can trust the data
    // If there is no membership, we need to fetch it from Patreon if the user has linked their account
    const membershipFromApi = await getPatreonMembershipViaOauth(userId)
    if (!membershipFromApi) {
      return null
    }

    if (!membership) {
      return membershipFromApi
    }

    // combine benefits:
    return {
      ...membershipFromApi,
      ...{
        rewardMaxDexes: Math.max(membership.rewardMaxDexes, membershipFromApi.rewardMaxDexes),
        rewardFeaturedStreamer: false, // FEATURE NOT IMPLEMENTED YET
      },
    }
  }

  if (membership.expiresAt && membership.expiresAt < new Date()) {
    // membership expired
    console.info(`SuperEffective Membership for user ${userId} has expired in DB.`)
    return null
  }

  return {
    ...membership,
    rewardFeaturedStreamer: false, // FEATURE NOT IMPLEMENTED YET
  }
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

  // if is expired, refresh token
  if (record.expires_at && record.expires_at < Date.now() / 1000) {
    if (!record.refresh_token) {
      console.error('fetchPatreonOAuthData: Refresh token is missing')
      return null
    }

    try {
      return await requestAndSaveRefreshedPatreonToken(record.id, record.refresh_token)
    } catch (error) {
      console.error(
        error,
        'requestAndSaveRefreshedPatreonToken: Failed to refresh access token. It might be revoked or long-time expired. Unlinking...',
      )
      await removePatreonMembership(userId, record.providerAccountId)
      return null
    }
  }

  return {
    accessToken: record.access_token,
    refreshToken: record.refresh_token,
    expiresAt: record.expires_at ? new Date(record.expires_at * 1000) : null,
    scope: record.scope,
  }
}

async function fetchPatreonIdentity(userId: string): Promise<PatreonUserData | null> {
  const oauthData = await fetchPatreonOAuthData(userId)

  if (!oauthData) {
    return null
  }

  if (oauthData.expiresAt && oauthData.expiresAt < new Date()) {
    throw new PatreonAccessTokenExpiredError('Patreon access token expired')
  }

  const profile = await getPatreonClient().fetchUser(oauthData.accessToken)

  console.info(`Patreon API called: Membership for user ${userId} fetched via OAuth.`)

  return profile
}

async function fetchPatreonIdAndTier(userId: string): Promise<[string, PatreonUserData, PatreonTier] | [null, null]> {
  const profile = await fetchPatreonIdentity(userId)

  if (!profile) {
    return [null, null]
  }

  return [profile.data.id, profile, findHighestPatreonTier(profile.campaignStatus.tierIds)]
}

async function getPatreonMembershipViaOauth(userId: string): Promise<Membership | null> {
  const expiresIn = 3600 * 2 // 2 hours
  const cacheKey = getCacheKey(userId)
  const cachedEntry = await dbCacheService.get<Membership>(cacheKey)

  if (!cachedEntry || cachedEntry.isStale) {
    const membership = await _uncached_getPatreonMembershipViaOauth(userId)

    if (membership) {
      console.info(`dbCacheService cache MISS: Patreon membership for user ${userId}. Storing.`)
      await dbCacheService.put(cacheKey, membership, expiresIn)
    }

    return membership
  }

  // console.info(`dbCacheService cache HIT: Patreon membership for user ${userId}.`)
  return cachedEntry.deserializedValue
}

async function _uncached_getPatreonMembershipViaOauth(userId: string): Promise<Membership | null> {
  try {
    const [patronId, patronData, highestEntitledTier] = await fetchPatreonIdAndTier(userId)

    if (!highestEntitledTier || !patronId) {
      return null
    }

    const memberCampaignData = patronData.campaignStatus.campaign?.attributes

    return {
      id: `API-${patreonCampaign.campaignId}_${userId}`,
      provider: 'patreon',
      userId,
      patreonUserId: patronId,
      patreonMemberId: patronData.campaignStatus.campaign?.id ?? null, // campaign.id is the member-id in this campaign
      patreonCampaignId: patreonCampaign.campaignId,
      patronStatus: memberCampaignData?.patron_status ?? null,
      currentTier: highestEntitledTier.tierId,
      highestTier: highestEntitledTier.tierId,
      totalContributed: memberCampaignData?.lifetime_support_cents ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: null,
      // Reward fields:
      overridenRewards: true,
      rewardMaxDexes: highestEntitledTier.perks.dexLimit,
      rewardFeaturedStreamer: false, // FEATURE NOT IMPLEMENTED YET
    } satisfies Membership
  } catch (error) {
    if (error instanceof PatreonAccessTokenExpiredError) {
      console.error(`CRITICAL ERROR: Patreon access token expired for user ${userId}. We need to handle this bug.`)
      return null
    }

    throw error
  }
}

async function requestAndSaveRefreshedPatreonToken(accountId: string, refreshToken: string): Promise<OauthData | null> {
  const client = getPrismaClient()

  const data = await getPatreonClient().refreshAccessToken(refreshToken)

  if (!data || !data.access_token) {
    throw new Error('getPatreonClient - refreshAccessToken call failed. Data is missing.')
  }

  const expires_at_seconds = data.expires_in ? Math.floor((Date.now() + data.expires_in * 1000) / 1000) : null

  const updatedAccount = await client.account.update({
    where: {
      id: accountId,
      provider: 'patreon',
      type: 'oauth',
    },
    data: {
      access_token: data.access_token,
      expires_at: expires_at_seconds,
    },
  })

  if (!updatedAccount || !updatedAccount.access_token) {
    console.error('requestAndSaveRefreshedPatreonToken: Failed to update account')
    return null
  }

  return {
    accessToken: updatedAccount.access_token,
    refreshToken: updatedAccount.refresh_token,
    expiresAt: updatedAccount.expires_at ? new Date(updatedAccount.expires_at * 1000) : null,
    scope: updatedAccount.scope,
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

// async function getPatreonMembershipByMemberId(patreonMemberId: string): Promise<Membership | null> {
//   const client = getPrismaClient()

//   const record = await client.membership.findFirst({
//     where: {
//       patreonMemberId,
//     },
//   })

//   return record || null
// }

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

// async function addPatreonMembership(
//   userId: string,
//   data: {
//     currentTier: string
//     patreonUserId: string
//     patreonMemberId: string
//     patronStatus: string
//     provider: string
//     totalContributed: number
//   },
// ): Promise<Membership | null> {
//   const client = getPrismaClient()
//   const tier = PATREON_TIERS_BY_ID[data.currentTier]
//   if (!tier) {
//     throw new Error(`Invalid tier ${data.currentTier}`)
//   }

//   const record = await client.membership.create({
//     data: {
//       ...data,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       currentTier: tier.tierId,
//       highestTier: tier.tierId,
//       rewardMaxDexes: tier.perks.dexLimit,
//       rewardFeaturedStreamer: false, //tier.perks.featuredStreamer,
//       patreonCampaignId: patreonCampaign.campaignId,
//       userId,
//     },
//   })

//   return record
// }

// async function updatePatreonMembership(
//   userId: string,
//   patreonMemberId: string,
//   data: {
//     currentTier: string
//     patronStatus: string
//     totalContributed: number
//   },
// ): Promise<number> {
//   const client = getPrismaClient()
//   const tier = PATREON_TIERS_BY_ID[data.currentTier]
//   if (!tier) {
//     throw new Error(`Invalid tier ${data.currentTier}`)
//   }

//   const record = await client.membership.updateMany({
//     where: {
//       userId,
//       patreonMemberId,
//     },
//     data: {
//       ...data,
//       updatedAt: new Date(),
//       currentTier: tier.tierId,
//       rewardMaxDexes: tier.perks.dexLimit,
//       rewardFeaturedStreamer: false, //tier.perks.featuredStreamer,
//     },
//   })

//   return record.count
// }

export async function removePatreonMembership(userId: string, patreonMemberId: string | null): Promise<number> {
  const client = getPrismaClient()

  const result = await client.membership.deleteMany({
    where: {
      userId,
      patreonMemberId,
      overridenRewards: false,
    },
  })

  const accountResult = await client.account.deleteMany({
    where: {
      userId,
      provider: 'patreon',
      type: 'oauth',
    },
  })

  await dbCacheService.remove(getCacheKey(userId))

  return result.count + accountResult.count
}

function getCacheKey(userId: string): string {
  return `patreon_membership:${userId}`
}
