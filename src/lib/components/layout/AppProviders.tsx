import { CompositeAuthProvider } from '@/features/users/auth/AuthProvider'

function AppProviders({ children }: { children: React.ReactNode }) {
  return <CompositeAuthProvider>{children}</CompositeAuthProvider>
}

export default AppProviders
