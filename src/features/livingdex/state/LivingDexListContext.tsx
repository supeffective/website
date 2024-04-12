import React, { createContext, useContext } from 'react'

import { UseDexesResult, useDexes } from '@/features/livingdex/hooks/useDexes'

const dexesContext = createContext<UseDexesResult | null>(null)

export function LivingDexListProvider({ children }: { children: React.ReactNode }) {
  const result = useDexes()

  return <dexesContext.Provider value={result}>{children}</dexesContext.Provider>
}

export const useDexesContext = (): UseDexesResult => {
  const context = useContext(dexesContext)
  if (!context) {
    throw new Error('useDexesContext must be used within an LivingDexListProvider')
  }
  return context
}
