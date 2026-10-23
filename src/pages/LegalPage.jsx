import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { LEGAL_DOCUMENTS } from '../data/legalDocuments'
import '../styles/LegalPage.css'

const LABELS = {
  it: {
    back: '← Torna al sito',
    area: 'Area legale',
    title: 'Termini, Condizioni e Privacy Policy',
    intro: 'Consulta le condizioni commerciali ufficiali Idealtech, scarica i documenti PDF e leggi le informazioni relative all’utilizzo del sito e al trattamento dei dati personali.',
    updated: 'Documenti commerciali: edizione 2026',
    commercial: 'Condizioni commerciali 2026',
    commercialIntro: 'Le versioni pubblicate qui sotto corrispondono ai documenti ufficiali disponibili in PDF. In caso di discrepanze tra la versione italiana e quella inglese, prevale la versione italiana.',
    sale: 'Condizioni di Vendita',
    purchase: 'Condizioni di Acquisto',
    saleDesc: 'Condizioni applicabili ai rapporti contrattuali tra Idealtech e i propri clienti professionali.',
    purchaseDesc: 'Condizioni applicabili agli ordini di acquisto emessi da Idealtech nei confronti dei propri fornitori.',
    read: 'Leggi sul sito',
    pdfIt: 'Scarica PDF IT',
    pdfEn: 'Download PDF EN',
    onlineTitle: 'Testo integrale online',
    language: 'Lingua del documento',
    italian: 'Italiano',
    english: 'English',
    officialNote: 'Il testo seguente riproduce il contenuto del documento ufficiale. Per sottoscrizione, archiviazione o invio a clienti e fornitori utilizza il PDF scaricabile.',
    websiteTerms: 'Termini e Privacy del sito',
  },
  en: {
    back: '← Back to site',
    area: 'Legal area',
    title: 'Terms, Conditions and Privacy Policy',
    intro: 'Review Idealtech’s official commercial terms, download the PDF documents and read the information about website use and personal data processing.',
    updated: 'Commercial documents: 2026 edition',
    commercial: '2026 Commercial Terms',
    commercialIntro: 'The versions published below correspond to the official PDF documents. In the event of discrepancies between the Italian and English versions, the Italian version shall prevail.',
    sale: 'Terms and Conditions of Sale',
    purchase: 'Terms and Conditions of Purchase',
    saleDesc: 'Terms governing contractual relationships between Idealtech and its business customers.',
    purchaseDesc: 'Terms applicable to purchase orders issued by Idealtech to its suppliers.',
    read: 'Read online',
    pdfIt: 'Download PDF IT',
    pdfEn: 'Download PDF EN',
    onlineTitle: 'Full text online',
    language: 'Document language',
    italian: 'Italiano',
    english: 'English',
    officialNote: 'The text below reproduces the content of the official document. For signature, filing or delivery to customers and suppliers, use the downloadable PDF.',
    websiteTerms: 'Website Terms and Privacy',
  },
}

function LegalDocumentText({ text }) {
  const blocks = useMemo(() => text.split(/\n\n+/).filter(Boolean), [text])

  return (
    <div className="legal-document-text" data-no-translate>
      {blocks.map((block, index) => {
        const value = block.trim()
        const isDocumentTitle = index === 0
        const isNumberedHeading = /^\d+\.\s/.test(value)
        const isCapsHeading = !isDocumentTitle && value.length < 100 && value === value.toUpperCase() && /[A-ZÀ-Ü]/.test(value)
        const isBullet = value.startsWith('• ')
        const isSignature = /^(Luogo e data|Ragione sociale|Nome e qualifica|Firma|Place and Date|Supplier's Company Name|Customer's Company Name|Name and Position|Signature)/.test(value)

        if (isDocumentTitle) return null
        if (isCapsHeading) return <h3 key={index} className="legal-document-major-heading">{value}</h3>
        if (isNumberedHeading) return <h4 key={index}>{value}</h4>
        if (isBullet) return <div key={index} className="legal-document-bullet">{value.replace(/^•\s*/, '')}</div>
        if (isSignature) return <p key={index} className="legal-document-signature">{value}</p>
        return <p key={index}>{value}</p>
      })}
    </div>
  )
}

