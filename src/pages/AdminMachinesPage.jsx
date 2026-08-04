import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/AdminLayout'
import { getMachineImageUrl } from '../lib/storagePublicUrl'
import '../styles/AdminMachinesPage.css'

export default function AdminMachinesPage() {
  const { user, profile } = useAuth()
  const [machines, setMachines] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  async function loadMachines() {
    setLoading(true)
    setErrorMessage('')

    try {
      let query = supabase
        .from('machines')
        .select('*')
        .order('created_at', { ascending: false })

      if (profile?.role !== 'admin') {
        query = query.eq('created_by', user.id)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      setMachines(data || [])
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

  async function handleDelete(machine) {
    const confirmDelete = window.confirm(
      `Vuoi davvero eliminare "${machine.title}"?`
    )
    if (!confirmDelete) return

    try {
      setDeletingId(machine.id)

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
    } catch (error) {
      alert(error.message || 'Errore durante l’eliminazione.')
    } finally {
      setDeletingId(null)
    }
  }

  function getMachineCover(machine) {
    if (machine.cover_image_path) return getMachineImageUrl(machine.cover_image_path)
    return machine.cover_image || ''
  }

  return (
    <AdminLayout
      title="Macchinari"
      subtitle="Gestisci le schede dello store, controlla la pubblicazione e aggiorna i prezzi."
      actions={<Link to="/admin/macchinari/nuovo" className="admin-primary-button">+ Nuovo macchinario</Link>}
    >
      <div className="admin-panel-card admin-machines-card">
        {loading ? (
          <p>Caricamento...</p>
        ) : errorMessage ? (
          <div className="auth-message error">{errorMessage}</div>
        ) : machines.length === 0 ? (
          <div className="empty-state">
            <h3>Nessun macchinario presente</h3>
            <p>Inizia creando la prima scheda prodotto.</p>
          </div>
        ) : (
          <div className="machine-list">
            {machines.map((machine) => (
              <div className="machine-row" key={machine.id}>
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
                      {machine.brand || '—'} · {machine.model || '—'} ·{' '}
                      {machine.category || '—'}
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
                      className="machine-action-btn machine-action-btn--delete"
                      onClick={() => handleDelete(machine)}
                      disabled={deletingId === machine.id}
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