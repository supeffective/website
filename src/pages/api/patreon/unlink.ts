import { NextApiRequest, NextApiResponse } from 'next'

import { Routes } from '@/config/routes'
import { apiGuard } from '@/features/users/auth/serverside/apiGuard'
import { getSession } from '@/features/users/auth/serverside/getSession'
import { removePatreonMembership } from '@/features/users/repository/memberships'
import { apiErrors } from '@/lib/utils/types'

const unlinkPatreonAccount = async (
  res: NextApiResponse,
  userId: string,
  patreonMemberId: string | null,
): Promise<boolean> => {
  const changedRecords = await removePatreonMembership(userId, patreonMemberId)

  return changedRecords > 0
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const httpMethod = req.method || 'GET'

  if (!['POST'].includes(httpMethod)) {
    res.status(apiErrors.notAllowed.statusCode).json(apiErrors.notAllowed.data)
    return
  }

  const session = await getSession(req, res)

  const guard = apiGuard(session)
  if (!guard.allowed) {
    res.redirect(Routes.Login)
    res.status(guard.statusCode).json(guard.data)
    return
  }

  const memberId = req.body.patreonMemberId || null
  if (!memberId) {
    console.error('body.patreonMemberId is null in unlink call')
    res.redirect(Routes.Profile + '?status=error&provider=patreon&action=unlink')
    return
  }

  const successful = await unlinkPatreonAccount(res, guard.user.uid, memberId)

  switch (httpMethod) {
    case 'POST': {
      if (successful) {
        res.redirect(Routes.Profile + '?status=ok&provider=patreon&action=unlink')
        return
      }
      console.error('unlinkPatreonAccount failed')
      res.redirect(Routes.Profile + '?status=error&provider=patreon&action=unlink')
      return
      break
    }
  }
}

export default handler
