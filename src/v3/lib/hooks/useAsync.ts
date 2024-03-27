import { useCallback, useEffect, useState } from 'react'

export enum AsyncStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

export const useAsync = <T, E = string>(asyncFunction: () => Promise<T>, immediate = true) => {
  const [status, setStatus] = useState<AsyncStatus>(AsyncStatus.Idle)
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setStatus(AsyncStatus.Pending)
    setValue(null)
    setError(null)
    return asyncFunction()
      .then((response: any) => {
        setValue(response)
        setStatus(AsyncStatus.Success)
      })
      .catch((error: any) => {
        setError(error)
        setStatus(AsyncStatus.Error)
      })
  }, [asyncFunction])
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])
  return { execute, status, value, error }
}
