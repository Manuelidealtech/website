import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import FileUploadField from '../components/FileUploadField'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { SITE_CONTENT_DEFAULTS, SITE_CONTENT_FIELDS, SITE_SECTIONS } from '../lib/siteContentDefaults'
import { uploadSiteAsset } from '../lib/siteAssetStorage'
import '../styles/AdminSiteEditorPage.css'

function rowsToMap(rows = []) {
  return Object.fromEntries(rows.map((row) => [row.content_key, row.value]))
}


const previewRoutes = {
  navbar: '/',
  home: '/',
  about: '/chi-siamo',
  products: '/prodotti',
  services: '/servizi',
  footer: '/',
}

export default function AdminSiteEditorPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('navbar')
  const [values, setValues] = useState(SITE_CONTENT_DEFAULTS)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingKey, setUploadingKey] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dirty, setDirty] = useState(false)

  const sectionFields = useMemo(
    () => SITE_CONTENT_FIELDS.filter((field) => field.section === activeSection),
    [activeSection]
  )

  useEffect(() => {
    loadEditor()
  }, [])

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

      setValues({
        ...SITE_CONTENT_DEFAULTS,
        ...rowsToMap(publishedResult.data),
        ...rowsToMap(draftResult.data),
      })
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

  function renderProductsEditor(field) {
    const items = Array.isArray(values[field.key]) ? values[field.key] : []
    return (
      <div className="cms-product-editor">
        {items.map((item, index) => (
          <article className="cms-product-card" key={item.id || index}>
            <div className="cms-product-preview">
              <img src={item.image} alt="" />
              <div>
                <strong>{item.title || 'Prodotto'}</strong>
                <span>{item.subtitle}</span>
              </div>
            </div>
            <div className="cms-product-fields">
              <label><span>Linea / nome</span><input value={item.title || ''} onChange={(e) => updateArrayItem(field.key, index, { title: e.target.value })} /></label>
              <label><span>Titolo visualizzato</span><input value={item.subtitle || ''} onChange={(e) => updateArrayItem(field.key, index, { subtitle: e.target.value })} /></label>
              <label className="cms-full"><span>Descrizione</span><textarea rows="3" value={item.description || ''} onChange={(e) => updateArrayItem(field.key, index, { description: e.target.value })} /></label>
              <label><span>Testo pulsante</span><input value={item.cta || ''} onChange={(e) => updateArrayItem(field.key, index, { cta: e.target.value })} /></label>
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
              <label className="cms-switch">
                <input type="checkbox" checked={item.visible !== false} onChange={(e) => updateArrayItem(field.key, index, { visible: e.target.checked })} />
                <span>Visibile</span>
              </label>
            </div>
          </article>
        ))}
      </div>
    )
  }

  function renderField(field) {
    const value = values[field.key] ?? field.defaultValue

    if (field.type === 'navigation') return renderNavigationEditor(field)
    if (field.type === 'products') return renderProductsEditor(field)

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
            <button key={section.id} type="button" className={activeSection === section.id ? 'is-active' : ''} onClick={() => setActiveSection(section.id)}>
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
