import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Metodo non consentito.' })
  }

  try {
    const {
      fullName,
      email,
      message,
      privacyAccepted,
    } = req.body || {}

    if (!fullName || !email || !message) {
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

    const safeName = escapeHtml(fullName)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

    const { error } = await resend.emails.send({
      from: 'Sito Idealtech <noreply@idealtech.it>',
      to: ['info@idealtech.it'],
      replyTo: email,
      subject: `Nuovo messaggio dal sito - ${fullName}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
          <h2 style="margin-bottom:16px;">Nuova richiesta dal sito Idealtech</h2>
          <p><strong>Nome:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Messaggio:</strong></p>
          <div style="padding:14px 16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
            ${safeMessage}
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({
        success: false,
        message: 'Errore durante l’invio della mail.',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Messaggio inviato con successo.',
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return res.status(500).json({
      success: false,
      message: 'Errore interno del server.',
    })
  }
}