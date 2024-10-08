import { Membership } from '@prisma/client'

export type PatronMembershipStatusData = {
  tierIds: string[]
  isActivePatron: boolean
  campaign: null | {
    id: string
    attributes: {
      type: 'pledge'
      amount_cents: number // =currently_entitled_amount_cents
      started_at: string // =pledge_relationship_start
      lifetime_support_cents: number // =campaign_lifetime_support_cents
      last_charge_status: string
      last_charge_date: string
      patron_status: string
      pledge_cadence: number
      declined_since?: string
    }
    [key: string]: any
  }
}
export type PatreonUserData = {
  data: {
    attributes: {
      email?: string | null
      first_name?: string | null
      full_name?: string | null
      is_email_verified?: boolean
      last_name?: string | null
      url: string
      image_url: string
      thumb_url: string
    }
    id: string
    relationships: any
    type: 'user'
  }
  links: any
  included: any[]
  campaignStatus: PatronMembershipStatusData
  campaigns: Record<string, any>
}

export type PatreonResolvedMembership = {
  response: PatreonUserData | null
  membership: Membership | null
}

/// From here on, all these are probably DEPRECATED For the new PatreonClient class:

export type PatreonCampaign = {
  campaignId: string
  creatorId: string
  tierIds: {
    none: '-1' // non-patrons
    free: `${number}` // former patrons
    basic: `${number}`
    advanced: `${number}`
  }
}

export type PatreonTier = {
  tierId: string
  rewardId: string
  name: string
  slug: string
  description: string
  tierWeight: number
  perks: {
    dexLimit: number
    boxLimit?: number
    allowedDexes?: string[] | undefined
  }
}

export type PatreonTierTable = {
  [tierId: string]: PatreonTier
}
