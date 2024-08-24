import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { ButtonLink } from '@/lib/components/Button'
import { abs_url } from '@/lib/components/Links'
import { classNameIf, classNames } from '@/lib/utils/deprecated'

import PageMeta, { PageMetaProps } from '../components/PageMeta'
import styles from './ArticleEntry.module.css'

export interface CmsImage {
  url: string
  alt: string
  width?: number | string
  height?: number | string
}

export interface ArticleEntryProps {
  id?: string
  title?: string
  children?: React.ReactNode // content
  relativeUrl: string
  canonicalUrl: string
  bannerImageUrl?: string
  publishDate?: string
  category?: string
  tags?: string[]
  isExcerpt?: boolean
  enableComments?: boolean
  enableSharing?: boolean
  videoUrl?: string | null
}

const containerClass = (...classes: string[]) => [styles.container, ...classes].join(' ')

export function ArticleEntry(props: ArticleEntryProps) {
  const shareText = encodeURIComponent(props.title + ' ( via @supereffectiv )')
  const shareUrl = encodeURIComponent(props.canonicalUrl)
  // const dateFmtOpts: any = {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // }
  //const dateFmt = new Intl.DateTimeFormat("en-US", dateFmtOpts)
  const articleClass = [
    styles.article,
    'bordered-container',
    props.isExcerpt ? styles.listEntry : styles.fullEntry,
  ].join(' ')

  const bannerImageImg = props.bannerImageUrl ? (
    <Image
      priority
      src={props.bannerImageUrl}
      // width={parseInt(String(props.bannerImage.width))}
      // height={parseInt(String(props.bannerImage.height))}
      alt={props.bannerImageUrl.split('/').pop() || ''}
      fill
      style={{ objectFit: 'cover' }}
    />
  ) : null

  const bannerImage = props.bannerImageUrl ? (
    <figure>{props.isExcerpt ? <a href={props.relativeUrl}>{bannerImageImg}</a> : bannerImageImg}</figure>
  ) : null

  const utcDate = props.publishDate ? new Date(props.publishDate).toUTCString() : '---'

  const publishDate = props.publishDate ? (
    <div className={containerClass(styles.publishDate)}>
      <time dateTime={utcDate}>
        <i className={styles.icon + ' icon-calendar'}></i>
        {utcDate.substring(0, utcDate.length - 13)}
      </time>
      , by{' '}
      <Link href="/about" className={styles.headerLogo}>
        @javikolog
      </Link>
    </div>
  ) : null

  const categoryPill = (
    <section className={containerClass(styles.pills)}>
      {props.category && <small className={styles.category}>{props.category}</small>}
      {/* {!props.category && <br />} */}
    </section>
  )

  const tagPills = props.tags ? (
    <section className={containerClass(styles.pills)}>
      {props.tags.length > 0 &&
        props.tags.map((tag) => (
          <span className={styles.tag} key={tag}>
            {tag}
          </span>
        ))}
    </section>
  ) : null

  const videoIframe = props.videoUrl ? (
    <div className={containerClass(styles.videoContainer)}>
      <iframe
        width="560"
        height="315"
        src={props.videoUrl + '?color=white&origin=' + abs_url('/')}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox={['allow-forms', 'allow-same-origin', 'allow-scripts', 'allow-presentation'].join(' ')}
      ></iframe>
    </div>
  ) : null

  const contentContainer = (
    <section className={containerClass(styles.content)}>
      {videoIframe}
      <div className={styles.contentWrapper}>{props.children}</div>
    </section>
  )

  if (props.isExcerpt) {
    return (
      <article className={articleClass}>
        {bannerImage}
        {categoryPill}
        <div className={containerClass(styles.title)}>
          <h2>
            <a href={props.relativeUrl}>{props.title}</a>
          </h2>
        </div>
        {publishDate}
        {contentContainer}
        <footer className={containerClass(styles.readMore, 'text-right')}>
          <ButtonLink href={props.relativeUrl}>Read more</ButtonLink>
        </footer>
      </article>
    )
  }

  const socialLinks = (
    <div className={containerClass(styles.socialLinks)}>
      <span>Share on: </span>
      <a
        className={styles.socialLink}
        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title={'Twitter'}
      >
        <i className={'icon icon-brand-twitter'} />
      </a>
      <a
        className={styles.socialLink}
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title={'Facebook'}
      >
        <i className={'icon icon-brand-facebook'} />
      </a>
      <a
        className={styles.socialLink}
        href={`https://www.reddit.com/submit?url=${shareUrl}&title=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        title={'Reddit'}
      >
        <i className={'icon icon-brand-reddit'} />
      </a>
    </div>
  )

  return (
    <article className={classNames(articleClass, classNameIf(!bannerImage, styles.withoutBanner))}>
      {bannerImage}
      {categoryPill}
      <div className={containerClass(styles.title)}>
        <h2>{props.title}</h2>
      </div>
      {props.publishDate && publishDate}

      {props.enableSharing && socialLinks}
      <hr style={{ margin: '2rem 0 1rem 0' }} />

      {contentContainer}

      {props.tags && tagPills}

      {!props.enableComments && <br />}
    </article>
  )
}

export interface ArticlePageProps extends ArticleEntryProps, React.HTMLAttributes<HTMLDivElement> {
  meta: PageMetaProps
}

export function ArticlePage(props: ArticlePageProps) {
  const { meta, ...articleProps } = props
  const isoDate = props.publishDate ? new Date(props.publishDate).toISOString() : null
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.canonicalUrl,
    },
    url: props.canonicalUrl,
    headline: props.title?.replace(/"/g, '\\"'),
    image: [meta.imageUrl?.replace(/"/g, '\\"')],
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Person',
      name: 'Javi Aguilar',
      url: 'https://supereffective.gg/about',
      contactPoint: {
        '@type': 'ContactPoint',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'supereffective.gg',
      logo: {
        '@type': 'ImageObject',
        url: 'https://supereffective.gg/images/logo/logo.png',
      },
      contactPoint: {
        '@type': 'ContactPoint',
      },
    },
  }
  const jsonLdArticleStr = JSON.stringify(jsonLdArticle, null, 0)

  const pageMeta = (
    <>
      <PageMeta {...meta} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdArticleStr }} />
    </>
  )
  return (
    <div className={'page-container ' + (props.className ? props.className : '')}>
      {props.isExcerpt !== true && pageMeta}
      <ArticleEntry {...articleProps} />
    </div>
  )
}
