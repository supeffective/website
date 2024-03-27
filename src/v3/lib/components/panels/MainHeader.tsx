import { useRouter } from 'next/compat/router'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import config from '@/v3/config'
import { UserTrayView } from '@/v3/features/users/views/UserTrayView'

import { isDevelopmentEnv } from '../../utils/env'
import { SiteLink } from '../Links'
import { DiscordLinkIcon, GithubLinkIcon, TwitterLinkIcon } from '../icons/brand-icons'
import styles from './MainHeader.module.css'

export default function MainHeader() {
  const router = useRouter()
  const pageSrc = router ? (Array.isArray(router.query.s) ? router.query.s[0] : router.query.s) : ''

  const [navbarOpen, setNavbarOpen] = useState(false)

  const handleToggle = () => {
    setNavbarOpen((prev) => !prev)
  }

  return (
    <>
      <div className={styles.header + (navbarOpen ? ' ' + styles.open : '')}>
        <div className={styles.headerTop}>
          <Link href="/" className={styles.headerLogo} tabIndex={0} title={config.texts.siteName}>
            <Image src="/images/logo/icon.svg" width="72" height="72" alt={config.texts.siteName} />
            <h1 className="sr-only">
              {config.texts.siteName}
              <small>.gg</small>
            </h1>
          </Link>

          <nav tabIndex={0} className={styles.menu + (navbarOpen ? ' ' + styles.open : '')}>
            <SiteLink activeClass={styles.active} href="/" tabIndex={1}>
              Home
            </SiteLink>
            {isDevelopmentEnv() && (
              <SiteLink activeClass={styles.active} tabIndex={1} href="/v4">
                v4
              </SiteLink>
            )}
            <SiteLink activeClass={styles.active} tabIndex={1} href="/apps/pokedex">
              <i className={'icon-books margin-r icon--2x'} />
              Pokédex Tracker
            </SiteLink>
            <SiteLink activeClass={styles.active} tabIndex={2} href="/apps/livingdex">
              <i className={'icon-pkg-box margin-r icon--2x'} /> Living Dex Tracker
            </SiteLink>
            <GithubLinkIcon className={styles.brandLink} tabIndex={4}>
              <span className="mobile-only">Github</span>
            </GithubLinkIcon>
            <DiscordLinkIcon className={styles.brandLink} tabIndex={4}>
              <span className="mobile-only">Discord</span>
            </DiscordLinkIcon>
            <TwitterLinkIcon className={styles.brandLink} tabIndex={3}>
              <span className="mobile-only">Twitter/X</span>
            </TwitterLinkIcon>
            <SiteLink
              className={styles.donateBtn}
              activeClass={styles.active}
              href="/donate"
              tabIndex={5}
              title={'Donate to help this site'}
            >
              <i className="icon-pkg-mark-heart" title="Donate" />
              <span className={'mobile-only'}>Support Us</span>
            </SiteLink>
            <UserTrayView activeClass={styles.active} returnUrl={pageSrc} />
          </nav>

          <span className={styles.menuToggle} onClick={handleToggle} role="button" title="Menu" tabIndex={6}>
            <Image src={'/images/menu-dots.png'} alt="..." fill={true} />
          </span>
        </div>
      </div>
      {navbarOpen && (
        <div
          className={styles.navbarOpenOverlay}
          onClick={() => {
            setNavbarOpen(false)
          }}
        />
      )}
    </>
  )
}
