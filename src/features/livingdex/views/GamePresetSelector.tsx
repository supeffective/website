import React from 'react'

import { GameLogo } from '@/features/livingdex/components/GameLogo'
import { getAvailableGames } from '@/features/livingdex/repository/gameAvailability'
import { getPresetsForGame } from '@/features/livingdex/repository/presets'
import { PresetDex } from '@/features/livingdex/repository/presets/types'
import { LivingDexResolvedUserLimits } from '@/features/livingdex/repository/types'
import { useDexesContext } from '@/features/livingdex/state/LivingDexListContext'
import { useSession } from '@/features/users/auth/hooks/useSession'
import { ButtonInternalLink } from '@/lib/components/Button'
import { LoadingBanner } from '@/lib/components/panels/LoadingBanner'
import { UnauthenticatedBanner } from '@/lib/components/panels/UnauthenticatedBanner'
import { getGameById } from '@/lib/data-client/games'
import { useScrollToLocation } from '@/lib/hooks/useScrollToLocation'
import { classNameIf, classNames } from '@/lib/utils/deprecated'

import styles from './GamePresetSelector.module.css'

export const GamePresetSelector = ({ resolvedLimits }: { resolvedLimits: LivingDexResolvedUserLimits }) => {
  const auth = useSession()
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null)
  const { dexes, dexesLoading } = useDexesContext()

  useScrollToLocation()

  if (auth.isLoading()) {
    return <LoadingBanner />
  }

  if (!auth.isAuthenticated()) {
    return <UnauthenticatedBanner />
  }

  if (dexesLoading || dexes === null) {
    return <LoadingBanner />
  }

  const availableGamesDesc = [...getAvailableGames()].reverse()

  const gameSelectors = (
    <div className={styles.games}>
      {availableGamesDesc.map((gameId: string, index) => {
        const game = getGameById(gameId)
        const gameClasses = classNames(styles.gameLogo, classNameIf(game.id === selectedGame, styles.selected))
        return (
          <div
            key={index}
            title={'Pokémon ' + game.name}
            className={gameClasses}
            onClick={() => {
              window.location.hash = `#presets`
              setSelectedGame(game.id)
            }}
          >
            <GameLogo game={game.id} size={220} asSwitchIcon={true} />
          </div>
        )
      })}
    </div>
  )

  let selectedGamePresets: PresetDex[] = []
  if (selectedGame) {
    selectedGamePresets = Object.values(getPresetsForGame(selectedGame))
  }

  return (
    <div className="page-container">
      <div className={'inner-container bg-blueberry-darker'}>
        <h2>
          <i className={'icon-pkg-box-home'} />
          Create a new Living Pokédex
        </h2>
        <b>Select a game and then a preset</b> for your Living Pokédex. You can select any of them to take a quick look
        and come back if you want to change your mind. Changes won't be saved until you hit the "Save" button.
        <br />
        <br />
        <p>
          You can currently create <b>{resolvedLimits.remainingDexes}</b> more Living Pokédexes.
        </p>
      </div>
      <div className={styles.selector + ' inner-container bg-blueberry-darker'}>
        {gameSelectors}
        {selectedGame && (
          <div id={'presets'} className={styles.presets}>
            <div className={'text-center'}>
              <div className={styles.gameTitle}>Pokémon {getGameById(selectedGame).name}</div>
            </div>
            {selectedGamePresets
              .filter((p) => !p.isHidden)
              .map((p, index) => (
                <div key={index} className={styles.preset + ' inner-container bg-blueberry-medium'}>
                  <div className={styles.presetName}>
                    <i className={'icon-sync_alt'} /> {p.name}
                  </div>
                  <div className={styles.presetDescription}>{p.description}</div>
                  <div className={'text-right'}>
                    <ButtonInternalLink href={`?game=${selectedGame}&preset=${p.id}`} className={styles.selectBtn}>
                      Select this preset
                    </ButtonInternalLink>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      {dexes.length > 0 && (
        <div className={'text-center'}>
          <br />
          <ButtonInternalLink href="/apps/livingdex">Go to your existing Dexes</ButtonInternalLink>
        </div>
      )}
    </div>
  )
}
