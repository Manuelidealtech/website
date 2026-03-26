import { Link } from 'react-router-dom'
import '../products_styles/CustomMachinesPage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Piccole e medie automazioni',
  'Celle Pick and Place, con applicazione di adesivi hot melt, stazioni di taglio e posizionamento automatizzate del supporto da accoppiare',
  'Piccole linee di punzonatura hot melt per la messa in composizione supporti multistrati di diversa grammatura in svariati settori dell’industria (tessile, tessuto, medicale, grafica)',
]

const galleryImages = [
  '/images/products/custom-machines/gallery-1.jpg',
  '/images/products/custom-machines/gallery-2.png',
  '/images/products/custom-machines/gallery-3.png',
  '/images/products/custom-machines/gallery-4.jpg',
  '/images/products/custom-machines/gallery-5.jpg',
  '/images/products/custom-machines/gallery-6.jpg',
  '/images/products/custom-machines/gallery-7.jpg',
  '/images/products/custom-machines/gallery-8.jpg',
  '/images/products/custom-machines/gallery-9.jpg',
  '/images/products/custom-machines/gallery-10.jpg',
  '/images/products/custom-machines/gallery-11.jpg',
  '/images/products/custom-machines/gallery-12.jpg',
  '/images/products/custom-machines/gallery-13.jpg',
  '/images/products/custom-machines/gallery-14.jpg',
  '/images/products/custom-machines/gallery-15.jpg',
  '/images/products/custom-machines/gallery-16.jpg',
  '/images/products/custom-machines/gallery-17.jpg',
  '/images/products/custom-machines/gallery-18.jpg',
  '/images/products/custom-machines/gallery-19.jpg',
  '/images/products/custom-machines/gallery-20.jpg',
]

export default function CustomMachinesPage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Custom Machines</span>
            </div>

            <span className="product-detail-kicker">Custom Machines</span>
            <h1>Macchine speciali su misura</h1>
            <p>
              Grazie al nostro servizio interno di progettazione, concepiamo e
              realizziamo progetti custom per rispondere anche a richieste di
              piccole e medie automazioni.
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
                Grazie al nostro servizio interno di progettazione, concepiamo e
                realizziamo progetti custom, sviluppati attorno alle reali esigenze
                produttive del cliente. Siamo in grado di rispondere anche a
                richieste per piccole e medie automazioni.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                Partendo dall’esigenza del cliente, sviluppiamo il progetto
                meccanico della linea o della macchina, in ogni dettaglio, anche a
                partire dal solo utilizzo, garantendo un servizio completo, chiavi
                in mano.
              </p>

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