import { NextRouter } from 'next/router'

function _getWindowLocationSearch(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.search ?? ''
}

function _getWindowLocationPathname(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location.pathname ?? ''
}

export function getSearchParams(): URLSearchParams
export function getSearchParams(key: string): string | null
export function getSearchParams(key: string, defaultValue: string): string
export function getSearchParams(key?: string, defaultValue?: string): URLSearchParams | string | null {
  const params = new URLSearchParams(_getWindowLocationSearch())
  if (!key) {
    return params
  }

  return params.get(key) ?? defaultValue ?? null
}

export function setSearchParam(key: string, value: string): string {
  const params = getSearchParams()
  params.set(key, value)

  return `${_getWindowLocationPathname()}?${params.toString()}`
}

export function removeSearchParams(key: string): string
export function removeSearchParams(keys: string[]): string
export function removeSearchParams(keys: string | string[]): string {
  const params = getSearchParams()
  if (Array.isArray(keys)) {
    keys.forEach((key) => params.delete(key))
  } else {
    params.delete(keys)
  }

  return `${_getWindowLocationPathname()}?${params.toString()}`
}

export function recordToSearchParams(record: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams()
  Object.entries(record).forEach(([key, value]) => params.set(key, value))
  return params
}

export function replaceSearchParams(params: URLSearchParams): string
export function replaceSearchParams(key: string, value: string): string
export function replaceSearchParams(key: URLSearchParams | string, value?: string): string {
  if (key instanceof URLSearchParams) {
    return `${_getWindowLocationPathname()}?${key.toString()}`
  }

  if (typeof value !== 'string') {
    throw new Error('The "value" argument must be a string')
  }

  const params = new URLSearchParams()
  params.set(key, value)

  return `${_getWindowLocationPathname()}?${params.toString()}`
}

export const setNextRouterQueryParam = (
  router: NextRouter | null | undefined,
  key: string,
  value: string | number | null | undefined,
) => {
  if (!router) {
    throw new Error('NextRouter is not mounted, cannot set an URL param.')
  }
  if (!value) {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, [key]: undefined },
    })
    return
  }
  router.push({
    pathname: router.pathname,
    query: { ...router.query, [key]: value },
  })
}
