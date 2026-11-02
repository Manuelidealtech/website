import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CustomerSupportRoute({ children }) {
  const { user, role, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Caricamento...</div>
  if (!user) return <Navigate to="/assistenza/login" replace />
  if (role === 'admin' || role === 'technician') return <Navigate to="/admin/assistenza" replace />
  if (role === 'editor') return <Navigate to="/admin" replace />
  return children
}
