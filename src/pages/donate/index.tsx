import PageMeta from '@/v3/features/pages/components/PageMeta'
import { ButtonLink } from '@/v3/lib/components/Button'
import { abs_url } from '@/v3/lib/components/Links'

const Page = () => {
  return (
    <div className={'page-container'} style={{ maxWidth: 'none' }}>
      <PageMeta
        metaTitle={'Donate - Supereffective.gg'}
        metaDescription={''}
        robots={'noindex,nofollow'}
        canonicalUrl={abs_url('/donate')}
        lang={'en'}
      />
      <div className="page-container">
        <div className="bordered-container inner-container inner-blueberry text-center">
          <h1>Supporting this site</h1>
          <p className="text-justify">
            You can help support the development and hosting costs of this website by making a donation.
            <br /> <br />
            When you donate via Patreon, you will receive a special role on our Discord server and you will also get
            special benefits on the website, such as extra dex trackers.
            <br /> <br />
            If you are a regular donor via Paypal, you will also have these benefits, but only temporarily (depending on
            the donation, in relation to a Patreon subscription in months), and you will need to contact us in order for
            us to link and grant them to your user.
            <br /> <br />
            Thank you for your contribution, or at least for considering it ❤️.
            <br /> <br />
            <cite>— Javier Aguilar - Webmaster and Developer.</cite>
          </p>
          <br />
          <p className="text-center">
            <ButtonLink
              href="https://www.patreon.com/supereffective"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: '#FF424D', color: '#181818' }}
            >
              <i className="icon-pkg-mark-heart" title="Donate" style={{ color: '#181818' }} /> Become a Patron
            </ButtonLink>

            <ButtonLink
              href="https://www.paypal.com/donate/?hosted_button_id=ZJX6VGBGTB8G4"
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: '#FFC43A', color: '#141661', borderColor: '#141661' }}
            >
              <i className="icon-pkg-mark-heart" title="Donate" style={{ color: '#141661' }} /> Donate with Paypal
            </ButtonLink>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
