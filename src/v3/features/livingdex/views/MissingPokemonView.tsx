import Link from 'next/link'
import { useState } from 'react'

import { GameLogo } from '@/v3/features/livingdex/components/GameLogo'
import { DexPokemon, NullableDexPokemon } from '@/v3/features/livingdex/repository/types'
import { useDexesContext } from '@/v3/features/livingdex/state/LivingDexListContext'
import PageMeta from '@/v3/features/pages/components/PageMeta'
import { Pokedex } from '@/v3/features/pokedex/views/Pokedex'
import { abs_url } from '@/v3/lib/components/Links'
import { LoadingBanner } from '@/v3/lib/components/panels/LoadingBanner'
import { getGameSetByGameId } from '@/v3/lib/data-client/game-sets'
import { getGameById } from '@/v3/lib/data-client/games'
import { LegacyGame } from '@/v3/lib/data-client/games/types'
import { getPokemonEntries, getPokemonSearchIndex } from '@/v3/lib/data-client/pokemon'
import { PokemonEntry } from '@/v3/lib/data-client/pokemon/types'
import { useScrollToLocation } from '@/v3/lib/hooks/useScrollToLocation'

import styles from './MissingPokemonView.module.css'

type MissingPokemon = {
  game: LegacyGame
  pokemon: PokemonEntry[]
  countSpecies: number
  countForms: number
}

const MissingPokemonView = () => {
  useScrollToLocation()
  const { dexes, dexesLoading } = useDexesContext()
  const [showShiny, setShowShiny] = useState(false)

  if (dexesLoading) {
    return <LoadingBanner />
  }

  if (dexes === null) {
    return <LoadingBanner content={<span>You need to be logged in to access this page.</span>} />
  }

  const allPokemon = getPokemonEntries()
  const pokemonSearch = getPokemonSearchIndex()

  if (dexes.length === 0) {
    return (
      <LoadingBanner
        content={
          <div>
            You currently don't have any Pokédex to track. Try <Link href={'/apps/livingdex/new'}>creating one</Link>{' '}
            first.
            <div></div>
          </div>
        }
      />
    )
  }

  const shinyAnchor = (
    <span
      onClick={() => {
        setShowShiny(true)
      }}
      className={styles.nonShinyAnchor}
    >
      <i className={'icon-pkg-shiny'} /> View Shiny Mode
    </span>
  )

  const nonShinyAnchor = (
    <span
      onClick={() => {
        setShowShiny(false)
      }}
      className={styles.shinyAnchor}
    >
      <i className={'icon-pkg-pokedex'} /> View Normal Mode
    </span>
  )

  const missingPokemonByGame: MissingPokemon[] = []

  for (const dex of dexes) {
    let countSpecies = 0
    let countForms = 0

    const missingPokemon: PokemonEntry[] = []
    const boxesPokemon: DexPokemon[] = dex.boxes
      .reduce((acc, box) => acc.concat(box.pokemon), [] as NullableDexPokemon[])
      .filter((p) => p !== null) as DexPokemon[]

    for (const pokemon of allPokemon) {
      if (showShiny && !pokemon.shiny.released) {
        continue
      }
      if (showShiny && pokemon.shiny.base !== null) {
        continue
      }
      // if (pokemon.isForm) {
      //   continue
      // }
      if (boxesPokemon.some((p) => p.pid === pokemon.id)) {
        if (!boxesPokemon.some((p) => p.pid === pokemon.id && p.caught && p.shiny === showShiny)) {
          if (pokemon.form.isForm) {
            countForms++
          } else {
            countSpecies++
          }
          missingPokemon.push(pokemon)
        }
      }
    }

    if (missingPokemon.length > 0) {
      missingPokemonByGame.push({
        game: getGameById(dex.gameId),
        pokemon: missingPokemon,
        countSpecies,
        countForms,
      })
    }
  }

  return (
    <div className={'page-container'} style={{ maxWidth: 'none' }}>
      <PageMeta
        metaTitle={'Missing Pokémon - Living Pokédex Tracker - Supereffective.gg'}
        metaDescription={''}
        robots={'noindex,nofollow'}
        canonicalUrl={abs_url('/apps/livingdex/missing')}
        lang={'en'}
      />
      <div className={styles.topRightCallout}>
        {showShiny && nonShinyAnchor}
        {!showShiny && shinyAnchor}
      </div>
      <div className={'page-content '}>
        <div className={'text-center'}>
          <h2 className="main-title-outlined">
            <i className="icon-pkg-pokeball" /> Missing Pokémon
          </h2>
          <p className={styles.heroContent}>
            List of Pokémon that are not yet stored in each of your Living Pokédexes.
          </p>
        </div>
        {missingPokemonByGame.map((missingPokemon) => {
          if (!missingPokemon.game.setId) {
            throw new Error('Missing game set id for ' + missingPokemon.game.id)
          }
          const gameSet = getGameSetByGameId(missingPokemon.game.id)
          if (showShiny && !gameSet.hasShinies) {
            return null
          }
          return (
            missingPokemon.pokemon.length > 0 && (
              <div className={styles.gameBlock} key={missingPokemon.game.id}>
                <Pokedex
                  pokemon={missingPokemon.pokemon}
                  pokemonSearch={pokemonSearch}
                  useSearch={missingPokemon.pokemon.length >= 50}
                  showForms={true}
                  fixedHeight={true}
                  showCounts={true}
                  showShiny={showShiny}
                  className={styles.dex}
                >
                  <h3
                    style={{ fontSize: '1.6rem' }}
                    className="text-center"
                    title={'Pokémon ' + missingPokemon.game.name}
                  >
                    <div id={'g-' + missingPokemon.game.id} className="offset-anchor" />
                    <a href={'#g-' + missingPokemon.game.id}>
                      <GameLogo
                        className={styles.gameLogo}
                        game={missingPokemon.game.id}
                        ext=".png"
                        size={120}
                        asSwitchIcon={false}
                      />
                    </a>
                  </h3>
                  <p className={'text-center ' + styles.missingCount}>
                    Missing: {missingPokemon.countSpecies} species, {missingPokemon.countForms} forms
                  </p>
                </Pokedex>
              </div>
            )
          )
        })}
      </div>
    </div>
  )
}

export default MissingPokemonView
