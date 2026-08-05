/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/purity */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/AdminLayout'
import { getMachineImageUrl } from '../lib/storagePublicUrl'
import { slugify } from '../lib/slugify'
import '../styles/AdminMachinesPage.css'

function getCopyTitle(title = '') {
  return `${title.trim() || 'Macchinario'} (copia)`
}

function getFileExtension(path = '') {
  const cleanPath = path.split('?')[0]
  const extension = cleanPath.includes('.') ? cleanPath.split('.').pop() : 'jpg'
  return extension || 'jpg'
}

async function duplicateStoredMachineImage(sourcePath, destinationPath) {
  const bucket = supabase.storage.from('machines')

  if (typeof bucket.copy === 'function') {
    const { error: copyError } = await bucket.copy(sourcePath, destinationPath)
    if (!copyError) return
    console.warn('Copia diretta storage non riuscita, provo tramite upload:', copyError.message)
  }

  const response = await fetch(getMachineImageUrl(sourcePath))
  if (!response.ok) {
    throw new Error('Impossibile leggere una delle immagini originali.')
  }

  const imageBlob = await response.blob()
  const { error: uploadError } = await bucket.upload(destinationPath, imageBlob, {
    cacheControl: '3600',
    upsert: false,
    contentType: imageBlob.type || undefined,
  })

  if (uploadError) throw new Error(uploadError.message)
}

