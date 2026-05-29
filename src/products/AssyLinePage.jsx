import { Link } from 'react-router-dom'
import '../products_styles/AssyLinePage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Pannello operator',
  'Pompa',
  'Vasca di fusione rivestita in TEFLON',
]

const galleryImages = [
  '/images/products/assy-line/gallery-1.png',
  '/images/products/assy-line/gallery-2.png',
  '/images/products/assy-line/gallery-3.png',
  '/images/products/assy-line/gallery-4.png',
  '/images/products/assy-line/gallery-5.jpg',
  '/images/products/assy-line/gallery-6.png',
  '/images/products/assy-line/gallery-7.jpg',
  '/images/products/assy-line/gallery-8.jpg',
  '/images/products/assy-line/gallery-9.jpg',
]

export default function AssyLinePage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Assy Line</span>
            </div>

            <span className="product-detail-kicker">Assy Line</span>
            <h1>Fusori per Adesivi Hot Melt</h1>
            <p>
              Gli applicatori per adesivi termofusibili hot melt della serie Assy Line
              sono concepiti per utilizzi industriali continui, con prestazioni
              affidabili e gestione intuitiva dell’impianto.
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
                Gli applicatori per adesivi termofusibili hot melt della serie Assy
                Line sono concepiti da utilizzare, di struttura modulare, progettati
                per consentire i cicli produttivi continui e costi d’esercizio
                contenuti. Robusti e flessibili, permettono di adattarsi ad applicazioni
                industriali differenti, mantenendo semplicità d’uso, affidabilità e
                precisione nel dosaggio.
              </p>
              <p>
                Grazie alle loro caratteristiche si prestano pertanto ad essere
                installati in qualsiasi linea produttiva.
              </p>

              <ul className="product-detail-features product-detail-features--compact">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                Gli applicatori Assy Line possono essere forniti con una o due pompe ad
                ingranaggi, in quasi abbinata all’unità di comando con il controllo
                digitale della velocità di un’applicazione costante, senza portata di
                portata durante l’erogazione dell’adesivo, così da assicurare un
                dosaggio preciso anche durante le variazioni della velocità produttiva.
              </p>
              <p>
                Il controllo della temperatura viene effettuato tramite microprocessore
                dedicato o da specifiche schede personalizzate. Ogni zona viene
                controllata indipendentemente con la precisione di 1 grado. La
                sicurezza contro le sovratemperature è garantita da un termostato di
                blocco.
              </p>
              <p>
                La tastiera di comando del sistema può essere inoltre remotata vicino
                all’operatore per consentire il comando di tutte le principali funzioni.
                È possibile inoltre interfacciare l’installazione con la linea
                principale tramite comunicazione Modbus / RS485.
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