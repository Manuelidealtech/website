import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BackButton from '../components/BackButton'
import '../styles/PublicStorePage.css'

export default function PublicStorePage() {
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadMachines()
  }, [])

  async function loadMachines() {
    setLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      setMachines(data || [])
    } catch (error) {
      setErrorMessage(error.message || 'Errore nel caricamento dello store.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-topbar">
        <div>
          <h1>Store macchinari usati</h1>
          <p>Consulta i macchinari attualmente pubblicati.</p>
        </div>

        <div className="topbar-actions">
          <BackButton fallback="/" />
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <p>Caricamento...</p>
        ) : errorMessage ? (
          <div className="auth-message error">{errorMessage}</div>
        ) : machines.length === 0 ? (
          <div className="empty-state">
            <h3>Nessun macchinario pubblicato</h3>
            <p>Al momento lo store è vuoto.</p>
          </div>
        ) : (
          <div className="store-grid">
            {machines.map((machine) => (
              <Link
                key={machine.id}
                to={`/macchinario/${machine.slug}`}
                className="store-card"
              >
                <div className="store-card-image">
                  {machine.cover_image ? (
                    <img src={machine.cover_image} alt={machine.title} />
                  ) : (
                    <div className="machine-thumb-placeholder">No image</div>
                  )}
                </div>

                <div className="store-card-body">
                  <h3>{machine.title}</h3>
                  <p className="store-card-subtitle">
                    {machine.brand || '—'} · {machine.model || '—'}
                  </p>
                  <p className="store-card-subtitle">
                    {machine.category || '—'} · {machine.location || '—'}
                  </p>

                  <div className="store-card-footer">
                    <span className={`status-badge status-${machine.status}`}>
                      {machine.status === 'available'
                        ? 'Disponibile'
                        : machine.status === 'reserved'
                        ? 'Riservato'
                        : 'Venduto'}
                    </span>

                    <strong>
                      {Number(machine.price || 0).toLocaleString('it-IT', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </strong>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}