import { Link } from 'react-router-dom'
import '../products_styles/GunLinePage.css'
import ProductGallery from '../components/ProductGallery'

const features = [
  'Struttura modulare',
  'Contatto temperatura + / - 1 grado C',
  'Manutenzione semplice e veloce',
]

const galleryImages = [
  '/images/products/gun-line/gallery-1.jpg',
  '/images/products/gun-line/gallery-2.jpg',
  '/images/products/gun-line/gallery-3.jpg',
  '/images/products/gun-line/gallery-4.jpg',
  '/images/products/gun-line/gallery-5.jpg',
  '/images/products/gun-line/gallery-6.jpg',
  '/images/products/gun-line/gallery-7.jpg',
  '/images/products/gun-line/gallery-8.jpg',
  '/images/products/gun-line/gallery-9.jpg',
  '/images/products/gun-line/gallery-10.jpg',
  '/images/products/gun-line/gallery-11.jpg',
  '/images/products/gun-line/gallery-12.jpg',
  '/images/products/gun-line/gallery-13.jpg',
  '/images/products/gun-line/gallery-14.jpg',
  '/images/products/gun-line/gallery-15.jpg',
  '/images/products/gun-line/gallery-16.jpg',
  '/images/products/gun-line/gallery-17.jpg',
  '/images/products/gun-line/gallery-18.jpg',
]

export default function GunLinePage() {
  return (
    <div className="product-detail-page">
      <section className="product-detail-hero">
        <div className="site-container">
          <div className="product-detail-hero__content">
            <div className="product-detail-breadcrumbs">
              <Link to="/prodotti">Prodotti</Link>
              <span>/</span>
              <span>Applicatori Hot Melt</span>
            </div>

            <span className="product-detail-kicker">Gun Line</span>
            <h1>Applicatori Hot Melt</h1>
            <p>
              La pistola automatica è indicata soprattutto per poter applicare
              l’adesivo in cordoli, punti o strisce di varia larghezza. Sono
              modulari e possono essere montate in diverse configurazioni, con uno
              o più moduli, con filtro a grande portata o senza filtro, con una o
              più elettrovalvole per la gestione del tratto colla.
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
                La pistola automatica è indicata soprattutto per poter applicare
                l’adesivo in cordoli, punti o strisce di varia larghezza. Sono
                modulari e possono essere montate in diverse configurazioni, con
                uno o più moduli, con filtro a grande portata o senza filtro, con
                una o più elettrovalvole per la gestione del tratto colla.
              </p>
            </div>

            <div className="product-detail-section">
              <span className="product-detail-section__label">Caratteristiche</span>
              <p>
                La pistola della serie Gun Line garantisce una grande affidabilità
                nel tempo grazie alla loro semplicità, risultando al tempo stesso
                dinamiche e facilmente adattabili alle diverse macchine
                automatiche hot melt.
              </p>
              <p>
                Sono composte da un blocco riscaldante e da un numero variabile di
                moduli di spruzzo.
              </p>

              <ul className="product-detail-features product-detail-features--compact">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <p className="product-detail-note">
                È possibile montare sonde e accessori elettrici di collegamento
                compatibili con tutti gli impianti delle principali case
                produttrici.
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