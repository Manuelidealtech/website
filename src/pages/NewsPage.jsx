import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { getLocalizedField, getLocalizedNewsPreview } from '../i18n/contentTranslations'
import '../styles/NewsPage.css'

export default function NewsPage() {
  const { language, locale } = useLanguage()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedNews, setSelectedNews] = useState(null)

  useEffect(() => {
    loadNews()
  }, [])

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        closeModal()
      }
    }

    if (selectedNews) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [selectedNews])

  async function loadNews() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setNews(data || [])
    setLoading(false)
  }

  function openModal(item) {
    setSelectedNews(item)
  }

  function closeModal() {
    setSelectedNews(null)
  }

  function formatDate(date) {
    if (!date) return ''
    return new Date(date).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }


  return (
    <div className="news-page">
      <section className="news-page-hero">
        <div className="site-container">
          <span className="news-page-kicker">Blog & fiere</span>
          <h1>Ultime News</h1>
          <p>
            Aggiornamenti, eventi, fiere e comunicazioni ufficiali dal mondo Idealtech.
          </p>
        </div>
      </section>

      <section className="news-page-list">
        <div className="site-container">
          {loading && <p>Caricamento news...</p>}
          {error && <p>{error}</p>}

          {!loading && !error && (
            <div className="news-page-grid">
              {news.map((item) => (
                <article className="news-page-card" key={item.id}>
                  <div className="news-page-image">
                    <img
                      src={item.image_url || '/home-hero-1280.webp'}
                      alt={getLocalizedField(item, 'title', language)}
                    />
                  </div>

                  <div className="news-page-body">
                    <span className="news-page-date">
                      {formatDate(item.published_at)}
                    </span>

                    <h2>{getLocalizedField(item, 'title', language)}</h2>

                    <p>{getLocalizedNewsPreview(item, language, 140)}</p>

                    <div className="news-page-actions">
                      <button
                        type="button"
                        className="news-page-modal-btn"
                        onClick={() => openModal(item)}
                      >
                        Leggi di più
                      </button>

                      <Link to="/contatti" className="news-page-link">
                        Richiedi informazioni
                      </Link>
                    </div>
                  </div>
                </article>
              ))}

              {!news.length && <p>Nessuna news pubblicata al momento.</p>}
            </div>
          )}
        </div>
      </section>

      {selectedNews && (
        <div className="news-modal-overlay" onClick={closeModal}>
          <div
            className="news-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="news-modal-close"
              onClick={closeModal}
              aria-label="Chiudi modale"
            >
              ×
            </button>

            <div className="news-modal-image">
              <img
                src={selectedNews.image_url || '/home-hero-1280.webp'}
                alt={getLocalizedField(selectedNews, 'title', language)}
              />
            </div>

            <div className="news-modal-content">
              <span className="news-modal-date">
                {formatDate(selectedNews.published_at)}
              </span>

              <h2>{getLocalizedField(selectedNews, 'title', language)}</h2>

              {getLocalizedField(selectedNews, 'excerpt', language) && (
                <p className="news-modal-excerpt">{getLocalizedField(selectedNews, 'excerpt', language)}</p>
              )}

              <div className="news-modal-text">
                {getLocalizedField(selectedNews, 'content', language)
                  ?.split('\n')
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>

              <div className="news-modal-actions">
                <Link to="/contatti" className="news-page-link" onClick={closeModal}>
                  Richiedi informazioni
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}