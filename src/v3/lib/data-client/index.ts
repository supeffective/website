import config from '@/v3/config'
import { isDevelopmentEnv } from '@/v3/lib/utils/env'

type FetchInit = RequestInit & {
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

export async function fetchData<T>(relativeUrl: string, init?: FetchInit): Promise<T> {
  if (!relativeUrl.startsWith('/')) {
    throw new Error(`[fetchData] Relative URL does not start with slash: ${relativeUrl}`)
  }

  const url = config.assets.dataUrl + relativeUrl
  if (isDevelopmentEnv()) {
    console.log('[fetchData] Fetching', url)
  }
  const resolvedInit: FetchInit = {
    ...init,
    next: {
      revalidate: config.assets.dataCacheTtl,
      ...init?.next,
    },
  }

  return fetch(url, resolvedInit)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`[fetchData] Error fetching ${url}: ${res.status} ${res.statusText}`)
      }
      return res.json()
    })
    .catch((err) => {
      console.error(`[fetchData] Error fetching ${url}: ${err}`)
      return null
    })
}
