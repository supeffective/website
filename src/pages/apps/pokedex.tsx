import PageMeta from '@/features/pages/components/PageMeta'
import { getPageRepository } from '@/features/pages/repository/getPageRepository'
import { PageEntry } from '@/features/pages/repository/types'
import { Pokedex } from '@/features/pokedex/views/Pokedex'
import { abs_url } from '@/lib/components/Links'
import { LoadingBanner } from '@/lib/components/panels/LoadingBanner'
import { getPokemonEntries, getPokemonSearchIndex } from '@/lib/data-client/pokemon'

export async function getStaticProps() {
  const pageProps = getPageRepository().getStaticProps('pokedex', 60 * 60 * 24) // 24h

  if (!pageProps.props) {
    return pageProps
  }

  return {
    props: {
      entry: pageProps.props.entry,
    },
    revalidate: pageProps.revalidate,
  }
}

const Page = ({ entry }: { entry: PageEntry | null }) => {
  if (!entry) {
    return <LoadingBanner />
  }

  return (
    <div className={'page-container'} style={{ maxWidth: 'none' }}>
      <PageMeta
        metaTitle={entry.metaTitle}
        metaDescription={entry.metaDescription}
        robots={entry.robots}
        imageUrl={abs_url('/images/og-image.png')}
        canonicalUrl={abs_url('/apps/pokedex')}
        lang={'en'}
      />
      <Pokedex pokemon={getPokemonEntries()} pokemonSearch={getPokemonSearchIndex()} />
    </div>
  )
}

export default Page
