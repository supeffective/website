import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth, { AuthOptions } from 'next-auth'

export const createAuthRouter = (req: NextApiRequest, res: NextApiResponse, authOptions: AuthOptions) => {
  return NextAuth(req, res, authOptions)
}