function DownloadButton({ href, children, secondary = false }) {
  return (
    <a className={`legal-download-btn${secondary ? ' legal-download-btn--secondary' : ''}`} href={href} download>
      <span aria-hidden="true">↓</span>
      {children}
    </a>
  )
}

export default function LegalPage() {
  const { language } = useLanguage()
  const uiLanguage = language === 'it' ? 'it' : 'en'
  const labels = LABELS[uiLanguage]
  const [documentType, setDocumentType] = useState('sale')
  const [documentLanguage, setDocumentLanguage] = useState(uiLanguage)

  useEffect(() => {
    setDocumentLanguage(language === 'it' ? 'it' : 'en')
  }, [language])

  const activeDocument = LEGAL_DOCUMENTS[documentType][documentLanguage]

  const openDocument = (type) => {
    setDocumentType(type)
    window.requestAnimationFrame(() => {
      document.getElementById('testo-condizioni')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <div className="legal-topbar-inner">
          <Link to="/" className="legal-back-btn">{labels.back}</Link>
          <div className="legal-topbar-brand">
            <img src="/logo-idealtech-900.webp" alt="Idealtech" className="legal-topbar-logo-image" />
          </div>
        </div>
      </header>

      <section className="legal-hero">
        <div className="legal-hero-overlay" />
        <div className="legal-hero-content">
          <span className="legal-badge">{labels.area}</span>
          <h1>{labels.title}</h1>
          <p>{labels.intro}</p>
          <p className="legal-update">{labels.updated}</p>
        </div>
      </section>

      <section className="legal-container">
        <aside className="legal-toc" aria-label="Indice contenuti">
          <strong className="legal-toc-title">{labels.commercial}</strong>
          <a href="#condizioni-vendita">{labels.sale}</a>
          <a href="#condizioni-acquisto">{labels.purchase}</a>
          <a href="#testo-condizioni">{labels.onlineTitle}</a>
          <span className="legal-toc-separator" />
          <strong className="legal-toc-title">{labels.websiteTerms}</strong>
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
          <section className="legal-commercial-intro">
            <span className="legal-kicker">{labels.commercial}</span>
            <h2>{labels.commercial}</h2>
            <p>{labels.commercialIntro}</p>
          </section>

          <div className="legal-document-cards">
            <article id="condizioni-vendita" className="legal-document-card">
              <div className="legal-document-card__icon" aria-hidden="true">V</div>
              <div>
                <span className="legal-document-card__year">2026</span>
                <h3>{labels.sale}</h3>
                <p>{labels.saleDesc}</p>
              </div>
              <div className="legal-document-card__actions">
                <button type="button" className="legal-read-btn" onClick={() => openDocument('sale')}>{labels.read}</button>
                <DownloadButton href={LEGAL_DOCUMENTS.sale.it.pdf}>{labels.pdfIt}</DownloadButton>
                <DownloadButton href={LEGAL_DOCUMENTS.sale.en.pdf} secondary>{labels.pdfEn}</DownloadButton>
              </div>
            </article>

            <article id="condizioni-acquisto" className="legal-document-card">
              <div className="legal-document-card__icon" aria-hidden="true">A</div>
              <div>
                <span className="legal-document-card__year">2026</span>
                <h3>{labels.purchase}</h3>
                <p>{labels.purchaseDesc}</p>
              </div>
              <div className="legal-document-card__actions">
                <button type="button" className="legal-read-btn" onClick={() => openDocument('purchase')}>{labels.read}</button>
                <DownloadButton href={LEGAL_DOCUMENTS.purchase.it.pdf}>{labels.pdfIt}</DownloadButton>
                <DownloadButton href={LEGAL_DOCUMENTS.purchase.en.pdf} secondary>{labels.pdfEn}</DownloadButton>
              </div>
            </article>
          </div>

          <section id="testo-condizioni" className="legal-full-document">
            <div className="legal-document-toolbar">
              <div>
                <span className="legal-kicker">{labels.onlineTitle}</span>
                <h2>{activeDocument.title}</h2>
              </div>

              <div className="legal-document-controls" aria-label="Selezione documento">
                <div className="legal-segmented-control">
                  <button type="button" className={documentType === 'sale' ? 'is-active' : ''} onClick={() => setDocumentType('sale')}>{labels.sale}</button>
                  <button type="button" className={documentType === 'purchase' ? 'is-active' : ''} onClick={() => setDocumentType('purchase')}>{labels.purchase}</button>
                </div>
                <div className="legal-language-control">
                  <span>{labels.language}</span>
                  <div className="legal-segmented-control legal-segmented-control--small">
                    <button type="button" className={documentLanguage === 'it' ? 'is-active' : ''} onClick={() => setDocumentLanguage('it')}>{labels.italian}</button>
                    <button type="button" className={documentLanguage === 'en' ? 'is-active' : ''} onClick={() => setDocumentLanguage('en')}>{labels.english}</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="legal-official-note">{labels.officialNote}</div>
            <div className="legal-inline-download">
              <DownloadButton href={activeDocument.pdf}>{documentLanguage === 'it' ? labels.pdfIt : labels.pdfEn}</DownloadButton>
            </div>
            <LegalDocumentText text={activeDocument.text} />
          </section>

          <section id="termini" className="legal-section legal-site-section-start">
            <span className="legal-kicker">{labels.websiteTerms}</span>
            <h2>1. Informazioni generali</h2>
            <p>
              Il presente sito web è gestito da <strong>IdealTech s.r.l.</strong>, con sede in <strong>Via Sondrio 11, Varedo (MB)</strong>, P. IVA e C.F. <strong>03058520960</strong>.
            </p>
            <p>Contatti aziendali:</p>
            <ul>
              <li>Email: <strong>info@idealtech.it</strong></li>
              <li>PEC: <strong>direzione.idealtech@pec.it</strong></li>
              <li>Telefono: <strong>0362543041</strong></li>
            </ul>
          </section>

          <section id="uso-sito" className="legal-section">
            <h2>2. Condizioni di utilizzo del sito</h2>
            <p>L’accesso e la navigazione all’interno di questo sito implicano l’accettazione delle presenti condizioni di utilizzo. L’utente si impegna a utilizzare il sito in modo corretto, lecito e conforme alla normativa vigente, evitando qualsiasi uso improprio, illecito o potenzialmente dannoso per IdealTech s.r.l. o per terzi.</p>
            <p>I contenuti presenti sul sito hanno finalità esclusivamente informative e descrittive delle attività, dei prodotti e dei servizi offerti da IdealTech s.r.l., salvo ove diversamente specificato.</p>
            <p>IdealTech s.r.l. si riserva il diritto di modificare, aggiornare, integrare o rimuovere in qualsiasi momento i contenuti del sito e della presente pagina, senza obbligo di preavviso.</p>
          </section>

          <section id="proprieta" className="legal-section">
            <h2>3. Proprietà intellettuale</h2>
            <p>Tutti i contenuti presenti nel sito, inclusi testi, immagini, loghi, elementi grafici, documenti, layout, marchi, nomi commerciali e qualsiasi altro materiale, sono di proprietà di IdealTech s.r.l. oppure utilizzati con regolare autorizzazione.</p>
            <p>È vietata la riproduzione, distribuzione, modifica, pubblicazione o utilizzo, anche parziale, dei contenuti del sito senza preventiva autorizzazione scritta da parte di IdealTech s.r.l., salvo i casi consentiti dalla legge.</p>
          </section>

          <section id="responsabilita" className="legal-section">
            <h2>4. Limitazione di responsabilità</h2>
            <p>IdealTech s.r.l. si impegna a mantenere le informazioni pubblicate sul sito quanto più possibile aggiornate e corrette. Tuttavia, non garantisce l’assenza di errori, omissioni, interruzioni del servizio o imprecisioni eventualmente presenti nei contenuti.</p>
            <p>Nei limiti consentiti dalla legge, IdealTech s.r.l. non potrà essere ritenuta responsabile per danni diretti o indiretti derivanti dall’uso del sito, dall’impossibilità di accedervi o dall’affidamento riposto nei contenuti pubblicati.</p>
            <p>Eventuali collegamenti a siti esterni di terze parti sono forniti esclusivamente per comodità dell’utente. IdealTech s.r.l. non esercita alcun controllo su tali siti e non assume responsabilità in relazione ai loro contenuti, servizi o modalità di trattamento dei dati.</p>
          </section>

          <section id="privacy" className="legal-section">
            <h2>5. Privacy Policy</h2>
            <p>I dati personali eventualmente forniti dall’utente tramite i moduli presenti sul sito sono trattati da IdealTech s.r.l. esclusivamente per finalità connesse alla gestione delle richieste ricevute, all’assistenza, ai contatti commerciali o alle comunicazioni richieste dall’utente stesso.</p>
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
            <p>Attraverso i moduli presenti sul sito possono essere raccolti i dati inseriti volontariamente dall’utente, come ad esempio:</p>
            <ul>
              <li>nome e cognome;</li><li>indirizzo email;</li><li>numero di telefono;</li><li>azienda di appartenenza, se indicata;</li><li>contenuto del messaggio o della richiesta inviata.</li>
            </ul>
            <p>I dati vengono forniti spontaneamente dall’utente e sono trattati solo nella misura necessaria a dare seguito alla richiesta inviata.</p>
          </section>

          <section id="finalita" className="legal-section">
            <h2>7. Finalità del trattamento</h2>
            <p>I dati raccolti tramite il sito sono utilizzati esclusivamente per:</p>
            <ul>
              <li>rispondere a richieste di informazioni o contatto;</li><li>fornire assistenza commerciale o tecnica;</li><li>gestire richieste preventive o comunicazioni inviate dall’utente;</li><li>adempiere a eventuali obblighi amministrativi o di legge.</li>
            </ul>
            <p>I dati non vengono utilizzati per finalità di profilazione e non vengono ceduti a terzi per attività di marketing.</p>
          </section>

          <section id="conservazione" className="legal-section">
            <h2>8. Conservazione dei dati</h2>
            <p>I dati inseriti nei moduli del sito vengono conservati nel <strong>server aziendale</strong> di IdealTech s.r.l. per il tempo necessario alla gestione delle richieste ricevute e comunque fino a eventuale richiesta di rimozione da parte dell’interessato, salvo diversi obblighi di legge o esigenze amministrative legittime.</p>
            <p>Per richiedere la cancellazione dei propri dati è sufficiente contattare direttamente l’azienda ai recapiti indicati nella presente pagina.</p>
          </section>

          <section id="comunicazione" className="legal-section">
            <h2>9. Comunicazione dei dati</h2>
            <p>I dati personali non vengono diffusi né profilati e non vengono comunicati a terzi per finalità commerciali o pubblicitarie.</p>
            <p>Il sito non utilizza strumenti di analisi comportamentale o tracciamento come <strong>Google Analytics</strong>.</p>
            <p>I dati potranno essere trattati solo da soggetti autorizzati internamente all’azienda o da eventuali fornitori tecnici strettamente necessari alla gestione del sito e dei sistemi informatici, nei limiti delle rispettive funzioni.</p>
          </section>

          <section id="diritti" className="legal-section">
            <h2>10. Diritti dell’interessato</h2>
            <p>L’utente può in qualsiasi momento richiedere informazioni sui dati personali forniti, nonché chiederne aggiornamento, rettifica, limitazione o cancellazione, contattando IdealTech s.r.l. tramite i recapiti ufficiali indicati in questa pagina.</p>
            <p>Eventuali richieste relative ai dati personali saranno gestite direttamente dall’azienda con la massima attenzione e nel minor tempo possibile.</p>
          </section>

          <section id="contatti" className="legal-section">
            <h2>11. Contatti</h2>
            <p>Per qualunque informazione relativa ai presenti termini, alle condizioni di utilizzo del sito o alla gestione dei dati personali, è possibile contattare:</p>
            <div className="legal-contact-box">
              <p><strong>IdealTech s.r.l.</strong></p><p>Via Sondrio 11, Varedo (MB)</p><p>P. IVA e C.F. 03058520960</p><p>Email: info@idealtech.it</p><p>PEC: direzione.idealtech@pec.it</p><p>Telefono: 0362543041</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
