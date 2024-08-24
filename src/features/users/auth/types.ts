import { SignInResponse, SignOutResponse, useSession } from 'next-auth/react'

/**
 * Basic user data
 */
export type AuthUser<T = {}> = {
  /**
   * The user's unique ID, scoped to the project.
   */
  uid: string
  /**
   * The provider used to authenticate the user.
   */
  providerId: OAuthProviderName | 'email' | null
  /**
   * The email of the user.
   */
  email: string | null
  /**
   * Whether the user's email has been verified.
   */
  emailVerified: boolean
  /**
   * Whether the user is disabled.
   */
  isDisabled: boolean
  /**
   * The user's handle.
   */
  userName: string | null
  /**
   * The display name of the user.
   */
  displayName: string | null
  /**
   * The profile photo URL of the user.
   */
  photoUrl: string | null

  createdAt?: Date

  updatedAt?: Date

  lastSignInAt?: Date

  lastActivityAt?: Date
} & T

export enum AuthStatus {
  Loading = 'loading',
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
}

export enum OAuthProviderName {
  Google = 'google',
  Twitter = 'twitter',
  Github = 'github',
}

export type NextSession = ReturnType<typeof useSession>

export type AuthUserState = {
  status: AuthStatus
  currentUser: AuthUser | null
  membership: SessionMembership | null
  isAuthenticated: () => boolean
  isUnauthenticated: () => boolean
  isLoading: () => boolean
  isVerified: () => boolean
  isOperable: () => boolean
}

export type BaseAuthApi = AuthUserState

export type NextAuthApi = BaseAuthApi & {
  signIn: (email: string, redirect?: boolean, callbackUrl?: string) => Promise<SignInResponse | undefined>
  signOut: (redirect?: boolean, callbackUrl?: string) => Promise<SignOutResponse | undefined>
}

export type AuthApi = NextAuthApi & {}

export type SessionMembership = {
  patreonCampaignId: string
  patreonUserId: string | null
  patreonMemberId: string | null
  patronStatus: string | null
  provider: string
  currentTier: string
  highestTier: string
  isSubscriptionTier: boolean
  totalContributed: number
  createdAt: Date
  updatedAt: Date
  expiresAt: Date | null
  userId: string
  overridenRewards: boolean
  rewardMaxDexes: number
  rewardFeaturedStreamer: boolean
}
