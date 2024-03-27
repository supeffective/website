export type EmailSmtpConfig = {
  host: string
  port: number
  auth: {
    user: string
    pass: string
  }
}

export type EmailProviderConfig = {
  server?: EmailSmtpConfig
  apiKey?: string
  defaultFrom: string
}
export type EmailProvider = {
  id: 'resend' | 'console' | 'filesystem'
  config: EmailProviderConfig
  sendMail: EmailSender
}

export type EmailSenderFactory = (config: EmailProviderConfig) => EmailSender

export type EmailSender = (message: EmailMessage) => Promise<EmailSenderResult>

export type EmailSenderResult = {
  success: boolean
  errorMessage?: string
}

export type EmailMessage<T extends Record<string, any> = {}> = {
  subject: string
  to: string
  from?: string
  cc?: string
  bcc?: string
  body: {
    data?: T
    text: string | EmailBodyComposer<T>
    html: string | EmailBodyComposer<T>
  }
  headers?: Record<string, string>
  priority?: 'high' | 'normal' | 'low'
}

export type EmailBodyComposer<T extends Record<string, any>> = (data: T) => string
