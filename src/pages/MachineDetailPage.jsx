import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { getMachineStatusLabel } from '../i18n/contentTranslations'
import { getMachineLocalizedField, machineUi } from '../i18n/machineTranslations'
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

  useEffect(() => {
    if (!machine) return

    const title = getMachineLocalizedField(machine, 'title', language) || machine.model || 'Macchinario usato'
    const rawDescription =
      getMachineLocalizedField(machine, 'description', language) ||
      [machine.brand, machine.model, getMachineLocalizedField(machine, 'category', language)]
        .filter(Boolean)
        .join(' · ')
    const description = String(rawDescription || 'Macchinario usato disponibile presso Idealtech.')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 165)
    const imageUrls = [
      ...images.map((image) => image.image_url),
      machine.cover_image,
    ].filter(Boolean)
    const availability =
      machine.status === 'available'
        ? 'https://schema.org/InStock'
        : machine.status === 'reserved'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/OutOfStock'
    const price = Number(machine.price || 0)

    const product = {
      name: title,
      description,
      image: imageUrls.length ? [...new Set(imageUrls)] : undefined,
      sku: machine.id ? String(machine.id) : undefined,
      model: machine.model || undefined,
      category: getMachineLocalizedField(machine, 'category', language) || undefined,
      itemCondition: 'https://schema.org/UsedCondition',
      brand: machine.brand
        ? { '@type': 'Brand', name: machine.brand }
        : { '@type': 'Brand', name: 'Idealtech' },
      offers: price > 0
        ? {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price,
            availability,
            itemCondition: 'https://schema.org/UsedCondition',
            url: `${window.location.origin}/macchinario/${slug}`,
            seller: { '@id': 'https://www.idealtech.it/#organization' },
          }
        : undefined,
    }

    window.dispatchEvent(
      new CustomEvent('idealtech:seo-override', {
        detail: {
          path: `/macchinario/${slug}`,
          page_name: title,
          title: `${title} ${machineUi('used', language)} | Idealtech`,
          description,
          og_title: `${title} ${machineUi('used', language)} | Idealtech`,
          og_description: description,
          og_image_url: imageUrls[0] || undefined,
          product,
        },
      })
    )
  }, [images, language, machine, slug])

  if (loading) {
    return (
      <div className="page-shell">
        <div className="content-card">
          <p>{machineUi('loading', language)}</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="page-shell">
        <div className="page-topbar">
          <div>
            <h1>{machineUi('detailTitle', language)}</h1>
            <p>{machineUi('problem', language)}</p>
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
          <h1 data-no-translate>{getMachineLocalizedField(machine, 'title', language)}</h1>
          {[machine.brand, machine.model, getMachineLocalizedField(machine, 'category', language)]
            .filter(Boolean).length ? (
            <p data-no-translate>{[machine.brand, machine.model, getMachineLocalizedField(machine, 'category', language)].filter(Boolean).join(' · ')}</p>
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
              <img src={selectedImage} alt={getMachineLocalizedField(machine, 'title', language)} />
            ) : (
              <div className="machine-thumb-placeholder">{machineUi('missing', language)}</div>
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
                  <img src={image.image_url} alt={getMachineLocalizedField(machine, 'title', language)} />
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
              {machine.price_includes_vat === false ? <small>{machineUi('vatExcluded', language)}</small> : null}
            </strong>
          </div>

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span>{machineUi('brand', language)}</span>
              <strong>{machine.brand || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>{machineUi('model', language)}</span>
              <strong>{machine.model || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>{machineUi('category', language)}</span>
              <strong data-no-translate>{getMachineLocalizedField(machine, 'category', language) || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>{machineUi('condition', language)}</span>
              <strong data-no-translate>{getMachineLocalizedField(machine, 'condition', language) || '—'}</strong>
            </div>

            <div className="detail-info-item">
              <span>{machineUi('year', language)}</span>
              <strong>{machine.year || '—'}</strong>
            </div>

          </div>

          <div className="detail-description">
            <h3>{machineUi('description', language)}</h3>
            <p data-no-translate>{getMachineLocalizedField(machine, 'description', language) || machineUi('noDescription', language)}</p>
          </div>

          <div className="detail-actions">
            <Link
              to={`/contatti?macchinario=${encodeURIComponent(
                getMachineLocalizedField(machine, 'title', language) || machine.model || ''
              )}`}
              className="auth-button"
            >
              {machineUi('request', language)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}