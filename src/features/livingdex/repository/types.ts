import { AuthUserState, SessionMembership } from '@/features/users/auth/types'
import { BaseUserDocument } from '@/prisma/types'

export const DEX_SCHEMA_VERSION = 3

export type DexPokemon = {
  pid: string
  nid: string
  caught: boolean
  gmax: boolean
  alpha: boolean
  shiny: boolean
  // post load props:
  shinyLocked?: boolean
  shinyBase?: string | null
  matchesFilter?: boolean
}

export type NullableDexPokemon = DexPokemon | null

export type DexPokemonList = Array<NullableDexPokemon>

export type DexBox = {
  title?: string
  pokemon: DexPokemonList
  shiny: boolean
  hasFilterMatch?: boolean
}

export type PkFilterAttribute = 'pid' | 'nid'
export interface PkFilter {
  query: string
  attribute: PkFilterAttribute
}

export type StorableDex = {
  title: string
  sver: typeof DEX_SCHEMA_VERSION // schema version
  preset: [string, string, number] | [string, string, string, number] // [gameSetId], gameId, presetId, presetVersion
  caught: [number, number] // [caught regular, total regular]
  caughtShiny: [number, number] // [caught regular, total shinies]
  boxes: Array<DexBox>
} & BaseUserDocument

export type LoadedDex = {
  title: string
  schemaVersion: typeof DEX_SCHEMA_VERSION // schema version
  gameId: string // e.g. "sw"
  gameSetId: string // e.g. "swsh"
  presetId: string // e.g. 'grouped-region' | 'fully-sorted' | 'grouped-species'
  presetVersion: number
  caughtRegular: number
  totalRegular: number
  caughtShiny: number
  totalShiny: number
  boxes: DexBox[]
  lostPokemon: DexPokemonList
} & BaseUserDocument

export type StorableDexList = Array<StorableDex>
export type LoadedDexList = Array<LoadedDex>

export type LivingDexUserLimits = {
  maxDexes: number
}

export type LivingDexResolvedUserLimits = LivingDexUserLimits & {
  remainingDexes: number
}

export type LivingDexRepository = {
  getById: (id: string) => Promise<LoadedDex | null>
  getLimitsForUser: (membership: SessionMembership | null) => Promise<LivingDexUserLimits>
  getResolvedLimitsForUser: (
    userId: string,
    membership: SessionMembership | null,
  ) => Promise<LivingDexResolvedUserLimits>
  calculateResolvedLimits: (dexes: LoadedDex[], limits: LivingDexUserLimits) => LivingDexResolvedUserLimits
  getManyByUser: (userUid: string) => Promise<LoadedDexList>
  import: (dexes: LoadedDex[], userId: string) => Promise<number>
  save: (dex: LoadedDex, userId: string) => Promise<LoadedDex>
  remove: (id: string) => Promise<void>
}
