/* global process */
import { createClient } from '@supabase/supabase-js'

function json(res, status, body) {
  res.status(status).json(body)
}

function parseBody(req) {
  let body = req.body || {}
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return null }
  }
  return body && typeof body === 'object' ? body : null
}

function sameOriginRequest(req) {
  const origin = String(req.headers.origin || '')
  if (!origin) return true

  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim()
  if (!forwardedHost) return true

  try {
    return new URL(origin).host === forwardedHost
  } catch {
    return false
  }
}

function friendlyAuthError(error) {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '')
  const normalized = message.toLowerCase()

  if (code === 'email_exists' || normalized.includes('already') || normalized.includes('registered') || normalized.includes('exists')) {
    return 'Esiste già un account con questa email. Accedi al portale oppure usa il recupero password.'
  }
  if (normalized.includes('password')) return 'La password non rispetta i requisiti di sicurezza.'
  if (normalized.includes('email')) return 'Indirizzo email non valido.'
  return 'Non è stato possibile creare l’account. Riprova tra qualche istante.'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, { error: 'Metodo non supportato.' })
  }

  // Impedisce che un sito esterno usi il browser del visitatore per creare account.
  if (!sameOriginRequest(req)) return json(res, 403, { error: 'Richiesta non autorizzata.' })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !secretKey) {
    return json(res, 500, { error: 'Configurazione server incompleta per la registrazione assistenza.' })
  }

  const body = parseBody(req)
  if (!body) return json(res, 400, { error: 'Dati della richiesta non validi.' })

  // Honeypot invisibile ai clienti reali.
  if (String(body.website || '').trim()) return json(res, 200, { success: true })

  const fullName = String(body.fullName || '').trim()
  const company = String(body.company || '').trim()
  const phone = String(body.phone || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const privacyAccepted = body.privacyAccepted === true

  if (!fullName || fullName.length < 2) return json(res, 400, { error: 'Inserisci nome e cognome.' })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Inserisci un indirizzo email valido.' })
  if (password.length < 8) return json(res, 400, { error: 'La password deve contenere almeno 8 caratteri.' })
  if (!privacyAccepted) return json(res, 400, { error: 'Devi accettare l’informativa privacy per creare l’account.' })

  const serviceClient = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const metadata = {
    full_name: fullName,
    company,
    phone,
    account_type: 'support_customer',
  }

  const { data, error: createError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
    app_metadata: { account_type: 'support_customer' },
  })

  if (createError || !data?.user) {
    return json(res, 400, { error: friendlyAuthError(createError) })
  }

  const { error: customerError } = await serviceClient
    .from('support_customers')
    .upsert({
      user_id: data.user.id,
      full_name: fullName,
      company: company || null,
      phone: phone || null,
      email,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (customerError) {
    // Non lasciamo account orfani se il profilo assistenza non viene creato.
    await serviceClient.auth.admin.deleteUser(data.user.id)
    return json(res, 400, { error: 'Impossibile completare il profilo assistenza. Riprova.' })
  }

  return json(res, 201, {
    success: true,
    email,
    message: 'Account creato. Puoi accedere subito al portale assistenza.',
  })
}
