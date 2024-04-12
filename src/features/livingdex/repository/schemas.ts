import { z } from 'zod'

import { idSchema, slugSchema, userCreatedTitleSchema } from '@/lib/validation/schemas'

export type BaseUserDocument = {
  id?: string
  userId?: string
  createdAt?: Date
  updatedAt?: Date
} & Record<string, unknown>

export type DexPokemon = {
  pid: string
  caught: boolean
  gmax: boolean
  alpha: boolean
  shiny: boolean
  shinyLocked?: boolean
  shinyBase?: string | null
}

export type NullableDexPokemon = DexPokemon | null

export type DexPokemonList = Array<NullableDexPokemon>

export type DexBox = {
  title?: string
  pokemon: DexPokemonList
  shiny: boolean
}

export type StorableDex = {
  title: string
  sver: number
  preset: [string, string, number] | [string, string, string, number]
  caught: [number, number]
  caughtShiny: [number, number]
  boxes: Array<DexBox>
} & BaseUserDocument

export type LoadedDex = {
  title: string
  schemaVersion: number
  gameId: string
  gameSetId: string
  presetId: string
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

// ---------

export const BaseUserDocumentSchema = z
  .object({
    id: idSchema.optional(),
    userId: idSchema.optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .strict()

export const DexPokemonSchema = z.object({
  pid: slugSchema,
  caught: z.boolean(),
  gmax: z.boolean(),
  alpha: z.boolean(),
  shiny: z.boolean(),
  shinyLocked: z.boolean().optional(),
  shinyBase: slugSchema.nullable(),
})

export const NullableDexPokemonSchema = z.union([DexPokemonSchema, z.null()])

export const DexPokemonListSchema = z.array(NullableDexPokemonSchema)

export const DexBoxSchema = z.object({
  title: userCreatedTitleSchema.optional(),
  pokemon: DexPokemonListSchema,
  shiny: z.boolean(),
})

export const StorableDexSchema = BaseUserDocumentSchema.merge(
  z.object({
    title: userCreatedTitleSchema,
    sver: z.number(),
    preset: z.union([
      z.tuple([slugSchema, z.string(), z.number()]),
      z.tuple([slugSchema, slugSchema, z.string(), z.number()]),
    ]),
    caught: z.tuple([z.number(), z.number()]),
    caughtShiny: z.tuple([z.number(), z.number()]),
    boxes: z.array(DexBoxSchema),
  }),
)

export const LoadedDexSchema = BaseUserDocumentSchema.merge(
  z.object({
    title: userCreatedTitleSchema,
    schemaVersion: z.number(),
    gameId: slugSchema,
    gameSetId: slugSchema,
    presetId: z.string(),
    presetVersion: z.number(),
    caughtRegular: z.number(),
    totalRegular: z.number(),
    caughtShiny: z.number(),
    totalShiny: z.number(),
    boxes: z.array(DexBoxSchema),
    lostPokemon: DexPokemonListSchema,
  }),
)

export const StorableDexListSchema = z.array(StorableDexSchema)
export const LoadedDexListSchema = z.array(LoadedDexSchema)
