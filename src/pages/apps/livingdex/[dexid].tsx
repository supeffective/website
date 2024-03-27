import { GetServerSidePropsContext } from 'next'

import { getLegacyLivingDexRepository } from '@/v3/features/livingdex/repository'
import { getPresets } from '@/v3/features/livingdex/repository/presets'
import { PresetDexMap } from '@/v3/features/livingdex/repository/presets/types'
import { LoadedDex } from '@/v3/features/livingdex/repository/types'
import LivingDexApp from '@/v3/features/livingdex/views/LivingDexApp'
import PageMeta from '@/v3/features/pages/components/PageMeta'
import { abs_url } from '@/v3/lib/components/Links'
import { getGameSetByGameId } from '@/v3/lib/data-client/game-sets'
import { logger } from '@/v3/lib/utils/logger'
import { deserializeObject, serializeObject } from '@/v3/lib/utils/serialization/jsonSerializable'

const Page = ({ dexData, presets }: { dexData: any; presets: PresetDexMap }) => {
  const dex = deserializeObject<LoadedDex>(dexData)
  const metaTitle = `${dex.title} | Supereffective.gg Pokédex Tracker`
  const metaDescription = `${dex.title}, a Pokémon Living Dex created with Supereffective's Living Pokédex Tracker app. Caught ${dex.caughtRegular} / ${dex.totalRegular}.`
  const gameSet = getGameSetByGameId(dex.gameId)
  const gameSetId = gameSet.id

  const containerClasses =
    `page-container full-main-height dex-game bg-ball-pattern10 ` +
    `dex-gameset-${gameSetId} dex-game-${dex.gameId} dex-preset-${dex.presetId} ` +
    `dex-boxsize-${gameSet.storage?.boxCapacity}`

  return (
    <div style={{ maxWidth: 'none' }} className={containerClasses}>
      <PageMeta
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        imageUrl={abs_url('/images/og-image.png')}
        robots={'noindex, nofollow'}
        canonicalUrl={abs_url('/apps/livingdex/' + dex.id)}
        lang={'en'}
      />
      <LivingDexApp loadedDex={dex} presets={presets} />
    </div>
  )
}

// This value is considered fresh for N seconds eg (s-maxage=10).
// If a request is repeated within the next N seconds, the previously
// cached value will still be fresh. If the request is repeated before 59 seconds,
// the cached value will be stale but still render (stale-while-revalidate=59).
//
// In the background, a revalidation request will be made to populate the cache
// with a fresh value. If you refresh the page, you will see the new value.
// https://nextjs.org/docs/basic-features/data-fetching/overview#getserversideprops-server-side-rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=59')
  const dexid = context.params?.dexid

  const dexRepo = getLegacyLivingDexRepository()

  if (typeof dexid !== 'string' || !dexid.match(/^[a-zA-Z0-9-_]+$/)) {
    return {
      notFound: true,
    }
  }

  try {
    const dex = await dexRepo.getById(dexid)
    if (!dex) {
      return {
        notFound: true,
      }
    }
    return {
      props: {
        dexData: serializeObject(dex),
        presets: getPresets(),
      },
    }
  } catch (e) {
    logger.error('Error loading dex', { dexid, error: String(e) })
    console.error(e)
    return {
      notFound: true,
    }
  }
}

export default Page
