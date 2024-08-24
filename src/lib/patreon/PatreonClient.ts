import { PatreonUserData, PatronMembershipStatusData } from './types'

type CallLimitConfig = { limit: number; period: number }
type CallLimits = Record<string, CallLimitConfig>

// TODO: PATREON_MEMBERSHIP

/**
 * Code ported from official Patreon Wordpress plugin. PHP code last updated was 2022, repo itself in June 2024,
 * as of August 2024, so it is more or less up-to-date, more than the NPM package (5+ years old), which is incompatible
 * with the latest Patreon API (v2).
 *
 * @see https://github.com/Patreon/patreon-wordpress/blob/master/classes/patreon_api_v2.php
 */
export class PatreonClient {
  private lastCalls: Record<
    string,
    | {
        counterStart: number
        count: number
      }
    | undefined
  > = {}
  protected apiBase: string = 'https://www.patreon.com/api/oauth2/v2'

  constructor(
    public readonly clientId: string,
    public readonly clientSecret: string,
    public readonly campaignId: string,
    public readonly creatorId: string,
    // public readonly formerPatronTierId: string,
  ) {}

  public async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    scope: string
    token_type: 'Bearer'
  }> {
    const response = await fetch('https://www.patreon.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new PatreonThrottledCallError(
          'CRITICAL ERROR: Patreon API rate limited hit (refresh token): HTTP 429: Too Many Requests.',
        )
      }
      throw new PatreonClientRequestError('Failed to refresh token', response.status)
    }

    return response.json()
  }

  public async fetchUser(accessToken: string): Promise<PatreonUserData> {
    const requestUri =
      'identity?include=' +
      [
        'memberships.currently_entitled_tiers,memberships.campaign',
        'fields[user]=' +
          [
            'email',
            'first_name',
            'full_name',
            'image_url',
            'last_name',
            'thumb_url',
            'url',
            'vanity',
            'is_email_verified',
          ].join(','),

        'fields[member]=' +
          [
            'currently_entitled_amount_cents',
            'lifetime_support_cents',
            'campaign_lifetime_support_cents',
            'last_charge_status',
            'patron_status',
            'last_charge_date',
            'pledge_relationship_start',
            'pledge_cadence',
          ].join(','),
      ].join('&')

    const data = await this.fetchJsonThrottled(accessToken, requestUri)

    if (!data || typeof data !== 'object') {
      console.error('Invalid response payload: Included data is missing or empty.', data)
      throw new PatreonClientResponsePayloadError('Invalid response payload: Included data is missing or empty.')
    }

    const includedData = data.included || []

    const dataWithCampaignHash = {
      ...data,
      campaigns: {} as Record<string, any>,
    }

    // Iterate through included memberships and find the one that matches the campaign to put it to the top of the array
    for (let i = 0; i < includedData.length; i++) {
      const entry = includedData[i]

      if (entry.type === 'member' && entry.relationships?.campaign?.data?.id !== undefined) {
        // The below procedure will hash the campaign id to the entry, so that we can find it later easily

        const campaignId = entry.relationships.campaign.data.id

        // add additional data to the campaign, for easy access:
        entry.attributes.type = 'pledge'
        entry.attributes.amount_cents = entry.attributes.currently_entitled_amount_cents
        entry.attributes.started_at = entry.attributes.pledge_relationship_start // in WP is created_at
        entry.attributes.lifetime_support_cents = entry.attributes.campaign_lifetime_support_cents

        if (String(entry.attributes.last_charge_status).toLowerCase() !== 'paid') {
          entry.attributes.declined_since = entry.attributes.last_charge_date
        }

        dataWithCampaignHash.campaigns[campaignId] = entry
      }
    }

    return {
      ...dataWithCampaignHash,
      campaignStatus: this.getCampaignStatusForUser(dataWithCampaignHash),
    }
  }

  private getCampaignStatusForUser(userData: any): PatronMembershipStatusData {
    const statusData: PatronMembershipStatusData = {
      tierIds: [],
      isActivePatron: false,
      campaign: null,
    }

    const userCampaigns = userData.campaigns || {}
    const patronCampaignData = userCampaigns[this.campaignId]

    if (!patronCampaignData) {
      return statusData
    }

    statusData.campaign = patronCampaignData

    if (patronCampaignData.attributes.patron_status === 'active_patron') {
      statusData.isActivePatron = true
    }

    if (patronCampaignData.relationships?.currently_entitled_tiers?.data) {
      statusData.tierIds = patronCampaignData.relationships.currently_entitled_tiers.data.map((tier: any) => tier.id)
    }

    return statusData
  }

  async fetchCreatorInfo(accessToken: string): Promise<any> {
    // campaigns?include=creator&fields[campaign]=created_at,creation_name,discord_server_id,image_small_url,image_url,is_charged_immediately,is_monthly,is_nsfw,main_video_embed,main_video_url,one_liner,one_liner,patron_count,pay_per_name,pledge_url,published_at,summary,thanks_embed,thanks_msg,thanks_video_url,has_rss,has_sent_rss_notify,rss_feed_title,rss_artwork_url,patron_count,discord_server_id,google_analytics_id&fields[user]=about,created,email,first_name,full_name,image_url,last_name,social_connections,thumb_url,url,vanity,is_email_verified
    const requestUri =
      'campaigns?include=' +
      [
        'creator',
        'fields[campaign]=' +
          encodeURIComponent(
            [
              'created_at',
              'creation_name',
              'discord_server_id',
              'image_small_url',
              'image_url',
              'is_charged_immediately',
              'is_monthly',
              'is_nsfw',
              'main_video_embed',
              'main_video_url',
              'one_liner',
              'patron_count',
              'pay_per_name',
              'pledge_url',
              'published_at',
              'summary',
              'thanks_embed',
              'thanks_msg',
              'thanks_video_url',
              'has_rss',
              'has_sent_rss_notify',
              'rss_feed_title',
              'rss_artwork_url',
              'patron_count',
              'discord_server_id',
              'google_analytics_id',
            ].join(','),
          ),
        'fields[user]=' +
          encodeURIComponent(
            [
              'about',
              'created',
              'email',
              'first_name',
              'full_name',
              'image_url',
              'last_name',
              'social_connections',
              'thumb_url',
              'url',
              'vanity',
              'is_email_verified',
            ].join(','),
          ),
      ].join('&')

    return this.fetchJsonThrottled(accessToken, requestUri)
  }

  async fetchCampaignAndPatrons(accessToken: string): Promise<any> {
    const requestUri = 'campaigns'
    return this.fetchJsonThrottled(accessToken, requestUri)
  }

  async fetchCampaign(accessToken: string): Promise<any> {
    const requestUri = 'campaigns?include=' + encodeURIComponent('tiers,creator,goals')
    return this.fetchJsonThrottled(accessToken, requestUri)
  }

  async fetchTiers(accessToken: string): Promise<any> {
    // campaigns?include=tiers&fields[tier]=amount_cents,created_at,description,discord_role_ids,edited_at,image_url,patron_count,post_count,published,published_at,remaining,requires_shipping,title,unpublished_at,url,user_limit
    const requestUri =
      'campaigns?include=' +
      [
        'tiers',
        'fields[tier]=' +
          encodeURIComponent(
            [
              'amount_cents',
              'created_at',
              'description',
              'discord_role_ids',
              'edited_at',
              'image_url',
              'patron_count',
              'post_count',
              'published',
              'published_at',
              'remaining',
              'requires_shipping',
              'title',
              'unpublished_at',
              'url',
              'user_limit',
            ].join(','),
          ),
      ].join('&')

    const resp = await this.fetchJsonThrottled(accessToken, requestUri)

    if (!resp || !resp.included || !Array.isArray(resp.included) || resp.included.length === 0) {
      throw new PatreonClientResponsePayloadError('Invalid response payload: Included data is missing or empty.')
    }

    return {
      ...resp,
      included: [
        {
          attributes: {
            amount: 0,
            amount_cents: 0,
            created_at: null,
            title: 'Free Member',
            description: 'Free Member (Non-Patrons)',
            remaining: 0,
            requires_shipping: false,
            url: null,
            user_limit: null,
            published: true,
            published_at: new Date(),
          },
          id: -1,
          type: 'reward',
        },
        {
          attributes: {
            amount: 1,
            amount_cents: 1,
            created_at: null,
            title: 'Patrons Only',
            description: 'Patrons Only',
            remaining: 0,
            requires_shipping: false,
            url: null,
            user_limit: null,
            published: true,
            published_at: new Date(),
          },
          id: 0,
          type: 'reward',
        },
        ...resp.included,
      ],
    }

    // v2 doesnt seem to return the default tiers. We have to add them manually:
  }

  getPosts(accessToken: string, campaignId: string, pageSize = 1, cursor: string | null = null): Promise<any> {
    let requestUri = `campaigns/${campaignId}/posts?page%5Bcount%5D=${pageSize}`
    if (cursor) {
      requestUri += `&page%5Bcursor%5D=${encodeURIComponent(cursor)}`
    }
    return this.fetchJsonThrottled(accessToken, requestUri)
  }

  getPost(accessToken: string, postId: string): Promise<any> {
    const fields =
      'fields[post]=' +
      encodeURIComponent('title,content,is_paid,is_public,published_at,url,embed_data,embed_url,app_id,app_status')
    return this.fetchJsonThrottled(accessToken, `posts/${postId}?${fields}`)
  }

  getApiLimits(): CallLimits {
    const _30calls = 30
    const _12calls = 12
    const _5min = 5 * 60
    const _1min = 1 * 60

    return {
      campaigns: { limit: _30calls, period: _5min },
      'campaigns/:id': { limit: _30calls, period: _1min },
      'campaigns/:id/members': { limit: _30calls, period: _1min },
      'campaigns/:id/posts': { limit: _30calls, period: _1min },
      posts: { limit: _30calls, period: _1min },
      // webhooks: { limit: _12calls, period: _1min },
      // clients: { limit: _12calls, period: _1min },
    }
  }

  private async fetchJsonThrottled<T = any>(
    accessToken: string,
    path: string,
    method = 'GET',
    body?: BodyInit | null | undefined,
  ): Promise<T> {
    if (this.throttleCall(path)) {
      throw new PatreonThrottledCallError(`CRITICAL: Locally throttled call to Patreon API call: ${path}`)
    }

    const result = await this.fetchJson(accessToken, path, method, body)
    this.incrementCallCounter(path)

    return result
  }

  private getRouteName(requestUri: string) {
    const routeName = requestUri
      .replace(this.apiBase, '')
      .split('?')[0]
      .replace(/\/$/, '')
      .replace(/^\//, '')
      .replace(/\/\d+/, '/:id')

    // If the call is for webhooks/ or clients/, throttle it over the root endpoints:
    if (routeName.match(/^(webhooks|clients)\//)) {
      return routeName.split('/')[0]
    }

    return routeName
  }

  private throttleCall(requestPath: string) {
    const limits = this.getApiLimits()
    const routeName = this.getRouteName(requestPath)

    if (!limits[routeName]) {
      // Not in the least. Leave the throttling of this call to the api
      return false
    }

    // Get the time of the last matching call
    const lastCalled = this.lastCalls[routeName]

    if (lastCalled && lastCalled.counterStart >= Date.now() - limits[routeName].period * 1000) {
      // There is a counter that started in the last N minutes.

      if (lastCalled.count > limits[routeName].limit) {
        // Throttle the call
        return true
      }
    }

    // Either there is no counter, or the number of calls are within the limit. Don't throttle.

    return false
  }

  private incrementCallCounter(requestUri: string) {
    const limits = this.getApiLimits()
    const routeName = this.getRouteName(requestUri)

    if (!limits[routeName]) {
      // This call is not throttled. No need to increment the counter.
      return false
    }

    const lastCalled = this.lastCalls[routeName]

    if (lastCalled && lastCalled.counterStart >= Date.now() - this.getApiLimits()[routeName].period * 1000) {
      lastCalled.count++
    } else {
      this.lastCalls[routeName] = {
        counterStart: Date.now(),
        count: 1,
      }
    }

    return true
  }

  private async fetchJson<T = any>(
    accessToken: string,
    path: string,
    method = 'GET',
    body?: BodyInit | null | undefined,
  ): Promise<T> {
    const url = `${this.apiBase}/${encodeURI(path)}`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': `Patreon-JS, ported from Patreon-Wordpress, version 1.9.2, platform Node 20, PW-Campaign-Id: ${this.campaignId}`,
      },
      body,
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new PatreonThrottledCallError(
          `CRITICAL ERROR: Patreon API rate limited hit (${path}): HTTP 429: Too Many Requests.`,
        )
      }
      const message = `Failed to fetch ${path}: HTTP ${response.status}, ${response.statusText}`
      console.error(message, response.text())
      throw new PatreonClientRequestError(message, response.status)
    }

    return response.json()
  }
}

export class PatreonClientRequestError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
  ) {
    super(`Patreon API request failed: ${message}. HTTP Status: ${httpStatus}`)
  }
}

export class PatreonClientResponsePayloadError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class PatreonThrottledCallError extends Error {
  constructor(message: string) {
    super(message)
  }
}
