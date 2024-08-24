import { useSession } from '@/features/users/auth/hooks/useSession'
import { useSignOut } from '@/features/users/auth/hooks/useSignOut'
import Button from '@/lib/components/Button'
import { UserRestrictedArea } from '@/lib/components/panels/UserRestrictedArea'
import { Membership } from '@/prisma/types'

import { PatreonMembership } from './PatreonMembership'

export function ProfileView(): JSX.Element | null {
  const auth = useSession()
  const signOut = useSignOut()

  const onLogoutClick = async () => {
    await signOut(true, '/login')
  }

  return (
    <UserRestrictedArea>
      <div>
        <h2>
          <i className="icon-user" /> Profile
        </h2>
        <hr />
        {auth.currentUser?.displayName && (
          <>
            <p>
              <b>Display Name: </b>
              <code style={{ color: 'var(--color-blueberry-accent)' }}>{auth.currentUser?.displayName}</code>
            </p>
          </>
        )}
        <p>
          <b>Email: </b>
          <code style={{ color: 'var(--color-blueberry-accent)' }}>{auth.currentUser?.email}</code>
        </p>
        <PatreonMembership />
        <p>
          <b>Support ID: </b>
          <code style={{ color: 'var(--color-blueberry-accent)' }}>{auth.currentUser?.uid}</code>
          <br />
          <small style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
            Use this ID whenever you need help with your account, when you contact us privately. Do not share publicly.
          </small>
        </p>
        <hr />
        <div className="text-right">
          <Button onClick={onLogoutClick}>Logout</Button>
        </div>
      </div>
    </UserRestrictedArea>
  )
}
