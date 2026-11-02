import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import '../styles/SupportAuthPage.css'

export default function SupportAuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const isRegister = location.pathname.includes('registrazione')
  const { user, role, loading: authLoading, signIn, signUp } = useAuth()
  const [form, setForm] = useState({ fullName: '', company: '', phone: '', email: '', password: '', confirmPassword: '', privacy: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setError('')
    setSuccess('')
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

      const { data, error: signUpError } = await signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        accountType: 'support_customer',
      })
      if (signUpError) throw signUpError

      if (data.session) {
        navigate('/assistenza/portale', { replace: true })
      } else {
        setSuccess('Account creato. Controlla la tua email e conferma l’indirizzo prima di accedere al portale assistenza.')
      }
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
          <label>Password<input type="password" value={form.password} onChange={(e) => change('password', e.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="8" required /></label>
          {isRegister ? (
            <>
              <label>Conferma password<input type="password" value={form.confirmPassword} onChange={(e) => change('confirmPassword', e.target.value)} autoComplete="new-password" minLength="8" required /></label>
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
