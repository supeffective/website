import React from 'react'

import { classNameIf, classNames } from '@/lib/utils/deprecated'

import { abs_url } from '../../../lib/components/Links'
import styles from './SocialLinks.module.css'

export interface SocialLinkProps {
  network: 'facebook' | 'twitter' | 'reddit'
  text: string | null
}

export interface SocialLinksProps {
  permalink: string
  showPermalinkBtn?: boolean
  className?: string
  children: () => (SocialLinkProps | string)[]

  [key: string]: any
}

export const SocialLinks = (props: SocialLinksProps) => {
  const [permalinkOpen, setPermalinkOpen] = React.useState(false)
  const { className, permalink, showPermalinkBtn, children, ...otherProps } = props

  const classes = classNames(styles.socialLinks, className)

  const shareUrl = encodeURIComponent(permalink)

  const onPermalinkClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    setPermalinkOpen(!permalinkOpen)
    e.preventDefault()
    return false
  }

  const buttons = children().map((item: SocialLinkProps | string, index) => {
    if (typeof item === 'string') {
      return (
        <span key={'item-' + index} className={styles.text}>
          {item}
        </span>
      )
    }
    const { network, text } = item
    const encodedText = encodeURIComponent(text || '')

    switch (network) {
      case 'facebook':
        return (
          <a
            key={network}
            className={styles.socialLink}
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title={'Facebook'}
          >
            <i className={'icon icon-brand-facebook'} />
          </a>
        )
      case 'twitter':
        return (
          <a
            key={network}
            className={styles.socialLink}
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            title={'Twitter'}
          >
            <i className={'icon icon-brand-twitter'} />
          </a>
        )
      case 'reddit':
        return (
          <a
            key={network}
            className={styles.socialLink}
            href={`https://www.reddit.com/submit?url=${shareUrl}&title=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            title={'Reddit'}
          >
            <i className={'icon icon-brand-reddit'} />
          </a>
        )
    }
  })

  if (showPermalinkBtn) {
    const permalinkCopyDiv = (
      <div className={styles.permalinkCopy}>
        <input
          className={styles.permalinkCopyInput}
          type="text"
          value={permalink}
          readOnly
          autoFocus={true}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
            e.currentTarget.select()
          }}
        />
        <span
          className={styles.permalinkCopyCloseBtn}
          onClick={() => {
            setPermalinkOpen(false)
          }}
        >
          Close
        </span>
      </div>
    )
    buttons.push(
      <span key="permalink">
        <a
          className={classNames(styles.socialLink, classNameIf(permalinkOpen, styles.permalinkOpen))}
          href={permalink}
          target="_blank"
          rel="noopener noreferrer"
          title={'Permalink'}
          onClick={onPermalinkClick}
        >
          <i className={'icon icon-link'} />
        </a>
        {permalinkOpen ? permalinkCopyDiv : null}
      </span>,
    )
  }

  return (
    <div className={classes} {...otherProps}>
      {buttons}
    </div>
  )
}

export const DexSocialLinks = ({
  dexId,
  shareAsOwner,
  ...props
}: {
  dexId: string
  shareAsOwner: boolean
  [key: string]: any
}) => {
  const dexLink = `/apps/livingdex/${dexId}`

  const ownerText =
    "Check out all Pokémon I have on my Living Dex, created with supereffective.gg 's" +
    ' Living Pokédex Organizer app. #LivingDex #PokedexTracker #Pokemon #PokemonHOME #PokemonScarletViolet'

  const nonOwnerText =
    "Check out this Living Dex, created with supereffective.gg 's" +
    ' Living Pokédex Organizer app. #LivingDex #PokedexTracker #Pokemon #PokemonHOME #PokemonScarletViolet'

  return (
    <SocialLinks showPermalinkBtn={true} permalink={abs_url(dexLink)} {...props}>
      {() => [
        'Share: ',
        {
          network: 'twitter',
          text: shareAsOwner ? ownerText + ' via @supereffectiv' : nonOwnerText,
        },
        {
          network: 'facebook',
          text: null,
        },
        {
          network: 'reddit',
          text: shareAsOwner ? ownerText : nonOwnerText,
        },
      ]}
    </SocialLinks>
  )
}
