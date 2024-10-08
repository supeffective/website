import { NextApiRequest, NextApiResponse } from 'next'

import { cacheConfig } from '@/config/cache'
import { getDexesApi } from '@/features/livingdex/commands/getDexesApi'
import { saveDexApi } from '@/features/livingdex/commands/saveDexApi'
import { apiGuard } from '@/features/users/auth/serverside/apiGuard'
import { getSession } from '@/features/users/auth/serverside/getSession'
import { AuthUser, AuthUserState } from '@/features/users/auth/types'
import { apiErrors } from '@/lib/utils/types'

// TODO: convert to Edge runtime when Next-Auth getSession(ctx) supports it
// https://nextjs.org/docs/api-routes/edge-api-routes

const listHandler = async (user: AuthUser) => {
  return await getDexesApi(user.uid)
}

const upsertHandler = async (session: AuthUserState, req: NextApiRequest) => {
  return await saveDexApi(req.body, session)
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const httpMethod = req.method || 'GET'

  if (!['GET', 'PATCH'].includes(httpMethod)) {
    res.status(apiErrors.notAllowed.statusCode).json(apiErrors.notAllowed.data)
    return
  }

  const session = await getSession(req, res)

  const guard = apiGuard(session)
  if (!guard.allowed) {
    res.status(guard.statusCode).json({ message: guard.data })
    return
  }

  switch (httpMethod) {
    case 'GET': {
      const result = await listHandler(guard.user)
      Object.entries(result.headers || {}).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      res.setHeader('Cache-Control', 'public, s-maxage=' + cacheConfig.apiResponseCacheSeconds)
      res.status(result.statusCode).json(result.data)
      break
    }
    case 'PATCH': {
      const result = await upsertHandler(guard.session, req)
      res.status(result.statusCode).json(result.data)
      break
    }
  }
}

export default handler
