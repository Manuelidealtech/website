import '../styles/SpecialMachinesPage.css'

const features = [
  'Misure per incollaggio ad alta velocità, sia per adesivi a caldo H.M.P.A. che per adesivi a freddo.',
  'Cut off, coil, con applicazione di adesivo hot melt, stazione di taglio e posizionamento automatico del supporto di accoppiamento.',
  'Piccole linee di spalmatura hot melt per laminare o accoppiare supporti e materiali di diverso genere in svariati settori industriali.',
]

const sideProducts = [
  'Estrusori',
  'Piatti prementi',
  'Assy Line',
  'Ideal Melt',
  'Spare Parts',
  'Application Test Units',
  'Hot Melt Hose',
  'Hot Melt Application Head',
  'Applicatori per colla a freddo',
  'Track & Edge guides',
  'Pistole per colla manuali',
  'Fusori a vasca IDM-GP',
]

const galleryImages = [
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
]

export default function SpecialMachinesPage() {
  return (
    <div className="special-page">
      <section className="special-hero">
        <div className="site-container">
          <div className="special-hero__content">
            <span className="section-kicker">Special Machines</span>
            <h1>Progettazione e sviluppo di automazioni speciali</h1>
            <p>
              Soluzioni su misura per piccoli e medi impianti, automazioni dedicate
              e sistemi speciali per applicazioni industriali complesse.
            </p>
          </div>
        </div>
      </section>

      <section className="special-content">
        <div className="site-container special-layout">
          <div className="special-main">
            <article className="special-card">
              <h2>Descrizione</h2>
              <p>
                Grazie al nostro servizio interno di progettazione, consulenza e
                sviluppo progetti, siamo in grado di rispondere anche a richieste per
                piccole e medie automazioni.
              </p>
            </article>

            <article className="special-card">
              <h2>Caratteristiche</h2>
              <p>
                Partendo dall’esigenza del cliente, sviluppiamo il progetto meccanico
                della linea e ne curiamo, in ogni dettaglio, anche la parte elettrica
                e software, garantendo un servizio completo, chiavi in mano.
              </p>

              <div className="special-features">
                {features.map((feature) => (
                  <div key={feature} className="special-feature">
                    <span className="special-feature__dot" />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="special-sidebar">
            <div className="special-sidebox">
              <h3>Contattaci</h3>
              <a href="#contatti" className="special-sidebox__cta">
                Cerca la soluzione tecnica
              </a>
            </div>

            <div className="special-sidebox special-sidebox--dark">
              <h3>Prodotti</h3>
              <div className="special-product-links">
                {sideProducts.map((item) => (
                  <a href="#prodotti" key={item} className="special-product-link">
                    <span className="special-product-link__dot" />
                    <span>{item}</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="special-gallery">
        <div className="site-container">
          <div className="special-gallery__featured">
            {galleryImages.slice(0, 4).map((image, index) => (
              <div className="special-gallery__featured-item" key={`featured-${index}`}>
                <img src={image} alt={`Special machine ${index + 1}`} />
              </div>
            ))}
          </div>

          <div className="special-gallery__grid">
            {galleryImages.slice(4).map((image, index) => (
              <div className="special-gallery__item" key={`grid-${index}`}>
                <img src={image} alt={`Gallery special machines ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}