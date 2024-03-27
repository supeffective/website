import manifestConfig from '@/config/manifest'
import type { MetadataRoute } from 'next'

// @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
export default function manifest(): MetadataRoute.Manifest {
  return manifestConfig
}
