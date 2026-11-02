/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import '../styles/AdminUsersPage.css'

const emptyForm = { fullName: '', email: '', password: '', role: 'technician' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const admins = useMemo(() => users.filter((user) => user.role === 'admin'), [users])
  const technicians = useMemo(() => users.filter((user) => user.role === 'technician'), [users])

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
        ? 'Tecnico creato. Vedrà esclusivamente il portale assistenza e le richieste clienti.'
        : 'Accesso amministratore creato correttamente.')
      setForm(emptyForm)
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user) {
    const ok = window.confirm(`Vuoi rimuovere l’accesso di ${user.full_name || user.email}?`)
    if (!ok) return

    try {
      setError('')
      await apiRequest(`?id=${encodeURIComponent(user.id)}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((item) => item.id !== user.id))
    } catch (err) {
      setError(err.message)
    }
  }

  function renderUser(user) {
    const technician = user.role === 'technician'
    return (
      <article className="admin-user-row" key={user.id}>
        <div className={`admin-user-avatar ${technician ? 'is-technician' : ''}`}>
          {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
        </div>
        <div className="admin-user-details">
          <strong>{user.full_name || (technician ? 'Tecnico' : 'Amministratore')}</strong>
          <span>{user.email}</span>
          <small>{user.last_sign_in_at ? `Ultimo accesso: ${new Date(user.last_sign_in_at).toLocaleString('it-IT')}` : 'Non ha ancora effettuato l’accesso'}</small>
        </div>
        <div className="admin-user-row-actions">
          <span className={`admin-role-badge ${technician ? 'is-technician' : ''}`}>{technician ? 'Tecnico' : 'Admin'}</span>
          {!user.is_current ? <button type="button" onClick={() => handleDelete(user)}>Rimuovi</button> : <span className="admin-current-user">Tu</span>}
        </div>
      </article>
    )
  }

  return (
    <AdminLayout
      title="Utenti e tecnici"
      subtitle="Crea accessi amministrativi oppure tecnici dedicati esclusivamente al portale assistenza."
    >
      <div className="admin-users-layout">
        <section className="admin-panel-card admin-user-form-card">
          <div className="admin-card-heading">
            <span>Nuovo accesso</span>
            <h2>Aggiungi utente</h2>
            <p>Scegli il ruolo. Il tecnico vedrà solo ticket e chat assistenza, senza accesso al resto dell’amministrazione.</p>
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
            <label>Password temporanea<input type="password" name="password" value={form.password} onChange={handleChange} minLength="8" required /><small>Almeno 8 caratteri.</small></label>

            {error ? <div className="auth-message error">{error}</div> : null}
            {success ? <div className="auth-message success">{success}</div> : null}

            <button className="admin-primary-button" type="submit" disabled={saving}>{saving ? 'Creazione...' : form.role === 'technician' ? 'Crea tecnico' : 'Crea amministratore'}</button>
          </form>
        </section>

        <section className="admin-panel-card admin-users-list-card">
          <div className="admin-card-heading"><span>Accessi attivi</span><h2>Team Idealtech</h2></div>
          {loading ? <p>Caricamento utenti...</p> : (
            <div className="admin-users-groups">
              <div className="admin-users-group">
                <div className="admin-users-group__title"><strong>Tecnici assistenza</strong><span>{technicians.length}</span></div>
                <div className="admin-users-list">{technicians.map(renderUser)}{!technicians.length ? <p>Nessun tecnico creato.</p> : null}</div>
              </div>
              <div className="admin-users-group">
                <div className="admin-users-group__title"><strong>Amministratori</strong><span>{admins.length}</span></div>
                <div className="admin-users-list">{admins.map(renderUser)}{!admins.length ? <p>Nessun amministratore trovato.</p> : null}</div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
