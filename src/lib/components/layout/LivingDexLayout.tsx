import { LivingDexProvider } from '@/features/livingdex/state/LivingDexContext'
import { LivingDexListProvider } from '@/features/livingdex/state/LivingDexListContext'

function LivingDexLayout({ children }: { children: React.ReactNode }) {
  return (
    <LivingDexListProvider>
      <LivingDexProvider>{children}</LivingDexProvider>
    </LivingDexListProvider>
  )
}

export default LivingDexLayout
