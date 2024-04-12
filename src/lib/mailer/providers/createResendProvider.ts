import { Resend } from 'resend'

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

    try {
      const result = await resendApi.emails.send({
        to: message.to,
        from: message.from || config.defaultFrom,
        subject: message.subject,
        html: renderHtml(),
        text: renderText(),
        bcc: message.bcc,
        // react: it works with React components! try react-email
        cc: message.cc,
      })
      return {
        success: true,
      }
    } catch (error) {
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
