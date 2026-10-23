import '../styles/AboutPage.css'
import { useSiteContent } from '../context/SiteContentContext'

const galleryImages = [
  '/images/chi-siamo/gallery-1.png',
  '/images/chi-siamo/gallery-2.png',
  '/images/chi-siamo/gallery-3.png',
  '/images/chi-siamo/gallery-4.png',
  '/images/chi-siamo/gallery-5.png',
  '/images/chi-siamo/gallery-6.png',
  '/images/chi-siamo/gallery-7.png',
  '/images/chi-siamo/gallery-8.png',
  '/images/chi-siamo/gallery-9.png',
  '/images/chi-siamo/gallery-10.png',
  '/images/chi-siamo/gallery-11.png',
]

export default function AboutPage() {
  const { get } = useSiteContent()
  const card1Paragraphs = String(get('about.card1.text', '')).split(/\n\n+/).filter(Boolean)
  const card2Paragraphs = String(get('about.card2.text', '')).split(/\n\n+/).filter(Boolean)

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="site-container">
          <div className="about-hero__content">
            <span className="section-kicker">{get('about.hero.kicker', 'Chi siamo')}</span>
            <h1>{get('about.hero.title', 'Esperienza industriale, innovazione continua')}</h1>
            <p>{get('about.hero.text', 'Idealtech sviluppa soluzioni per l’incollaggio industriale con un approccio tecnico, moderno e orientato alle reali esigenze dei clienti.')}</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="site-container about-grid about-grid--text">
          <div className="about-card">
            <h2>{get('about.card1.title', 'Una realtà solida, da 25 anni')}</h2>
            {card1Paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>

          <div className="about-card">
            <h2>{get('about.card2.title', 'Sempre al passo con l’evoluzione')}</h2>
            {card2Paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>
      </section>

      <section className="about-section about-section--alt">
        <div className="site-container about-grid about-grid--media">
          <div className="about-media">
            <img
              src={get('about.mainImage', '/images/chi-siamo/idealtech-chi-siamo-img1.png')}
              alt="Ufficio tecnico Idealtech"
            />
          </div>

          <div className="about-copy">
            <p>
              Grazie alla produzione interna e a un’organizzazione flessibile, l’azienda è in grado di sviluppare soluzioni su misura,
              studiando insieme al cliente la risposta più adatta a ogni esigenza applicativa.
            </p>
            <p>
              Idealtech realizza inoltre progetti personalizzati che spaziano dai sistemi di applicazione colla fino a macchine speciali per imballaggio e incollaggio,
              con l’obiettivo di offrire soluzioni precise, efficaci e perfettamente integrate nei processi produttivi.
            </p>
          </div>
        </div>
      </section>

      <section className="about-owner-section">
        <div className="site-container">
          <div className="about-owner-card">
            <div className="about-owner-media">
              <div className="about-owner-image-wrap">
                <img
                  src={get('about.ownerImage', '/images/chi-siamo/titolare.png')}
                  alt="Titolare Idealtech"
                />
              </div>
            </div>

            <div className="about-owner-content">
              <span className="section-kicker">La guida dell’azienda</span>
              <h2>{get('about.ownerTitle', 'Visione, esperienza e attenzione al cliente')}</h2>
              <p className="about-owner-name">{get('about.ownerName', 'Enrico Bozza — Titolare Idealtech')}</p>

              <p>
                Alla guida di Idealtech c’è una visione imprenditoriale fondata su competenza tecnica,
                affidabilità e capacità di interpretare concretamente le esigenze del mercato industriale.
              </p>

              <p>
                L’azienda è cresciuta nel tempo mantenendo un approccio diretto, serio e orientato alla qualità,
                costruendo relazioni solide con i clienti e sviluppando soluzioni capaci di unire innovazione,
                efficienza produttiva e supporto costante.
              </p>

              <p>
                Ogni progetto nasce dall’ascolto, dall’esperienza sul campo e dalla volontà di offrire
                risposte realmente utili, personalizzate e durature.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-gallery-section">
        <div className="site-container">
          <div className="about-gallery-head">
            <span className="section-kicker">Gallery story</span>
            <h2>Uno sguardo al mondo Idealtech</h2>
          </div>

          <div className="about-gallery-grid">
            {galleryImages.map((image, index) => (
              <div className="about-gallery-item" key={`${image}-${index}`}>
                <img src={image} alt={`Gallery Idealtech ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}