import { SessionMembership } from '@/features/users/auth/types'
// import { DefaultJWT } from '@auth/core/jwt'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  // Extend session to hold the access_token
  interface Session extends DefaultSession {
    membership: SessionMembership | null
  }

  // Extend token to hold the access_token before it gets put into session
  // interface JWT {
  //   access_token: string & DefaultJWT
  // }
}
