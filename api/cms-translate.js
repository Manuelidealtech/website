/* global process */
import { createClient } from '@supabase/supabase-js'

/** Admin-only, server-side DeepL translation. No translation API key reaches the browser. */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Metodo non consentito.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const deeplKey = process.env.DEEPL_API_KEY
  if (!supabaseUrl || !serviceKey) return res.status(503).json({ error: 'Configurazione Supabase server mancante.' })
  if (!deeplKey) return res.status(503).json({ error: 'DEEPL_API_KEY non configurata su Vercel. Aggiungila alle variabili Environment, poi ridistribuisci il progetto.' })

  const bearer = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')?.[1]
  if (!bearer) return res.status(401).json({ error: 'Accesso richiesto.' })

  const serverClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: authResult, error: authError } = await serverClient.auth.getUser(bearer)
  if (authError || !authResult?.user) return res.status(401).json({ error: 'Sessione scaduta.' })
  const actor = authResult.user
  const role = String(actor.app_metadata?.role || '').toLowerCase()
  const accountType = String(actor.app_metadata?.account_type || '').toLowerCase()
  if (accountType === 'support_customer' || role === 'customer' || role === 'technician') {
    return res.status(403).json({ error: 'Solo gli amministratori/editor autorizzati possono tradurre i contenuti.' })
  }
  if (!['admin', 'editor'].includes(role)) {
    // Legacy editorial staff may still have their role in profiles.
    // Check support_customers FIRST: an old profiles=editor must never grant
    // CMS privileges to somebody who registered for customer support.
    const [customerResult, profileResult] = await Promise.all([
      serverClient.from('support_customers').select('user_id').eq('user_id', actor.id).maybeSingle(),
      serverClient.from('profiles').select('role').eq('id', actor.id).maybeSingle(),
    ])
    if (customerResult.error || profileResult.error || customerResult.data || !['admin', 'editor'].includes(profileResult.data?.role)) {
      return res.status(403).json({ error: 'Utente privo di permessi CMS.' })
    }
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { return res.status(400).json({ error: 'JSON non valido.' }) }
  }
  const texts = body?.texts
  const language = String(body?.targetLanguage || '').toLowerCase()
  if (!['en', 'tr'].includes(language) || !Array.isArray(texts) || texts.length < 1 || texts.length > 25 ||
    texts.some((text) => typeof text !== 'string' || !text.trim() || text.length > 8000) ||
    texts.reduce((total, text) => total + text.length, 0) > 13000) {
    return res.status(400).json({ error: 'Richiesta traduzione non valida o troppo grande.' })
  }

  // Known legacy Free keys end with :fx; Developer/Growth keys use the standard endpoint.
  const endpoint = deeplKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `DeepL-Auth-Key ${deeplKey}`,
      },
      body: JSON.stringify({
        text: texts,
        source_lang: 'IT',
        target_lang: language.toUpperCase(),
        preserve_formatting: true,
      }),
      signal: AbortSignal.timeout(18000),
    })

    if (!response.ok) {
      const message = response.status === 429 ? 'Limite richieste DeepL raggiunto. Riprova in seguito.'
        : response.status === 456 ? 'Crediti DeepL esauriti: verifica piano e utilizzo.'
          : response.status === 403 ? 'Chiave DeepL non autorizzata oppure endpoint non corrispondente al piano.'
            : `DeepL ha risposto con HTTP ${response.status}.`
      return res.status(502).json({ error: message })
    }

    const data = await response.json()
    const translations = data?.translations?.map((item) => item.text)
    if (!Array.isArray(translations) || translations.length !== texts.length ||
      translations.some((value) => typeof value !== 'string' || !value.trim())) {
      return res.status(502).json({ error: 'DeepL ha restituito dati non completi.' })
    }
    return res.status(200).json({ translations })
  } catch (error) {
    return res.status(502).json({ error: error?.name === 'TimeoutError'
      ? 'Timeout del servizio di traduzione. Riprova.'
      : 'Servizio traduzione momentaneamente non disponibile.' })
  }
}
