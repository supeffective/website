import { ComponentPropsWithoutRef } from 'react'

import { classNames } from '@/v3/lib/utils/deprecated'

import styles from './TextInput.module.css'

export function TextInput({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'input'> & { children?: React.ReactNode }) {
  return (
    <div className={styles.Root}>
      <input {...props} className={classNames(styles.Input, className)} />
      {children}
    </div>
  )
}
