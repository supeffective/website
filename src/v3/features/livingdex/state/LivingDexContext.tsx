import { ReactNode, createContext, useReducer } from 'react'

import { isCatchable, recalculateCounters } from '@/v3/features/livingdex/repository'
import { normalizeDexWithPreset } from '@/v3/features/livingdex/repository/presets/normalizeDexWithPreset'
import { PresetDex } from '@/v3/features/livingdex/repository/presets/types'
import { LoadedDex, LoadedDexList, NullableDexPokemon } from '@/v3/features/livingdex/repository/types'

// ===========================
//          TYPES
// ===========================

interface LivingDexContextAction {
  type:
    | 'CHANGE_PRESET'
    | 'SET_DEXES'
    | 'SET_DEX'
    | 'RESET_DEX'
    | 'SET_DEX_TITLE'
    | 'SET_BOX_TITLE'
    | 'ADD_BOX'
    | 'ADD_POKEMON'
    | 'REMOVE_BOX'
    | 'REMOVE_POKEMON'
    | 'CATCH_BOX'
    | 'CATCH_POKEMON'
    | 'SHINIFY_BOX'
    | 'SHINIFY_POKEMON'
    | 'GMAXIZE_BOX'
    | 'GMAXIZE_POKEMON'
    | 'ALPHAIZE_BOX'
    | 'ALPHAIZE_POKEMON'
  payload?: LoadedDex | string | any | null
}

export interface LivingDexState {
  currentDex: number | null
  userDexes: LoadedDexList | null
}

export interface LivingDexContextType {
  state: LoadedDex | null
  stateV2: LivingDexState
  actions: {
    getCurrentDex: () => LoadedDex | null
    setDexes: (dexes: LoadedDexList | null) => void
    changePreset: (preset: PresetDex) => void
    setDex: (dex: LoadedDex) => void
    resetDex: () => void
    setDexTitle: (title: string) => void
    setBoxTitle: (boxIndex: number, title: string) => void
    shinifyBox: (boxIndex: number, value: boolean) => void
    shinifyPokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => void
    // selectBox: (boxIndex: number, value: boolean) => void,
    // selectPokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => void,
    catchBox: (boxIndex: number, value: boolean) => void
    catchPokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => void
    gmaxizeBox: (boxIndex: number, value: boolean) => void
    gmaxizePokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => void
    alphaizeBox: (boxIndex: number, value: boolean) => void
    alphaizePokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => void
  }
}

export const withCountedPokemon = (state: LoadedDex | null): LoadedDex | null => {
  if (state === null) {
    return null
  }

  return recalculateCounters(state)
}

// ===========================
//        Initial Values
// ===========================

const initialState: LoadedDex | null = null
const initialStateV2: LivingDexState = {
  currentDex: null,
  userDexes: null,
}

const initialContext: LivingDexContextType = {
  state: initialState,
  stateV2: initialStateV2,
  actions: {
    getCurrentDex: () => null,
    setDexes: () => {},
    changePreset: () => {},
    setDex: () => null,
    resetDex: () => null,
    setDexTitle: () => null,
    setBoxTitle: () => null,
    shinifyPokemon: () => null,
    shinifyBox: () => null,
    catchBox: () => null,
    catchPokemon: () => null,
    gmaxizeBox: () => null,
    gmaxizePokemon: () => null,
    alphaizeBox: () => null,
    alphaizePokemon: () => null,
  },
}

const changePokemonProperty = (
  state: LoadedDex | null,
  boxIndex: number,
  pokemonIndex: number,
  property: string,
  value: any,
) => {
  if (state === null) {
    return null
  }

  const pkm: NullableDexPokemon = state.boxes[boxIndex].pokemon[pokemonIndex] || null
  if (pkm === null) {
    return state
  }

  if (property === 'caught' && !isCatchable(pkm)) {
    return state
  }

  if (property === 'shiny') {
    return state
  }

  const newState = { ...state }
  // @ts-ignore
  newState.boxes[boxIndex].pokemon[pokemonIndex][property] = value
  return newState
}

const changeBoxAllPokemonProperty = (state: LoadedDex | null, boxIndex: number, property: string, value: any) => {
  if (state === null) {
    return null
  }
  const newState = { ...state }
  // @ts-ignore
  newState.boxes[boxIndex].pokemon = newState.boxes[boxIndex].pokemon.map((pokemon) => {
    if (pokemon) {
      if (property === 'caught' && !isCatchable(pokemon)) {
        return pokemon
      }
      if (property === 'shiny') {
        return pokemon
      }
      // @ts-ignore
      pokemon[property] = value
    }
    return pokemon
  })
  return newState
}

const changeBoxProperty = (state: LoadedDex | null, boxIndex: number, property: string, value: any) => {
  if (state === null) {
    return null
  }
  const newState = { ...state }
  // @ts-ignore
  newState.boxes[boxIndex][property] = value
  return newState
}

