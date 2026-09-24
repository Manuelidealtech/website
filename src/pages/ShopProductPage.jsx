import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatMoney, getProductAvailability } from '../lib/shop'
import { normalizeProductImages } from '../lib/shopImages'
import { useLanguage } from '../i18n/LanguageContext'
import '../styles/ShopProductPage.css'

const CART_KEY = 'idealtech-shop-cart-v1'

function readCart() {
  try {
    const value = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export default function ShopProductPage() {
  const { productId } = useParams()
  const { locale } = useLanguage()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProduct() {
      setLoading(true)
      setError('')
      try {
        const { data, error: productError } = await supabase
          .from('shop_products')
          .select('*')
          .eq('id', productId)
          .eq('is_published', true)
          .single()

        if (productError) throw productError
        if (active) setProduct(data)
      } catch {
        if (active) setError('Prodotto non disponibile o non più pubblicato.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProduct()
    return () => { active = false }
  }, [productId])

  const images = useMemo(() => normalizeProductImages(product), [product])
  const availability = product ? getProductAvailability(product) : { available: false, label: '' }
  const maxQuantity = product?.track_stock ? Math.max(1, Number(product.stock_quantity || 0)) : 99
  const grossPrice = product ? Number(product.price) * (1 + Number(product.vat_rate || 0) / 100) : 0

  useEffect(() => {
    if (selectedImage >= images.length) setSelectedImage(0)
  }, [images.length, selectedImage])

  useEffect(() => {
    if (!lightboxOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false)
        return
      }

      if (event.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      }

      if (event.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [images.length, lightboxOpen])

  function addToCart() {
    if (!product || !availability.available) return

    const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, maxQuantity))
    const cart = readCart()
    const existing = cart.find((item) => item.id === product.id)
    const nextCart = existing
      ? cart.map((item) => item.id === product.id
          ? { ...item, quantity: Math.min(Number(item.quantity || 0) + safeQuantity, maxQuantity) }
          : item)
      : [...cart, { id: product.id, quantity: safeQuantity }]

    window.localStorage.setItem(CART_KEY, JSON.stringify(nextCart))
    setAdded(true)
    window.setTimeout(() => setAdded(false), 3500)
  }

  function showPreviousImage() {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  function showNextImage() {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  function openLightbox(index = selectedImage) {
    setSelectedImage(index)
    setLightboxOpen(true)
  }

  if (loading) {
    return <main className="shop-product-page site-container"><div className="shop-product-state">Caricamento prodotto...</div></main>
  }

  if (error || !product) {
    return (
      <main className="shop-product-page site-container">
        <div className="shop-product-state">
          <h1>Prodotto non disponibile</h1>
          <p>{error}</p>
          <Link className="shop-product-back-button" to="/shop">← Torna allo shop</Link>
        </div>
      </main>
    )
  }

  const currentImage = images[selectedImage]

  return (
    <main className="shop-product-page">
      <div className="site-container">
        <nav className="shop-product-breadcrumb" aria-label="Percorso">
          <Link to="/shop">Shop</Link>
          <span>›</span>
          {product.category ? <><span>{product.category}</span><span>›</span></> : null}
          <strong>{product.name}</strong>
        </nav>

        <section className="shop-product-detail">
          <div className="shop-product-gallery">
            {images.length > 1 ? (
              <div className="shop-product-thumbs" aria-label="Foto prodotto">
                {images.map((image, index) => (
                  <button
                    type="button"
                    className={selectedImage === index ? 'is-active' : ''}
                    key={image.path || image.url}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Mostra foto ${index + 1}`}
                  >
                    <img src={image.url} alt="" loading={index > 2 ? 'lazy' : 'eager'} />
                  </button>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              className="shop-product-main-image"
              onClick={() => currentImage?.url && openLightbox(selectedImage)}
              aria-label={currentImage?.url ? 'Apri immagine in grande' : 'Immagine prodotto'}
            >
              {currentImage?.url
                ? <img src={currentImage.url} alt={`${product.name} - foto ${selectedImage + 1}`} />
                : <div className="shop-product-main-placeholder">Idealtech</div>}
              {currentImage?.url ? <span className="shop-product-zoom-hint">Tocca per ingrandire</span> : null}
            </button>
          </div>

          <div className="shop-product-info">
            {product.category ? <span className="shop-product-detail-category">{product.category}</span> : null}
            <h1>{product.name}</h1>
            {product.sku ? <p className="shop-product-detail-sku">Codice prodotto: <strong>{product.sku}</strong></p> : null}
            <div className="shop-product-detail-price">
              <strong>{formatMoney(grossPrice, locale)}</strong>
              <span>IVA inclusa</span>
            </div>

            <div className={`shop-product-detail-availability ${availability.available ? '' : 'is-empty'}`}>
              <span className="shop-product-detail-dot" />
              {availability.label}
            </div>
          </div>

          <aside className="shop-product-buybox">
            <span className="shop-product-buybox-label">Acquisto diretto Idealtech</span>
            <strong className="shop-product-buybox-price">{formatMoney(grossPrice, locale)}</strong>
            <span className={`shop-product-buybox-stock ${availability.available ? '' : 'is-empty'}`}>{availability.label}</span>

            {availability.available ? (
              <label className="shop-product-quantity">
                <span>Quantità</span>
                <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {Array.from({ length: Math.min(maxQuantity, 99) }, (_, index) => index + 1).map((value) => (
                    <option value={value} key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <button type="button" className="shop-product-add-button" disabled={!availability.available} onClick={addToCart}>
              {availability.available ? 'Aggiungi al carrello' : 'Prodotto esaurito'}
            </button>

            {added ? <div className="shop-product-added">✓ Prodotto aggiunto al carrello</div> : null}
            <Link className="shop-product-view-cart" to="/shop">Vai allo shop e al carrello →</Link>

            <div className="shop-product-buybox-notes">
              <div><strong>Pagamento</strong><span>Tramite bonifico bancario</span></div>
              <div><strong>Assistenza</strong><span>Supporto Idealtech prima e dopo l’acquisto</span></div>
            </div>
          </aside>
        </section>

        <section className="shop-product-full-description">
          <span>Dettagli prodotto</span>
          <h2>Descrizione completa</h2>
          {product.description
            ? <p>{product.description}</p>
            : <p>Nessuna descrizione aggiuntiva disponibile per questo prodotto.</p>}
        </section>
      </div>

      {lightboxOpen && currentImage?.url ? (
        <div className="shop-product-lightbox" role="dialog" aria-modal="true" aria-label="Galleria immagini prodotto">
          <button
            type="button"
            className="shop-product-lightbox-backdrop"
            aria-label="Chiudi galleria"
            onClick={() => setLightboxOpen(false)}
          />

          <div className="shop-product-lightbox-dialog">
            <button
              type="button"
              className="shop-product-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label="Chiudi"
            >
              ×
            </button>

            {images.length > 1 ? (
              <button
                type="button"
                className="shop-product-lightbox-nav is-prev"
                onClick={showPreviousImage}
                aria-label="Immagine precedente"
              >
                ‹
              </button>
            ) : null}

            <div className="shop-product-lightbox-stage">
              <div className="shop-product-lightbox-image-frame">
                <img src={currentImage.url} alt={`${product.name} - immagine ${selectedImage + 1}`} className="shop-product-lightbox-image" />
              </div>
              <div className="shop-product-lightbox-meta">
                <strong>{product.name}</strong>
                <span>{selectedImage + 1} / {images.length}</span>
              </div>
            </div>

            {images.length > 1 ? (
              <button
                type="button"
                className="shop-product-lightbox-nav is-next"
                onClick={showNextImage}
                aria-label="Immagine successiva"
              >
                ›
              </button>
            ) : null}

            {images.length > 1 ? (
              <div className="shop-product-lightbox-thumbs" aria-label="Miniature immagini prodotto">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.path || image.url}
                    className={selectedImage === index ? 'is-active' : ''}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Apri immagine ${index + 1}`}
                  >
                    <img src={image.url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  )
}
