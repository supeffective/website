export type PresetDexPokemon =
  | {
      pid: string
      caught?: boolean
      shiny?: boolean
      shinyLocked?: boolean
      gmax?: boolean
      alpha?: boolean
    }
  | string

export type NullablePresetDexPokemon = PresetDexPokemon | null

export type PresetDexBox = {
  title?: string
  pokemon: NullablePresetDexPokemon[]
}

export type PresetDex = {
  id: string
  name: string
  version: number
  game?: string | undefined
  gameSet: string
  description: string
  isHidden?: boolean
  boxes: PresetDexBox[]
}

export type PresetDexMap = Record<string, Record<string, PresetDex>>
