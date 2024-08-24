import { signIn } from 'next-auth/react'

import { Routes } from '@/config/routes'
import Button from '@/lib/components/Button'

export function PatreonButton() {
  return (
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

export function PatreonUnlinkButton({ patreonUserId }: { patreonUserId: string | null }) {
  return (
    <form
      method="POST"
      action={Routes.API.PatreonUnlink}
      onSubmit={(e: any) => {
        if (
          !window.confirm(
            'Are you sure you want to unlink your Patreon account? You will lose your Patreon rewards (until you link it again), but your existing data will remain intact.',
          )
        ) {
          e.preventDefault()
          return false
        }
      }}
    >
      <Button type="submit" name="patreonUserId" value={patreonUserId || ''} style={{ padding: '5px 15px' }}>
        Unlink Patreon account
      </Button>
    </form>
  )
}
