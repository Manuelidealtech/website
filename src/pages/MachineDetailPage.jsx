import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { getLocalizedField, getMachineStatusLabel } from '../i18n/contentTranslations'
import BackButton from '../components/BackButton'
import '../styles/MachineDetailPage.css'
import { Link, useParams } from 'react-router-dom'

export default function MachineDetailPage() {
  const { language, locale } = useLanguage()
  const { slug } = useParams()

  const [machine, setMachine] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadMachine() {
    setLoading(true)
    setErrorMessage('')

    try {
      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle()

      if (machineError) {
        throw new Error(machineError.message)
      }

      if (!machineData) {
        throw new Error('Macchinario non trovato.')
      }

      setMachine(machineData)

      const { data: imagesData, error: imagesError } = await supabase
        .from('machine_images')
        .select('*')
        .eq('machine_id', machineData.id)
        .order('sort_order', { ascending: true })

      if (imagesError) {
        throw new Error(imagesError.message)
      }

      const imageList = imagesData || []
      setImages(imageList)

      if (imageList.length > 0) {
        setSelectedImage(imageList[0].image_url)
      } else {
        setSelectedImage(machineData.cover_image || '')
      }
    } catch (error) {
      setErrorMessage(error.message || 'Errore nel caricamento del macchinario.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMachine()
  }, [slug])

  if (loading) {
    return (
      <div className="page-shell">
        <div className="content-card">
          <p>Caricamento...</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="page-shell">
        <div className="page-topbar">
          <div>
            <h1>Dettaglio macchinario</h1>
            <p>Si è verificato un problema.</p>
          </div>
          <BackButton fallback="/store" />
        </div>

        <div className="content-card">
          <div className="auth-message error">{errorMessage}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="site-container machine-detail-page">
      <div className="page-topbar">
        <div>
          <h1>{getLocalizedField(machine, 'title', language)}</h1>
          {[machine.brand, machine.model, getLocalizedField(machine, 'category', language)]
            .filter(Boolean).length ? (
            <p>{[machine.brand, machine.model, getLocalizedField(machine, 'category', language)].filter(Boolean).join(' · ')}</p>
          ) : null}
        </div>

        <div className="topbar-actions">
          <BackButton fallback="/store" />
        </div>
      </div>

      <div className="machine-detail-layout">
        <div className="content-card">
          <div className="detail-main-image">
            {selectedImage ? (
              <img src={selectedImage} alt={getLocalizedField(machine, 'title', language)} />
            ) : (
              <div className="machine-thumb-placeholder">Nessuna immagine</div>
            )}
          </div>

          {images.length > 0 && (
            <div className="detail-thumbs">
              {images.map((image) => (
                <button
                  type="button"
                  key={image.id}
                  className={`detail-thumb-btn ${selectedImage === image.image_url ? 'active' : ''
                    }`}
                  onClick={() => setSelectedImage(image.image_url)}
                >
                  <img src={image.image_url} alt={getLocalizedField(machine, 'title', language)} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="content-card detail-info-card">
          <div className="detail-price-row">
            <span className={`status-badge status-${machine.status}`}>
              {getMachineStatusLabel(machine.status, language)}
            </span>

            <strong className="detail-price">
              <span>
                {Number(machine.price || 0).toLocaleString(locale, {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
              {machine.price_includes_vat === false ? <small>IVA esclusa</small> : null}
            </strong>
          </div>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span>Marca</span>
              <strong>{machine.brand || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>Modello</span>
              <strong>{machine.model || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>Categoria</span>
              <strong>{getLocalizedField(machine, 'category', language) || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>Condizione</span>
              <strong>{getLocalizedField(machine, 'condition', language) || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>Anno</span>
              <strong>{machine.year || '—'}</strong>
            </div>

          </div>

          <div className="detail-description">
            <h3>Descrizione</h3>
            <p>{getLocalizedField(machine, 'description', language) || 'Nessuna descrizione disponibile.'}</p>
          </div>

          <div className="detail-actions">
            <Link
              to={`/contatti?macchinario=${encodeURIComponent(
                getLocalizedField(machine, 'title', language) || machine.model || ''
              )}`}
              className="auth-button"
            >
              Richiedi informazioni
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}