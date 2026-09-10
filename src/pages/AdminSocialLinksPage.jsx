/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import FileUploadField from '../components/FileUploadField'
import SocialLinkIcon from '../components/SocialLinkIcon'
import { useAuth } from '../context/AuthContext'
import {
  SOCIAL_ICON_OPTIONS,
  SOCIAL_LANDING_DEFAULTS,
  SOCIAL_LINK_DEFAULTS,
} from '../lib/socialLandingDefaults'
import { uploadSocialAsset } from '../lib/socialLandingStorage'
import { supabase } from '../lib/supabase'
import '../styles/AdminSocialLinksPage.css'

function makeNewLink(index = 0) {
  return {
    id: crypto.randomUUID(),
    label: 'Nuovo collegamento',
    subtitle: '',
    url: '',
    icon_key: 'external',
    active: true,
    featured: false,
    new_tab: true,
    sort_order: (index + 1) * 10,
    background_color: '',
    text_color: '',
  }
}

function cloneDefaultLinks() {
  return SOCIAL_LINK_DEFAULTS.map((item, index) => ({
    ...item,
    id: crypto.randomUUID(),
    sort_order: (index + 1) * 10,
  }))
}

export default function AdminSocialLinksPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(SOCIAL_LANDING_DEFAULTS)
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [backgroundFile, setBackgroundFile] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')

    const [settingsResult, linksResult] = await Promise.all([
      supabase.from('social_landing_settings').select('*').eq('id', 'main').maybeSingle(),
      supabase.from('social_landing_links').select('*').order('sort_order', { ascending: true }),
    ])

    if (settingsResult.error || linksResult.error) {
      const problem = settingsResult.error || linksResult.error
      setError(`${problem.message}. Esegui prima il file SUPABASE_LINK_IN_BIO.sql nel SQL Editor di Supabase.`)
      setLinks(cloneDefaultLinks())
      setLoading(false)
      return
    }

    setSettings({ ...SOCIAL_LANDING_DEFAULTS, ...(settingsResult.data || {}) })
    setLinks(linksResult.data?.length ? linksResult.data : cloneDefaultLinks())
    setLoading(false)
  }

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  function updateLink(id, field, value) {
    setLinks((current) => current.map((link) => (
      link.id === id ? { ...link, [field]: value } : link
    )))
  }

  function addLink() {
    setLinks((current) => [...current, makeNewLink(current.length)])
  }

  function moveLink(index, direction) {
    const target = index + direction
    if (target < 0 || target >= links.length) return

    setLinks((current) => {
      const copy = [...current]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy.map((item, itemIndex) => ({ ...item, sort_order: (itemIndex + 1) * 10 }))
    })
  }

  async function deleteLink(link) {
    if (!window.confirm(`Eliminare il collegamento “${link.label}”?`)) return

    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('social_landing_links')
      .delete()
      .eq('id', link.id)

    if (deleteError && !String(deleteError.message).includes('invalid input syntax for type uuid')) {
      setError(deleteError.message)
      return
    }

    setLinks((current) => current.filter((item) => item.id !== link.id))
  }

  async function uploadAsset(kind) {
    const file = kind === 'logo' ? logoFile : backgroundFile
    if (!file) return

    setUploading(kind)
    setError('')

    try {
      const url = await uploadSocialAsset(file, user?.id || 'admin', kind)
      updateSetting(kind === 'logo' ? 'logo_url' : 'background_image_url', url)
      if (kind === 'logo') setLogoFile(null)
      else setBackgroundFile(null)
      setMessage(`${kind === 'logo' ? 'Logo' : 'Sfondo'} caricato. Premi “Salva e pubblica” per confermare.`)
    } catch (uploadError) {
      setError(uploadError.message || 'Errore durante il caricamento.')
    } finally {
      setUploading('')
    }
  }

  async function saveAll() {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const settingsPayload = {
        ...settings,
        id: 'main',
        updated_at: new Date().toISOString(),
      }

      const { error: settingsError } = await supabase
        .from('social_landing_settings')
        .upsert(settingsPayload, { onConflict: 'id' })

      if (settingsError) throw settingsError

      const normalizedLinks = links.map((link, index) => ({
        id: link.id,
        label: String(link.label || '').trim(),
        subtitle: String(link.subtitle || '').trim() || null,
        url: String(link.url || '').trim(),
        icon_key: link.icon_key || 'external',
        active: Boolean(link.active),
        featured: Boolean(link.featured),
        new_tab: Boolean(link.new_tab),
        sort_order: (index + 1) * 10,
        background_color: String(link.background_color || '').trim() || null,
        text_color: String(link.text_color || '').trim() || null,
        updated_at: new Date().toISOString(),
      }))

      if (normalizedLinks.some((link) => !link.label || !link.url)) {
        throw new Error('Ogni collegamento deve avere almeno un nome e un URL.')
      }

      if (normalizedLinks.length) {
        const { error: linksError } = await supabase
          .from('social_landing_links')
          .upsert(normalizedLinks, { onConflict: 'id' })

        if (linksError) throw linksError
      }

      setLinks(normalizedLinks)
      setMessage('Landing aggiornata correttamente. Le modifiche sono già online.')
    } catch (saveError) {
      setError(saveError.message || 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  const previewStyle = useMemo(() => ({
    '--social-bg': settings.background_color,
    '--social-secondary': settings.secondary_color,
    '--social-accent': settings.accent_color,
    '--social-card': settings.card_color,
    '--social-text': settings.text_color,
    '--social-button-text': settings.button_text_color,
    '--social-bg-image': settings.background_image_url ? `url("${settings.background_image_url}")` : 'none',
  }), [settings])

  const activeLinks = useMemo(() => links.filter((link) => link.active), [links])

  return (
    <AdminLayout
      title="Landing social"
      subtitle="Gestisci la pagina nascosta da usare nella bio Instagram: identità, colori, sfondo e collegamenti sono modificabili da qui."
      actions={(
        <a className="admin-secondary-button" href="/links" target="_blank" rel="noreferrer">
          Apri /links ↗
        </a>
      )}
    >
      {message ? <div className="social-admin-message success">{message}</div> : null}
      {error ? <div className="social-admin-message error">{error}</div> : null}

      {loading ? (
        <div className="admin-panel-card social-admin-loading">Caricamento landing...</div>
      ) : (
        <div className="social-admin-layout">
          <div className="social-admin-editor">
            <section className="admin-panel-card social-admin-card">
              <div className="social-admin-card-head">
                <div>
                  <span>Pubblicazione</span>
                  <h2>Stato pagina</h2>
                </div>
                <label className="social-admin-switch">
                  <input
                    type="checkbox"
                    checked={settings.enabled !== false}
                    onChange={(event) => updateSetting('enabled', event.target.checked)}
                  />
                  <span />
                  {settings.enabled !== false ? 'Attiva' : 'Nascosta'}
                </label>
              </div>
              <p className="social-admin-note">
                URL pubblico: <strong>/links</strong>. La pagina non compare nei menu del sito ed è impostata come <strong>noindex</strong> per i motori di ricerca.
              </p>
            </section>

            <section className="admin-panel-card social-admin-card">
              <div className="social-admin-card-head">
                <div>
                  <span>Identità</span>
                  <h2>Testata della landing</h2>
                </div>
              </div>

              <div className="social-admin-fields two-columns">
                <label>
                  Etichetta superiore
                  <input value={settings.eyebrow || ''} onChange={(e) => updateSetting('eyebrow', e.target.value)} />
                </label>
                <label>
                  Titolo principale
                  <input value={settings.title || ''} onChange={(e) => updateSetting('title', e.target.value)} />
                </label>
                <label>
                  Sottotitolo
                  <input value={settings.subtitle || ''} onChange={(e) => updateSetting('subtitle', e.target.value)} />
                </label>
                <label>
                  Descrizione breve
                  <input value={settings.description || ''} onChange={(e) => updateSetting('description', e.target.value)} />
                </label>
                <label className="field-wide">
                  Testo footer
                  <input value={settings.footer_text || ''} onChange={(e) => updateSetting('footer_text', e.target.value)} />
                </label>
              </div>

              <div className="social-admin-upload-grid">
                <div className="social-admin-upload-box">
                  <strong>Logo / immagine profilo</strong>
                  {settings.logo_url ? <img src={settings.logo_url} alt="Anteprima logo" className="social-admin-logo-preview" /> : null}
                  <FileUploadField
                    accept="image/*"
                    selectedFiles={logoFile ? [logoFile] : []}
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    buttonText="Scegli logo"
                  />
                  <button type="button" className="admin-secondary-button" onClick={() => uploadAsset('logo')} disabled={!logoFile || uploading === 'logo'}>
                    {uploading === 'logo' ? 'Caricamento...' : 'Carica logo'}
                  </button>
                  <label>
                    Oppure URL logo
                    <input value={settings.logo_url || ''} onChange={(e) => updateSetting('logo_url', e.target.value)} />
                  </label>
                </div>

                <div className="social-admin-upload-box">
                  <strong>Sfondo personalizzato</strong>
                  {settings.background_image_url ? <img src={settings.background_image_url} alt="Anteprima sfondo" className="social-admin-bg-preview" /> : <div className="social-admin-bg-empty">Sfondo colorato gradiente.</div>}
                  <FileUploadField
                    accept="image/*"
                    selectedFiles={backgroundFile ? [backgroundFile] : []}
                    onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                    buttonText="Scegli sfondo"
                  />
                  <div className="social-admin-inline-buttons">
                    <button type="button" className="admin-secondary-button" onClick={() => uploadAsset('background')} disabled={!backgroundFile || uploading === 'background'}>
                      {uploading === 'background' ? 'Caricamento...' : 'Carica sfondo'}
                    </button>
                    {settings.background_image_url ? (
                      <button type="button" className="social-admin-text-button danger" onClick={() => updateSetting('background_image_url', '')}>Rimuovi</button>
                    ) : null}
                  </div>
                  <label>
                    Oppure URL immagine
                    <input value={settings.background_image_url || ''} onChange={(e) => updateSetting('background_image_url', e.target.value)} />
                  </label>
                </div>
              </div>

              <label className="social-admin-checkbox-row">
                <input type="checkbox" checked={settings.show_made_in_italy !== false} onChange={(e) => updateSetting('show_made_in_italy', e.target.checked)} />
                Mostra badge “Made in Italy”
              </label>
            </section>

            <section className="admin-panel-card social-admin-card">
              <div className="social-admin-card-head">
                <div>
                  <span>Look & feel</span>
                  <h2>Colori</h2>
                </div>
              </div>
              <div className="social-color-grid">
                {[
                  ['background_color', 'Sfondo'],
                  ['secondary_color', 'Secondario'],
                  ['accent_color', 'Accento'],
                  ['card_color', 'Pulsanti'],
                  ['text_color', 'Testo pagina'],
                  ['button_text_color', 'Testo pulsanti'],
                ].map(([field, label]) => (
                  <label className="social-color-field" key={field}>
                    <span>{label}</span>
                    <div>
                      <input type="color" value={settings[field] || '#ffffff'} onChange={(e) => updateSetting(field, e.target.value)} />
                      <input value={settings[field] || ''} onChange={(e) => updateSetting(field, e.target.value)} />
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section className="admin-panel-card social-admin-card">
              <div className="social-admin-card-head social-admin-links-head">
                <div>
                  <span>Collegamenti</span>
                  <h2>Pulsanti della landing</h2>
                </div>
                <button type="button" className="admin-primary-button" onClick={addLink}>+ Aggiungi link</button>
              </div>

              <div className="social-admin-links-list">
                {links.map((link, index) => (
                  <article className="social-admin-link-editor" key={link.id}>
                    <div className="social-admin-link-top">
                      <span className="social-admin-link-number">{index + 1}</span>
                      <div className="social-admin-link-title">
                        <SocialLinkIcon type={link.icon_key} />
                        <strong>{link.label || 'Senza nome'}</strong>
                      </div>
                      <div className="social-admin-order-buttons">
                        <button type="button" onClick={() => moveLink(index, -1)} disabled={index === 0} aria-label="Sposta sopra">↑</button>
                        <button type="button" onClick={() => moveLink(index, 1)} disabled={index === links.length - 1} aria-label="Sposta sotto">↓</button>
                        <button type="button" className="danger" onClick={() => deleteLink(link)} aria-label="Elimina">×</button>
                      </div>
                    </div>

                    <div className="social-admin-fields link-fields">
                      <label>
                        Testo pulsante
                        <input value={link.label || ''} onChange={(e) => updateLink(link.id, 'label', e.target.value)} />
                      </label>
                      <label>
                        Testo secondario
                        <input value={link.subtitle || ''} onChange={(e) => updateLink(link.id, 'subtitle', e.target.value)} placeholder="Opzionale" />
                      </label>
                      <label className="field-wide">
                        URL / collegamento
                        <input value={link.url || ''} onChange={(e) => updateLink(link.id, 'url', e.target.value)} placeholder="https://... / mailto:... / tel:... /contatti" />
                      </label>
                      <label>
                        Icona
                        <select value={link.icon_key || 'external'} onChange={(e) => updateLink(link.id, 'icon_key', e.target.value)}>
                          {SOCIAL_ICON_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                        </select>
                      </label>
                      <label>
                        Sfondo personalizzato
                        <div className="social-link-color-optional">
                          <input type="color" value={link.background_color || settings.card_color || '#ffffff'} onChange={(e) => updateLink(link.id, 'background_color', e.target.value)} />
                          <input value={link.background_color || ''} onChange={(e) => updateLink(link.id, 'background_color', e.target.value)} placeholder="Usa colore globale" />
                        </div>
                      </label>
                      <label>
                        Testo personalizzato
                        <div className="social-link-color-optional">
                          <input type="color" value={link.text_color || settings.button_text_color || '#12345c'} onChange={(e) => updateLink(link.id, 'text_color', e.target.value)} />
                          <input value={link.text_color || ''} onChange={(e) => updateLink(link.id, 'text_color', e.target.value)} placeholder="Usa colore globale" />
                        </div>
                      </label>
                    </div>

                    <div className="social-admin-link-options">
                      <label><input type="checkbox" checked={link.active !== false} onChange={(e) => updateLink(link.id, 'active', e.target.checked)} /> Visibile</label>
                      <label><input type="checkbox" checked={Boolean(link.featured)} onChange={(e) => updateLink(link.id, 'featured', e.target.checked)} /> Evidenziato</label>
                      <label><input type="checkbox" checked={Boolean(link.new_tab)} onChange={(e) => updateLink(link.id, 'new_tab', e.target.checked)} /> Nuova scheda</label>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="social-admin-savebar">
              <div>
                <strong>Landing social</strong>
                <span>{activeLinks.length} collegamenti visibili</span>
              </div>
              <button type="button" className="admin-primary-button" onClick={saveAll} disabled={saving}>
                {saving ? 'Salvataggio...' : 'Salva e pubblica'}
              </button>
            </div>
          </div>

          <aside className="social-admin-preview-column">
            <div className="social-admin-preview-sticky">
              <div className="social-admin-preview-label">
                <span>Anteprima live</span>
                <small>Mobile</small>
              </div>
              <div className="social-admin-phone-frame">
                <div className="social-admin-phone-notch" />
                <div className="social-admin-phone-screen" style={previewStyle}>
                  <div className="social-preview-cover" />
                  <div className="social-preview-content">
                    <img className="social-preview-logo" src={settings.logo_url || '/logo-cerchio.png'} alt="" />
                    <small>{settings.eyebrow}</small>
                    <h3>{settings.title}</h3>
                    <p>{settings.subtitle}</p>
                    <div className="social-preview-links">
                      {activeLinks.slice(0, 6).map((link) => (
                        <div
                          className={`social-preview-link ${link.featured ? 'is-featured' : ''}`}
                          key={link.id}
                          style={{
                            ...(link.background_color ? { '--preview-link-bg': link.background_color } : {}),
                            ...(link.text_color ? { '--preview-link-text': link.text_color } : {}),
                          }}
                        >
                          <SocialLinkIcon type={link.icon_key} />
                          <span>{link.label}</span>
                          <b>↗</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  )
}
