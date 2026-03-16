import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminOnlyRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 24 }}>Caricamento...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}