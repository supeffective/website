import Image from 'next/image'
import Link from 'next/link'

import { legacyCanCreateMoreDexes } from '@/features/livingdex/repository'
import { ButtonInternalLink } from '@/lib/components/Button'
import { useScrollToLocation } from '@/lib/hooks/useScrollToLocation'

import styles from './WelcomeContent.module.css'

function StartLivingDexButton({
  text = 'Start a new Living Pokédex',
  onClick,
}: {
  text: string
  onClick?: () => void
}) {
  return (
    <div className={'text-center'}>
      <br />
      <ButtonInternalLink href={'/apps/livingdex/new'} onClick={onClick} rel="nofollow" style={{ fontSize: '1rem' }}>
        <i className={'icon-pkg-box-home'} /> {text}
      </ButtonInternalLink>
    </div>
  )
}

export const WelcomeContent = ({ showDescription }: { showDescription?: boolean }) => {
  useScrollToLocation()

  const canAddMoreDexes = legacyCanCreateMoreDexes()

  return (
    <>
      <div className={styles.topRightCallout + ' top-right-callout'}>
        <Link href={'/apps/livingdex/national'} className={styles.calloutBtn}>
          National Dex Guide
        </Link>
      </div>
      {showDescription && (
        <div className={'bordered-container inner-container inner-blueberry'}>
          <article className={'inner-container-hero'}>
            <h2>
              <i className={'icon-pkg-box-home'} /> Living Pokédex Tracker
            </h2>
            <div className="inner-blueberry inner-container text-center">
              <Image src={'/images/pokedex.png'} width={246} height={203} alt="pokedex" />
            </div>
            Track your Living Pokédex for any game and share your progress in your social media with{' '}
            <b>Supereffective's Dex Tracker</b>. You will be able to track your progress for all <b>main series</b>{' '}
            games as well as for <b>Pokémon GO</b> and <b>Pokémon HOME</b>.
            <br />
            <br />A visual guide will also help you organize your Pokémon Boxes in an effective and understandable way.
            If you are looking for a way to quickly check which Pokémon you are missing and for which games, this is
            your website.
            {canAddMoreDexes && <StartLivingDexButton text={'Start a new Living Pokédex'} />}
            <br />
            <p>
              If you only need a visual reference for all storable Pokémon available for Pokémon HOME, you can use our{' '}
              <Link href={'/apps/livingdex/national'}>Full National Living Pokédex for Guests</Link>, which doesn't
              require any account or login.
            </p>
          </article>
        </div>
      )}
    </>
  )
}
