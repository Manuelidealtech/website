/* global process */
import { createClient } from '@supabase/supabase-js'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Shop Idealtech <contatti@mail.idealtech.it>'
const DEFAULT_SITE_ORIGIN = 'https://www.idealtech.it'
const MAX_BODY_SIZE = 60_000
const EMAIL_MAX_ATTEMPTS = 3
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ORDER_STATUS_EMAILS = {
  new: {
    label: 'Nuovo',
    title: 'Il tuo ordine è stato registrato',
    message: 'Abbiamo ricevuto correttamente il tuo ordine. Il nostro ufficio commerciale lo prenderà in carico al più presto.',
    color: '#1769c2',
    background: '#e7f2ff',
  },
  awaiting_payment: {
    label: 'In attesa di bonifico',
    title: 'Siamo in attesa del pagamento',
    message: 'Il tuo ordine è confermato e rimane in attesa del bonifico bancario. Ricorda di indicare il numero ordine nella causale.',
    color: '#9a5b00',
    background: '#fff4d6',
  },
  paid: {
    label: 'Pagato',
    title: 'Pagamento ricevuto',
    message: 'Abbiamo registrato il pagamento del tuo ordine. Grazie, procederemo con le attività successive.',
    color: '#16704a',
    background: '#e2f7ed',
  },
  processing: {
    label: 'In lavorazione',
    title: 'Il tuo ordine è in lavorazione',
    message: 'Il nostro team sta preparando il tuo ordine. Riceverai un nuovo aggiornamento quando sarà spedito.',
    color: '#6d46b3',
    background: '#f0e9ff',
  },
  shipped: {
    label: 'Spedito',
    title: 'Il tuo ordine è stato spedito',
    message: 'Il tuo ordine è stato affidato per la consegna ed è ora in viaggio verso l’indirizzo indicato.',
    color: '#075e78',
    background: '#dff6fc',
  },
  completed: {
    label: 'Completato',
    title: 'Ordine completato',
    message: 'L’ordine risulta completato. Grazie per aver scelto Idealtech.',
    color: '#166534',
    background: '#dcfce7',
  },
  cancelled: {
    label: 'Annullato',
    title: 'Ordine annullato',
    message: 'Il tuo ordine è stato annullato. Per qualsiasi chiarimento puoi rispondere direttamente a questa email.',
    color: '#b42318',
    background: '#feeceb',
  },
}

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

function getSiteOrigin() {
  return String(process.env.SITE_URL || DEFAULT_SITE_ORIGIN).replace(/\/$/, '')
}

