import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { getLocalizedField, getLocalizedNewsPreview } from '../i18n/contentTranslations'
import '../styles/HomePage.css'

const productAreas = [
  {
    title: 'Sistemi Hot-Melt',
    description:
      'Fusori, estrusori e sistemi professionali per la fusione e l’erogazione di adesivi hot-melt.',
    link: '/prodotti',
    icon: '/images/icons/icon-hotmelt.png',
  },
  {
    title: 'Applicatori e Pistole',
    description:
      'Applicatori automatici, pistole manuali e accessori per ogni esigenza produttiva.',
    link: '/prodotti',
    icon: '/images/icons/icon-pistole.png',
  },
  {
    title: 'Linee di Incollaggio',
    description:
      'Soluzioni integrate per linee produttive complete, personalizzate secondo il processo.',
    link: '/servizi',
    icon: '/images/icons/icon-sistemi.png',
  },
  {
    title: 'Ricambi e Componenti',
    description:
      'Ricambi compatibili, componenti tecnici e supporto per mantenere alte le performance.',
    link: '/prodotti',
    icon: '/images/icons/icon-ricambi.png',
  },
]

const sectors = [
  {
    title: 'Packaging e industria della carta',
    image: '/industria-carta-640.webp',
  },
  {
    title: 'Industria materassi e tappeti',
    image: '/industria-materassi-640.webp',
  },
  {
    title: 'Lavorazione del legno ed edilizia',
    image: '/industria-legno-640.webp',
  },
  {
    title: 'Industria tessile',
    image: '/industria-tessile-640.webp',
  },
  {
    title: 'Produzione di filtri',
    image: '/industria-filtri-640.webp',
  },
  {
    title: 'Industria automobilistica',
    image: '/industria-automobilistica-640.webp',
  },
]

const distributors = [
  {
    country: 'Ukraine',
    city: 'Kiev',
    name: 'Distributor UA',
    logo: '/belmix.jpg',
    top: '34%',
    left: '59.0%',
    popupClass: 'popup-left',
  },
  {
    country: 'Spain',
    city: 'Madrid',
    name: 'Distributor Spain',
    logo: '/meltwood.png',
    top: '40%',
    left: '49.3%',
    popupClass: 'popup-left',
  },
  {
    country: 'Portugal',
    city: 'Lisbon',
    name: 'Distributor Portugal',
    logo: '/macentro.jpg',
    top: '39.8%',
    left: '47.8%',
    popupClass: 'popup-right',
  },
  {
    country: 'Turchia',
    city: 'Istanbul',
    name: 'Idealtech Turkey',
    logo: '/logo-idealtech.png',
    top: '40.5%',
    left: '59.8%',
    popupClass: 'popup-right',
  },
  {
    country: 'Greece',
    city: 'Athene',
    name: 'Distributor Greece',
    logo: '/grecia.png',
    top: '40.5%',
    left: '55.8%',
    popupClass: 'popup-right',
  },
  {
    country: 'Italy',
    city: 'Milan',
    name: 'Idealtech Italy',
    logo: '/logo-idealtech.png',
    top: '37.5%',
    left: '52.9%',
    popupClass: 'popup-right',
  },
  {
    country: 'Mexico',
    city: 'Città del Messico',
    name: 'Distributor Mexico',
    logo: '/messico.png',
    top: '46.5%',
    left: '21.0%',
    popupClass: 'popup-bottom',
  },
  {
    country: 'USA',
    city: 'Washington',
    name: 'Distributor USA',
    logo: '/meltwood.png',
    top: '39.5%',
    left: '21.0%',
    popupClass: 'popup-bottom',
  },
  {
    country: 'China',
    city: 'Beijing',
    name: 'Distributor China',
    logo: '/labmates.png',
    top: '42.5%',
    left: '77.0%',
    popupClass: 'popup-right',
  },
  {
    country: 'Canada',
    city: 'Ottawa',
    name: 'Distributor Canada',
    logo: '/servicentre.jpg',
    top: '30.5%',
    left: '30.5%',
    popupClass: 'popup-top',
  },
]

