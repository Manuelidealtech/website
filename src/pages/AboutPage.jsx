import '../styles/AboutPage.css'

const galleryImages = [
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  './public/images/chi-siamo/gallery-1.jpg',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  './public/images/chi-siamo/gallery-2.jpg',
  './public/images/chi-siamo/gallery-8.jpg',
  './public/images/chi-siamo/gallery-6.jpg',
  './public/images/chi-siamo/gallery-7.jpg',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  './public/images/chi-siamo/gallery-3.jpg',
  './public/images/chi-siamo/gallery-9.jpg',
  './public/images/chi-siamo/gallery-10.jpg',
  './public/images/chi-siamo/gallery-11.jpg',
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
              Idealtech sviluppa soluzioni per l’incollaggio industriale con un
              approccio tecnico, moderno e orientato alle esigenze reali del cliente.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="site-container about-grid about-grid--text">
          <div className="about-card">
            <h2>Realtà consolidata da 20 anni</h2>
            <p>
              Idealtech si rappresenta come una realtà consolidata da anni sul mercato
              italiano ed estero, con una vasta esperienza nel settore delle soluzioni
              per l’incollaggio industriale, del gluing, della progettazione e
              dell’automazione.
            </p>
            <p>
              Oggi si presenta come un’azienda forte della propria esperienza matura e
              consolidata nel settore del gluing technology, con impianti e prodotti
              che includono fusori, sistemi di dosaggio, pistoni, linee automatiche e
              soluzioni complete di incollaggio.
            </p>
          </div>

          <div className="about-card">
            <h2>Al passo con l’evoluzione</h2>
            <p>
              L’azienda è nata con l’intento di rispondere con puntualità, efficienza
              e flessibilità all’evoluzione delle esigenze dei clienti, proponendo un
              ampio ventaglio di prodotti e un costante supporto tecnico.
            </p>
            <p>
              Solidità costruttiva, efficienza operativa e semplicità d’uso sono tra
              le caratteristiche fondamentali degli impianti Idealtech, progettati per
              garantire qualità e affidabilità nel tempo.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-section--alt">
        <div className="site-container about-grid about-grid--media">
          <div className="about-media">
            <img
              src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1400&auto=format&fit=crop"
              alt="Ufficio tecnico Idealtech"
            />
          </div>

          <div className="about-copy">
            <p>
              Grazie al proprio modo di operare, alla produzione diretta e alla sua
              flessibilità, Idealtech si offre al cliente la possibilità di definire
              la soluzione più adatta alle proprie necessità, supportando ogni fase
              del processo con competenza e know-how tecnico.
            </p>
            <p>
              L’azienda ha inoltre sviluppato un sistema di progettazione
              personalizzata relativamente a prodotti che spaziano dall’applicazione
              colla alla macchina speciale per imballaggio e incollaggio, con
              l’obiettivo di rispondere in modo preciso alle esigenze dei clienti.
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