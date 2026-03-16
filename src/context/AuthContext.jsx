import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Errore caricamento profilo:', error)
        return null
      }

      return data ?? null
    } catch (err) {
      console.error('Eccezione caricamento profilo:', err)
      return null
    }
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
        setProfile(null)
        return
      }

      const currentUser = currentSession?.user ?? null

      setSession(currentSession ?? null)
      setUser(currentUser)

      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id)
        setProfile(profileData)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error('Errore bootstrapAuth:', err)
      setSession(null)
      setUser(null)
      setProfile(null)
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
          if (newSession?.user) {
            const profileData = await fetchProfile(newSession.user.id)
            setProfile(profileData)
          } else {
            setProfile(null)
          }
        } catch (err) {
          console.error('Errore onAuthStateChange:', err)
          setProfile(null)
        } finally {
          setLoading(false)
        }
      }, 0)
    })

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await bootstrapAuth()
      }
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

  async function signUp({ email, password, fullName }) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
  }

  async function signOut() {
    return await supabase.auth.signOut()
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin: profile?.role === 'admin',
      isEditor: profile?.role === 'editor',
    }),
    [session, user, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }

  return context
}