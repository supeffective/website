// import PlausibleProvider from 'next-plausible'

import { LivingDexProvider } from '@/features/livingdex/state/LivingDexContext'
import { LivingDexListProvider } from '@/features/livingdex/state/LivingDexListContext'
import { CompositeAuthProvider } from '@/features/users/auth/AuthProvider'

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
