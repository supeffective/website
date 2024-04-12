import { NextRouter } from 'next/router'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { LoadedDex } from '@/features/livingdex/repository/types'
import { isDevelopmentEnv } from '@/lib/utils/env'
import { getSearchParams, setNextRouterQueryParam } from '@/lib/utils/query-string'

import { MarkType, SelectMode, ViewMode } from '../components/pkm-box/pkBoxTypes'
import { UseDexesResult } from '../hooks/useDexes'

type ActionTool = MarkType | 'all-marks' | 'no-marks' | null // | 'move' | 'delete'
type SyncState = 'changed' | 'synced'
type SavingState = 'ready' | 'saving' | 'saved' | 'error'

const defaultMark: MarkType = 'catch'
const defaultTool: ActionTool = 'catch'
const defaultViewMode: ViewMode = 'boxed'

enum QueryParams {
  marks = 'marks',
  viewMode = 'mode',
  showRegularBoxes = 'nonshiny',
  showShinyBoxes = 'shiny',
  shinyAfterRegular = 'shinyafter',
}

export type LivingDexToolbarState = {
  marks: MarkType[]
  savingState: SavingState
  syncState: SyncState
  selectMode: SelectMode
  currentTool: ActionTool
  viewMode: ViewMode
  showRegularBoxes: boolean
  showShinyBoxes: boolean
  shinyAfterRegular: boolean
  lastSavedAt: Date | null
}

export type LivingDexToolbarActions = {
  setMarks: (marks: MarkType[], context: LivingDexToolbarStoreContext) => void
  setViewMode: (viewMode: ViewMode, context: LivingDexToolbarStoreContext) => void
  setSavingState: (savingState: SavingState, context: LivingDexToolbarStoreContext) => void
  setSyncState: (syncState: SyncState, context: LivingDexToolbarStoreContext) => void
  setSelectMode: (selectMode: SelectMode, context: LivingDexToolbarStoreContext) => void
  setCurrentTool: (currentTool: ActionTool, context: LivingDexToolbarStoreContext) => void
  setShowRegularBoxes: (showRegularBoxes: boolean, context: LivingDexToolbarStoreContext) => void
  setShowShinyBoxes: (showShinyBoxes: boolean, context: LivingDexToolbarStoreContext) => void
  setShinyAfterRegular: (shinyAfterRegular: boolean, context: LivingDexToolbarStoreContext) => void
  setLastSavedAt: (lastSavedAt: Date | null, context: LivingDexToolbarStoreContext) => void
}

export type LivingDexToolbarStore = LivingDexToolbarState & LivingDexToolbarActions

export type LivingDexToolbarStoreContext = {
  router: NextRouter
  dex: LoadedDex
  dexesApi: UseDexesResult
}

export const availableMarks: MarkType[] = ['catch', 'shiny', 'gmax', 'alpha']

export const useLivingDexToolbarStore = create(
  devtools<LivingDexToolbarStore>(
    (set) => {
      return {
        marks: getSearchParams(QueryParams.marks, defaultMark).split(',') as MarkType[],
        setMarks: (marks, context) => {
          return set(
            (state) => {
              setNextRouterQueryParam(context.router, QueryParams.marks, marks.join(','))
              return { marks }
            },
            false,
            'setMarks',
          )
        },
        viewMode: getSearchParams(QueryParams.viewMode, defaultViewMode) as ViewMode,
        setViewMode: (viewMode, context) => {
          return set(
            (state) => {
              setNextRouterQueryParam(context.router, QueryParams.viewMode, viewMode)
              return { viewMode }
            },
            false,
            'setViewMode',
          )
        },
        shinyAfterRegular: getSearchParams(QueryParams.shinyAfterRegular, '1') === '1',
        setShinyAfterRegular: (shinyAfterRegular, context) => {
          return set(
            (state) => {
              setNextRouterQueryParam(context.router, QueryParams.shinyAfterRegular, shinyAfterRegular ? '1' : '0')
              return { shinyAfterRegular }
            },
            false,
            'setShinyAfterRegular',
          )
        },
        showRegularBoxes: getSearchParams(QueryParams.showRegularBoxes, '1') === '1',
        setShowRegularBoxes: (showRegularBoxes, context) => {
          return set(
            (state) => {
              setNextRouterQueryParam(context.router, QueryParams.showRegularBoxes, showRegularBoxes ? '1' : '0')
              return { showRegularBoxes }
            },
            false,
            'setShowRegularBoxes',
          )
        },
        showShinyBoxes: getSearchParams(QueryParams.showShinyBoxes, '1') === '1',
        setShowShinyBoxes: (showShinyBoxes, context) => {
          return set(
            (state) => {
              setNextRouterQueryParam(context.router, QueryParams.showShinyBoxes, showShinyBoxes ? '1' : '0')
              return { showShinyBoxes }
            },
            false,
            'setShowShinyBoxes',
          )
        },
        savingState: 'ready',
        setSavingState: (savingState, context) => {
          return set(
            (state) => {
              return { savingState }
            },
            false,
            'setSavingState',
          )
        },
        syncState: 'synced',
        setSyncState: (syncState, context) => {
          return set(
            (state) => {
              return { syncState }
            },
            false,
            'setSyncState',
          )
        },
        selectMode: 'cell',
        setSelectMode: (selectMode, context) => {
          return set(
            (state) => {
              return { selectMode }
            },
            false,
            'setSelectMode',
          )
        },
        currentTool: defaultTool,
        setCurrentTool: (currentTool, context) => {
          return set(
            (state) => {
              return { currentTool }
            },
            false,
            'setCurrentTool',
          )
        },
        lastSavedAt: null,
        setLastSavedAt: (lastSavedAt, context) => {
          return set(
            (state) => {
              return { lastSavedAt }
            },
            false,
            'setLastSavedAt',
          )
        },
      } satisfies LivingDexToolbarStore
    },
    {
      name: 'LivingDexToolbarStore',
      enabled: isDevelopmentEnv(),
      // store: 'livingDexToolbarStore',
    },
  ),
)
