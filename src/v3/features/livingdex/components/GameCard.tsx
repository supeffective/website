import Link from 'next/link'

import { GameLogo } from '@/v3/features/livingdex/components/GameLogo'
import { LoadedDex } from '@/v3/features/livingdex/repository/types'
import { getGameSetByGameId } from '@/v3/lib/data-client/game-sets'
import { classNameIf, classNames } from '@/v3/lib/utils/deprecated'

import styles from './GameCard.module.css'

export const GameCard = ({ dex, linkable }: { dex: LoadedDex; linkable: boolean }) => {
  const dexLink = `/apps/livingdex/${dex.id}`
  const gameSetId = getGameSetByGameId(dex.gameId).id
  const dateString = dex.updatedAt || dex.createdAt
  const timestamp = dateString ? Date.parse(dateString as unknown as string) : null
  const lastUpdated = timestamp ? new Date(timestamp) : null

  // console.log(dateString, lastUpdated)
  const content = (
    <div
      className={[
        styles.gameCard,
        `bg-gr-teal dex-game-card`,
        `dex-gameset-card-${gameSetId} dex-game-card-${dex.gameId}`,
      ].join(' ')}
    >
      <div className={styles.gameCardBody}>
        <div className={styles.gameCardImage}>
          <GameLogo game={dex.gameId} size={180} asSwitchIcon={true} />
        </div>
        <div className={classNames(styles.gameCardInfo, styles.gameCardStats)}>
          {dex.boxes.length > 2 && (
            <span>
              <i className="icon-pkg-box" /> {dex.boxes.length / 2}
            </span>
          )}
          <span>
            <i className="icon-pkg-pokeball-outlined" /> {dex.caughtRegular} / {dex.totalRegular}
          </span>
        </div>
        <div className={classNames(styles.gameCardInfo, styles.gameCardTitle)}>
          <div>{dex.title}</div>
        </div>

        {lastUpdated && (
          <div className={classNames(styles.gameCardInfo, styles.gameCardStatus)}>
            <time className={styles.gameCardTime}>
              Last updated:
              <br /> {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
            </time>
          </div>
        )}
      </div>
    </div>
  )
  return linkable
    ? <Link href={dexLink} className={styles.gameCardWrapper}>
        {content}
      </Link>
    : <span className={styles.gameCardWrapper}>{content}</span>
}

export const GameCardList = ({
  dexes,
  linkable,
  variant = 'list',
}: {
  dexes: Array<LoadedDex>
  linkable?: boolean
  variant?: 'grid' | 'list'
}) => {
  const variantClass = variant === 'grid' ? styles.gameCardGrid : styles.gameCardList

  return (
    <div
      className={classNames(
        variantClass,
        classNameIf(dexes.length === 1, styles.singleDex),
        classNameIf(linkable, styles.clickable),
      )}
    >
      {dexes.map((dex) => (
        <GameCard dex={dex} key={dex.id} linkable={linkable || false} />
      ))}
    </div>
  )
}
