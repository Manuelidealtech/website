import { Link } from 'react-router-dom'
import '../products_styles/IdealMeltPage.css'
import ProductGallery from '../components/ProductGallery'

const galleryImages = [
  '/images/products/ideal-melt/gallery-1.jpg',
  '/images/products/ideal-melt/gallery-2.jpg',
  '/images/products/ideal-melt/gallery-3.jpg',
  '/images/products/ideal-melt/gallery-4.jpg',
  '/images/products/ideal-melt/gallery-5.jpg',
  '/images/products/ideal-melt/gallery-6.jpg',
  '/images/products/ideal-melt/gallery-7.jpg',
]

export default function IdealMeltPage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Ideal Melt</span>
            </div>

            <span className="product-detail-kicker">Ideal Melt</span>
            <h1>Fusore per Hot Melt</h1>
            <p>
              Gli incollatori hot melt della serie Ideal Melt sono particolarmente
              indicati sulla produzione che richiede bassi consumi di colla,
              garantendo semplicità d’uso, affidabilità e costi applicativi contenuti.
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
                Gli incollatori hot melt della serie Ideal Melt sono particolarmente
                indicati sulla produzione che richiede bassi consumi di colla.
              </p>
              <p>
                Garantiscono un’elevata semplicità d’uso grazie alla loro
                programmazione. Il punto di forza del prodotto è sicuramente
                rappresentato dal rapporto qualità/prezzo, che assicura un ottimo
                livello costruttivo ed applicativo, ma a costi contenuti.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                Gli incollatori Ideal Melt sono inoltre disponibili in due diverse
                versioni caratterizzate da capacità differenti del serbatoio
                (5 e 12 kg). La loro modularità li rende adatti a soddisfare una
                vasta gamma di esigenze applicative, che spaziano nei diversi settori
                dell’industria, tra cui in particolar modo il settore packaging e
                della grafica.
              </p>
              <p>
                L’applicatore è stato progettato per permettere un montaggio ed una
                manutenzione semplice, così come una veloce accessibilità a tutti i
                componenti primari dell’incollatore. La tastiera di comando del
                sistema può essere inoltre remotata vicino all’operatore per
                consentire il comando di tutte le principali funzioni.
              </p>
              <p>
                È possibile inoltre interfacciare l’incollatore con la linea
                principale tramite comunicazione Modbus/RS485.
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