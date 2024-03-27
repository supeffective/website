import { getAllEntries } from '@/v3/lib/mdx/mdx'
import createMemoizedCallback from '@/v3/lib/utils/caching/createMemoizedCallback'

import { getEntryStaticProps } from './getEntryStaticProps'
import { ArticleEntry, EntryType, StaticProps } from './types'

export const getArticleRepository = createMemoizedCallback(() => {
  const allArticles = getAllEntries(EntryType.Article).map((entry) => ({
    ...entry,
    url: `/news/${entry.slug}`,
  }))

  function getAll(): ArticleEntry[] {
    return allArticles
  }

  function getBySlug(slug: string): ArticleEntry | null {
    const entry = allArticles.find((article) => article.slug === slug)
    return entry ?? null
  }

  function getStaticProps(slug: string, revalidateAfter = 60 * 15): StaticProps<ArticleEntry> {
    return getEntryStaticProps(getBySlug(slug), revalidateAfter)
  }

  return {
    getAll,
    getBySlug,
    getStaticProps,
  }
})
