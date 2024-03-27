import { GetServerSidePropsContext } from 'next'

import PageMeta from '@/v3/features/pages/components/PageMeta'
import { createCsrfToken } from '@/v3/features/users/auth/serverside/createCsrfToken'
import { LoginView } from '@/v3/features/users/views/LoginView'
import { abs_url } from '@/v3/lib/components/Links'

const Page = ({ csrfToken }: { csrfToken: string | null }) => {
  return (
    <div className={'page-container'}>
      <PageMeta
        metaTitle={'Sign In - Supereffective.gg'}
        metaDescription={''}
        robots={'noindex, nofollow'}
        canonicalUrl={abs_url('/login')}
        lang={'en'}
      />
      <article className={'page-authored-content'}>
        <div className={'page-container bordered-container inner-blueberry text-center'}>
          <LoginView csrfToken={csrfToken} />
        </div>
      </article>
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await createCsrfToken(context)
  return {
    props: { csrfToken },
  }
}

export default Page
