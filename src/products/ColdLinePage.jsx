import { Link } from 'react-router-dom'
import '../products_styles/ColdLinePage.css'
import ProductGallery from '../components/ProductGallery'

const applicationSectors = [
  'Packaging',
  'Paper converting',
  'Case maker',
  'Grafica e stampa',
  'Industria del tabacco',
  'Industria del legno',
  'Assemblaggio',
]

const accessories = [
  'Tecnologia avanzata',
  'Uso semplice e intuitivo',
  'Versatilità per soddisfare tutte le richieste',
]

const galleryImages = [
  '/images/products/cold-line/gallery-1.png',
  '/images/products/cold-line/gallery-2.png',
  '/images/products/cold-line/gallery-3.png',
]

export default function ColdLinePage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Cold Line</span>
            </div>

            <span className="product-detail-kicker">Cold Line</span>
            <h1>Applicatori per colla a freddo</h1>
            <p>
              Applicatori per colle a freddo: serbatoi, pistole elettromagnetiche,
              pistole spray elettropneumatiche, pistole di estrusione
              elettropneumatiche, microprocessori di controllo, eccellenti
              prestazioni, estrema affidabilità, minore manutenzione, applicazioni
              di alta precisione e velocità.
            </p>

            <div className="product-detail-hero__actions">
              <a
                href="#dettagli"
                className="product-detail-btn product-detail-btn--primary"
              >
                Scopri i dettagli
              </a>

              <Link
                to="/contatti"
                className="product-detail-btn product-detail-btn--secondary"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="product-detail-main" id="dettagli">
        <div className="site-container product-detail-main__grid">
          <div className="product-detail-content">
            <div className="product-detail-section">
              <span className="product-detail-section__label">Descrizione</span>
              <p>
                Applicatori per colle a freddo: serbatoi, pistole
                elettromagnetiche, pistole spray elettropneumatiche, pistole di
                estrusione elettropneumatiche, microprocessori di controllo,
                eccellenti prestazioni, estrema affidabilità, minore manutenzione,
                applicazioni di alta precisione e velocità.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>

              <div className="product-detail-subgroup">
                <h3>Settori di applicazione:</h3>
                <ul className="product-detail-features product-detail-features--compact">
                  {applicationSectors.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="product-detail-subgroup">
                <h3>Accessori:</h3>
                <ul className="product-detail-features product-detail-features--compact">
                  {accessories.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">
                Galleria prodotto
              </span>

              <ProductGallery images={galleryImages} title="Nome Prodotto" />
            </div>
          </div>

          <aside className="product-detail-sidebar">
            <div className="product-detail-sidebar__card">
              <h3>Contattaci</h3>
              <Link to="/contatti" className="product-detail-sidebar__link">
                Richiedi informazioni
              </Link>
            </div>

            <div className="product-detail-sidebar__card">
              <h3>Prodotti</h3>

              <ul className="product-detail-sidebar__menu">
                <li>
                  <Link to="/prodotti/drum-line">Drum Line</Link>
                </li>
                <li>
                  <Link to="/prodotti/extruder-line">Extruder Line</Link>
                </li>
                <li>
                  <Link to="/prodotti/assy-line">Assy Line</Link>
                </li>
                <li>
                  <Link to="/prodotti/coating-heads">Coating Heads</Link>
                </li>
                <li>
                  <Link to="/prodotti/custom-machines">Custom Machines</Link>
                </li>
                <li>
                  <Link to="/prodotti/ideal-melt">Ideal Melt</Link>
                </li>
                <li>
                  <Link to="/prodotti/idm-gp">Fusori a vasca IDM-GP</Link>
                </li>
                <li>
                  <Link to="/prodotti/gun-line">Gun Line</Link>
                </li>
                <li>
                  <Link to="/prodotti/hose-line">Hose Line</Link>
                </li>
                <li>
                  <Link to="/prodotti/cold-line">Cold Line</Link>
                </li>
                <li>
                  <Link to="/prodotti/hand-gun">Hand Guns</Link>
                </li>
                <li>
                  <Link to="/prodotti/spare-parts">Spare Parts</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}