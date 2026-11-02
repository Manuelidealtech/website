import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import FileUploadField from '../components/FileUploadField'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { SITE_CONTENT_DEFAULTS, SITE_CONTENT_FIELDS, SITE_SECTIONS } from '../lib/siteContentDefaults'
import { uploadSiteAsset } from '../lib/siteAssetStorage'
import { slugify } from '../lib/slugify'
import '../styles/AdminSiteEditorPage.css'

function rowsToMap(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.content_key, row.value]))
}


const previewRoutes = {
  navbar: '/',
  home: '/',
  about: '/chi-siamo',
  products: '/prodotti',
  productDetails: '/prodotti/drum-line',
  services: '/servizi',
  support: '/assistenza',
  footer: '/',
}

function getInitialEditorSection() {
  if (typeof window === 'undefined') return 'navbar'
  const urlSection = new URLSearchParams(window.location.search).get('section')
  const savedSection = window.localStorage.getItem('idealtech.cms.activeSection')
  const candidate = urlSection || savedSection || 'navbar'
  return SITE_SECTIONS.some((section) => section.id === candidate) ? candidate : 'navbar'
}

export default function AdminSiteEditorPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState(getInitialEditorSection)
  const [values, setValues] = useState(SITE_CONTENT_DEFAULTS)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingKey, setUploadingKey] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)
  const [openProductId, setOpenProductId] = useState('drum-line')
  const [openCatalogProductId, setOpenCatalogProductId] = useState('')

  const sectionFields = useMemo(
    () => SITE_CONTENT_FIELDS.filter((field) => field.section === activeSection),
    [activeSection]
  )

  useEffect(() => {
    loadEditor()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('idealtech.cms.activeSection', activeSection)
    const url = new URL(window.location.href)
    url.searchParams.set('section', activeSection)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }, [activeSection])

  async function loadEditor() {
    try {
      setLoading(true)
      setError('')
      const [publishedResult, draftResult, versionsResult] = await Promise.all([
        supabase.from('site_content').select('content_key,value'),
        supabase.from('site_content_drafts').select('content_key,value'),
        supabase.from('site_content_versions').select('id,created_at,note,snapshot').order('created_at', { ascending: false }).limit(12),
      ])

      if (publishedResult.error || draftResult.error) {
        const dbError = publishedResult.error || draftResult.error
        throw new Error(`CMS non configurato nel database. Esegui prima il file SUPABASE_WEBSITE_CMS.sql. Dettaglio: ${dbError.message}`)
      }

      const mergedValues = {
        ...SITE_CONTENT_DEFAULTS,
        ...rowsToMap(publishedResult.data),
        ...rowsToMap(draftResult.data),
      }
      if (Array.isArray(mergedValues['navbar.items']) && !mergedValues['navbar.items'].some((item) => item.id === 'support' || item.to === '/assistenza')) {
        const nextNav = [...mergedValues['navbar.items']]
        const contactsIndex = nextNav.findIndex((item) => item.id === 'contacts')
        nextNav.splice(contactsIndex >= 0 ? contactsIndex : nextNav.length, 0, { id: 'support', label: 'Assistenza', to: '/assistenza', visible: true })
        mergedValues['navbar.items'] = nextNav
      }
      setValues(mergedValues)
      setVersions(versionsResult.data || [])
      setDirty(false)
    } catch (err) {
      setError(err.message || 'Errore durante il caricamento del website editor.')
    } finally {
      setLoading(false)
    }
  }

  function setValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setDirty(true)
    setMessage('')
  }

  function updateArrayItem(key, index, patch) {
    const items = Array.isArray(values[key]) ? [...values[key]] : []
    items[index] = { ...items[index], ...patch }
    setValue(key, items)
  }

  function moveArrayItem(key, index, direction) {
    const items = Array.isArray(values[key]) ? [...values[key]] : []
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    const [item] = items.splice(index, 1)
    items.splice(nextIndex, 0, item)
    setValue(key, items)
  }

  async function saveDraft({ silent = false } = {}) {
    try {
      setSaving(true)
      setError('')
      if (!silent) setMessage('')

      const rows = SITE_CONTENT_FIELDS.map((field, index) => ({
        content_key: field.key,
        section: field.section,
        label: field.label,
        field_type: field.type,
        value: values[field.key] ?? field.defaultValue,
        sort_order: index,
        updated_by: user?.id || null,
        updated_at: new Date().toISOString(),
      }))

      const { error: saveError } = await supabase
        .from('site_content_drafts')
        .upsert(rows, { onConflict: 'content_key' })

      if (saveError) throw saveError
      setDirty(false)
      if (!silent) setMessage('Bozza salvata. Ora puoi aprire l’anteprima o pubblicarla.')
      return true
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio della bozza.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function publish() {
    try {
      setPublishing(true)
      setError('')
      setMessage('')
      const saved = await saveDraft({ silent: true })
      if (!saved) return

      const { data: currentPublished, error: publishedError } = await supabase
        .from('site_content')
        .select('content_key,value')
      if (publishedError) throw publishedError

      const previousSnapshot = rowsToMap(currentPublished)
      if (Object.keys(previousSnapshot).length) {
        const { error: versionError } = await supabase.from('site_content_versions').insert({
          snapshot: previousSnapshot,
          created_by: user?.id || null,
          note: `Versione precedente alla pubblicazione del ${new Date().toLocaleString('it-IT')}`,
        })
        if (versionError) throw versionError
      }

      const rows = SITE_CONTENT_FIELDS.map((field, index) => ({
        content_key: field.key,
        section: field.section,
        label: field.label,
        field_type: field.type,
        value: values[field.key] ?? field.defaultValue,
        sort_order: index,
        updated_by: user?.id || null,
        updated_at: new Date().toISOString(),
      }))

      const { error: publishError } = await supabase
        .from('site_content')
        .upsert(rows, { onConflict: 'content_key' })
      if (publishError) throw publishError

      setMessage('Modifiche pubblicate. Il sito pubblico ora usa questi contenuti, senza bisogno di un nuovo deploy.')
      setDirty(false)
      await loadVersionsOnly()
    } catch (err) {
      setError(err.message || 'Errore durante la pubblicazione.')
    } finally {
      setPublishing(false)
    }
  }

  async function loadVersionsOnly() {
    const { data } = await supabase
      .from('site_content_versions')
      .select('id,created_at,note,snapshot')
      .order('created_at', { ascending: false })
      .limit(12)
    setVersions(data || [])
  }

  async function openPreview() {
    const saved = await saveDraft({ silent: true })
    if (!saved) return
    const route = previewRoutes[activeSection] || '/'
    window.open(`${route}?cms_preview=1`, '_blank', 'noopener,noreferrer')
  }

  async function restoreVersion(version) {
    const snapshot = version?.snapshot
    if (!snapshot || typeof snapshot !== 'object') return
    const nextValues = { ...SITE_CONTENT_DEFAULTS, ...snapshot }
    setValues(nextValues)
    setDirty(true)
    setMessage('Versione caricata nell’editor. Controllala in anteprima e poi pubblicala per renderla online.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleImageUpload(field, file, productIndex = null) {
    if (!file) return
    try {
      const token = productIndex === null ? field.key : `${field.key}-${productIndex}`
      setUploadingKey(token)
      setError('')
      const uploaded = await uploadSiteAsset({
        file,
        userId: user?.id || 'admin',
        section: field.section,
      })

      if (productIndex === null) setValue(field.key, uploaded.url)
      else updateArrayItem(field.key, productIndex, { image: uploaded.url })
    } catch (err) {
      setError(err.message || 'Errore durante il caricamento dell’immagine.')
    } finally {
      setUploadingKey('')
    }
  }

  function renderNavigationEditor(field) {
    const items = Array.isArray(values[field.key]) ? values[field.key] : []
    return (
      <div className="cms-list-editor">
        {items.map((item, index) => (
          <div className="cms-list-row" key={item.id || `${field.key}-${index}`}>
            <div className="cms-list-order">
              <button type="button" onClick={() => moveArrayItem(field.key, index, -1)} disabled={index === 0} aria-label="Sposta su">↑</button>
              <button type="button" onClick={() => moveArrayItem(field.key, index, 1)} disabled={index === items.length - 1} aria-label="Sposta giù">↓</button>
            </div>
            <div className="cms-list-main">
              <label>
                <span>Titolo visualizzato</span>
                <input value={item.label || ''} onChange={(e) => updateArrayItem(field.key, index, { label: e.target.value })} />
              </label>
              <small>{item.to}</small>
            </div>
            <label className="cms-switch">
              <input type="checkbox" checked={item.visible !== false} onChange={(e) => updateArrayItem(field.key, index, { visible: e.target.checked })} />
              <span>Visibile</span>
            </label>
          </div>
        ))}
      </div>
    )
  }


  function renderProductNavigationEditor(field) {
    const items = Array.isArray(values[field.key]) ? values[field.key] : []
    const availablePages = Object.entries(values['products.details'] || {}).map(([productId, page]) => ({
      label: page?.name || page?.title || productId,
      url: `/prodotti/${page?.slug || productId}`,
    }))

    function addMenuItem() {
      const nextNumber = items.length + 1
      setValue(field.key, [
        ...items,
        {
          id: `menu-prodotto-${nextNumber}`,
          label: 'Nuovo prodotto',
          to: '/prodotti/nuovo-prodotto',
          visible: true,
        },
      ])
    }

    return (
      <div className="cms-product-menu-editor">
        <div className="cms-product-pages-help">
          <strong>Prima crea la pagina prodotto</strong>
          <span>Vai in “Pagine prodotto”, crea la nuova pagina e poi inserisci qui il suo URL, per esempio /prodotti/nuovo-prodotto.</span>
        </div>
        <div className="cms-list-editor">
          {items.map((item, index) => (
            <div className="cms-product-menu-row" key={item.id || `${field.key}-${index}`}>
              <div className="cms-list-order">
                <button type="button" onClick={() => moveArrayItem(field.key, index, -1)} disabled={index === 0} aria-label="Sposta su">↑</button>
                <button type="button" onClick={() => moveArrayItem(field.key, index, 1)} disabled={index === items.length - 1} aria-label="Sposta giù">↓</button>
              </div>
              <div className="cms-product-menu-fields">
                <label>
                  <span>Nome nel sottomenu</span>
                  <input value={item.label || ''} onChange={(e) => updateArrayItem(field.key, index, { label: e.target.value })} />
                </label>
                <label>
                  <span>Redirect URL</span>
                  <input list="cms-product-page-urls" value={item.to || ''} onChange={(e) => updateArrayItem(field.key, index, { to: e.target.value })} placeholder="/prodotti/nome-prodotto" />
                </label>
              </div>
              <div className="cms-product-menu-actions">
                <label className="cms-switch">
                  <input type="checkbox" checked={item.visible !== false} onChange={(e) => updateArrayItem(field.key, index, { visible: e.target.checked })} />
                  <span>Visibile</span>
                </label>
                <button type="button" className="cms-mini-danger" onClick={() => setValue(field.key, items.filter((_, itemIndex) => itemIndex !== index))}>Elimina</button>
              </div>
            </div>
          ))}
        </div>
        <datalist id="cms-product-page-urls">
          {availablePages.map((page) => <option key={page.url} value={page.url}>{page.label}</option>)}
        </datalist>
        <button type="button" className="admin-secondary-button cms-add-line" onClick={addMenuItem}>+ Aggiungi voce al sottomenu</button>
      </div>
    )
  }

  function renderProductPagesEditor(field) {
    const pages = values[field.key] && typeof values[field.key] === 'object' ? values[field.key] : field.defaultValue

    function mutatePages(mutator) {
      const next = JSON.parse(JSON.stringify(pages || {}))
      mutator(next)
      setValue(field.key, next)
    }

    function paragraphsFromText(text) {
      return String(text || '').split(/\n\s*\n+/).map((item) => item.trim()).filter(Boolean)
    }

    function createProductPage() {
      let counter = Object.keys(pages || {}).length + 1
      let productId = `nuovo-prodotto-${counter}`
      while (pages?.[productId]) {
        counter += 1
        productId = `nuovo-prodotto-${counter}`
      }

      mutatePages((next) => {
        next[productId] = {
          slug: productId,
          name: 'Nuovo prodotto',
          kicker: 'Nuova linea',
          title: 'Titolo nuovo prodotto',
          intro: 'Inserisci qui una breve introduzione del prodotto.',
          sections: [
            { label: 'Descrizione', paragraphs: ['Inserisci qui la descrizione del prodotto.'], groups: [] },
            { label: 'Caratteristiche', paragraphs: [], groups: [{ title: '', paragraphs: [], items: ['Prima caratteristica'] }] },
          ],
          galleryLabel: 'Galleria prodotto',
        }
      })
      setOpenProductId(productId)
    }

    function deleteProductPage(productId) {
      mutatePages((next) => { delete next[productId] })
      if (openProductId === productId) setOpenProductId('')
    }

    const productOrder = ['drum-line', 'extruder-line', 'assy-line', 'coating-heads', 'custom-machines', 'ideal-melt', 'idm-gp', 'gun-line', 'hose-line', 'cold-line', 'hand-gun', 'spare-parts']
    const pageEntries = Object.entries(pages || {}).sort(([a], [b]) => {
      const ai = productOrder.indexOf(a)
      const bi = productOrder.indexOf(b)
      if (ai === -1 && bi === -1) return 0
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })

    return (
      <div className="cms-product-pages-editor">
        <div className="cms-product-pages-help">
          <strong>Come funziona</strong>
          <span>Crea qui prima la pagina prodotto. Ogni pagina genera un URL /prodotti/slug che puoi poi usare nel catalogo e nel sottomenu Prodotti.</span>
        </div>
        <button type="button" className="admin-primary-button cms-create-product-page" onClick={createProductPage}>+ Crea nuova pagina prodotto</button>

        {pageEntries.map(([productId, page]) => (
          <details
            className="cms-product-page"
            key={productId}
            open={openProductId === productId}
            onToggle={(event) => {
              if (event.currentTarget.open) setOpenProductId(productId)
              else if (openProductId === productId) setOpenProductId('')
            }}
          >
            <summary>
              <div>
                <strong>{page.name || page.kicker || page.title || productId}</strong>
                <span>{page.title}</span>
              </div>
              <span className="cms-product-page__path">/prodotti/{page.slug || productId}</span>
            </summary>

            <div className="cms-product-page__body">
              <div className="cms-product-page__top-actions">
                <div>
                  <strong>Impostazioni pagina</strong>
                  <span>Lo slug definisce l'indirizzo pubblico della pagina.</span>
                </div>
                {!productOrder.includes(productId) ? <button type="button" className="cms-mini-danger" onClick={() => deleteProductPage(productId)}>Elimina pagina</button> : null}
              </div>
              <div className="cms-product-page__hero-fields">
                <label className="cms-full"><span>URL pagina prodotto</span><div className="cms-slug-field"><span>/prodotti/</span><input value={page.slug || productId} onChange={(e) => mutatePages((next) => { next[productId].slug = slugify(e.target.value) })} placeholder="nome-prodotto" /></div></label>
                <label><span>Nome nel breadcrumb</span><input value={page.name || ''} onChange={(e) => mutatePages((next) => { next[productId].name = e.target.value })} /></label>
                <label><span>Etichetta / linea</span><input value={page.kicker || ''} onChange={(e) => mutatePages((next) => { next[productId].kicker = e.target.value })} /></label>
                <label className="cms-full"><span>Titolo principale</span><input value={page.title || ''} onChange={(e) => mutatePages((next) => { next[productId].title = e.target.value })} /></label>
                <label className="cms-full"><span>Testo introduttivo</span><textarea rows="4" value={page.intro || ''} onChange={(e) => mutatePages((next) => { next[productId].intro = e.target.value })} /></label>
              </div>

              <div className="cms-product-page__sections">
                {(page.sections || []).map((section, sectionIndex) => (
                  <div className="cms-product-page__section" key={`${productId}-section-${sectionIndex}`}>
                    <div className="cms-product-page__section-head">
                      <strong>Blocco {sectionIndex + 1}</strong>
                      <button type="button" className="cms-mini-danger" onClick={() => mutatePages((next) => { next[productId].sections.splice(sectionIndex, 1) })}>Rimuovi blocco</button>
                    </div>

                    <label><span>Titolo del blocco</span><input value={section.label || ''} onChange={(e) => mutatePages((next) => { next[productId].sections[sectionIndex].label = e.target.value })} /></label>
                    <label><span>Testo del blocco</span><textarea rows="5" value={(section.paragraphs || []).join('\n\n')} onChange={(e) => mutatePages((next) => { next[productId].sections[sectionIndex].paragraphs = paragraphsFromText(e.target.value) })} placeholder="Scrivi un paragrafo. Lascia una riga vuota per iniziarne un altro." /></label>

                    {(section.groups || []).map((group, groupIndex) => (
                      <div className="cms-product-page__group" key={`${productId}-section-${sectionIndex}-group-${groupIndex}`}>
                        <div className="cms-product-page__group-head">
                          <strong>Sottosezione / elenco {groupIndex + 1}</strong>
                          <button type="button" className="cms-mini-danger" onClick={() => mutatePages((next) => { next[productId].sections[sectionIndex].groups.splice(groupIndex, 1) })}>Rimuovi</button>
                        </div>
                        <label><span>Titolo sottosezione (facoltativo)</span><input value={group.title || ''} onChange={(e) => mutatePages((next) => { next[productId].sections[sectionIndex].groups[groupIndex].title = e.target.value })} /></label>
                        <label><span>Testo sottosezione (facoltativo)</span><textarea rows="4" value={(group.paragraphs || []).join('\n\n')} onChange={(e) => mutatePages((next) => { next[productId].sections[sectionIndex].groups[groupIndex].paragraphs = paragraphsFromText(e.target.value) })} /></label>

                        <div className="cms-product-page__items">
                          <span className="cms-product-page__items-label">Elenco puntato</span>
                          {(group.items || []).map((item, itemIndex) => (
                            <div className="cms-product-page__item" key={`${productId}-${sectionIndex}-${groupIndex}-${itemIndex}`}>
                              <input value={item || ''} onChange={(e) => mutatePages((next) => { next[productId].sections[sectionIndex].groups[groupIndex].items[itemIndex] = e.target.value })} />
                              <button type="button" className="cms-mini-danger" aria-label="Elimina voce" onClick={() => mutatePages((next) => { next[productId].sections[sectionIndex].groups[groupIndex].items.splice(itemIndex, 1) })}>×</button>
                            </div>
                          ))}
                          <button type="button" className="admin-secondary-button cms-small-action" onClick={() => mutatePages((next) => { next[productId].sections[sectionIndex].groups[groupIndex].items.push('Nuova voce') })}>+ Aggiungi voce</button>
                        </div>
                      </div>
                    ))}

                    <button type="button" className="admin-secondary-button cms-small-action" onClick={() => mutatePages((next) => { next[productId].sections[sectionIndex].groups.push({ title: '', paragraphs: [], items: [] }) })}>+ Aggiungi sottosezione o elenco</button>
                  </div>
                ))}

                <button type="button" className="admin-secondary-button cms-small-action" onClick={() => mutatePages((next) => { next[productId].sections.push({ label: 'Nuovo blocco', paragraphs: [], groups: [] }) })}>+ Aggiungi blocco di testo</button>
              </div>

              <div className="cms-product-page__footer-fields">
                <label><span>Titolo galleria</span><input value={page.galleryLabel || ''} onChange={(e) => mutatePages((next) => { next[productId].galleryLabel = e.target.value })} /></label>
                <a className="admin-secondary-button cms-product-page__preview" href={`/prodotti/${page.slug || productId}?cms_preview=1`} target="_blank" rel="noreferrer">Apri anteprima prodotto ↗</a>
              </div>
            </div>
          </details>
        ))}
      </div>
    )
  }

  function renderProductsEditor(field) {
    const items = Array.isArray(values[field.key]) ? values[field.key] : []
    const availablePages = Object.entries(values['products.details'] || {}).map(([productId, page]) => ({
      label: page?.name || page?.title || productId,
      url: `/prodotti/${page?.slug || productId}`,
    }))

    function addProduct() {
      let counter = items.length + 1
      let id = `nuovo-prodotto-${counter}`
      const existingIds = new Set(items.map((item) => item.id))
      while (existingIds.has(id)) {
        counter += 1
        id = `nuovo-prodotto-${counter}`
      }
      const newProduct = {
        id,
        title: 'Nuova linea',
        subtitle: 'Nuovo prodotto',
        description: 'Inserisci qui una breve descrizione del prodotto.',
        image: '/logo-cerchio.png',
        cta: 'Scopri di più',
        slug: `/prodotti/${id}`,
        visible: true,
      }
      setValue(field.key, [newProduct, ...items])
      setOpenCatalogProductId(id)
    }

    return (
      <div className="cms-product-editor">
        <div className="cms-product-pages-help">
          <strong>Prodotti mostrati nella pagina /prodotti</strong>
          <span>Puoi aggiungere nuove schede. Se il pulsante deve aprire una pagina prodotto, crea prima quella pagina nella sezione “Pagine prodotto” e copia qui il relativo URL.</span>
        </div>
        <button type="button" className="admin-primary-button cms-add-product-card" onClick={addProduct}>+ Aggiungi nuovo prodotto</button>
        <datalist id="cms-catalog-product-page-urls">
          {availablePages.map((page) => <option key={page.url} value={page.url}>{page.label}</option>)}
        </datalist>
        <div className="cms-product-compact-list">
          {items.map((item, index) => {
            const itemId = item.id || `catalog-product-${index}`
            const isOpen = openCatalogProductId === itemId
            return (
              <article className={`cms-product-card ${isOpen ? 'is-open' : ''}`} key={itemId}>
                <button
                  type="button"
                  className="cms-product-card__summary"
                  onClick={() => setOpenCatalogProductId(isOpen ? '' : itemId)}
                  aria-expanded={isOpen}
                >
                  <img src={item.image || '/logo-cerchio.png'} alt="" />
                  <span className="cms-product-card__summary-copy">
                    <strong>{item.title || 'Prodotto'}</strong>
                    <small>{item.subtitle || 'Nessun titolo visualizzato'}</small>
                  </span>
                  <span className={`cms-product-status ${item.visible !== false ? 'is-visible' : 'is-hidden'}`}>
                    {item.visible !== false ? 'Visibile' : 'Nascosto'}
                  </span>
                  <span className="cms-product-card__chevron" aria-hidden="true">⌄</span>
                </button>

                {isOpen ? (
                  <div className="cms-product-card__expanded">
                    <div className="cms-product-fields">
                      <label><span>Linea / nome</span><input value={item.title || ''} onChange={(e) => updateArrayItem(field.key, index, { title: e.target.value })} /></label>
                      <label><span>Titolo visualizzato</span><input value={item.subtitle || ''} onChange={(e) => updateArrayItem(field.key, index, { subtitle: e.target.value })} /></label>
                      <label className="cms-full"><span>Descrizione</span><textarea rows="3" value={item.description || ''} onChange={(e) => updateArrayItem(field.key, index, { description: e.target.value })} /></label>
                      <label><span>Testo pulsante</span><input value={item.cta || ''} onChange={(e) => updateArrayItem(field.key, index, { cta: e.target.value })} /></label>
                      <label><span>Redirect URL del prodotto</span><input list="cms-catalog-product-page-urls" value={item.slug || ''} onChange={(e) => updateArrayItem(field.key, index, { slug: e.target.value })} placeholder="/prodotti/nome-prodotto" /></label>
                      <div className="cms-image-control">
                        <span>Foto prodotto</span>
                        <FileUploadField
                          accept="image/*"
                          selectedFiles={[]}
                          onChange={(e) => handleImageUpload(field, e.target.files?.[0], index)}
                          buttonText={uploadingKey === `${field.key}-${index}` ? 'Caricamento...' : 'Cambia foto'}
                          disabled={Boolean(uploadingKey)}
                        />
                      </div>
                    </div>
                    <div className="cms-product-footer">
                      <div className="cms-list-order">
                        <button type="button" onClick={() => moveArrayItem(field.key, index, -1)} disabled={index === 0}>↑</button>
                        <button type="button" onClick={() => moveArrayItem(field.key, index, 1)} disabled={index === items.length - 1}>↓</button>
                      </div>
                      <div className="cms-product-footer-actions">
                        <label className="cms-switch">
                          <input type="checkbox" checked={item.visible !== false} onChange={(e) => updateArrayItem(field.key, index, { visible: e.target.checked })} />
                          <span>Visibile</span>
                        </label>
                        <button type="button" className="cms-mini-danger" onClick={() => {
                          setValue(field.key, items.filter((_, itemIndex) => itemIndex !== index))
                          if (openCatalogProductId === itemId) setOpenCatalogProductId('')
                        }}>Elimina prodotto</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    )
  }

  function renderField(field) {
    const value = values[field.key] ?? field.defaultValue

    if (field.type === 'navigation') return renderNavigationEditor(field)
    if (field.type === 'product-navigation') return renderProductNavigationEditor(field)
    if (field.type === 'products') return renderProductsEditor(field)
    if (field.type === 'product-pages') return renderProductPagesEditor(field)

    if (field.type === 'boolean') {
      const enabled = value !== false
      return (
        <div className={`cms-publish-toggle ${enabled ? 'is-enabled' : 'is-disabled'}`}>
          <div>
            <strong>{enabled ? 'Area pubblicata online' : 'Area non pubblicata'}</strong>
            <span>{enabled ? 'La voce Assistenza è visibile nel sito e i clienti possono accedere al portale.' : 'La voce Assistenza è nascosta dal sito pubblico e le rotte clienti vengono reindirizzate alla Home.'}</span>
          </div>
          <label className="cms-switch cms-switch--large">
            <input type="checkbox" checked={enabled} onChange={(e) => setValue(field.key, e.target.checked)} />
            <span>{enabled ? 'Online' : 'Offline'}</span>
          </label>
        </div>
      )
    }

    if (field.type === 'string-list') {
      const items = Array.isArray(value) ? value : []
      return (
        <div className="cms-string-list">
          {items.map((item, index) => (
            <div className="cms-string-row" key={`${field.key}-${index}`}>
              <input value={item} onChange={(e) => {
                const next = [...items]
                next[index] = e.target.value
                setValue(field.key, next)
              }} />
              <div className="cms-list-order">
                <button type="button" onClick={() => moveArrayItem(field.key, index, -1)} disabled={index === 0}>↑</button>
                <button type="button" onClick={() => moveArrayItem(field.key, index, 1)} disabled={index === items.length - 1}>↓</button>
                <button type="button" className="cms-list-delete" onClick={() => setValue(field.key, items.filter((_, itemIndex) => itemIndex !== index))} aria-label="Elimina voce">×</button>
              </div>
            </div>
          ))}
          <button type="button" className="admin-secondary-button cms-add-line" onClick={() => setValue(field.key, [...items, 'Nuova voce'])}>+ Aggiungi voce</button>
        </div>
      )
    }

    if (field.type === 'image-list') {
      const images = Array.isArray(value) ? value : []
      return (
        <div className="cms-gallery-editor">
          <div className="cms-gallery-grid">
            {images.map((image, index) => (
              <div className="cms-gallery-item" key={`${image}-${index}`}>
                <img src={image} alt={`Immagine ${index + 1}`} />
                <div className="cms-gallery-item-actions">
                  <button type="button" onClick={() => moveArrayItem(field.key, index, -1)} disabled={index === 0} aria-label="Sposta immagine a sinistra">←</button>
                  <button type="button" onClick={() => moveArrayItem(field.key, index, 1)} disabled={index === images.length - 1} aria-label="Sposta immagine a destra">→</button>
                  <button type="button" className="is-danger" onClick={() => setValue(field.key, images.filter((_, imageIndex) => imageIndex !== index))}>Elimina</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cms-gallery-upload">
            <FileUploadField
              accept="image/*"
              selectedFiles={[]}
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  setUploadingKey(field.key)
                  setError('')
                  const uploaded = await uploadSiteAsset({ file, userId: user?.id || 'admin', section: field.section })
                  setValue(field.key, [...images, uploaded.url])
                } catch (err) {
                  setError(err.message || 'Errore durante il caricamento dell’immagine.')
                } finally {
                  setUploadingKey('')
                }
              }}
              buttonText={uploadingKey === field.key ? 'Caricamento...' : '+ Aggiungi immagine'}
              disabled={Boolean(uploadingKey)}
            />
            <small>Puoi aggiungere, eliminare e riordinare le immagini. Le nuove foto vengono convertite in WebP.</small>
          </div>
        </div>
      )
    }

    if (field.type === 'image') {
      return (
        <div className="cms-image-editor">
          <div className="cms-image-preview"><img src={value} alt="Anteprima" /></div>
          <FileUploadField
            accept="image/*"
            selectedFiles={[]}
            onChange={(e) => handleImageUpload(field, e.target.files?.[0])}
            buttonText={uploadingKey === field.key ? 'Caricamento...' : 'Cambia immagine'}
            disabled={Boolean(uploadingKey)}
          />
          <small>Le nuove immagini vengono ridimensionate e convertite automaticamente in WebP.</small>
        </div>
      )
    }

    if (field.type === 'textarea') {
      return <textarea rows="5" value={value || ''} onChange={(e) => setValue(field.key, e.target.value)} />
    }

    return <input type={field.type === 'url' ? 'url' : 'text'} value={value || ''} onChange={(e) => setValue(field.key, e.target.value)} />
  }

  const activeSectionInfo = SITE_SECTIONS.find((section) => section.id === activeSection)

  return (
    <AdminLayout
      title="Gestione sito"
      subtitle="Modifica testi, menu, prodotti e immagini senza intervenire sul codice. Le modifiche restano in bozza finché non premi Pubblica."
      actions={(
        <div className="cms-header-actions">
          <button type="button" className="admin-secondary-button" onClick={openPreview} disabled={saving || publishing || loading}>Anteprima</button>
          <button type="button" className="admin-primary-button" onClick={publish} disabled={saving || publishing || loading}>{publishing ? 'Pubblicazione...' : 'Pubblica'}</button>
        </div>
      )}
    >
      {error ? <div className="cms-alert cms-alert--error">{error}</div> : null}
      {message ? <div className="cms-alert cms-alert--success">{message}</div> : null}

      <div className="cms-editor-layout">
        <aside className="cms-section-nav admin-panel-card">
          <div className="cms-section-nav-head">
            <span>Sezioni</span>
            {dirty ? <strong>Bozza non salvata</strong> : <small>Salvato</small>}
          </div>
          {SITE_SECTIONS.map((section) => (
            <button key={section.id} type="button" className={activeSection === section.id ? 'is-active' : ''} onClick={() => { setActiveSection(section.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <strong>{section.label}</strong>
              <span>{section.description}</span>
            </button>
          ))}
          <a href="/admin/seo" className="cms-seo-link">SEO e anteprime Google →</a>
        </aside>

        <div className="cms-editor-main">
          <section className="admin-panel-card cms-editor-card">
            <div className="cms-editor-card-head">
              <div>
                <span className="admin-section-kicker">{activeSectionInfo?.label}</span>
                <h2>{activeSectionInfo?.description}</h2>
              </div>
              <button type="button" className="admin-secondary-button" onClick={() => saveDraft()} disabled={saving || loading}>{saving ? 'Salvataggio...' : 'Salva bozza'}</button>
            </div>

            {loading ? <div className="cms-loading">Caricamento editor...</div> : (
              <div className="cms-fields">
                {sectionFields.map((field) => (
                  <div className={`cms-field cms-field--${field.type}`} key={field.key}>
                    <div className="cms-field-label">
                      <label>{field.label}</label>
                      <code>{field.key}</code>
                    </div>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel-card cms-versions-card">
            <div className="cms-editor-card-head">
              <div>
                <span className="admin-section-kicker">Sicurezza</span>
                <h2>Versioni precedenti</h2>
                <p>Ogni volta che pubblichi viene conservata la versione che era online prima.</p>
              </div>
            </div>
            <div className="cms-versions-list">
              {versions.length ? versions.map((version) => (
                <div className="cms-version-row" key={version.id}>
                  <div>
                    <strong>{new Date(version.created_at).toLocaleString('it-IT')}</strong>
                    <span>{version.note || 'Snapshot del sito'}</span>
                  </div>
                  <button type="button" className="admin-secondary-button" onClick={() => restoreVersion(version)}>Ripristina in bozza</button>
                </div>
              )) : <p className="cms-empty">Le versioni compariranno dopo la prima pubblicazione effettuata dal nuovo editor.</p>}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
