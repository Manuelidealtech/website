import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/NewsPage.css'

export default function NewsPage() {
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
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  function getPreviewText(item) {
    const text = item.excerpt || item.content || ''
    return text.length > 140 ? `${text.slice(0, 140)}...` : text
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
                      src={item.image_url || '/news-1.jpg'}
                      alt={item.title}
                    />
                  </div>

                  <div className="news-page-body">
                    <span className="news-page-date">
                      {formatDate(item.published_at)}
                    </span>

                    <h2>{item.title}</h2>

                    <p>{getPreviewText(item)}</p>

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
                src={selectedNews.image_url || '/news-1.jpg'}
                alt={selectedNews.title}
              />
            </div>

            <div className="news-modal-content">
              <span className="news-modal-date">
                {formatDate(selectedNews.published_at)}
              </span>

              <h2>{selectedNews.title}</h2>

              {selectedNews.excerpt && (
                <p className="news-modal-excerpt">{selectedNews.excerpt}</p>
              )}

              <div className="news-modal-text">
                {selectedNews.content
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