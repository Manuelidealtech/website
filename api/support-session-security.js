/* global process */
import { createClient } from '@supabase/supabase-js'

function json(res, status, body) {
  res.status(status).json(body)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return json(res, 405, { error: 'Metodo non supportato.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !secretKey) return json(res, 500, { error: 'Configurazione server incompleta.' })

  const authorization = String(req.headers.authorization || '')
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return json(res, 401, { error: 'Sessione non valida.' })

  const serviceClient = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: authData, error: authError } = await serviceClient.auth.getUser(token)
  if (authError || !authData?.user) return json(res, 401, { error: 'Sessione non valida.' })

  const currentUser = authData.user
  const appRole = String(currentUser.app_metadata?.role || '').toLowerCase()
  const accountType = String(currentUser.app_metadata?.account_type || currentUser.user_metadata?.account_type || '').toLowerCase()

  // Admin e tecnici espliciti sono gestiti solo dall'admin e non vanno sanificati.
  if (appRole === 'admin' || appRole === 'technician') {
    return json(res, 200, { role: appRole, sanitized: false })
  }

  // Un vecchio ruolo editor non deve prevalere su un account nato dal portale assistenza.
  if (appRole === 'editor' && accountType !== 'support_customer') {
    return json(res, 200, { role: appRole, sanitized: false })
  }

  const { data: customer, error: customerError } = await serviceClient
    .from('support_customers')
    .select('user_id')
    .eq('user_id', currentUser.id)
    .maybeSingle()

  if (customerError && customerError.code !== '42P01') return json(res, 500, { error: 'Impossibile verificare il profilo assistenza.' })

  const isCustomer = appRole === 'customer' || accountType === 'support_customer' || Boolean(customer)
  if (!isCustomer) return json(res, 200, { role: null, sanitized: false })

  const [profileCleanup, staffCleanup] = await Promise.all([
    serviceClient.from('profiles').delete().eq('id', currentUser.id),
    serviceClient.from('support_staff').delete().eq('user_id', currentUser.id),
  ])

  if (profileCleanup.error) return json(res, 500, { error: 'Impossibile rimuovere il vecchio profilo amministrativo.' })
  if (staffCleanup.error && staffCleanup.error.code !== '42P01') return json(res, 500, { error: 'Impossibile rimuovere il vecchio profilo tecnico.' })

  const { error: metadataError } = await serviceClient.auth.admin.updateUserById(currentUser.id, {
    app_metadata: {
      ...(currentUser.app_metadata || {}),
      role: 'customer',
      account_type: 'support_customer',
    },
  })

  if (metadataError) return json(res, 500, { error: 'Impossibile consolidare il ruolo cliente.' })

  return json(res, 200, { role: 'customer', sanitized: true })
}
