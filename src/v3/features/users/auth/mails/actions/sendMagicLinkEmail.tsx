import { hasTooManyValidVerificationTokens } from '@/v3/features/users/repository/getUser'
import { sendMail } from '@/v3/lib/mailer/sendMail'
import { EmailMessage } from '@/v3/lib/mailer/types'
import { base64Encode } from '@/v3/lib/utils/serialization/base64'

import { SendVerificationRequestParams } from 'next-auth/providers/email'
import pageConfig from '../../pageConfig'
import { renderHtml, renderText } from '../templates/magic-link.tpl'

const maxTokens = 5

const buildLoginMiddlePageUrl = (originUrl: string): string => {
  const nextUrlObj = new URL(originUrl)
  nextUrlObj.pathname = pageConfig.signInVerification
  nextUrlObj.search = ''
  nextUrlObj.searchParams.set(pageConfig.signInVerificationParam, base64Encode(originUrl))

  return nextUrlObj.toString()
}

const sendMagicLinkEmail = async (params: SendVerificationRequestParams) => {
  const emailAlreadySent = await hasTooManyValidVerificationTokens(params.identifier, maxTokens)
  if (emailAlreadySent) {
    console.error(`[NEXT_AUTH] User has already more than ${maxTokens} sign in tokens`, params.identifier)
    return
  }
  const { identifier, url: loginUrl, token } = params

  const middlePageUrl = buildLoginMiddlePageUrl(loginUrl)
  const message: EmailMessage = {
    to: identifier,
    // from: 'noreply@supereffective.gg',
    subject: `Sign in to SuperEffective.gg`,
    body: {
      text: renderText(middlePageUrl, token),
      html: renderHtml(middlePageUrl, token),
    },
  }

  const deliveryResult = await sendMail(message)
  if (!deliveryResult.success) {
    throw new Error(`[NEXT_AUTH] Email could not be sent: ${deliveryResult.errorMessage}`)
  }
}

export default sendMagicLinkEmail
