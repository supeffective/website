import { signIn } from 'next-auth/react'
import { HTMLProps } from 'react'

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