const strengths = [
  {
    icon: '/images/icons/icon-progettazione.png',
    title: 'PROGETTAZIONE SU MISURA',
    description: 'Soluzioni progettate ad hoc in base alle esigenze del cliente.',
  },
  {
    icon: '/images/icons/icon-integrazione.png',
    title: 'INTEGRAZIONE IN LINEE PRODUTTIVE',
    description: 'Sistemi studiati per integrarsi perfettamente negli impianti esistenti.',
  },
  {
    icon: '/images/icons/icon-assistenza.png',
    title: 'ASSISTENZA TECNICA',
    description: 'Supporto tecnico specializzato per interventi rapidi e risolutivi.',
  },
  {
    icon: '/images/icons/icon-ricambi.png',
    title: 'RICAMBI COMPATIBILI',
    description: 'Ampia gamma di componenti di alta qualità accuratamente selezionati.',
  },
]

function truncateText(text = '', maxLength = 140) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function CountUpNumber({
  end,
  suffix = '',
  duration = 1800,
  startAnimation = false,
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!startAnimation) return

    let startTime = null
    let animationFrameId = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(easeOutCubic * end)

      setCount(currentValue)

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrameId = window.requestAnimationFrame(animate)

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId)
    }
  }, [end, duration, startAnimation])

  return (
    <strong>
      {count}
      {suffix}
    </strong>
  )
}

