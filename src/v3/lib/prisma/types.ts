export * from '@prisma/client'

export type BaseDocument = {
  // id from Firestore:
  id?: string
  // these are custom properties that are indexed:
  userId?: string
  createdAt?: Date
  updatedAt?: Date
} & Record<string, unknown>

export type BaseUserDocument = BaseDocument
