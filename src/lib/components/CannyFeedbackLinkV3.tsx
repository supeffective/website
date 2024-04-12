import appConfig from '@/config'
import { useSession } from '@/features/users/auth/hooks/useSession'
import { AuthUser } from '@/features/users/auth/types'
import CannyScript from '@/lib/components/CannyScript'
import { ComponentPropsWithoutRef } from 'react'

function _resolveDisplayName(user: AuthUser) {
  return user.displayName ?? 'User' + user.uid.slice(-4)
}

function _identifyCannyUser(user: AuthUser | null) {
  if (!user?.email) {
    console.debug('Canny: User email is required to identify the user')
    return
  }
  if (!user.uid || !user.displayName || !user.createdAt) {
    // Do not identify the user if the required fields are missing. This will prevent
    // Canny to create users with incomplete data in their system.
    return
  }
  const cannyFn = (window as any).Canny

  cannyFn('identify', {
    appID: appConfig.cannyAppId,
    user: {
      // Replace these values with the current user's data
      id: user.uid,
      email: user.email,
      name: user.displayName,

      // These fields are optional, but recommended:
      avatarURL: user.photoUrl,
      created: user.createdAt?.toISOString(),
    },
  })
}

export default function CannyFeedbackLinkV3({ children, ...props }: ComponentPropsWithoutRef<'a'>) {
  const session = useSession()
  return (
    <>
      {session.currentUser !== null && <CannyScript onScriptLoaded={() => _identifyCannyUser(session.currentUser)} />}
      <a data-canny-link {...props} href={appConfig.cannyUrl} target="_blank" rel="noopener noreferrer">
        {children ?? 'Send feedback'}
      </a>
    </>
  )
}
