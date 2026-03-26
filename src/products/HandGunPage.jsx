import { Link } from 'react-router-dom'
import '../products_styles/HandGunPage.css'
import ProductGallery from '../components/ProductGallery'

const galleryImages = ['/images/products/hand-gun/gallery-1.jpg']

export default function HandGunPage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Hand Guns</span>
            </div>

            <span className="product-detail-kicker">Hand Guns</span>
            <h1>Pistola per Colla Manuale</h1>
            <p>
              Le pistole manuali della linea Idealtech si distinguono grazie alla
              loro ergonomia, flessibilità e precisione di applicazione. Possono
              essere impiegate per l’applicazione di colle EVA, PUR, PS e sono
              possibili applicazioni a punto, a cordolo, a spirale o spray.
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
                Le pistole manuali della linea Idealtech si distinguono grazie alla
                loro ergonomia, flessibilità e precisione di applicazione. Possono
                essere impiegate per l’applicazione di colle EVA, PUR, PS e sono
                possibili applicazioni a punto, a cordolo, a spirale o spray, a
                seconda dell’ugello utilizzato, il quale può essere sostituito e
                adattato a seconda della propria esigenza applicativa.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                La flessibilità di applicazione che caratterizza le nostre pistole
                manuali è determinata dall’attacco pistola che, a seconda della
                necessità del cliente, può essere posizionato dal basso verso l’alto
                oppure dall’alto verso il basso.
              </p>
              <p>
                Maneggevoli, sicure e di facile utilizzo, garantiscono un efficiente
                controllo della temperatura operativa che può raggiungere i 200–210 °C.
              </p>
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