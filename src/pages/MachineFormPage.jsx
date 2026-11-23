/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { slugify } from '../lib/slugify'
import { useAuth } from '../context/AuthContext'
import { uploadMachineImage } from '../lib/storage'
import { getMachineImageUrl } from '../lib/storagePublicUrl'
import { clearMachineDraftFiles, loadMachineDraftFiles, saveMachineDraftFiles } from '../lib/machineDraft'
import { getMachineMissingTranslations, MACHINE_TRANSLATABLE_FIELDS, translateMachineWithDeepL } from '../i18n/machineTranslations'
import AdminLayout from '../components/AdminLayout'
import FileUploadField from '../components/FileUploadField'
import '../styles/MachineFormPage.css'

const DRAFT_KEY = 'idealtech-new-machine-draft-v2'
const DRAFT_TRANSLATIONS_KEY = 'idealtech-new-machine-draft-translations-v1'

const initialForm = {
  title: '',
  brand: '',
  model: '',
  category: '',
  condition: '',
  year: '',
  price: '',
  price_includes_vat: true,
  description: '',
  location: '',
  status: 'available',
  is_published: false,
}

function getInitialDraftTranslations(isEditMode) {
  if (isEditMode || typeof window === 'undefined') return {}
  try { return JSON.parse(window.localStorage.getItem(DRAFT_TRANSLATIONS_KEY) || '{}') }
  catch { return {} }
}

function getInitialForm(isEditMode) {
  if (isEditMode || typeof window === 'undefined') return initialForm

  try {
    const saved = window.localStorage.getItem(DRAFT_KEY)
    return saved ? { ...initialForm, ...JSON.parse(saved) } : initialForm
  } catch {
    return initialForm
  }
}

