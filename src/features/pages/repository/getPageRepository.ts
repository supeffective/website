import { getAllEntries } from '@/lib/mdx/mdx'
import createMemoizedCallback from '@/lib/utils/caching/createMemoizedCallback'

import { getEntryStaticProps } from './getEntryStaticProps'
import { EntryType, PageEntry, StaticProps } from './types'

export const getPageRepository = createMemoizedCallback(() => {
  const allPages = getAllEntries(EntryType.Page).map((entry) => ({
    ...entry,
    url: `/${entry.slug}`,
  }))

  function getAll(): PageEntry[] {
    return allPages
  }

  function getBySlug(slug: string): PageEntry | null {
    const entry = allPages.find((page) => page.slug === slug)
    return entry ?? null
  }

  function getStaticProps(slug: string, revalidateAfter = 60 * 15): StaticProps<PageEntry> {
    return getEntryStaticProps(getBySlug(slug), revalidateAfter)
  }

  return {
    getAll,
    getBySlug,
    getStaticProps,
  }
})
