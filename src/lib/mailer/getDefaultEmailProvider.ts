import { envVars } from '@/config/env'

import createFilesystemProvider from './providers/createFilesystemProvider'
import createResendProvider from './providers/createResendProvider'
import { EmailProvider } from './types'

export function getDefaultEmailProvider(): EmailProvider {
  const emailProviderId = envVars.EMAIL_PROVIDER as EmailProvider['id']
  const defaultFrom: string = envVars.EMAIL_DEFAULT_FROM!

  switch (emailProviderId) {
    case 'filesystem': {
      return createFilesystemProvider({
        defaultFrom,
      })
    }
    case 'resend':
      return createResendProvider({
        apiKey: envVars.RESEND_API_KEY!,
        defaultFrom,
      })
    case 'console':
      return {
        id: 'console',
        config: { defaultFrom },
        sendMail: async (message) => {
          console.log('Email sent:', {
            from: message.from,
            to: message.to,
            subject: message.subject,
            text: message.body.text,
          })
          return { success: true }
        },
      }
    default:
      if (!emailProviderId) {
        throw new Error('EMAIL_PROVIDER env var is missing')
      }
      throw new Error(`Unknown email provider: ${emailProviderId}`)
  }
}
