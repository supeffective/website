import { useRouter } from 'next/compat/router'

import { Routes } from '@/config/routes'
import PageMeta from '@/features/pages/components/PageMeta'
import { useSession } from '@/features/users/auth/hooks/useSession'
import { ButtonLink } from '@/lib/components/Button'
import { abs_url } from '@/lib/components/Links'
import { LoadingBanner } from '@/lib/components/panels/LoadingBanner'
import { LoadingRedirectBanner } from '@/lib/components/panels/LoadingRedirectBanner'
import { base64Decode } from '@/lib/utils/serialization/base64'

export default function Page() {
  const auth = useSession()
  const router = useRouter()
  const nextUrl = router?.query.nextUrl as string | undefined

  if (auth.isLoading()) {
    return <LoadingBanner />
  }

  const decodedNextUrl = nextUrl ? base64Decode(decodeURIComponent(nextUrl)) : ''

  if (decodedNextUrl.startsWith('http')) {
    return (
      <div className={'page-container'}>
        <PageMeta
          metaTitle={'Confirm Sign In - Supereffective.gg'}
          metaDescription={''}
          robots={'noindex, nofollow'}
          canonicalUrl={abs_url('/auth/verify-request')}
          lang={'en'}
        />
        <div className={'page-container'}>
          <div className={'bordered-container inner-container inner-blueberry text-center'}>
            <h2>Sign In Confirmation</h2>
            <ButtonLink href={decodedNextUrl}>
              Continue with Sign In <i className="icon-arrow-right" />
            </ButtonLink>
            <br />
            <p
              style={{
                fontSize: '0.9rem',
                padding: '1rem',
                marginInline: '3rem',
                borderRadius: '1rem',
              }}
              className="inner-blueberry"
            >
              Once you click on Continue, you will be authenticated on our website, and the Sign In link sent to your
              email will no longer be valid (it can only be used once).
            </p>
          </div>
        </div>
      </div>
    )
  }

  console.error('Invalid callback url', { nextUrl, decodedNextUrl })

  return <LoadingRedirectBanner routeUri={Routes.AuthError + '?error=InvalidCallbackUrl'} />
}
