import {
  BracesIcon,
  ListTodoIcon,
  Settings2Icon,
  ToggleLeftIcon,
  ToggleRightIcon,
  TrashIcon,
  WandIcon,
} from 'lucide-react'
import { useRouter } from 'next/compat/router'
import { NextRouter } from 'next/router'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import ReactModal from 'react-modal'

import PkImgFile from '@/features/livingdex/components/PkImgFile'
import {
  ToolbarButtonGroup,
  ToolbarButtonGroupChildProps,
  ToolbarButtonGroupGroup,
  ToolbarButtonStatus,
} from '@/features/livingdex/components/ToolbarButton'
import { DeserializedLivingDexDoc } from '@/features/livingdex/parser'
import { convertDexFromLegacyToV4, convertDexFromV4ToLegacyStd } from '@/features/livingdex/parser/support'
import { convertStorableDexToLoadedDex } from '@/features/livingdex/repository/converters/convertStorableDexToLoadedDex'
import { getPresetByIdForGame, getPresetsForGame } from '@/features/livingdex/repository/presets'
import { normalizeDexWithPreset } from '@/features/livingdex/repository/presets/normalizeDexWithPreset'
import { PresetDex, PresetDexMap } from '@/features/livingdex/repository/presets/types'
import { LoadedDex } from '@/features/livingdex/repository/types'
import { useDexesContext } from '@/features/livingdex/state/LivingDexListContext'
import { useSession } from '@/features/users/auth/hooks/useSession'
import Button from '@/lib/components/Button'
import { LoadingBanner } from '@/lib/components/panels/LoadingBanner'
import { getGameSetByGameId } from '@/lib/data-client/game-sets'
import { useScrollToLocation } from '@/lib/hooks/useScrollToLocation'
import { slugify } from '@/lib/utils/strings'

import { MarkType, SelectMode, ViewMode } from '../components/pkm-box/pkBoxTypes'
import { LivingDexContext } from '../state/LivingDexContext'
import { LivingDexToolbarStoreContext, availableMarks, useLivingDexToolbarStore } from '../state/toolbarStore'
import styles from './LivingDexToolbar.module.css'

type ActionTool = MarkType | 'all-marks' | 'no-marks' | null // | 'move' | 'delete'
const defaultTool: ActionTool = 'catch'

export interface LivingDexToolbarProps {
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

export default function LivingDexToolbar({ loadedDex, presets, onSave }: LivingDexToolbarProps) {
  const router = useRouter()
  const dexesContext = useDexesContext()
  const livingdex = useContext(LivingDexContext)
  const auth = useSession()
  const toolbarStore = useLivingDexToolbarStore()

  console.log('toolbarStore', toolbarStore)

  // UI state
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)

  // Initializers
  const dex = livingdex.state
  const currentUser = auth.currentUser
  const { dexesLoading, saveDex, deleteDex } = dexesContext

  const numBoxes = loadedDex.boxes.length || 0
  const defaultViewMode = numBoxes > 2 ? 'boxed' : 'listed'

  const [viewMode, setViewMode] = useState<ViewMode>(readUrlParamRouter('mode', router, defaultViewMode) as ViewMode)

  const toolbarContext: LivingDexToolbarStoreContext = {
    dex: loadedDex,
    dexesApi: dexesContext,
    router: router!,
  }

  const app = new Proxy(livingdex.actions, {
    get(target, prop) {
      if (['setDex', 'getCurrentDex', 'setDexes', 'resetDex'].includes(prop as string)) {
        return target[prop as keyof typeof livingdex.actions]
      }
      return (...args: any[]) => {
        toolbarStore.setSyncState('changed', toolbarContext)
        return (target[prop as keyof typeof livingdex.actions] as any)(...args)
      }
    },
  })

  // const [markTypes, setMarkTypes] = useState<MarkType[]>(initialMarkTypes)
  // console.log('markTypes', markTypes)

  const handleSavedState = () => {
    toolbarStore.setSyncState('synced', toolbarContext)
    toolbarStore.setSavingState('saved', toolbarContext)
    toolbarStore.setLastSavedAt(new Date(), toolbarContext)
    setTimeout(() => {
      toolbarStore.setSavingState('ready', toolbarContext)
    }, saveTimeout)
  }

