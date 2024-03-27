import { useState } from 'react'

import styles from './AnnouncementBanner.module.css'

export default function AnnouncementBanner({
  startDate,
  endDate,
  children,
  dismissable,
}: {
  startDate: string
  endDate: string
  children: React.ReactNode
  dismissable?: boolean
}) {
  const isVisibleNow = Date.now() >= Date.parse(startDate) && Date.now() <= Date.parse(endDate)
  const [isDismissed, setIsDismissed] = useState(false)
  if (!isVisibleNow || isDismissed) {
    return null
  }

  const handleCloseBtn = () => {
    setIsDismissed(true)
  }
  const closeBtn = dismissable
    ? <button className={styles.closeBtn} onClick={handleCloseBtn}>
        <span className={styles.icon + ' icon-cross'} />
      </button>
    : null

  return (
    <div className={styles.root}>
      {children} {closeBtn}
    </div>
  )
}
