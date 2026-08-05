/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { getLocalizedField, getMachineStatusLabel } from '../i18n/contentTranslations'
import BackButton from '../components/BackButton'
import '../styles/PublicStorePage.css'


function getDescriptionExcerpt(value, maxLength = 155) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}…` : text
}

export default function PublicStorePage() {
  const { language, locale } = useLanguage()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadMachines() {
    setLoading(true)
    setErrorMessage('')

    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true, nullsFirst: false })
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

  useEffect(() => {
    loadMachines()
  }, [])

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
            {machines.map((machine) => {
              const title = getLocalizedField(machine, 'title', language)
              const description = getDescriptionExcerpt(
                getLocalizedField(machine, 'description', language) || machine.description
              )
              const metadata = [
                machine.brand,
                machine.model,
                getLocalizedField(machine, 'category', language),
                machine.year ? String(machine.year) : '',
              ].filter(Boolean)

              return (
                <Link
                  key={machine.id}
                  to={`/macchinario/${machine.slug}`}
                  className="store-card"
                >
                  <div className="store-card-image">
                    {machine.cover_image ? (
                      <img src={machine.cover_image} alt={title} />
                    ) : (
                      <div className="machine-thumb-placeholder">Nessuna immagine</div>
                    )}
                  </div>

                  <div className="store-card-body">
                    <h3>{title}</h3>

                    {metadata.length ? (
                      <div className="store-card-meta">
                        {metadata.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
                      </div>
                    ) : null}

                    {description ? (
                      <p className="store-card-description">{description}</p>
                    ) : null}

                    <div className="store-card-footer">
                      <span className={`status-badge status-${machine.status}`}>
                        {getMachineStatusLabel(machine.status, language)}
                      </span>

                      <strong className="store-card-price">
                        <span>
                          {Number(machine.price || 0).toLocaleString(locale, {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </span>
                        {machine.price_includes_vat === false ? <small>IVA esclusa</small> : null}
                      </strong>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}