import { NextApiRequest, NextApiResponse } from 'next'

import { apiErrors } from '@/v3/lib/utils/types'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const httpMethod = req.method || 'GET'

  if (!['GET', 'POST'].includes(httpMethod)) {
    res.status(apiErrors.notAllowed.statusCode).json(apiErrors.notAllowed.data)
    return
  }

  switch (httpMethod) {
    case 'GET':
    case 'POST': {
      console.log('req.method', httpMethod)
      console.log('req.headers', req.headers)
      console.log('req.query', req.query)
      console.log('req.body', req.body)
      res.status(200).json({ message: 'ok' })
      return
      break
    }
  }
}

export default handler
