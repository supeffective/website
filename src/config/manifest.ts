import type { MetadataRoute } from 'next'

type WebManifest = MetadataRoute.Manifest & {
  // @see https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots
  screenshots: Array<{
    src: string
    type?: string
    sizes?: string
    // platform?: 'android' | 'macos' | 'windows' | 'ios' | 'ipados | 'chromeos' | 'chrome_web_store' | 'itunes' // etc.
    form_factor?: 'narrow' | 'wide'
    label?: string
  }>
  edge_side_panel?: {
    // ms-edge
    preferred_width: number
  }
}

const faviconUrl = '/images/pwa/favicon-196.png'

/**
 * Web Manifest configuration
 */
const manifestConfig: WebManifest = {
  id: 'gg.supereffective.app',
  name: 'SuperEffective',
  short_name: 'SuperEffective',
  description: 'The most complete Living Dex tracker. Your Pokémon game companion.',
  theme_color: '#08101B',
  background_color: '#08101B',
  start_url: './',
  lang: 'en-US',
  orientation: 'portrait',
  display: 'standalone',
  display_override: ['window-controls-overlay'],
  edge_side_panel: {
    preferred_width: 496,
  },
  // @see https://www.w3.org/TR/manifest-app-info/#categories-member
  categories: ['entertainment', 'games', 'utilities'],
  icons: [
    {
      src: '/images/pwa/manifest-icon-192.maskable.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/images/pwa/manifest-icon-192.maskable.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    },
    {
      src: '/images/pwa/manifest-icon-512.maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/images/pwa/manifest-icon-512.maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
  /*
  By default, screenshots created with https://progressier.com/pwa-screenshots-generator
  are 1080x1920 pixels in .jpg format. 
  
  The official specs don't require a specific size. The width and height of your screenshots 
  must be at least 370px and at most 3840px. The maximum dimension can't be more than 
  2.3 times as long as the minimum dimension. So screenshots can be landscape, square or portrait. 
  However, every screenshot in a set must have the same aspect ratio. Only JPG and PNG image 
  formats are supported.
  */
  screenshots: [
    {
      src: '/images/screenshots/v3-mobile-1.jpg',
      sizes: '1080x1920',
      type: 'image/jpg',
      form_factor: 'narrow',
      label: 'A complete Pokédex and Livingdex Tracker',
    },
    {
      src: '/images/screenshots/v3-mobile-2.jpg',
      sizes: '1080x1920',
      type: 'image/jpg',
      form_factor: 'narrow',
      label: 'Supporting all main-series games',
    },
    {
      src: '/images/screenshots/v3-mobile-3.jpg',
      sizes: '1080x1920',
      type: 'image/jpg',
      form_factor: 'narrow',
      label: 'All the essential information you need in one place',
    },
    {
      src: '/images/screenshots/v3-desktop.jpg',
      sizes: '2560x1440',
      type: 'image/jpg',
      form_factor: 'wide',
      label: 'SuperEffective, The complete Pokédex and Livingdex Tracker',
    },
  ],
  shortcuts: [
    {
      name: 'LivingDex',
      short_name: 'LivingDex',
      description: 'Living Dexes page',
      url: '/apps/livingdex',
      icons: [
        {
          src: faviconUrl,
          sizes: '196x196',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Pokédex',
      short_name: 'Pokédex',
      description: 'Pokédex page',
      url: '/apps/pokedex',
      icons: [
        {
          src: faviconUrl,
          sizes: '196x196',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Missing Pokémon',
      short_name: 'Missing',
      description: 'Missing Pokémon page',
      url: '/apps/livingdex/missing',
      icons: [
        {
          src: faviconUrl,
          sizes: '196x196',
          type: 'image/png',
        },
      ],
    },
  ],
}

export default manifestConfig
