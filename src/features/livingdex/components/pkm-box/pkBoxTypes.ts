import { DexBox, LoadedDex, NullableDexPokemon, PkFilter } from '@/features/livingdex/repository/types'

export type SelectMode = 'all' | 'box' | 'cell'
export type ViewMode = 'boxed' | 'listed'
export type MarkType = 'catch' | 'shiny' | 'alpha' | 'gmax' | 'ability' | 'gender'

export interface PkBoxCellProps {
  boxIndex: number
  pokemonIndex: number
  pokemonData: NullableDexPokemon
  children?: any
  tabIndex?: number | undefined
  title?: string
  image?: any
  caption?: any
  className?: string
  revealPokemon: boolean
  onClick?: (boxIndex: number, pokemonIndex: number, pokemonData: NullableDexPokemon) => void
  selectMode: SelectMode
  viewMode: ViewMode
}

export interface PkBoxProps {
  boxIndex: number
  boxData: DexBox
  children: any[]
  tabIndex?: number | undefined
  title: string
  isOverflowing?: boolean
  className?: string
  onClick?: (boxIndex: number, boxData: DexBox) => void
  editable: boolean
  onBoxTitleEdit?: (boxIndex: number, newTitle: string) => void
  selectMode: SelectMode
  viewMode: ViewMode
  shiny: boolean
}

export interface PkBoxGroupProps {
  dex: LoadedDex
  selectMode: SelectMode
  showNonShiny: boolean
  shinyAfterRegular: boolean
  showShiny: boolean
  viewMode: ViewMode
  usePixelIcons: boolean
  revealPokemon: boolean
  onBoxClick?: (boxIndex: number, boxData: DexBox) => void
  onPokemonClick?: (boxIndex: number, pokemonIndex: number, pokemonData: NullableDexPokemon) => void
  editable: boolean
  onBoxTitleEdit?: (boxIndex: number, newTitle: string) => void
  markTypes: MarkType[]
  perPage: number
}

export interface PkBoxGroupFilterProps {
  onChange: (filter: PkFilter) => void
}

export interface PkBoxGroupState {
  filter: PkFilter | null
}
