import Link from 'next/link'

import { classNameIf, classNames } from '@/v3/lib/utils/deprecated'

import styles from './Button.module.css'

export default function Button({ className, inverted, outlined, ...props }: any) {
  return (
    <button
      className={classNames(
        styles.ctrl,
        styles.btn,
        classNameIf(inverted, styles.inverted),
        classNameIf(outlined, styles.outlined),
        className,
      )}
      {...props}
    >
      {props.children}
    </button>
  )
}

export function ButtonInternalLink({ href, inverted, outlined, className, ...props }: any) {
  return (
    <Link
      href={href}
      className={classNames(
        styles.ctrl,
        styles.btn,
        classNameIf(inverted, styles.inverted),
        classNameIf(outlined, styles.outlined),
        className,
      )}
      {...props}
    >
      {props.children}
    </Link>
  )
}

export function ButtonLink({ className, outlined, inverted, ...props }: any) {
  return (
    <a
      className={classNames(
        styles.ctrl,
        styles.btn,
        classNameIf(inverted, styles.inverted),
        classNameIf(outlined, styles.outlined),
        className,
      )}
      {...props}
    >
      {props.children}
    </a>
  )
}
