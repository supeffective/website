import { z } from 'zod'

import { parseEnvVars } from './envParser'

const serverVars = z.object({
  // vercel
  VERCEL_ENV: z.string(),
  VERCEL_URL: z.string(), // does not have http[s]:// prefix, so cannot validate as .url()
  // next auth
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_URL_INTERNAL: z.string().url().optional(),
  // email
  EMAIL_PROVIDER: z.enum(['resend', 'filesystem', 'console']),
  EMAIL_DEFAULT_FROM: z.string().email(),
  RESEND_API_KEY: z.string(),
  // databases
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url(),
  // patreon
  PATREON_APP_CLIENT_ID: z.string(),
  PATREON_APP_CLIENT_SECRET: z.string(),
  // PATREON_CLIENT_ID: z.string(),
  // PATREON_CLIENT_SECRET: z.string(),
  // PATREON_CREATOR_ACCESS_TOKEN: z.string(),
  // PATREON_CREATOR_REFRESH_TOKEN: z.string(),
  // PATREON_WEBHOOK_SECRET: z.string(),
})

const clientVars = z.object({})

type ProjectEnvVars = z.infer<typeof serverVars> & z.infer<typeof clientVars>
type InitialProjectEnvVars = {
  [K in keyof ProjectEnvVars]: ProjectEnvVars[K] | string | undefined
}

const initialEnvVars: InitialProjectEnvVars = {
  // vercel
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  // next auth
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
  // email
  EMAIL_DEFAULT_FROM: process.env.EMAIL_DEFAULT_FROM,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  // databases
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
  SHADOW_DATABASE_URL: process.env.SHADOW_DATABASE_URL,
  // patreon
  PATREON_APP_CLIENT_ID: process.env.PATREON_APP_CLIENT_ID,
  PATREON_APP_CLIENT_SECRET: process.env.PATREON_APP_CLIENT_SECRET,
}

export const envVars = parseEnvVars<ProjectEnvVars>(initialEnvVars, {
  server: serverVars,
  client: clientVars,
})
