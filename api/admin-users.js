/* global process */
import { createClient } from '@supabase/supabase-js'

function json(res, status, body) {
  res.status(status).json(body)
}

async function getAuthorizedAdmin(req, serviceClient) {
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

  if (profileError || profile?.role !== 'admin') throw new Error('FORBIDDEN')
  return data.user
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, {
      error: 'Configurazione server incompleta: aggiungi SUPABASE_SERVICE_ROLE_KEY su Vercel.',
    })
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let currentAdmin
  try {
    currentAdmin = await getAuthorizedAdmin(req, serviceClient)
  } catch (error) {
    if (error.message === 'FORBIDDEN') return json(res, 403, { error: 'Accesso riservato agli amministratori.' })
    return json(res, 401, { error: 'Sessione non valida o scaduta.' })
  }

  if (req.method === 'GET') {
    const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (usersError) return json(res, 400, { error: usersError.message })

    const userIds = (usersData.users || []).map((user) => user.id)
    const { data: profiles, error: profilesError } = userIds.length
      ? await serviceClient.from('profiles').select('id, full_name, role').in('id', userIds)
      : { data: [], error: null }

    if (profilesError) return json(res, 400, { error: profilesError.message })

    const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]))
    const users = (usersData.users || [])
      .map((user) => {
        const profile = profileMap.get(user.id)
        return {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          role: profile?.role || user.app_metadata?.role || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          is_current: user.id === currentAdmin.id,
        }
      })
      .filter((user) => user.role === 'admin')

    return json(res, 200, { users })
  }

  if (req.method === 'POST') {
    let body = req.body || {}
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        return json(res, 400, { error: 'Dati della richiesta non validi.' })
      }
    }

    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const fullName = String(body.fullName || '').trim()

    if (!email || !email.includes('@')) return json(res, 400, { error: 'Inserisci un indirizzo email valido.' })
    if (password.length < 8) return json(res, 400, { error: 'La password temporanea deve avere almeno 8 caratteri.' })
    if (!fullName) return json(res, 400, { error: 'Inserisci nome e cognome.' })

    const { data, error } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { role: 'admin' },
    })

    if (error) return json(res, 400, { error: error.message })

    const { error: profileError } = await serviceClient.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      role: 'admin',
    })

    if (profileError) {
      await serviceClient.auth.admin.deleteUser(data.user.id)
      return json(res, 400, { error: profileError.message })
    }

    return json(res, 201, { success: true })
  }

  if (req.method === 'DELETE') {
    const userId = String(req.query?.id || '')
    if (!userId) return json(res, 400, { error: 'Utente non specificato.' })
    if (userId === currentAdmin.id) return json(res, 400, { error: 'Non puoi eliminare il tuo stesso accesso.' })

    const { error } = await serviceClient.auth.admin.deleteUser(userId)
    if (error) return json(res, 400, { error: error.message })

    return json(res, 200, { success: true })
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return json(res, 405, { error: 'Metodo non supportato.' })
}
