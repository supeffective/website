import type { AppProps } from 'next/app'

import AppProviders from './AppProviders'
import ErrorBoundary from './ErrorBoundary'
import GoogleAds from './GoogleAds'
import PageSkeleton from './PageSkeleton'

function AppLayout({ Component, pageProps }: AppProps | any) {
  return (
    <AppProviders>
      <ErrorBoundary>
        <PageSkeleton>
          <GoogleAds />
          <Component {...pageProps} />
        </PageSkeleton>
      </ErrorBoundary>
    </AppProviders>
  )
}

export default AppLayout
