/* global process */
import { createClient } from '@supabase/supabase-js'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Shop Idealtech <contatti@mail.idealtech.it>'
const MAX_BODY_SIZE = 60_000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getServerClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Configurazione Supabase server incompleta.')
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function normalizeText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength)
}

function normalizeEmail(value) {
  return normalizeText(value, 254).toLowerCase()
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })
}

async function getBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }

  return await new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > MAX_BODY_SIZE) req.destroy()
    })
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) }
    })
    req.on('error', () => resolve({}))
  })
}

function publicConfig(settings = {}) {
  return {
    shop_enabled: settings.shop_enabled !== false,
    shipping_cost: Number(settings.shipping_cost || 0),
    currency: 'EUR',
    bank: {
      account_holder: settings.bank_account_holder || '',
      bank_name: settings.bank_name || '',
      iban: settings.bank_iban || '',
      bic: settings.bank_bic || '',
      instructions: settings.bank_instructions || '',
    },
  }
}

async function loadSettings(supabase) {
  const { data, error } = await supabase.from('shop_settings').select('*').eq('id', 1).single()
  if (error) throw new Error(`Impostazioni shop non disponibili: ${error.message}`)
  return data
}

function validateOrderBody(body) {
  const source = body.customer || {}
  const customer = {
    company: normalizeText(source.company, 160),
    vat_number: normalizeText(source.vatNumber, 32),
    tax_code: normalizeText(source.taxCode, 32),
    full_name: normalizeText(source.fullName, 140),
    email: normalizeEmail(source.email),
    phone: normalizeText(source.phone, 60),
    address: normalizeText(source.address, 220),
    city: normalizeText(source.city, 120),
    postal_code: normalizeText(source.postalCode, 16),
    province: normalizeText(source.province, 60),
    country: normalizeText(source.country, 80),
    notes: normalizeText(source.notes, 2000),
  }

  if (normalizeText(source.website, 200)) return { isBot: true }
  if (!source.privacyAccepted) throw new Error('Devi accettare l’informativa privacy.')
  if (!customer.company || !customer.vat_number || !customer.full_name || !customer.email || !customer.phone) {
    throw new Error('Compila tutti i dati aziendali e di contatto obbligatori.')
  }
  if (!customer.address || !customer.city || !customer.postal_code || !customer.country) {
    throw new Error('Compila tutti i dati di consegna obbligatori.')
  }
  if (!EMAIL_PATTERN.test(customer.email)) throw new Error('Inserisci un indirizzo email valido.')

  const rawItems = Array.isArray(body.items) ? body.items : []
  if (!rawItems.length || rawItems.length > 50) throw new Error('Il carrello non contiene prodotti validi.')

  const items = rawItems.map((item) => ({
    product_id: normalizeText(item.productId, 64),
    quantity: Math.floor(Number(item.quantity)),
  }))

  if (items.some((item) => !item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
    throw new Error('Una quantità nel carrello non è valida.')
  }

  return { customer, items, isBot: false }
}

function buildEmailHtml(order) {
  const rows = (order.items || []).map((item) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.name)}${item.sku ? `<br><small style="color:#64748b;">${escapeHtml(item.sku)}</small>` : ''}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(item.line_total)}</td>
    </tr>
  `).join('')

  return `
    <div style="margin:0;padding:24px;background:#eef4fa;font-family:Arial,sans-serif;color:#10243e;">
      <div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #dce6ef;border-radius:18px;overflow:hidden;">
        <div style="padding:24px;background:#123b69;color:#fff;">
          <p style="margin:0 0 6px;color:#9fd0ff;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">Shop Idealtech</p>
          <h1 style="margin:0;font-size:24px;">Nuovo ordine ${escapeHtml(order.order_number)}</h1>
        </div>
        <div style="padding:24px;">
          <h2 style="margin:0 0 14px;font-size:18px;">Cliente</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6;">
            <tr><td style="width:145px;padding:4px 0;color:#64748b;">Azienda</td><td style="padding:4px 0;font-weight:700;">${escapeHtml(order.company)}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">P. IVA</td><td style="padding:4px 0;">${escapeHtml(order.vat_number)}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">Referente</td><td style="padding:4px 0;">${escapeHtml(order.full_name)}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">Telefono</td><td style="padding:4px 0;">${escapeHtml(order.phone)}</td></tr>
            <tr><td style="padding:4px 0;color:#64748b;">Consegna</td><td style="padding:4px 0;">${escapeHtml(`${order.address}, ${order.postal_code} ${order.city} ${order.province || ''} - ${order.country}`)}</td></tr>
          </table>

          <h2 style="margin:24px 0 10px;font-size:18px;">Prodotti</h2>
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead><tr style="background:#f1f6fb;"><th style="padding:10px 8px;text-align:left;">Prodotto</th><th style="padding:10px 8px;text-align:center;">Q.tà</th><th style="padding:10px 8px;text-align:right;">Totale</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>

          <div style="margin:20px 0 0 auto;max-width:330px;font-size:14px;line-height:1.8;">
            <div style="display:flex;justify-content:space-between;"><span>Imponibile</span><strong>${formatMoney(order.net_total)}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>IVA</span><strong>${formatMoney(order.vat_total)}</strong></div>
            <div style="display:flex;justify-content:space-between;"><span>Spedizione</span><strong>${formatMoney(order.shipping_total)}</strong></div>
            <div style="display:flex;justify-content:space-between;margin-top:7px;padding-top:9px;border-top:2px solid #dce6ef;font-size:18px;"><span>Totale</span><strong>${formatMoney(order.grand_total)}</strong></div>
          </div>

          ${order.notes ? `<div style="margin-top:22px;padding:15px;border-radius:12px;background:#f8fafc;"><strong>Note del cliente</strong><p style="margin:8px 0 0;white-space:pre-wrap;">${escapeHtml(order.notes)}</p></div>` : ''}
          <p style="margin:22px 0 0;color:#64748b;font-size:13px;">L’ordine è disponibile anche nella sezione Shop e ordini del pannello amministrativo.</p>
        </div>
      </div>
    </div>
  `
}

async function sendOrderEmail(order, settings) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata.')
  const recipient = normalizeEmail(settings.commercial_email)
  if (!recipient || !EMAIL_PATTERN.test(recipient)) throw new Error('Email commerciale non configurata.')

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [recipient],
      reply_to: order.email,
      subject: `Nuovo ordine shop ${order.order_number} - ${order.company}`,
      html: buildEmailHtml(order),
      text: [
        `Nuovo ordine ${order.order_number}`,
        `Azienda: ${order.company}`,
        `Referente: ${order.full_name}`,
        `Email: ${order.email}`,
        `Telefono: ${order.phone}`,
        `Totale: ${formatMoney(order.grand_total)}`,
        '',
        ...(order.items || []).map((item) => `${item.quantity} x ${item.name} — ${formatMoney(item.line_total)}`),
      ].join('\n'),
    }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || 'Il servizio email non ha accettato la notifica.')
  return result.id || null
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ success: false, message: 'Metodo non consentito.' })
  }

  try {
    const supabase = getServerClient()
    const settings = await loadSettings(supabase)

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, config: publicConfig(settings) })
    }

    const body = await getBody(req)
    const validated = validateOrderBody(body)
    if (validated.isBot) return res.status(200).json({ success: true })
    if (settings.shop_enabled === false) return res.status(503).json({ success: false, message: 'Lo shop è momentaneamente sospeso.' })

    const { data: createdOrder, error: orderError } = await supabase.rpc('create_shop_order', {
      p_customer: validated.customer,
      p_items: validated.items,
    })
    if (orderError) throw new Error(orderError.message)

    const order = typeof createdOrder === 'string' ? JSON.parse(createdOrder) : createdOrder
    let emailSent = false
    let emailId = null
    let emailError = null

    try {
      emailId = await sendOrderEmail(order, settings)
      emailSent = true
    } catch (notificationError) {
      emailError = notificationError.message || 'Errore invio email.'
      console.error('Order notification error:', notificationError)
    }

    await supabase
      .from('shop_orders')
      .update({
        email_sent_at: emailSent ? new Date().toISOString() : null,
        email_message_id: emailId,
        email_error: emailError,
      })
      .eq('id', order.order_id)

    return res.status(201).json({
      success: true,
      order_number: order.order_number,
      total: Number(order.grand_total),
      email_sent: emailSent,
      bank: publicConfig(settings).bank,
    })
  } catch (error) {
    console.error('Orders API error:', error)
    const message = error.message || 'Errore durante la registrazione dell’ordine.'
    const isClientError = /obbligator|valid|carrello|quantità|disponibil|pubblicato|stock|privacy/i.test(message)
    return res.status(isClientError ? 400 : 500).json({ success: false, message })
  }
}
