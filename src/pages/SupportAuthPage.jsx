import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import '../styles/SupportAuthPage.css'

export default function SupportAuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRegister = location.pathname.includes('registrazione')
  const { user, role, loading: authLoading, signIn } = useAuth()
  const [form, setForm] = useState({ fullName: '', company: '', phone: '', email: '', password: '', confirmPassword: '', privacy: false, website: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setError('')
    setSuccess('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }, [isRegister])

  if (!authLoading && user) {
    if (role === 'admin' || role === 'technician') return <Navigate to="/admin/assistenza" replace />
    if (role === 'editor') return <Navigate to="/admin" replace />
    return <Navigate to="/assistenza/portale" replace />
  }

  function change(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function resolveLoginDestination(userId) {
    const [profileResult, staffResult] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', userId).maybeSingle(),
      supabase.from('support_staff').select('role,active').eq('user_id', userId).maybeSingle(),
    ])

    if (profileResult.data?.role === 'admin') return '/admin/assistenza'
    if (profileResult.data?.role === 'editor') return '/admin'
    if (staffResult.data?.role === 'technician' && staffResult.data?.active !== false) return '/admin/assistenza'
    return '/assistenza/portale'
  }

  async function submitLogin(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      const { data, error: signInError } = await signIn(form.email.trim().toLowerCase(), form.password)
      if (signInError) throw signInError
      const destination = await resolveLoginDestination(data.user.id)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Email o password non corrette.')
    } finally {
      setSaving(false)
    }
  }

  async function submitRegistration(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (form.password.length < 8) throw new Error('La password deve contenere almeno 8 caratteri.')
      if (form.password !== form.confirmPassword) throw new Error('Le due password non coincidono.')
      if (!form.privacy) throw new Error('Devi accettare l’informativa privacy per creare l’account.')

      const email = form.email.trim().toLowerCase()
      const response = await fetch('/api/support-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          company: form.company.trim(),
          phone: form.phone.trim(),
          email,
          password: form.password,
          privacyAccepted: form.privacy,
          website: form.website || '',
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Impossibile completare la registrazione.')

      // L'account è già confermato dal backend: effettuiamo subito il login.
      const { data, error: signInError } = await signIn(email, form.password)
      if (signInError) throw signInError
      if (!data?.user) throw new Error('Account creato, ma accesso automatico non riuscito. Prova ad accedere manualmente.')

      navigate('/assistenza/portale', { replace: true })
    } catch (err) {
      setError(err.message || 'Impossibile completare la registrazione.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="support-auth-page">
      <div className="support-auth-orb support-auth-orb--one" />
      <div className="support-auth-orb support-auth-orb--two" />
      <section className="support-auth-card">
        <div className="support-auth-brand">
          <Link to="/assistenza"><img src="/logo-idealtech-900.webp" alt="Idealtech" /></Link>
          <span>Portale assistenza</span>
        </div>

        <div className="support-auth-tabs">
          <Link className={!isRegister ? 'is-active' : ''} to="/assistenza/login">Accedi</Link>
          <Link className={isRegister ? 'is-active' : ''} to="/assistenza/registrazione">Registrati</Link>
        </div>

        <div className="support-auth-heading">
          <span>{isRegister ? 'Nuovo cliente' : 'Bentornato'}</span>
          <h1>{isRegister ? 'Crea il tuo account assistenza' : 'Accedi ai tuoi ticket'}</h1>
          <p>{isRegister ? 'Registrati con email e password per aprire e seguire le richieste tecniche.' : 'Inserisci le credenziali per continuare la conversazione con Idealtech.'}</p>
        </div>

        <form className="support-auth-form" onSubmit={isRegister ? submitRegistration : submitLogin}>
          {isRegister ? (
            <>
              <label>Nome e cognome<input value={form.fullName} onChange={(e) => change('fullName', e.target.value)} required /></label>
              <label>Azienda<input value={form.company} onChange={(e) => change('company', e.target.value)} placeholder="Ragione sociale" /></label>
              <label>Telefono<input type="tel" value={form.phone} onChange={(e) => change('phone', e.target.value)} placeholder="+39 ..." /></label>
            </>
          ) : null}
          <label>Email<input type="email" value={form.email} onChange={(e) => change('email', e.target.value)} placeholder="nome@azienda.it" autoComplete="email" required /></label>
          <label>
            Password
            <span className="support-password-field">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => change('password', e.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="8" required />
              <button type="button" className="support-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Nascondi password' : 'Mostra password'} title={showPassword ? 'Nascondi password' : 'Mostra password'}>
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.7 4.3 9.7 5.6.4.5.4 1.2 0 1.7a16 16 0 0 1-2.4 2.6M6.2 6.2A16 16 0 0 0 2.3 9.6c-.4.5-.4 1.2 0 1.7C3.3 12.7 7 17 12 17c1 0 2-.2 2.8-.5" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.3 9.6C3.3 8.3 7 4 12 4s8.7 4.3 9.7 5.6c.4.5.4 1.2 0 1.7C20.7 12.7 17 17 12 17S3.3 12.7 2.3 11.3c-.4-.5-.4-1.2 0-1.7Z" /><circle cx="12" cy="10.5" r="2.7" /></svg>
                )}
              </button>
            </span>
          </label>
          {isRegister ? (
            <>
              <label>
                Conferma password
                <span className="support-password-field">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => change('confirmPassword', e.target.value)} autoComplete="new-password" minLength="8" required />
                  <button type="button" className="support-password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Nascondi password' : 'Mostra password'} title={showConfirmPassword ? 'Nascondi password' : 'Mostra password'}>
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.7 4.3 9.7 5.6.4.5.4 1.2 0 1.7a16 16 0 0 1-2.4 2.6M6.2 6.2A16 16 0 0 0 2.3 9.6c-.4.5-.4 1.2 0 1.7C3.3 12.7 7 17 12 17c1 0 2-.2 2.8-.5" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.3 9.6C3.3 8.3 7 4 12 4s8.7 4.3 9.7 5.6c.4.5.4 1.2 0 1.7C20.7 12.7 17 17 12 17S3.3 12.7 2.3 11.3c-.4-.5-.4-1.2 0-1.7Z" /><circle cx="12" cy="10.5" r="2.7" /></svg>
                    )}
                  </button>
                </span>
              </label>
              <label className="support-auth-honeypot" aria-hidden="true">Sito web<input tabIndex="-1" autoComplete="off" value={form.website || ''} onChange={(e) => change('website', e.target.value)} /></label>
              <label className="support-auth-privacy">
                <input type="checkbox" checked={form.privacy} onChange={(e) => change('privacy', e.target.checked)} />
                <span>Ho letto e accetto l’<a href="/termini-e-privacy" target="_blank" rel="noreferrer">informativa privacy</a>.</span>
              </label>
            </>
          ) : null}

          {error ? <div className="support-auth-message is-error">{error}</div> : null}
          {success ? <div className="support-auth-message is-success">{success}</div> : null}

          <button type="submit" disabled={saving || Boolean(success)}>{saving ? 'Attendere...' : isRegister ? 'Crea account' : 'Accedi al portale'}</button>
        </form>

        <Link className="support-auth-back" to="/assistenza">← Torna all’assistenza</Link>
      </section>
    </main>
  )
}
