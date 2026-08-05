/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { supabase } from '../lib/supabase'
import { defaultSeoPages } from '../lib/seoDefaults'
import { setSeoCache } from '../lib/seoCache'
import '../styles/AdminSeoPage.css'

function mergeSeoRows(savedRows = []) {
  const savedByPath = new Map(savedRows.map((item) => [item.path, item]))

  return defaultSeoPages.map((defaults) => ({
    ...defaults,
    ...(savedByPath.get(defaults.path) || {}),
  }))
}

export default function AdminSeoPage() {
  const [rows, setRows] = useState(() => mergeSeoRows())
  const [loading, setLoading] = useState(true)
  const [savingPath, setSavingPath] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    async function loadSettings() {
      setLoading(true)
      setMessage({ type: '', text: '' })

      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('path', { ascending: true })

      if (!active) return

      if (error) {
        setMessage({
          type: 'error',
          text: 'La tabella SEO non è ancora disponibile. Esegui lo script SUPABASE_SEO_PERFORMANCE.sql.',
        })
      } else {
        const merged = mergeSeoRows(data || [])
        setRows(merged)
        setSeoCache(data || [])
      }

      setLoading(false)
    }

    loadSettings()
    return () => {
      active = false
    }
  }, [])

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return rows

    return rows.filter((row) =>
      [row.page_name, row.path, row.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    )
  }, [query, rows])

  function updateRow(path, field, value) {
    setRows((current) =>
      current.map((row) => (row.path === path ? { ...row, [field]: value } : row))
    )
  }

  async function saveRow(row) {
    try {
      setSavingPath(row.path)
      setMessage({ type: '', text: '' })

      const payload = {
        path: row.path,
        page_name: row.page_name,
        title: row.title.trim(),
        description: row.description.trim(),
        keywords: row.keywords?.trim() || '',
        canonical_url: row.canonical_url?.trim() || null,
        og_title: row.og_title?.trim() || null,
        og_description: row.og_description?.trim() || null,
        og_image_url: row.og_image_url?.trim() || null,
        indexable: row.indexable !== false,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('seo_settings')
        .upsert(payload, { onConflict: 'path' })
        .select()
        .single()

      if (error) throw error

      setRows((current) =>
        current.map((item) => (item.path === row.path ? { ...item, ...data } : item))
      )

      const { data: freshRows } = await supabase.from('seo_settings').select('*')
      setSeoCache(freshRows || [])
      setMessage({ type: 'success', text: `SEO salvato per “${row.page_name}”.` })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Errore durante il salvataggio SEO.' })
    } finally {
      setSavingPath('')
    }
  }

  return (
    <AdminLayout
      title="Gestione SEO"
      subtitle="Modifica titoli, descrizioni, anteprime social e indicizzazione delle pagine pubbliche."
      actions={
        <a className="admin-secondary-button" href="/" target="_blank" rel="noreferrer">
          Apri il sito ↗
        </a>
      }
    >
      <section className="admin-panel-card admin-seo-intro">
        <div>
          <span className="admin-section-kicker">Ottimizzazione motori di ricerca</span>
          <h2>Controllo SEO pagina per pagina</h2>
          <p>
            Mantieni il titolo sotto circa 60 caratteri e la descrizione tra 120 e 160
            caratteri. Le modifiche vengono applicate anche durante la navigazione interna.
          </p>
        </div>

        <label className="admin-seo-search">
          <span>Cerca pagina</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Es. prodotti, contatti, store..."
          />
        </label>
      </section>

      {message.text ? (
        <div className={`auth-message ${message.type} admin-seo-message`}>{message.text}</div>
      ) : null}

      {loading ? (
        <section className="admin-panel-card admin-seo-loading">Caricamento impostazioni SEO...</section>
      ) : (
        <div className="admin-seo-list">
          {filteredRows.map((row, index) => {
            const titleLength = row.title?.length || 0
            const descriptionLength = row.description?.length || 0

            return (
              <details className="admin-panel-card admin-seo-card" key={row.path} open={index === 0 && !query}>
                <summary>
                  <div>
                    <span>{row.page_name}</span>
                    <strong>{row.title}</strong>
                    <small>{row.path}</small>
                  </div>
                  <span className={row.indexable === false ? 'is-noindex' : 'is-indexable'}>
                    {row.indexable === false ? 'No index' : 'Indicizzata'}
                  </span>
                </summary>

                <div className="admin-seo-card-body">
                  <div className="admin-seo-grid">
                    <label className="admin-seo-field admin-seo-field-wide">
                      <span>
                        Titolo SEO
                        <small className={titleLength > 60 ? 'is-warning' : ''}>{titleLength}/60</small>
                      </span>
                      <input
                        value={row.title || ''}
                        onChange={(event) => updateRow(row.path, 'title', event.target.value)}
                        maxLength="100"
                        required
                      />
                    </label>

                    <label className="admin-seo-field admin-seo-field-wide">
                      <span>
                        Meta description
                        <small className={descriptionLength > 160 ? 'is-warning' : ''}>{descriptionLength}/160</small>
                      </span>
                      <textarea
                        rows="3"
                        value={row.description || ''}
                        onChange={(event) => updateRow(row.path, 'description', event.target.value)}
                        maxLength="240"
                        required
                      />
                    </label>

                    <label className="admin-seo-field admin-seo-field-wide">
                      <span>Parole chiave</span>
                      <input
                        value={row.keywords || ''}
                        onChange={(event) => updateRow(row.path, 'keywords', event.target.value)}
                        placeholder="Separate da virgole"
                      />
                    </label>

                    <label className="admin-seo-field">
                      <span>Titolo anteprima social</span>
                      <input
                        value={row.og_title || ''}
                        onChange={(event) => updateRow(row.path, 'og_title', event.target.value)}
                        placeholder="Se vuoto usa il titolo SEO"
                      />
                    </label>

                    <label className="admin-seo-field">
                      <span>Immagine social</span>
                      <input
                        value={row.og_image_url || ''}
                        onChange={(event) => updateRow(row.path, 'og_image_url', event.target.value)}
                        placeholder="/immagine.webp oppure URL completo"
                      />
                    </label>

                    <label className="admin-seo-field admin-seo-field-wide">
                      <span>Descrizione anteprima social</span>
                      <textarea
                        rows="2"
                        value={row.og_description || ''}
                        onChange={(event) => updateRow(row.path, 'og_description', event.target.value)}
                        placeholder="Se vuota usa la meta description"
                      />
                    </label>

                    <label className="admin-seo-field admin-seo-field-wide">
                      <span>URL canonico personalizzato</span>
                      <input
                        type="url"
                        value={row.canonical_url || ''}
                        onChange={(event) => updateRow(row.path, 'canonical_url', event.target.value)}
                        placeholder="Lascia vuoto per usare automaticamente l’URL della pagina"
                      />
                    </label>
                  </div>

                  <label className="admin-seo-index-toggle">
                    <input
                      type="checkbox"
                      checked={row.indexable !== false}
                      onChange={(event) => updateRow(row.path, 'indexable', event.target.checked)}
                    />
                    <span>
                      <strong>Consenti l’indicizzazione</strong>
                      <small>Disattivando, la pagina riceve meta robots noindex, nofollow.</small>
                    </span>
                  </label>

                  <div className="admin-seo-preview">
                    <span>Anteprima risultato Google</span>
                    <strong>{row.title || 'Titolo pagina'}</strong>
                    <small>{window.location.origin}{row.path}</small>
                    <p>{row.description || 'Inserisci una descrizione per mostrare l’anteprima.'}</p>
                  </div>

                  <div className="admin-seo-actions">
                    <button
                      className="admin-primary-button"
                      type="button"
                      disabled={savingPath === row.path}
                      onClick={() => saveRow(row)}
                    >
                      {savingPath === row.path ? 'Salvataggio...' : 'Salva impostazioni SEO'}
                    </button>
                  </div>
                </div>
              </details>
            )
          })}

          {!filteredRows.length ? (
            <section className="admin-panel-card admin-seo-empty">Nessuna pagina corrisponde alla ricerca.</section>
          ) : null}
        </div>
      )}
    </AdminLayout>
  )
}
