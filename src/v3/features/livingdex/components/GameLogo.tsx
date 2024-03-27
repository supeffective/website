import Image from 'next/image'

import { getGameById } from '@/v3/lib/data-client/games'
import { cn } from '@/v3/lib/utils'

import styles from './GameLogo.module.css'

interface GameLogoProps {
  game: string
  size: number
  className?: string
  asSwitchIcon: boolean
  ext?: string

  [key: string]: any
}

export const GameLogo = ({
  game,
  size = 180,
  className,
  asSwitchIcon = false,
  ext = '.jpeg',
  ...props
}: GameLogoProps) => {
  const gameData = getGameById(game)
  const path = asSwitchIcon ? `tiles/${gameData.id}` : gameData.id
  return (
    <Image
      className={cn(styles.gameLogoImg, className)}
      width={size}
      height={size}
      src={'/images/games/' + path + ext}
      alt={gameData.name}
      {...props}
    />
  )
}
