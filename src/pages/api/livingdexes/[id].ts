import { NextApiRequest, NextApiResponse } from 'next'

import { getDexApi } from '@/v3/features/livingdex/commands/getDexApi'
import { removeDexApi } from '@/v3/features/livingdex/commands/removeDexApi'
import { apiGuard } from '@/v3/features/users/auth/serverside/apiGuard'
import { getSession } from '@/v3/features/users/auth/serverside/getSession'
import { apiErrors } from '@/v3/lib/utils/types'

const getDexHandler = async (req: NextApiRequest) => {
  const { id } = req.query

  return await getDexApi(String(id))
}

const deleteDexHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query
  const session = await getSession(req, res)
  const guard = apiGuard(session)

  if (!guard.allowed) {
    return guard
  }

  return await removeDexApi(String(id), guard.user.uid)
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const httpMethod = req.method || 'GET'

  if (!['GET', 'DELETE'].includes(httpMethod)) {
    res.status(apiErrors.notAllowed.statusCode).json(apiErrors.notAllowed.data)
    return
  }

  switch (httpMethod) {
    case 'GET':
      {
        const result = await getDexHandler(req)
        res.status(result.statusCode).json(result.data)
      }
      break
    case 'DELETE':
      {
        const result = await deleteDexHandler(req, res)
        res.status(result.statusCode).json(result.data)
      }
      break
  }
}

export default handler
