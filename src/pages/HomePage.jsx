import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/HomePage.css'

const distributorLogos = [
  { src: '/macentro.jpg', alt: 'Macentro' },
  { src: '/meltwood.png', alt: 'Melt Wood' },
  { src: '/labmates.png', alt: 'Labmates Technology' },
  { src: '/novmelt.jpg', alt: 'Novmelt' },
  { src: '/belmix.jpg', alt: 'Belmix' },
]

export default function HomePage() {
  const loopedLogos = [...distributorLogos, ...distributorLogos]

  const [newsItems, setNewsItems] = useState([])

useEffect(() => {
  loadHomeNews()
}, [])

async function loadHomeNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3)

  if (!error) {
    setNewsItems(data || [])
  }
}

  return (
    <div className="homepage">
      <section className="home-hero">
        <div className="home-hero-overlay" />
        <div className="site-container home-hero-content">
          <div className="home-hero-text">
            <span className="home-hero-kicker">25 anni di esperienza</span>
            <h1>Soluzioni industriali per la gluing technology</h1>
            <p>
              Da oltre 25 anni Idealtech sviluppa, installa e supporta sistemi
              professionali per l’incollaggio industriale, con un approccio tecnico,
              affidabile e orientato alla qualità.
            </p>

            <div className="home-hero-actions">
              <Link to="/prodotti" className="home-btn home-btn-primary">
                Scopri i prodotti
              </Link>
              <Link to="/contatti" className="home-btn home-btn-secondary">
                Contattaci
              </Link>
            </div>
          </div>

          <div className="home-hero-card">
            <span className="home-badge">Idealtech Used</span>
            <h3>Macchinari usati e soluzioni professionali</h3>
            <p>
              Tecnologia di incollaggio all’avanguardia nella progettazione e produzione di sistemi per la fusione e l’erogazione di hot-melt.
            </p>
            <Link to="/store" className="home-card-link">
              Vai allo store usato
            </Link>
          </div>
        </div>
      </section>

      <section className="home-highlights">
        <div className="site-container home-highlights-grid">
          <div className="home-highlight-card">
            <div className="home-highlight-icon">⚙️</div>
            <h3>Vendita e installazione</h3>
            <p>Soluzioni complete per linee e impianti dedicati all’incollaggio industriale.</p>
          </div>

          <div className="home-highlight-card">
            <div className="home-highlight-icon">📐</div>
            <h3>Progettazione 3D</h3>
            <p>Sviluppo tecnico su misura per ottimizzare processi, spazi e performance.</p>
          </div>

          <div className="home-highlight-card">
            <div className="home-highlight-icon">🛠️</div>
            <h3>Supporto tecnico</h3>
            <p>Assistenza rapida, precisa e professionale durante tutte le fasi operative.</p>
          </div>

          <div className="home-highlight-card">
            <div className="home-highlight-icon">🔁</div>
            <h3>Revisione impianti</h3>
            <p>Aggiornamento, revisione e ottimizzazione di macchinari e sistemi esistenti.</p>
          </div>
        </div>
      </section>

      <section className="home-about">
        <div className="site-container home-about-grid">
          <div className="home-about-media">
            <img
              src="/img1.jpg"
              alt="Stand Idealtech in fiera"
              className="home-about-photo home-about-photo-large"
            />
            <img
              src="/img2.jpg"
              alt="Dettaglio componente macchinario Idealtech"
              className="home-about-photo home-about-photo-small"
            />
          </div>

          <div className="home-about-content">
            <span className="home-section-kicker">Chi siamo</span>
            <h2>Esperienza, innovazione e know-how costantemente aggiornato</h2>
            <p>
              Idealtech opera da oltre 25 anni nel settore della Gluing Technology,
              proponendo soluzioni professionali per applicazioni industriali con un
              approccio tecnico, concreto e orientato alla qualità.
            </p>
            <p>
              Dalla progettazione alla realizzazione, fino all’assistenza e alla
              revisione degli impianti, affianchiamo il cliente con competenza,
              affidabilità e attenzione alle esigenze produttive reali.
            </p>

            <div className="home-about-stats">
              <div className="home-stat-box">
                <strong>25+</strong>
                <span>Anni di esperienza</span>
              </div>
              <div className="home-stat-box">
                <strong>B2B</strong>
                <span>Approccio tecnico</span>
              </div>
              <div className="home-stat-box">
                <strong>360°</strong>
                <span>Servizio completo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="distributors-section">
        <div className="site-container">
          <div className="section-heading center">
            <span className="section-kicker">Network</span>
            <h2>I nostri distributori nel mondo</h2>
            <p>
              Una rete internazionale di partner selezionati per portare la qualità
              Idealtech in diversi mercati.
            </p>
          </div>

          <div className="logo-carousel">
            <div className="logo-track">
              {loopedLogos.map((logo, index) => (
                <div className="logo-item" key={`${logo.alt}-${index}`}>
                  <img src={logo.src} alt={logo.alt} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="news-section">
        <div className="site-container">
          <div className="section-heading center">
            <span className="section-kicker">Blog & fiere</span>
            <h2>Ultime News</h2>
            <p>
              Aggiornamenti su fiere, eventi, novità aziendali e comunicazioni pubblicate
              direttamente dal pannello amministrativo.
            </p>
          </div>

          <div className="news-grid">
            {newsItems.length > 0 ? (
              newsItems.map((item) => (
                <article className="news-card" key={item.id}>
                  <div className="news-card-image">
                    <img src={item.image_url || '/news-1.jpg'} alt={item.title} />
                  </div>
                  <div className="news-card-body">
                    <span className="news-date">
                      {new Date(item.published_at).toLocaleDateString('it-IT')}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.excerpt || item.content}</p>
                    <Link to="/news" className="news-link">
                      Leggi di più
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="news-empty">Nessuna news pubblicata al momento.</p>
            )}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="site-container">
          <div className="home-cta-box">
            <div className="home-cta-content">
              <span className="home-section-kicker">Hai bisogno di supporto?</span>
              <h2>Parliamo del tuo progetto</h2>
              <p>
                Dalla richiesta di informazioni ai preventivi, fino all’assistenza
                tecnica: contattaci per trovare la soluzione più adatta alla tua realtà produttiva.
              </p>
            </div>

            <div className="home-cta-actions">
              <Link to="/contatti" className="home-btn home-btn-primary">
                Richiedi informazioni
              </Link>
              <Link to="/login" className="home-btn home-btn-secondary">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}