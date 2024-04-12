import { isDevelopmentEnv } from '@/lib/utils/env'
import { getBaseUrl } from '@/lib/utils/urls'

const ASSETS_CACHE_VERSION = '20230809-01'
const ASSETS_CACHE_VERSION_INCREMENTAL = '20230924-01'
// const dataCdn = isLocalAssetsEnabled() ? 'http://localhost:4455/data' : 'https://cdn.supeffective.com/dataset'
// const assetsCdn = isLocalAssetsEnabled() ? 'http://localhost:4455/assets' : 'https://cdn.supeffective.com/assets'
const assetsCdn = 'https://cdn.supeffective.com/assets'

const config = {
  dev: isDevelopmentEnv(),
  baseUrl: getBaseUrl(),
  version: {
    num: '3.10.0',
  },
  themeColor: '#1a1d1f',
  texts: {
    siteName: 'SuperEffective',
    standaloneTitle: 'SuperEffective',
    defaultMetaTitle: 'SuperEffective - Your Pokémon Gaming Companion',
    defaultMetaDescription:
      'Supereffective is a new Pokémon website with news and various tools to assist you ' +
      'in your journey as a trainer. Follow us to stay up-to-date.',
  },
  links: {
    twitter: 'https://mobile.twitter.com/supereffectiv',
    patreon: 'https://www.patreon.com/supereffective',
    github: 'https://github.com/itsjavi',
    github_org: 'https://github.com/supeffective',
    github_site: 'https://github.com/supeffective/website',
    issue_report: 'https://github.com/supeffective/website/issues',
    roadmap: 'https://supereffective.canny.io',
    feedback: 'https://supereffective.canny.io/feature-requests',
    changelog: 'https://supereffective.canny.io/changelog',
    discord: 'https://discord.gg/3fRXQFtrkN',
    paypal_donate: 'https://www.paypal.me/itsjavidotcom/10',
    legacy_account_recovery_form: 'https://forms.gle/HxnV3qCs1UWJn7Tc6',
  },
  patreon: {
    oauthRedirectUrl: `${getBaseUrl()}/api/callbacks/patreon`,
    webhookCallbackUrl: `${getBaseUrl()}/api/webhooks/patreon`,
  },
  cannyAppId: '66058d26d14939da879a83e8',
  cannyUrl: 'https://supereffective.canny.io',
  assets: {
    // version: ASSETS_CACHE_VERSION,
    getPokeImgVersion(nid: string): string {
      if (nid.includes('paldea') || nid.includes('bloodmoon')) {
        return ASSETS_CACHE_VERSION_INCREMENTAL
      }

      const dexNum = Number.parseInt(nid.split('-')[0].replace(/^0+/, ''))

      if (dexNum > 1010) {
        return ASSETS_CACHE_VERSION_INCREMENTAL
      }

      return ASSETS_CACHE_VERSION
    },
    imagesUrl: `${assetsCdn}/images`,
  },
  limits: {
    saveBtnDelay: 2500,
    maxDexes: isDevelopmentEnv() ? 4 : 20,
    maxPokemonPerBox: 30,
    maxBoxTitleSize: 15,
    maxDexTitleSize: 32,
  },
}

export default config
