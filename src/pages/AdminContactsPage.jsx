/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { defaultContactRows, groupContactRows } from '../lib/contactDefaults'
import { uploadContactPhoto } from '../lib/contactStorage'
import '../styles/AdminContactsPage.css'

function normalizeRow(row) {
  return {
    id: row.id,
    section_key: row.section_key || '',
    section_title: row.section_title || '',
    office: row.office || '',
    employee: row.employee || '',
    description: row.description || '',
    phone: row.phone || '',
    phone_href: row.phone_href || '',
    extension: row.extension || '',
    email: row.email || '',
    photo_url: row.photo_url || '',
    sort_order: row.sort_order || 0,
  }
}

export default function AdminContactsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [uploadingId, setUploadingId] = useState('')
  const [error, setError] = useState('')
  const [successId, setSuccessId] = useState('')

  async function loadContacts() {
    try {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('contact_people')
        .select('*')
        .order('sort_order', { ascending: true })

      if (queryError) throw queryError
      setRows((data?.length ? data : defaultContactRows).map(normalizeRow))
    } catch (err) {
      setRows(defaultContactRows.map(normalizeRow))
      setError(
        err.message?.includes('contact_people')
          ? 'La tabella contatti non è ancora configurata. Esegui il file SUPABASE_AGGIORNAMENTO.sql nel SQL Editor di Supabase.'
          : err.message || 'Errore durante il caricamento dei contatti.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  const groupedRows = useMemo(() => groupContactRows(rows), [rows])

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    setSuccessId('')
  }

  async function handlePhotoChange(row, event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploadingId(row.id)
      setError('')
      const photoUrl = await uploadContactPhoto(file, user.id)
      updateRow(row.id, 'photo_url', photoUrl)
    } catch (err) {
      setError(err.message || 'Errore durante il caricamento della foto.')
    } finally {
      setUploadingId('')
      event.target.value = ''
    }
  }

  async function saveRow(row) {
    try {
      setSavingId(row.id)
      setError('')
      setSuccessId('')

      const payload = {
        id: row.id,
        section_key: row.section_key.trim(),
        section_title: row.section_title.trim(),
        office: row.office.trim() || null,
        employee: row.employee.trim() || null,
        description: row.description.trim() || null,
        phone: row.phone.trim() || null,
        phone_href: row.phone_href.trim() || null,
        extension: row.extension.trim() || null,
        email: row.email.trim() || null,
        photo_url: row.photo_url.trim() || null,
        sort_order: Number(row.sort_order) || 0,
        updated_at: new Date().toISOString(),
      }

      const { error: saveError } = await supabase
        .from('contact_people')
        .upsert(payload, { onConflict: 'id' })

      if (saveError) throw saveError
      setSuccessId(row.id)
      setTimeout(() => setSuccessId((current) => (current === row.id ? '' : current)), 2200)
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio.')
    } finally {
      setSavingId('')
    }
  }

  return (
    <AdminLayout
      title="Dipendenti e contatti"
      subtitle="Aggiorna le persone mostrate nella pagina Contatti. Quando una foto è vuota non viene mostrato alcun avatar."
      actions={<a className="admin-secondary-button" href="/contatti" target="_blank" rel="noreferrer">Anteprima pagina ↗</a>}
    >
      {error ? <div className="auth-message error admin-contacts-message">{error}</div> : null}

      {loading ? (
        <div className="admin-panel-card admin-contacts-loading">Caricamento contatti...</div>
      ) : (
        <div className="admin-contact-sections">
          {groupedRows.map((section) => (
            <section className="admin-panel-card admin-contact-section" key={section.key}>
              <div className="admin-contact-section-head">
                <div>
                  <span>Sezione contatti</span>
                  <h2>{section.title}</h2>
                </div>
                <span className="admin-contact-count">{section.items.length} {section.items.length === 1 ? 'contatto' : 'contatti'}</span>
              </div>

              <div className="admin-contact-list">
                {section.items.map((row) => (
                  <article className="admin-contact-editor" key={row.id}>
                    <div className="admin-contact-photo-column">
                      {row.photo_url ? (
                        <div className="admin-contact-photo-preview">
                          <img src={row.photo_url} alt={row.employee || 'Foto dipendente'} />
                        </div>
                      ) : (
                        <div className="admin-contact-photo-empty">Nessuna foto</div>
                      )}

                      <label className="admin-photo-upload">
                        {uploadingId === row.id ? 'Caricamento...' : 'Scegli foto'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => handlePhotoChange(row, event)}
                          disabled={uploadingId === row.id}
                        />
                      </label>

                      {row.photo_url ? (
                        <button type="button" className="admin-remove-photo" onClick={() => updateRow(row.id, 'photo_url', '')}>
                          Rimuovi foto
                        </button>
                      ) : null}
                    </div>

                    <div className="admin-contact-fields">
                      <label className="admin-field-wide">
                        Nome dipendente
                        <input value={row.employee} onChange={(e) => updateRow(row.id, 'employee', e.target.value)} placeholder="Lascia vuoto se non vuoi mostrare un nome" />
                      </label>

                      <label>
                        Nome ufficio
                        <input value={row.office} onChange={(e) => updateRow(row.id, 'office', e.target.value)} />
                      </label>

                      <label>
                        Interno
                        <input value={row.extension} onChange={(e) => updateRow(row.id, 'extension', e.target.value)} />
                      </label>

                      <label>
                        Telefono visibile
                        <input value={row.phone} onChange={(e) => updateRow(row.id, 'phone', e.target.value)} />
                      </label>

                      <label>
                        Telefono per chiamata
                        <input value={row.phone_href} onChange={(e) => updateRow(row.id, 'phone_href', e.target.value)} placeholder="Es. +390362543041" />
                      </label>

                      <label className="admin-field-wide">
                        Email
                        <input type="email" value={row.email} onChange={(e) => updateRow(row.id, 'email', e.target.value)} />
                      </label>

                      <label className="admin-field-wide">
                        Descrizione ufficio
                        <textarea rows="3" value={row.description} onChange={(e) => updateRow(row.id, 'description', e.target.value)} />
                      </label>

                      <div className="admin-contact-save-row admin-field-wide">
                        {successId === row.id ? <span className="admin-contact-saved">Salvato ✓</span> : <span />}
                        <button type="button" className="admin-primary-button" onClick={() => saveRow(row)} disabled={savingId === row.id || uploadingId === row.id}>
                          {savingId === row.id ? 'Salvataggio...' : 'Salva contatto'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
