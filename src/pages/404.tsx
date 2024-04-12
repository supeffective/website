import Image from 'next/image'

import PageMeta from '@/features/pages/components/PageMeta'
import { abs_url } from '@/lib/components/Links'

const page = () => {
  const randFrom0to4 = Math.floor(Math.random() * 5)
  return (
    <div className={'page-container'}>
      <PageMeta
        metaTitle={'404 Not Found'}
        metaDescription={'Page not found'}
        canonicalUrl={abs_url('/404')}
        robots={'noindex, nofollow'}
        lang={'en'}
      />

      <article>
        <h2 style={{ textAlign: 'center' }}>
          404 <small>Page Not Found</small>
        </h2>
        <section>
          <Image
            src={`/images/error404/404-00${randFrom0to4}.jpeg`}
            style={{
              width: '100%',
              border: '8px solid rgba(0,0,0,0.2)',
              borderRadius: '50px',
            }}
            fill={true}
            alt={'404'}
          />
        </section>
      </article>
    </div>
  )
}

export default page
