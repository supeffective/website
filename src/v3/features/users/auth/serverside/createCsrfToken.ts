import { getCsrfToken as nextAuthGetCsrfToken } from 'next-auth/react'

export async function createCsrfToken(context: Parameters<typeof nextAuthGetCsrfToken>[0]): Promise<string | null> {
  return (await nextAuthGetCsrfToken(context)) || null
}
