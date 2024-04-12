import { log as axiomLogger } from 'next-axiom'
import React from 'react'

import PageSkeleton from './PageSkeleton'

class ErrorBoundary extends React.Component<any, { hasError: boolean; errorMessage?: string }> {
  constructor(props: any) {
    super(props)

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI

    return { hasError: true, errorMessage: error?.message || String(error) }
  }
  componentDidCatch(error: Error, errorInfo: any) {
    // You can use your own error logging service here
    console.error({ error, errorInfo })
    axiomLogger.error('ClientError', { error, errorInfo })
  }
  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <PageSkeleton>
          <article className={'page-authored-content'}>
            <div className={'page-container bordered-container inner-blueberry text-center'}>
              <h2 style={{ color: 'red' }}>Oops, there is a client error! 😵‍💫</h2>
              <code>❌ {this.state.errorMessage}</code>
            </div>
          </article>
        </PageSkeleton>
      )
    }

    // Return children components in case of no error

    return this.props.children
  }
}

export default ErrorBoundary
