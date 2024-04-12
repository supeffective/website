import type { MetadataRoute } from 'next'

const faviconUrl = '/images/pwa/favicon-196.png'

const pwaConfig = {
  pwaName: 'SuperEffective',
  pwaShortName: 'SuperEffective',
  pwaTitle: 'SuperEffective',
  pwaDescription: 'The most complete Living Dex tracker. Your Pokémon game companion.',
  pwaBgColor: '#08101B',
}

/**
 * Web Manifest configuration
 */
const manifestConfig: MetadataRoute.Manifest = {
  id: 'gg.supereffective.app',
  name: pwaConfig.pwaName,
  short_name: pwaConfig.pwaShortName,
  description: pwaConfig.pwaDescription,
  theme_color: pwaConfig.pwaBgColor,
  background_color: pwaConfig.pwaBgColor,
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
      // @ts-ignore
      form_factor: 'narrow',
      label: 'A complete Pokédex and Livingdex Tracker',
    },
    {
      src: '/images/screenshots/v3-mobile-2.jpg',
      sizes: '1080x1920',
      type: 'image/jpg',
      // @ts-ignore
      form_factor: 'narrow',
      label: 'Supporting all main-series games',
    },
    {
      src: '/images/screenshots/v3-mobile-3.jpg',
      sizes: '1080x1920',
      type: 'image/jpg',
      // @ts-ignore
      form_factor: 'narrow',
      label: 'All the essential information you need in one place',
    },
    {
      src: '/images/screenshots/v3-desktop.jpg',
      sizes: '2560x1440',
      type: 'image/jpg',
      // @ts-ignore
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

// @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
export default function manifest(): MetadataRoute.Manifest {
  return manifestConfig
}
