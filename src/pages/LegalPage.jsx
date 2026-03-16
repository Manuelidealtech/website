import { Link } from 'react-router-dom'
import '../styles/LegalPage.css'

export default function LegalPage() {
  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <div className="legal-topbar-inner">
          <Link to="/" className="legal-back-btn">
            ← Torna al sito
          </Link>

          <div className="legal-topbar-brand">
            <span className="legal-topbar-logo">IdealTech</span>
          </div>
        </div>
      </header>

      <section className="legal-hero">
        <div className="legal-hero-overlay" />
        <div className="legal-hero-content">
          <span className="legal-badge">Area legale</span>
          <h1>Termini, Condizioni e Privacy Policy</h1>
          <p>
            In questa pagina sono riportate le condizioni di utilizzo del sito web
            IdealTech e le informazioni relative al trattamento dei dati personali
            forniti dagli utenti tramite i moduli di contatto presenti sul sito.
          </p>
          <p className="legal-update">
            Ultimo aggiornamento: 16 marzo 2026
          </p>
        </div>
      </section>

      <section className="legal-container">
        <aside className="legal-toc" aria-label="Indice contenuti">
          <a href="#termini">1. Informazioni generali</a>
          <a href="#uso-sito">2. Condizioni di utilizzo del sito</a>
          <a href="#proprieta">3. Proprietà intellettuale</a>
          <a href="#responsabilita">4. Limitazione di responsabilità</a>
          <a href="#privacy">5. Privacy Policy</a>
          <a href="#dati-raccolti">6. Dati raccolti</a>
          <a href="#finalita">7. Finalità del trattamento</a>
          <a href="#conservazione">8. Conservazione dei dati</a>
          <a href="#comunicazione">9. Comunicazione dei dati</a>
          <a href="#diritti">10. Diritti dell’interessato</a>
          <a href="#contatti">11. Contatti</a>
        </aside>

        <div className="legal-card">
          <section id="termini" className="legal-section">
            <h2>1. Informazioni generali</h2>
            <p>
              Il presente sito web è gestito da <strong>IdealTech s.r.l.</strong>,
              con sede in <strong>Via Sondrio 11, Varedo (MB)</strong>,
              P. IVA e C.F. <strong>03058520960</strong>.
            </p>
            <p>
              Contatti aziendali:
            </p>
            <ul>
              <li>
                Email: <strong>info@idealtech.it</strong>
              </li>
              <li>
                PEC: <strong>direzione.idealtech@pec.it</strong>
              </li>
              <li>
                Telefono: <strong>0362543041</strong>
              </li>
            </ul>
          </section>

          <section id="uso-sito" className="legal-section">
            <h2>2. Condizioni di utilizzo del sito</h2>
            <p>
              L’accesso e la navigazione all’interno di questo sito implicano
              l’accettazione delle presenti condizioni di utilizzo. L’utente si
              impegna a utilizzare il sito in modo corretto, lecito e conforme
              alla normativa vigente, evitando qualsiasi uso improprio, illecito
              o potenzialmente dannoso per IdealTech s.r.l. o per terzi.
            </p>
            <p>
              I contenuti presenti sul sito hanno finalità esclusivamente
              informative e descrittive delle attività, dei prodotti e dei servizi
              offerti da IdealTech s.r.l., salvo ove diversamente specificato.
            </p>
            <p>
              IdealTech s.r.l. si riserva il diritto di modificare, aggiornare,
              integrare o rimuovere in qualsiasi momento i contenuti del sito e
              della presente pagina, senza obbligo di preavviso.
            </p>
          </section>

          <section id="proprieta" className="legal-section">
            <h2>3. Proprietà intellettuale</h2>
            <p>
              Tutti i contenuti presenti nel sito, inclusi testi, immagini, loghi,
              elementi grafici, documenti, layout, marchi, nomi commerciali e
              qualsiasi altro materiale, sono di proprietà di IdealTech s.r.l.
              oppure utilizzati con regolare autorizzazione.
            </p>
            <p>
              È vietata la riproduzione, distribuzione, modifica, pubblicazione
              o utilizzo, anche parziale, dei contenuti del sito senza preventiva
              autorizzazione scritta da parte di IdealTech s.r.l., salvo i casi
              consentiti dalla legge.
            </p>
          </section>

          <section id="responsabilita" className="legal-section">
            <h2>4. Limitazione di responsabilità</h2>
            <p>
              IdealTech s.r.l. si impegna a mantenere le informazioni pubblicate
              sul sito quanto più possibile aggiornate e corrette. Tuttavia, non
              garantisce l’assenza di errori, omissioni, interruzioni del servizio
              o imprecisioni eventualmente presenti nei contenuti.
            </p>
            <p>
              Nei limiti consentiti dalla legge, IdealTech s.r.l. non potrà essere
              ritenuta responsabile per danni diretti o indiretti derivanti
              dall’uso del sito, dall’impossibilità di accedervi o dall’affidamento
              riposto nei contenuti pubblicati.
            </p>
            <p>
              Eventuali collegamenti a siti esterni di terze parti sono forniti
              esclusivamente per comodità dell’utente. IdealTech s.r.l. non
              esercita alcun controllo su tali siti e non assume responsabilità
              in relazione ai loro contenuti, servizi o modalità di trattamento
              dei dati.
            </p>
          </section>

          <section id="privacy" className="legal-section">
            <h2>5. Privacy Policy</h2>
            <p>
              I dati personali eventualmente forniti dall’utente tramite i moduli
              presenti sul sito sono trattati da IdealTech s.r.l. esclusivamente
              per finalità connesse alla gestione delle richieste ricevute,
              all’assistenza, ai contatti commerciali o alle comunicazioni richieste
              dall’utente stesso.
            </p>

            <div className="legal-highlight">
              <h3>Titolare del trattamento</h3>
              <p><strong>IdealTech s.r.l.</strong></p>
              <p>Via Sondrio 11, Varedo (MB)</p>
              <p>P. IVA e C.F.: 03058520960</p>
              <p>Email: info@idealtech.it</p>
              <p>PEC: direzione.idealtech@pec.it</p>
              <p>Telefono: 0362543041</p>
            </div>
          </section>

          <section id="dati-raccolti" className="legal-section">
            <h2>6. Dati raccolti</h2>
            <p>
              Attraverso i moduli presenti sul sito possono essere raccolti i dati
              inseriti volontariamente dall’utente, come ad esempio:
            </p>
            <ul>
              <li>nome e cognome;</li>
              <li>indirizzo email;</li>
              <li>numero di telefono;</li>
              <li>azienda di appartenenza, se indicata;</li>
              <li>contenuto del messaggio o della richiesta inviata.</li>
            </ul>
            <p>
              I dati vengono forniti spontaneamente dall’utente e sono trattati
              solo nella misura necessaria a dare seguito alla richiesta inviata.
            </p>
          </section>

          <section id="finalita" className="legal-section">
            <h2>7. Finalità del trattamento</h2>
            <p>I dati raccolti tramite il sito sono utilizzati esclusivamente per:</p>
            <ul>
              <li>rispondere a richieste di informazioni o contatto;</li>
              <li>fornire assistenza commerciale o tecnica;</li>
              <li>gestire richieste preventive o comunicazioni inviate dall’utente;</li>
              <li>adempiere a eventuali obblighi amministrativi o di legge.</li>
            </ul>
            <p>
              I dati non vengono utilizzati per finalità di profilazione e non
              vengono ceduti a terzi per attività di marketing.
            </p>
          </section>

          <section id="conservazione" className="legal-section">
            <h2>8. Conservazione dei dati</h2>
            <p>
              I dati inseriti nei moduli del sito vengono conservati nel
              <strong> server aziendale</strong> di IdealTech s.r.l. per il tempo
              necessario alla gestione delle richieste ricevute e comunque fino a
              eventuale richiesta di rimozione da parte dell’interessato, salvo
              diversi obblighi di legge o esigenze amministrative legittime.
            </p>
            <p>
              Per richiedere la cancellazione dei propri dati è sufficiente
              contattare direttamente l’azienda ai recapiti indicati nella presente pagina.
            </p>
          </section>

          <section id="comunicazione" className="legal-section">
            <h2>9. Comunicazione dei dati</h2>
            <p>
              I dati personali non vengono diffusi né profilati e non vengono
              comunicati a terzi per finalità commerciali o pubblicitarie.
            </p>
            <p>
              Il sito non utilizza strumenti di analisi comportamentale o
              tracciamento come <strong>Google Analytics</strong>.
            </p>
            <p>
              I dati potranno essere trattati solo da soggetti autorizzati
              internamente all’azienda o da eventuali fornitori tecnici strettamente
              necessari alla gestione del sito e dei sistemi informatici, nei limiti
              delle rispettive funzioni.
            </p>
          </section>

          <section id="diritti" className="legal-section">
            <h2>10. Diritti dell’interessato</h2>
            <p>
              L’utente può in qualsiasi momento richiedere informazioni sui dati
              personali forniti, nonché chiederne aggiornamento, rettifica,
              limitazione o cancellazione, contattando IdealTech s.r.l. tramite
              i recapiti ufficiali indicati in questa pagina.
            </p>
            <p>
              Eventuali richieste relative ai dati personali saranno gestite
              direttamente dall’azienda con la massima attenzione e nel minor
              tempo possibile.
            </p>
          </section>

          <section id="contatti" className="legal-section">
            <h2>11. Contatti</h2>
            <p>
              Per qualunque informazione relativa ai presenti termini, alle
              condizioni di utilizzo del sito o alla gestione dei dati personali,
              è possibile contattare:
            </p>

            <div className="legal-contact-box">
              <p><strong>IdealTech s.r.l.</strong></p>
              <p>Via Sondrio 11, Varedo (MB)</p>
              <p>P. IVA e C.F. 03058520960</p>
              <p>Email: info@idealtech.it</p>
              <p>PEC: direzione.idealtech@pec.it</p>
              <p>Telefono: 0362543041</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}