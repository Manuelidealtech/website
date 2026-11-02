import { Navigate } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

export default function SupportPublishedRoute({ children }) {
  const { get, loading, isPreview } = useSiteContent()

  if (loading) {
    return <div className="route-loader" role="status" aria-live="polite"><span>Caricamento...</span></div>
  }

  const enabled = get('support.enabled', true) !== false
  if (!enabled && !isPreview) return <Navigate to="/" replace />

  return children
}
