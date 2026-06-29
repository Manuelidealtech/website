/* global process */
import nodemailer from 'nodemailer'

const CONTACT_RECIPIENT = process.env.CONTACT_TO_EMAIL || 'info@idealtech.it'

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase()
}

function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback
  return ['true', '1', 'yes', 'si', 'sì'].includes(String(value).trim().toLowerCase())
}

function getFromEmail() {
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

  if (!from) return ''
  if (from.includes('<')) return from

  return `Sito Idealtech <${from}>`
}

function getSmtpConfig() {
  const port = Number(process.env.SMTP_PORT || 587)

  return {
    host: process.env.SMTP_HOST,
    port,
    secure: parseBoolean(process.env.SMTP_SECURE, port === 465),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }
}

function hasSmtpConfig() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  )
}

async function getBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }

  return await new Promise((resolve) => {
    let data = ''

    req.on('data', (chunk) => {
      data += chunk
    })

    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })

    req.on('error', () => resolve({}))
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      message: 'Metodo non consentito.',
    })
  }

  try {
    const body = await getBody(req)
    const name = String(body.fullName || body.name || '').trim()
    const email = normalizeEmail(body.email)
    const phone = String(body.phone || '').trim()
    const message = String(body.message || '').trim()
    const title = String(body.title || 'Nuovo messaggio dal sito').trim()
    const privacyAccepted = Boolean(body.privacyAccepted)

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Compila tutti i campi obbligatori.',
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Inserisci un indirizzo email valido.',
      })
    }

    if (!privacyAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Devi accettare l’informativa privacy.',
      })
    }

    if (!hasSmtpConfig()) {
      console.error('Configurazione SMTP mancante: SMTP_HOST, SMTP_USER o SMTP_PASS non configurati')
      return res.status(500).json({
        success: false,
        message: 'Servizio email non configurato.',
      })
    }

    const fromEmail = getFromEmail()
    const safeTitle = escapeHtml(title)
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = escapeHtml(phone || 'Non inserito')
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

    const transporter = nodemailer.createTransport(getSmtpConfig())

    await transporter.sendMail({
      from: fromEmail,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: `${title} - ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:680px;">
          <h2 style="margin:0 0 16px;font-size:22px;">${safeTitle}</h2>
          <div style="padding:18px 20px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;">
            <p style="margin:0 0 8px;"><strong>Nome:</strong> ${safeName}</p>
            <p style="margin:0 0 8px;"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p style="margin:0 0 16px;"><strong>Telefono:</strong> ${safePhone}</p>
            <p style="margin:0 0 8px;"><strong>Messaggio:</strong></p>
            <div style="padding:14px 16px;border-radius:12px;background:#ffffff;border:1px solid #e5e7eb;">
              ${safeMessage}
            </div>
          </div>
          <p style="margin-top:16px;color:#64748b;font-size:13px;">
            Email inviata automaticamente dal modulo contatti del sito Idealtech.
          </p>
        </div>
      `,
      text: [
        title,
        '',
        `Nome: ${name}`,
        `Email: ${email}`,
        `Telefono: ${phone || 'Non inserito'}`,
        '',
        'Messaggio:',
        message,
      ].join('\n'),
    })

    return res.status(200).json({
      success: true,
      message: 'Messaggio inviato con successo.',
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Errore durante l’invio della mail.',
    })
  }
}