function customerRow(label, value, options = {}) {
  if (!value) return ''
  const safeValue = escapeHtml(value)
  let content = safeValue

  if (options.href) {
    content = `<a href="${escapeHtml(options.href)}" style="color:#1769c2;text-decoration:underline;font-weight:700;">${safeValue}</a>`
  }

  return `
    <tr>
      <td class="detail-label" style="width:150px;padding:7px 18px 7px 0;color:#64748b;font-size:13px;line-height:20px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:7px 0;color:#10243e;font-size:14px;line-height:20px;font-weight:${options.strong ? '700' : '400'};vertical-align:top;">${content}</td>
    </tr>
  `
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

function buildProductRows(order) {
  return (order.items || []).map((item) => `
    <tr>
      <td bgcolor="#ffffff" style="padding:14px 12px;border-bottom:1px solid #e4ebf2;color:#10243e;font-size:14px;line-height:20px;">
        <strong>${escapeHtml(item.name)}</strong>
        ${item.sku ? `<br><span style="color:#738398;font-size:12px;">Cod. ${escapeHtml(item.sku)}</span>` : ''}
      </td>
      <td bgcolor="#ffffff" style="padding:14px 8px;border-bottom:1px solid #e4ebf2;color:#10243e;font-size:14px;line-height:20px;text-align:center;">${item.quantity}</td>
      <td bgcolor="#ffffff" style="padding:14px 12px;border-bottom:1px solid #e4ebf2;color:#10243e;font-size:14px;line-height:20px;text-align:right;white-space:nowrap;"><strong>${formatMoney(item.line_total)}</strong></td>
    </tr>
  `).join('')
}

function bankRow(label, value, options = {}) {
  if (!value) return ''
  return `
    <tr>
      <td style="padding:7px 0;color:#64748b;font-size:13px;line-height:20px;vertical-align:top;">${escapeHtml(label)}</td>
      <td align="right" style="padding:7px 0 7px 18px;color:#10243e;font-family:${options.mono ? "Consolas,'Courier New',monospace" : 'Arial,Helvetica,sans-serif'};font-size:${options.mono ? '14px' : '13px'};line-height:20px;font-weight:700;vertical-align:top;word-break:break-word;">${escapeHtml(value)}</td>
    </tr>
  `
}

function buildCommercialEmailHtml(order) {
  const rows = buildProductRows(order)

  const deliveryAddress = `${order.address}, ${order.postal_code} ${order.city}${order.province ? ` (${order.province})` : ''}, ${order.country}`
  const adminUrl = `${getSiteOrigin()}/admin/shop`
  const logoUrl = `${getSiteOrigin()}/logo-idealtech-900.webp`
  const receivedAt = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Nuovo ordine ${escapeHtml(order.order_number)}</title>
        <style>
          :root { color-scheme: light only; supported-color-schemes: light; }
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          table { border-spacing: 0; border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
          @media only screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .detail-label { width: 105px !important; }
            .summary-table { width: 100% !important; }
            .header-logo { width: 170px !important; height: auto !important; }
          }
        </style>
      </head>
      <body bgcolor="#eef4fa" style="margin:0;padding:0;background-color:#eef4fa;color:#10243e;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Nuovo ordine ${escapeHtml(order.order_number)} ricevuto da ${escapeHtml(order.company)}.</div>
        <table role="presentation" width="100%" bgcolor="#eef4fa" style="width:100%;background-color:#eef4fa;">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <table role="presentation" class="email-shell" width="680" bgcolor="#ffffff" style="width:680px;max-width:680px;background-color:#ffffff;border:1px solid #d8e3ed;border-radius:18px;overflow:hidden;">
                <tr>
                  <td class="email-pad" bgcolor="#ffffff" style="padding:20px 32px;background-color:#ffffff;border-bottom:1px solid #e4ebf2;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td valign="middle">
                          <img class="header-logo" src="${escapeHtml(logoUrl)}" width="190" alt="Idealtech" style="width:190px;max-width:100%;height:auto;">
                        </td>
                        <td align="right" valign="middle" style="color:#1769c2;font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Shop online</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#0e3b68" style="padding:30px 32px;background-color:#0e3b68;color:#ffffff;">
                    <p style="margin:0 0 8px;color:#8dc6ff;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">Nuovo ordine ricevuto</p>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:35px;font-weight:700;">${escapeHtml(order.order_number)}</h1>
                    <p style="margin:10px 0 0;color:#dbeafe;font-size:15px;line-height:22px;">${escapeHtml(order.company)} · ${escapeHtml(receivedAt)}</p>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#ffffff" style="padding:30px 32px;background-color:#ffffff;">
                    <p style="margin:0 0 16px;color:#1769c2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">Dati cliente</p>
                    <table role="presentation" width="100%" style="width:100%;">
                      ${customerRow('Azienda', order.company, { strong: true })}
                      ${customerRow('Partita IVA', order.vat_number)}
                      ${customerRow('Codice fiscale', order.tax_code)}
                      ${customerRow('Referente', order.full_name)}
                      ${customerRow('Email', order.email, { href: `mailto:${order.email}` })}
                      ${customerRow('Telefono', order.phone, { href: `tel:${String(order.phone || '').replace(/[^+\d]/g, '')}` })}
                      ${customerRow('Consegna', deliveryAddress)}
                    </table>

                    <table role="presentation" width="100%" style="width:100%;margin-top:28px;">
                      <tr>
                        <td style="padding:0 0 12px;color:#1769c2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">Prodotti ordinati</td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" style="width:100%;border:1px solid #dce6ef;border-radius:10px;overflow:hidden;">
                      <thead>
                        <tr>
                          <th bgcolor="#f1f6fb" style="padding:11px 12px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:left;">Prodotto</th>
                          <th bgcolor="#f1f6fb" style="padding:11px 8px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:center;">Q.tà</th>
                          <th bgcolor="#f1f6fb" style="padding:11px 12px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:right;">Totale</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>

                    <table role="presentation" width="100%" style="width:100%;margin-top:20px;">
                      <tr>
                        <td>&nbsp;</td>
                        <td width="310" valign="top">
                          <table role="presentation" class="summary-table" width="310" bgcolor="#f5f9fd" style="width:310px;background-color:#f5f9fd;border:1px solid #dce6ef;border-radius:10px;">
                            <tr><td style="padding:14px 16px 5px;color:#64748b;font-size:13px;">Imponibile</td><td align="right" style="padding:14px 16px 5px;color:#10243e;font-size:13px;white-space:nowrap;">${formatMoney(order.net_total)}</td></tr>
                            <tr><td style="padding:5px 16px;color:#64748b;font-size:13px;">IVA</td><td align="right" style="padding:5px 16px;color:#10243e;font-size:13px;white-space:nowrap;">${formatMoney(order.vat_total)}</td></tr>
                            <tr><td style="padding:5px 16px 14px;color:#64748b;font-size:13px;">Spedizione</td><td align="right" style="padding:5px 16px 14px;color:#10243e;font-size:13px;white-space:nowrap;">${Number(order.shipping_total || 0) === 0 ? 'Gratuita' : formatMoney(order.shipping_total)}</td></tr>
                            <tr><td bgcolor="#e7f2ff" style="padding:14px 16px;background-color:#e7f2ff;border-top:1px solid #c9def2;color:#0e3b68;font-size:17px;font-weight:700;">Totale ordine</td><td bgcolor="#e7f2ff" align="right" style="padding:14px 16px;background-color:#e7f2ff;border-top:1px solid #c9def2;color:#0e3b68;font-size:19px;font-weight:700;white-space:nowrap;">${formatMoney(order.grand_total)}</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${order.notes ? `
                      <table role="presentation" width="100%" bgcolor="#f8fafc" style="width:100%;margin-top:24px;background-color:#f8fafc;border-left:4px solid #3b8eea;">
                        <tr><td style="padding:16px 18px;color:#10243e;font-size:14px;line-height:21px;"><strong>Note del cliente</strong><br><span style="color:#40536a;white-space:pre-wrap;">${escapeHtml(order.notes)}</span></td></tr>
                      </table>
                    ` : ''}

                    <table role="presentation" width="100%" style="width:100%;margin-top:28px;">
                      <tr>
                        <td align="center">
                          <table role="presentation">
                            <tr>
                              <td bgcolor="#1976d2" style="background-color:#1976d2;border-radius:9px;">
                                <a href="${escapeHtml(adminUrl)}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;">Apri ordine nel pannello&nbsp; →</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#f1f6fb" style="padding:18px 32px;background-color:#f1f6fb;border-top:1px solid #dce6ef;color:#6b7c91;font-size:12px;line-height:18px;text-align:center;">
                    Notifica automatica dello Shop Idealtech · Puoi rispondere direttamente a questa email per contattare il cliente.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function buildCustomerEmailHtml(order, settings) {
  const rows = buildProductRows(order)
  const logoUrl = `${getSiteOrigin()}/logo-idealtech-900.webp`
  const shopUrl = `${getSiteOrigin()}/shop`
  const deliveryAddress = `${order.address}, ${order.postal_code} ${order.city}${order.province ? ` (${order.province})` : ''}, ${order.country}`
  const bankInstructions = settings.bank_instructions || 'La lavorazione dell’ordine inizierà dopo la ricezione del bonifico.'

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Conferma ordine ${escapeHtml(order.order_number)}</title>
        <style>
          :root { color-scheme: light only; supported-color-schemes: light; }
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          table { border-spacing: 0; border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
          @media only screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .summary-table, .bank-table { width: 100% !important; }
            .header-logo { width: 170px !important; height: auto !important; }
          }
        </style>
      </head>
      <body bgcolor="#eef4fa" style="margin:0;padding:0;background-color:#eef4fa;color:#10243e;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Ordine ${escapeHtml(order.order_number)} confermato. Consulta il riepilogo e i dati per il bonifico.</div>
        <table role="presentation" width="100%" bgcolor="#eef4fa" style="width:100%;background-color:#eef4fa;">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <table role="presentation" class="email-shell" width="680" bgcolor="#ffffff" style="width:680px;max-width:680px;background-color:#ffffff;border:1px solid #d8e3ed;border-radius:18px;overflow:hidden;">
                <tr>
                  <td class="email-pad" bgcolor="#ffffff" style="padding:20px 32px;background-color:#ffffff;border-bottom:1px solid #e4ebf2;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td valign="middle"><img class="header-logo" src="${escapeHtml(logoUrl)}" width="190" alt="Idealtech" style="width:190px;max-width:100%;height:auto;"></td>
                        <td align="right" valign="middle" style="color:#1769c2;font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Shop online</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#0e3b68" style="padding:30px 32px;background-color:#0e3b68;color:#ffffff;">
                    <p style="margin:0 0 8px;color:#8dc6ff;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">Ordine ricevuto correttamente</p>
                    <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:35px;font-weight:700;">Grazie per il tuo ordine</h1>
                    <p style="margin:10px 0 0;color:#dbeafe;font-size:15px;line-height:22px;">Riferimento <strong>${escapeHtml(order.order_number)}</strong></p>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#ffffff" style="padding:30px 32px;background-color:#ffffff;">
                    <p style="margin:0;color:#10243e;font-size:16px;line-height:25px;">Ciao <strong>${escapeHtml(order.full_name)}</strong>,</p>
                    <p style="margin:10px 0 0;color:#40536a;font-size:14px;line-height:22px;">abbiamo registrato l’ordine per <strong>${escapeHtml(order.company)}</strong>. Di seguito trovi il riepilogo e le coordinate per completare il pagamento tramite bonifico bancario.</p>

                    <table role="presentation" width="100%" bgcolor="#fff8e6" style="width:100%;margin-top:22px;background-color:#fff8e6;border:1px solid #f2d58a;border-radius:10px;">
                      <tr>
                        <td width="44" valign="top" style="padding:16px 0 16px 18px;color:#a56300;font-size:22px;line-height:24px;">●</td>
                        <td style="padding:15px 18px 15px 8px;color:#704600;font-size:14px;line-height:21px;"><strong>In attesa di pagamento</strong><br><span style="color:#8a641f;">Nessun importo è stato addebitato online.</span></td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" style="width:100%;margin-top:28px;">
                      <tr><td style="padding:0 0 12px;color:#1769c2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">Riepilogo ordine</td></tr>
                    </table>
                    <table role="presentation" width="100%" style="width:100%;border:1px solid #dce6ef;border-radius:10px;overflow:hidden;">
                      <thead>
                        <tr>
                          <th bgcolor="#f1f6fb" style="padding:11px 12px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:left;">Prodotto</th>
                          <th bgcolor="#f1f6fb" style="padding:11px 8px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:center;">Q.tà</th>
                          <th bgcolor="#f1f6fb" style="padding:11px 12px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:right;">Totale</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>

                    <table role="presentation" width="100%" style="width:100%;margin-top:20px;">
                      <tr>
                        <td>&nbsp;</td>
                        <td width="310" valign="top">
                          <table role="presentation" class="summary-table" width="310" bgcolor="#f5f9fd" style="width:310px;background-color:#f5f9fd;border:1px solid #dce6ef;border-radius:10px;">
                            <tr><td style="padding:14px 16px 5px;color:#64748b;font-size:13px;">Imponibile</td><td align="right" style="padding:14px 16px 5px;color:#10243e;font-size:13px;white-space:nowrap;">${formatMoney(order.net_total)}</td></tr>
                            <tr><td style="padding:5px 16px;color:#64748b;font-size:13px;">IVA</td><td align="right" style="padding:5px 16px;color:#10243e;font-size:13px;white-space:nowrap;">${formatMoney(order.vat_total)}</td></tr>
                            <tr><td style="padding:5px 16px 14px;color:#64748b;font-size:13px;">Spedizione</td><td align="right" style="padding:5px 16px 14px;color:#10243e;font-size:13px;white-space:nowrap;">${Number(order.shipping_total || 0) === 0 ? 'Gratuita' : formatMoney(order.shipping_total)}</td></tr>
                            <tr><td bgcolor="#e7f2ff" style="padding:14px 16px;background-color:#e7f2ff;border-top:1px solid #c9def2;color:#0e3b68;font-size:17px;font-weight:700;">Totale ordine</td><td bgcolor="#e7f2ff" align="right" style="padding:14px 16px;background-color:#e7f2ff;border-top:1px solid #c9def2;color:#0e3b68;font-size:19px;font-weight:700;white-space:nowrap;">${formatMoney(order.grand_total)}</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" style="width:100%;margin-top:30px;">
                      <tr><td style="padding:0 0 12px;color:#1769c2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">Pagamento tramite bonifico</td></tr>
                    </table>
                    <table role="presentation" class="bank-table" width="100%" bgcolor="#f5f9fd" style="width:100%;background-color:#f5f9fd;border:1px solid #cfe0ef;border-radius:12px;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <table role="presentation" width="100%" style="width:100%;">
                            ${bankRow('Intestatario', settings.bank_account_holder)}
                            ${bankRow('Banca', settings.bank_name)}
                            ${bankRow('IBAN', settings.bank_iban, { mono: true })}
                            ${bankRow('BIC / SWIFT', settings.bank_bic, { mono: true })}
                            ${bankRow('Causale', `Ordine ${order.order_number}`, { mono: true })}
                            ${bankRow('Importo', formatMoney(order.grand_total))}
                          </table>
                          <table role="presentation" width="100%" style="width:100%;margin-top:12px;border-top:1px solid #d4e2ee;">
                            <tr><td style="padding:14px 0 0;color:#40536a;font-size:13px;line-height:20px;white-space:pre-wrap;">${escapeHtml(bankInstructions)}</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" bgcolor="#f8fafc" style="width:100%;margin-top:24px;background-color:#f8fafc;border-left:4px solid #3b8eea;">
                      <tr><td style="padding:16px 18px;color:#10243e;font-size:14px;line-height:21px;"><strong>Indirizzo di consegna</strong><br><span style="color:#40536a;">${escapeHtml(deliveryAddress)}</span></td></tr>
                    </table>

                    ${order.notes ? `
                      <table role="presentation" width="100%" bgcolor="#f8fafc" style="width:100%;margin-top:14px;background-color:#f8fafc;border-left:4px solid #9bb7d3;">
                        <tr><td style="padding:16px 18px;color:#10243e;font-size:14px;line-height:21px;"><strong>Le tue note</strong><br><span style="color:#40536a;white-space:pre-wrap;">${escapeHtml(order.notes)}</span></td></tr>
                      </table>
                    ` : ''}

                    <p style="margin:26px 0 0;color:#40536a;font-size:13px;line-height:21px;text-align:center;">Hai bisogno di assistenza? Rispondi direttamente a questa email: il nostro ufficio commerciale riceverà il tuo messaggio.</p>
                    <table role="presentation" width="100%" style="width:100%;margin-top:16px;">
                      <tr>
                        <td align="center">
                          <table role="presentation">
                            <tr><td bgcolor="#1976d2" style="background-color:#1976d2;border-radius:9px;"><a href="${escapeHtml(shopUrl)}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;">Torna allo shop&nbsp; →</a></td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#f1f6fb" style="padding:18px 32px;background-color:#f1f6fb;border-top:1px solid #dce6ef;color:#6b7c91;font-size:12px;line-height:18px;text-align:center;">
                    Idealtech s.r.l. · Via Sondrio 11, 20814 Varedo (MB)<br>Conserva questa email come conferma del tuo ordine.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function buildStatusUpdateEmailHtml(order, status, settings) {
  const statusConfig = ORDER_STATUS_EMAILS[status]
  const logoUrl = `${getSiteOrigin()}/logo-idealtech-900.webp`
  const shopUrl = `${getSiteOrigin()}/shop`
  const deliveryAddress = `${order.address}, ${order.postal_code} ${order.city}${order.province ? ` (${order.province})` : ''}, ${order.country}`
  const rows = buildProductRows(order)
  const paymentDetails = status === 'awaiting_payment' ? `
    <table role="presentation" width="100%" bgcolor="#f5f9fd" style="width:100%;margin-top:24px;background-color:#f5f9fd;border:1px solid #cfe0ef;border-radius:12px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="margin:0 0 10px;color:#1769c2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Dati per il bonifico</p>
          <table role="presentation" width="100%" style="width:100%;">
            ${bankRow('Intestatario', settings.bank_account_holder)}
            ${bankRow('IBAN', settings.bank_iban, { mono: true })}
            ${bankRow('BIC / SWIFT', settings.bank_bic, { mono: true })}
            ${bankRow('Causale', `Ordine ${order.order_number}`, { mono: true })}
            ${bankRow('Importo', formatMoney(order.grand_total))}
          </table>
        </td>
      </tr>
    </table>
  ` : ''

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Aggiornamento ordine ${escapeHtml(order.order_number)}</title>
        <style>
          :root { color-scheme: light only; supported-color-schemes: light; }
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          table { border-spacing: 0; border-collapse: collapse; }
          img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
          @media only screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .header-logo { width: 170px !important; height: auto !important; }
          }
        </style>
      </head>
      <body bgcolor="#eef4fa" style="margin:0;padding:0;background-color:#eef4fa;color:#10243e;font-family:Arial,Helvetica,sans-serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Il nuovo stato dell’ordine ${escapeHtml(order.order_number)} è: ${escapeHtml(statusConfig.label)}.</div>
        <table role="presentation" width="100%" bgcolor="#eef4fa" style="width:100%;background-color:#eef4fa;">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <table role="presentation" class="email-shell" width="680" bgcolor="#ffffff" style="width:680px;max-width:680px;background-color:#ffffff;border:1px solid #d8e3ed;border-radius:18px;overflow:hidden;">
                <tr>
                  <td class="email-pad" bgcolor="#ffffff" style="padding:20px 32px;background-color:#ffffff;border-bottom:1px solid #e4ebf2;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td valign="middle"><img class="header-logo" src="${escapeHtml(logoUrl)}" width="190" alt="Idealtech" style="width:190px;max-width:100%;height:auto;"></td>
                        <td align="right" valign="middle" style="color:#1769c2;font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">Aggiornamento ordine</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#0e3b68" style="padding:30px 32px;background-color:#0e3b68;color:#ffffff;">
                    <p style="margin:0 0 8px;color:#8dc6ff;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">Ordine ${escapeHtml(order.order_number)}</p>
                    <h1 style="margin:0;color:#ffffff;font-size:27px;line-height:34px;font-weight:700;">${escapeHtml(statusConfig.title)}</h1>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#ffffff" style="padding:30px 32px;background-color:#ffffff;">
                    <p style="margin:0;color:#10243e;font-size:16px;line-height:25px;">Ciao <strong>${escapeHtml(order.full_name)}</strong>,</p>
                    <p style="margin:10px 0 0;color:#40536a;font-size:14px;line-height:22px;">ti informiamo che lo stato del tuo ordine è stato aggiornato.</p>

                    <table role="presentation" width="100%" bgcolor="${statusConfig.background}" style="width:100%;margin-top:22px;background-color:${statusConfig.background};border-radius:12px;">
                      <tr>
                        <td style="padding:20px 22px;">
                          <p style="margin:0 0 6px;color:${statusConfig.color};font-size:12px;line-height:18px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Nuovo stato</p>
                          <p style="margin:0;color:${statusConfig.color};font-size:22px;line-height:29px;font-weight:700;">${escapeHtml(statusConfig.label)}</p>
                          <p style="margin:9px 0 0;color:#40536a;font-size:14px;line-height:22px;">${escapeHtml(statusConfig.message)}</p>
                        </td>
                      </tr>
                    </table>

                    ${paymentDetails}

                    <table role="presentation" width="100%" style="width:100%;margin-top:28px;">
                      <tr><td style="padding:0 0 12px;color:#1769c2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.1px;text-transform:uppercase;">Riepilogo ordine</td></tr>
                    </table>
                    <table role="presentation" width="100%" style="width:100%;border:1px solid #dce6ef;border-radius:10px;overflow:hidden;">
                      <thead>
                        <tr>
                          <th bgcolor="#f1f6fb" style="padding:11px 12px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:left;">Prodotto</th>
                          <th bgcolor="#f1f6fb" style="padding:11px 8px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:center;">Q.tà</th>
                          <th bgcolor="#f1f6fb" style="padding:11px 12px;background-color:#f1f6fb;color:#40536a;font-size:12px;line-height:18px;text-align:right;">Totale</th>
                        </tr>
                      </thead>
                      <tbody>${rows}</tbody>
                    </table>

                    <table role="presentation" width="100%" bgcolor="#f5f9fd" style="width:100%;margin-top:18px;background-color:#f5f9fd;border:1px solid #dce6ef;border-radius:10px;">
                      <tr>
                        <td style="padding:15px 18px;color:#64748b;font-size:13px;">Totale ordine</td>
                        <td align="right" style="padding:15px 18px;color:#0e3b68;font-size:19px;font-weight:700;white-space:nowrap;">${formatMoney(order.grand_total)}</td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" bgcolor="#f8fafc" style="width:100%;margin-top:18px;background-color:#f8fafc;border-left:4px solid #3b8eea;">
                      <tr><td style="padding:15px 18px;color:#10243e;font-size:14px;line-height:21px;"><strong>Indirizzo di consegna</strong><br><span style="color:#40536a;">${escapeHtml(deliveryAddress)}</span></td></tr>
                    </table>

                    <p style="margin:26px 0 0;color:#40536a;font-size:13px;line-height:21px;text-align:center;">Per qualsiasi chiarimento puoi rispondere direttamente a questa email.</p>
                    <table role="presentation" width="100%" style="width:100%;margin-top:16px;">
                      <tr><td align="center"><table role="presentation"><tr><td bgcolor="#1976d2" style="background-color:#1976d2;border-radius:9px;"><a href="${escapeHtml(shopUrl)}" style="display:inline-block;padding:13px 24px;color:#ffffff;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;">Visita lo shop&nbsp; →</a></td></tr></table></td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="email-pad" bgcolor="#f1f6fb" style="padding:18px 32px;background-color:#f1f6fb;border-top:1px solid #dce6ef;color:#6b7c91;font-size:12px;line-height:18px;text-align:center;">
                    Idealtech s.r.l. · Via Sondrio 11, 20814 Varedo (MB)<br>Messaggio automatico relativo al tuo ordine.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function sendResendEmail(payload, idempotencyKey) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY non configurata.')

  let lastError = null

  for (let attempt = 1; attempt <= EMAIL_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'idealtech-shop/1.0',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
        body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM, ...payload }),
      })

      const result = await response.json().catch(() => ({}))
      if (response.ok) return result.id || null

      const error = new Error(result.message || result.error?.message || `Invio email rifiutato (${response.status}).`)
      error.status = response.status
      lastError = error

      const retryable = response.status === 429 || response.status >= 500
      if (!retryable || attempt === EMAIL_MAX_ATTEMPTS) throw error

      const retryAfter = Number(response.headers.get('retry-after'))
      const waitTime = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 2000)
        : attempt * 500
      await wait(waitTime)
    } catch (error) {
      lastError = error
      const retryable = !error.status || error.status === 429 || error.status >= 500
      if (!retryable || attempt === EMAIL_MAX_ATTEMPTS) throw error
      await wait(attempt * 500)
    }
  }

  throw lastError || new Error('Il servizio email non ha accettato il messaggio.')
}

