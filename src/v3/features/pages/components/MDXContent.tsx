import Button from '@/v3/lib/components/Button'
import PluginMDXContent from '@/v3/lib/mdx/components/MDXContent'

const mdxComponents = {
  button: Button,
}

export default function MDXContent({ content }: { content: string | undefined }): JSX.Element | null {
  if (!content) return null

  return <PluginMDXContent components={mdxComponents} content={content} />
}
