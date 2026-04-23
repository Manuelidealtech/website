import '../styles/AboutPage.css'

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
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="site-container">
          <div className="about-hero__content">
            <span className="section-kicker">Chi siamo</span>
            <h1>Esperienza industriale, innovazione continua</h1>
            <p>
              Idealtech sviluppa soluzioni per l’incollaggio industriale con un approccio tecnico,
              moderno e orientato alle reali esigenze dei clienti.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="site-container about-grid about-grid--text">
          <div className="about-card">
            <h2>Una realtà solida, da 25 anni</h2>
            <p>
              Da oltre vent’anni, Idealtech opera con successo nel mercato italiano e internazionale,
              maturando una solida esperienza nelle tecnologie di incollaggio, nella progettazione e nell’automazione industriale.
            </p>
            <p>
              Oggi l’azienda si distingue per competenze consolidate nel settore della gluing technology,
              offrendo una gamma completa di soluzioni: fusori, sistemi di dosaggio, pistole, linee automatiche e impianti di incollaggio integrati.
            </p>
          </div>

          <div className="about-card">
            <h2>Sempre al passo con l’evoluzione</h2>
            <p>
              Fin dalla sua nascita, Idealtech si è posta l’obiettivo di rispondere con puntualità,
              efficienza e flessibilità alle esigenze in continua evoluzione del mercato.
            </p>
            <p>
              Propone un’ampia gamma di prodotti e garantisce un supporto tecnico costante,
              accompagnando il cliente in ogni fase del progetto.
            </p>
            <p>
              Solidità costruttiva, efficienza operativa e semplicità d’uso sono i principi alla base degli impianti Idealtech,
              progettati per assicurare prestazioni elevate e affidabilità nel tempo.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-section--alt">
        <div className="site-container about-grid about-grid--media">
          <div className="about-media">
            <img
              src="/images/chi-siamo/idealtech-chi-siamo-img1.png"
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