async function sendCommercialEmail(order, settings) {
  const recipient = normalizeEmail(settings.commercial_email)
  if (!recipient || !EMAIL_PATTERN.test(recipient)) throw new Error('Email commerciale non configurata.')

  return sendResendEmail({
      to: [recipient],
      reply_to: order.email,
      subject: `Nuovo ordine shop ${order.order_number} - ${order.company}`,
      html: buildCommercialEmailHtml(order),
      tags: [
        { name: 'email_type', value: 'commercial' },
        { name: 'order_number', value: order.order_number },
      ],
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
  }, `shop-${order.order_id}-commercial`)
}

async function sendCustomerEmail(order, settings) {
  const recipient = normalizeEmail(order.email)
  if (!recipient || !EMAIL_PATTERN.test(recipient)) throw new Error('Email cliente non valida.')
  const commercialEmail = normalizeEmail(settings.commercial_email)

  return sendResendEmail({
    to: [recipient],
    ...(EMAIL_PATTERN.test(commercialEmail) ? { reply_to: commercialEmail } : {}),
    subject: `Conferma ordine ${order.order_number} | Idealtech`,
    html: buildCustomerEmailHtml(order, settings),
    tags: [
      { name: 'email_type', value: 'customer' },
      { name: 'order_number', value: order.order_number },
    ],
    text: [
      `Grazie per il tuo ordine ${order.order_number}.`,
      '',
      `Azienda: ${order.company}`,
      `Referente: ${order.full_name}`,
      `Consegna: ${order.address}, ${order.postal_code} ${order.city} ${order.province || ''} - ${order.country}`,
      '',
      'RIEPILOGO',
      ...(order.items || []).map((item) => `${item.quantity} x ${item.name} — ${formatMoney(item.line_total)}`),
      `Totale: ${formatMoney(order.grand_total)}`,
      '',
      'PAGAMENTO TRAMITE BONIFICO',
      `Intestatario: ${settings.bank_account_holder || ''}`,
      ...(settings.bank_name ? [`Banca: ${settings.bank_name}`] : []),
      `IBAN: ${settings.bank_iban || ''}`,
      ...(settings.bank_bic ? [`BIC / SWIFT: ${settings.bank_bic}`] : []),
      `Causale: Ordine ${order.order_number}`,
      `Importo: ${formatMoney(order.grand_total)}`,
      '',
      settings.bank_instructions || 'La lavorazione dell’ordine inizierà dopo la ricezione del bonifico.',
      '',
      'Nessun importo è stato addebitato online.',
    ].join('\n'),
  }, `shop-${order.order_id}-customer`)
}

