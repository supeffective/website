import { useRouter } from 'next/compat/router'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import config from '@/config'
import { UserTrayView } from '@/features/users/views/UserTrayView'

import { HandHeartIcon, LightbulbIcon } from 'lucide-react'
import CannyFeedbackLinkV3 from '../CannyFeedbackLinkV3'
import { SiteLink } from '../Links'
import { DiscordLinkIcon, TwitterLinkIcon } from '../icons/brand-icons'
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
            <SiteLink activeClass={styles.active} tabIndex={1} href="/apps/pokedex">
              <i className={'icon-books margin-r icon--2x'} />
              Pokédex
            </SiteLink>
            <SiteLink activeClass={styles.active} tabIndex={2} href="/apps/livingdex">
              <i className={'icon-pkg-box margin-r icon--2x'} /> LivingDexes
            </SiteLink>
            <a title="PokéPC - SuperEffective's successor" tabIndex={2} href="https://pokepc.net/?ref=supereffective">
              <i style={{ color: 'cyan', marginRight: '4px' }} className={'icon-pkg-shiny icon--2x'} /> PokéPC{' '}
              <sup style={{ color: 'cyan', marginLeft: '4px' }}>NEW</sup>
            </a>
            <DiscordLinkIcon className={styles.brandLink} tabIndex={4}>
              <span className="mobile-only">Discord</span>
            </DiscordLinkIcon>
            <TwitterLinkIcon className={styles.brandLink} tabIndex={3}>
              <span className="mobile-only">Threads.net</span>
            </TwitterLinkIcon>
            <CannyFeedbackLinkV3>
              <i title="Roadmap and Feedback">
                <LightbulbIcon width={22} height={22} />
              </i>
              <span className="mobile-only">Feedback and Roadmap</span>
            </CannyFeedbackLinkV3>
            <SiteLink
              // className={styles.donateBtn}
              activeClass={styles.active}
              href="/donate"
              tabIndex={5}
              title={'Donate to help this site'}
            >
              <i title="Support Us / Donations">
                <HandHeartIcon width={22} height={22} />
              </i>
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
