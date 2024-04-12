import { TypeIcon } from '@supeffective/icons'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import PkImgFile from '@/features/livingdex/components/PkImgFile'
import Button from '@/lib/components/Button'
import { GameLabel } from '@/lib/components/GameLabel'
import { ExternLink } from '@/lib/components/Links'
import { TextInput } from '@/lib/components/forms/TextInput'
import { getGameSetById } from '@/lib/data-client/game-sets'
import { PokemonEntry, PokemonEntrySearchIndex } from '@/lib/data-client/pokemon/types'
import { cn } from '@/lib/utils'
import { classNameIf, classNames } from '@/lib/utils/deprecated'

import css from './Pokedex.module.css'

export interface PokedexProps {
  className?: string
  pokemon: PokemonEntry[]
  pokemonSearch: PokemonEntrySearchIndex
  useSearch?: boolean
  fixedHeight?: boolean
  showForms?: boolean
  showCounts?: boolean
  children?: React.ReactNode

  [key: string]: any
}

export interface PokemonInfoPanelProps {
  className?: string
  children?: undefined
  showShiny?: boolean
  pokemon: PokemonEntry | null
  onCloseBtnClick?: () => void
  onTypeBtnClick?: (type: string) => void
  isOpen: boolean

  [key: string]: any
}

const titleize = (str: string): string => {
  if (!str) return ''
  const parts = str.split('.')
  const last = parts[parts.length - 1]
  return last.replace(/([A-Z])/g, ' $1').replace(/^./, (l) => l.toUpperCase())
}

export const PokemonInfoPanel = ({
  className,
  children, // put here to avoid it being spread
  onCloseBtnClick,
  onTypeBtnClick,
  isOpen,
  showShiny,
  pokemon,
  ...rest
}: PokemonInfoPanelProps) => {
  if (pokemon === null) {
    return null
  }

  const classes = classNames(css.infoPanel, classNameIf(isOpen, css.open, css.close), className)
  const dexNum4Digits = pokemon.dexNum ? pokemon.dexNum.toString().padStart(4, '0') : '????'
  const handleTypeClick = (type: string) => {
    if (onTypeBtnClick) {
      onTypeBtnClick(type)
    }
  }

  return (
    <div className={classes} {...rest}>
      {onCloseBtnClick && (
        <span onClick={onCloseBtnClick} className={css.closeBtn}>
          x
        </span>
      )}
      <div className={css.inner}>
        <div className={css.pkTitle}>
          <span className={css.dexNo}>No. {dexNum4Digits}</span>
          <span className={css.pkName}>{pokemon.name}</span>
        </div>
        <div className={css.picFrame}>
          <PkImgFile
            nid={pokemon.nid}
            title={pokemon.name}
            shiny={showShiny === true}
            className={css.pkimg}
            variant="3d"
          />
        </div>
        <div className={css.types}>
          {pokemon.type1 && (
            <span
              onClick={() => handleTypeClick(pokemon.type1!)}
              className={css.tooltip}
              data-tooltip={titleize(pokemon.type1)}
              data-flow="bottom"
            >
              <TypeIcon className={css.typeIcon} typeId={pokemon.type1 as any} size="sm" theme="light" colored filled />
            </span>
          )}
          {pokemon.type2 && (
            <span
              onClick={() => handleTypeClick(pokemon.type2!)}
              className={css.tooltip}
              data-tooltip={titleize(pokemon.type2)}
              data-flow="bottom"
            >
              <TypeIcon className={css.typeIcon} typeId={pokemon.type2 as any} size="sm" theme="light" colored filled />
            </span>
          )}
        </div>
        <section>
          <div className={css.title}>Obtainable In</div>
          <div className={css.gameIcons}>
            {pokemon.location.obtainableIn.map((gameSetId: string) => (
              <div
                key={gameSetId}
                className={css.gameset}
                data-tooltip={getGameSetById(gameSetId).name}
                data-flow="bottom"
              >
                <GameLabel gameId={gameSetId} rounded size="sm" />
              </div>
            ))}
            {pokemon.location.eventOnlyIn.map((gameSetId: string) => (
              <div
                key={gameSetId}
                className={css.gameset}
                data-tooltip={getGameSetById(gameSetId).name + ' (Event Only)'}
                data-flow="bottom"
              >
                <GameLabel gameId={gameSetId} rounded size="xs" />
                <span className={`icon-pkg-pokeball-outlined`} title="Event Only"></span>
              </div>
            ))}
            {pokemon.location.obtainableIn.length + pokemon.location.eventOnlyIn.length === 0 && <b>---</b>}
          </div>
        </section>
        <section>
          <div className={css.title}>Storable In</div>
          <div className={css.gameIcons}>
            {pokemon.location.storableIn.map((gameSetId: string) => (
              <div
                key={gameSetId}
                className={css.gameset}
                data-tooltip={getGameSetById(gameSetId).name}
                data-flow="bottom"
              >
                <GameLabel gameId={gameSetId} rounded size="xs" />
              </div>
            ))}
            {pokemon.location.storableIn.length === 0 && <b>---</b>}
          </div>
        </section>
        <section>
          <div className={css.title}>External Links</div>
          <div className={css.gameIcons + ` ${css.externalLinks}`}>
            <ExternLink href={`https://www.serebii.net/pokemon/${pokemon.refs.serebii}`}>
              <Image src={'/images/brands/serebii.png'} width={40} height={40} alt="serebii.net" title="serebii.net" />
            </ExternLink>
            <ExternLink href={`https://bulbapedia.bulbagarden.net/wiki/${pokemon.refs.bulbapedia}_(Pokémon)`}>
              <Image
                src={'/images/brands/bulbapedia.png'}
                width={40}
                height={40}
                alt="bulbapedia.bulbagarden.net"
                title="bulbapedia.bulbagarden.net"
              />
            </ExternLink>
            <ExternLink href={`https://www.smogon.com/dex/sv/pokemon/${pokemon.refs.smogon}`}>
              <Image src={'/images/brands/smogon.png'} width={40} height={40} alt="smogon.com" title="smogon.com" />
            </ExternLink>
          </div>
        </section>
      </div>
    </div>
  )
}

