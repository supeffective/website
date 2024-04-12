import { useAuthContext } from '../AuthProvider'

export function useSignOut(): (redirect?: boolean, callbackUrl?: string) => Promise<void> {
  const auth = useAuthContext()

  return async (redirect?: boolean, callbackUrl?: string) => {
    await auth.signOut(redirect, callbackUrl)
  }
}