  const handleSave = () => {
    if (!dex) {
      return
    }

    if (!dex.userId) {
      throw new Error('Cannot save dex without a logged in user')
    }
    if (toolbarStore.savingState !== 'ready') {
      return
    }

    toolbarStore.setSavingState('saving', toolbarContext)

    const isNewDex = dex.id === null || dex.id === undefined

    saveDex(dex)
      .then((updatedDex) => {
        if (updatedDex instanceof Error) {
          console.error('Failed to save', updatedDex)
          toolbarStore.setSavingState('error', toolbarContext)
          setSaveError(updatedDex)
          setTimeout(() => {
            toolbarStore.setSavingState('ready', toolbarContext)
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
            window.location.href = `/apps/livingdex/${updatedDex.id}`
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
        toolbarStore.setSavingState('error', toolbarContext)
        setSaveError(e)
        setTimeout(() => {
          toolbarStore.setSavingState('ready', toolbarContext)
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

    if (!auth.isAuthenticated || toolbarStore.savingState !== 'ready' || toolbarStore.syncState !== 'changed') {
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

  const handleExport = () => {
    const docSpec = convertDexFromLegacyToV4(dex)
    // download as text/plain blob:
    const blob = new Blob([JSON.stringify(docSpec, undefined, 2)], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const element = document.createElement('a')
    element.setAttribute('href', url)
    element.setAttribute('download', slugify(dex.title) + '.livingdex.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImport = () => {
    // open file dialog *.dex.json
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result !== 'string') {
          return
        }
        try {
          const data: DeserializedLivingDexDoc = JSON.parse(result)
          data.$id = dex.id

          if (data.gameId !== dex.gameId) {
            const errMsg = `The file you selected is not a valid Living Dex file for game '${dex.gameId}'.`
            alert('Error: ' + errMsg)
            throw new Error(errMsg)
          }

          if (data.legacyPresetId !== dex.presetId) {
            const errMsg = `The preset of this Dex and the one of the JSON file are different.`
            alert('Error: ' + errMsg)
            throw new Error(errMsg)
          }

          if (!currentUser) {
            throw new Error('Cannot import dex if not logged in')
          }

          const loadedDex = convertStorableDexToLoadedDex(convertDexFromV4ToLegacyStd(dex.id, currentUser.uid, data))
          app.setDex(loadedDex)

          setModalContent({
            title: 'Import successful',
            content: (
              <div>
                <p>The Living Dex has been imported successfully. You can now continue editing it.</p>
                <p>
                  <strong>Nothing will be saved until you do some change.</strong>
                </p>
              </div>
            ),
            confirmButton: 'OK',
            cancelButton: null,
            prevState: { dex, preset: preset as any },
          })
        } catch (e) {
          alert('The file you selected is not a valid Living Dex JSON file.')
          throw e
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleSettingsToolbar = (
    newAction: string | null,
    // prevState: string | null,
    // prevAction: string | null
  ) => {
    if (newAction === 'toggle-showRegularBoxes') {
      toolbarStore.setShowRegularBoxes(!toolbarStore.showRegularBoxes, toolbarContext)
      return
    }

    if (newAction === 'toggle-showShinyBoxes') {
      toolbarStore.setShowShinyBoxes(!toolbarStore.showShinyBoxes, toolbarContext)
      return
    }

    if (newAction === 'toggle-shinyAfterRegular') {
      toolbarStore.setShinyAfterRegular(!toolbarStore.shinyAfterRegular, toolbarContext)
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
    if (newAction === 'delete-dex') {
      setShowRemoveModal(true) // TODO convert to a ModalButton component
    }

    if (newAction === 'toggle-marks') {
      const routerMarks = readUrlParamRouter('marks', router, undefined)
      if (!routerMarks) {
        toolbarStore.setMarks(availableMarks, toolbarContext)
        return
      }

      setUrlParamRouter('marks', undefined, router)
      toolbarStore.setMarks([], toolbarContext)
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

  const handleSelectModeToolbar = (
    newAction: string | null,
    // prevState: string | null,
    // prevAction: string | null
  ) => {
    if (newAction === toolbarStore.selectMode || newAction === null) {
      return
    }
    toolbarStore.setSelectMode(newAction as SelectMode, toolbarContext)
  }

  const handleViewModeToolbar = (
    newAction: string | null,
    // prevState: string | null,
    // prevAction: string | null
  ) => {
    if (newAction === viewMode || viewMode === null) {
      return
    }
    if (toolbarStore.selectMode === 'box') {
      toolbarStore.setSelectMode('cell', toolbarContext)
    }
    setViewMode(newAction as ViewMode)
    setUrlParamRouter('mode', newAction, router)
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
  }

  const handleActionToolToolbar = (newAction: string | null) => {
    if (newAction === toolbarStore.currentTool) {
      return
    }
    if (newAction === 'all-marks') {
      toolbarStore.setMarks(availableMarks, toolbarContext)
    } else if (newAction === 'no-marks') {
      toolbarStore.setMarks([], toolbarContext)
    } else {
      toolbarStore.setMarks([newAction as MarkType], toolbarContext)
    }
    toolbarStore.setCurrentTool(newAction as ActionTool, toolbarContext)
  }

  const toolbarWrenchTools = [
    {
      actionName: 'import',
      icon: 'upload',
      label: 'Import JSON file',
      status: '',
      className: styles.saveBtn,
      showLabel: true,
    },
    {
      actionName: 'export',
      icon: 'download',
      label: 'Export as JSON',
      status: '',
      className: styles.saveBtn,
      showLabel: true,
    },
  ]

  const deleteDexToolbarItems: Array<ToolbarButtonGroupChildProps | null> =
    isEditable && dex.id
      ? [
          null,
          {
            actionName: 'delete-dex',
            icon: (
              <>
                <TrashIcon />
              </>
            ),
            label: 'Delete Dex',
            className: styles.dangerBtn,
            status: null,
            showLabel: true,
          },
        ]
      : []

  const toolbar = (
    <div id={'dex-' + dex.id} className={styles.toolbar}>
      <div className={styles.toolbarContainer}>
        <ToolbarButtonGroupGroup collapsed={true}>
          {/*Todo: fix button group internal state not updating when selectMode changes (initialAction related?)*/}
          {isEditable && viewMode !== 'boxed' && (
            <ToolbarButtonGroup
              initialAction={toolbarStore.selectMode}
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
              initialAction={toolbarStore.selectMode}
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
              initialAction={toolbarStore.currentTool}
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
                },
                // {actionName: 'shiny', icon: 'pkg-shiny', label: 'Shiny Marker Tool'},
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
                  icon: <>{toolbarStore.showRegularBoxes ? <ToggleRightIcon /> : <ToggleLeftIcon />}</>,
                  label: toolbarStore.showRegularBoxes ? 'Show non-shiny' : 'Show non-shiny',
                  status: toolbarStore.showRegularBoxes ? 'selected' : null,
                  title: 'Show shiny boxes mixed with the non-shiny ones',
                  className: styles.saveBtn,
                  showLabel: true,
                },
                {
                  actionName: 'toggle-showShinyBoxes',
                  icon: <>{toolbarStore.showShinyBoxes ? <ToggleRightIcon /> : <ToggleLeftIcon />}</>,
                  label: toolbarStore.showShinyBoxes ? 'Show shiny' : 'Show shiny',
                  status: toolbarStore.showShinyBoxes ? 'selected' : null,
                  className: styles.saveBtn,
                  showLabel: true,
                },
                {
                  actionName: 'toggle-shinyAfterRegular',
                  icon: <>{toolbarStore.shinyAfterRegular ? <ToggleRightIcon /> : <ToggleLeftIcon />}</>,
                  label: toolbarStore.shinyAfterRegular ? 'Shiny after non-shiny' : 'Shiny after non-shiny',
                  status:
                    toolbarStore.shinyAfterRegular && toolbarStore.showShinyBoxes
                      ? 'selected'
                      : toolbarStore.showShinyBoxes
                        ? null
                        : 'disabled',

                  title: 'Show shiny Pokémon boxes after the regular ones, instead of mixing them',
                  className: styles.saveBtn,
                  showLabel: true,
                },
                null,
                {
                  actionName: 'toggle-marks',
                  icon: 'eye',
                  status: toolbarStore.marks.length > 0 ? 'selected' : null,
                  label: 'Toggle Marks & Uncaught',
                  className: styles.saveBtn,
                  showLabel: true,
                },
                ...deleteDexToolbarItems,
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
        </ToolbarButtonGroupGroup>
        {isEditable && (
          <ToolbarButtonGroupGroup position="right" className={styles.saveBtnGroup}>
            <ToolbarButtonGroup
              initialAction={null}
              onButtonClick={handleSave}
              items={(() => {
                //let icon = undefined
                let icon = 'floppy-disk'
                let text: string | undefined = ''
                let status: ToolbarButtonStatus = null
                if (toolbarStore.savingState === 'saving') {
                  // icon = undefined
                  icon = 'spinner'
                  status = 'loading'
                  text = 'Saving...'
                } else if (toolbarStore.savingState === 'saved') {
                  icon = 'checkmark' // 'cloud-check'
                  status = 'success'
                  text = undefined //'Saved!'
                } else if (toolbarStore.savingState === 'error') {
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

  return (
    <>
      {toolbar}
      {isEditable && removeDexModal}
      {genericModal !== null && genericModal}
    </>
  )
}
