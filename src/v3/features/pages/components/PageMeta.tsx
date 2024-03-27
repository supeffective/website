import Head from 'next/head'

export type PageLang = 'en' | 'es' | 'it' | 'de' | 'fr' | 'jp' | 'ch' | 'cs' | 'ko'

export interface PageMetaProps {
  lang?: PageLang
  imageUrl?: string | null
  metaTitle: string
  metaDescription: string
  canonicalUrl: string
  robots?: string[] | string
  ogType?: 'article' | 'website' | 'profile' | 'product'
}

export const piped_title = (base: string, ...otherParts: Array<string>): string => {
  return otherParts.length > 0 ? base + ' - ' + otherParts.join(' - ') : base
}

export default function PageMeta({
  metaTitle,
  metaDescription,
  canonicalUrl,
  imageUrl = null,
  lang = 'en',
  robots = [],
  ogType = 'website',
}: PageMetaProps) {
  const truncatedTitle = (metaTitle || '').substring(0, 50)
  const truncatedDescription = (metaDescription || '').substring(0, 150)
  const _robots = Array.isArray(robots) ? robots : [robots ? robots : '']

  // if (!isProduction()) {
  //   _robots = ['noindex', 'nofollow']
  // }

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {/*/!* meta canonical url: *!/*/}
      <link rel="canonical" href={canonicalUrl} />

      {<meta name="robots" content={_robots.join(', ')} />}

      {/*/!* meta twitter card: *!/  */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@supereffectiv" />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/*/!* meta facebook open graph: *!/*/}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      {imageUrl && <meta name="og:image" content={imageUrl} />}
    </Head>
  )
}
