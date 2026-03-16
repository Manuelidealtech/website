import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadNewsImage } from '../lib/newsStorage'
import '../styles/AdminNewsPage.css'

function emptyForm() {
  return {
    title: '',
    excerpt: '',
    content: '',
    image_url: '',
    published_at: '',
    published: true,
  }
}

export default function AdminNewsPage() {
  const { user, profile } = useAuth()
  const [news, setNews] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const canManage = ['admin', 'editor'].includes(profile?.role)

  useEffect(() => {
    if (!user || !canManage) {
      setLoading(false)
      return
    }
    loadNews()
  }, [user, canManage])

  useEffect(() => {
    if (selectedFile) {
      const localUrl = URL.createObjectURL(selectedFile)
      setPreviewUrl(localUrl)
      return () => URL.revokeObjectURL(localUrl)
    }

    setPreviewUrl(form.image_url || '')
  }, [selectedFile, form.image_url])

  async function loadNews() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setNews(data || [])
    setLoading(false)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim() || !form.content.trim()) {
      alert('Compila almeno titolo e contenuto.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let finalImageUrl = form.image_url.trim() || null

      if (selectedFile) {
        finalImageUrl = await uploadNewsImage(selectedFile, user.id)
      }

      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || form.content.trim().slice(0, 180),
        content: form.content.trim(),
        image_url: finalImageUrl,
        published: form.published,
        published_at: form.published_at || new Date().toISOString(),
        author_id: user.id,
      }

      if (editingId) {
        const { error } = await supabase
          .from('news')
          .update(payload)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('news').insert(payload)
        if (error) throw error
      }

      setForm(emptyForm())
      setEditingId(null)
      setSelectedFile(null)
      setPreviewUrl('')
      await loadNews()
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(item) {
    setEditingId(item.id)
    setSelectedFile(null)
    setForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      image_url: item.image_url || '',
      published_at: item.published_at ? item.published_at.slice(0, 16) : '',
      published: item.published ?? true,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    const ok = window.confirm('Vuoi eliminare questa news?')
    if (!ok) return

    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }

    if (editingId === id) {
      handleCancelEdit()
    }

    loadNews()
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
    setSelectedFile(null)
    setPreviewUrl('')
  }

  const sortedNews = useMemo(() => news, [news])

  if (!loading && (!user || !canManage)) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="page-shell admin-news-page">
      <div className="admin-news-header">
        <div>
          <h1>Gestione news</h1>
          <p>Crea, modifica o rimuovi le news mostrate nella homepage e nella pagina news.</p>
        </div>

        <BackButton fallback="/admin" />
      </div>

      {error && <div className="admin-news-error">{error}</div>}

      <div className="admin-news-layout">
        <div className="admin-news-form-card">
          <h2>{editingId ? 'Modifica news' : 'Nuova news'}</h2>

          <form className="admin-news-form" onSubmit={handleSubmit}>
            <label>
              Titolo
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Titolo della news"
              />
            </label>

            <label>
              Data pubblicazione
              <input
                type="datetime-local"
                name="published_at"
                value={form.published_at}
                onChange={handleChange}
              />
            </label>

            <label>
              Carica immagine
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>

            <label>
              Oppure URL immagine
              <input
                type="text"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://... oppure URL storage"
              />
            </label>

            {previewUrl && (
              <div className="admin-news-preview">
                <img src={previewUrl} alt="Preview news" />
              </div>
            )}

            <label>
              Estratto breve
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="Testo breve mostrato nelle card"
              />
            </label>

            <label>
              Contenuto
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                rows="7"
                placeholder="Contenuto completo della news"
              />
            </label>

            <label className="admin-news-checkbox">
              <input
                type="checkbox"
                name="published"
                checked={form.published}
                onChange={handleChange}
              />
              Pubblicata
            </label>

            <div className="admin-news-actions">
              <button type="submit" className="admin-news-save" disabled={saving}>
                {saving ? 'Salvataggio...' : editingId ? 'Salva modifiche' : 'Pubblica news'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-news-cancel"
                  onClick={handleCancelEdit}
                >
                  Annulla
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-news-list-card">
          <h2>News inserite</h2>

          {loading ? (
            <p>Caricamento news...</p>
          ) : (
            <div className="admin-news-list">
              {sortedNews.map((item) => (
                <div className="admin-news-item" key={item.id}>
                  <div className="admin-news-item-top">
                    <div>
                      <span className="admin-news-item-date">
                        {new Date(item.published_at).toLocaleDateString('it-IT')}
                      </span>
                      <h3>{item.title}</h3>
                    </div>

                    <span className={item.published ? 'news-status on' : 'news-status off'}>
                      {item.published ? 'Online' : 'Bozza'}
                    </span>
                  </div>

                  <p>{item.excerpt || item.content}</p>

                  <div className="admin-news-item-actions">
                    <button type="button" onClick={() => handleEdit(item)}>
                      Modifica
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(item.id)}>
                      Elimina
                    </button>
                  </div>
                </div>
              ))}

              {!sortedNews.length && <p>Nessuna news presente.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}