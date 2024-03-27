import { z } from 'zod'

import { isClientSide } from '@/v3/lib/utils/env'

const CLIENT_ENV_PREFIX = 'NEXT_PUBLIC_'

type EnvVars = Record<string, string | undefined>

export function parseEnvVars<T extends Record<string, string | undefined>>(
  envVars: EnvVars,
  schema: {
    server: z.ZodObject<z.ZodRawShape>
    client: z.ZodObject<z.ZodRawShape>
  },
): T {
  const serverSchema = schema.server
  const clientSchema = schema.client
  const combinedSchema = isClientSide() ? serverSchema.partial().merge(clientSchema) : serverSchema.merge(clientSchema)

  const parsed = combinedSchema.safeParse(envVars)

  if (!parsed.success) {
    const errorMsg = `❌ Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
    throw new Error(errorMsg)
  }

  return new Proxy<T>(parsed.data as T, {
    get(target, prop) {
      if (typeof prop !== 'string') {
        return undefined
      }

      if (isClientSide() && !prop.startsWith(CLIENT_ENV_PREFIX)) {
        // avoid exposing server env vars in the client
        throw new Error(`❌ Cannot use server env vars in the client: ${prop}`)
      }

      return target[prop as keyof typeof target]
    },
  })
}
