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
  return body
}

async function getAuthorizedAdmin(req, serviceClient) {
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) throw new Error('UNAUTHORIZED')

  const { data, error } = await serviceClient.auth.getUser(token)
  if (error || !data?.user) throw new Error('UNAUTHORIZED')

  const appRole = String(data.user.app_metadata?.role || '').toLowerCase()
  const accountType = String(data.user.app_metadata?.account_type || data.user.user_metadata?.account_type || '').toLowerCase()

  if (appRole === 'admin') return data.user

  // Un account nato come cliente assistenza non può sfruttare eventuali profili legacy.
  if (appRole === 'customer' || accountType === 'support_customer') throw new Error('FORBIDDEN')

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError || profile?.role !== 'admin') throw new Error('FORBIDDEN')
  return data.user
}

async function countAdmins(serviceClient) {
  const { data: usersData, error: usersError } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (usersError) throw usersError

  const users = usersData.users || []
  const ids = users.map((user) => user.id)
  const [profilesResult, customersResult] = await Promise.all([
    ids.length
      ? serviceClient.from('profiles').select('id,role').in('id', ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? serviceClient.from('support_customers').select('user_id').in('user_id', ids)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (profilesResult.error) throw profilesResult.error
  if (customersResult.error && customersResult.error.code !== '42P01') throw customersResult.error

  const profileMap = new Map((profilesResult.data || []).map((row) => [row.id, row]))
  const customerSet = new Set((customersResult.data || []).map((row) => row.user_id))

  return users.filter((user) => {
    const appRole = String(user.app_metadata?.role || '').toLowerCase()
    const accountType = String(user.app_metadata?.account_type || user.user_metadata?.account_type || '').toLowerCase()
    if (appRole === 'admin') return true
    if (appRole === 'technician' || appRole === 'customer' || accountType === 'support_customer') return false
    if (customerSet.has(user.id)) return false
    return profileMap.get(user.id)?.role === 'admin'
  }).length
}

async function getRoleRecord(serviceClient, userId) {
  const [authResult, profileResult, staffResult, customerResult] = await Promise.all([
    serviceClient.auth.admin.getUserById(userId),
    serviceClient.from('profiles').select('id,full_name,role').eq('id', userId).maybeSingle(),
    serviceClient.from('support_staff').select('user_id,full_name,role,active').eq('user_id', userId).maybeSingle(),
    serviceClient.from('support_customers').select('user_id,full_name,company,phone,email').eq('user_id', userId).maybeSingle(),
  ])

  if (authResult.error || !authResult.data?.user) throw authResult.error || new Error('Utente Supabase non trovato.')
  if (profileResult.error) throw profileResult.error
  if (staffResult.error && staffResult.error.code !== '42P01') throw staffResult.error
  if (customerResult.error && customerResult.error.code !== '42P01') throw customerResult.error

  const user = authResult.data.user
  const appRole = String(user.app_metadata?.role || '').toLowerCase()
  const accountType = String(user.app_metadata?.account_type || user.user_metadata?.account_type || '').toLowerCase()

  let role = 'unassigned'
  if (appRole === 'admin') role = 'admin'
  else if (appRole === 'technician') role = 'technician'
  else if (appRole === 'customer' || accountType === 'support_customer') role = 'customer'
  else if (staffResult.data?.role === 'technician' && staffResult.data?.active !== false) role = 'technician'
  else if (customerResult.data) role = 'customer'
  else if (profileResult.data?.role === 'admin') role = 'admin'
  else if (profileResult.data?.role === 'editor') role = 'editor'

  return { role, user, profile: profileResult.data, staff: staffResult.data, customer: customerResult.data }
}

async function assignRole({ serviceClient, userId, role, fullName, email }) {
  const current = await getRoleRecord(serviceClient, userId)

  if (current.role === 'admin' && role !== 'admin') {
    const admins = await countAdmins(serviceClient)
    if (admins <= 1) throw new Error('LAST_ADMIN')
  }

  if (role === 'admin') {
    const { error: profileError } = await serviceClient
      .from('profiles')
      .upsert({ id: userId, full_name: fullName || email || 'Amministratore', role: 'admin' })
    if (profileError) throw profileError

    const { error: staffDeleteError } = await serviceClient.from('support_staff').delete().eq('user_id', userId)
    if (staffDeleteError && staffDeleteError.code !== '42P01') throw staffDeleteError
  }

  if (role === 'technician') {
    // Manteniamo l'eventuale profiles legacy per preservare FK/storico (es. machines.created_by).
    // app_metadata=technician prevale comunque per tutte le autorizzazioni.
    const { error: staffError } = await serviceClient
      .from('support_staff')
      .upsert({ user_id: userId, full_name: fullName || email || 'Tecnico', role: 'technician', active: true })
    if (staffError) throw staffError
  }

  if (role === 'customer') {
    // Non cancelliamo profiles: può essere referenziato da macchinari o altri record storici.
    const { error: staffDeleteError } = await serviceClient.from('support_staff').delete().eq('user_id', userId)
    if (staffDeleteError && staffDeleteError.code !== '42P01') throw staffDeleteError

    const { error: customerError } = await serviceClient
      .from('support_customers')
      .upsert({ user_id: userId, full_name: fullName || email || 'Cliente', email })
    if (customerError) throw customerError
  }

  const { error: authError } = await serviceClient.auth.admin.updateUserById(userId, {
    app_metadata: { role, account_type: role === 'customer' ? 'support_customer' : 'staff' },
  })
  if (authError) throw authError
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

    const authUsers = usersData.users || []
    const userIds = authUsers.map((user) => user.id)
    const [profilesResult, staffResult, customersResult] = await Promise.all([
      userIds.length
        ? serviceClient.from('profiles').select('id,full_name,role').in('id', userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? serviceClient.from('support_staff').select('user_id,full_name,role,active').in('user_id', userIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? serviceClient.from('support_customers').select('user_id,full_name,company,phone,email').in('user_id', userIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (profilesResult.error) return json(res, 400, { error: profilesResult.error.message })
    if (staffResult.error && staffResult.error.code !== '42P01') return json(res, 400, { error: staffResult.error.message })
    if (customersResult.error && customersResult.error.code !== '42P01') return json(res, 400, { error: customersResult.error.message })

    const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]))
    const staffMap = new Map((staffResult.data || []).map((staff) => [staff.user_id, staff]))
    const customerMap = new Map((customersResult.data || []).map((customer) => [customer.user_id, customer]))

    const users = authUsers.map((user) => {
      const profile = profileMap.get(user.id)
      const staff = staffMap.get(user.id)
      const customer = customerMap.get(user.id)
      const appRole = String(user.app_metadata?.role || '').toLowerCase()
      const accountType = String(user.app_metadata?.account_type || user.user_metadata?.account_type || '').toLowerCase()
      const role = ['admin', 'technician', 'customer'].includes(appRole)
        ? appRole
        : accountType === 'support_customer'
          ? 'customer'
          : staff?.role === 'technician'
            ? 'technician'
            : customer
              ? 'customer'
              : profile?.role === 'admin'
                ? 'admin'
                : profile?.role === 'editor'
                  ? 'editor'
                  : 'unassigned'

      return {
        id: user.id,
        email: user.email || customer?.email || '',
        full_name: profile?.full_name || staff?.full_name || customer?.full_name || user.user_metadata?.full_name || '',
        company: customer?.company || '',
        phone: customer?.phone || '',
        role,
        active: staff?.active ?? true,
        app_metadata_role: user.app_metadata?.role || '',
        email_confirmed_at: user.email_confirmed_at || null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_current: user.id === currentAdmin.id,
      }
    }).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

    return json(res, 200, { users })
  }

  if (req.method === 'POST') {
    const body = parseBody(req)
    if (!body) return json(res, 400, { error: 'Dati della richiesta non validi.' })

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

    try {
      await assignRole({ serviceClient, userId: data.user.id, role, fullName, email })
    } catch (roleError) {
      await serviceClient.auth.admin.deleteUser(data.user.id)
      return json(res, 400, { error: roleError.message })
    }

    return json(res, 201, { success: true, role })
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req)
    if (!body) return json(res, 400, { error: 'Dati della richiesta non validi.' })

    const userId = String(body.id || '')
    const action = String(body.action || '')
    if (!userId) return json(res, 400, { error: 'Utente non specificato.' })

    if (action === 'password') {
      const password = String(body.password || '')
      if (password.length < 8) return json(res, 400, { error: 'La nuova password deve avere almeno 8 caratteri.' })

      const { error } = await serviceClient.auth.admin.updateUserById(userId, { password })
      if (error) return json(res, 400, { error: error.message })
      return json(res, 200, { success: true, message: 'Password aggiornata direttamente in Supabase Auth.' })
    }

    if (action === 'role') {
      const role = ['admin', 'technician', 'customer'].includes(body.role) ? body.role : ''
      if (!role) return json(res, 400, { error: 'Ruolo non valido.' })
      if (userId === currentAdmin.id && role !== 'admin') {
        return json(res, 400, { error: 'Non puoi modificare il tuo stesso ruolo mentre sei autenticato.' })
      }

      const { data: userResult, error: getUserError } = await serviceClient.auth.admin.getUserById(userId)
      if (getUserError || !userResult?.user) return json(res, 404, { error: 'Utente Supabase non trovato.' })

      const fullName = String(body.fullName || userResult.user.user_metadata?.full_name || '').trim()
      const email = String(userResult.user.email || '').trim().toLowerCase()

      try {
        await assignRole({ serviceClient, userId, role, fullName, email })
      } catch (error) {
        if (error.message === 'LAST_ADMIN') return json(res, 400, { error: 'Non puoi declassare l’ultimo amministratore rimasto.' })
        return json(res, 400, { error: error.message })
      }

      return json(res, 200, { success: true, role })
    }

    return json(res, 400, { error: 'Operazione non riconosciuta.' })
  }

  if (req.method === 'DELETE') {
    const userId = String(req.query?.id || '')
    if (!userId) return json(res, 400, { error: 'Utente non specificato.' })
    if (userId === currentAdmin.id) return json(res, 400, { error: 'Non puoi eliminare il tuo stesso accesso.' })

    try {
      const current = await getRoleRecord(serviceClient, userId)
      if (current.role === 'admin') {
        const admins = await countAdmins(serviceClient)
        if (admins <= 1) return json(res, 400, { error: 'Non puoi eliminare l’ultimo amministratore rimasto.' })
      }
    } catch (error) {
      return json(res, 400, { error: error.message })
    }

    const [ticketCountResult, messageCountResult] = await Promise.all([
      serviceClient.from('support_tickets').select('id', { count: 'exact', head: true }).eq('customer_id', userId),
      serviceClient.from('support_messages').select('id', { count: 'exact', head: true }).eq('sender_id', userId),
    ])

    if (ticketCountResult.error && ticketCountResult.error.code !== '42P01') return json(res, 400, { error: ticketCountResult.error.message })
    if (messageCountResult.error && messageCountResult.error.code !== '42P01') return json(res, 400, { error: messageCountResult.error.message })

    const linkedTickets = ticketCountResult.count || 0
    const linkedMessages = messageCountResult.count || 0
    if (linkedTickets > 0 || linkedMessages > 0) {
      return json(res, 409, {
        error: `Questo account ha storico assistenza collegato (${linkedTickets} ticket, ${linkedMessages} messaggi). Per sicurezza non viene eliminato da Auth, così non perdi lo storico. Puoi cambiarne il ruolo o la password.`,
      })
    }

    const machineRefResult = await serviceClient
      .from('machines')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId)

    if (machineRefResult.error && machineRefResult.error.code !== '42P01') {
      return json(res, 400, { error: machineRefResult.error.message })
    }
    if ((machineRefResult.count || 0) > 0) {
      return json(res, 409, {
        error: `Questo account è collegato a ${machineRefResult.count} macchinari come creatore. Non viene eliminato da Supabase per preservare lo storico; puoi cambiarne ruolo o password.`,
      })
    }

    const { error } = await serviceClient.auth.admin.deleteUser(userId)
    if (error) return json(res, 400, { error: error.message })
    return json(res, 200, { success: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return json(res, 405, { error: 'Metodo non supportato.' })
}
