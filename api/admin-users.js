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
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !secretKey) {
    return json(res, 500, { error: 'Configurazione server incompleta: aggiungi SUPABASE_SECRET_KEY (o SUPABASE_SERVICE_ROLE_KEY) su Vercel.' })
  }

  const serviceClient = createClient(supabaseUrl, secretKey, {
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
    const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (usersError) return json(res, 400, { error: usersError.message })

    const userIds = (usersData.users || []).map((user) => user.id)
    const [profilesResult, staffResult] = await Promise.all([
      userIds.length
        ? serviceClient.from('profiles').select('id,full_name,role').in('id', userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? serviceClient.from('support_staff').select('user_id,full_name,role,active').in('user_id', userIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (profilesResult.error) return json(res, 400, { error: profilesResult.error.message })
    if (staffResult.error) return json(res, 400, { error: staffResult.error.message })

    const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]))
    const staffMap = new Map((staffResult.data || []).map((staff) => [staff.user_id, staff]))

    const users = (usersData.users || []).map((user) => {
      const profile = profileMap.get(user.id)
      const staff = staffMap.get(user.id)
      const role = profile?.role === 'admin' ? 'admin' : staff?.role === 'technician' ? 'technician' : ''
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || staff?.full_name || user.user_metadata?.full_name || '',
        role,
        active: staff?.active ?? true,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_current: user.id === currentAdmin.id,
      }
    }).filter((user) => user.role === 'admin' || user.role === 'technician')

    return json(res, 200, { users })
  }

  if (req.method === 'POST') {
    let body = req.body || {}
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { return json(res, 400, { error: 'Dati della richiesta non validi.' }) }
    }

    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const fullName = String(body.fullName || '').trim()
    const role = body.role === 'technician' ? 'technician' : 'admin'

    if (!email || !email.includes('@')) return json(res, 400, { error: 'Inserisci un indirizzo email valido.' })
    if (password.length < 8) return json(res, 400, { error: 'La password temporanea deve avere almeno 8 caratteri.' })
    if (!fullName) return json(res, 400, { error: 'Inserisci nome e cognome.' })

    const { data, error } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { role },
    })
    if (error) return json(res, 400, { error: error.message })

    let roleError = null
    if (role === 'admin') {
      const { error: profileError } = await serviceClient.from('profiles').upsert({ id: data.user.id, full_name: fullName, role: 'admin' })
      roleError = profileError
    } else {
      const { error: staffError } = await serviceClient.from('support_staff').upsert({ user_id: data.user.id, full_name: fullName, role: 'technician', active: true })
      roleError = staffError
    }

    if (roleError) {
      await serviceClient.auth.admin.deleteUser(data.user.id)
      return json(res, 400, { error: roleError.message })
    }

    return json(res, 201, { success: true, role })
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
