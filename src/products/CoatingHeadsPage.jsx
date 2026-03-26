import { Link } from 'react-router-dom'
import '../products_styles/CoatingHeadsPage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Con le teste a lama variabile si possono adesivizzare supporti aventi una larghezza fino a 2500 mm',
  'Il continuo formarsi e venire velocemente tarabile lamine permette un controllo preciso del dosaggio',
  'La manutenzione risulta ridotta anche grazie all’utilizzo di materiali e finiture superficiali adatte',
  'Possono essere utilizzati adesivi a base hot melt EVA, pressure sensitive e poliammidici',
]

const galleryImages = [
  '/images/products/coating-heads/gallery-1.jpg',
  '/images/products/coating-heads/gallery-2.jpg',
  '/images/products/coating-heads/gallery-3.jpg',
  '/images/products/coating-heads/gallery-4.jpg',
  '/images/products/coating-heads/gallery-5.jpg',
  '/images/products/coating-heads/gallery-6.jpg',
  '/images/products/coating-heads/gallery-7.jpg',
  '/images/products/coating-heads/gallery-8.jpg',
  '/images/products/coating-heads/gallery-9.jpg',
  '/images/products/coating-heads/gallery-10.jpg',
  '/images/products/coating-heads/gallery-11.jpg',
  '/images/products/coating-heads/gallery-12.jpg',
  '/images/products/coating-heads/gallery-13.jpg',
  '/images/products/coating-heads/gallery-14.jpg',
  '/images/products/coating-heads/gallery-15.jpg',
  '/images/products/coating-heads/gallery-16.jpg',
]

export default function CoatingHeadsPage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Coating Heads</span>
            </div>

            <span className="product-detail-kicker">Coating Heads</span>
            <h1>Teste di spalmatura</h1>
            <p>
              Le teste di spalmatura della serie ID-LFV vengono utilizzate
              soprattutto nell’industria tessile per adesivizzare o accoppiare
              tessuti, così come nell’industria del legno per il rivestimento dei
              pannelli e in tutte quelle applicazioni in cui è necessaria
              l’accoppiatura di più materiali.
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
                Le teste di spalmatura della serie ID-LFV vengono utilizzate
                soprattutto nell’industria tessile per adesivizzare o accoppiare
                tessuti, così come nell’industria del legno per il rivestimento dei
                pannelli e in tutte quelle applicazioni in cui è necessaria
                l’accoppiatura di più materiali.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>

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