import '../styles/ProductsPage.css'
import { useNavigate } from 'react-router-dom'

const productCards = [
  {
    id: 'drum-line',
    title: 'Drum Line',
    subtitle: 'Piatti prementi',
    description:
      'Progettati per la fusione e il dosaggio di svariati materiali termoplastici come hot melt EVA, pressure sensitive, poliammidi, poliuretano e mastici.',
    image: '/images/products/drum-line.jpg',
    cta: 'Scopri di più',
    slug: '/prodotti/drum-line',
  },

{
  id: 'extruder-line',
  title: 'Extruder Line',
  subtitle: 'Estrusori',
  description:
    'L’uso di un estrusore è indicato soprattutto nelle applicazioni che richiedono un’elevata capacità di fusione.',
  image: '/images/products/extruder-line.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/extruder-line',
},
{
  id: 'assy-line',
  title: 'Assy Line',
  subtitle: 'Fusori per Adesivi Hot Melt',
  description:
    'Applicatori hot melt modulari, robusti e flessibili, progettati per linee produttive industriali continue.',
  image: '/images/products/assy-line.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/assy-line',
},
{
  id: 'coating-heads',
  title: 'Coating Heads',
  subtitle: 'Teste di spalmatura',
  description:
    'Teste di spalmatura per adesivizzare o accoppiare tessuti, pannelli e altri materiali in applicazioni industriali.',
  image: '/images/products/coating-heads.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/coating-heads',
},
{
  id: 'custom-machines',
  title: 'Custom Machines',
  subtitle: 'Macchine speciali su misura',
  description:
    'Progetti custom per piccole e medie automazioni, sviluppati attorno alle esigenze produttive del cliente.',
  image: '/images/products/custom-machines.png',
  cta: 'Scopri di più',
  slug: '/prodotti/custom-machines',
},
{
  id: 'ideal-melt',
  title: 'Ideal Melt',
  subtitle: 'Fusore per Hot Melt',
  description:
    'Incollatori hot melt particolarmente indicati per produzioni con bassi consumi di colla.',
  image: '/images/products/ideal-melt.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/ideal-melt',
},
{
  id: 'idm-gp',
  title: 'Fusori',
  subtitle: 'Fusori a vasca IDM-GP',
  description:
    'Fusori a vasca disponibili in versione 6, 9 e 12 litri, progettati per garantire dosatura precisa e costi contenuti.',
  image: '/images/products/idm-gp.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/idm-gp',
},
{
  id: 'gun-line',
  title: 'Gun Line',
  subtitle: 'Applicatori Hot Melt',
  description:
    'Pistole automatiche modulari per applicare adesivo in cordoli, punti o strisce di varia larghezza.',
  image: '/images/products/gun-line.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/gun-line',
},
{
  id: 'hose-line',
  title: 'Hose Line',
  subtitle: 'Tubi Elettroriscaldati',
  description:
    'Tubi elettroriscaldati robusti e flessibili, compatibili con i principali impianti di applicazione hot melt.',
  image: '/images/products/hose-line.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/hose-line',
},
{
  id: 'cold-line',
  title: 'Cold Line',
  subtitle: 'Applicatori per colla a freddo',
  description:
    'Applicatori per colle a freddo con elevate prestazioni, alta precisione, affidabilità e manutenzione ridotta.',
  image: '/images/products/cold-line.png',
  cta: 'Scopri di più',
  slug: '/prodotti/cold-line',
},
{
  id: 'hand-gun',
  title: 'Hand Guns',
  subtitle: 'Pistola per Colla Manuale',
  description:
    'Pistole manuali ergonomiche e flessibili per applicazioni a punto, cordolo, spirale o spray.',
  image: '/images/products/hand-gun.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/hand-gun',
},
{
  id: 'spare-parts',
  title: 'Spare Parts',
  subtitle: 'Ricambi per Hot Melt',
  description:
    'Ugelli, filtri e moduli compatibili per applicatori hot melt, studiati per garantire precisione e affidabilità.',
  image: '/images/products/spare-parts.jpg',
  cta: 'Scopri di più',
  slug: '/prodotti/spare-parts',
},

]

const sectors = [
  'Tessile e Non-woven',
  'Legno e paper converting',
  'Automobilistico',
  'Produzione filtri aria',
  'Igienico-sanitario',
  'Produzione materassi',
  'Edilizia',
  'Grafica',
  'Packaging',
]

export default function ProductsPage() {
  const navigate = useNavigate()

  const handleProductClick = (product) => {
    if (product.slug) {
      navigate(product.slug)
      return
    }

    if (product.technicalSheet && product.technicalSheet !== '#') {
      window.open(product.technicalSheet, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="products-page">
      <section className="products-hero">
        <div className="site-container">
          <div className="products-hero__content">
            <span className="section-kicker">Prodotti</span>
            <h1>Soluzioni e impianti per il gluing industriale</h1>
            <p>
              Una gamma completa di sistemi hot melt e macchine industriali per
              ottimizzare funzionalità, prestazioni, consumi energetici e continuità
              produttiva.
            </p>
          </div>
        </div>
      </section>

      <section className="products-intro">
        <div className="site-container products-intro__grid">
          <div className="products-intro__card">
            <h2>Applicatori Hot Melt</h2>
            <p>
              L’intera gamma di hot melt è stata ideata per ottimizzare funzionalità
              e prestazioni, ridurre la carbonizzazione dell’adesivo, minimizzare i
              consumi energetici e massimizzare la produzione.
            </p>
            <p>
              Importante è stata anche l’introduzione di sistemi software e hardware
              che consentono di tracciare lo scarico dei dati di consumo e di
              produzione, oltre a garantire un servizio di ricerca guasti in remoto.
            </p>
            <p>
              Tecnologia e innovazione sono in continuo sviluppo e oggi rappresentano
              uno dei nostri focus principali.
            </p>
          </div>

          <div className="products-intro__card">
            <h3>Your Partner for Glueing</h3>
            <p>
              Ovunque ci sia un’esigenza in materia di incollaggio, Idealtech è
              presente e attiva per ricercare e garantire la soluzione migliore e più
              adatta alle richieste tecniche ed economiche del cliente.
            </p>

            <div className="products-sectors">
              {sectors.map((sector) => (
                <div key={sector} className="products-sector">
                  <span className="products-sector__dot" />
                  <span>{sector}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="products-catalog">
        <div className="site-container">
          <div className="products-grid">
            {productCards.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card__image">
                  <img src={product.image} alt={product.subtitle} />
                </div>

                <div className="product-card__body">
                  <span className="product-card__eyebrow">{product.title}</span>
                  <h3>{product.subtitle}</h3>
                  <p>{product.description}</p>

                  <button
                    type="button"
                    className="product-card__btn"
                    onClick={() => handleProductClick(product)}
                  >
                    {product.cta}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}