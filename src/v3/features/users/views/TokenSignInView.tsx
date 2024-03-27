import { ComponentPropsWithoutRef } from 'react'

import { Routes } from '@/v3/config/routes'
import Button from '@/v3/lib/components/Button'
import { TextInput } from '@/v3/lib/components/forms/TextInput'
import { getFullUrl } from '@/v3/lib/utils/urls'

type EmailSigninViewProps = {
  csrfToken: string | null
  buttonText?: string
} & ComponentPropsWithoutRef<'input'>

export default function TokenSignInView({
  csrfToken,
  buttonText = 'Sign In with Email and Token',
  ...rest
}: EmailSigninViewProps) {
  const loginUrl = getFullUrl(Routes.Login)

  return (
    <form method="get" action={Routes.API.SignInCallback} encType="application/x-www-form-urlencoded">
      <input name="callbackUrl" type="hidden" defaultValue={loginUrl} />
      <input name="csrfToken" type="hidden" defaultValue={csrfToken || undefined} />
      <TextInput type="email" id="email" required name="email" placeholder={'Email address'} {...rest} />

      <TextInput type="text" id="token" required name="token" placeholder={'Verification token'} {...rest} />
      <Button type="submit">{buttonText}</Button>
    </form>
  )
}
