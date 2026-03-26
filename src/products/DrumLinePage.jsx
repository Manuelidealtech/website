import { Link } from 'react-router-dom'
import '../products_styles/DrumLinePage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Serbatoio della fusione',
  'Controllo velocità pompa',
  'Accensione e spegnimento elettronico',
  'Controllo della temperatura (opzionale)',
  'Interfaccia HMI touch screen',
]

const galleryImages = [
  '/images/products/drum-line/gallery-1.jpg',
  '/images/products/drum-line/gallery-2.jpg',
  '/images/products/drum-line/gallery-3.jpg',
  '/images/products/drum-line/gallery-4.jpg',
  '/images/products/drum-line/gallery-5.jpg',
  '/images/products/drum-line/gallery-6.jpg',
  '/images/products/drum-line/gallery-8.jpg',
  '/images/products/drum-line/gallery-9.jpg',
  '/images/products/drum-line/gallery-10.jpg',
  '/images/products/drum-line/gallery-11.jpg',
  '/images/products/drum-line/gallery-12.jpg',
  '/images/products/drum-line/gallery-13.jpg',
  '/images/products/drum-line/gallery-14.jpg',
  '/images/products/drum-line/gallery-15.jpg',
  '/images/products/drum-line/gallery-16.jpg',
  '/images/products/drum-line/gallery-17.jpg',
]

export default function DrumLinePage() {
  return (
    <div className="drum-line-page">
      <section className="drum-line-hero">
        <div className="site-container">
          <div className="drum-line-hero__content">
            <div className="drum-line-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Drum Line</span>
            </div>

            <span className="drum-line-kicker">Drum Line</span>
            <h1>Piatti prementi</h1>
            <p>
              Progettati per la fusione e il dosaggio di svariati materiali
              termoplastici come hot melt EVA, pressure sensitive,
              poliammidi, poliuretano e mastici.
            </p>

            <div className="drum-line-hero__actions">
              <a href="#dettagli" className="drum-line-btn drum-line-btn--primary">
                Scopri i dettagli
              </a>
              <Link to="/contatti" className="drum-line-btn drum-line-btn--secondary">
                Contattaci
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="drum-line-main" id="dettagli">
        <div className="site-container drum-line-main__grid">
          <div className="drum-line-content">
            <div className="drum-line-section">
              <span className="drum-line-section__label">Descrizione</span>
              <p>
                I piatti prementi della serie Drum Line sono stati progettati per la
                fusione e il dosaggio di svariati materiali termoplastici come hot
                melt EVA, pressure sensitive, poliammidi, poliuretano e mastici.
                La capacità di fusione varia da 8 a 70 kg/h con 1 o 2 pompe.
              </p>
            </div>

            <div className="drum-line-section">
              <span className="drum-line-section__label">Caratteristiche</span>
              <p>
                La semplicità d’uso è sicuramente una delle caratteristiche vincenti
                di questo prodotto. Il sistema consente di gestire tutta la
                funzionalità della macchina, con possibilità di interfacciamento da
                remoto in caso di produzione tramite interfaccia Ethernet o Modbus.
              </p>
              <p>
                Il piatto di fusione può essere fisso per bassa fusione o salire per
                media e alta fusione, in relazione ai prodotti fondenti e ai ritmi di
                fusione richiesti dalla lavorazione.
              </p>

              <ul className="drum-line-features">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="drum-line-section">
              <span className="drum-line-section__label">Galleria prodotto</span>
              <ProductGallery images={galleryImages} title="Drum Line" />
            </div>
          </div>

          <aside className="drum-line-sidebar">
            <div className="drum-line-sidebar__card">
              <h3>Contattaci</h3>
              <a href="/contatti" className="drum-line-sidebar__link">
                Richiedi informazioni
              </a>
            </div>

            <div className="drum-line-sidebar__card">
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