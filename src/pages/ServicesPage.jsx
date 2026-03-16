import '../styles/ServicesPage.css'

const services = [
  'Vendita ed installazione',
  'Automazioni - Special Machines',
  'Consulenza tecnica e progettazione',
  'Assistenza tecnica e manutenzione',
  'Assistenza software',
  'Ricambi compatibili',
]

const galleryImages = [
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?q=80&w=1200&auto=format&fit=crop',
]

export default function ServicesPage() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <div className="site-container">
          <div className="services-hero__content">
            <span className="section-kicker">Servizi</span>
            <h1>I nostri servizi a vostra disposizione</h1>
            <p>
              Supporto tecnico, progettazione, consulenza e assistenza operativa per
              accompagnare ogni cliente prima, durante e dopo l’installazione.
            </p>
          </div>
        </div>
      </section>

      <section className="services-list-section">
        <div className="site-container">
          <div className="services-list-card">
            <h2>I nostri servizi a vostra disposizione</h2>

            <div className="services-list-grid">
              {services.map((service) => (
                <div key={service} className="services-list-item">
                  <span className="services-list-item__dot" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="services-copy-section">
        <div className="site-container">
          <div className="services-copy-card">
            <h2>Assistenza Tecnica ed Operativa</h2>

            <p>
              Per garantire continuità nel rapporto e massima fiducia, Idealtech è
              presente anche nel post-vendita con un team di tecnici altamente
              qualificati, pronti ad intervenire in caso di necessità del cliente,
              fermi macchina, guasti improvvisi, ricambistica urgente o semplicemente
              per interventi programmati di manutenzione ordinaria.
            </p>

            <p>
              Idealtech si offre inoltre una consulenza specializzata in materia di
              incollaggio, delineando le diverse esigenze e aspettative del cliente ed
              elaborando la soluzione migliore sia in termini tecnici che economici.
            </p>

            <p>
              Il servizio tecnico di Idealtech offre la possibilità di stipulare
              contratti di manutenzione programmata, importanti per mantenere integre
              nel tempo le caratteristiche di efficienza e operatività degli impianti.
              La competenza tecnica e la capacità di operare su tutti i sistemi di
              incollaggio rappresentano un valore concreto per il cliente.
            </p>

            <p>
              A completamento, è attivo anche il servizio di progettazione tecnica,
              capace di realizzare progetti su misura sia per sistemi di incollaggio
              standard sia per linee automatiche o macchine speciali, mostrando già in
              fase di offerta il risultato finale atteso.
            </p>
          </div>
        </div>
      </section>

      <section className="services-gallery-section">
        <div className="site-container">
          <div className="services-gallery-grid">
            {galleryImages.map((image, index) => (
              <div className="services-gallery-item" key={`${image}-${index}`}>
                <img src={image} alt={`Servizio Idealtech ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-contact-section">
        <div className="site-container">
          <div className="services-contact-box">
            <div className="services-contact-copy">
              <span className="section-kicker">Contattaci</span>
              <h2>Per un preventivo</h2>
              <p>
                Saremo lieti di fissare un appuntamento nel più breve tempo possibile.
              </p>
            </div>

            <form className="services-contact-form">
              <div className="services-contact-row">
                <div className="services-form-group">
                  <label>Nome Cognome</label>
                  <input type="text" placeholder="Inserisci il tuo nome" />
                </div>

                <div className="services-form-group">
                  <label>E-mail</label>
                  <input type="email" placeholder="Inserisci la tua email" />
                </div>
              </div>

              <div className="services-form-group">
                <label>Messaggio</label>
                <textarea rows="4" placeholder="Scrivi il tuo messaggio" />
              </div>

              <label className="services-checkbox">
                <input type="checkbox" />
                <span>
                  Dichiaro di accettare i termini di servizio e l’informativa sulla
                  privacy.
                </span>
              </label>

              <button type="submit" className="services-submit-btn">
                Invia il messaggio
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}