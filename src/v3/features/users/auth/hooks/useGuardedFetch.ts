import { FetchState, useFetch } from '@/v3/lib/hooks/useFetch'

import { useSession } from './useSession'

export function useGuardedFetch<T = unknown>(
  url?: string,
  options?: RequestInit,
  useCache = true,
): FetchState<T | undefined> {
  const user = useSession()
  const firewall = () => {
    if (user.isLoading()) {
      return false
    }
    if (!user.isAuthenticated()) {
      return new Error('User is not authenticated')
    }
    if (!user.isVerified()) {
      return new Error('User is not verified')
    }
    if (!user.isOperable()) {
      return new Error('User is not operable')
    }
    return true
  }

  return useFetch<T | undefined>(url, options, firewall(), useCache)
}
