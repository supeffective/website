import { useEffect } from 'react'

import { classNameIf, classNames } from '@/v3/lib/utils/deprecated'

export const LoadingBanner = ({ content }: { content?: any }) => {
  const hasContent = !!content

  const loaderSvg = (
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width={50} height={50}>
      <circle
        className="spinner"
        cx="20"
        cy="20"
        r="16"
        stroke="#00000055"
        strokeWidth={6}
        strokeDasharray="70 10 10"
        strokeDashoffset="-20"
        fill="none"
      />
    </svg>
  )
  useEffect(() => {
    if (hasContent) {
      return
    }
    // toggle loading class to body
    if (!document.body.classList.contains('loading')) {
      document.body.classList.add('loading')
    }
    return () => {
      document.body.classList.remove('loading')
    }
  }, [hasContent])
  return (
    <>
      {
        <div className="page-container">
          <div
            className={classNames(
              'inner-container',
              classNameIf(hasContent, 'bg-beige'),
              classNameIf(!hasContent, 'bg-black-semi fader'),
            )}
          >
            <p className={'font-title3 text-center'}>{content ? content : loaderSvg}</p>
          </div>
        </div>
      }
    </>
  )
}
