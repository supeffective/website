import { NextApiRequest, NextApiResponse } from 'next'

import { Routes } from '@/config/routes'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  res.redirect(Routes.Profile + '?welcome=1')
}

export default handler
