import { BracesIcon, ListTodoIcon, Settings2Icon, ToggleLeftIcon, ToggleRightIcon, WandIcon } from 'lucide-react'
// import { usePlausible } from 'next-plausible'
import { useRouter } from 'next/compat/router'
import { NextRouter } from 'next/router'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import ReactModal from 'react-modal'

import config from '@/config'
import { GameLogo } from '@/features/livingdex/components/GameLogo'
import PkImgFile from '@/features/livingdex/components/PkImgFile'
import { DexSocialLinks } from '@/features/livingdex/components/SocialLinks'
import {
  ToolbarButton,
  ToolbarButtonGroup,
  ToolbarButtonGroupGroup,
  ToolbarButtonStatus,
} from '@/features/livingdex/components/ToolbarButton'
import { convertDexFromLegacyToV4 } from '@/features/livingdex/parser/support'
import { isCatchable } from '@/features/livingdex/repository'
import { getPresetByIdForGame, getPresetsForGame } from '@/features/livingdex/repository/presets'
import { normalizeDexWithPreset } from '@/features/livingdex/repository/presets/normalizeDexWithPreset'
import { PresetDex, PresetDexMap } from '@/features/livingdex/repository/presets/types'
import { DexBox, LoadedDex, NullableDexPokemon } from '@/features/livingdex/repository/types'
import { useDexesContext } from '@/features/livingdex/state/LivingDexListContext'
import { useSession } from '@/features/users/auth/hooks/useSession'
import Button from '@/lib/components/Button'
import { SiteLink } from '@/lib/components/Links'
import InlineTextEditor from '@/lib/components/forms/InlineTextEditor'
import { LoadingBanner } from '@/lib/components/panels/LoadingBanner'
import { getGameSetByGameId } from '@/lib/data-client/game-sets'
import { useScrollToLocation } from '@/lib/hooks/useScrollToLocation'
import { slugify } from '@/lib/utils/strings'

import { PkBoxGroup } from '../components/pkm-box/PkBoxGroup'
import { PkBoxGroupShinyMixed } from '../components/pkm-box/PkBoxGroupShinyMixed'
import { MarkType, SelectMode, ViewMode } from '../components/pkm-box/pkBoxTypes'
import { LivingDexContext } from '../state/LivingDexContext'
import styles from './LivingDexApp.module.css'

type ActionTool = MarkType | 'all-marks' | 'no-marks' | null // | 'move' | 'delete'
type SyncState = 'changed' | 'synced'
type SavingState = 'ready' | 'saving' | 'saved' | 'error'
const defaultTool: ActionTool = 'catch'

export interface LivingDexAppProps {
  loadedDex: LoadedDex
  presets: PresetDexMap
  onSave?: (dex: LoadedDex, isNewDex: boolean) => void
}

interface ModalContent {
  title?: string
  content: React.ReactNode
  cancelButton?: React.ReactNode
  confirmButton?: React.ReactNode
  onCancel?: () => void
  onConfirm?: () => void
  prevState: {
    dex: LoadedDex
    preset: PresetDex
  }
}

const saveTimeout = 2000

const setUrlParamRouter = (param: string, value: string | number | null | undefined, router?: NextRouter | null) => {
  if (!router) {
    throw new Error('NextRouter is not mounted, cannot set an URL param.')
  }
  if (!value) {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, [param]: undefined },
    })
    return
  }
  router.push({
    pathname: router.pathname,
    query: { ...router.query, [param]: value },
  })
}

const readUrlParamRouter = (param: string, router?: NextRouter | null, defaultValue?: string): string | undefined => {
  const value = router ? router.query[param] : undefined
  if (value === undefined) {
    return defaultValue
  }

  return value as string
}

