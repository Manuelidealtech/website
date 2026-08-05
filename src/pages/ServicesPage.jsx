import { useState } from 'react'
import '../styles/ServicesPage.css'
import { sendServicesEmail } from '../lib/contactEmail'

const services = [
  'Vendita ed installazione',
  'Automazioni - Special Machines',
  'Consulenza tecnica e progettazione',
  'Assistenza tecnica e manutenzione',
  'Assistenza software',
  'Ricambi compatibili',
]

const galleryImages = [
  { src: '/images/servizi/gallery-1-960.webp', width: 640, height: 427 },
  { src: '/images/servizi/gallery-2-960.webp', width: 540, height: 960 },
  { src: '/images/servizi/gallery-3-960.webp', width: 960, height: 960 },
  { src: '/images/servizi/gallery-4-960.webp', width: 960, height: 640 },
  { src: '/images/servizi/gallery-5-960.webp', width: 960, height: 640 },
  { src: '/images/servizi/gallery-6-960.webp', width: 960, height: 640 },
  { src: '/images/servizi/gallery-7-960.webp', width: 960, height: 640 },
  { src: '/images/servizi/gallery-8-960.webp', width: 755, height: 960 },
]

export default function ServicesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    privacyAccepted: false,
    website: '',
  })

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', text: '' })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!formData.privacyAccepted) {
      setFeedback({ type: 'error', text: 'Devi accettare la privacy.' })
      return
    }

    try {
      setLoading(true)
      setFeedback({ type: '', text: '' })

      await sendServicesEmail({
        title: 'Richiesta preventivo',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Non inserito',
        message: formData.message,
        privacyAccepted: formData.privacyAccepted,
        website: formData.website,
        source: 'Pagina Servizi - richiesta preventivo',
      })

      setFeedback({ type: 'success', text: 'Richiesta inviata correttamente.' })
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyAccepted: false,
        website: '',
      })
    } catch (error) {
      console.error('Errore invio email:', error)
      setFeedback({ type: 'error', text: error.message || 'Errore durante l’invio della richiesta.' })
    } finally {
      setLoading(false)
    }
  }

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
              <div className="services-gallery-item" key={image.src}>
                <img
                  src={image.src}
                  alt={`Servizio tecnico Idealtech ${index + 1}`}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                />
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

            <form className="services-contact-form" onSubmit={handleSubmit}>
              <div className="form-honeypot" aria-hidden="true">
                <label htmlFor="services-website">Non compilare questo campo</label>
                <input
                  id="services-website"
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex="-1"
                  autoComplete="off"
                />
              </div>
              <div className="services-contact-row">
                <div className="services-form-group">
                  <label>Nome Cognome</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Inserisci il tuo nome"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="services-form-group">
                  <label>E-mail</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Inserisci la tua email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="services-form-group">
                  <label>Cellulare</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Inserisci il tuo numero"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="services-form-group">
                <label>Messaggio</label>
                <textarea
                  rows="4"
                  name="message"
                  placeholder="Scrivi il tuo messaggio"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <label className="services-checkbox">
                <input
                  type="checkbox"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleChange}
                  required
                />
                <span>
                  Dichiaro di accettare i termini di servizio e l’informativa sulla
                  privacy.
                </span>
              </label>

              {feedback.text ? (
                <p className={`form-feedback form-feedback--${feedback.type}`}>
                  {feedback.text}
                </p>
              ) : null}

              <button type="submit" className="services-submit-btn" disabled={loading}>
                {loading ? 'Invio in corso...' : 'Invia il messaggio'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}