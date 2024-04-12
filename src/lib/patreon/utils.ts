import { patreonCampaign, patreonTiers } from '../../config/patreon'
import { PatreonTier } from './types'
import { PatreonProfileResponse } from './types-api'

export function findHighestPatreonTier(profile?: PatreonProfileResponse): PatreonTier {
  if (!profile) {
    return patreonTiers[patreonCampaign.tierIds.none]
  }

  const included = profile.included ?? []

  const tier: PatreonTier | undefined = included
    .filter((item) => {
      return (
        item.type === 'pledge' &&
        // item.relationships?.campaign?.data.id === patreonCampaign.campaignId &&
        item.relationships?.creator?.data.id === patreonCampaign.creatorId &&
        item.relationships?.reward?.data.id !== undefined &&
        patreonTiers[item.relationships.reward.data.id] !== undefined
      )
    })
    .map((item) => {
      const tierId = item.relationships?.reward?.data.id as string
      return patreonTiers[tierId]
    })
    .sort((a, b) => a.tierWeight - b.tierWeight) // get the highest tier
    .at(0)

  if (!tier) {
    return patreonTiers[patreonCampaign.tierIds.none]
  }

  return tier
}

export async function fetchOauthPatreonIdentity(access_token: string): Promise<PatreonProfileResponse> {
  // SEE https://docs.patreon.com/#fetching-a-patron-39-s-profile-info
  const url = 'https://www.patreon.com/api/oauth2/api/current_user'
  const headers = {
    Authorization: `Bearer ${access_token}`,
  }

  const urlObj = new URL(url)
  urlObj.searchParams.append('include', 'memberships,campaign')

  const response = await fetch(urlObj.toString(), { headers })

  if (!response.ok) {
    throw new Error(`Failed to fetch Patreon identity: ${response.statusText} (${response.status})`)
  }

  return response.json()
}
