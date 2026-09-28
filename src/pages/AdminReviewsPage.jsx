/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import FileUploadField from '../components/FileUploadField'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { deleteReviewImage, uploadReviewImage } from '../lib/reviewStorage'
import '../styles/AdminReviewsPage.css'

function emptyForm() {
  return {
    reviewer_name: '',
    company: '',
    reviewer_role: '',
    review_text: '',
    rating: 5,
    avatar_url: '',
    avatar_path: '',
    sort_order: 0,
    published: true,
  }
}

function Stars({ value = 5 }) {
  const rating = Math.max(1, Math.min(5, Number(value) || 5))
  return (
    <span className="admin-review-stars" aria-label={`${rating} stelle su 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">{index < rating ? '★' : '☆'}</span>
      ))}
    </span>
  )
}

export default function AdminReviewsPage() {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const canManage = ['admin', 'editor'].includes(profile?.role)

  useEffect(() => {
    if (!user || !canManage) {
      setLoading(false)
      return
    }
    loadReviews()
  }, [user, canManage])

  useEffect(() => {
    if (selectedFile) {
      const localUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(localUrl)
      return () => URL.revokeObjectURL(localUrl)
    }

    setPreviewUrl(removeExistingImage ? '' : (form.avatar_url || ''))
  }, [selectedFile, form.avatar_url, removeExistingImage])

  async function loadReviews() {
    setLoading(true)
    setError('')

    const { data, error: loadError } = await supabase
      .from('customer_reviews')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(loadError.message)
      setLoading(false)
      return
    }

    setReviews(data || [])
    setLoading(false)
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox'
        ? checked
        : name === 'rating' || name === 'sort_order'
          ? Number(value)
          : value,
    }))
  }

  function handleFileChange(event) {
    setSelectedFile(event.target.files?.[0] || null)
    setRemoveExistingImage(false)
  }

  function handleRemoveImage() {
    setSelectedFile(null)
    setRemoveExistingImage(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.reviewer_name.trim() || !form.review_text.trim()) {
      alert('Inserisci almeno il nome del cliente e il testo della recensione.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    let uploadedPath = ''

    try {
      let avatarUrl = removeExistingImage ? '' : (form.avatar_url || '')
      let avatarPath = removeExistingImage ? '' : (form.avatar_path || '')

      if (selectedFile) {
        const uploaded = await uploadReviewImage(selectedFile, user.id)
        uploadedPath = uploaded.path
        avatarUrl = uploaded.url
        avatarPath = uploaded.path
      }

      const payload = {
        reviewer_name: form.reviewer_name.trim(),
        company: form.company.trim() || null,
        reviewer_role: form.reviewer_role.trim() || null,
        review_text: form.review_text.trim(),
        rating: Math.max(1, Math.min(5, Number(form.rating) || 5)),
        avatar_url: avatarUrl || null,
        avatar_path: avatarPath || null,
        sort_order: Number(form.sort_order) || 0,
        published: Boolean(form.published),
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const previous = reviews.find((item) => item.id === editingId)
        const { error: updateError } = await supabase
          .from('customer_reviews')
          .update(payload)
          .eq('id', editingId)

        if (updateError) throw updateError

        if ((selectedFile || removeExistingImage) && previous?.avatar_path && previous.avatar_path !== avatarPath) {
          try {
            await deleteReviewImage(previous.avatar_path)
          } catch {
            // La recensione è già salvata: un'eventuale pulizia storage non deve bloccare l'operazione.
          }
        }
      } else {
        const { error: insertError } = await supabase
          .from('customer_reviews')
          .insert({
            ...payload,
            created_by: user.id,
          })

        if (insertError) throw insertError
      }

      const wasEditing = Boolean(editingId)
      resetForm()
      await loadReviews()
      setMessage(wasEditing ? 'Recensione aggiornata correttamente.' : 'Recensione aggiunta correttamente.')
    } catch (err) {
      if (uploadedPath) {
        try {
          await deleteReviewImage(uploadedPath)
        } catch {
          // Evita di coprire l'errore originale.
        }
      }
      setError(err.message || 'Errore durante il salvataggio della recensione.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setSelectedFile(null)
    setRemoveExistingImage(false)
    setForm({
      reviewer_name: item.reviewer_name || '',
      company: item.company || '',
      reviewer_role: item.reviewer_role || '',
      review_text: item.review_text || '',
      rating: Number(item.rating || 5),
      avatar_url: item.avatar_url || '',
      avatar_path: item.avatar_path || '',
      sort_order: Number(item.sort_order || 0),
      published: item.published ?? true,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(item) {
    if (!window.confirm(`Eliminare la recensione di "${item.reviewer_name}"?`)) return

    setError('')
    setMessage('')

    const { error: deleteError } = await supabase
      .from('customer_reviews')
      .delete()
      .eq('id', item.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    if (item.avatar_path) {
      try {
        await deleteReviewImage(item.avatar_path)
      } catch {
        // La riga è stata eliminata: non blocchiamo per un file rimasto nello storage.
      }
    }

    if (editingId === item.id) resetForm()
    await loadReviews()
    setMessage('Recensione eliminata.')
  }

  async function handleTogglePublished(item) {
    setError('')
    setMessage('')

    const { error: updateError } = await supabase
      .from('customer_reviews')
      .update({
        published: !item.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await loadReviews()
    setMessage(item.published ? 'Recensione nascosta dal sito.' : 'Recensione pubblicata sul sito.')
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm())
    setSelectedFile(null)
    setPreviewUrl('')
    setRemoveExistingImage(false)
  }

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => {
      const orderDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0)
      if (orderDiff !== 0) return orderDiff
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    }),
    [reviews]
  )

  if (!loading && (!user || !canManage)) {
    return <Navigate to="/admin" replace />
  }

  return (
    <AdminLayout
      title="Recensioni clienti"
      subtitle="Aggiungi, modifica e scegli quali recensioni mostrare sul sito Idealtech."
      actions={<a className="admin-secondary-button" href="/#recensioni" target="_blank" rel="noreferrer">Vedi sul sito ↗</a>}
    >
      {message ? <div className="admin-reviews-success">{message}</div> : null}
      {error ? <div className="admin-reviews-error">{error}</div> : null}

      <div className="admin-reviews-layout">
        <section className="admin-reviews-form-card">
          <div className="admin-reviews-card-heading">
            <span>{editingId ? 'Modifica' : 'Nuova'}</span>
            <h2>{editingId ? 'Modifica recensione' : 'Aggiungi recensione'}</h2>
          </div>

          <form className="admin-reviews-form" onSubmit={handleSubmit}>
            <label>
              Nome cliente
              <input
                type="text"
                name="reviewer_name"
                value={form.reviewer_name}
                onChange={handleChange}
                placeholder="Es. Marco Rossi"
                maxLength={120}
                required
              />
            </label>

            <div className="admin-reviews-two-columns">
              <label>
                Azienda
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Es. ACME S.p.A."
                  maxLength={160}
                />
              </label>

              <label>
                Ruolo
                <input
                  type="text"
                  name="reviewer_role"
                  value={form.reviewer_role}
                  onChange={handleChange}
                  placeholder="Es. Responsabile produzione"
                  maxLength={160}
                />
              </label>
            </div>

            <label>
              Recensione
              <textarea
                name="review_text"
                rows="7"
                value={form.review_text}
                onChange={handleChange}
                placeholder="Scrivi qui il testo della recensione..."
                maxLength={2000}
                required
              />
              <small>{form.review_text.length}/2000 caratteri</small>
            </label>

            <div className="admin-reviews-two-columns">
              <label>
                Valutazione
                <select name="rating" value={form.rating} onChange={handleChange}>
                  <option value={5}>5 stelle</option>
                  <option value={4}>4 stelle</option>
                  <option value={3}>3 stelle</option>
                  <option value={2}>2 stelle</option>
                  <option value={1}>1 stella</option>
                </select>
              </label>

              <label>
                Ordine
                <input
                  type="number"
                  name="sort_order"
                  value={form.sort_order}
                  onChange={handleChange}
                  min="0"
                  step="1"
                />
              </label>
            </div>

            <div className="admin-reviews-image-field">
              <span className="admin-reviews-field-label">Foto cliente o logo azienda (opzionale)</span>
              <FileUploadField
                accept="image/*"
                selectedFiles={selectedFile ? [selectedFile] : []}
                onChange={handleFileChange}
                disabled={saving}
                buttonText="Scegli immagine"
              />

              {previewUrl ? (
                <div className="admin-review-image-preview">
                  <img src={previewUrl} alt="Anteprima recensione" />
                  <button type="button" onClick={handleRemoveImage}>Rimuovi immagine</button>
                </div>
              ) : null}
            </div>

            <label className="admin-reviews-checkbox">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
              />
              <span>
                <strong>Visibile sul sito</strong>
                <small>Se disattivata rimane salvata nel pannello ma non viene mostrata ai clienti.</small>
              </span>
            </label>

            <div className="admin-reviews-form-actions">
              <button className="admin-reviews-save" type="submit" disabled={saving}>
                {saving ? 'Salvataggio...' : editingId ? 'Salva modifiche' : 'Aggiungi recensione'}
              </button>

              {editingId ? (
                <button className="admin-reviews-cancel" type="button" onClick={resetForm} disabled={saving}>
                  Annulla
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="admin-reviews-list-card">
          <div className="admin-reviews-list-heading">
            <div>
              <span>Archivio</span>
              <h2>Recensioni inserite</h2>
            </div>
            <strong>{reviews.length}</strong>
          </div>

          {loading ? <p className="admin-reviews-empty">Caricamento recensioni...</p> : null}

          {!loading && sortedReviews.length === 0 ? (
            <div className="admin-reviews-empty">
              <strong>Nessuna recensione inserita</strong>
              <span>Usa il modulo a sinistra per aggiungere la prima recensione.</span>
            </div>
          ) : null}

          <div className="admin-reviews-list">
            {sortedReviews.map((item) => (
              <article className="admin-review-item" key={item.id}>
                <div className="admin-review-item-top">
                  <div className="admin-review-author">
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt="" />
                    ) : (
                      <span className="admin-review-initial">
                        {(item.reviewer_name || '?').trim().charAt(0).toUpperCase()}
                      </span>
                    )}

                    <div>
                      <h3>{item.reviewer_name}</h3>
                      <p>
                        {[item.reviewer_role, item.company].filter(Boolean).join(' · ') || 'Cliente Idealtech'}
                      </p>
                    </div>
                  </div>

                  <span className={`admin-review-status ${item.published ? 'is-published' : 'is-hidden'}`}>
                    {item.published ? 'Pubblicata' : 'Nascosta'}
                  </span>
                </div>

                <Stars value={item.rating} />
                <blockquote>{item.review_text}</blockquote>

                <div className="admin-review-item-meta">
                  <span>Ordine: {Number(item.sort_order || 0)}</span>
                  <span>Aggiornata: {new Date(item.updated_at || item.created_at).toLocaleDateString('it-IT')}</span>
                </div>

                <div className="admin-review-item-actions">
                  <button type="button" onClick={() => handleEdit(item)}>Modifica</button>
                  <button type="button" onClick={() => handleTogglePublished(item)}>
                    {item.published ? 'Nascondi' : 'Pubblica'}
                  </button>
                  <button className="danger" type="button" onClick={() => handleDelete(item)}>Elimina</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
