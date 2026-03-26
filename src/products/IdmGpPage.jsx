import { Link } from 'react-router-dom'
import '../products_styles/IdmGpPage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Filtro a grande portata per trattenere le eventuali impurità presenti nell’adesivo, evitando la contaminazione degli accessori (tubi elettroriscaldati e pistole di spruzzo). La cartuccia filtro 100 mesh è di facile e rapida sostituzione durante le operazioni di manutenzione.',
  'Valvola di controllo pressione, al fine di assicurare una tenuta costante della pressione durante l’erogazione dell’adesivo, con ricircolo in vasca dell’hot melt in eccesso.',
]

const galleryImages = [
  '/images/products/idm-gp/gallery-1.jpg',
  '/images/products/idm-gp/gallery-2.jpg',
  '/images/products/idm-gp/gallery-3.jpg',
]

export default function IdmGpPage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Fusori a vasca IDM-GP</span>
            </div>

            <span className="product-detail-kicker">Fusori</span>
            <h1>Fusori a vasca IDM-GP</h1>
            <p>
              Sistemi hot melt disponibili in più capacità, progettati per garantire
              dosatura precisa dell’adesivo, semplicità di utilizzo e costi contenuti.
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
                I fusori a vasca della serie IDM-GP, disponibili in versione 6, 9 e
                12 litri, sono stati concepiti per garantire un rapporto
                qualità/prezzo ottimale.
              </p>
              <p>
                La serie IDM-GP assicura un’efficiente e precisa dosatura
                dell’adesivo, grazie all’installazione di pompe ad ingranaggi di
                diversa portata, in relazione alle esigenze produttive del cliente
                (pompe disponibili da 0.8 a 10 cc/giro).
              </p>
              <p>
                Allo stesso tempo, l’investimento economico è contenuto, grazie ad un
                design ottimizzato, che conferisce al prodotto semplicità e
                funzionalità.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                Sul retro dei sistemi IDM-GP, è montato il gruppo distributore dotato
                dei seguenti elementi:
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