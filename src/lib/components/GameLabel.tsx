import { pokemonGamesMap } from '@supeffective/dataset'

import { cn } from '@/lib/utils'
import type { PropsOf, Size } from '@/lib/utils/types'

import styles from './GameLabel.module.css'

export type GameLabelProps = {
  gameId: string
  size?: Size
  rounded?: boolean
} & PropsOf<'span'>

function gameLabelRecipe({ gameId, size }: GameLabelProps) {
  return ''
}

export function GameLabel(props: GameLabelProps) {
  const { gameId: recordId, size = 'sm', rounded, className, ...rest } = props
  const record = pokemonGamesMap.get(recordId)
  if (!record) {
    throw new Error(`No type with id ${recordId}`)
  }

  return (
    <span
      title={record.name}
      data-game={record.id}
      className={cn(styles.label, styles[`label-${size}`], rounded && styles.rounded, 'gameset-label', className)}
      {...rest}
    >
      {record.id}
    </span>
  )
}