async function sendOrderStatusEmail(order, status, settings) {
  const recipient = normalizeEmail(order.email)
  if (!recipient || !EMAIL_PATTERN.test(recipient)) throw new Error('Email cliente non valida.')
  const commercialEmail = normalizeEmail(settings.commercial_email)
  const statusConfig = ORDER_STATUS_EMAILS[status]
  const requestKey = Date.now()

  return sendResendEmail({
    to: [recipient],
    ...(EMAIL_PATTERN.test(commercialEmail) ? { reply_to: commercialEmail } : {}),
    subject: `Ordine ${order.order_number}: ${statusConfig.label} | Idealtech`,
    html: buildStatusUpdateEmailHtml(order, status, settings),
    tags: [
      { name: 'email_type', value: 'status_update' },
      { name: 'order_number', value: order.order_number },
      { name: 'order_status', value: status },
    ],
    text: [
      `Aggiornamento ordine ${order.order_number}`,
      '',
      `Nuovo stato: ${statusConfig.label}`,
      statusConfig.message,
      '',
      `Totale ordine: ${formatMoney(order.grand_total)}`,
      `Consegna: ${order.address}, ${order.postal_code} ${order.city} ${order.province || ''} - ${order.country}`,
      '',
      ...(status === 'awaiting_payment' ? [
        'DATI PER IL BONIFICO',
        `Intestatario: ${settings.bank_account_holder || ''}`,
        `IBAN: ${settings.bank_iban || ''}`,
        ...(settings.bank_bic ? [`BIC / SWIFT: ${settings.bank_bic}`] : []),
        `Causale: Ordine ${order.order_number}`,
        `Importo: ${formatMoney(order.grand_total)}`,
        '',
      ] : []),
      'Per qualsiasi chiarimento puoi rispondere direttamente a questa email.',
    ].join('\n'),
  }, `shop-${order.id}-status-${status}-${requestKey}`)
}

