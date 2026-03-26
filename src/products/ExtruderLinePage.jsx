import { Link } from 'react-router-dom'
import '../products_styles/ExtruderLinePage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Controllo della temperatura mediante PLC e moduli di stabilizzazione',
  'Impostazione semplice e intuitiva dei comandi a mezzo di un pannello touch screen da 6.4"',
  'Lunghezza delle viti e cilindro su misura tramite PLC Siemens',
  'Tempo di dosatura con controllo automatico della grammatura',
  'Temperatura di fusione che partendo da 160°C può arrivare a 300°C',
  'La viscosità dei prodotti trattati può variare da 6.000 a 600.000 mPas',
]

const galleryImages = [
  '/images/products/extruder-line/gallery-1.jpg',
  '/images/products/extruder-line/gallery-2.jpg',
  '/images/products/extruder-line/gallery-3.jpg',
  '/images/products/extruder-line/gallery-4.jpg',
  '/images/products/extruder-line/gallery-5.jpg',
  '/images/products/extruder-line/gallery-6.jpg',
  '/images/products/extruder-line/gallery-7.jpg',
  '/images/products/extruder-line/gallery-8.jpg',
  '/images/products/extruder-line/gallery-9.jpg',
  '/images/products/extruder-line/gallery-10.jpg',
  '/images/products/extruder-line/gallery-11.jpg',
  '/images/products/extruder-line/gallery-12.jpg',
  '/images/products/extruder-line/gallery-13.jpg',
  '/images/products/extruder-line/gallery-14.jpg',
]

export default function ExtruderLinePage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Extruder Line</span>
            </div>

            <span className="product-detail-kicker">Extruder Line</span>
            <h1>Estrusori</h1>
            <p>
              L’uso di un estrusore è indicato soprattutto nelle applicazioni che
              richiedono un’elevata capacità di fusione di materiali come EVA e
              materiali adesivi caricati, quali poliammidi e poliestere.
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
                L’uso di un estrusore è indicato soprattutto in applicazioni che
                richiedono un’elevata capacità di fusione o il trattamento di adesivi
                particolari, quali poliammidi e poliestere.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                A tal fine, siamo in grado di fornire una gamma completa di estrusori
                a vite hot melt con capacità di fusione variabile, secondo la
                necessità: da 60 a 600 kg/h per EVA, poliammidici, poliestere in
                granuli e poliammidi. Adesivi che risultano essere difficilmente
                gestibili da altri applicatori tradizionali per via della loro
                viscosità o della elevata temperatura di fusione necessaria.
              </p>
              <p>
                I punti di forza del prodotto, estrusore Extruder Line, possono
                essere così riassunti:
              </p>

              <ul className="product-detail-features">
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