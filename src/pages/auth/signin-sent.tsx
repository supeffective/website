// ?provider=email&type=email

import PageMeta from '@/features/pages/components/PageMeta'
import { abs_url } from '@/lib/components/Links'

export default function Page() {
  return (
    <>
      <div className={'page-container'}>
        <PageMeta
          metaTitle={'Verification sent - Supereffective.gg'}
          metaDescription={''}
          robots={'noindex, nofollow'}
          canonicalUrl={abs_url('/auth/signin-sent')}
          lang={'en'}
        />
        <article className={'page-authored-content'}>
          <div className={'page-container bordered-container inner-blueberry text-center'}>
            <h2>
              Check your email <i className="icon-email" />
            </h2>
            <p>A sign in link has been sent to your email address.</p>
          </div>
        </article>
      </div>
    </>
  )
}
