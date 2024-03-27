export const LIVINGDEX_DOC_SPEC_VERSIONS = ['v4'] as const

export type LivingDexDocSpecVersion = (typeof LIVINGDEX_DOC_SPEC_VERSIONS)[number]

export const LIVINGDEX_DOC_SPEC_VERSION_LAST: LivingDexDocSpecVersion = 'v4'

export const LIVINGDEX_DOC_SPEC_PROP_TYPES = [
  'boolean',
  'number',
  'number[]',
  'number:int',
  'number:int[]',
  'string',
  'string[]',
  'string:slug',
  'string:slug[]',
  'string:text',
] as const

export type LivingDexDocSpecPropType = (typeof LIVINGDEX_DOC_SPEC_PROP_TYPES)[number]

export interface DeserializedLivingDexDoc extends LivingDexDocMeta {
  boxes: LivingDexDocBox[]
}

export interface LivingDexDocMeta {
  $id?: string
  format: LivingDexDocSpecVersion
  title: string
  gameId: string
  ownerId: string
  creationTime: string
  lastUpdateTime: string
  legacyPresetId?: string
  legacyPresetVersion?: number
}

export type LivingDexDocBoxByFormat<T extends LivingDexDocSpecVersion> = T extends 'v4' ? LivingDexDocBox : never

export interface LivingDexDocBox {
  title: string
  shiny: boolean
  pokemon: (LivingDexDocPokemon | null)[]
}

export interface LivingDexDocPokemon {
  id: string
  captured: boolean
  shiny: boolean
  originMark?: string
  nature?: string
  pokerus?: 'infected' | 'cured'
  level?: number
  dynamaxLevel?: number
  teraType?: string
  ball?: string
  item?: string
  language?: string
  evs: [number, number, number, number, number, number] | []
  ivs: [number, number, number, number, number, number] | []
  moves: [string, string, string, string] | []
  emblemMarks: string[]
}

// export interface LivingDexDocGameConfig {
//   gameId: string
//   boxes: number
//   boxCapacity: number
// }

export interface LivingDexDocSpecConfig {
  version: LivingDexDocSpecVersion
  arrayDelimiters: [string, string]
  arraySeparator: string
  propertySeparator: string
  boxPrefix: string
  pokemonPrefix: string
  boxProperties: [keyof LivingDexDocBox, LivingDexDocSpecPropType][]
  pokemonProperties: [keyof LivingDexDocPokemon, LivingDexDocSpecPropType][]
}

export type LivingDexDocSpecs = Map<LivingDexDocSpecVersion, LivingDexDocSpecConfig>
