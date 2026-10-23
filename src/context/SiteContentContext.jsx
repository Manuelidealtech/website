import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SITE_CONTENT_DEFAULTS } from '../lib/siteContentDefaults'
import { useAuth } from './AuthContext'

const SiteContentContext = createContext(null)

function rowsToMap(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.content_key, row.value]))
}

export function SiteContentProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState(SITE_CONTENT_DEFAULTS)
  const [loading, setLoading] = useState(true)
  const isPreview = new URLSearchParams(window.location.search).get('cms_preview') === '1'

  const loadContent = useCallback(async () => {
    try {
      setLoading(true)
      const { data: publishedRows, error: publishedError } = await supabase
        .from('site_content')
        .select('content_key,value')

      if (publishedError) {
        console.warn('CMS non ancora configurato, uso contenuti predefiniti:', publishedError.message)
        setContent(SITE_CONTENT_DEFAULTS)
        return
      }

      let nextContent = { ...SITE_CONTENT_DEFAULTS, ...rowsToMap(publishedRows) }

      if (isPreview && user) {
        const { data: draftRows, error: draftError } = await supabase
          .from('site_content_drafts')
          .select('content_key,value')

        if (!draftError) {
          nextContent = { ...nextContent, ...rowsToMap(draftRows) }
        }
      }

      setContent(nextContent)
    } catch (error) {
      console.warn('Errore caricamento CMS:', error)
      setContent(SITE_CONTENT_DEFAULTS)
    } finally {
      setLoading(false)
    }
  }, [isPreview, user])

  useEffect(() => {
    if (!authLoading) loadContent()
  }, [authLoading, loadContent])

  const get = useCallback((key, fallback) => {
    const value = content[key]
    return value === undefined || value === null ? fallback : value
  }, [content])

  const value = useMemo(() => ({ content, get, loading, isPreview, reload: loadContent }), [content, get, loading, isPreview, loadContent])
  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const context = useContext(SiteContentContext)
  if (!context) throw new Error('useSiteContent deve essere usato dentro SiteContentProvider')
  return context
}
