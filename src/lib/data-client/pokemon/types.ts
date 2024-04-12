import { SimpleSearchIndex } from '@/lib/utils/search/SimpleSearchIndex'

export interface RawLegacyPokemonEntry {
  id: string
  nid: string
  dexNum: number
  formId: string | null
  name: string
  formName: string | null
  region: string
  generation: number
  type1: string
  type2: string | null
  color: PokemonColor | string
  isDefault: boolean
  isForm: boolean
  isSpecialAbilityForm: boolean
  isCosmeticForm: boolean
  isFemaleForm: boolean
  hasGenderDifferences: boolean
  isBattleOnlyForm: boolean
  isSwitchableForm: boolean
  isMega: boolean
  isPrimal: boolean
  isGmax: boolean
  canGmax: boolean
  canDynamax: boolean
  canBeAlpha: boolean
  debutIn: string
  obtainableIn: string[]
  versionExclusiveIn: string[]
  eventOnlyIn: string[]
  storableIn: string[]
  shinyReleased: boolean
  shinyBase: null | string
  baseSpecies: null | string
  forms: string[] | null
  refs: {
    bulbapedia: string
    serebii: string
    smogon: string
    showdown: string
  }
}

export interface PokemonBaseStats {
  hp: number
  atk: number
  def: number
  spa: number
  spd: number
  spe: number
}

export interface PokemonGoBaseStats {
  atk: number
  def: number
  sta: number
}

export enum PokemonColor {
  Black = 'black',
  Blue = 'blue',
  Brown = 'brown',
  Gray = 'gray',
  Green = 'green',
  Pink = 'pink',
  Purple = 'purple',
  Red = 'red',
  White = 'white',
  Yellow = 'yellow',
}

export type PokemonEntry = {
  id: string
  nid: string
  dexNum: number | null
  name: string
  type1: string
  type2: string | null
  color: PokemonColor
  shiny: {
    base: string | null
    released: boolean
  }
  form: {
    isForm: boolean
    baseSpecies: string | null
    // baseForms: string[]
    isFemaleForm: boolean
    isMaleForm: boolean
    hasGenderForms: boolean
    hasGmax: boolean
    isGmax: boolean
  }
  location: {
    obtainableIn: string[]
    // versionExclusiveIn: string[]
    eventOnlyIn: string[]
    storableIn: string[]
  }
  refs: {
    bulbapedia: string
    serebii: string
    smogon: string
    showdown: string
  }
}

export type PokemonEntryMap = Map<string, PokemonEntry>
export type PokemonEntrySearchIndex = SimpleSearchIndex<PokemonEntry[]>
