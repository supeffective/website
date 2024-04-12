import { SessionProvider as NextAuthSessionProvider, SessionProviderProps, useSession } from 'next-auth/react'
import React, { createContext, useContext } from 'react'

import { convertNextSessionToAuthApi } from './converters/convertNextSessionToAuthApi'
import { AuthApi } from './types'

export function CompositeAuthProvider({ children, ...rest }: { children: React.ReactNode } & SessionProviderProps) {
  return (
    <NextAuthSessionProvider {...rest}>
      <AuthProvider>{children}</AuthProvider>
    </NextAuthSessionProvider>
  )
}

const authContext = createContext<AuthApi | null>(null)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const nextSession = useSession()
  const auth = convertNextSessionToAuthApi(nextSession)

  return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export const useAuthContext = (): AuthApi => {
  const auth = useContext(authContext)
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return auth
}
