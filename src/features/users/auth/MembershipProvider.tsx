import { Membership } from '@prisma/client'
import { createContext, useContext } from 'react'
import { createMembershipPlaceholder } from '../repository/createMembershipPlaceholder'

const defaultMembership = createMembershipPlaceholder('')
const MembershipContext = createContext<Membership>(defaultMembership)

export const usePatreonMembership = (): Membership => {
  return useContext(MembershipContext)
}

export const PatreonMembershipProvider = ({
  children,
  membership,
}: {
  children: React.ReactNode
  membership: Membership
}) => {
  throw new Error('Not implemented')
  // return <MembershipContext.Provider value={membership}>{children}</MembershipContext.Provider>
}
