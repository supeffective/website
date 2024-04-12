import { type ReactNode, useEffect } from 'react'

export default function CannyScript({ onScriptLoaded }: { onScriptLoaded: () => void }): ReactNode {
  useEffect(() => {
    if (document.getElementById('canny_sdk') !== null) {
      return
    }
    if ('Canny' in window && typeof window.Canny === 'function') {
      return
    }

    const script = document.createElement('script')
    script.id = 'canny_sdk'
    script.src = 'https://canny.io/sdk.js'
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      onScriptLoaded()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return null
}
