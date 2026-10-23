import '../styles/ProductsPage.css'
import { useNavigate } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'
import { defaultProductCards } from '../lib/siteContentDefaults'

const sectors = ['Tessile e Non-woven', 'Legno e paper converting', 'Automobilistico', 'Produzione filtri aria', 'Igienico-sanitario', 'Produzione materassi', 'Edilizia', 'Grafica', 'Packaging']

export default function ProductsPage() {
  const navigate = useNavigate()
  const { get } = useSiteContent()
  const productCards = (get('products.catalog', defaultProductCards) || []).filter((product) => product.visible !== false)

  const handleProductClick = (product) => {
    if (product.slug) return navigate(product.slug)
    if (product.technicalSheet && product.technicalSheet !== '#') window.open(product.technicalSheet, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="products-page">
      <section className="products-hero">
        <div className="site-container">
          <div className="products-hero__content">
            <span className="section-kicker">{get('products.hero.kicker', 'Prodotti')}</span>
            <h1>{get('products.hero.title', 'Soluzioni e impianti per il gluing industriale')}</h1>
            <p>{get('products.hero.text', 'Una gamma completa di sistemi hot melt e macchine industriali per ottimizzare funzionalità, prestazioni, consumi energetici e continuità produttiva.')}</p>
          </div>
        </div>
      </section>

      <section className="products-intro">
        <div className="site-container products-intro__grid">
          <div className="products-intro__card">
            <h2>Applicatori Hot Melt</h2>
            <p>L’intera gamma di hot melt è stata ideata per ottimizzare funzionalità e prestazioni, ridurre la carbonizzazione dell’adesivo, minimizzare i consumi energetici e massimizzare la produzione.</p>
            <p>Importante è stata anche l’introduzione di sistemi software e hardware che consentono di tracciare lo scarico dei dati di consumo e di produzione, oltre a garantire un servizio di ricerca guasti in remoto.</p>
            <p>Tecnologia e innovazione sono in continuo sviluppo e oggi rappresentano uno dei nostri focus principali.</p>
          </div>
          <div className="products-intro__card">
            <h3>Your Partner for Glueing</h3>
            <p>Ovunque ci sia un’esigenza in materia di incollaggio, Idealtech è presente e attiva per ricercare e garantire la soluzione migliore e più adatta alle richieste tecniche ed economiche del cliente.</p>
            <div className="products-sectors">
              {sectors.map((sector) => <div key={sector} className="products-sector"><span className="products-sector__dot" /><span>{sector}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="products-catalog">
        <div className="site-container">
          <div className="products-grid">
            {productCards.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-card__image"><img src={product.image} alt={product.subtitle} /></div>
                <div className="product-card__body">
                  <span className="product-card__eyebrow">{product.title}</span>
                  <h3>{product.subtitle}</h3>
                  <p>{product.description}</p>
                  <button type="button" className="product-card__btn" onClick={() => handleProductClick(product)}>{product.cta || 'Scopri di più'}</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
