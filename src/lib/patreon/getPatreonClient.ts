import { envVars } from '@/config/env'
import { patreonCampaign } from '@/config/patreon'
import { PatreonClient } from './PatreonClient'

let _instance: PatreonClient | null = null
// TODO: PATREON_MEMBERSHIP

export function getPatreonClient(): PatreonClient {
  if (!_instance) {
    _instance = new PatreonClient(
      envVars.PATREON_APP_CLIENT_ID,
      envVars.PATREON_APP_CLIENT_SECRET,
      patreonCampaign.campaignId,
      patreonCampaign.creatorId,
    )
  }

  return _instance
}
