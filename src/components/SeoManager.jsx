import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../lib/supabase'
import { DEFAULT_OG_IMAGE, findDefaultSeo, SITE_NAME } from '../lib/seoDefaults'
import { getSeoCache, getSeoPromise, setSeoCache, setSeoPromise } from '../lib/seoCache'

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

function toAbsoluteUrl(value, origin) {
  if (!value) return `${origin}${DEFAULT_OG_IMAGE}`
  try {
    return new URL(value, origin).toString()
  } catch {
    return `${origin}${DEFAULT_OG_IMAGE}`
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

  useEffect(() => {
    let active = true

    loadSeoSettings().then((rows) => {
      if (active) setSettings(rows)
    })

    function handleSeoUpdate() {
      setSettings(getSeoCache() || [])
    }

    window.addEventListener('idealtech:seo-updated', handleSeoUpdate)
    return () => {
      active = false
      window.removeEventListener('idealtech:seo-updated', handleSeoUpdate)
    }
  }, [])

  const seo = useMemo(() => {
    const defaults = findDefaultSeo(location.pathname)
    const saved = settings.find((item) => item.path === location.pathname)
    return { ...defaults, ...(saved || {}) }
  }, [location.pathname, settings])

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
  }, [language, location.pathname, seo])

  return null
}