export default function HomePage() {
  const { language, locale } = useLanguage()
  const [newsItems, setNewsItems] = useState([])
  const [startNumbers, setStartNumbers] = useState(false)
  const numbersSectionRef = useRef(null)

  useEffect(() => {
    loadHomeNews()
  }, [])

  useEffect(() => {
    const section = numbersSectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartNumbers(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.35,
      }
    )

    observer.observe(section)

    return () => observer.disconnect()
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
      <section className="home-layout-hero">
        <picture className="home-layout-hero-media" aria-hidden="true">
          <source media="(max-width: 768px)" srcSet="/home-hero-768.webp" />
          <source media="(max-width: 1280px)" srcSet="/home-hero-1280.webp" />
          <img
            src="/home-hero-1890.webp"
            alt=""
            width="1890"
            height="850"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="home-layout-hero-overlay" />

        <div className="site-container home-layout-hero-inner">
          <div className="home-layout-hero-content">
            <span className="home-section-label">Gluing Technology</span>

            <h1>Soluzioni industriali per l’incollaggio professionale</h1>

            <p>
              Idealtech sviluppa, installa e supporta impianti e sistemi per
              l’applicazione di adesivi hot-melt e cold glue, offrendo
              competenza tecnica, affidabilità e soluzioni su misura per il
              settore industriale.
            </p>

            <div className="home-layout-hero-actions">
              <Link to="/contatti" className="home-primary-btn">
                Chiedi una consulenza
              </Link>

              <Link to="/prodotti" className="home-secondary-btn">
                Scopri i prodotti
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-product-areas">
        <div className="site-container">
          <div className="home-product-areas-grid">
            {productAreas.map((item) => (
              <article className="home-product-card" key={item.title}>
                <div className="home-product-card-icon">
                  <img src={item.icon} alt={getLocalizedField(item, 'title', language)} width="72" height="72" decoding="async" />
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <Link to={item.link}>Scopri di più</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-sectors">
        <div className="site-container">
          <div className="home-section-heading">
            <span className="home-section-label">Settori applicativi</span>
            <h2>Dove operano le nostre soluzioni</h2>
            <p>
              Tecnologie di incollaggio pensate per integrarsi in diversi
              contesti industriali e ottimizzare i processi produttivi.
            </p>
          </div>

          <div className="home-sectors-grid">
            {sectors.map((sector) => (
              <article className="home-sector-card" key={sector.title}>
                <div className="home-sector-image-wrap">
                  <img
                    src={sector.image}
                    alt={sector.title}
                    width="640"
                    height="427"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = '/img1.jpg'
                    }}
                  />
                </div>
                <h3>{sector.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-numbers" ref={numbersSectionRef}>
        <div className="site-container">
          <div className="home-numbers-grid">
            <div className="home-numbers-title">
              <span className="home-section-label">Esperienza</span>
              <h2>La nostra esperienza in numeri</h2>
            </div>

            <div className="home-number-card">
              <CountUpNumber
                end={25}
                suffix="+"
                startAnimation={startNumbers}
              />
              <span>Anni di esperienza</span>
            </div>

            <div className="home-number-card">
              <CountUpNumber
                end={1000}
                suffix="+"
                startAnimation={startNumbers}
              />
              <span>Impianti installati all’anno</span>
            </div>

            <div className="home-number-card">
              <CountUpNumber
                end={1000}
                suffix="+"
                startAnimation={startNumbers}
              />
              <span>Clienti nel mondo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-strengths">
        <div className="site-container">
          <div className="home-section-heading">
            <span className="home-section-label">Perché sceglierci</span>
            <h2>Competenze tecniche e supporto concreto</h2>
          </div>

          <div className="home-strengths-grid">
            {strengths.map((item, index) => (
              <div key={index} className="home-strength-card">
                <img src={item.icon} alt={getLocalizedField(item, 'title', language)} className="home-strength-icon" width="90" height="90" loading="lazy" decoding="async" />
                <span className="home-strength-title">{item.title}</span>
                <p className="home-strength-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-world">
        <div className="site-container">
          <div className="home-section-heading">
            <span className="home-section-label">La nostra rete nel mondo</span>
            <h2>Partner e presenza internazionale</h2>
            <p>
              Passa il mouse sui paesi evidenziati per visualizzare il distributore
              di riferimento.
            </p>
          </div>

          <div className="home-world-map-card">
            <div className="home-world-map-interactive">
              <img
                src="/world-map-1440.webp"
                alt="Mappa del mondo con paesi distributori evidenziati"
                className="home-world-map-image"
                width="1440"
                height="759"
                loading="lazy"
                decoding="async"
              />

              {distributors.map((item) => (
                <div
                  key={item.country}
                  className={`home-world-hotspot ${item.popupClass || ''}`}
                  style={{ top: item.top, left: item.left }}
                >
                  <button
                    type="button"
                    className="home-world-hotspot-button"
                    aria-label={`${item.country} - ${item.name}`}
                  />

                  <div className="home-world-distributor-card">
                    <div className="home-world-distributor-logo">
                      <img src={item.logo} alt={item.name} loading="lazy" decoding="async" />
                    </div>

                    <div className="home-world-distributor-info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.city}, {item.country}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-news">
        <div className="site-container">
          <div className="home-section-heading">
            <span className="home-section-label">News</span>
            <h2>Aggiornamenti, fiere e novità aziendali</h2>
          </div>

          <div className="home-news-grid">
            {newsItems.length > 0 ? (
              newsItems.map((item) => (
                <article className="home-news-card" key={item.id}>
                  <div className="home-news-image">
                    <img
                      src={item.image_url || '/home-hero-1280.webp'}
                      alt={getLocalizedField(item, 'title', language)}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="home-news-body">
                    <span className="home-news-date">
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString(locale)
                        : ''}
                    </span>

                    <h3>{getLocalizedField(item, 'title', language)}</h3>
                    <p>{getLocalizedNewsPreview(item, language, 135)}</p>

                    <Link to="/news" className="home-news-link">
                      Leggi di più
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <>
                <div className="home-news-card home-news-card-placeholder">
                  <div className="home-news-image" />
                  <div className="home-news-body">
                    <h3>Nessuna news pubblicata</h3>
                    <p>Le ultime novità compariranno qui appena disponibili.</p>
                  </div>
                </div>

                <div className="home-news-card home-news-card-placeholder">
                  <div className="home-news-image" />
                  <div className="home-news-body">
                    <h3>Eventi e fiere</h3>
                    <p>Questa sezione ospiterà i prossimi aggiornamenti aziendali.</p>
                  </div>
                </div>

                <div className="home-news-card home-news-card-placeholder">
                  <div className="home-news-image" />
                  <div className="home-news-body">
                    <h3>Novità prodotti</h3>
                    <p>Pubblica le news dal pannello amministrativo per mostrarle qui.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="home-bottom-cta">
        <div className="site-container">
          <div className="home-bottom-cta-box">
            <h2>Hai bisogno di una soluzione di incollaggio?</h2>
            <Link to="/contatti" className="home-primary-btn">
              Richiedi consulenza tecnica
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}