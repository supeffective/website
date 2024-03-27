import { GetServerSidePropsContext } from 'next'

import { getLegacyLivingDexRepository } from '@/v3/features/livingdex/repository'
import { LivingDexResolvedUserLimits } from '@/v3/features/livingdex/repository/types'
import { Dashboard } from '@/v3/features/livingdex/views/Dashboard'
import PageMeta from '@/v3/features/pages/components/PageMeta'
import { getPageRepository } from '@/v3/features/pages/repository/getPageRepository'
import { PageEntry } from '@/v3/features/pages/repository/types'
import { getSession } from '@/v3/features/users/auth/serverside/getSession'
import { abs_url } from '@/v3/lib/components/Links'
import { LoadingBanner } from '@/v3/lib/components/panels/LoadingBanner'

const Page = ({ entry, limits }: { entry: PageEntry | null; limits: LivingDexResolvedUserLimits }) => {
  if (!entry) {
    return <LoadingBanner />
  }

  return (
    <div className={'page-container '} style={{ maxWidth: 'none' }}>
      <PageMeta
        metaTitle={entry.metaTitle}
        metaDescription={entry.metaDescription}
        robots={entry.robots}
        imageUrl={abs_url('/images/og-image.png')}
        canonicalUrl={abs_url('/apps/livingdex')}
        lang={'en'}
      />
      <>
        <Dashboard limits={limits} />
      </>
    </div>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const pageProps = getPageRepository().getStaticProps('livingdex', 60 * 60 * 24) // 24h
  const session = await getSession(ctx.req, ctx.res)

  if (!session?.currentUser?.uid) {
    return {
      props: {
        entry: pageProps.props?.entry ?? null,
        limits: null,
      },
    }
  }

  const resolvedLimits = await getLegacyLivingDexRepository().getResolvedLimitsForUser(session.currentUser.uid)

  return {
    props: {
      entry: pageProps.props?.entry ?? null,
      limits: resolvedLimits,
    },
  }
}

export default Page
