import { useRouter } from 'next/compat/router'
import Link, { LinkProps } from 'next/link'
import React from 'react'

import config from '@/config'

export interface LinkDefinition {
  url: string
  content: React.ReactNode
  external: boolean
  icon?: string
}

interface NavLinkProps extends LinkProps {
  children: React.ReactElement | any
  activeClass?: string

  [key: string]: any
}

export const BASE_SITE_URL: string = config.baseUrl

export const abs_url = (relativePath: string) => {
  const noSlashesPath = relativePath.replace(/^\/|\/$/g, '')
  return `${BASE_SITE_URL}${noSlashesPath ? '/' + noSlashesPath : '/'}`
}

export function SiteLink({ children, href, className, activeClass = '', ...props }: NavLinkProps) {
  const router = useRouter()
  const classes = []
  classes.push(router?.pathname === href ? (activeClass ? activeClass + ' active' : 'active') : '')
  if (href === '/') {
    classes.push('home')
  }
  if (className) {
    classes.push(className)
  }
  return (
    <Link href={href} {...props} className={classes.join(' ')}>
      {children}
    </Link>
  )
}

export const ExternLink = ({
  children,
  href,
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
  ...props
}: any) => {
  return (
    <a href={href} target={target} rel={rel} className={className} {...props}>
      {children}
    </a>
  )
}
