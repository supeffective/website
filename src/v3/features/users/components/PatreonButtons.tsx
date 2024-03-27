import { signIn } from 'next-auth/react'
import { HTMLProps } from 'react'

import { Routes } from '@/v3/config/routes'
import Button from '@/v3/lib/components/Button'

const patreonOauth2Url = 'https://www.patreon.com/oauth2'
const patreonApiOauth2Url = 'https://www.patreon.com/api/oauth2'

const PATREON_API_URLS = {
  oauth2: {
    base: patreonOauth2Url,
    authorize: `${patreonOauth2Url}/authorize`, // button url
    token: `${patreonApiOauth2Url}/token`, // create token
    // resources:
    identity: `${patreonApiOauth2Url}/v2/identity`,
    campaigns: `${patreonApiOauth2Url}/v2/campaigns`,
    members: `${patreonApiOauth2Url}/v2/members`,
  },
}

type ConnectPatreonBtnProps = HTMLProps<HTMLAnchorElement> & {
  redirectUri: string
  clientId: string
  state?: string // e.g. a next-auth SessionId
}
function ConnectPatreonBtn({ clientId, redirectUri, state, ...rest }: ConnectPatreonBtnProps): JSX.Element {
  const urlParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identity campaigns identity.memberships',

    state: state || '',
  })
  const url = `${PATREON_API_URLS.oauth2.authorize}?${urlParams.toString()}`

  return (
    <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
      {rest.children || 'Link your Patreon account'}
    </a>
  )
}

export function PatreonButton() {
  return (
    // <ConnectPatreonBtn
    //   style={{ backgroundColor: '#ff424d', color: '#111', borderColor: '#141661' }}
    //   clientId={String(process.env.NEXT_PUBLIC_PATREON_CLIENT_ID)}
    //   redirectUri={config.patreon.oauthRedirectUrl}
    // />
    <Button
      className="btn btn-secondary"
      style={{ padding: '5px 15px' }}
      onClick={() => {
        signIn('patreon', { callbackUrl: window.location.origin + '/profile?patreon=ok' })
      }}
    >
      Link your Patreon account
    </Button>
  )
}
export function PatreonUnlinkButton({ memberId }: { memberId: string | null }) {
  return (
    <form
      method="POST"
      action={Routes.API.PatreonUnlink}
      onSubmit={(e: any) => {
        if (
          !window.confirm(
            'Are you sure you want to unlink your Patreon account? You will lose your Patreon rewards, but your existing data will remain intact.',
          )
        ) {
          e.preventDefault()
          return false
        }
      }}
    >
      <Button type="submit" name="patreonMemberId" value={memberId || ''} style={{ padding: '5px 15px' }}>
        Unlink Patreon account
      </Button>
    </form>
  )
}
