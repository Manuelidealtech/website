import { Link } from 'react-router-dom'
import ProductGallery from './ProductGallery'
import { useSiteContent } from '../context/SiteContentContext'
import { defaultProductCards, defaultProductGalleries } from '../lib/siteContentDefaults'
import { defaultProductDetailCommon, defaultProductPageDetails } from '../lib/productPageDefaults'

function ProductSection({ section, drumVariant = false }) {
  const sectionClass = drumVariant ? 'drum-line-section' : 'product-detail-section'
  const labelClass = drumVariant ? 'drum-line-section__label' : 'product-detail-section__label'
  const listClass = drumVariant
    ? 'drum-line-features'
    : 'product-detail-features product-detail-features--compact'

  return (
    <div className={sectionClass}>
      <span className={labelClass}>{section.label}</span>

      {(section.paragraphs || []).map((paragraph, index) => (
        <p key={`${section.label}-paragraph-${index}`}>{paragraph}</p>
      ))}

      {(section.groups || []).map((group, groupIndex) => {
        const hasWrapper = !drumVariant && Boolean(group.title || (group.paragraphs || []).length)
        const content = (
          <>
            {group.title ? <h3>{group.title}</h3> : null}
            {(group.paragraphs || []).map((paragraph, index) => (
              <p key={`${section.label}-group-${groupIndex}-paragraph-${index}`}>{paragraph}</p>
            ))}
            {(group.items || []).length ? (
              <ul className={listClass}>
                {group.items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
              </ul>
            ) : null}
          </>
        )

        return hasWrapper
          ? <div className="product-detail-subgroup" key={`${section.label}-group-${groupIndex}`}>{content}</div>
          : <div key={`${section.label}-group-${groupIndex}`}>{content}</div>
      })}
    </div>
  )
}

export default function EditableProductDetailPage({ productId }) {
  const { get } = useSiteContent()
  const allDetails = get('products.details', defaultProductPageDetails) || defaultProductPageDetails
  const page = allDetails[productId] || defaultProductPageDetails[productId]
  const legacyGallery = get(`products.gallery.${productId}`, defaultProductGalleries[productId] || []) || []
  const gallery = Array.isArray(page?.galleryImages) ? page.galleryImages : legacyGallery
  const productCards = (get('products.catalog', defaultProductCards) || defaultProductCards).filter((product) => product.visible !== false && product.slug)

  const common = {
    breadcrumbLabel: get('products.detailCommon.breadcrumbLabel', defaultProductDetailCommon.breadcrumbLabel),
    detailsButton: get('products.detailCommon.detailsButton', defaultProductDetailCommon.detailsButton),
    contactButton: get('products.detailCommon.contactButton', defaultProductDetailCommon.contactButton),
    contactTitle: get('products.detailCommon.contactTitle', defaultProductDetailCommon.contactTitle),
    contactLinkLabel: get('products.detailCommon.contactLinkLabel', defaultProductDetailCommon.contactLinkLabel),
    productsTitle: get('products.detailCommon.productsTitle', defaultProductDetailCommon.productsTitle),
  }

  if (!page) return null

  const drumVariant = productId === 'drum-line'
  const cls = drumVariant ? {
    page: 'drum-line-page',
    hero: 'drum-line-hero',
    heroContent: 'drum-line-hero__content',
    breadcrumbs: 'drum-line-breadcrumbs',
    kicker: 'drum-line-kicker',
    actions: 'drum-line-hero__actions',
    primaryButton: 'drum-line-btn drum-line-btn--primary',
    secondaryButton: 'drum-line-btn drum-line-btn--secondary',
    main: 'drum-line-main',
    grid: 'site-container drum-line-main__grid',
    content: 'drum-line-content',
    sidebar: 'drum-line-sidebar',
    sidebarCard: 'drum-line-sidebar__card',
    sidebarLink: 'drum-line-sidebar__link',
    gallerySection: 'drum-line-section',
    galleryLabel: 'drum-line-section__label',
  } : {
    page: 'product-detail-page',
    hero: 'product-detail-hero',
    heroContent: 'product-detail-hero__content',
    breadcrumbs: 'product-detail-breadcrumbs',
    kicker: 'product-detail-kicker',
    actions: 'product-detail-hero__actions',
    primaryButton: 'product-detail-btn product-detail-btn--primary',
    secondaryButton: 'product-detail-btn product-detail-btn--secondary',
    main: 'product-detail-main',
    grid: 'site-container product-detail-main__grid',
    content: 'product-detail-content',
    sidebar: 'product-detail-sidebar',
    sidebarCard: 'product-detail-sidebar__card',
    sidebarLink: 'product-detail-sidebar__link',
    gallerySection: 'product-detail-section',
    galleryLabel: 'product-detail-section__label',
  }

  return (
    <div className={cls.page}>
      <section className={cls.hero}>
        <div className="site-container">
          <div className={cls.heroContent}>
            <div className={cls.breadcrumbs}>
              <Link to="/prodotti">{common.breadcrumbLabel}</Link>
              <span>/</span>
              <span>{page.name || page.kicker || page.title}</span>
            </div>

            <span className={cls.kicker}>{page.kicker}</span>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>

            <div className={cls.actions}>
              <a href="#dettagli" className={cls.primaryButton}>{common.detailsButton}</a>
              <Link to="/contatti" className={cls.secondaryButton}>{common.contactButton}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={cls.main} id="dettagli">
        <div className={cls.grid}>
          <div className={cls.content}>
            {(page.sections || []).map((section, index) => (
              <ProductSection key={`${section.label}-${index}`} section={section} drumVariant={drumVariant} />
            ))}

            <div className={cls.gallerySection}>
              <span className={cls.galleryLabel}>{page.galleryLabel || 'Galleria prodotto'}</span>
              <ProductGallery images={gallery} title={page.name || page.title} />
            </div>
          </div>

          <aside className={cls.sidebar}>
            <div className={cls.sidebarCard}>
              <h3>{common.contactTitle}</h3>
              <Link to="/contatti" className={cls.sidebarLink}>{common.contactLinkLabel}</Link>
            </div>

            <div className={cls.sidebarCard}>
              <h3>{common.productsTitle}</h3>
              <ul className="product-detail-sidebar__menu">
                {productCards.map((product) => (
                  <li key={product.id}><Link to={product.slug}>{product.title || product.subtitle}</Link></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
