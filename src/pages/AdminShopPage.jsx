/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ORDER_STATUSES, formatMoney, getOrderStatusLabel } from '../lib/shop'
import { removeShopProductImage, uploadShopProductImage } from '../lib/shopStorage'
import AdminLayout from '../components/AdminLayout'
import FileUploadField from '../components/FileUploadField'
import '../styles/AdminShopPage.css'

const emptyProduct = {
  id: null,
  sku: '',
  name: '',
  category: '',
  description: '',
  price: '',
  vat_rate: 22,
  track_stock: false,
  stock_quantity: 0,
  is_published: false,
  image_url: '',
  image_path: '',
}

const emptySettings = {
  shop_enabled: true,
  commercial_email: '',
  shipping_cost: 0,
  bank_account_holder: 'Idealtech s.r.l.',
  bank_name: '',
  bank_iban: '',
  bank_bic: '',
  bank_instructions: 'Indicare il numero d’ordine nella causale del bonifico.',
}

export default function AdminShopPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [orderFilter, setOrderFilter] = useState('open')
  const [orderSearch, setOrderSearch] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [productModal, setProductModal] = useState(false)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [productFile, setProductFile] = useState(null)
  const [savingProduct, setSavingProduct] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  async function loadData(showLoader = true) {
    if (showLoader) setLoading(true)
    setError('')

    try {
      const [productsResult, ordersResult, settingsResult] = await Promise.all([
        supabase.from('shop_products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('shop_orders').select('*, shop_order_items(*)').order('created_at', { ascending: false }),
        supabase.from('shop_settings').select('*').eq('id', 1).single(),
      ])

      const firstError = productsResult.error || ordersResult.error || settingsResult.error
      if (firstError) throw new Error(firstError.message)

      setProducts(productsResult.data || [])
      setOrders(ordersResult.data || [])
      setSettings({ ...emptySettings, ...(settingsResult.data || {}) })
    } catch (loadError) {
      const missingTables = /shop_products|shop_orders|shop_settings|relation/i.test(loadError.message || '')
      setError(missingTables
        ? 'Il database dello shop non è ancora configurato. Esegui il file SUPABASE_SHOP_ECOMMERCE.sql nel SQL Editor di Supabase.'
        : loadError.message || 'Errore nel caricamento dello shop.')
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stats = useMemo(() => ({
    open: orders.filter((order) => ['new', 'awaiting_payment'].includes(order.status)).length,
    paid: orders.filter((order) => order.status === 'paid').length,
    products: products.length,
    published: products.filter((product) => product.is_published).length,
  }), [orders, products])

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase()
    return orders.filter((order) => {
      const statusMatch = orderFilter === 'all'
        || (orderFilter === 'open' && ['new', 'awaiting_payment'].includes(order.status))
        || order.status === orderFilter
      const searchMatch = !query || [order.order_number, order.company, order.full_name, order.email]
        .some((value) => String(value || '').toLowerCase().includes(query))
      return statusMatch && searchMatch
    })
  }, [orderFilter, orderSearch, orders])

  function showMessage(value) {
    setMessage(value)
    window.setTimeout(() => setMessage(''), 3500)
  }

  async function updateOrder(orderId, payload, successText) {
    setError('')
    const { error: updateError } = await supabase.from('shop_orders').update(payload).eq('id', orderId)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...payload } : order))
    if (successText) showMessage(successText)
  }

  function openNewProduct() {
    setProductForm(emptyProduct)
    setProductFile(null)
    setProductModal(true)
  }

  function openEditProduct(product) {
    setProductForm({
      ...emptyProduct,
      ...product,
      sku: product.sku || '',
      category: product.category || '',
      description: product.description || '',
      image_url: product.image_url || '',
      image_path: product.image_path || '',
    })
    setProductFile(null)
    setProductModal(true)
  }

  function updateProductField(name, value) {
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSavingProduct(true)
    setError('')

    try {
      if (!productForm.name.trim()) throw new Error('Il nome prodotto è obbligatorio.')
      if (productForm.price === '' || Number(productForm.price) < 0) throw new Error('Inserisci un prezzo valido.')

      let imageUrl = productForm.image_url || null
      let imagePath = productForm.image_path || null

      if (productFile) {
        const uploaded = await uploadShopProductImage({
          file: productFile,
          userId: user.id,
          productId: productForm.id || 'new',
        })
        imageUrl = uploaded.imageUrl
        imagePath = uploaded.imagePath
      }

      const payload = {
        sku: String(productForm.sku || '').trim() || null,
        name: productForm.name.trim(),
        category: String(productForm.category || '').trim() || null,
        description: String(productForm.description || '').trim() || null,
        price: Number(productForm.price),
        vat_rate: Number(productForm.vat_rate || 0),
        track_stock: Boolean(productForm.track_stock),
        stock_quantity: productForm.track_stock ? Math.max(0, Number(productForm.stock_quantity || 0)) : 0,
        is_published: Boolean(productForm.is_published),
        image_url: imageUrl,
        image_path: imagePath,
      }

      if (productForm.id) {
        const oldImagePath = productForm.image_path
        const { error: updateError } = await supabase.from('shop_products').update(payload).eq('id', productForm.id)
        if (updateError) throw new Error(updateError.message)
        if (productFile && oldImagePath && oldImagePath !== imagePath) {
          await removeShopProductImage(oldImagePath).catch(() => {})
        }
        showMessage('Prodotto aggiornato.')
      } else {
        const maxOrder = products.reduce((max, item) => Math.max(max, Number(item.sort_order || 0)), -1)
        const { error: insertError } = await supabase.from('shop_products').insert({
          ...payload,
          sort_order: maxOrder + 1,
          created_by: user.id,
        })
        if (insertError) throw new Error(insertError.message)
        showMessage('Prodotto creato.')
      }

      setProductModal(false)
      await loadData(false)
    } catch (saveError) {
      setError(saveError.message || 'Errore durante il salvataggio del prodotto.')
    } finally {
      setSavingProduct(false)
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Vuoi eliminare “${product.name}”? Se è già presente in un ordine, disattivalo invece di eliminarlo.`)) return

    setError('')
    const { error: deleteError } = await supabase.from('shop_products').delete().eq('id', product.id)
    if (deleteError) {
      setError(deleteError.message.includes('foreign key')
        ? 'Il prodotto è già presente in uno o più ordini e non può essere eliminato. Disattiva “Pubblicato nello shop”.'
        : deleteError.message)
      return
    }

    await removeShopProductImage(product.image_path).catch(() => {})
    setProducts((current) => current.filter((item) => item.id !== product.id))
    showMessage('Prodotto eliminato.')
  }

  async function toggleProduct(product) {
    const nextValue = !product.is_published
    const { error: updateError } = await supabase.from('shop_products').update({ is_published: nextValue }).eq('id', product.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, is_published: nextValue } : item))
  }

  async function saveSettings(event) {
    event.preventDefault()
    setSavingSettings(true)
    setError('')

    try {
      const email = String(settings.commercial_email || '').trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Inserisci un’email commerciale valida.')
      if (!String(settings.bank_iban || '').trim()) throw new Error('Inserisci l’IBAN da mostrare al cliente.')

      const payload = {
        shop_enabled: Boolean(settings.shop_enabled),
        commercial_email: email,
        shipping_cost: Math.max(0, Number(settings.shipping_cost || 0)),
        bank_account_holder: String(settings.bank_account_holder || '').trim(),
        bank_name: String(settings.bank_name || '').trim() || null,
        bank_iban: String(settings.bank_iban || '').replace(/\s+/g, '').toUpperCase(),
        bank_bic: String(settings.bank_bic || '').replace(/\s+/g, '').toUpperCase() || null,
        bank_instructions: String(settings.bank_instructions || '').trim() || null,
        updated_by: user.id,
      }

      const { error: settingsError } = await supabase.from('shop_settings').update(payload).eq('id', 1)
      if (settingsError) throw new Error(settingsError.message)
      setSettings((current) => ({ ...current, ...payload }))
      showMessage('Impostazioni shop salvate.')
    } catch (saveError) {
      setError(saveError.message || 'Errore durante il salvataggio delle impostazioni.')
    } finally {
      setSavingSettings(false)
    }
  }

  const actions = (
    <>
      <a className="admin-secondary-button" href="/shop" target="_blank" rel="noreferrer">Apri shop ↗</a>
      {activeTab === 'products' ? <button className="admin-primary-button" type="button" onClick={openNewProduct}>+ Nuovo prodotto</button> : null}
    </>
  )

  return (
    <AdminLayout
      title="Shop e ordini"
      subtitle="Gestisci il catalogo e-commerce, gli ordini con bonifico e l’indirizzo email del commerciale."
      actions={actions}
    >
      {message ? <div className="shop-admin-message success">{message}</div> : null}
      {error ? <div className="shop-admin-message error">{error}</div> : null}

      <section className="shop-admin-stats">
        <button type="button" onClick={() => { setActiveTab('orders'); setOrderFilter('open') }}><span>Da gestire</span><strong>{stats.open}</strong></button>
        <button type="button" onClick={() => { setActiveTab('orders'); setOrderFilter('paid') }}><span>Pagati</span><strong>{stats.paid}</strong></button>
        <button type="button" onClick={() => setActiveTab('products')}><span>Prodotti</span><strong>{stats.products}</strong></button>
        <button type="button" onClick={() => setActiveTab('products')}><span>Online</span><strong>{stats.published}</strong></button>
      </section>

      <div className="shop-admin-tabs" role="tablist" aria-label="Sezioni shop">
        <button type="button" className={activeTab === 'orders' ? 'is-active' : ''} onClick={() => setActiveTab('orders')}>Ordini</button>
        <button type="button" className={activeTab === 'products' ? 'is-active' : ''} onClick={() => setActiveTab('products')}>Prodotti</button>
        <button type="button" className={activeTab === 'settings' ? 'is-active' : ''} onClick={() => setActiveTab('settings')}>Impostazioni</button>
      </div>

      {loading ? <div className="admin-panel-card shop-admin-loading">Caricamento shop...</div> : null}

      {!loading && activeTab === 'orders' ? (
        <section className="admin-panel-card shop-admin-card">
          <div className="shop-admin-toolbar">
            <div className="shop-admin-filter-row">
              <select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)} aria-label="Filtra per stato">
                <option value="open">Da gestire</option>
                <option value="all">Tutti gli ordini</option>
                {ORDER_STATUSES.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}
              </select>
              <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Cerca numero, azienda o email..." />
            </div>
            <span>{filteredOrders.length} ordini</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="shop-admin-empty"><h3>Nessun ordine</h3><p>Gli ordini inviati dallo shop compariranno qui.</p></div>
          ) : (
            <div className="shop-order-list">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrder === order.id
                return (
                  <article className={`shop-order-card ${isExpanded ? 'is-expanded' : ''}`} key={order.id}>
                    <div className="shop-order-main">
                      <button type="button" className="shop-order-summary" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                        <span className="shop-order-number">{order.order_number}</span>
                        <span className="shop-order-customer"><strong>{order.company}</strong><small>{order.full_name} · {order.email}</small></span>
                        <span className="shop-order-date">{new Date(order.created_at).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <strong className="shop-order-total">{formatMoney(order.grand_total)}</strong>
                        <span className={`shop-order-status status-${order.status}`}>{getOrderStatusLabel(order.status)}</span>
                        <span className="shop-order-chevron">{isExpanded ? '−' : '+'}</span>
                      </button>
                    </div>

                    {isExpanded ? (
                      <div className="shop-order-details">
                        <div className="shop-order-detail-grid">
                          <div><span>Azienda</span><strong>{order.company}</strong><small>P. IVA {order.vat_number}{order.tax_code ? ` · C.F. ${order.tax_code}` : ''}</small></div>
                          <div><span>Contatto</span><strong>{order.full_name}</strong><a href={`mailto:${order.email}`}>{order.email}</a><a href={`tel:${order.phone}`}>{order.phone}</a></div>
                          <div><span>Consegna</span><strong>{order.address}</strong><small>{order.postal_code} {order.city} {order.province || ''}<br />{order.country}</small></div>
                          <div><span>Notifica commerciale</span><strong>{order.email_sent_at ? 'Email inviata' : 'Email non inviata'}</strong><small>{order.email_sent_at ? new Date(order.email_sent_at).toLocaleString('it-IT') : order.email_error || 'Nessun dettaglio'}</small></div>
                        </div>

                        <div className="shop-order-products">
                          {(order.shop_order_items || []).map((item) => (
                            <div key={item.id}>
                              <span><strong>{item.quantity} × {item.product_name}</strong>{item.sku ? <small>Cod. {item.sku}</small> : null}</span>
                              <strong>{formatMoney(item.line_total)}</strong>
                            </div>
                          ))}
                          <div className="shop-order-products__total"><span>Totale ordine</span><strong>{formatMoney(order.grand_total)}</strong></div>
                        </div>

                        {order.notes ? <div className="shop-order-customer-notes"><span>Note cliente</span><p>{order.notes}</p></div> : null}

                        <div className="shop-order-controls">
                          <label>
                            <span>Stato ordine</span>
                            <select value={order.status} onChange={(event) => updateOrder(order.id, { status: event.target.value }, 'Stato ordine aggiornato.')}>
                              {ORDER_STATUSES.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}
                            </select>
                          </label>
                          <label className="shop-order-internal-note">
                            <span>Note interne</span>
                            <textarea
                              value={order.internal_notes || ''}
                              onChange={(event) => setOrders((current) => current.map((item) => item.id === order.id ? { ...item, internal_notes: event.target.value } : item))}
                              onBlur={(event) => updateOrder(order.id, { internal_notes: event.target.value.trim() || null }, 'Note interne salvate.')}
                              placeholder="Annotazioni visibili solo nell’area admin..."
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      ) : null}

      {!loading && activeTab === 'products' ? (
        <section className="admin-panel-card shop-admin-card">
          <div className="shop-admin-section-head">
            <div><span>Catalogo</span><h2>Prodotti dello shop</h2></div>
            <button className="admin-primary-button" type="button" onClick={openNewProduct}>+ Nuovo prodotto</button>
          </div>

          {products.length === 0 ? (
            <div className="shop-admin-empty"><h3>Nessun prodotto</h3><p>Crea il primo prodotto da pubblicare nello shop.</p></div>
          ) : (
            <div className="shop-product-admin-list">
              {products.map((product) => (
                <article className="shop-product-admin-row" key={product.id}>
                  <div className="shop-product-admin-image">
                    {product.image_url ? <img src={product.image_url} alt="" /> : <span>IT</span>}
                  </div>
                  <div className="shop-product-admin-copy">
                    <span>{product.sku || 'Senza codice'}{product.category ? ` · ${product.category}` : ''}</span>
                    <h3>{product.name}</h3>
                    <small>{product.track_stock ? `${product.stock_quantity} disponibili` : 'Giacenza non tracciata'}</small>
                  </div>
                  <div className="shop-product-admin-price">
                    <strong>{formatMoney(Number(product.price) * (1 + Number(product.vat_rate || 0) / 100))}</strong>
                    <small>IVA inclusa</small>
                  </div>
                  <button type="button" className={`shop-publish-toggle ${product.is_published ? 'is-on' : ''}`} onClick={() => toggleProduct(product)}>
                    {product.is_published ? 'Online' : 'Bozza'}
                  </button>
                  <div className="shop-product-admin-actions">
                    <button type="button" onClick={() => openEditProduct(product)}>Modifica</button>
                    <button type="button" className="danger" onClick={() => deleteProduct(product)}>Elimina</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {!loading && activeTab === 'settings' ? (
        <form className="shop-settings-grid" onSubmit={saveSettings}>
          <section className="admin-panel-card shop-settings-card">
            <div className="shop-admin-section-head"><div><span>Notifiche</span><h2>Email commerciale</h2></div></div>
            <p className="shop-settings-intro">Ogni nuovo ordine verrà inviato a questo indirizzo e resterà comunque salvato nella scheda Ordini.</p>
            <label className="shop-admin-field">
              <span>Email destinataria *</span>
              <input type="email" value={settings.commercial_email} onChange={(event) => setSettings((current) => ({ ...current, commercial_email: event.target.value }))} required />
            </label>
            <label className="shop-admin-switch-row">
              <span><strong>Shop attivo</strong><small>Se disattivato non sarà possibile inviare nuovi ordini.</small></span>
              <input type="checkbox" checked={settings.shop_enabled} onChange={(event) => setSettings((current) => ({ ...current, shop_enabled: event.target.checked }))} />
            </label>
            <label className="shop-admin-field">
              <span>Spese di spedizione (IVA inclusa)</span>
              <div className="shop-price-input"><span>€</span><input type="number" min="0" step="0.01" value={settings.shipping_cost} onChange={(event) => setSettings((current) => ({ ...current, shipping_cost: event.target.value }))} /></div>
            </label>
          </section>

          <section className="admin-panel-card shop-settings-card">
            <div className="shop-admin-section-head"><div><span>Pagamento</span><h2>Coordinate per il bonifico</h2></div></div>
            <div className="shop-settings-fields">
              <label className="shop-admin-field"><span>Intestatario *</span><input value={settings.bank_account_holder} onChange={(event) => setSettings((current) => ({ ...current, bank_account_holder: event.target.value }))} required /></label>
              <label className="shop-admin-field"><span>Banca</span><input value={settings.bank_name || ''} onChange={(event) => setSettings((current) => ({ ...current, bank_name: event.target.value }))} /></label>
              <label className="shop-admin-field shop-admin-field--wide"><span>IBAN *</span><input data-no-translate value={settings.bank_iban || ''} onChange={(event) => setSettings((current) => ({ ...current, bank_iban: event.target.value }))} required /></label>
              <label className="shop-admin-field"><span>BIC / SWIFT</span><input data-no-translate value={settings.bank_bic || ''} onChange={(event) => setSettings((current) => ({ ...current, bank_bic: event.target.value }))} /></label>
              <label className="shop-admin-field shop-admin-field--wide"><span>Istruzioni mostrate al cliente</span><textarea rows="4" value={settings.bank_instructions || ''} onChange={(event) => setSettings((current) => ({ ...current, bank_instructions: event.target.value }))} /></label>
            </div>
          </section>

          <div className="shop-settings-savebar">
            <button type="submit" className="admin-primary-button" disabled={savingSettings}>{savingSettings ? 'Salvataggio...' : 'Salva impostazioni'}</button>
          </div>
        </form>
      ) : null}

      {productModal ? (
        <div className="shop-admin-modal-layer" role="presentation" onMouseDown={() => setProductModal(false)}>
          <div className="shop-admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="shop-admin-modal-head">
              <div><span>Catalogo shop</span><h2 id="product-form-title">{productForm.id ? 'Modifica prodotto' : 'Nuovo prodotto'}</h2></div>
              <button type="button" onClick={() => setProductModal(false)}>×</button>
            </div>
            <form onSubmit={saveProduct}>
              <div className="shop-product-form-grid">
                <label className="shop-admin-field"><span>Nome prodotto *</span><input value={productForm.name} onChange={(event) => updateProductField('name', event.target.value)} required maxLength="180" /></label>
                <label className="shop-admin-field"><span>Codice / SKU</span><input value={productForm.sku || ''} onChange={(event) => updateProductField('sku', event.target.value)} maxLength="80" /></label>
                <label className="shop-admin-field"><span>Categoria</span><input value={productForm.category || ''} onChange={(event) => updateProductField('category', event.target.value)} maxLength="100" /></label>
                <label className="shop-admin-field"><span>Prezzo imponibile *</span><div className="shop-price-input"><span>€</span><input type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => updateProductField('price', event.target.value)} required /></div></label>
                <label className="shop-admin-field"><span>IVA %</span><input type="number" min="0" max="100" step="0.01" value={productForm.vat_rate} onChange={(event) => updateProductField('vat_rate', event.target.value)} /></label>
                <label className="shop-admin-field shop-admin-field--wide"><span>Descrizione</span><textarea rows="4" value={productForm.description || ''} onChange={(event) => updateProductField('description', event.target.value)} maxLength="3000" /></label>
                <div className="shop-admin-field shop-admin-field--wide">
                  <span>Immagine prodotto</span>
                  {productForm.image_url ? <img className="shop-product-form-preview" src={productForm.image_url} alt="Anteprima prodotto" /> : null}
                  <FileUploadField accept="image/*" selectedFiles={productFile ? [productFile] : []} onChange={(event) => setProductFile(event.target.files?.[0] || null)} buttonText="Scegli immagine" />
                </div>
                <label className="shop-admin-switch-row"><span><strong>Traccia giacenza</strong><small>Blocca gli ordini oltre la quantità disponibile.</small></span><input type="checkbox" checked={productForm.track_stock} onChange={(event) => updateProductField('track_stock', event.target.checked)} /></label>
                {productForm.track_stock ? <label className="shop-admin-field"><span>Quantità disponibile</span><input type="number" min="0" step="1" value={productForm.stock_quantity} onChange={(event) => updateProductField('stock_quantity', event.target.value)} /></label> : null}
                <label className="shop-admin-switch-row"><span><strong>Pubblicato nello shop</strong><small>Il prodotto sarà subito ordinabile.</small></span><input type="checkbox" checked={productForm.is_published} onChange={(event) => updateProductField('is_published', event.target.checked)} /></label>
              </div>
              <div className="shop-admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setProductModal(false)}>Annulla</button>
                <button type="submit" className="admin-primary-button" disabled={savingProduct}>{savingProduct ? 'Salvataggio...' : 'Salva prodotto'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}
