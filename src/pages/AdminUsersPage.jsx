/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import '../styles/AdminUsersPage.css'

const emptyForm = { fullName: '', email: '', password: '' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  useEffect(() => {
    loadUsers()
  }, [])

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
      await apiRequest('', { method: 'POST', body: JSON.stringify(form) })
      setSuccess('Accesso amministratore creato. Comunica alla collega email e password temporanea.')
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

  return (
    <AdminLayout
      title="Utenti amministratori"
      subtitle="Crea un accesso personale per i colleghi che devono aggiornare marketing, news, contatti e store."
    >
      <div className="admin-users-layout">
        <section className="admin-panel-card admin-user-form-card">
          <div className="admin-card-heading">
            <span>Nuovo accesso</span>
            <h2>Aggiungi amministratore</h2>
            <p>La password è temporanea e può essere cambiata successivamente da Supabase.</p>
          </div>

          <form className="admin-user-form" onSubmit={handleSubmit}>
            <label>
              Nome e cognome
              <input name="fullName" value={form.fullName} onChange={handleChange} required />
            </label>
            <label>
              Email aziendale
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="nome@idealtech.it" required />
            </label>
            <label>
              Password temporanea
              <input type="password" name="password" value={form.password} onChange={handleChange} minLength="8" required />
              <small>Almeno 8 caratteri.</small>
            </label>

            {error ? <div className="auth-message error">{error}</div> : null}
            {success ? <div className="auth-message success">{success}</div> : null}

            <button className="admin-primary-button" type="submit" disabled={saving}>
              {saving ? 'Creazione...' : 'Crea accesso admin'}
            </button>
          </form>
        </section>

        <section className="admin-panel-card admin-users-list-card">
          <div className="admin-card-heading">
            <span>Accessi attivi</span>
            <h2>Amministratori</h2>
          </div>

          {loading ? (
            <p>Caricamento utenti...</p>
          ) : (
            <div className="admin-users-list">
              {users.map((user) => (
                <article className="admin-user-row" key={user.id}>
                  <div className="admin-user-avatar">
                    {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-user-details">
                    <strong>{user.full_name || 'Amministratore'}</strong>
                    <span>{user.email}</span>
                    <small>
                      {user.last_sign_in_at
                        ? `Ultimo accesso: ${new Date(user.last_sign_in_at).toLocaleString('it-IT')}`
                        : 'Non ha ancora effettuato l’accesso'}
                    </small>
                  </div>
                  <div className="admin-user-row-actions">
                    <span className="admin-role-badge">Admin</span>
                    {!user.is_current ? (
                      <button type="button" onClick={() => handleDelete(user)}>Rimuovi</button>
                    ) : (
                      <span className="admin-current-user">Tu</span>
                    )}
                  </div>
                </article>
              ))}
              {!users.length ? <p>Nessun amministratore trovato.</p> : null}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
