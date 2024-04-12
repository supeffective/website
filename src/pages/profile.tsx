import { GetServerSidePropsContext } from 'next'

import PageMeta from '@/features/pages/components/PageMeta'
import { getSession } from '@/features/users/auth/serverside/getSession'
import { getActivePatreonMembershipByUserId } from '@/features/users/repository/memberships'
import { ProfileView } from '@/features/users/views/ProfileView'
import { abs_url } from '@/lib/components/Links'
import { serializeObject } from '@/lib/utils/serialization/jsonSerializable'
import { Membership } from '@/prisma/types'

const Page = ({ membership }: { membership: any | undefined }) => {
  // TODO: fix use deserializeObject
  const membershipData = membership ? serializeObject<Membership>(membership) : undefined
  return (
    <div className={'page-container'}>
      <PageMeta
        metaTitle={'Profile - Supereffective'}
        metaDescription={''}
        robots={'noindex, nofollow'}
        canonicalUrl={abs_url('/profile')}
        lang={'en'}
      />
      <div className="page-container">
        <div className="bordered-container inner-container inner-blueberry">
          <ProfileView membership={membershipData} />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getSession(ctx.req, ctx.res)
  if (!session?.currentUser?.uid) {
    return {
      props: {
        membership: undefined,
      },
    }
  }

  const membership = await getActivePatreonMembershipByUserId(session.currentUser.uid)

  // console.log('membership', {membership, userId: session.currentUser.uid})

  return {
    props: {
      membership: membership ? serializeObject(membership) : null,
    },
  }
}

export default Page