export default function LivingDexApp({ loadedDex, presets, onSave }: LivingDexAppProps) {
  // const plausible = usePlausible()
  const router = useRouter()
  const initialMarkTypes: MarkType[] = String(readUrlParamRouter('marks', router, 'catch')).split(',') as MarkType[]
  const allMarkTypes: MarkType[] = ['catch', 'shiny', 'gmax', 'alpha']
  // const viewOnlyModeMarkTypes: MarkType[] = ['shiny', 'gmax', 'alpha']
  const [savingState, setSavingState] = useState<SavingState>('ready')
  const [syncState, setSyncState] = useState<SyncState>('synced')
  const [selectMode, setSelectMode] = useState<SelectMode>('cell')
  const [currentTool, setCurrentTool] = useState<ActionTool>(defaultTool)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const numBoxes = loadedDex.boxes.length || 0
  const defaultViewMode = numBoxes > 2 ? 'boxed' : 'listed'
  const [viewMode, setViewMode] = useState<ViewMode>(readUrlParamRouter('mode', router, defaultViewMode) as ViewMode)
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const livingdex = useContext(LivingDexContext)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [showRegularBoxes, setShowRegularBoxes] = useState(readUrlParamRouter('nonshiny', router, '1') === '1')
  const [showShinyBoxes, setShowShinyBoxes] = useState(readUrlParamRouter('shiny', router, undefined) === '1')
  const [shinyAfterRegular, setShinyAfterRegular] = useState(readUrlParamRouter('shinyafter', router, '0') === '1')
  const showMixedShinies = showShinyBoxes && showRegularBoxes

  const dex = livingdex.state

  const app = new Proxy(livingdex.actions, {
    get(target, prop) {
      if (['setDex', 'getCurrentDex', 'setDexes', 'resetDex'].includes(prop as string)) {
        return target[prop as keyof typeof livingdex.actions]
      }
      return (...args: any[]) => {
        setSyncState('changed')
        return (target[prop as keyof typeof livingdex.actions] as any)(...args)
      }
    },
  })

  const auth = useSession()
  const currentUser = auth.currentUser
  const [markTypes, setMarkTypes] = useState<MarkType[]>(initialMarkTypes)
  // console.log('markTypes', markTypes)
  const { dexesLoading, saveDex, deleteDex } = useDexesContext()
  const lastSavedAtString =
    lastSavedAt && lastSavedAt.toLocaleDateString
      ? `${lastSavedAt.toLocaleDateString()} ${lastSavedAt.toLocaleTimeString()}`
      : ''

  const handleSavedState = () => {
    setSyncState('synced')
    setSavingState('saved')
    setLastSavedAt(new Date())
    setTimeout(() => {
      setSavingState('ready')
    }, saveTimeout)
  }

  const handleSave = () => {
    if (!dex) {
      return
    }

    if (!dex.userId) {
      throw new Error('Cannot save dex without a logged in user')
    }
    if (savingState !== 'ready') {
      return
    }

    setSavingState('saving')

    const isNewDex = dex.id === null || dex.id === undefined

    saveDex(dex)
      .then((updatedDex) => {
        if (updatedDex instanceof Error) {
          console.error('Failed to save', updatedDex)
          setSavingState('error')
          setSaveError(updatedDex)
          setTimeout(() => {
            setSavingState('ready')
          }, saveTimeout)
          return
        }

        let dexWithId = dex
        if (isNewDex) {
          dexWithId = { ...dex, id: updatedDex.id }
          app.setDex(dexWithId)
        }

        handleSavedState()
        if (isNewDex) {
          app.setDex(dexWithId)
          setTimeout(() => {
            window.location.href = `/apps/livingdex/${updatedDex.id}?created=1`
            // plausible('dex_created', {
            //   props: {
            //     livingDexGame: dexWithId.gameId,
            //     livingDexPreset: `${dexWithId.gameId}--${dexWithId.presetId}`,
            //   },
            // })
          }, 1000)
        }
        if (onSave) {
          onSave(dexWithId, isNewDex)
        }
        if (saveError) {
          setSaveError(null)
        }
      })
      .catch((e) => {
        console.error('Failed to save', e)
        setSavingState('error')
        setSaveError(e)
        setTimeout(() => {
          setSavingState('ready')
        }, saveTimeout)
      })
  }

  useScrollToLocation()

  useEffect(() => {
    if (
      livingdex.state === null ||
      loadedDex.id !== livingdex.state.id ||
      loadedDex.gameId !== livingdex.state.gameId
      // || (loadedDex.preset !== livingdex.state.preset)
    ) {
      livingdex.actions.setDex(loadedDex)
      return
    }

    if (!auth.isAuthenticated || savingState !== 'ready' || syncState !== 'changed') {
      return
    }
    const autoSaveTimeout = setTimeout(() => {
      handleSave()
      console.log('Dex saved')
    }, saveTimeout)
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [livingdex.state, loadedDex])

  const preset = useMemo(() => {
    if (livingdex.state === null) {
      return null
    }
    return getPresetByIdForGame(livingdex.state.gameId, livingdex.state!.presetId)
  }, [presets, livingdex.state])

  if (auth.isLoading() || dex === null) {
    return <LoadingBanner />
  }

  if (dexesLoading) {
    return <LoadingBanner />
  }

  const isEditable = auth.isAuthenticated() && (dex.userId === auth.currentUser?.uid || dex.userId === undefined)

  const gameSet = getGameSetByGameId(dex.gameId)
  const gameSymbols = gameSet.storage?.symbols || []
  const hasShinyMode = gameSet.hasShinies

  const handleBoxClick = (boxIndex: number, boxData: DexBox) => {
    if (viewMode !== 'boxed') {
      throw new Error('Cannot handle box click in non-boxed view mode')
    }

    if (selectMode !== 'box' || boxData.pokemon.length === 0) {
      return
    }

    // find first pokemon in box, that is not null
    const firstPokemon = boxData.pokemon.find((pk) => pk !== null)
    if (firstPokemon === undefined || firstPokemon === null) {
      return
    }

    switch (currentTool) {
      case 'catch':
        app.catchBox(boxIndex, !firstPokemon.caught)
        break
      case 'shiny':
        app.shinifyBox(boxIndex, !firstPokemon.shiny)
        break
      case 'alpha':
        app.alphaizeBox(boxIndex, !firstPokemon.alpha)
        break
      case 'gmax':
        app.gmaxizeBox(boxIndex, !firstPokemon.gmax)
        break
    }
  }

  const handlePkmClick = (boxIndex: number, pokemonIndex: number, pokemonData: NullableDexPokemon) => {
    if (pokemonData === null || selectMode !== 'cell') {
      return
    }
    switch (currentTool) {
      case 'catch':
        if (!isCatchable(pokemonData)) {
          return
        }
        app.catchPokemon(boxIndex, pokemonIndex, !pokemonData.caught)
        break
      case 'shiny':
        if (pokemonData.shinyLocked) {
          return
        }
        app.shinifyPokemon(boxIndex, pokemonIndex, !pokemonData.shiny)
        break
      case 'alpha':
        app.alphaizePokemon(boxIndex, pokemonIndex, !pokemonData.alpha)
        break
      case 'gmax':
        app.gmaxizePokemon(boxIndex, pokemonIndex, !pokemonData.gmax)
        break
    }
  }

  const handleDexTitleChange = (newTitle: string) => {
    if (newTitle === dex.title || newTitle.length === 0) {
      return
    }

    if (newTitle.length > config.limits.maxDexTitleSize) {
      newTitle = newTitle.slice(0, config.limits.maxDexTitleSize)
    }

    app.setDexTitle(newTitle)
  }

  const handleBoxTitleEdit = (boxIndex: number, newTitle: string) => {
    if (newTitle === dex.boxes[boxIndex].title || newTitle.length === 0) {
      return
    }

    if (newTitle.length > config.limits.maxBoxTitleSize) {
      newTitle = newTitle.slice(0, config.limits.maxBoxTitleSize)
    }

    app.setBoxTitle(boxIndex, newTitle)
  }

  const handleExport = () => {
    const docSpec = convertDexFromLegacyToV4(dex)
    // const mdContent = serializeLivingDex(docSpec, getLivingDexFormat('v4'), true)
    // const blob = new Blob([mdContent], { type: 'text/plain;charset=utf-8' })

    // download as text/plain blob:
    const blob = new Blob([JSON.stringify(docSpec, undefined, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const element = document.createElement('a')
    element.setAttribute('href', url)
    // element.setAttribute('download', dex.title + '.md')
    element.setAttribute('download', slugify(dex.title) + '.livingdex.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImport = () => {
    // Disable import for now, until we have better validation
    // const input = document.createElement('input')
    // input.type = 'file'
    // input.accept = '.json'
    // input.onchange = e => {
    //   const file = (e.target as HTMLInputElement).files?.[0]
    //   if (!file) {
    //     return
    //   }
    //   const reader = new FileReader()
    //   reader.onload = e => {
    //     const result = e.target?.result
    //     if (typeof result !== 'string') {
    //       return
    //     }
    //     try {
    //       const data: DeserializedLivingDexDoc = JSON.parse(result)
    //       data.$id = dex.id
    //       if (data.gameId !== dex.gameId) {
    //         const errMsg = `The file you selected is not a valid Living Dex file for game '${dex.gameId}'.`
    //         alert('Error: ' + errMsg)
    //         throw new Error(errMsg)
    //       }
    //       if (data.legacyPresetId !== dex.presetId) {
    //         const errMsg = `The preset of this Dex and the one of the JSON file are different.`
    //         alert('Error: ' + errMsg)
    //         throw new Error(errMsg)
    //       }
    //       if (!currentUser) {
    //         throw new Error('Cannot import dex if not logged in')
    //       }
    //       const loadedDex = convertStorableDexToLoadedDex(
    //         convertDexFromV4ToLegacyStd(dex.id, currentUser.uid, data)
    //       )
    //       // loadedDex.id = undefined // TODO: this is a hack to force a new id to be generated
    //       app.setDex(loadedDex)
    //       setModalContent({
    //         title: 'Import successful',
    //         content: (
    //           <div>
    //             <p>
    //               The Living Dex has been imported successfully. You can now continue editing it.
    //             </p>
    //             <p>
    //               <strong>Nothing will be saved until you do some change.</strong>
    //             </p>
    //           </div>
    //         ),
    //         confirmButton: 'OK',
    //         cancelButton: null,
    //         prevState: { dex, preset: preset as any },
    //       })
    //     } catch (e) {
    //       alert('The file you selected is not a valid Living Dex JSON file.')
    //       throw e
    //     }
    //   }
    //   reader.readAsText(file)
    // }
    // input.click()
  }

  const handleSettingsToolbar = (newAction: string | null, prevState: string | null, prevAction: string | null) => {
    if (newAction === 'toggle-showRegularBoxes') {
      setUrlParamRouter('nonshiny', showRegularBoxes ? '0' : '1', router)
      setShowRegularBoxes(!showRegularBoxes)
      return
    }

    if (newAction === 'toggle-showShinyBoxes') {
      setUrlParamRouter('shiny', showShinyBoxes ? '0' : '1', router)
      setShowShinyBoxes(!showShinyBoxes)
      return
    }

    if (newAction === 'toggle-shinyAfterRegular') {
      setUrlParamRouter('shinyafter', shinyAfterRegular ? '0' : '1', router)
      setShinyAfterRegular(!shinyAfterRegular)
      return
    }

    if (newAction === 'import') {
      handleImport()
      return
    }

    if (newAction === 'export') {
      handleExport()
      return
    }

    if (newAction === 'toggle-marks') {
      const routerMarks = readUrlParamRouter('marks', router, undefined)
      if (!routerMarks) {
        setUrlParamRouter('marks', allMarkTypes.join(','), router)
        setMarkTypes(allMarkTypes)
        return
      }

      setUrlParamRouter('marks', undefined, router)
      setMarkTypes([])
      return
    }
  }

  const handleRemoveDex = () => {
    if (!dex.id) {
      return
    }
    deleteDex(dex.id)
      .then(() => {
        window.location.href = '/apps/livingdex' // TODO do better than this, which reloads the whole state
      })
      .catch(() => {
        alert('Failed to remove dex')
      })
  }

  const handleSelectModeToolbar = (newAction: string | null, prevState: string | null, prevAction: string | null) => {
    if (newAction === selectMode || newAction === null) {
      return
    }
    setSelectMode(newAction as SelectMode)
    // tracker.dexSelectModeChanged(dex, newAction)
  }

  const handleViewModeToolbar = (newAction: string | null, prevState: string | null, prevAction: string | null) => {
    if (newAction === viewMode || viewMode === null) {
      return
    }
    if (selectMode === 'box') {
      setSelectMode('cell')
    }
    setViewMode(newAction as ViewMode)
    setUrlParamRouter('mode', newAction, router)
    // tracker.dexViewModeChanged(dex, newAction)
  }

  const handleChangePresetToolbar = (newAction: string | null, prevState: string | null, prevAction: string | null) => {
    if (newAction === dex.presetId || newAction === null) {
      return
    }
    const newPreset = getPresetByIdForGame(dex.gameId, newAction)
    if (!newPreset) {
      throw new Error(`Preset ${newAction} not found for game ${dex.gameId}`)
    }
    const preliminaryDex = normalizeDexWithPreset(dex, newPreset)
    const lostPkm = preliminaryDex.lostPokemon.map((pkm) => {
      if (pkm === null) {
        return null
      }
      return (
        <div key={pkm.pid} title={pkm.pid} className={styles.lostPkm}>
          <PkImgFile key={pkm.pid} nid={pkm.nid} title={pkm.pid} shiny={pkm.shiny} variant="3d" />
        </div>
      )
    })
    const modalTitle = (
      <>
        <p>Changing preset to:</p>
        <i style={{ fontSize: '1rem' }}>{newPreset.name}</i>
      </>
    )
    setModalContent({
      content: (
        <div style={{ maxWidth: '600px' }}>
          <h4>{modalTitle}</h4>
          <p
            style={{
              fontStyle: 'italic',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: '#ddd',
            }}
          >
            <b>Description:</b> {newPreset.description}
          </p>
          {lostPkm.length > 0 && (
            <div className={styles.lostPkmBoxContainer}>
              <h4>Caught Pokémon that will be lost:</h4>
              <div className={styles.lostPkmBox}>{lostPkm}</div>
            </div>
          )}
          <p>
            Changing presets will reorganize your boxes and may change available Pokémon. <br />
            <b>Do you want to continue?</b>
          </p>
        </div>
      ),
      title: '', // TODO support it or remove it
      onConfirm: () => {
        app.changePreset(newPreset)
      },
      onCancel: () => {
        setModalContent(null)
      },
      confirmButton: 'Change',
      cancelButton: 'Cancel',
      prevState: {
        dex: dex,
        preset: preset!,
      },
    })
    // TODO tracker.dexPresetChanged(dex, newAction)
  }

  const handleActionToolToolbar = (newAction: string | null) => {
    if (newAction === currentTool) {
      return
    }
    if (newAction === 'all-marks') {
      setMarkTypes(allMarkTypes)
      setUrlParamRouter('marks', allMarkTypes.join(','), router)
    } else if (newAction === 'no-marks') {
      setMarkTypes([])
      setUrlParamRouter('marks', '', router)
    } else {
      setMarkTypes([newAction as MarkType])
      setUrlParamRouter('marks', newAction, router)
    }
    setCurrentTool(newAction as ActionTool)
    // tracker.dexMarkingToolSelected(dex, newAction)
  }

  const toolbarWrenchTools = [
    // {
    //   actionName: 'import',
    //   icon: 'upload',
    //   label: 'Import JSON file',
    //   status: '',
    //   className: styles.saveBtn,
    //   // onClick: handleImport,
    //   showLabel: true,
    // },
    {
      actionName: 'export',
      icon: 'download',
      label: 'Export as JSON',
      status: '',
      className: styles.saveBtn,
      // onClick: handleExport,
      showLabel: true,
    },
  ]

  const toolbar = (
    <div id={'dex-' + dex.id} className={styles.toolbar}>
      <div className={styles.toolbarContainer}>
        <ToolbarButtonGroupGroup collapsed={true}>
          {/*Todo: fix button group internal state not updating when selectMode changes (initialAction related?)*/}
          {isEditable && viewMode !== 'boxed' && (
            <ToolbarButtonGroup
              initialAction={selectMode}
              onButtonClick={handleSelectModeToolbar}
              isDropdown
              dropdownTitle={'Selection mode'}
              dropdownPosition={'left'}
              items={[
                {
                  actionName: 'cell',
                  icon: 'mouse-pointer',
                  label: 'Select Pokémon',
                },
                {
                  actionName: 'box',
                  icon: 'pkg-box',
                  label: 'Select Box',
                  status: 'disabled',
                },
              ]}
            />
          )}
          {isEditable && viewMode === 'boxed' && (
            <ToolbarButtonGroup
              initialAction={selectMode}
              onButtonClick={handleSelectModeToolbar}
              isDropdown
              dropdownTitle={'Selection mode'}
              dropdownPosition={'left'}
              items={[
                {
                  actionName: 'cell',
                  icon: 'mouse-pointer',
                  label: 'Select Pokémon',
                },
                { actionName: 'box', icon: 'pkg-box', label: 'Select Box' },
              ]}
            />
          )}
          <ToolbarButtonGroup
            initialAction={viewMode}
            onButtonClick={handleViewModeToolbar}
            isDropdown
            dropdownTitle={'View mode'}
            dropdownPosition={'left'}
            items={[
              { actionName: 'boxed', icon: 'pkg-grid', label: 'Boxed view' },
              {
                actionName: 'listed',
                icon: 'infinite',
                label: 'Continuous view',
              },
            ]}
          />
          {isEditable && (
            <ToolbarButtonGroup
              initialAction={currentTool}
              onButtonClick={handleActionToolToolbar}
              isDropdown
              dropdownTitle={'Marker tool'}
              dropdownPosition={'left'}
              dropdownNoActionIcon={<ListTodoIcon />}
              items={[
                {
                  actionName: 'catch',
                  icon: 'pkg-pokeball',
                  label: 'Caught Marker Tool',
                }, // {actionName: 'shiny', icon: 'pkg-shiny', label: 'Shiny Marker Tool'},
                {
                  actionName: 'gmax',
                  icon: 'pkg-dynamax',
                  label: 'Gigantamax Marker Tool',
                  status: gameSymbols.includes('gmax') ? undefined : 'hidden',
                },
                {
                  actionName: 'alpha',
                  icon: 'pkg-wild',
                  label: 'Alpha Marker Tool',
                  status: gameSymbols.includes('alpha') ? undefined : 'hidden',
                },
                null,
                {
                  actionName: 'all-marks',
                  icon: 'eye',
                  label: 'Show All (Read-only)',
                },
                {
                  actionName: 'no-marks',
                  icon: 'eye-blocked',
                  label: 'Hide Marks & Uncaught',
                },
              ]}
            />
          )}
          {isEditable && (
            <ToolbarButtonGroup
              initialAction={preset?.id || null}
              onButtonClick={handleChangePresetToolbar}
              isDropdown
              dropdownTitle={'Change Box Preset'}
              dropdownPosition={'middle'}
              dropdownNoActionIcon={<WandIcon />}
              items={Object.values(getPresetsForGame(dex.gameId))
                .filter((p) => !p.isHidden)
                .map((pr) => ({
                  actionName: pr.id,
                  label: pr.name,
                  title: pr.description,
                  status: pr.id === preset?.id ? 'selected' : null,
                }))}
            />
          )}

          <ToolbarButtonGroup
            initialAction={null}
            isDropdown
            isMultiple
            dropdownNoActionIcon={<Settings2Icon />}
            onButtonClick={handleSettingsToolbar}
            dropdownTitle={'Shiny options'}
            dropdownPosition={'left'}
            isDeselectable={false}
            items={(() => {
              return [
                {
                  actionName: 'toggle-showRegularBoxes',
                  icon: <>{showRegularBoxes ? <ToggleRightIcon /> : <ToggleLeftIcon />}</>,
                  label: showRegularBoxes ? 'Show non-shiny' : 'Show non-shiny',
                  status: showRegularBoxes ? 'selected' : null,
                  title: 'Show shiny boxes mixed with the non-shiny ones',
                  className: styles.saveBtn,
                  showLabel: true,
                },
                {
                  actionName: 'toggle-showShinyBoxes',
                  icon: <>{showShinyBoxes ? <ToggleRightIcon /> : <ToggleLeftIcon />}</>,
                  label: showShinyBoxes ? 'Show shiny' : 'Show shiny',
                  status: showShinyBoxes ? 'selected' : null,
                  className: styles.saveBtn,
                  showLabel: true,
                },
                {
                  actionName: 'toggle-shinyAfterRegular',
                  icon: <>{shinyAfterRegular ? <ToggleRightIcon /> : <ToggleLeftIcon />}</>,
                  label: shinyAfterRegular ? 'Shiny after non-shiny' : 'Shiny after non-shiny',
                  status: shinyAfterRegular && showShinyBoxes ? 'selected' : showShinyBoxes ? null : 'disabled',

                  title: 'Show shiny Pokémon boxes after the regular ones, instead of mixing them',
                  className: styles.saveBtn,
                  showLabel: true,
                },
                null,
                {
                  actionName: 'toggle-marks',
                  icon: 'eye',
                  status: markTypes.length > 0 ? 'selected' : null,
                  label: 'Toggle Marks & Uncaught',
                  className: styles.saveBtn,
                  showLabel: true,
                },
              ]
            })()}
          />
          {isEditable && (
            <ToolbarButtonGroup
              initialAction={null}
              isDropdown
              isMultiple
              dropdownNoActionIcon={<BracesIcon />}
              dropdownPosition={isEditable ? 'right' : 'left'}
              onButtonClick={handleSettingsToolbar}
              dropdownTitle={'Tools'}
              isDeselectable={false}
              items={(() => {
                return toolbarWrenchTools
              })()}
            />
          )}
          {isEditable && (
            <ToolbarButtonGroup items={[]} initialAction={null} className={styles.linkToolbarBtn} isMultiple>
              <ToolbarButton actionName={''}>
                <SiteLink
                  data-tooltip="View Missing Pokémon"
                  data-flow="bottom"
                  href={'/apps/livingdex/missing#g-' + dex.gameId}
                >
                  <i className={'icon-pkg-wild'} />
                </SiteLink>
              </ToolbarButton>
            </ToolbarButtonGroup>
          )}
        </ToolbarButtonGroupGroup>
        {isEditable && (
          <>
            <ToolbarButtonGroupGroup position="right" className={styles.saveBtnGroup}>
              <ToolbarButtonGroup
                initialAction={null}
                onButtonClick={handleSave}
                items={(() => {
                  //let icon = undefined
                  let icon = 'floppy-disk'
                  let text: string | undefined = ''
                  let status: ToolbarButtonStatus = null
                  if (savingState === 'saving') {
                    // icon = undefined
                    icon = 'spinner'
                    status = 'loading'
                    text = 'Saving...'
                  } else if (savingState === 'saved') {
                    icon = 'checkmark' // 'cloud-check'
                    status = 'success'
                    text = undefined //'Saved!'
                  } else if (savingState === 'error') {
                    icon = 'cross' // 'cloud-check'
                    status = 'error'
                    text = 'Error' //'Saved!'
                  } else if (dex.id) {
                    return []
                  }
                  return [
                    {
                      actionName: 'upload',
                      icon: icon,
                      label: text,
                      status: status,
                      className: styles.saveBtn,
                      showLabel: true,
                    },
                  ]
                })()}
              />
            </ToolbarButtonGroupGroup>
          </>
        )}
      </div>
    </div>
  )

  ReactModal.setAppElement('#__next')

  const removeDexModal = (
    <ReactModal
      isOpen={showRemoveModal}
      style={{ zIndex: 9999 } as any}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => {
        document.body.classList.remove('ReactModal__Body--open')
        setShowRemoveModal(false)
      }}
      contentElement={() => {
        return (
          <div className={'modal-content-wrapper text-center'}>
            <div className={'modal-dialog'}>
              <div className={'modal-dialog-message'}>
                Are you sure you want to remove this Living Dex and all its progress?
                <br /> This operation cannot be undone.
              </div>
              <div className={'modal-dialog-buttons'}>
                <div className={'text-center'}>
                  <Button
                    onClick={() => {
                      setShowRemoveModal(false)
                    }}
                  >
                    Keep it
                  </Button>
                  <Button onClick={handleRemoveDex} style={{ background: '#de1515' }}>
                    Sure, remove it
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    />
  )

  let genericModal = null
  const BoxGroupComponent = showMixedShinies ? PkBoxGroupShinyMixed : PkBoxGroup

  if (modalContent !== null) {
    genericModal = (
      <ReactModal
        isOpen={true}
        style={{ zIndex: 9999, overflow: 'auto' } as any}
        shouldCloseOnEsc={true}
        shouldCloseOnOverlayClick={false}
        onRequestClose={() => {
          document.body.classList.remove('ReactModal__Body--open')
          setModalContent(null)
        }}
        contentElement={() => {
          return (
            <div className={'modal-content-wrapper text-center'}>
              <div className={'modal-dialog'}>
                <div className={'modal-dialog-message'}>{modalContent?.content}</div>
                <div className={'modal-dialog-buttons'}>
                  <div className={'text-center'}>
                    {modalContent?.cancelButton && (
                      <Button
                        onClick={() => {
                          if (modalContent?.onCancel) {
                            modalContent.onCancel()
                          }
                          setModalContent(null)
                        }}
                      >
                        {modalContent.cancelButton || 'Cancel'}
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        if (modalContent?.onConfirm) {
                          modalContent.onConfirm()
                        }
                        setModalContent(null)
                      }}
                      style={{ background: '#de8715' }}
                    >
                      {modalContent?.confirmButton || 'Confirm'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      />
    )
  }

  const hasAllMarks = markTypes.length === allMarkTypes.length

  return (
    <>
      {toolbar}
      {isEditable && removeDexModal}
      {genericModal !== null && genericModal}

      <div className={'text-center ' + styles.toolbarApp}>
        <div className={'inner-container bordered-container bg-blueberry-secondary text-center ' + styles.dexHeader}>
          <div className={styles.dexLogo}>
            <GameLogo game={dex.gameId} size={160} asSwitchIcon={true} />
          </div>
          <div className={styles.dexInfo}>
            <h2 className={styles.dexTitle}>
              {isEditable && (
                <InlineTextEditor maxLength={config.limits.maxDexTitleSize} afterEdit={handleDexTitleChange}>
                  {dex.title}
                </InlineTextEditor>
              )}
              {!isEditable && dex.title}
            </h2>
            <div className={styles.presetName}>
              <i>{preset?.name}</i>
            </div>
            <div className={styles.counters}>
              {dex.boxes.length > 2 && (
                <span className={styles.counter}>
                  <i className="icon-pkg-box" /> {dex.boxes.length / 2}*
                </span>
              )}
              <span className={styles.counter}>
                <i className="icon-pkg-pokedex" /> {dex.caughtRegular} / {dex.totalRegular}
                {dex.caughtRegular === dex.totalRegular && <i className={'icon-pkg-ribbon'} />}
              </span>
              {hasShinyMode && dex.totalShiny > 0 && (
                <span className={styles.counter}>
                  <i className="icon-pkg-shiny" /> {dex.caughtShiny} / {dex.totalShiny}
                  {dex.caughtShiny === dex.totalShiny && <i className={'icon-pkg-ribbon'} />}
                </span>
              )}
            </div>
            <div>
              {lastSavedAtString && <time className={styles.timestamp}>Last saved at: {lastSavedAtString}</time>}
            </div>
            <div>
              {saveError && (
                <span className={styles.errorbox}>
                  ❌ There was an issue when saving: <br />"{String(saveError)}"
                </span>
              )}
            </div>
          </div>
        </div>

        {dex.id ? (
          <div className={'inner-container text-center ' + styles.socialLinksBanner}>
            <DexSocialLinks
              shareAsOwner={isEditable}
              dexId={dex.id}
              className={styles.socialLinks + ' dexSocialLinks'}
            />
          </div>
        ) : (
          <>
            <br />
            <br />
          </>
        )}

        <BoxGroupComponent
          dex={dex}
          perPage={2}
          showShiny={showShinyBoxes}
          showNonShiny={showRegularBoxes}
          shinyAfterRegular={shinyAfterRegular}
          selectMode={selectMode}
          viewMode={viewMode}
          usePixelIcons={false}
          revealPokemon={hasAllMarks}
          editable={isEditable}
          markTypes={markTypes}
          onBoxTitleEdit={isEditable ? handleBoxTitleEdit : undefined}
          onBoxClick={isEditable ? handleBoxClick : undefined}
          onPokemonClick={isEditable ? handlePkmClick : undefined}
        />

        {isEditable && dex.id && (
          <div className={'page-container'}>
            <br />
            <br />
            <br />
            <Button
              onClick={() => {
                setShowRemoveModal(true) // TODO convert to a ModalButton component
              }}
              style={{
                background: 'rgba(222,21,21,0.56)',
                border: '1px solid rgba(0,0,0.3)',
                padding: '0.5rem',
              }}
            >
              Delete Dex
            </Button>
          </div>
        )}
      </div>
      {dex.boxes.length > 2 && (
        <p className="text-center" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <small>
            <i>
              <span>
                <sup>(*) </sup>
                {dex.boxes.length / 2} boxes are needed for each mode (regular and shiny), a total of {dex.boxes.length}{' '}
                boxes.
                <br />
                <br />
              </span>
              Be aware that the maximum number of boxes for this game is {gameSet.storage?.boxes}, meaning that you can
              only store {(gameSet.storage?.boxes || Number.NaN) * (gameSet.storage?.boxCapacity || Number.NaN)} Pokémon
              in total + 6 in your party.
            </i>
          </small>
        </p>
      )}
    </>
  )
}
