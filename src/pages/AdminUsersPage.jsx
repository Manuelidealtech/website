/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import '../styles/AdminUsersPage.css'

const emptyForm = { fullName: '', email: '', password: '', role: 'technician' }

const roleLabels = {
  admin: 'Amministratore',
  technician: 'Tecnico assistenza',
  customer: 'Cliente assistenza',
  unassigned: 'Senza ruolo',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [openUserId, setOpenUserId] = useState('')
  const [roleDrafts, setRoleDrafts] = useState({})
  const [passwordDrafts, setPasswordDrafts] = useState({})
  const [passwordVisible, setPasswordVisible] = useState({})
  const [busyUserId, setBusyUserId] = useState('')
  const [showCreatePassword, setShowCreatePassword] = useState(false)

  const counts = useMemo(() => ({
    all: users.length,
    admin: users.filter((user) => user.role === 'admin').length,
    technician: users.filter((user) => user.role === 'technician').length,
    customer: users.filter((user) => user.role === 'customer').length,
    unassigned: users.filter((user) => user.role === 'unassigned').length,
  }), [users])

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (!needle) return true
      return [user.full_name, user.email, user.company, user.phone, user.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [users, search, roleFilter])

  async function apiRequest(path = '', options = {}) {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const response = await fetch(`/api/admin-users${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })

    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error || 'Errore durante la richiesta.')
    return payload
  }

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')
      const data = await apiRequest()
      setUsers(data.users || [])
      setRoleDrafts(Object.fromEntries((data.users || []).map((user) => [user.id, user.role])))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      const result = await apiRequest('', { method: 'POST', body: JSON.stringify(form) })
      setSuccess(result.role === 'technician'
        ? 'Tecnico creato direttamente in Supabase Auth.'
        : 'Amministratore creato direttamente in Supabase Auth.')
      setForm(emptyForm)
      setShowCreatePassword(false)
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    const ok = window.confirm(
      `Vuoi eliminare definitivamente ${user.full_name || user.email} da Supabase Auth?\n\nQuesta operazione elimina l'account e non solo il profilo del portale.`
    )
    if (!ok) return

    try {
      setBusyUserId(user.id)
      setError('')
      setSuccess('')
      await apiRequest(`?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' })
      setSuccess(`Account ${user.email} eliminato definitivamente da Supabase.`)
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyUserId('')
    }
  }

  async function handleRoleUpdate(user) {
    const nextRole = roleDrafts[user.id] || user.role
    if (nextRole === user.role) return

    const ok = window.confirm(`Cambiare il ruolo di ${user.email} da “${roleLabels[user.role]}” a “${roleLabels[nextRole]}”?`)
    if (!ok) return

    try {
      setBusyUserId(user.id)
      setError('')
      setSuccess('')
      await apiRequest('', {
        method: 'PATCH',
        body: JSON.stringify({
          id: user.id,
          action: 'role',
          role: nextRole,
          fullName: user.full_name,
        }),
      })
      setSuccess(`Permessi aggiornati: ${user.email} ora è “${roleLabels[nextRole]}”.`)
      await loadUsers()
    } catch (err) {
      setError(err.message)
      setRoleDrafts((prev) => ({ ...prev, [user.id]: user.role }))
    } finally {
      setBusyUserId('')
    }
  }

  async function handlePasswordUpdate(user) {
    const password = passwordDrafts[user.id] || ''
    if (password.length < 8) {
      setError('La nuova password deve avere almeno 8 caratteri.')
      return
    }

    const ok = window.confirm(`Impostare una nuova password per ${user.email}?`)
    if (!ok) return

    try {
      setBusyUserId(user.id)
      setError('')
      setSuccess('')
      await apiRequest('', {
        method: 'PATCH',
        body: JSON.stringify({ id: user.id, action: 'password', password }),
      })
      setPasswordDrafts((prev) => ({ ...prev, [user.id]: '' }))
      setPasswordVisible((prev) => ({ ...prev, [user.id]: false }))
      setSuccess(`Password di ${user.email} aggiornata direttamente in Supabase Auth.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyUserId('')
    }
  }

  function renderUser(user) {
    const open = openUserId === user.id
    const busy = busyUserId === user.id
    const role = roleDrafts[user.id] || user.role
    const initials = (user.full_name || user.email || '?').charAt(0).toUpperCase()

    return (
      <article className={`admin-auth-user ${open ? 'is-open' : ''}`} key={user.id}>
        <button
          type="button"
          className="admin-auth-user__summary"
          onClick={() => setOpenUserId((current) => current === user.id ? '' : user.id)}
        >
          <span className={`admin-user-avatar is-${user.role}`}>{initials}</span>
          <span className="admin-auth-user__identity">
            <strong>{user.full_name || 'Account Supabase'}</strong>
            <span>{user.email || 'Email non disponibile'}</span>
            {user.company ? <small>{user.company}</small> : null}
          </span>
          <span className={`admin-role-badge is-${user.role}`}>{roleLabels[user.role]}</span>
          {user.is_current ? <span className="admin-current-user">Tu</span> : null}
          <span className="admin-auth-user__chevron">{open ? '−' : '+'}</span>
        </button>

        {open ? (
          <div className="admin-auth-user__body">
            <div className="admin-auth-user__meta">
              <div><span>ID Supabase</span><code>{user.id}</code></div>
              <div><span>Creato</span><strong>{user.created_at ? new Date(user.created_at).toLocaleString('it-IT') : '—'}</strong></div>
              <div><span>Ultimo accesso</span><strong>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('it-IT') : 'Mai'}</strong></div>
              <div><span>Email confermata</span><strong>{user.email_confirmed_at ? 'Sì' : 'No'}</strong></div>
              {user.phone ? <div><span>Telefono</span><strong>{user.phone}</strong></div> : null}
            </div>

            <div className="admin-auth-user__controls">
              <section className="admin-user-control-box">
                <div>
                  <span className="admin-user-control-kicker">Permessi</span>
                  <h3>Ruolo utente</h3>
                  <p>Il ruolo viene aggiornato sia in Supabase Auth sia nelle tabelle utilizzate dal portale.</p>
                </div>
                <div className="admin-user-control-row">
                  <select
                    value={role}
                    disabled={busy || user.is_current}
                    onChange={(event) => setRoleDrafts((prev) => ({ ...prev, [user.id]: event.target.value }))}
                  >
                    <option value="customer">Cliente assistenza</option>
                    <option value="technician">Tecnico assistenza</option>
                    <option value="admin">Amministratore completo</option>
                  </select>
                  <button
                    type="button"
                    className="admin-primary-button"
                    disabled={busy || user.is_current || role === user.role}
                    onClick={() => handleRoleUpdate(user)}
                  >
                    {busy ? 'Aggiornamento...' : 'Salva permessi'}
                  </button>
                </div>
                {user.is_current ? <small>Per sicurezza non puoi cambiare il ruolo dell’account con cui sei loggato.</small> : null}
              </section>

              <section className="admin-user-control-box">
                <div>
                  <span className="admin-user-control-kicker">Supabase Auth</span>
                  <h3>Imposta nuova password</h3>
                  <p>La password viene modificata direttamente sull’account Auth, senza email di reset.</p>
                </div>
                <div className="admin-user-password-row">
                  <div className="admin-password-field">
                    <input
                      type={passwordVisible[user.id] ? 'text' : 'password'}
                      value={passwordDrafts[user.id] || ''}
                      minLength="8"
                      autoComplete="new-password"
                      placeholder="Nuova password (min. 8 caratteri)"
                      onChange={(event) => setPasswordDrafts((prev) => ({ ...prev, [user.id]: event.target.value }))}
                    />
                    <button
                      type="button"
                      className="admin-password-eye"
                      aria-label={passwordVisible[user.id] ? 'Nascondi password' : 'Mostra password'}
                      onClick={() => setPasswordVisible((prev) => ({ ...prev, [user.id]: !prev[user.id] }))}
                    >
                      {passwordVisible[user.id] ? '🙈' : '👁'}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary-button"
                    disabled={busy || (passwordDrafts[user.id] || '').length < 8}
                    onClick={() => handlePasswordUpdate(user)}
                  >
                    Aggiorna password
                  </button>
                </div>
              </section>
            </div>

            {!user.is_current ? (
              <div className="admin-auth-user__danger">
                <div>
                  <strong>Elimina definitivamente account</strong>
                  <span>Rimuove l’utente da Supabase Auth. Se l’account ha ticket o messaggi collegati, la cancellazione viene bloccata per non perdere lo storico assistenza.</span>
                </div>
                <button type="button" disabled={busy} onClick={() => handleDelete(user)}>Elimina da Supabase</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    )
  }

  return (
    <AdminLayout
      title="Utenti e tecnici"
      subtitle="Gestisci direttamente gli account presenti in Supabase Auth: ruoli, password e cancellazione definitiva."
    >
      {error ? <div className="admin-users-alert is-error">{error}</div> : null}
      {success ? <div className="admin-users-alert is-success">{success}</div> : null}

      <div className="admin-users-layout">
        <section className="admin-panel-card admin-user-form-card">
          <div className="admin-card-heading">
            <span>Nuovo accesso staff</span>
            <h2>Aggiungi utente</h2>
            <p>I clienti continuano a registrarsi dal portale Assistenza. Da qui puoi creare direttamente tecnici o amministratori.</p>
          </div>

          <form className="admin-user-form" onSubmit={handleSubmit}>
            <label>
              Ruolo
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="technician">Tecnico assistenza</option>
                <option value="admin">Amministratore completo</option>
              </select>
            </label>
            <label>Nome e cognome<input name="fullName" value={form.fullName} onChange={handleChange} required /></label>
            <label>Email aziendale<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="nome@idealtech.it" required /></label>
            <label>
              Password temporanea
              <div className="admin-password-field">
                <input type={showCreatePassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} minLength="8" autoComplete="new-password" required />
                <button type="button" className="admin-password-eye" aria-label={showCreatePassword ? 'Nascondi password' : 'Mostra password'} onClick={() => setShowCreatePassword((value) => !value)}>{showCreatePassword ? '🙈' : '👁'}</button>
              </div>
              <small>Almeno 8 caratteri.</small>
            </label>

            <button className="admin-primary-button" type="submit" disabled={saving}>{saving ? 'Creazione...' : form.role === 'technician' ? 'Crea tecnico' : 'Crea amministratore'}</button>
          </form>
        </section>

        <section className="admin-panel-card admin-users-list-card">
          <div className="admin-card-heading admin-users-list-heading">
            <div><span>Supabase Auth</span><h2>Tutti gli utenti</h2><p>Qui compaiono anche clienti e account rimasti in Auth senza profilo.</p></div>
            <button type="button" className="admin-secondary-button" onClick={loadUsers} disabled={loading}>{loading ? 'Aggiornamento...' : 'Aggiorna elenco'}</button>
          </div>

          <div className="admin-users-toolbar">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cerca nome, email, azienda, telefono o ID..." />
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">Tutti ({counts.all})</option>
              <option value="customer">Clienti ({counts.customer})</option>
              <option value="technician">Tecnici ({counts.technician})</option>
              <option value="admin">Admin ({counts.admin})</option>
              <option value="unassigned">Senza ruolo ({counts.unassigned})</option>
            </select>
          </div>

          {loading ? <p className="admin-users-empty">Caricamento utenti Supabase...</p> : (
            <div className="admin-auth-users-list">
              {filteredUsers.map(renderUser)}
              {!filteredUsers.length ? <p className="admin-users-empty">Nessun utente corrisponde ai filtri.</p> : null}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
