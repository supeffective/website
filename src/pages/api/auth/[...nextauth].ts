import { NextApiRequest, NextApiResponse } from 'next'

import authOptions from '@/features/users/auth/serverside/authOptions'
import { createAuthRouter } from '@/features/users/auth/serverside/createAuthRouter'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await createAuthRouter(req, res, authOptions)
}

export default handler
