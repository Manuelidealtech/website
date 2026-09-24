import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../i18n/LanguageContext'
import { calculateCartTotals, formatMoney, getProductAvailability } from '../lib/shop'
import { getPrimaryProductImage } from '../lib/shopImages'
import '../styles/ShopPage.css'

const CART_KEY = 'idealtech-shop-cart-v1'

const emptyCustomer = {
  company: '',
  vatNumber: '',
  taxCode: '',
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
  country: 'Italia',
  notes: '',
  privacyAccepted: false,
  website: '',
}

function readCart() {
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export default function ShopPage() {
  const { locale } = useLanguage()
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({ shipping_cost: 0, currency: 'EUR' })
  const [cart, setCart] = useState(readCart)
  const [customer, setCustomer] = useState(emptyCustomer)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    let active = true

    async function loadShop() {
      try {
        // Il catalogo non deve dipendere dalla disponibilità dell'API ordini.
        // In locale (Vite) /api/orders può essere servito come sorgente JS invece
        // che come funzione Vercel: in quel caso ignoriamo la configurazione e
        // continuiamo a mostrare normalmente i prodotti.
        const productsResult = await supabase
          .from('shop_products')
          .select('*')
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false })

        if (productsResult.error) throw new Error(productsResult.error.message)

        if (!active) return
        setProducts(productsResult.data || [])

        try {
          const configResponse = await fetch('/api/orders?config=1', {
            headers: { Accept: 'application/json' },
          })
          const contentType = configResponse.headers.get('content-type') || ''

          if (configResponse.ok && contentType.includes('application/json')) {
            const configData = await configResponse.json()
            if (active && configData?.config) setConfig(configData.config)
          } else {
            console.warn('Configurazione shop non disponibile: risposta API non JSON.')
          }
        } catch (configError) {
          console.warn('Configurazione shop non disponibile:', configError)
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Impossibile caricare lo shop.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadShop()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const cartItems = useMemo(
    () =>
      cart
        .map((entry) => {
          const product = products.find((item) => item.id === entry.id)
          return product ? { ...product, quantity: entry.quantity } : null
        })
        .filter(Boolean),
    [cart, products]
  )

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totals = calculateCartTotals(cartItems, config.shipping_cost)

  function addToCart(product) {
    const availability = getProductAvailability(product)
    if (!availability.available) return

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      const limit = product.track_stock ? Number(product.stock_quantity) : 99

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, limit) }
            : item
        )
      }

      return [...current, { id: product.id, quantity: 1 }]
    })
    setCartOpen(true)
  }

  function updateQuantity(product, quantity) {
    const max = product.track_stock ? Number(product.stock_quantity) : 99
    const safeQuantity = Math.max(0, Math.min(Number(quantity) || 0, max))

    setCart((current) =>
      safeQuantity === 0
        ? current.filter((item) => item.id !== product.id)
        : current.map((item) =>
            item.id === product.id ? { ...item, quantity: safeQuantity } : item
          )
    )
  }

  function updateCustomer(name, value) {
    setCustomer((current) => ({ ...current, [name]: value }))
  }

  function openCheckout() {
    setCartOpen(false)
    setCheckoutOpen(true)
    setError('')
  }

  async function submitOrder(event) {
    event.preventDefault()
    if (!cartItems.length) return

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      })
      const contentType = response.headers.get('content-type') || ''
      let result = null

      if (contentType.includes('application/json')) {
        result = await response.json().catch(() => null)
      }

      if (!response.ok) {
        throw new Error(result?.message || 'Non è stato possibile registrare l’ordine.')
      }

      if (!result?.success || !result?.order_number) {
        throw new Error('Il servizio ordini non sta rispondendo correttamente. Se stai provando il sito in locale, avvialo con Vercel Dev; sul sito online verifica il deployment delle funzioni /api.')
      }

      setConfirmation(result)
      setCart([])
      setCustomer(emptyCustomer)
      setCheckoutOpen(false)
    } catch (submitError) {
      setError(submitError.message || 'Errore durante l’invio dell’ordine.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="shop-page">
      <section className="shop-hero">
        <div className="site-container shop-hero__inner">
          <div>
            <span className="shop-kicker">Ricambi e accessori Idealtech</span>
            <h1>Shop Idealtech</h1>
            <p>
              Seleziona i prodotti, invia l’ordine e completa il pagamento tramite bonifico bancario.
            </p>
          </div>
          <button type="button" className="shop-cart-button" onClick={() => setCartOpen(true)}>
            <svg className="shop-cart-button__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3h2l2.25 10.08a2 2 0 0 0 1.95 1.56h7.65a2 2 0 0 0 1.95-1.55L20.3 6H6" />
              <path d="M9 19.25h.01M17 19.25h.01" />
            </svg>
            Carrello
            <strong>{itemCount}</strong>
          </button>
        </div>
      </section>

      <main className="site-container shop-content">
        <div className="shop-assurance-row">
          <div><strong>Ordine diretto</strong><span>La richiesta arriva subito al commerciale</span></div>
          <div><strong>Pagamento sicuro</strong><span>Bonifico alle coordinate indicate nell’ordine</span></div>
          <div><strong>Supporto Idealtech</strong><span>Assistenza prima e dopo l’acquisto</span></div>
        </div>

        {error && !checkoutOpen ? <div className="shop-message shop-message--error">{error}</div> : null}

        {loading ? (
          <div className="shop-empty">Caricamento prodotti...</div>
        ) : products.length === 0 ? (
          <div className="shop-empty">
            <span>Shop in aggiornamento</span>
            <h2>I prodotti saranno disponibili a breve</h2>
            <p>Per una richiesta urgente puoi contattare direttamente il nostro ufficio commerciale.</p>
            <Link className="shop-primary-button" to="/contatti">Contattaci</Link>
          </div>
        ) : (
          <div className="shop-grid">
            {products.map((product) => {
              const availability = getProductAvailability(product)
              const grossPrice = Number(product.price) * (1 + Number(product.vat_rate || 0) / 100)
              const primaryImage = getPrimaryProductImage(product)

              return (
                <article className="shop-product-card" key={product.id}>
                  <Link className="shop-product-card__image" to={`/shop/${product.id}`} aria-label={`Apri ${product.name}`}>
                    {primaryImage?.url ? (
                      <img src={primaryImage.url} alt={product.name} loading="lazy" />
                    ) : (
                      <div className="shop-product-placeholder">Idealtech</div>
                    )}
                    {product.category ? <span className="shop-product-category">{product.category}</span> : null}
                  </Link>
                  <div className="shop-product-card__body">
                    {product.sku ? <span className="shop-product-sku">Cod. {product.sku}</span> : null}
                    <h2><Link to={`/shop/${product.id}`}>{product.name}</Link></h2>
                    {product.description ? <p>{product.description}</p> : null}
                    <Link className="shop-product-detail-link" to={`/shop/${product.id}`}>Vedi dettagli e descrizione completa →</Link>
                    <span className={`shop-availability ${availability.available ? '' : 'is-empty'}`}>
                      {availability.label}
                    </span>
                    <div className="shop-product-card__footer">
                      <div className="shop-product-price">
                        <strong>{formatMoney(grossPrice, locale)}</strong>
                        <small>IVA inclusa</small>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={!availability.available}
                      >
                        {availability.available ? 'Aggiungi' : 'Esaurito'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {cartOpen ? (
        <div className="shop-drawer-layer" role="presentation" onMouseDown={() => setCartOpen(false)}>
          <aside className="shop-cart-drawer" role="dialog" aria-modal="true" aria-label="Carrello" onMouseDown={(event) => event.stopPropagation()}>
            <div className="shop-panel-head">
              <div><span>Il tuo ordine</span><h2>Carrello</h2></div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Chiudi carrello">×</button>
            </div>

            {cartItems.length === 0 ? (
              <div className="shop-cart-empty"><p>Il carrello è vuoto.</p></div>
            ) : (
              <>
                <div className="shop-cart-items">
                  {cartItems.map((item) => (
                    <div className="shop-cart-item" key={item.id}>
                      <div className="shop-cart-item__image">
                        {item.image_url ? <img src={item.image_url} alt="" /> : <span>IT</span>}
                      </div>
                      <div className="shop-cart-item__copy">
                        <strong>{item.name}</strong>
                        <small>{formatMoney(Number(item.price) * (1 + Number(item.vat_rate || 0) / 100), locale)} cad.</small>
                        <div className="shop-quantity">
                          <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} aria-label="Riduci quantità">−</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} aria-label="Aumenta quantità">+</button>
                        </div>
                      </div>
                      <button className="shop-cart-remove" type="button" onClick={() => updateQuantity(item, 0)} aria-label={`Rimuovi ${item.name}`}>×</button>
                    </div>
                  ))}
                </div>
                <OrderTotals totals={totals} locale={locale} />
                <button type="button" className="shop-primary-button shop-full-button" onClick={openCheckout}>
                  Procedi con l’ordine
                </button>
              </>
            )}
          </aside>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="shop-modal-layer" role="presentation">
          <div className="shop-checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <div className="shop-panel-head">
              <div><span>Pagamento con bonifico</span><h2 id="checkout-title">Dati per l’ordine</h2></div>
              <button type="button" onClick={() => setCheckoutOpen(false)} aria-label="Chiudi checkout">×</button>
            </div>

            <div className="shop-checkout-layout">
              <form className="shop-checkout-form" onSubmit={submitOrder}>
                <div className="shop-form-grid">
                  <label className="shop-field shop-field--wide">
                    <span>Azienda *</span>
                    <input value={customer.company} onChange={(event) => updateCustomer('company', event.target.value)} required maxLength="160" />
                  </label>
                  <label className="shop-field">
                    <span>Partita IVA *</span>
                    <input value={customer.vatNumber} onChange={(event) => updateCustomer('vatNumber', event.target.value)} required maxLength="32" />
                  </label>
                  <label className="shop-field">
                    <span>Codice fiscale</span>
                    <input value={customer.taxCode} onChange={(event) => updateCustomer('taxCode', event.target.value)} maxLength="32" />
                  </label>
                  <label className="shop-field">
                    <span>Nome e cognome *</span>
                    <input value={customer.fullName} onChange={(event) => updateCustomer('fullName', event.target.value)} required maxLength="140" />
                  </label>
                  <label className="shop-field">
                    <span>Email *</span>
                    <input type="email" value={customer.email} onChange={(event) => updateCustomer('email', event.target.value)} required maxLength="254" />
                  </label>
                  <label className="shop-field">
                    <span>Telefono *</span>
                    <input type="tel" value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} required maxLength="60" />
                  </label>
                  <label className="shop-field shop-field--wide">
                    <span>Indirizzo di consegna *</span>
                    <input value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} required maxLength="220" />
                  </label>
                  <label className="shop-field">
                    <span>Città *</span>
                    <input value={customer.city} onChange={(event) => updateCustomer('city', event.target.value)} required maxLength="120" />
                  </label>
                  <label className="shop-field shop-field--small">
                    <span>CAP *</span>
                    <input value={customer.postalCode} onChange={(event) => updateCustomer('postalCode', event.target.value)} required maxLength="16" />
                  </label>
                  <label className="shop-field shop-field--small">
                    <span>Provincia</span>
                    <input value={customer.province} onChange={(event) => updateCustomer('province', event.target.value)} maxLength="60" />
                  </label>
                  <label className="shop-field">
                    <span>Paese *</span>
                    <input value={customer.country} onChange={(event) => updateCustomer('country', event.target.value)} required maxLength="80" />
                  </label>
                  <label className="shop-field shop-field--wide">
                    <span>Note</span>
                    <textarea value={customer.notes} onChange={(event) => updateCustomer('notes', event.target.value)} rows="3" maxLength="2000" />
                  </label>
                  <label className="shop-honeypot" aria-hidden="true">
                    Sito web
                    <input tabIndex="-1" autoComplete="off" value={customer.website} onChange={(event) => updateCustomer('website', event.target.value)} />
                  </label>
                </div>

                <label className="shop-privacy-check">
                  <input type="checkbox" checked={customer.privacyAccepted} onChange={(event) => updateCustomer('privacyAccepted', event.target.checked)} required />
                  <span>Ho letto e accetto l’<Link to="/termini-e-privacy" target="_blank">informativa privacy</Link> e autorizzo il trattamento dei dati per la gestione dell’ordine.</span>
                </label>

                {error ? <div className="shop-message shop-message--error">{error}</div> : null}

                <button type="submit" className="shop-primary-button shop-full-button" disabled={submitting}>
                  {submitting ? 'Registrazione ordine...' : `Conferma e ordina — ${formatMoney(totals.total, locale)}`}
                </button>
                <p className="shop-submit-note">Nessun addebito online: riceverai i dati per il bonifico dopo la conferma.</p>
              </form>

              <aside className="shop-checkout-summary">
                <h3>Riepilogo</h3>
                {cartItems.map((item) => (
                  <div className="shop-summary-line" key={item.id}>
                    <span>{item.quantity} × {item.name}</span>
                    <strong>{formatMoney(Number(item.price) * (1 + Number(item.vat_rate || 0) / 100) * item.quantity, locale)}</strong>
                  </div>
                ))}
                <OrderTotals totals={totals} locale={locale} />
              </aside>
            </div>
          </div>
        </div>
      ) : null}

      {confirmation ? (
        <div className="shop-modal-layer" role="presentation">
          <div className="shop-confirmation" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
            <span className="shop-confirmation__icon">✓</span>
            <span className="shop-kicker">Ordine registrato</span>
            <h2 id="confirmation-title">Grazie, ordine {confirmation.order_number}</h2>
            <p>La richiesta è stata registrata e inviata al nostro ufficio commerciale.{confirmation.customer_email_sent ? ' Ti abbiamo inviato anche una conferma via email.' : ''}</p>

            <div className="shop-bank-box">
              <span>Pagamento tramite bonifico</span>
              <dl>
                <div><dt>Intestatario</dt><dd>{confirmation.bank?.account_holder || 'Idealtech s.r.l.'}</dd></div>
                <div><dt>IBAN</dt><dd data-no-translate>{confirmation.bank?.iban || 'Contattare il commerciale'}</dd></div>
                {confirmation.bank?.bic ? <div><dt>BIC / SWIFT</dt><dd data-no-translate>{confirmation.bank.bic}</dd></div> : null}
                <div><dt>Causale</dt><dd>Ordine {confirmation.order_number}</dd></div>
                <div><dt>Importo</dt><dd>{formatMoney(confirmation.total, locale)}</dd></div>
              </dl>
              {confirmation.bank?.instructions ? <p>{confirmation.bank.instructions}</p> : null}
            </div>

            {!confirmation.email_sent ? (
              <div className="shop-message shop-message--warning">L’ordine è salvato correttamente. Il commerciale lo vedrà nel pannello anche se la notifica email non è partita.</div>
            ) : null}

            {!confirmation.customer_email_sent ? (
              <div className="shop-message shop-message--warning">L’ordine è confermato, ma non è stato possibile inviare la copia via email. Conserva il numero ordine indicato sopra.</div>
            ) : null}

            <button type="button" className="shop-primary-button" onClick={() => setConfirmation(null)}>Chiudi</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function OrderTotals({ totals, locale }) {
  return (
    <div className="shop-totals">
      <div><span>Imponibile</span><strong>{formatMoney(totals.net, locale)}</strong></div>
      <div><span>IVA</span><strong>{formatMoney(totals.vat, locale)}</strong></div>
      <div><span>Spedizione (IVA incl.)</span><strong>{totals.shipping ? formatMoney(totals.shipping, locale) : 'Gratuita'}</strong></div>
      <div className="shop-totals__grand"><span>Totale</span><strong>{formatMoney(totals.total, locale)}</strong></div>
    </div>
  )
}
