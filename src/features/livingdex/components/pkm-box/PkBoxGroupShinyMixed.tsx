import { ReactElement, useEffect, useRef, useState } from 'react'

import config from '@/config'
import { createBoxTitle } from '@/features/livingdex/repository/presets/createBoxTitle'
import { DexBox, PkFilter } from '@/features/livingdex/repository/types'
import Button from '@/lib/components/Button'
import { getGameSetByGameId } from '@/lib/data-client/game-sets'
import { getPokemonEntry } from '@/lib/data-client/pokemon'
import { classNames } from '@/lib/utils/deprecated'

import PkImgFile from '../PkImgFile'
import { PkBox } from './PkBox'
import styles from './PkBox.module.css'
import { PkBoxCell } from './PkBoxCell'
import { PkBoxEmptyCell } from './PkBoxEmptyCell'
import { createFilteredDex, filterBoxElements } from './PkBoxGroup'
import { PkBoxGroupFilter } from './PkBoxGroupFilter'
import { PkBoxGroupProps, PkBoxGroupState } from './pkBoxTypes'

export function PkBoxGroupShinyMixed(props: PkBoxGroupProps) {
  const [state, setState] = useState<PkBoxGroupState>({
    filter: null,
  })
  const filteredDex = state.filter ? createFilteredDex(props.dex, state.filter) : props.dex
  const showShiny = props.showShiny ?? false
  const showRegular = props.showNonShiny ?? true
  const showMixed = showShiny && showRegular
  const showShinyAfterRegular = showMixed && (props.shinyAfterRegular ?? false)

  let initialPerPage = props.perPage || 1
  const loadMoreRef = useRef(null)

  if (props.viewMode === 'listed' || props.dex.boxes.length <= 2) {
    initialPerPage = 10
  }

  const [perPage, setPerPage] = useState(initialPerPage)

  // Sets the new filter state
  const handleBoxFilter = (filter: PkFilter): void => {
    setState({ filter })
  }

  const handleLoadMore = (): void => {
    setPerPage(Math.min(perPage + initialPerPage, totalBoxCount))
    // setIsIntersecting(false)
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
      { rootMargin: '100px' },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [perPage])

  const { usePixelIcons } = props
  const boxElements: ReactElement[] = []
  const initialTabIndex = 1

  const [regularBoxes, shinyBoxes] = filteredDex.boxes.reduce(
    (acc, box) => {
      if (box.shiny) {
        acc[1].push(box)
      } else {
        acc[0].push(box)
      }
      return acc
    },
    [[], []] as [DexBox[], DexBox[]],
  )

  const _boxes = showShinyAfterRegular ? [...regularBoxes, ...shinyBoxes] : filteredDex.boxes

  _boxes.forEach((box, boxIndex) => {
    const boxCells: any[] = []
    const boxTabIndex = props.selectMode === 'box' ? initialTabIndex + boxIndex : undefined

    box.pokemon.forEach((cellPkm, cellIndex) => {
      let cellTabIndex: number | undefined =
        initialTabIndex + _boxes.length + boxIndex * config.limits.maxPokemonPerBox + cellIndex

      if (props.selectMode === 'box') {
        cellTabIndex = undefined
      }

      if (cellPkm === null) {
        //  || (cellPkm.shiny && cellPkm.shinyBase)
        boxCells.push(
          <PkBoxEmptyCell
            boxIndex={boxIndex}
            pokemonIndex={cellIndex}
            tabIndex={cellTabIndex}
            pokemonData={cellPkm}
            revealPokemon={props.revealPokemon}
            viewMode={props.viewMode}
            selectMode={props.selectMode}
            usePixelIcons={usePixelIcons}
            key={`placeholder-${boxIndex}-${cellIndex}`}
          />,
        )
        return
      }

      const slug = cellPkm.pid
      const pkmEntry = getPokemonEntry(slug)
      let title = pkmEntry.name
      let isSpecialAbilityPkm = false
      const isHiddenAbilityPkm = false // TODO support in future

      if (slug.includes('--')) {
        isSpecialAbilityPkm = true
      }

      const classes = classNames(
        'pkBox-cell',
        cellPkm.caught ? styles.caught : styles.uncaught,
        cellPkm.shiny ? styles.shiny : '',
        cellPkm.shinyLocked ? styles.shinyLocked : '',
        cellPkm.shinyBase !== null ? styles.hasShinyBase : '',
      )

      if (pkmEntry.form.isGmax) {
        title += ' Gigantamax'
      }

      if (cellPkm.shiny && cellPkm.shinyBase) {
        title += ', same color as ' + getPokemonEntry(cellPkm.shinyBase).name
      }

      if (cellPkm.shiny && cellPkm.shinyLocked) {
        title += ' (Shiny Not Available)'
      }

      boxCells.push(
        <PkBoxCell
          boxIndex={boxIndex}
          pokemonIndex={cellIndex}
          tabIndex={cellTabIndex}
          pokemonData={cellPkm}
          key={`${slug}-${boxIndex}-${cellIndex}`}
          viewMode={props.viewMode}
          selectMode={props.selectMode}
          revealPokemon={props.revealPokemon}
          onClick={props.onPokemonClick}
          className={classes}
        >
          <PkImgFile
            nid={cellPkm.nid}
            title={title}
            shiny={cellPkm.shiny}
            variant={usePixelIcons ? 'pixelart' : '3d'}
          />
          <span className={styles.pkBoxCellLabel}>{title}</span>
          {props.markTypes.includes('catch') && (
            <>
              <i className={[styles.ballIcon, styles.ballIconCaught, 'icon-pkg-pokeball'].join(' ')}>
                <i className={[styles.subIcon, 'icon-pkg-pokeball-outlined'].join(' ')} />
              </i>
              <i className={[styles.ballIcon, styles.ballIconUncaught, 'icon-pkg-pokeball-outlined'].join(' ')} />
            </>
          )}
          {cellPkm.shiny && props.markTypes.includes('shiny') && <i className={styles.shinyIcon + ' icon-pkg-shiny'} />}
          {cellPkm.gmax && props.markTypes.includes('gmax') && <i className={styles.gmaxIcon + ' icon-pkg-dynamax'} />}
          {cellPkm.alpha && props.markTypes.includes('alpha') && <i className={styles.alphaIcon + ' icon-pkg-wild'} />}
          {isSpecialAbilityPkm && props.markTypes.includes('ability') && <i className={styles.abilityIcon}>SA</i>}
          {isHiddenAbilityPkm && props.markTypes.includes('ability') && <i className={styles.abilityIcon}>HA</i>}
        </PkBoxCell>,
      )
    })

    if (props.viewMode === 'listed') {
      boxElements.push(...boxCells)
      return
    }
    const nextIdx = boxElements.length + 1
    const boxTitle = createBoxTitle(props.dex.gameSetId, box.title, nextIdx)
    const isOverflowing = nextIdx > getGameSetByGameId(filteredDex.gameId).storage.boxes

    boxElements.push(
      <PkBox
        boxIndex={boxIndex}
        key={boxIndex + `${box.shiny ? '-shiny' : '-regular'}`}
        boxData={box}
        // editable={props.editable}
        editable={false} // disabled for now
        shiny={box.shiny}
        onBoxTitleEdit={props.onBoxTitleEdit}
        viewMode={props.viewMode}
        isOverflowing={isOverflowing}
        selectMode={props.selectMode}
        tabIndex={boxTabIndex}
        // title={box.title || `[Box ${boxIndex + 1}]`}
        title={boxTitle}
        onClick={props.onBoxClick}
      >
        {boxCells}
      </PkBox>,
    )
  })
  const totalBoxCount = boxElements.length
  const pagedBoxElements = boxElements.filter(filterBoxElements.bind(null, state.filter)).slice(0, perPage)
  const hasMoreBoxes = perPage < totalBoxCount

  const loadMoreBtn = hasMoreBoxes ? (
    <div key="load-more-btn" className={styles.loadMoreBtnCell} ref={loadMoreRef}>
      <div className="text-center">
        <Button onClick={handleLoadMore}>Load More</Button>
      </div>
    </div>
  ) : null

  const classes = classNames(
    styles.pkBoxGroup,
    styles[props.selectMode + 'SelectMode'],
    styles[props.viewMode + 'ViewMode'],
    props.editable ? styles.editable : styles.nonEditable,
  )
  return (
    <div className={'pkBoxGroupWr'}>
      <div className={'pkBoxGroupWr pkBoxGroupWr-regular'}>
        <PkBoxGroupFilter onChange={handleBoxFilter} />
        <div className={classes}>
          <div className={[styles.pkBoxGroupContent, 'pkBoxCount-' + boxElements.length].join(' ')}>
            {pagedBoxElements}
            {loadMoreBtn}
          </div>
        </div>
      </div>
    </div>
  )
}
