export type LegacyGameSetSymbol =
  | 'caught'
  | 'shiny'
  | 'pokerus'
  | 'pokerus_cured'
  | 'gmax'
  | 'alpha'
  | 'shadow'
  | 'purified'
  | 'apex'

export type LegacyGameSet = {
  id: string
  name: string
  codename: null | string
  superset: string
  generation: number
  releaseDate: string
  games: Record<string, string>
  platforms: string[]
  series: string
  region: string
  originMark: string
  pokedexes: string[]
  hasShinies: boolean
  nationalMaxNum: number | null
  storage: {
    boxes: number
    boxCapacity: number
    symbols: LegacyGameSetSymbol[]
  }
  nationalDex?: null
}

export type LegacyGameSetDict = Record<string, LegacyGameSet>
