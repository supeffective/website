import { useRouter } from 'next/compat/router'

import { hasPatreonFeaturesEnabled } from '@/config/featureFlags'
import { patreonTiers } from '@/config/patreon'
import { useSession } from '@/features/users/auth/hooks/useSession'
import { useSignOut } from '@/features/users/auth/hooks/useSignOut'
import { createMembershipPlaceholder } from '@/features/users/repository/memberships'
import Button from '@/lib/components/Button'
import { UserRestrictedArea } from '@/lib/components/panels/UserRestrictedArea'
import { Membership } from '@/prisma/types'

import { PatreonButton, PatreonUnlinkButton } from '../components/PatreonButtons'

export function ProfileView({ membership }: { membership?: Membership | undefined }): JSX.Element | null {
  const router = useRouter()
  const { status, error, provider, action } = router
    ? router.query
    : { status: undefined, error: undefined, provider: undefined, action: undefined }
  const auth = useSession()
  const signOut = useSignOut()

  const onLogoutClick = async () => {
    await signOut(true, '/login')
  }

  const _renderPatreonMembership = () => {
    if (!hasPatreonFeaturesEnabled() || !auth.currentUser) {
      return null
    }

    const hasMembership = !!membership?.patreonMemberId
    const _membership: Membership = membership ?? createMembershipPlaceholder(auth.currentUser.uid)
    const _expirationDate = _membership.expiresAt ? new Date(_membership.createdAt) : null

    return (
      <>
        <p>
          <b>Patreon Membership: </b>
          <code style={{ color: 'var(--color-blueberry-accent)' }}>{patreonTiers[_membership.currentTier].name}</code>
        </p>
        <p>
          <b>Entitled Rewards: </b>
          <code style={{ color: 'var(--color-blueberry-accent)' }}>
            {_membership.rewardMaxDexes} dexes
            {_membership.rewardFeaturedStreamer ? ', featured streamer' : ''}
          </code>
        </p>
        {hasMembership && _expirationDate && (
          <p>
            <b>Membership Expiration Date: </b>
            <code style={{ color: 'var(--color-blueberry-accent)' }}>{_expirationDate.toLocaleDateString()}</code>
          </p>
        )}

        {!hasMembership && (
          <>
            <div>
              <PatreonButton />
            </div>
            {error === 'no_membership' && (
              <>
                <small
                  style={{
                    fontWeight: 'bold',
                    color: 'var(--color-scarlet-2)',
                    margin: '0.5rem 0',
                  }}
                >
                  Cannot link your Patreon account: You need to become a patron before you can link your Patreon
                  account.
                </small>
                <br />
                <small
                  style={{
                    fontWeight: 'normal',
                    color: 'var(--color-scarlet-2)',
                    margin: '0.5rem 0',
                  }}
                >
                  If you think this could be a mistake, please send us a message via Patreon, indicating your Support ID
                  and we will investigate the issue.
                </small>
                <br />
                <br />
              </>
            )}
            <small style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
              Link your Patreon account and become a patron to unlock extras in the website and Discord.
            </small>
          </>
        )}

        {hasMembership && (
          <>
            <div>
              <PatreonUnlinkButton memberId={membership.patreonMemberId} />
            </div>
          </>
        )}
        <hr />
      </>
    )
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
        {_renderPatreonMembership()}
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
