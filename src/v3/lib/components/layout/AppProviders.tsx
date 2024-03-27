// import PlausibleProvider from 'next-plausible'

import { LivingDexProvider } from '@/v3/features/livingdex/state/LivingDexContext'
import { LivingDexListProvider } from '@/v3/features/livingdex/state/LivingDexListContext'
import { CompositeAuthProvider } from '@/v3/features/users/auth/AuthProvider'
// import { isProductionEnv } from '@/v3/lib/utils/env'

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CompositeAuthProvider>
      {/* <PlausibleProvider domain="supereffective.gg" enabled={isProductionEnv()}> */}
      <LivingDexListProvider>
        <LivingDexProvider>{children}</LivingDexProvider>
      </LivingDexListProvider>
      {/* </PlausibleProvider> */}
    </CompositeAuthProvider>
  )
}

export default AppProviders