interface PokedexState {
  infoPanelOpen: boolean
  selectedPkmId: string | null | undefined
  search?: string | null
  showForms: boolean
  currentPage: number
  perPage: number
}

type PkmEntryMap = {
  [key: string]: PokemonEntry
}

export const Pokedex = ({
  className,
  children,
  pokemon,
  pokemonSearch,
  showShiny,
  fixedHeight = false,
  showForms = false,
  showCounts = true,
  useSearch = true,
  perPage = 24,
  ...rest
}: PokedexProps) => {
  const initialPerpage = perPage

  const loadMoreRef = useRef(null)
  const [state, setState] = useState<PokedexState>({
    infoPanelOpen: false,
    selectedPkmId: null,
    search: null,
    showForms: showForms === true,
    currentPage: 0,
    perPage: initialPerpage,
  })
  const pokemonList = Array.from(pokemon.values())

  const handleLoadMore = (): void => {
    setState({
      ...state,
      perPage: Math.min(state.perPage + initialPerpage, searchablePokemon.length),
    })
  }

  useEffect(() => {
    if (!loadMoreRef.current || !IntersectionObserver) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        //setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting) {
          handleLoadMore()
        }
      },
      { rootMargin: '50px' },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [state.perPage, state.search, state.showForms, state.currentPage])

  let speciesCount = 0
  let formsCount = 0
  const searchablePokemon: PokemonEntry[] = pokemonList.map((pkm: PokemonEntry) => {
    if (pkm.form.isForm) {
      formsCount++
    } else {
      speciesCount++
    }

    let pkName = pkm.name

    if (pkm.form.isFemaleForm) {
      pkName = pkName.replace(/(\(female\)|female)/gi, '♀')
    }

    if (pkm.form.isMaleForm) {
      pkName = pkName + ' ♂'
    }
    return { ...pkm, name: pkName }
  })

  const pokemonById: PkmEntryMap = searchablePokemon.reduce((prev, pkm) => {
    prev[pkm.id] = pkm
    return prev
  }, {} as PkmEntryMap)

  const selectedPkm = state.selectedPkmId ? pokemonById[state.selectedPkmId] : null

  if (selectedPkm === undefined) {
    throw new Error(`${state.selectedPkmId} is not a valid Pokemon ID`)
  }

  const classes = classNames(css.dex)

  const selectPokemon = (pkmId: string): void => {
    setState({
      ...state,
      infoPanelOpen: true,
      selectedPkmId: pkmId,
    })
  }

  const handleClose = (): void => {
    setState({
      ...state,
      infoPanelOpen: false,
    })
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      search: e.target.value,
      currentPage: 0,
      perPage: initialPerpage,
    })
  }

  const searchByType = (type: string): void => {
    setState({
      ...state,
      infoPanelOpen: false,
      search: 'type:' + type,
      currentPage: 0,
      perPage: initialPerpage,
    })
  }

  let shownSpeciesCount = 0
  let shownFormsCount = 0

  let searchValue = state.search ? state.search.toLowerCase() : ''
  if (searchValue.length >= 1 && searchValue.length < 3) {
    searchValue = ''
  }
  const searchResults = pokemonSearch.search(searchValue)

  const filteredPokemon = searchablePokemon.filter((pk) => {
    if (searchValue.length === 0) {
      return true
    }
    return searchResults.has(pk.id)
  })

  const filteredPokemonFormAware = filteredPokemon.filter((pk) => state.showForms || !pk.form.isForm)

  const startIndex = state.currentPage * state.perPage
  const hasMorePokemon = state.perPage < filteredPokemonFormAware.length
  const renderablePokemon = filteredPokemonFormAware.slice(startIndex, startIndex + state.perPage)

  filteredPokemon.forEach((pkm) => {
    // update counters
    if (pkm.form.isForm) {
      shownFormsCount++
    } else {
      shownSpeciesCount++
    }
  })

  const pokemonCells = renderablePokemon.map((pkm, index) => {
    const isMaleForm = pkm.form.isMaleForm || (pkm.form.hasGenderForms && !pkm.form.isFemaleForm)
    return (
      <div
        key={pkm.id + '_' + index}
        tabIndex={0}
        className={css.cell}
        data-tooltip={pkm.name}
        data-flow="bottom"
        onClick={(e) => {
          selectPokemon(pkm.id)
          e.stopPropagation()
        }}
        onFocus={(e) => {
          selectPokemon(pkm.id)
          e.stopPropagation()
        }}
      >
        <PkImgFile nid={pkm.nid} title={pkm.name} shiny={showShiny === true} className={css.pkimg} variant="3d" />
        {pkm.form.isFemaleForm && <span className={'female-symbol ' + css.femaleIcon}>{'♀'}</span>}
        {isMaleForm && <span className={'male-symbol ' + css.maleIcon}>{'♂'}</span>}
        {/* <div>#{pkm.dexNum}</div>
        <div>{pkm.name}</div> */}
      </div>
    )
  })

  const headerContent = (
    <div className={'text-center ' + css.docTop}>
      <h2 className="main-title-outlined " style={{ marginBottom: 0 }}>
        <i className="icon-books" /> National Pokédex
      </h2>
    </div>
  )

  const searchPanel = (
    <div className={'text-center'}>
      <div className={css.searchBar}>
        <TextInput
          type="search"
          name="filter"
          autoCorrect="off"
          autoComplete="off"
          placeholder="Search by name, number, type, or color"
          value={state.search ? state.search : ''}
          onChange={handleSearchInput}
        />
        <div className={css.buttons}></div>
      </div>
      <div className={css.countersText}>
        {showCounts && (
          <span>
            Showing {shownSpeciesCount} species
            {state.showForms ? `, and ${shownFormsCount} forms.` : `, excluding ${shownFormsCount} forms.`}
          </span>
        )}

        <span
          className={cn(css.btnToggle, {
            [css.btnToggleActive]: state.showForms,
          })}
          onClick={() => setState({ ...state, showForms: !state.showForms })}
        >
          {!state.showForms && <span>Include forms</span>}
          {state.showForms && <span>Exclude forms</span>}
        </span>
      </div>
    </div>
  )

  const loadMoreBtn = hasMorePokemon ? (
    <div className={css.loadMoreBtnCell}>
      <div className="text-center" ref={loadMoreRef}>
        <Button onClick={handleLoadMore}>Load More</Button>
      </div>
    </div>
  ) : null
  return (
    <div
      className={classNames(
        css.dexApp,
        className,
        cn({
          [css.fixedHeight]: fixedHeight,
        }),
      )}
    >
      {children ? children : headerContent}
      {useSearch && searchPanel}

      <div className={classes} {...rest}>
        <div className={css.grid}>
          {pokemonCells}
          {loadMoreBtn}
        </div>
        <PokemonInfoPanel
          isOpen={state.infoPanelOpen}
          showShiny={showShiny}
          onTypeBtnClick={useSearch ? searchByType : undefined}
          onCloseBtnClick={handleClose}
          pokemon={selectedPkm}
        />
      </div>
    </div>
  )
}
