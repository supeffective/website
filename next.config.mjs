import path from 'node:path'
import { withAxiom } from 'next-axiom'

if (!process.env.VERCEL && !process.env.VERCEL_URL) {
  process.env.VERCEL_URL = `localhost:${process.env.PORT || 3000}`
}

if (!process.env.VERCEL && !process.env.NEXTAUTH_URL) {
  const protocol = process.env.VERCEL_URL.includes('localhost') ? 'http://' : 'https://'
  process.env.NEXTAUTH_URL = protocol + process.env.VERCEL_URL
}

/** @type {import('next').NextConfig} */
const baseConfig = {
  sassOptions: {
    includePaths: [path.join(process.cwd(), 'src', 'styles')],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/news',
        destination: '/changelog?ref=news',
        permanent: true,
      },
      // Wildcard path matching
      {
        source: '/news/:slug',
        destination: '/changelog?ref=news-:slug',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'cdn.supeffective.com',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7 * 4, // 4 weeks
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      },
    )

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
}

const withPlugins = withAxiom(baseConfig)

export default withPlugins
