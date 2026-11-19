import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/LoginPage.css'

export default function LoginPage() {
  const { user, role, loading: authLoading, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (authLoading) return <div style={{ padding: 24 }}>Caricamento...</div>

  if (user) {
    if (role === 'customer') return <Navigate to="/assistenza/portale" replace />
    if (role === 'technician') return <Navigate to="/admin/assistenza" replace />
    if (role === 'admin' || role === 'editor') return <Navigate to="/admin" replace />
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) setErrorMessage(error.message)
    } catch (err) {
      setErrorMessage('Si è verificato un errore imprevisto.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape-1" />
      <div className="auth-bg-shape auth-bg-shape-2" />
      <div className="auth-bg-grid" />

      <div className="auth-card">
        <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>← Torna indietro</button>
        <br />
        <span className="auth-kicker">Area riservata</span>
        <h1>Accedi</h1>
        <p className="auth-subtitle">Accesso riservato allo staff Idealtech.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@idealtech.it" required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Inserisci password" required />
          </div>

          {errorMessage && <div className="auth-message error">{errorMessage}</div>}

          <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Attendere...' : 'Accedi'}</button>
        </form>
      </div>
    </div>
  )
}
