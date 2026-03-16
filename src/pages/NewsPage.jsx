import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/NewsPage.css'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNews()
  }, [])

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
                      {new Date(item.published_at).toLocaleDateString('it-IT')}
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.excerpt || item.content}</p>
                    <Link to="/contatti" className="news-page-link">
                      Richiedi informazioni
                    </Link>
                  </div>
                </article>
              ))}

              {!news.length && <p>Nessuna news pubblicata al momento.</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}