import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatMoney } from '../lib/shop'
import { getLocalizedAvailability, getLocalizedShopProduct, shopT } from '../i18n/shopTranslations'
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
  const { language, locale } = useLanguage()
  const t = (key, variables) => shopT(language, key, variables)
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
        if (active) setError(t('productUnavailableError'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProduct()
    return () => { active = false }
  }, [productId])

  const displayProduct = useMemo(() => getLocalizedShopProduct(product, language), [product, language])
  const images = useMemo(() => normalizeProductImages(product), [product])
  const availability = product ? getLocalizedAvailability(product, language) : { available: false, label: '' }
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
    return <main className="shop-product-page site-container"><div className="shop-product-state">{t('loadingProduct')}</div></main>
  }

  if (error || !product) {
    return (
      <main className="shop-product-page site-container">
        <div className="shop-product-state">
          <h1>{t('productUnavailable')}</h1>
          <p>{error}</p>
          <Link className="shop-product-back-button" to="/shop">{t('backToShop')}</Link>
        </div>
      </main>
    )
  }

  const currentImage = images[selectedImage]

  return (
    <main className="shop-product-page">
      <div className="site-container">
        <nav className="shop-product-breadcrumb" aria-label={t('path')}>
          <Link to="/shop">Shop</Link>
          <span>›</span>
          {displayProduct.category ? <><span>{displayProduct.category}</span><span>›</span></> : null}
          <strong>{displayProduct.name}</strong>
        </nav>

        <section className="shop-product-detail">
          <div className="shop-product-gallery">
            {images.length > 1 ? (
              <div className="shop-product-thumbs" aria-label={t('productPhotos')}>
                {images.map((image, index) => (
                  <button
                    type="button"
                    className={selectedImage === index ? 'is-active' : ''}
                    key={image.path || image.url}
                    onClick={() => setSelectedImage(index)}
                    aria-label={t('showPhoto', { number: index + 1 })}
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
              aria-label={currentImage?.url ? t('openLargeImage') : t('productImage')}
            >
              {currentImage?.url
                ? <img src={currentImage.url} alt={t('productPhotoAlt', { name: displayProduct.name, number: selectedImage + 1 })} />
                : <div className="shop-product-main-placeholder">Idealtech</div>}
              {currentImage?.url ? <span className="shop-product-zoom-hint">{t('tapToZoom')}</span> : null}
            </button>
          </div>

          <div className="shop-product-info">
            {displayProduct.category ? <span className="shop-product-detail-category">{displayProduct.category}</span> : null}
            <h1>{displayProduct.name}</h1>
            {product.sku ? <p className="shop-product-detail-sku">{t('productCode')} <strong>{product.sku}</strong></p> : null}
            <div className="shop-product-detail-price">
              <strong>{formatMoney(grossPrice, locale)}</strong>
              <span>{t('vatIncluded')}</span>
            </div>

            <div className={`shop-product-detail-availability ${availability.available ? '' : 'is-empty'}`}>
              <span className="shop-product-detail-dot" />
              {availability.label}
            </div>
          </div>

          <aside className="shop-product-buybox">
            <span className="shop-product-buybox-label">{t('directPurchase')}</span>
            <strong className="shop-product-buybox-price">{formatMoney(grossPrice, locale)}</strong>
            <span className={`shop-product-buybox-stock ${availability.available ? '' : 'is-empty'}`}>{availability.label}</span>

            {availability.available ? (
              <label className="shop-product-quantity">
                <span>{t('quantity')}</span>
                <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {Array.from({ length: Math.min(maxQuantity, 99) }, (_, index) => index + 1).map((value) => (
                    <option value={value} key={value}>{value}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <button type="button" className="shop-product-add-button" disabled={!availability.available} onClick={addToCart}>
              {availability.available ? t('addToCart') : t('productSoldOut')}
            </button>

            {added ? <div className="shop-product-added">{t('addedToCart')}</div> : null}
            <Link className="shop-product-view-cart" to="/shop">{t('goToShopCart')}</Link>

            <div className="shop-product-buybox-notes">
              <div><strong>{t('payment')}</strong><span>{t('bankTransfer')}</span></div>
              <div><strong>{t('assistance')}</strong><span>{t('idealtechSupportCopy')}</span></div>
            </div>
          </aside>
        </section>

        <section className="shop-product-full-description">
          <span>{t('productDetails')}</span>
          <h2>{t('fullDescription')}</h2>
          {displayProduct.description
            ? <p>{displayProduct.description}</p>
            : <p>{t('noDescription')}</p>}
        </section>
      </div>

      {lightboxOpen && currentImage?.url ? (
        <div className="shop-product-lightbox" role="dialog" aria-modal="true" aria-label={t('productGallery')}>
          <button
            type="button"
            className="shop-product-lightbox-backdrop"
            aria-label={t('closeGallery')}
            onClick={() => setLightboxOpen(false)}
          />

          <div className="shop-product-lightbox-dialog">
            <button
              type="button"
              className="shop-product-lightbox-close"
              onClick={() => setLightboxOpen(false)}
              aria-label={t('close')}
            >
              ×
            </button>

            {images.length > 1 ? (
              <button
                type="button"
                className="shop-product-lightbox-nav is-prev"
                onClick={showPreviousImage}
                aria-label={t('previousImage')}
              >
                ‹
              </button>
            ) : null}

            <div className="shop-product-lightbox-stage">
              <div className="shop-product-lightbox-image-frame">
                <img src={currentImage.url} alt={t('productImageAlt', { name: displayProduct.name, number: selectedImage + 1 })} className="shop-product-lightbox-image" />
              </div>
              <div className="shop-product-lightbox-meta">
                <strong>{displayProduct.name}</strong>
                <span>{selectedImage + 1} / {images.length}</span>
              </div>
            </div>

            {images.length > 1 ? (
              <button
                type="button"
                className="shop-product-lightbox-nav is-next"
                onClick={showNextImage}
                aria-label={t('nextImage')}
              >
                ›
              </button>
            ) : null}

            {images.length > 1 ? (
              <div className="shop-product-lightbox-thumbs" aria-label={t('imageThumbnails')}>
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.path || image.url}
                    className={selectedImage === index ? 'is-active' : ''}
                    onClick={() => setSelectedImage(index)}
                    aria-label={t('openImage', { number: index + 1 })}
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
