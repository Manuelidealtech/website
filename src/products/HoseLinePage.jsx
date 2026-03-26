import { Link } from 'react-router-dom'
import '../products_styles/HoseLinePage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Robusti e flessibili',
  'Di lunga durata',
  'Compatibili con le principali marche di incollatori',
  'Possibilità di montaggio su sistemi robotizzati',
  'Versioni speciali a richiesta',
]

const galleryImages = [
  '/images/products/hose-line/gallery-1.jpg',
  '/images/products/hose-line/gallery-2.jpg',
  '/images/products/hose-line/gallery-3.jpg',
  '/images/products/hose-line/gallery-4.jpg',
  '/images/products/hose-line/gallery-5.jpg',
  '/images/products/hose-line/gallery-6.jpg',
  '/images/products/hose-line/gallery-7.jpg',
]

export default function HoseLinePage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Hose Line</span>
            </div>

            <span className="product-detail-kicker">Hose Line</span>
            <h1>Tubi Elettroriscaldati</h1>
            <p>
              I tubi elettroriscaldati della serie Hose Line sono studiati e
              realizzati per essere utilizzati su tutti i principali impianti di
              applicazione per adesivi hot melt, nonché collegati ai principali
              incollatori della concorrenza.
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
                I tubi elettroriscaldati della serie Hose Line sono stati studiati
                e realizzati per poter essere utilizzati su tutti i principali
                impianti di applicazione per adesivi hot melt, nonché collegati su
                tutti i principali incollatori della concorrenza.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                Grazie all’utilizzo di materie prime di ottima qualità, i nostri
                tubi elettroriscaldati sono robusti e flessibili. Disponibili in
                vari modelli standard, per alta temperatura, per applicazioni
                spray, waterproof e speciali su richiesta, garantiscono precisione
                nell’applicazione, sicurezza ed affidabilità.
              </p>
              <p>
                L’alta flessibilità garantita dai materiali utilizzati consente una
                facile installazione a bordo macchina e permette l’utilizzo del
                prodotto su tutti i sistemi robotizzati e in tutti i campi dove è
                richiesto un grande movimento.
              </p>
              <p>Si presentano dunque con le seguenti caratteristiche:</p>

              <ul className="product-detail-features product-detail-features--compact">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
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