import { useEffect, useMemo, useState } from 'react'
import '../styles/ContactsPage.css'
import { sendContactEmail } from '../lib/contactEmail'
import { supabase } from '../lib/supabase'
import { defaultContactRows, groupContactRows } from '../lib/contactDefaults'

export default function ContactsPage() {
  const [contactRows, setContactRows] = useState(defaultContactRows)

  useEffect(() => {
    let active = true

    async function loadContacts() {
      const { data, error } = await supabase
        .from('contact_people')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!active) return
      if (error) {
        console.warn('Contatti dinamici non disponibili, uso i dati predefiniti:', error.message)
        return
      }

      if (data?.length) setContactRows(data)
    }

    loadContacts()
    return () => {
      active = false
    }
  }, [])

  const officeSections = useMemo(() => groupContactRows(contactRows), [contactRows])

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
        privacyAccepted: formData.privacyAccepted,
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
      console.error('Errore invio email:', error)
      setFeedback({ type: 'error', text: error.message || 'Errore durante l’invio del messaggio.' })
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
                numero telefonico:{' '}
                <a className="contacts-link contacts-link--phone" href="tel:+390362543041">
                  +39 0362 543041
                </a>
              </p>
            </div>

            <div className="contacts-offices">
              {officeSections.map((section) => (
                <details
                  key={section.title}
                  className="contacts-office"
                  defaultOpen={section.title === 'Ufficio commerciale'}
                >
                  <summary>{section.title}</summary>

                  <div className="contacts-office__content">
                    {section.items.map((item, index) => (
                      <div key={item.id || index} className="contacts-office-person">
                        <div className="contacts-office-person__info">
                          {item.office && (
                            <p className="contacts-office-name">
                              {item.office}
                              {item.extension ? ` - ${item.extension}` : ''}
                            </p>
                          )}

                          {item.description && (
                            <p className="contacts-office-text">{item.description}</p>
                          )}

                          {item.employee && (
                            <p className="contacts-office-employee">{item.employee}</p>
                          )}

                          {(item.phone || item.extension) && (
                            <div className="contacts-contact-row">
                              {item.phone && (
                                <a
                                  className="contacts-link contacts-link--phone"
                                  href={`tel:${item.phone_href || item.phone.replace(/\s+/g, '')}`}
                                >
                                  {item.phone}
                                </a>
                              )}

                              {item.extension && !item.office && (
                                <span className="contacts-extension">
                                  {item.extension}
                                </span>
                              )}
                            </div>
                          )}

                          {item.email && (
                            <a
                              className="contacts-link contacts-link--email"
                              href={`mailto:${item.email}`}
                            >
                              {item.email}
                            </a>
                          )}
                        </div>

                        {item.photo_url ? (
                          <div className="contacts-office-avatar">
                            <img
                              src={item.photo_url}
                              alt={item.employee || 'Dipendente Idealtech'}
                              onError={(event) => {
                                event.currentTarget.parentElement.style.display = 'none'
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            <div className="contacts-card">
              <h3>Contattaci</h3>
              <div className="contacts-info-list">
                <a className="contacts-link contacts-link--phone" href="tel:+390362543041">
                  +39 0362 543041
                </a>

                <a
                  className="contacts-link contacts-link--email"
                  href="mailto:lucia.bisceglia@idealtech.it"
                >
                  lucia.bisceglia@idealtech.it
                </a>

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
                  <button
                    type="submit"
                    className="contacts-submit-btn"
                    disabled={loading}
                  >
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