import { useEffect, useState } from 'react'

import { Routes } from '@/config/routes'

import { dd } from '../utils/logger'
import { getFullUrl } from '../utils/urls'

async function fetchApiVersion(): Promise<{ version: string }> {
  const res = await fetch(getFullUrl(Routes.API.Version))
  if (!res.ok) {
    throw new Error(`[useBuildRefresh] Error fetching version: ${res.status} ${res.statusText}`)
  }
  const data = await res.json()

  if (typeof data !== 'object' || typeof data.version !== 'string') {
    throw new Error(`API error: Invalid version string returned`)
  }

  return data
}

function usePullBuildVersionInterval() {
  const [version, setVersion] = useState<string>('')

  fetchApiVersion().then((data) => {
    setVersion(data.version)
  })

  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchApiVersion().then((data) => {
          dd('[useBuildVersion]', data)
          setVersion(data.version)
        })
      },
      1000 * 60 * 60,
    ) // call every 60 minutes (1 hour)

    return () => clearInterval(interval)
  }, [])

  return version
}

export function useRefreshOnVersionChange() {
  if (typeof window === 'undefined') {
    return '0.0.0-server'
  }

  const [initialVersion, setInitialVersion] = useState<string>()

  fetchApiVersion().then((data) => {
    setInitialVersion(data.version)
  })

  const pulledVersion = usePullBuildVersionInterval()

  if (initialVersion === undefined) {
    return pulledVersion
  }

  if (pulledVersion && pulledVersion !== initialVersion) {
    console.log('[useBuildVersion] Reloading page', {
      pulledVersion: String(pulledVersion),
      initialVersion: String(initialVersion),
    })
    window.location.reload()
  }

  return pulledVersion
}
