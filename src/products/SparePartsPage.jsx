import { Link } from 'react-router-dom'
import '../products_styles/SparePartsPage.css'
import ProductGallery from '../components/ProductGallery'

const galleryImages = [
  '/images/products/spare-parts/gallery-1.jpg',
  '/images/products/spare-parts/gallery-2.jpg',
  '/images/products/spare-parts/gallery-3.jpg',
  '/images/products/spare-parts/gallery-4.jpg',
  '/images/products/spare-parts/gallery-5.jpg',
  '/images/products/spare-parts/gallery-6.jpg',
  '/images/products/spare-parts/gallery-7.jpg',
  '/images/products/spare-parts/gallery-8.jpg',
]

export default function SparePartsPage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Spare Parts</span>
            </div>

            <span className="product-detail-kicker">Spare Parts</span>
            <h1>Ricambi per Hot Melt</h1>
            <p>
              Ricambi compatibili per applicatori hot melt: ugelli, filtri e moduli
              progettati per garantire precisione, affidabilità e continuità
              produttiva.
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
              <span className="product-detail-section__label">
                Ricambi compatibili per applicatori hot melt
              </span>

              <div className="product-detail-subgroup">
                <h3>Ugelli per Hot Melt</h3>
                <p>
                  Per la massima versatilità e precisione nell’applicazione, grande
                  importanza hanno gli accessori che devono garantire alta qualità ed
                  affidabilità. La quantità di adesivo erogata dalle pistole dipende
                  dalla pressione dell’adesivo e dal diametro del foro dell’ugello.
                </p>
                <p>
                  Per questa ragione Idealtech mette a disposizione del cliente una
                  vasta gamma di ugelli in grado di soddisfare ogni sua differente
                  esigenza produttiva. Sono disponibili ugelli standard, specifici per
                  applicazioni che necessitano di estrema precisione e ugelli speciali
                  realizzati a disegno.
                </p>
              </div>

              <div className="product-detail-subgroup">
                <h3>Filtri per Hot Melt</h3>
                <p>
                  Il filtro inserito nella pistola applicatrice garantisce
                  un’erogazione costante e precisa dell’adesivo nel tempo, in quanto
                  tutte le impurità vengono trattenute all’interno di esso. Sono
                  disponibili filtri in inox o bronzo sinterizzato, così come interni
                  o esterni alla pistola.
                </p>
                <p>
                  Il filtro pistola può essere inoltre integrato o esterno al corpo
                  pistola. Impedisce che ostruzioni raggiungano l’ugello di
                  erogazione. La pulizia o la sua sostituzione avviene tramite
                  semplici operazioni, senza dover disconnettere il tubo dalla
                  pistola.
                </p>
              </div>

              <div className="product-detail-subgroup">
                <h3>Moduli per Hot Melt</h3>
                <p>
                  Il modulo di spruzzo della serie ID 100 caratterizza l’applicazione
                  dell’adesivo garantendo l’assoluta mancanza di filamenti di
                  gocciolamento nella fase applicativa. Grazie alle dimensioni di
                  ingombro ridotte, è possibile inoltre un agevole collocazione, anche
                  su macchinari che presentano spazi molto limitati.
                </p>
                <p>
                  Su ogni modulo è possibile poi montare svariati tipi di ugelli,
                  attraverso i quali poter eseguire punti o tratti colla.
                </p>
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