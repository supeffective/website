import { useRouter } from 'next/compat/router'

import PageMeta from '@/features/pages/components/PageMeta'
import { abs_url } from '@/lib/components/Links'

//

export default function Page() {
  const router = useRouter()
  const error = router?.query.error || null
  let errorMessage: React.ReactNode = 'Unexpected sign in error'
  switch (String(error).toLowerCase()) {
    default:
      errorMessage = <>Server Error: {error ? <i>{`: ${error}`}</i> : ''}</>
  }
  return (
    <>
      <div className={'page-container'}>
        <PageMeta
          metaTitle={'Sign In error - Supereffective.gg'}
          metaDescription={''}
          robots={'noindex, nofollow'}
          canonicalUrl={abs_url('/auth/error')}
          lang={'en'}
        />
        <article className={'page-authored-content'}>
          <div className={'page-container bordered-container inner-blueberry text-center'}>
            <h2>Server Error</h2>
            <p>❌ {errorMessage}</p>
          </div>
        </article>
      </div>
    </>
  )
}
