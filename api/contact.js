/* global process */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_RECIPIENT = 'info@idealtech.it'
const DEFAULT_FROM = 'Sito Idealtech <contatti@mail.idealtech.it>'
const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const MAX_PHONE_LENGTH = 60
const MAX_MESSAGE_LENGTH = 6000

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

function getRecipients() {
  return String(process.env.CONTACT_TO_EMAIL || DEFAULT_RECIPIENT)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

async function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body

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
      if (data.length > 20_000) req.destroy()
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
    return res.status(405).json({ success: false, message: 'Metodo non consentito.' })
  }

  try {
    const body = await getBody(req)

    // Campo honeypot: i bot tendono a compilarlo, gli utenti reali non lo vedono.
    if (String(body.website || '').trim()) {
      return res.status(200).json({ success: true, message: 'Messaggio inviato con successo.' })
    }

    const name = String(body.fullName || body.name || '').trim()
    const email = normalizeEmail(body.email)
    const phone = String(body.phone || '').trim()
    const message = String(body.message || '').trim()
    const title = String(body.title || 'Nuovo messaggio dal sito').trim()
    const source = String(body.source || 'Modulo contatti').trim()
    const privacyAccepted = Boolean(body.privacyAccepted)

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Compila tutti i campi obbligatori.',
      })
    }

    if (!privacyAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Devi accettare l’informativa privacy.',
      })
    }

    if (!isValidEmail(email) || email.length > MAX_EMAIL_LENGTH) {
      return res.status(400).json({
        success: false,
        message: 'Inserisci un indirizzo email valido.',
      })
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      phone.length > MAX_PHONE_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: 'Uno o più campi superano la lunghezza consentita.',
      })
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY non configurata')
      return res.status(500).json({
        success: false,
        message: 'Servizio email non configurato.',
      })
    }

    const recipients = getRecipients()
    const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM
    const safeTitle = escapeHtml(title)
    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safePhone = escapeHtml(phone || 'Non inserito')
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')
    const safeSource = escapeHtml(source)
    const submittedAt = new Date().toLocaleString('it-IT', {
      timeZone: 'Europe/Rome',
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const resendResponse = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: email,
        subject: `${title} - ${name}`,
        html: `
          <div style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
            <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dbe5ef;border-radius:18px;overflow:hidden;">
              <div style="padding:22px 24px;background:#123b69;color:#ffffff;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8d2ff;">Idealtech.it</p>
                <h1 style="margin:0;font-size:23px;line-height:1.3;">${safeTitle}</h1>
              </div>

              <div style="padding:24px;">
                <table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;">
                  <tr><td style="width:120px;padding:5px 0;color:#64748b;">Nome</td><td style="padding:5px 0;font-weight:700;">${safeName}</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;">Email</td><td style="padding:5px 0;"><a href="mailto:${safeEmail}" style="color:#176fdc;">${safeEmail}</a></td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;">Telefono</td><td style="padding:5px 0;">${safePhone}</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;">Origine</td><td style="padding:5px 0;">${safeSource}</td></tr>
                  <tr><td style="padding:5px 0;color:#64748b;">Data</td><td style="padding:5px 0;">${escapeHtml(submittedAt)}</td></tr>
                </table>

                <div style="margin-top:20px;padding:18px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;">Messaggio</p>
                  <div style="font-size:15px;line-height:1.7;">${safeMessage}</div>
                </div>

                <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
                  Rispondi direttamente a questa email: il destinatario della risposta sarà ${safeEmail}.
                </p>
              </div>
            </div>
          </div>
        `,
        text: [
          title,
          '',
          `Nome: ${name}`,
          `Email: ${email}`,
          `Telefono: ${phone || 'Non inserito'}`,
          `Origine: ${source}`,
          `Data: ${submittedAt}`,
          '',
          'Messaggio:',
          message,
        ].join('\n'),
      }),
    })

    const resendData = await resendResponse.json().catch(() => ({}))

    if (!resendResponse.ok) {
      console.error('Errore Resend:', resendData)
      return res.status(502).json({
        success: false,
        message: 'Il servizio email non ha accettato il messaggio. Controlla la configurazione Resend.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Messaggio inviato con successo.',
      id: resendData.id,
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Errore durante l’invio della mail.',
    })
  }
}
