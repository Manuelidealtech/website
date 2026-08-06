import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabase'
import {
  DEFAULT_OG_IMAGE,
  defaultSeoPages,
  findDefaultSeo,
  SITE_NAME,
  SITE_ORIGIN,
} from '../lib/seoDefaults'
import { getSeoCache, getSeoPromise, setSeoCache, setSeoPromise } from '../lib/seoCache'

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`
const WEBSITE_ID = `${SITE_ORIGIN}/#website`
const STRUCTURED_DATA_ID = 'idealtech-page-structured-data'

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value)
  })
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

function setJsonLd(id, value) {
  let element = document.head.querySelector(`#${id}`)

  if (!element) {
    element = document.createElement('script')
    element.id = id
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(value)
}

function toAbsoluteUrl(value, origin) {
  if (!value) return `${origin}${DEFAULT_OG_IMAGE}`
  try {
    return new URL(value, origin).toString()
  } catch {
    return `${origin}${DEFAULT_OG_IMAGE}`
  }
}

function getPageType(pathname) {
  if (pathname === '/chi-siamo') return 'AboutPage'
  if (pathname === '/contatti') return 'ContactPage'
  if (pathname === '/prodotti' || pathname === '/store' || pathname === '/news') {
    return 'CollectionPage'
  }
  return 'WebPage'
}

function getBreadcrumbLabel(pathname, seo) {
  const route = defaultSeoPages.find((item) => item.path === pathname)
  if (route?.page_name) return route.page_name
  if (pathname.startsWith('/macchinario/')) return seo.title?.replace(/\s*\|.*$/, '') || 'Macchinario usato'
  return seo.page_name || seo.title?.replace(/\s*\|.*$/, '') || SITE_NAME
}

function buildBreadcrumbs(pathname, seo, canonical, origin) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Idealtech',
      item: `${origin}/`,
    },
  ]

  if (pathname === '/') return items

  if (pathname.startsWith('/prodotti/')) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: 'Prodotti',
      item: `${origin}/prodotti`,
    })
  }

  if (pathname.startsWith('/macchinario/')) {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: 'Macchinari usati',
      item: `${origin}/store`,
    })
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: getBreadcrumbLabel(pathname, seo),
    item: canonical,
  })

  return items
}

function buildProductList(origin) {
  const products = defaultSeoPages.filter(
    (item) => item.path.startsWith('/prodotti/') && item.path.split('/').length === 3
  )

  return {
    '@type': 'ItemList',
    '@id': `${origin}/prodotti#item-list`,
    name: 'Prodotti Idealtech',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.page_name,
      url: `${origin}${product.path}`,
    })),
  }
}

function buildPageStructuredData({ pathname, seo, canonical, ogImage, origin }) {
  const breadcrumbs = buildBreadcrumbs(pathname, seo, canonical, origin)
  const graph = [
    {
      '@type': getPageType(pathname),
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: seo.title || SITE_NAME,
      description: seo.description || '',
      inLanguage: 'it-IT',
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORGANIZATION_ID },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: ogImage,
      },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: breadcrumbs,
    },
  ]

  if (pathname === '/prodotti') {
    graph.push(buildProductList(origin))
  }

  if (seo.product) {
    graph.push({
      '@type': 'Product',
      '@id': `${canonical}#product`,
      ...seo.product,
      url: canonical,
      manufacturer: seo.product.manufacturer || { '@id': ORGANIZATION_ID },
    })
  } else if (pathname.startsWith('/prodotti/')) {
    graph.push({
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: seo.page_name || seo.title?.replace(/\s*\|.*$/, '') || 'Prodotto Idealtech',
      description: seo.description || '',
      image: [ogImage],
      url: canonical,
      brand: {
        '@type': 'Brand',
        name: 'Idealtech',
      },
      manufacturer: { '@id': ORGANIZATION_ID },
      category: 'Sistemi industriali di incollaggio',
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

async function loadSeoSettings() {
  const cached = getSeoCache()
  if (cached) return cached

  const activePromise = getSeoPromise()
  if (activePromise) return activePromise

  const request = supabase
    .from('seo_settings')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.warn('Impostazioni SEO dinamiche non disponibili:', error.message)
        setSeoCache([])
        return []
      }

      const rows = data || []
      setSeoCache(rows)
      return rows
    })

  setSeoPromise(request)
  return request
}

export default function SeoManager() {
  const location = useLocation()
  const { language } = useLanguage()
  const [settings, setSettings] = useState(() => getSeoCache() || [])
  const [runtimeOverride, setRuntimeOverride] = useState(null)

  useEffect(() => {
    let active = true

    loadSeoSettings().then((rows) => {
      if (active) setSettings(rows)
    })

    function handleSeoUpdate() {
      setSettings(getSeoCache() || [])
    }

    function handleSeoOverride(event) {
      setRuntimeOverride(event.detail || null)
    }

    window.addEventListener('idealtech:seo-updated', handleSeoUpdate)
    window.addEventListener('idealtech:seo-override', handleSeoOverride)
    return () => {
      active = false
      window.removeEventListener('idealtech:seo-updated', handleSeoUpdate)
      window.removeEventListener('idealtech:seo-override', handleSeoOverride)
    }
  }, [])

  useEffect(() => {
    setRuntimeOverride(null)
  }, [location.pathname])

  const seo = useMemo(() => {
    const defaults = findDefaultSeo(location.pathname)
    const saved = settings.find((item) => item.path === location.pathname)
    const activeOverride = runtimeOverride?.path === location.pathname ? runtimeOverride : null
    return { ...defaults, ...(saved || {}), ...(activeOverride || {}) }
  }, [location.pathname, runtimeOverride, settings])

  useEffect(() => {
    const origin = window.location.origin
    const isPrivatePage = location.pathname.startsWith('/admin') || location.pathname === '/login'
    const title = String(seo.title || SITE_NAME).trim()
    const description = String(seo.description || '').trim()
    const keywords = String(seo.keywords || '').trim()
    const robots = isPrivatePage || seo.indexable === false ? 'noindex, nofollow' : 'index, follow'
    const canonical = seo.canonical_url || `${origin}${location.pathname === '/' ? '/' : location.pathname}`
    const ogImage = toAbsoluteUrl(seo.og_image_url, origin)

    document.documentElement.lang = language || 'it'
    document.title = title

    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })
    setMeta('meta[name="robots"]', { name: 'robots', content: robots })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: seo.og_title || title })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: seo.og_description || description,
    })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.og_title || title })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: seo.og_description || description,
    })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage })
    setLink('canonical', canonical)

    if (isPrivatePage) {
      document.head.querySelector(`#${STRUCTURED_DATA_ID}`)?.remove()
      return
    }

    setJsonLd(
      STRUCTURED_DATA_ID,
      buildPageStructuredData({
        pathname: location.pathname,
        seo,
        canonical,
        ogImage,
        origin,
      })
    )
  }, [language, location.pathname, seo])

  return null
}
