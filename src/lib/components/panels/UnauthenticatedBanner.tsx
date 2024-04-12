import { Routes } from '@/config/routes'

import { ButtonInternalLink } from '../Button'

export const UnauthenticatedBanner = () => {
  return (
    <>
      <div className="page-container">
        <div
          className="inner-container bg-white-semi"
          style={{ background: 'rgba(0,0,0,0.15)', color: 'rgba(255, 255, 255, 0.8)' }}
        >
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
