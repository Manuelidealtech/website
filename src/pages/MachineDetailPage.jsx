import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BackButton from '../components/BackButton'
import '../styles/MachineDetailPage.css'

export default function MachineDetailPage() {
  const { slug } = useParams()

  const [machine, setMachine] = useState(null)
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadMachine()
  }, [slug])

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
          <h1>{machine.title}</h1>
          <p>
            {machine.brand || '—'} · {machine.model || '—'} · {machine.category || '—'}
          </p>
        </div>

        <div className="topbar-actions">
          <BackButton fallback="/store" />
        </div>
      </div>

      <div className="machine-detail-layout">
        <div className="content-card">
          <div className="detail-main-image">
            {selectedImage ? (
              <img src={selectedImage} alt={machine.title} />
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
                  className={`detail-thumb-btn ${
                    selectedImage === image.image_url ? 'active' : ''
                  }`}
                  onClick={() => setSelectedImage(image.image_url)}
                >
                  <img src={image.image_url} alt={machine.title} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="content-card detail-info-card">
          <div className="detail-price-row">
            <span className={`status-badge status-${machine.status}`}>
              {machine.status === 'available'
                ? 'Disponibile'
                : machine.status === 'reserved'
                ? 'Riservato'
                : 'Venduto'}
            </span>

            <strong className="detail-price">
              {Number(machine.price || 0).toLocaleString('it-IT', {
                style: 'currency',
                currency: 'EUR',
              })}
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
              <strong>{machine.category || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>Condizione</span>
              <strong>{machine.condition || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>Anno</span>
              <strong>{machine.year || '—'}</strong>
            </div>

          </div>

          <div className="detail-description">
            <h3>Descrizione</h3>
            <p>{machine.description || 'Nessuna descrizione disponibile.'}</p>
          </div>

          <div className="detail-actions">
            <a href="/login" className="auth-button">
              Richiedi informazioni
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}