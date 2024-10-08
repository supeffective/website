import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/compat/router'

import { Routes } from '@/config/routes'
import PageMeta from '@/features/pages/components/PageMeta'
import { useSession } from '@/features/users/auth/hooks/useSession'
import { useSignOut } from '@/features/users/auth/hooks/useSignOut'
import { createCsrfToken } from '@/features/users/auth/serverside/createCsrfToken'
import EmailSigninView from '@/features/users/views/EmailSigninView'
import Button from '@/lib/components/Button'
import { abs_url } from '@/lib/components/Links'
import { LoadingBanner } from '@/lib/components/panels/LoadingBanner'
import { UnauthenticatedBanner } from '@/lib/components/panels/UnauthenticatedBanner'

export default function Page({ csrfToken }: { csrfToken: string | null }) {
  const auth = useSession()
  const logout = useSignOut()
  const router = useRouter()

  if (!auth.isAuthenticated()) {
    return <UnauthenticatedBanner />
  }

  if (auth.isLoading()) {
    return <LoadingBanner />
  }

  if (auth.isAuthenticated() && auth.isVerified() && auth.isOperable()) {
    router?.push(Routes.Profile)
    return <LoadingBanner />
  }

  return (
    <>
      <div className={'page-container'}>
        <PageMeta
          metaTitle={'Verify Email - Supereffective.gg'}
          metaDescription={''}
          robots={'noindex, nofollow'}
          canonicalUrl={abs_url('/auth/verify-email')}
          lang={'en'}
        />
        <article className={'page-authored-content'}>
          <div className={'page-container bordered-container inner-blueberry text-center'}>
            <h2>
              Sign In with Email <i className="icon-email" />
            </h2>
            <p>
              <b style={{ color: 'darkgoldenrod' }}>You are logging in with an external provider.</b>
              <br />
              <br />
              To continue, please verify your email by signing in with <br />
              the new email-based authentication system.
            </p>
            <EmailSigninView
              csrfToken={csrfToken}
              email={auth.currentUser?.email || undefined}
              buttonText={'Send Sign In Link'}
            />
            <br />
            <Button onClick={logout}>Logout</Button>
          </div>
        </article>
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await createCsrfToken(context)
  return {
    props: { csrfToken },
  }
}
