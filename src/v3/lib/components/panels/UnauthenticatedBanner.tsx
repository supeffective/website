import { Routes } from '@/v3/config/routes'

import { ButtonInternalLink } from '../Button'

export const UnauthenticatedBanner = () => {
  return (
    <>
      <div className="page-container">
        <div className="inner-container bg-white-semi" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <p className={'font-title3 text-center'}>
            You need to be logged in to access this page.
            <br />
            <br />
            <ButtonInternalLink href={Routes.Login}>Login</ButtonInternalLink>
          </p>
        </div>
      </div>
    </>
  )
}