export default function AdminMachinesPage() {
  const { user, profile } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [operationMessage, setOperationMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [duplicatingId, setDuplicatingId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [movingOrder, setMovingOrder] = useState(false)

  const canReorder = profile?.role === 'admin'

  async function loadMachines() {
    setLoading(true)
    setErrorMessage('')

    try {
      let query = supabase
        .from('machines')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (profile?.role !== 'admin') {
        query = query.eq('created_by', user.id)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      setMachines(data || [])
      setSelectedId((currentId) => (
        currentId && (data || []).some((machine) => machine.id === currentId)
          ? currentId
          : null
      ))
    } catch (error) {
      setErrorMessage(error.message || 'Errore nel caricamento macchinari.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!profile && !user) return
    loadMachines()
  }, [profile, user])

  async function generateUniqueSlug(title) {
    const baseSlug = slugify(title) || `macchinario-${Date.now()}`
    const { data, error } = await supabase
      .from('machines')
      .select('id')
      .eq('slug', baseSlug)
      .limit(1)

    if (error) throw new Error(error.message)
    return data?.length ? `${baseSlug}-${Date.now()}` : baseSlug
  }

  async function handleDelete(machine) {
    const confirmDelete = window.confirm(
      `Vuoi davvero eliminare "${machine.title}"?`
    )
    if (!confirmDelete) return

    try {
      setDeletingId(machine.id)
      setOperationMessage('')

      const { data: imageRows, error: imageRowsError } = await supabase
        .from('machine_images')
        .select('image_path')
        .eq('machine_id', machine.id)

      if (imageRowsError) throw new Error(imageRowsError.message)

      const pathsToDelete = (imageRows || [])
        .map((row) => row.image_path)
        .filter(Boolean)

      if (machine.cover_image_path && !pathsToDelete.includes(machine.cover_image_path)) {
        pathsToDelete.push(machine.cover_image_path)
      }

      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('machines')
          .remove(pathsToDelete)

        if (storageError) {
          console.warn('Errore cancellazione file storage:', storageError.message)
        }
      }

      const { error: deleteError } = await supabase
        .from('machines')
        .delete()
        .eq('id', machine.id)

      if (deleteError) throw new Error(deleteError.message)

      setMachines((prev) => prev.filter((item) => item.id !== machine.id))
      setSelectedId((currentId) => currentId === machine.id ? null : currentId)
      setOperationMessage('Macchinario eliminato correttamente.')
    } catch (error) {
      alert(error.message || 'Errore durante l’eliminazione.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleDuplicate(machine) {
    const confirmDuplicate = window.confirm(
      `Vuoi duplicare "${machine.title}"? La copia verrà creata come bozza.`
    )
    if (!confirmDuplicate) return

    let duplicatedMachineId = null
    const copiedStoragePaths = []

    try {
      setDuplicatingId(machine.id)
      setErrorMessage('')
      setOperationMessage('')

      const { data: imageRows, error: imagesError } = await supabase
        .from('machine_images')
        .select('*')
        .eq('machine_id', machine.id)
        .order('sort_order', { ascending: true })

      if (imagesError) throw new Error(imagesError.message)

      const copyTitle = getCopyTitle(machine.title)
      const copySlug = await generateUniqueSlug(copyTitle)
      const maxOrder = machines.reduce((currentMax, item, index) => {
        const value = Number(item.display_order)
        return Math.max(currentMax, Number.isFinite(value) ? value : index)
      }, -1)

      const excludedFields = new Set([
        'id',
        'created_at',
        'updated_at',
        'cover_image',
        'cover_image_path',
        'display_order',
      ])
      const copyableFields = Object.fromEntries(
        Object.entries(machine).filter(([key]) => !excludedFields.has(key))
      )

      const { data: duplicatedMachine, error: insertError } = await supabase
        .from('machines')
        .insert({
          ...copyableFields,
          title: copyTitle,
          slug: copySlug,
          cover_image: null,
          cover_image_path: null,
          is_published: false,
          created_by: user.id,
          display_order: maxOrder + 1,
        })
        .select('*')
        .single()

      if (insertError) throw new Error(insertError.message)
      duplicatedMachineId = duplicatedMachine.id

      const sourceImages = (imageRows || []).length > 0
        ? imageRows
        : machine.cover_image
          ? [{
              image_path: machine.cover_image_path || null,
              image_url: machine.cover_image,
              sort_order: 0,
            }]
          : []
      const duplicatedImageRows = []

      for (let index = 0; index < sourceImages.length; index += 1) {
        const image = sourceImages[index]
        let imagePath = null
        let imageUrl = image.image_url || null

        if (image.image_path) {
          const extension = getFileExtension(image.image_path)
          imagePath = `${user.id}/${duplicatedMachine.id}/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${extension}`

          await duplicateStoredMachineImage(image.image_path, imagePath)
          copiedStoragePaths.push(imagePath)
          imageUrl = getMachineImageUrl(imagePath)
        }

        duplicatedImageRows.push({
          machine_id: duplicatedMachine.id,
          image_url: imageUrl,
          image_path: imagePath,
          sort_order: index,
        })
      }

      if (duplicatedImageRows.length > 0) {
        const { error: imageInsertError } = await supabase
          .from('machine_images')
          .insert(duplicatedImageRows)

        if (imageInsertError) throw new Error(imageInsertError.message)

        const firstImage = duplicatedImageRows[0]
        const { error: coverError } = await supabase
          .from('machines')
          .update({
            cover_image: firstImage.image_url,
            cover_image_path: firstImage.image_path,
          })
          .eq('id', duplicatedMachine.id)

        if (coverError) throw new Error(coverError.message)
      }

      await loadMachines()
      setSelectedId(duplicatedMachine.id)
      setOperationMessage(`Duplicato creato come bozza: ${copyTitle}`)
    } catch (error) {
      if (copiedStoragePaths.length > 0) {
        await supabase.storage.from('machines').remove(copiedStoragePaths)
      }

      if (duplicatedMachineId) {
        await supabase.from('machines').delete().eq('id', duplicatedMachineId)
      }

      setErrorMessage(error.message || 'Errore durante la duplicazione del macchinario.')
    } finally {
      setDuplicatingId(null)
    }
  }

  async function moveSelectedMachine(direction) {
    const selectedIndex = machines.findIndex((machine) => machine.id === selectedId)
    const targetIndex = direction === 'up' ? selectedIndex - 1 : selectedIndex + 1

    if (selectedIndex < 0 || targetIndex < 0 || targetIndex >= machines.length) return

    const reorderedMachines = [...machines]
    const [selectedMachine] = reorderedMachines.splice(selectedIndex, 1)
    reorderedMachines.splice(targetIndex, 0, selectedMachine)

    try {
      setMovingOrder(true)
      setErrorMessage('')
      setOperationMessage('')

      const orderedIds = reorderedMachines.map((machine) => String(machine.id))
      const { error } = await supabase.rpc('reorder_machines', {
        p_order: orderedIds,
      })

      if (error) throw new Error(error.message)

      setMachines(reorderedMachines.map((machine, index) => ({
        ...machine,
        display_order: index,
      })))
      setOperationMessage('Ordine dello store aggiornato.')
    } catch (error) {
      setErrorMessage(
        error.message?.includes('reorder_machines')
          ? 'La funzione di ordinamento non è ancora presente su Supabase. Esegui lo script SQL incluso nel progetto.'
          : error.message || 'Errore durante lo spostamento del macchinario.'
      )
    } finally {
      setMovingOrder(false)
    }
  }

  function getMachineCover(machine) {
    if (machine.cover_image_path) return getMachineImageUrl(machine.cover_image_path)
    return machine.cover_image || ''
  }

  const selectedIndex = useMemo(
    () => machines.findIndex((machine) => machine.id === selectedId),
    [machines, selectedId]
  )

  return (
    <AdminLayout
      title="Macchinari"
      subtitle="Gestisci le schede dello store, duplica i prodotti e stabilisci l’ordine di visualizzazione."
      actions={<Link to="/admin/macchinari/nuovo" className="admin-primary-button">+ Nuovo macchinario</Link>}
    >
      {operationMessage ? <div className="admin-operation-message">{operationMessage}</div> : null}
      {errorMessage ? <div className="auth-message error admin-machines-error">{errorMessage}</div> : null}

      <div className="admin-panel-card admin-machines-card">
        {canReorder && machines.length > 1 ? (
          <div className="machine-order-toolbar">
            <div>
              <strong>Ordine nello store pubblico</strong>
              <span>Seleziona un macchinario, poi spostalo sopra o sotto.</span>
            </div>

            <div className="machine-order-actions">
              <button
                type="button"
                onClick={() => moveSelectedMachine('up')}
                disabled={movingOrder || selectedIndex <= 0}
              >
                ↑ Sposta sopra
              </button>
              <button
                type="button"
                onClick={() => moveSelectedMachine('down')}
                disabled={movingOrder || selectedIndex < 0 || selectedIndex >= machines.length - 1}
              >
                ↓ Sposta sotto
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p>Caricamento...</p>
        ) : machines.length === 0 ? (
          <div className="empty-state">
            <h3>Nessun macchinario presente</h3>
            <p>Inizia creando la prima scheda prodotto.</p>
          </div>
        ) : (
          <div className="machine-list">
            {machines.map((machine, index) => (
              <div
                className={`machine-row${selectedId === machine.id ? ' is-selected' : ''}`}
                key={machine.id}
              >
                {canReorder ? (
                  <label className="machine-order-selector" title="Seleziona per cambiare ordine">
                    <input
                      type="radio"
                      name="machine-order"
                      checked={selectedId === machine.id}
                      onChange={() => setSelectedId(machine.id)}
                    />
                    <span>{index + 1}</span>
                  </label>
                ) : null}

                <div className="machine-row-left">
                  <div className="machine-thumb">
                    {getMachineCover(machine) ? (
                      <img src={getMachineCover(machine)} alt={machine.title} />
                    ) : (
                      <div className="machine-thumb-placeholder">No image</div>
                    )}
                  </div>

                  <div className="machine-row-main">
                    <h3>{machine.title}</h3>
                    <p>
                      {[machine.brand, machine.model, machine.category]
                        .filter(Boolean)
                        .join(' · ') || 'Dati tecnici non inseriti'}
                    </p>
                  </div>
                </div>

                <div className="machine-row-meta">
                  <span className={`status-badge status-${machine.status}`}>
                    {machine.status === 'available'
                      ? 'Disponibile'
                      : machine.status === 'reserved'
                      ? 'Riservato'
                      : 'Venduto'}
                  </span>

                  <span className="publish-badge">
                    {machine.is_published ? 'Pubblicato' : 'Bozza'}
                  </span>

                  <strong className="machine-admin-price">
                    {Number(machine.price || 0).toLocaleString('it-IT', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                    {machine.price_includes_vat === false ? <small>IVA esclusa</small> : null}
                  </strong>

                  <div className="machine-row-actions">
                    <Link
                      to={`/admin/macchinari/${machine.id}/modifica`}
                      className="machine-action-btn machine-action-btn--edit"
                    >
                      Modifica
                    </Link>

                    <button
                      type="button"
                      className="machine-action-btn machine-action-btn--duplicate"
                      onClick={() => handleDuplicate(machine)}
                      disabled={duplicatingId === machine.id || deletingId === machine.id}
                    >
                      {duplicatingId === machine.id ? 'Duplico...' : 'Duplica'}
                    </button>

                    <button
                      type="button"
                      className="machine-action-btn machine-action-btn--delete"
                      onClick={() => handleDelete(machine)}
                      disabled={deletingId === machine.id || duplicatingId === machine.id}
                    >
                      {deletingId === machine.id ? 'Elimino...' : 'Elimina'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
