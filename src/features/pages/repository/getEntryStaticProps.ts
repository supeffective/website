import { Entry, StaticProps } from './types'

export function getEntryStaticProps<T extends Entry>(entry: T | null, revalidateAfter = 60 * 15): StaticProps<T> {
  if (!entry) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      entry: entry as T,
    },
    revalidate: revalidateAfter, // see https://www.youtube.com/watch?v=X0-6lyxj1_Q
  }
}
