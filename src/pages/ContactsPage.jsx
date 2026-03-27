import { useState } from 'react'
import '../styles/ContactsPage.css'
import { sendContactEmail } from '../lib/emailjs'

const officeSections = [
  {
    title: 'Ufficio commerciale',
    items: [
      {
        office: 'Ufficio commerciale Italia - Interno 1',
        employee: 'Lucia Bisceglia',
        phone: '+39 0362 543041',
        email: 'lucia.bisceglia@idealtech.it',
      },
      {
        office: 'Ufficio commerciale estero - Interno 2',
        employee: 'Noemi Silvio',
        phone: '+39 338 1382452',
        email: 'info@idealtech.it',
      },
    ],
  },
  {
    title: 'Ufficio acquisti',
    items: [
      {
        text: 'Contattaci per ordini, forniture e richieste acquisti dedicate.',
        employee: 'Federica Ciocia',
        phone: '+39 0362 543041 - interno 3',
        email: 'acquisti@idealtech.it',
      },
    ],
  },
  {
    title: 'Amministrazione',
    items: [{ 
      text: 'Supporto per fatturazione, pratiche amministrative e documentazione.',
      employee: 'Giusy Scarano',
      phone: '+39 0362 543041 - interno 4',
      email: 'amministrazione@idealtech.it',
    }],
  },
  {
    title: 'Ufficio tecnico',
    items: [{ 
      text: 'Supporto tecnico e consulenza.',
      employee: 'Giorgio Perego',
      phone: '+39 0362 543041 - interno 5',
      email: 'ufficiotecnico1@idealtech.it',
    }],
  },
  {
    title: 'Assistenza tecnica',
    items: [{ 
      text: 'Supporto operativo e manutenzione su impianti e linee di incollaggio.',
      employee: 'Andrea Orlando',
      phone: '+39 0362 543041 - interno 6',
      email: 'assistenza@idealtech.it',
    }],
  },
]

export default function ContactsPage() {
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  message: '',
  privacyAccepted: false,
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

      await sendContactEmail({
        title: 'Nuovo messaggio dal sito',
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Non inserito',
        message: formData.message,
      })

      setFeedback({ type: 'success', text: 'Messaggio inviato correttamente.' })
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        privacyAccepted: false,
      })
    } catch (error) {
      console.error('Errore EmailJS:', error)
      setFeedback({ type: 'error', text: 'Errore durante l’invio del messaggio.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contacts-page">
      <section className="contacts-hero">
        <div className="site-container">
          <div className="contacts-hero__content">
            <span className="section-kicker">Contatti</span>
            <h1>Parliamo del tuo progetto</h1>
            <p>
              Assistenza clienti, reparto commerciale, supporto tecnico e richiesta
              preventivi: scegli il canale più adatto e contattaci.
            </p>
          </div>
        </div>
      </section>

      <section className="contacts-main-section">
        <div className="site-container contacts-main-grid">
          <div className="contacts-left">
            <div className="contacts-card">
              <h2>Servizio assistenza clienti</h2>
              <p>
                Per informazioni o assistenza ti preghiamo di contattarci al seguente
                numero telefonico: <strong>+39 0362 543041</strong>
              </p>
            </div>

            <div className="contacts-offices">
              {officeSections.map((section) => (
                <details
                  key={section.title}
                  className="contacts-office"
                  open={section.title === 'Ufficio commerciale'}
                >
                  <summary>{section.title}</summary>

                  <div className="contacts-office__content">
                    {section.items.map((item, index) =>
                      item.text && !item.office ? (
                        <div key={index}>
                          <p>{item.text}</p>
                          {item.employee && <p>{item.employee}</p>}
                          {item.phone && <p>{item.phone}</p>}
                          {item.email && <p>{item.email}</p>}
                        </div>
                      ) : (
                        <div key={index} className="contacts-office-person">
                          <p className="contacts-office-name">{item.office}</p>
                          <p className="contacts-office-employee">{item.employee}</p>
                          <p>{item.phone}</p>
                          <p>{item.email}</p>
                        </div>
                      )
                    )}
                  </div>
                </details>
              ))}
            </div>

            <div className="contacts-card">
              <h3>Contattaci</h3>
              <div className="contacts-info-list">
                <p>+39 0362 543041</p>
                <p>lucia.bisceglia@idealtech.it</p>
                <p>Via Sondrio, 11</p>
                <p>20814 Varedo (MB)</p>
              </div>
            </div>
          </div>

          <div className="contacts-right">
            <div className="contacts-card contacts-form-card">
              <h2>Scrivici</h2>

              <form className="contacts-form" onSubmit={handleSubmit}>
                <div className="contacts-form-row">
                  <div className="contacts-form-group">
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

                  <div className="contacts-form-group">
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

                  <div className="contacts-form-group">
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

                <div className="contacts-form-group">
                  <label>Messaggio</label>
                  <textarea
                    rows="5"
                    name="message"
                    placeholder="Scrivi il tuo messaggio"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <label className="contacts-checkbox">
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

                <div className="contacts-form-actions">
                  <button type="submit" className="contacts-submit-btn" disabled={loading}>
                    {loading ? 'Invio in corso...' : 'Invia messaggio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="contacts-map-section">
        <div className="site-container">
          <div className="contacts-map-card">
            <iframe
              title="Mappa Idealtech"
              src="https://www.google.com/maps?q=Via%20Sondrio%2011%20Varedo&z=14&output=embed"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  )
}