import { NextApiRequest, NextApiResponse } from 'next'

import config from '@/config'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const buildId = process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'
  res.status(200).json({
    version: config.version.num + `-${buildId}`,
  })
}

export default handler
