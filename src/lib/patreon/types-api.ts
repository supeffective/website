// FILE NOT USED. KEPT FOR REFERENCE

type PatreonProfileResponse = {
  data: {
    attributes: DataAttributes
    id: string
    relationships: {
      pledges: ResourceDataCollection
    }
    type: string
  }
  links: {
    self: string
  }
  included: Array<{
    attributes: IncludedAttributes
    id: string
    relationships?: IncludedRelationships
    type: string
  }>
}

type DataAttributes = {
  about: null
  age_verification_status: null
  apple_id: null
  can_see_nsfw: null
  created: Date
  current_user_block_status: string
  default_country_code: null
  discord_id: null
  email: string
  facebook: null
  facebook_id: null
  first_name: string
  full_name: string
  gender: number
  google_id: null
  has_password: boolean
  image_url: string
  is_deleted: boolean
  is_email_verified: boolean
  is_nuked: boolean
  is_suspended: boolean
  last_name: string
  patron_currency: string
  social_connections: SocialConnections
  thumb_url: string
  twitch: null
  twitter: null
  url: string
  vanity: null
  youtube: null
}

type SocialConnections = { [key: string]: { url: string } | null }

type IncludedAttributes = {
  amount_cents?: number
  created_at?: Date | null
  currency?: string
  declined_since?: null
  patron_pays_fees?: boolean
  pledge_cap_cents?: number
  amount?: number
  declined_patron_count?: number
  description?: string
  discord_role_ids?: string[] | null
  edited_at?: Date
  image_url?: null | string
  is_free_tier?: boolean
  patron_amount_cents?: number
  patron_currency?: string
  post_count?: number
  published?: boolean
  published_at?: Date
  remaining?: number | null
  requires_shipping?: boolean
  title?: string
  unpublished_at?: null
  url?: null | string
  welcome_message?: null
  welcome_message_unsafe?: null
  welcome_video_embed?: null
  welcome_video_url?: null
  about?: null
  created?: Date
  current_user_block_status?: string
  facebook?: null
  first_name?: string
  full_name?: string
  gender?: number
  last_name?: string
  social_connections?: SocialConnections
  thumb_url?: string
  twitch?: null
  twitter?: null
  vanity?: string
  youtube?: null
  avatar_photo_image_urls?: {
    default: string
    default_small: string
    original: string
    thumbnail: string
    thumbnail_large: string
    thumbnail_small: string
  }
  avatar_photo_url?: string
  cover_photo_url?: string
  cover_photo_url_sizes?: {
    large: string
    medium: string
    small: string
    xlarge: string
    xsmall: string
  }
  creation_count?: number
  creation_name?: string
  discord_server_id?: string
  display_patron_goals?: boolean
  earnings_visibility?: string
  image_small_url?: string
  is_charge_upfront?: boolean
  is_charged_immediately?: boolean
  is_monthly?: boolean
  is_nsfw?: boolean
  is_plural?: boolean
  main_video_embed?: null
  main_video_url?: null
  name?: string
  one_liner?: null
  outstanding_payment_amount_cents?: number
  paid_member_count?: number
  patron_count?: number
  pay_per_name?: string
  pledge_sum_currency?: string
  pledge_url?: string
  summary?: string
  thanks_embed?: null
  thanks_msg?: string
  thanks_video_url?: null
  user_limit?: null
}

type IncludedRelationships = {
  address?: ResourceDataCollection
  creator?: ResourceData
  patron?: ResourceData
  reward?: ResourceData
  campaign?: ResourceData
  rewards?: ResourceDataCollection
}

type ResourceData = {
  data: {
    id: string
    type: string
  }
  links: {
    related: string
  }
}

type ResourceDataCollection = {
  data: Array<{
    id: string
    type: string
  }> | null
}
