import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [supportStaff, setSupportStaff] = useState(null)
  const [supportCustomer, setSupportCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchAccountData(userId) {
    try {
      const [profileResult, staffResult, customerResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('support_staff').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('support_customers').select('*').eq('user_id', userId).maybeSingle(),
      ])

      // Le tabelle assistenza potrebbero non essere ancora state create: non blocchiamo il login admin esistente.
      if (profileResult.error) console.error('Errore caricamento profilo:', profileResult.error)
      if (staffResult.error && staffResult.error.code !== '42P01') console.error('Errore caricamento tecnico:', staffResult.error)
      if (customerResult.error && customerResult.error.code !== '42P01') console.error('Errore caricamento cliente assistenza:', customerResult.error)

      return {
        profile: profileResult.data ?? null,
        supportStaff: staffResult.data ?? null,
        supportCustomer: customerResult.data ?? null,
      }
    } catch (err) {
      console.error('Eccezione caricamento dati account:', err)
      return { profile: null, supportStaff: null, supportCustomer: null }
    }
  }

  async function applyAccountData(currentUser) {
    if (!currentUser) {
      setProfile(null)
      setSupportStaff(null)
      setSupportCustomer(null)
      return
    }

    const account = await fetchAccountData(currentUser.id)
    setProfile(account.profile)
    setSupportStaff(account.supportStaff)
    setSupportCustomer(account.supportCustomer)
  }

  async function bootstrapAuth() {
    try {
      setLoading(true)

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Errore getSession:', error)
        setSession(null)
        setUser(null)
        await applyAccountData(null)
        return
      }

      const currentUser = currentSession?.user ?? null
      setSession(currentSession ?? null)
      setUser(currentUser)
      await applyAccountData(currentUser)
    } catch (err) {
      console.error('Errore bootstrapAuth:', err)
      setSession(null)
      setUser(null)
      await applyAccountData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    bootstrapAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession ?? null)
      setUser(newSession?.user ?? null)

      setTimeout(async () => {
        try {
          await applyAccountData(newSession?.user ?? null)
        } finally {
          setLoading(false)
        }
      }, 0)
    })

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') await bootstrapAuth()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp({ email, password, fullName, company = '', phone = '', accountType = '' }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: accountType === 'support_customer'
          ? `${window.location.origin}/assistenza/portale`
          : undefined,
        data: {
          full_name: fullName,
          company,
          phone,
          account_type: accountType,
        },
      },
    })
  }

  async function signOut() {
    return await supabase.auth.signOut()
  }

  async function refreshAccount() {
    if (!user) return
    await applyAccountData(user)
  }

  const role = profile?.role || supportStaff?.role || (supportCustomer ? 'customer' : null)
  const isAdmin = role === 'admin'
  const isEditor = role === 'editor'
  const isTechnician = role === 'technician'
  const isCustomer = role === 'customer'
  const isSupportStaff = isAdmin || isTechnician

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      supportStaff,
      supportCustomer,
      role,
      loading,
      signIn,
      signUp,
      signOut,
      refreshAccount,
      isAdmin,
      isEditor,
      isTechnician,
      isCustomer,
      isSupportStaff,
    }),
    [session, user, profile, supportStaff, supportCustomer, role, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth deve essere usato dentro AuthProvider')
  return context
}
