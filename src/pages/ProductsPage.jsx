import '../styles/ProductsPage.css'

const productCards = [
  {
    title: 'Drum Line',
    subtitle: 'Piatti prementi',
    description:
      'Progettati per la fusione e il dosaggio di svariati materiali termoplastici.',
    image:
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    cta: 'Guarda i modelli di Piatto Premente',
  },
  {
    title: 'Extrude Line',
    subtitle: 'Estrusori',
    description:
      'Per le applicazioni che richiedono un’elevata capacità di fusione.',
    image:
      'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
    cta: 'Guarda i modelli di estrusori',
  },
  {
    title: 'Assy Line',
    subtitle: 'Fusori a vasca per Hot Melt',
    description:
      'Progettati per ottimizzare processi produttivi continui e precisi.',
    image:
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
    cta: 'Guarda i modelli di fusori',
  },
  {
    title: 'Coating Heads',
    subtitle: 'Teste di spalmatura',
    description:
      'Sistemi per applicazioni uniformi, affidabili e ad alta precisione.',
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
    cta: 'Scopri le coating heads',
  },
  {
    title: 'Automazioni',
    subtitle: 'Special machines',
    description:
      'Soluzioni dedicate e personalizzate per linee produttive industriali.',
    image:
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
    cta: 'Scopri le automazioni',
  },
  {
    title: 'Ideal Melt 5-12',
    subtitle: 'Fusori Plug & Work',
    description:
      'Macchine compatte e pronte all’uso per performance affidabili e immediate.',
    image:
      'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
    cta: 'Scopri i fusori Plug & Work',
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
              <article className="product-card" key={product.title}>
                <div className="product-card__image">
                  <img src={product.image} alt={product.subtitle} />
                </div>

                <div className="product-card__body">
                  <span className="product-card__eyebrow">{product.title}</span>
                  <h3>{product.subtitle}</h3>
                  <p>{product.description}</p>

                  <button type="button" className="product-card__btn">
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