// ===========================
//      Action Reducer
// ===========================

const livingDexActionReducer = (state: LoadedDex | null, action: LivingDexContextAction): LoadedDex | null => {
  const { type, payload } = action
  switch (type) {
    case 'CHANGE_PRESET':
      if (state === null) {
        return null
      }
      return normalizeDexWithPreset(state, payload)
    case 'SET_DEX':
      // TODO update dexes list here if the dex is new (not in the list)
      return withCountedPokemon(payload)
    case 'RESET_DEX':
      return initialState
    case 'SHINIFY_POKEMON':
      return withCountedPokemon(
        changePokemonProperty(state, payload.boxIndex, payload.pokemonIndex, 'shiny', payload.value),
      )
    case 'CATCH_POKEMON':
      return withCountedPokemon(
        changePokemonProperty(state, payload.boxIndex, payload.pokemonIndex, 'caught', payload.value),
      )
    case 'CATCH_BOX':
      return withCountedPokemon(changeBoxAllPokemonProperty(state, payload.boxIndex, 'caught', payload.value))
    case 'SHINIFY_BOX':
      return withCountedPokemon(changeBoxAllPokemonProperty(state, payload.boxIndex, 'shiny', payload.value))
    case 'SET_DEX_TITLE':
      return state ? { ...state, title: payload } : null
    case 'SET_BOX_TITLE':
      return changeBoxProperty(state, payload.boxIndex, 'title', payload.value)
    case 'GMAXIZE_POKEMON':
      return changePokemonProperty(state, payload.boxIndex, payload.pokemonIndex, 'gmax', payload.value)
    case 'GMAXIZE_BOX':
      return changeBoxAllPokemonProperty(state, payload.boxIndex, 'gmax', payload.value)
    case 'ALPHAIZE_POKEMON':
      return changePokemonProperty(state, payload.boxIndex, payload.pokemonIndex, 'alpha', payload.value)
    case 'ALPHAIZE_BOX':
      return changeBoxAllPokemonProperty(state, payload.boxIndex, 'alpha', payload.value)
    default:
      return state
  }
}

// ===========================
//    Context and Provider
// ===========================
const LivingDexContext = createContext<LivingDexContextType>(initialContext)

const LivingDexProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(livingDexActionReducer, initialState)

  // Define the actions API and payload messages
  const ctxValue = {
    state,
    stateV2: initialStateV2, // TODO initialStateV2
    actions: {
      getCurrentDex: (): LoadedDex | null => {
        return state
      },
      setDexes: (dexes: LoadedDexList | null) => dispatch({ type: 'SET_DEXES', payload: dexes }),
      setDex: (dex: LoadedDex) => dispatch({ type: 'SET_DEX', payload: dex }),
      resetDex: () => dispatch({ type: 'RESET_DEX' }),
      setDexTitle: (title: string) => dispatch({ type: 'SET_DEX_TITLE', payload: title }),
      setBoxTitle: (boxIndex: number, title: string) => {
        if (state !== null) {
          // tracker.dexBoxTitleChanged(state.gameId)
        }
        return dispatch({
          type: 'SET_BOX_TITLE',
          payload: { boxIndex, value: title },
        })
      },
      shinifyPokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => {
        dispatch({
          type: 'SHINIFY_POKEMON',
          payload: { boxIndex, pokemonIndex, value },
        })
      },
      shinifyBox: (boxIndex: number, value: boolean) => {
        dispatch({
          type: 'SHINIFY_BOX',
          payload: { boxIndex, value },
        })
      },
      catchBox: (boxIndex: number, value: boolean) => {
        dispatch({
          type: 'CATCH_BOX',
          payload: { boxIndex, value },
        })
      },
      catchPokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => {
        dispatch({
          type: 'CATCH_POKEMON',
          payload: { boxIndex, pokemonIndex, value },
        })
      },
      gmaxizePokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => {
        dispatch({
          type: 'GMAXIZE_POKEMON',
          payload: { boxIndex, pokemonIndex, value },
        })
      },
      gmaxizeBox: (boxIndex: number, value: boolean) => {
        dispatch({
          type: 'GMAXIZE_BOX',
          payload: { boxIndex, value },
        })
      },
      alphaizePokemon: (boxIndex: number, pokemonIndex: number, value: boolean) => {
        dispatch({
          type: 'ALPHAIZE_POKEMON',
          payload: { boxIndex, pokemonIndex, value },
        })
      },
      alphaizeBox: (boxIndex: number, value: boolean) => {
        dispatch({
          type: 'ALPHAIZE_BOX',
          payload: { boxIndex, value },
        })
      },
      changePreset: (preset: PresetDex) => {
        dispatch({
          type: 'CHANGE_PRESET',
          payload: preset,
        })
      },
    },
  }

  return <LivingDexContext.Provider value={ctxValue}>{children}</LivingDexContext.Provider>
}

export { LivingDexContext, LivingDexProvider }
