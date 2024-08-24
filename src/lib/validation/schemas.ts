import { z } from 'zod'

export const emailSchema = z.string().email()

export const userNameSchema = z
  .string()
  .min(4)
  .max(16)
  .regex(/^[a-zA-Z0-9_]{4,16}$/)

export const userCreatedTitleSchema = z.string().min(1).max(100)

export const slugSchema = z.string().regex(/^[a-z0-9-]{1,}$/)
export const idSchema = z.string().regex(/^[a-zA-Z0-9]{1,100}$/)
export const isValidIdSchema = (id: any): id is string => {
  return idSchema.safeParse(id).success
}
