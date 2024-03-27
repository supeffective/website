import { getPageRepository } from '@/v3/features/pages/repository/getPageRepository'
import ArticlePageView, { ArticlePageViewProps } from '@/v3/features/pages/views/ArticlePageView'

export async function getStaticProps() {
  return getPageRepository().getStaticProps('index', 60 * 15)
}

export default function Page({ entry }: ArticlePageViewProps) {
  return <ArticlePageView className="homepage" entry={entry} />
}