export default function MachineFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEditMode = useMemo(() => Boolean(id), [id])

  const [form, setForm] = useState(() => getInitialForm(Boolean(id)))
  const [translations, setTranslations] = useState(() => getInitialDraftTranslations(Boolean(id)))
  const [translationLanguage, setTranslationLanguage] = useState('en')
  const [translating, setTranslating] = useState(false)
  const [translationNotice, setTranslationNotice] = useState('')
  const [files, setFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEditMode)
  const [draftLoaded, setDraftLoaded] = useState(isEditMode)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const previewUrls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  )

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url))
  }, [previewUrls])

  useEffect(() => {
    if (isEditMode || !draftLoaded) return
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    window.localStorage.setItem(DRAFT_TRANSLATIONS_KEY, JSON.stringify(translations))
  }, [form, translations, isEditMode, draftLoaded])

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    // An edited Italian source invalidates only this field in EN/TR.
    // It cannot silently keep translations belonging to the previous text.
    if (MACHINE_TRANSLATABLE_FIELDS.includes(name)) {
      setTranslations((current) => {
        const next = structuredClone(current || {})
        for (const lang of ['en', 'tr']) {
          if (next[lang]) delete next[lang][name]
        }
        return next
      })
      setTranslationNotice('Il testo italiano è cambiato: rigenera le traduzioni EN/TR prima di pubblicare.')
    }
  }

  function updateTranslatedField(language, field, value) {
    setTranslations((current) => ({
      ...current,
      [language]: { ...(current[language] || {}), [field]: value },
    }))
    setTranslationNotice('Traduzione modificata. Salva la scheda per renderla pubblica.')
  }

  async function translateNow() {
    setTranslating(true)
    setErrorMessage('')
    setTranslationNotice('')
    try {
      const next = await translateMachineWithDeepL({ ...form, translations }, { force: true })
      setTranslations(next)
      setTranslationNotice('Traduzioni complete EN/TR generate con DeepL. Controllale e salva la scheda.')
    } catch (error) {
      setErrorMessage(error.message || 'Traduzione non riuscita.')
    } finally {
      setTranslating(false)
    }
  }

  async function handleFilesChange(event) {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles(selectedFiles)
    if (!isEditMode) {
      try {
        await saveMachineDraftFiles(selectedFiles)
      } catch (error) {
        console.warn('Impossibile salvare le immagini nella bozza:', error)
      }
    }
  }

  async function clearDraft() {
    const hasData = Object.entries(form).some(([key, value]) => {
      if (key === 'status') return value !== 'available'
      if (key === 'price_includes_vat') return value !== true
      return Boolean(value)
    }) || files.length > 0

    if (hasData && !window.confirm('Vuoi svuotare tutti i dati della bozza?')) return

    setForm(initialForm)
    setTranslations({})
    setFiles([])
    window.localStorage.removeItem(DRAFT_KEY)
    window.localStorage.removeItem(DRAFT_TRANSLATIONS_KEY)
    await clearMachineDraftFiles().catch(() => {})
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

      setTranslations(machineData.translations || {})
      setForm({
        title: machineData.title || '',
        brand: machineData.brand || '',
        model: machineData.model || '',
        category: machineData.category || '',
        condition: machineData.condition || '',
        year: machineData.year || '',
        price: machineData.price ?? '',
        price_includes_vat: machineData.price_includes_vat !== false,
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

  useEffect(() => {
    if (isEditMode) {
      loadMachine()
      return
    }

    let active = true
    loadMachineDraftFiles()
      .then((savedFiles) => {
        if (active && savedFiles.length) setFiles(savedFiles)
      })
      .catch((error) => console.warn('Impossibile ripristinare le immagini della bozza:', error))
      .finally(() => {
        if (active) setDraftLoaded(true)
      })

    return () => {
      active = false
    }
  }, [isEditMode, id])

  async function generateUniqueSlug(baseTitle, currentId = null) {
    const baseSlug = slugify(baseTitle)
    const safeSlug = baseSlug || `macchinario-${Date.now()}`
    const { data, error } = await supabase.from('machines').select('id, slug').eq('slug', safeSlug)
    if (error) throw new Error(error.message)
    const conflict = (data || []).find((row) => row.id !== currentId)
    return conflict ? `${safeSlug}-${Date.now()}` : safeSlug
  }


  async function getNextDisplayOrder() {
    const { data, error } = await supabase
      .from('machines')
      .select('display_order')
      .order('display_order', { ascending: false, nullsFirst: false })
      .limit(1)

    if (error) throw new Error(error.message)

    const currentMax = Number(data?.[0]?.display_order)
    return Number.isFinite(currentMax) ? currentMax + 1 : 0
  }

  async function handleDeleteExistingImage(image) {
    if (!window.confirm('Vuoi eliminare questa immagine?')) return

    try {
      if (image.image_path) {
        const { error: storageError } = await supabase.storage.from('machines').remove([image.image_path])
        if (storageError) console.warn(storageError.message)
      }

      const { error } = await supabase.from('machine_images').delete().eq('id', image.id)
      if (error) throw new Error(error.message)

      const nextImages = existingImages.filter((img) => img.id !== image.id)
      setExistingImages(nextImages)

      if (nextImages.length > 0) {
        const first = nextImages[0]
        const nextCoverUrl = first.image_path ? getMachineImageUrl(first.image_path) : first.image_url
        const { error: coverError } = await supabase
          .from('machines')
          .update({ cover_image: nextCoverUrl, cover_image_path: first.image_path || null })
          .eq('id', id)
        if (coverError) throw new Error(coverError.message)
      } else {
        const { error: coverResetError } = await supabase
          .from('machines')
          .update({ cover_image: null, cover_image_path: null })
          .eq('id', id)
        if (coverResetError) throw new Error(coverResetError.message)
      }
    } catch (error) {
      alert(error.message || 'Errore durante l’eliminazione immagine.')
    }
  }

  function buildPayload(slug, translatedValues = translations) {
    return {
      title: form.title.trim(),
      slug,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      category: form.category.trim() || null,
      condition: form.condition.trim() || null,
      year: form.year ? Number(form.year) : null,
      price: form.price !== '' ? Number(form.price) : 0,
      price_includes_vat: Boolean(form.price_includes_vat),
      description: form.description.trim() || null,
      translations: translatedValues,
      location: form.location.trim() || null,
      status: form.status,
      is_published: form.is_published,
    }
  }

  async function uploadNewImages(machineId, startingOrder = 0) {
    if (!files.length) return []
    const rows = []

    for (let i = 0; i < files.length; i += 1) {
      const { imagePath, imageUrl } = await uploadMachineImage({
        file: files[i],
        userId: user.id,
        machineId,
      })
      rows.push({
        machine_id: machineId,
        image_url: imageUrl,
        image_path: imagePath,
        sort_order: startingOrder + i,
      })
    }

    const { error } = await supabase.from('machine_images').insert(rows)
    if (error) throw new Error(error.message)
    return rows
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      if (!form.title.trim()) throw new Error('Il titolo è obbligatorio.')
      let checkedTranslations = translations
      // A published listing must have full field-level translations. If the
      // editor has not generated them yet, translate BEFORE writing to DB.
      if (form.is_published && getMachineMissingTranslations({ ...form, translations }).length > 0) {
        checkedTranslations = await translateMachineWithDeepL({ ...form, translations })
        setTranslations(checkedTranslations)
      }
      if (form.is_published && getMachineMissingTranslations({ ...form, translations: checkedTranslations }).length) {
        throw new Error('Traduzioni mancanti: non è possibile pubblicare la scheda.')
      }

      if (isEditMode) {
        const slug = await generateUniqueSlug(form.title, id)
        const { error: updateError } = await supabase.from('machines').update(buildPayload(slug, checkedTranslations)).eq('id', id)
        if (updateError) throw new Error(updateError.message)

        const newRows = await uploadNewImages(id, existingImages.length)
        if (newRows.length) {
          const { data: updatedImages, error: reloadError } = await supabase
            .from('machine_images')
            .select('*')
            .eq('machine_id', id)
            .order('sort_order', { ascending: true })
          if (reloadError) throw new Error(reloadError.message)
          setExistingImages(updatedImages || [])

          const first = updatedImages?.[0]
          if (first) {
            const coverUrl = first.image_path ? getMachineImageUrl(first.image_path) : first.image_url
            const { error: coverError } = await supabase
              .from('machines')
              .update({ cover_image: coverUrl, cover_image_path: first.image_path || null })
              .eq('id', id)
            if (coverError) throw new Error(coverError.message)
          }
        }

        setSuccessMessage('Macchinario aggiornato con successo.')
        setTimeout(() => navigate('/admin/macchinari', { replace: true }), 600)
      } else {
        const slug = await generateUniqueSlug(form.title)
        const displayOrder = await getNextDisplayOrder()
        const { data: insertedMachine, error: machineError } = await supabase
          .from('machines')
          .insert({
            ...buildPayload(slug, checkedTranslations),
            created_by: user.id,
            display_order: displayOrder,
          })
          .select()
          .single()

        if (machineError) throw new Error(machineError.message)

        const rows = await uploadNewImages(insertedMachine.id)
        const first = rows[0]
        if (first) {
          const { error: coverError } = await supabase
            .from('machines')
            .update({ cover_image: first.image_url, cover_image_path: first.image_path })
            .eq('id', insertedMachine.id)
          if (coverError) throw new Error(coverError.message)
        }

        window.localStorage.removeItem(DRAFT_KEY)
        window.localStorage.removeItem(DRAFT_TRANSLATIONS_KEY)
        await clearMachineDraftFiles().catch(() => {})
        setSuccessMessage('Macchinario creato con successo. Torno alla dashboard...')
        setTimeout(() => navigate('/admin', { replace: true }), 600)
      }
    } catch (error) {
      setErrorMessage(error.message || 'Errore durante il salvataggio.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Macchinario" subtitle="Caricamento della scheda in corso...">
        <div className="admin-panel-card form-card"><p>Caricamento...</p></div>
      </AdminLayout>
    )
  }

  const actions = (
    <>
      {!isEditMode ? <span className="machine-draft-status">Bozza salvata automaticamente</span> : null}
      {!isEditMode ? <button type="button" className="admin-secondary-button" onClick={clearDraft}>Svuota bozza</button> : null}
      <button type="button" className="admin-secondary-button" onClick={() => navigate(isEditMode ? '/admin/macchinari' : '/admin')}>Annulla</button>
    </>
  )

  return (
    <AdminLayout
      title={isEditMode ? 'Modifica macchinario' : 'Nuovo macchinario'}
      subtitle={isEditMode ? 'Aggiorna dati, prezzo e immagini della scheda.' : 'Puoi cambiare pagina: campi e immagini resteranno memorizzati nella bozza.'}
      actions={actions}
    >
      <div className="admin-panel-card form-card">
        <form className="machine-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Titolo *</label>
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Es. Impianto hot melt completo" required />
            </div>

            <div className="form-group">
              <label>Marca</label>
              <input type="text" value={form.brand} onChange={(e) => updateField('brand', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Modello</label>
              <input type="text" value={form.model} onChange={(e) => updateField('model', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Categoria</label>
              <input type="text" value={form.category} onChange={(e) => updateField('category', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Condizione</label>
              <input type="text" value={form.condition} onChange={(e) => updateField('condition', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Anno</label>
              <input type="number" value={form.year} onChange={(e) => updateField('year', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Prezzo (€)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => updateField('price', e.target.value)} />
            </div>

            <div className="form-group form-group-full">
              <label>Indicazione IVA del prezzo</label>
              <div className="vat-choice">
                <label className={form.price_includes_vat ? 'is-selected' : ''}>
                  <input type="radio" name="vat-mode" checked={form.price_includes_vat} onChange={() => updateField('price_includes_vat', true)} />
                  <span><strong>Prezzo IVA inclusa</strong><small>Nessuna dicitura aggiuntiva nello store.</small></span>
                </label>
                <label className={!form.price_includes_vat ? 'is-selected' : ''}>
                  <input type="radio" name="vat-mode" checked={!form.price_includes_vat} onChange={() => updateField('price_includes_vat', false)} />
                  <span><strong>Prezzo IVA esclusa</strong><small>Accanto al prezzo apparirà “IVA esclusa”.</small></span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Stato</label>
              <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                <option value="available">Disponibile</option>
                <option value="reserved">Riservato</option>
                <option value="sold">Venduto</option>
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Descrizione</label>
              <textarea rows="7" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Descrivi caratteristiche, dotazioni e condizioni del macchinario." />
            </div>

            <div className="form-group form-group-full machine-translation-panel">
              <div className="machine-translation-panel__heading">
                <div>
                  <strong>Traduzioni della scheda · IT / EN / TR</strong>
                  <p>Traduzioni dell'intera frase salvate nel database. Nessuna sostituzione di singole parole sul sito pubblico.</p>
                  <small>{getMachineMissingTranslations({ ...form, translations }).length
                    ? `${getMachineMissingTranslations({ ...form, translations }).length} campi EN/TR ancora da completare`
                    : 'Tutti i testi compilati hanno EN e TR.'}</small>
                </div>
                <button type="button" className="admin-primary-button" disabled={saving || translating} onClick={translateNow}>
                  {translating ? 'Traduzione in corso…' : 'Traduci / Rigenera EN + TR con DeepL'}
                </button>
              </div>
              {translationNotice ? <div className="machine-translation-notice">{translationNotice}</div> : null}
              <div className="machine-translation-tabs" role="tablist" aria-label="Lingua traduzioni macchinario">
                {['en', 'tr'].map((lang) => (
                  <button type="button" role="tab" aria-selected={translationLanguage === lang}
                    className={translationLanguage === lang ? 'is-active' : ''} key={lang}
                    onClick={() => setTranslationLanguage(lang)}>{lang === 'en' ? 'English' : 'Türkçe'}</button>
                ))}
              </div>
              <div className="machine-translation-fields">
                {MACHINE_TRANSLATABLE_FIELDS.map((field) => (
                  <label key={field}>
                    <span>{({ title: 'Titolo', category: 'Categoria', condition: 'Condizione', description: 'Descrizione' })[field]} · {translationLanguage.toUpperCase()}</span>
                    {field === 'description' ? (
                      <textarea rows="5" value={translations?.[translationLanguage]?.[field] || ''}
                        onChange={(e) => updateTranslatedField(translationLanguage, field, e.target.value)} />
                    ) : (
                      <input type="text" value={translations?.[translationLanguage]?.[field] || ''}
                        onChange={(e) => updateTranslatedField(translationLanguage, field, e.target.value)} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {isEditMode && existingImages.length > 0 ? (
              <div className="form-group form-group-full">
                <label>Immagini attuali</label>
                <div className="image-preview-grid">
                  {existingImages.map((image, index) => (
                    <div className="image-preview-card" key={image.id}>
                      <img src={image.image_path ? getMachineImageUrl(image.image_path) : image.image_url} alt={`Immagine ${index + 1}`} />
                      {index === 0 ? <span className="cover-badge">Copertina</span> : null}
                      <button type="button" className="delete-image-btn" onClick={() => handleDeleteExistingImage(image)}>Elimina</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="form-group form-group-full">
              <label>{isEditMode ? 'Aggiungi nuove immagini' : 'Immagini'}</label>
              <FileUploadField
                multiple
                accept="image/*"
                selectedFiles={files}
                onChange={handleFilesChange}
                buttonText={isEditMode ? 'Aggiungi immagini' : 'Scegli immagini'}
                emptyText="Nessuna immagine selezionata"
              />
              <small>{isEditMode ? 'Le nuove immagini verranno aggiunte alla galleria.' : 'Anche le immagini selezionate restano nella bozza quando cambi pagina. La prima sarà la copertina.'}</small>
            </div>

            {previewUrls.length > 0 ? (
              <div className="form-group form-group-full">
                <div className="image-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div className="image-preview-card" key={`${url}-${index}`}>
                      <img src={url} alt={`Preview ${index + 1}`} />
                      {index === 0 && !isEditMode ? <span className="cover-badge">Copertina</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="form-group form-group-full checkbox-group">
              <label className="checkbox-row">
                <input type="checkbox" checked={form.is_published} onChange={(e) => updateField('is_published', e.target.checked)} />
                <span>Pubblica subito nello store</span>
              </label>
            </div>
          </div>

          {errorMessage ? <div className="auth-message error">{errorMessage}</div> : null}
          {successMessage ? <div className="auth-message success">{successMessage}</div> : null}

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate(isEditMode ? '/admin/macchinari' : '/admin')}>Annulla</button>
            <button type="submit" className="auth-button" disabled={saving || translating}>
              {saving ? 'Salvataggio...' : isEditMode ? 'Salva modifiche' : 'Crea macchinario'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
