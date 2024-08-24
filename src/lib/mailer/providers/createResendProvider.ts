import { Resend } from 'resend'

import { isDevelopmentEnv } from '@/lib/utils/env'
import { EmailMessage, EmailProvider, EmailProviderConfig, EmailSenderFactory } from '../types'

const sendMailFactory: EmailSenderFactory = (config: EmailProviderConfig) => {
  return async (message: EmailMessage) => {
    const resendApi = new Resend(config.apiKey)

    const templateData = message.body.data || {}
    const renderText = () => {
      if (typeof message.body.text === 'function') {
        return message.body.text(templateData)
      }
      return message.body.text
    }
    const renderHtml = () => {
      if (typeof message.body.html === 'function') {
        return message.body.html(templateData)
      }
      return message.body.html
    }

    const payloadWithHtml = {
      to: message.to,
      from: message.from || config.defaultFrom,
      subject: message.subject,
      html: renderHtml(),
      text: renderText(),
      bcc: message.bcc,
      // react: it works with React components! try react-email
      cc: message.cc,
    }

    // const payload2 = {
    //   to: message.to,
    //   from: message.from || config.defaultFrom,
    //   subject: message.subject,
    //   html: renderText(),
    //   text: renderText(),
    //   // bcc: message.bcc,
    //   // react: it works with React components! try react-email
    //   // cc: message.cc,
    // }

    if (isDevelopmentEnv()) {
      console.info('RESEND: Payload', renderText())
    }
    try {
      const result = await resendApi.emails.send(payloadWithHtml)

      if (result.error) {
        console.error(result.data, result.error)
        throw result.error
      }

      // console.info('RESEND: Email sent successfully', result.data)
      return {
        success: true,
      }
    } catch (error) {
      console.error('CRITICAL ERROR: RESEND: Error sending email', error)
      return {
        success: false,
        errorMessage: String(error),
      }
    }
  }
}

const createResendProvider = (config: EmailProviderConfig): EmailProvider => ({
  id: 'resend',
  config,
  sendMail: sendMailFactory(config),
})

export default createResendProvider
