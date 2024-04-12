import { useEffect, useReducer, useRef } from 'react'

import { jsonDecode } from '../utils/serialization/jsonSerializable'
import { AsyncStatus } from './useAsync'

export interface FetchState<T> {
  status: AsyncStatus
  isReady: boolean
  data?: T
  error?: Error
  clearCache: () => void
}

type Cache<T> = { [url: string]: T }

// discriminated union type
type Action<T> =
  | { type: AsyncStatus.Pending }
  | { type: AsyncStatus.Success; payload: T }
  | { type: AsyncStatus.Error; payload: Error }

export function useFetch<T = unknown>(
  url?: string,
  options?: RequestInit,
  firewall?: boolean | Error,
  useCache?: boolean,
): FetchState<T> {
  const cache = useRef<Cache<T>>({})
  const cacheKey = url + '::options=' + JSON.stringify(options)
  const firewallValue = firewall !== undefined ? firewall : true

  // Used to prevent state update if the component is unmounted
  const cancelRequest = useRef<boolean>(false)

  const clearCache = () => {
    if (cache.current[cacheKey]) {
      delete cache.current[cacheKey]
    }
  }

  const initialState: FetchState<T> = {
    status: AsyncStatus.Idle,
    isReady: false,
    error: undefined,
    data: undefined,
    clearCache,
  }

  // Keep state logic separated
  const fetchReducer = (state: FetchState<T>, action: Action<T>): FetchState<T> => {
    switch (action.type) {
      case AsyncStatus.Pending:
        return { ...initialState, isReady: false, clearCache }
      case AsyncStatus.Success:
        return { ...initialState, data: action.payload, isReady: true, clearCache }
      case AsyncStatus.Error:
        return { ...initialState, error: action.payload, isReady: true, clearCache }
    }
  }

  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    // Do nothing if the url is not given
    if (!url || firewallValue === false) {
      return
    }

    if (firewallValue instanceof Error) {
      if (!state.error) {
        // nested if to avoid infinite state updates
        dispatch({ type: AsyncStatus.Error, payload: firewallValue })
      }
      return
    }

    cancelRequest.current = false

    const fetchData = async () => {
      dispatch({ type: AsyncStatus.Pending })

      // If a cache exists for this url, return it
      if (useCache !== false && cache.current[cacheKey]) {
        dispatch({ type: AsyncStatus.Success, payload: cache.current[cacheKey] })
        return
      }

      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          const httpError = new Error(response.statusText, {
            cause: {
              status: response.status,
              statusText: response.statusText,
              payload: await response.json(),
            },
          })
          dispatch({ type: AsyncStatus.Error, payload: httpError })
          return
        }

        const data = jsonDecode(await response.text()) as T

        if (useCache !== false) {
          cache.current[cacheKey] = data
        }

        if (cancelRequest.current) {
          return
        }

        dispatch({ type: AsyncStatus.Success, payload: data })
      } catch (error) {
        if (cancelRequest.current) {
          return
        }

        dispatch({ type: AsyncStatus.Error, payload: error as Error })
      }
    }

    void fetchData()

    // Use the cleanup function for avoiding a possibly...
    // ...state update after the component was unmounted
    return () => {
      cancelRequest.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, firewallValue])

  return state
}
