import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SupportStaffRoute({ children }) {
  const { user, role, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Caricamento...</div>
  if (!user) return <Navigate to="/login" replace />
  if (role !== 'admin' && role !== 'technician') return <Navigate to="/admin" replace />
  return children
}
