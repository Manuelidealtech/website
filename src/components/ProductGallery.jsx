import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'
import './ProductGallery.css'

export default function ProductGallery({ images = [], title = 'Prodotto' }) {
  const { get } = useSiteContent()
  const location = useLocation()
  const productSlug = location.pathname.startsWith('/prodotti/')
    ? location.pathname.split('/').filter(Boolean).pop()
    : ''
  const cmsImages = productSlug ? get(`products.gallery.${productSlug}`, images) : images
  const validImages = useMemo(() => (Array.isArray(cmsImages) ? cmsImages : images).filter(Boolean), [cmsImages, images])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [cmsImages])

  if (!validImages.length) return null

  const goPrev = () => setSelectedIndex((prev) => prev === 0 ? validImages.length - 1 : prev - 1)
  const goNext = () => setSelectedIndex((prev) => prev === validImages.length - 1 ? 0 : prev + 1)

  return (
    <div className="product-gallery-v2">
      <div className="product-gallery-v2__viewer">
        <div className="product-gallery-v2__main" aria-label={`Immagine ${selectedIndex + 1}`}>
          <img src={validImages[selectedIndex]} alt={`${title} ${selectedIndex + 1}`} loading="eager" />
        </div>

        {validImages.length > 1 && (
          <>
            <button type="button" className="product-gallery-v2__arrow product-gallery-v2__arrow--prev" onClick={goPrev} aria-label="Immagine precedente">‹</button>
            <button type="button" className="product-gallery-v2__arrow product-gallery-v2__arrow--next" onClick={goNext} aria-label="Immagine successiva">›</button>
          </>
        )}
      </div>

      {validImages.length > 1 && (
        <div className="product-gallery-v2__thumbs">
          {validImages.map((image, index) => (
            <button key={`${image}-${index}`} type="button" className={`product-gallery-v2__thumb ${index === selectedIndex ? 'is-active' : ''}`} onClick={() => setSelectedIndex(index)} aria-label={`Seleziona immagine ${index + 1}`}>
              <img src={image} alt={`${title} miniatura ${index + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <div className="product-gallery-v2__meta">
        <span>{title} — {selectedIndex + 1} / {validImages.length}</span>
      </div>
    </div>
  )
}
