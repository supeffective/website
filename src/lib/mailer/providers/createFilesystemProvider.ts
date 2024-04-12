import fs from 'node:fs'
import path from 'node:path'

import { EmailMessage, EmailProvider, EmailProviderConfig, EmailSenderFactory } from '../types'

const mailsPath = path.join(process.cwd(), '.local/mails')

const sendMailFactory: EmailSenderFactory = (config: EmailProviderConfig) => {
  return async (message: EmailMessage) => {
    if (!fs.existsSync(mailsPath)) {
      fs.mkdirSync(mailsPath, { recursive: true })
    }

    const mailFilename = path.join(mailsPath, `mail-${Date.now()}`)

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

    const mailData = {
      to: message.to,
      from: message.from || config.defaultFrom,
      subject: message.subject,
      cc: message.cc,
      bcc: message.bcc,
      headers: message.headers,
      priority: message.priority,
      text: renderText(),
    }

    fs.writeFileSync(`${mailFilename}.html`, renderHtml())
    fs.writeFileSync(`${mailFilename}.json`, JSON.stringify(mailData, null, 2))

    console.log('Email sent:', mailData.text)

    return {
      success: true,
      errorMessage: undefined,
    }
  }
}

const createFilesystemProvider = (config: EmailProviderConfig): EmailProvider => ({
  id: 'filesystem',
  config,
  sendMail: sendMailFactory(config),
})

export default createFilesystemProvider
