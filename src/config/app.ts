import { isDevelopmentEnv, isLocalAssetsEnabled } from '@/config/env'
import pkg from '../../package.json'

const ASSETS_CACHE_VERSION = '20240301-00'
const dataCdn = isLocalAssetsEnabled() ? 'http://localhost:4455/data' : 'https://cdn.supeffective.com/dataset'
const assetsCdn = isLocalAssetsEnabled() ? 'http://localhost:4455/assets' : 'https://cdn.supeffective.com/assets'

const appConfig = {
  version: pkg.version,
  siteName: 'SuperEffective',
  text: {
    pwaName: 'SuperEffective',
    pwaTitle: 'SuperEffective',
    pwaDescription: 'The most complete Living Dex tracker. Your Pokémon game companion.',
    mainWindowTitle: 'SuperEffective - Your Pokémon Gaming Companion',
    mainMetaDescription:
      'Supereffective is a new Pokémon website with news and various tools to assist you ' +
      'in your journey as a trainer. Follow us to stay up-to-date.',
  },
  links: {
    discord: 'https://discord.gg/3fRXQFtrkN',
    twitter: 'https://mobile.twitter.com/supereffectiv',
    paypal_donate: 'https://www.paypal.me/itsjavidotcom/10',
    patreon: 'https://www.patreon.com/supereffective',
    github_user: 'https://github.com/itsjavi',
    github_org: 'https://github.com/supeffective',
    github_repo: 'https://github.com/supeffective/supereffective.gg',
    github_issues: 'https://github.com/supeffective/supereffective.gg/issues',
    github_board: 'https://github.com/orgs/supeffective/projects',
  },
  assets: {
    cacheVersion: ASSETS_CACHE_VERSION,
    baseUrl: assetsCdn,
    dataUrl: dataCdn,
    dataCacheTtl: isDevelopmentEnv() ? 1000 * 30 : 1000 * 60 * 10, // 30s (dev) or 10min (prod)
    fontsUrl: `${assetsCdn}/fonts`,
    imagesUrl: `${assetsCdn}/images`,
  },
  // webhooks: {
  //   patreon: {
  //     oauthRedirectUrl: `${getBaseUrl()}/api/callbacks/patreon`,
  //     webhookCallbackUrl: `${getBaseUrl()}/api/webhooks/patreon`,
  //   },
  // },
}

export default appConfig
