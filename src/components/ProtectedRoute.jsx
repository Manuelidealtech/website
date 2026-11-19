import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, role, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Caricamento...</div>
  if (!user) return <Navigate to="/login" replace />

  if (role === 'technician') return <Navigate to="/admin/assistenza" replace />
  if (role === 'customer') return <Navigate to="/assistenza/portale" replace />
  if (role !== 'admin' && role !== 'editor') return <Navigate to="/" replace />

  return children
}
