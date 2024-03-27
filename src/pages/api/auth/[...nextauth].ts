import { NextApiRequest, NextApiResponse } from 'next'

import authOptions from '@/v3/features/users/auth/serverside/authOptions'
import { createAuthRouter } from '@/v3/features/users/auth/serverside/createAuthRouter'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await createAuthRouter(req, res, authOptions)
}

export default handler
