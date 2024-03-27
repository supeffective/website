import React from 'react'

// import { useRefreshOnVersionChange } from '@/v3/lib/hooks/useBuildVersion'

import MainFooter from '../panels/MainFooter'
import MainHeader from '../panels/MainHeader'
import { TemporaryAnnouncementBanners } from '../panels/announcements'
import styles from './PageSkeleton.module.css'

export default function PageSkeleton({ children }: { children: React.ReactNode }) {
  // const buildVersion = useRefreshOnVersionChange()

  return (
    <div
      // data-buildver={buildVersion}
      className={['page', styles.page, ' bg-blueberry-gradient-static', 'dex-tracker-ui'].join(' ')}
    >
      <MainHeader />
      <TemporaryAnnouncementBanners />
      <main className={['main', styles.main, ''].join(' ')}>{children}</main>
      <MainFooter />
    </div>
  )
}
