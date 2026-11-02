import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/SupportLanding.css'

export default function SupportLandingPage() {
  const { user, isSupportStaff } = useAuth()
  const portalPath = user ? (isSupportStaff ? '/admin/assistenza' : '/assistenza/portale') : '/assistenza/login'

  return (
    <main className="support-public-page">
      <section className="support-public-hero">
        <div className="site-container support-public-hero__inner">
          <div className="support-public-hero__copy">
            <span className="support-public-kicker">Idealtech Service</span>
            <h1>Assistenza tecnica, finalmente in un unico posto.</h1>
            <p>Apri una richiesta, indica il macchinario e conversa direttamente con il nostro reparto tecnico. Tutto lo storico rimane disponibile nel tuo portale.</p>
            <div className="support-public-actions">
              <Link className="support-public-primary" to={portalPath}>{user ? 'Apri il portale assistenza' : 'Accedi al portale'}</Link>
              {!user ? <Link className="support-public-secondary" to="/assistenza/registrazione">Crea account cliente</Link> : null}
            </div>
          </div>
          <div className="support-public-preview" aria-hidden="true">
            <div className="support-preview-window">
              <div className="support-preview-head"><span /><span /><span /></div>
              <div className="support-preview-ticket">
                <div><strong>TCK-000128</strong><span>In lavorazione</span></div>
                <h3>Controllo temperatura fusore</h3>
                <p>Ideal Melt 5 · S/N 24-0187</p>
                <div className="support-preview-message is-customer">Buongiorno, il fusore non mantiene la temperatura impostata.</div>
                <div className="support-preview-message is-tech">Verifichiamo insieme. Sul display compare un codice errore?</div>
                <div className="support-preview-input">Scrivi un messaggio… <b>➤</b></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container support-public-features">
        <article><span>01</span><h2>Apri il ticket</h2><p>Descrivi il problema e indica modello e numero di serie, se disponibile.</p></article>
        <article><span>02</span><h2>Chat con il tecnico</h2><p>Ricevi risposte e aggiornamenti direttamente nella conversazione del ticket.</p></article>
        <article><span>03</span><h2>Storico sempre disponibile</h2><p>I ticket risolti vengono chiusi e archiviati nel tuo account per future consultazioni.</p></article>
      </section>

      <section className="site-container support-public-cta">
        <div><span>Hai bisogno di supporto?</span><h2>Apri la tua area assistenza Idealtech.</h2></div>
        <Link to={portalPath}>{user ? 'Vai ai miei ticket' : 'Accedi'}</Link>
      </section>
    </main>
  )
}
