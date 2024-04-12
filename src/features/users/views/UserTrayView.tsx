import { Routes } from '@/config/routes'
import { useSession } from '@/features/users/auth/hooks/useSession'
import { SiteLink } from '@/lib/components/Links'

type UserTrayViewProps = {
  activeClass?: string
  returnUrl?: string
} & React.HTMLAttributes<HTMLAnchorElement>

export function UserTrayView({ activeClass, returnUrl, ...rest }: UserTrayViewProps): JSX.Element {
  const auth = useSession()

  if (auth.isLoading()) {
    return (
      <a href="#" style={{ background: 'none !important' }}>
        Sign In
      </a>
    )
  }

  if (auth.isUnauthenticated()) {
    return (
      <SiteLink
        {...rest}
        activeClass={activeClass}
        href={Routes.Login + (returnUrl ? '?s=' + returnUrl : '')}
        tabIndex={0}
      >
        Sign In
      </SiteLink>
    )
  }

  if (!auth.isVerified()) {
    return (
      <SiteLink
        {...rest}
        activeClass={activeClass}
        href={Routes.VerifyEmail + ('?email=' + encodeURIComponent(auth.currentUser?.email || ''))}
        tabIndex={0}
      >
        <i className="icon-email" style={{ marginRight: '0.5rem' }} /> Verify Email
      </SiteLink>
    )
  }

  return (
    <SiteLink {...rest} href={Routes.Profile} activeClass={activeClass} tabIndex={0}>
      <i className="icon-user" style={{ marginRight: '0.5rem' }} /> Profile
    </SiteLink>
  )
}
