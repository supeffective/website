import { GetServerSidePropsContext } from 'next'

import PageMeta from '@/v3/features/pages/components/PageMeta'
import { getSession } from '@/v3/features/users/auth/serverside/getSession'
import { getActivePatreonMembershipByUserId } from '@/v3/features/users/repository/memberships'
import { ProfileView } from '@/v3/features/users/views/ProfileView'
import { abs_url } from '@/v3/lib/components/Links'
import { Membership } from '@/v3/lib/prisma/types'
import { serializeObject } from '@/v3/lib/utils/serialization/jsonSerializable'

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