async function getAuthorizedStaff(req, serviceClient) {
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) throw new Error('UNAUTHORIZED')

  const { data, error } = await serviceClient.auth.getUser(token)
  if (error || !data?.user) throw new Error('UNAUTHORIZED')

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError || !['admin', 'editor'].includes(profile?.role)) throw new Error('FORBIDDEN')
  return data.user
}

async function handleStatusUpdate(req, res, supabase, settings) {
  try {
    await getAuthorizedStaff(req, supabase)
  } catch (error) {
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ success: false, message: 'Accesso riservato allo staff autorizzato.' })
    }
    return res.status(401).json({ success: false, message: 'Sessione non valida o scaduta.' })
  }

  const body = await getBody(req)
  const orderId = normalizeText(body.orderId, 64)
  const nextStatus = normalizeText(body.status, 40)

  if (!orderId) return res.status(400).json({ success: false, message: 'Ordine non specificato.' })
  if (!ORDER_STATUS_EMAILS[nextStatus]) return res.status(400).json({ success: false, message: 'Stato ordine non valido.' })

  const { data: currentOrder, error: loadError } = await supabase
    .from('shop_orders')
    .select('*, shop_order_items(*)')
    .eq('id', orderId)
    .maybeSingle()

  if (loadError) return res.status(500).json({ success: false, message: loadError.message })
  if (!currentOrder) return res.status(404).json({ success: false, message: 'Ordine non trovato.' })

  if (currentOrder.status === nextStatus) {
    return res.status(200).json({
      success: true,
      status: nextStatus,
      email_sent: false,
      notification_skipped: true,
      message: 'Lo stato era già impostato: nessuna email duplicata è stata inviata.',
    })
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from('shop_orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .eq('status', currentOrder.status)
    .select('*')
    .maybeSingle()

  if (updateError) return res.status(500).json({ success: false, message: updateError.message })
  if (!updatedOrder) {
    return res.status(409).json({ success: false, message: 'Lo stato è stato modificato da un altro utente. Ricarica gli ordini e riprova.' })
  }

  const orderForEmail = { ...updatedOrder, shop_order_items: currentOrder.shop_order_items || [], items: (currentOrder.shop_order_items || []).map((item) => ({
    name: item.product_name,
    sku: item.sku,
    quantity: item.quantity,
    line_total: item.line_total,
  })) }

  try {
    const emailId = await sendOrderStatusEmail(orderForEmail, nextStatus, settings)
    return res.status(200).json({
      success: true,
      status: nextStatus,
      status_label: ORDER_STATUS_EMAILS[nextStatus].label,
      email_sent: true,
      email_id: emailId,
    })
  } catch (emailError) {
    console.error('Order status email error:', emailError)
    return res.status(200).json({
      success: true,
      status: nextStatus,
      status_label: ORDER_STATUS_EMAILS[nextStatus].label,
      email_sent: false,
      warning: `Stato aggiornato, ma la mail al cliente non è partita: ${emailError.message || 'errore di invio.'}`,
    })
  }
}

async function settleEmail(send) {
  try {
    return { status: 'fulfilled', value: await send() }
  } catch (reason) {
    return { status: 'rejected', reason }
  }
}

export default async function handler(req, res) {
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH')
    return res.status(405).json({ success: false, message: 'Metodo non consentito.' })
  }

  try {
    const supabase = getServerClient()
    const settings = await loadSettings(supabase)

    if (req.method === 'PATCH') {
      return await handleStatusUpdate(req, res, supabase, settings)
    }

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
    // La conferma al cliente ha priorità e viene completata prima della notifica interna.
    const customerResult = await settleEmail(() => sendCustomerEmail(order, settings))
    const commercialResult = await settleEmail(() => sendCommercialEmail(order, settings))

    const commercialEmailSent = commercialResult.status === 'fulfilled'
    const customerEmailSent = customerResult.status === 'fulfilled'
    const emailErrors = []
    const emailIds = {}

    if (commercialEmailSent) emailIds.commercial = commercialResult.value
    else {
      const message = commercialResult.reason?.message || 'Errore invio email commerciale.'
      emailErrors.push(`Commerciale: ${message}`)
      console.error('Commercial order notification error:', commercialResult.reason)
    }

    if (customerEmailSent) emailIds.customer = customerResult.value
    else {
      const message = customerResult.reason?.message || 'Errore invio conferma al cliente.'
      emailErrors.push(`Cliente: ${message}`)
      console.error('Customer order confirmation error:', customerResult.reason)
    }

    await supabase
      .from('shop_orders')
      .update({
        email_sent_at: commercialEmailSent ? new Date().toISOString() : null,
        email_message_id: Object.keys(emailIds).length ? JSON.stringify(emailIds) : null,
        email_error: emailErrors.length ? emailErrors.join(' | ') : null,
      })
      .eq('id', order.order_id)

    return res.status(201).json({
      success: true,
      order_number: order.order_number,
      total: Number(order.grand_total),
      email_sent: commercialEmailSent,
      customer_email_sent: customerEmailSent,
      bank: publicConfig(settings).bank,
    })
  } catch (error) {
    console.error('Orders API error:', error)
    const message = error.message || 'Errore durante la registrazione dell’ordine.'
    const isClientError = /obbligator|valid|carrello|quantità|disponibil|pubblicato|stock|privacy/i.test(message)
    return res.status(isClientError ? 400 : 500).json({ success: false, message })
  }
}
