import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/slugify'
import { useAuth } from '../context/AuthContext'
import { uploadMachineImage } from '../lib/storage'
import { getMachineImageUrl } from '../lib/storagePublicUrl'
import BackButton from '../components/BackButton'
import '../styles/MachineFormPage.css'

const initialForm = {
  title: '',
  brand: '',
  model: '',
  category: '',
  condition: '',
  year: '',
  price: '',
  description: '',
  location: '',
  status: 'available',
  is_published: false,
}

export default function MachineFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()

  const isEditMode = useMemo(() => Boolean(id), [id])

  const [form, setForm] = useState(initialForm)
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditMode)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (isEditMode) {
      loadMachine()
    }
  }, [isEditMode, id])

  function updateField(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleFilesChange(event) {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
    setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)))
  }

  async function loadMachine() {
    try {
      setLoading(true)
      setErrorMessage('')

      const { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select('*')
        .eq('id', id)
        .single()

      if (machineError) throw new Error(machineError.message)

      setForm({
        title: machineData.title || '',
        brand: machineData.brand || '',
        model: machineData.model || '',
        category: machineData.category || '',
        condition: machineData.condition || '',
        year: machineData.year || '',
        price: machineData.price || '',
        description: machineData.description || '',
        location: machineData.location || '',
        status: machineData.status || 'available',
        is_published: Boolean(machineData.is_published),
      })

      const { data: imagesData, error: imagesError } = await supabase
        .from('machine_images')
        .select('*')
        .eq('machine_id', id)
        .order('sort_order', { ascending: true })

      if (imagesError) throw new Error(imagesError.message)

      setExistingImages(imagesData || [])
    } catch (error) {
      setErrorMessage(error.message || 'Errore nel caricamento del macchinario.')
    } finally {
      setLoading(false)
    }
  }

  async function generateUniqueSlug(baseTitle, currentId = null) {
    const baseSlug = slugify(baseTitle)
    const safeSlug = baseSlug || `macchinario-${Date.now()}`

    const { data, error } = await supabase
      .from('machines')
      .select('id, slug')
      .eq('slug', safeSlug)

    if (error) throw new Error(error.message)

    const conflict = (data || []).find((row) => row.id !== currentId)
    if (!conflict) return safeSlug

    return `${safeSlug}-${Date.now()}`
  }

  async function handleDeleteExistingImage(image) {
    const confirmDelete = window.confirm('Vuoi eliminare questa immagine?')
    if (!confirmDelete) return

    try {
      if (image.image_path) {
        const { error: storageError } = await supabase.storage
          .from('machines')
          .remove([image.image_path])

        if (storageError) {
          console.warn(storageError.message)
        }
      }

      const { error } = await supabase
        .from('machine_images')
        .delete()
        .eq('id', image.id)

      if (error) throw new Error(error.message)

      const nextImages = existingImages.filter((img) => img.id !== image.id)
      setExistingImages(nextImages)

      if (nextImages.length > 0) {
        const first = nextImages[0]
        const nextCoverUrl = first.image_path
          ? getMachineImageUrl(first.image_path)
          : first.image_url

        const { error: coverError } = await supabase
          .from('machines')
          .update({
            cover_image: nextCoverUrl,
            cover_image_path: first.image_path || null,
          })
          .eq('id', id)

        if (coverError) throw new Error(coverError.message)
      } else {
        const { error: coverResetError } = await supabase
          .from('machines')
          .update({
            cover_image: null,
            cover_image_path: null,
          })
          .eq('id', id)

        if (coverResetError) throw new Error(coverResetError.message)
      }
    } catch (error) {
      alert(error.message || 'Errore durante l’eliminazione immagine.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (!form.title.trim()) {
        throw new Error('Il titolo è obbligatorio.')
      }

      if (isEditMode) {
        const slug = await generateUniqueSlug(form.title, id)

        const payload = {
          title: form.title.trim(),
          slug,
          brand: form.brand.trim() || null,
          model: form.model.trim() || null,
          category: form.category.trim() || null,
          condition: form.condition.trim() || null,
          year: form.year ? Number(form.year) : null,
          price: form.price ? Number(form.price) : 0,
          description: form.description.trim() || null,
          location: form.location.trim() || null,
          status: form.status,
          is_published: form.is_published,
        }

        const { error: updateError } = await supabase
          .from('machines')
          .update(payload)
          .eq('id', id)

        if (updateError) throw new Error(updateError.message)

        if (files.length > 0) {
          const imageRows = []

          for (let i = 0; i < files.length; i += 1) {
            const file = files[i]

            const { imagePath, imageUrl } = await uploadMachineImage({
              file,
              userId: user.id,
              machineId: id,
            })

            imageRows.push({
              machine_id: id,
              image_url: imageUrl,
              image_path: imagePath,
              sort_order: existingImages.length + i,
            })
          }

          const { error: imagesError } = await supabase
            .from('machine_images')
            .insert(imageRows)

          if (imagesError) throw new Error(imagesError.message)

          const { data: updatedImages, error: reloadImagesError } = await supabase
            .from('machine_images')
            .select('*')
            .eq('machine_id', id)
            .order('sort_order', { ascending: true })

          if (reloadImagesError) throw new Error(reloadImagesError.message)

          setExistingImages(updatedImages || [])

          if ((updatedImages || []).length > 0) {
            const first = updatedImages[0]
            const coverUrl = first.image_path
              ? getMachineImageUrl(first.image_path)
              : first.image_url

            const { error: coverError } = await supabase
              .from('machines')
              .update({
                cover_image: coverUrl,
                cover_image_path: first.image_path || null,
              })
              .eq('id', id)

            if (coverError) throw new Error(coverError.message)
          }
        }

        setSuccessMessage('Macchinario aggiornato con successo.')
      } else {
        const slug = await generateUniqueSlug(form.title)

        const payload = {
          title: form.title.trim(),
          slug,
          brand: form.brand.trim() || null,
          model: form.model.trim() || null,
          category: form.category.trim() || null,
          condition: form.condition.trim() || null,
          year: form.year ? Number(form.year) : null,
          price: form.price ? Number(form.price) : 0,
          description: form.description.trim() || null,
          location: form.location.trim() || null,
          status: form.status,
          is_published: form.is_published,
          created_by: user.id,
        }

        const { data: insertedMachine, error: machineError } = await supabase
          .from('machines')
          .insert(payload)
          .select()
          .single()

        if (machineError) throw new Error(machineError.message)

        const machineId = insertedMachine.id
        let firstImageUrl = null
        let firstImagePath = null

        if (files.length > 0) {
          const imageRows = []

          for (let i = 0; i < files.length; i += 1) {
            const file = files[i]

            const { imagePath, imageUrl } = await uploadMachineImage({
              file,
              userId: user.id,
              machineId,
            })

            if (i === 0) {
              firstImageUrl = imageUrl
              firstImagePath = imagePath
            }

            imageRows.push({
              machine_id: machineId,
              image_url: imageUrl,
              image_path: imagePath,
              sort_order: i,
            })
          }

          const { error: imagesError } = await supabase
            .from('machine_images')
            .insert(imageRows)

          if (imagesError) throw new Error(imagesError.message)

          if (firstImageUrl) {
            const { error: coverError } = await supabase
              .from('machines')
              .update({
                cover_image: firstImageUrl,
                cover_image_path: firstImagePath,
              })
              .eq('id', machineId)

            if (coverError) throw new Error(coverError.message)
          }
        }

        setSuccessMessage('Macchinario salvato con successo.')
        setForm(initialForm)
        setFiles([])
        setPreviewUrls([])
      }

      setTimeout(() => {
        navigate('/admin/macchinari')
      }, 800)
    } catch (error) {
      setErrorMessage(error.message || 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="content-card">
          <p>Caricamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <div className="page-topbar">
        <div>
          <h1>{isEditMode ? 'Modifica macchinario' : 'Nuovo macchinario'}</h1>
          <p>
            {isEditMode
              ? 'Aggiorna i dati e le immagini della scheda prodotto.'
              : 'Compila i dati principali e carica le immagini della scheda prodotto.'}
          </p>
        </div>

        <div className="topbar-actions">
          <BackButton fallback="/admin/macchinari" />
        </div>
      </div>

      <div className="content-card form-card">
        <form className="machine-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Titolo *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Es. Incollatrice automatica XYZ"
                required
              />
            </div>

            <div className="form-group">
              <label>Marca</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Modello</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Condizione</label>
              <input
                type="text"
                value={form.condition}
                onChange={(e) => updateField('condition', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Anno</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => updateField('year', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Prezzo (€)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Stato</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
              >
                <option value="available">Disponibile</option>
                <option value="reserved">Riservato</option>
                <option value="sold">Venduto</option>
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Descrizione</label>
              <textarea
                rows="6"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            {isEditMode && existingImages.length > 0 && (
              <div className="form-group form-group-full">
                <label>Immagini attuali</label>
                <div className="image-preview-grid">
                  {existingImages.map((image, index) => (
                    <div className="image-preview-card" key={image.id}>
                      <img
                        src={
                          image.image_path
                            ? getMachineImageUrl(image.image_path)
                            : image.image_url
                        }
                        alt={`Immagine ${index + 1}`}
                      />
                      {index === 0 && <span className="cover-badge">Copertina</span>}
                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() => handleDeleteExistingImage(image)}
                      >
                        Elimina
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group form-group-full">
              <label>{isEditMode ? 'Aggiungi nuove immagini' : 'Immagini'}</label>
              <input type="file" multiple accept="image/*" onChange={handleFilesChange} />
              <small>
                {isEditMode
                  ? 'Le nuove immagini verranno aggiunte alla galleria.'
                  : 'La prima immagine sarà usata come copertina.'}
              </small>
            </div>

            {previewUrls.length > 0 && (
              <div className="form-group form-group-full">
                <div className="image-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div className="image-preview-card" key={url}>
                      <img src={url} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group form-group-full checkbox-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => updateField('is_published', e.target.checked)}
                />
                <span>Pubblica nello store</span>
              </label>
            </div>
          </div>

          {errorMessage && <div className="auth-message error">{errorMessage}</div>}
          {successMessage && <div className="auth-message success">{successMessage}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate('/admin/macchinari')}
            >
              Annulla
            </button>

            <button type="submit" className="auth-button" disabled={saving}>
              {saving
                ? isEditMode
                  ? 'Salvataggio...'
                  : 'Creazione...'
                : isEditMode
                ? 'Salva modifiche'
                : 'Salva macchinario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}