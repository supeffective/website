import { patreonCampaign, patreonTiers } from '@/config/patreon'
import { PatreonTier } from './types'

export function findHighestPatreonTier(tierIds: string[]): PatreonTier {
  const tier: PatreonTier | undefined = tierIds
    .map((tierId) => {
      return patreonTiers[tierId]
    })
    .sort((a, b) => a.tierWeight - b.tierWeight) // get the highest tier
    .at(0)

  if (!tier) {
    return patreonTiers[patreonCampaign.tierIds.none]
  }

  return tier
}
