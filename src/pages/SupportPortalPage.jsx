import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SupportTicketChat from '../components/SupportTicketChat'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ensureSupportCustomer, formatSupportDate, formatTicketNumber, loadUnreadCounts, SUPPORT_STATUS } from '../lib/support'
import '../styles/SupportPortal.css'

const emptyTicket = {
  subject: '',
  machineName: '',
  serialNumber: '',
  problemDescription: '',
  priority: 'normal',
}

export default function SupportPortalPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user, supportCustomer, refreshAccount, signOut } = useAuth()
  const [tickets, setTickets] = useState([])
  const [unreadCounts, setUnreadCounts] = useState({})
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [ticketForm, setTicketForm] = useState(emptyTicket)
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === ticketId) || null,
    [tickets, ticketId]
  )

  const visibleTickets = useMemo(() => tickets.filter((ticket) => (
    filter === 'closed' ? ticket.status === 'closed' : ticket.status !== 'closed'
  )), [tickets, filter])

  async function loadTickets({ quiet = false } = {}) {
    if (!user?.id) return
    try {
      if (!quiet) setLoading(true)
      setError('')

      const { data, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('customer_id', user.id)
        .order('last_message_at', { ascending: false })

      if (ticketsError) throw ticketsError
      const nextTickets = data || []
      setTickets(nextTickets)
      const counts = await loadUnreadCounts(nextTickets.map((item) => item.id), user.id)
      setUnreadCounts(counts)
    } catch (err) {
      setError(err.message || 'Impossibile caricare i ticket di assistenza.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true

    async function bootstrap() {
      try {
        if (!supportCustomer) {
          await ensureSupportCustomer(user)
          await refreshAccount()
        }
        if (active) await loadTickets()
      } catch (err) {
        if (active) {
          setError(err.message || 'Portale assistenza non disponibile.')
          setLoading(false)
        }
      }
    }

    bootstrap()

    const channel = supabase
      .channel(`support-customer-portal-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => loadTickets({ quiet: true }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => loadTickets({ quiet: true }))
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  function clearUnread(ticket) {
    setUnreadCounts((current) => ({ ...current, [ticket]: 0 }))
  }

  function updateTicket(updated) {
    setTickets((current) => current
      .map((item) => item.id === updated.id ? updated : item)
      .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)))
  }

  async function createTicket(event) {
    event.preventDefault()
    if (!user?.id) return

    try {
      setCreating(true)
      setFormError('')

      const subject = ticketForm.subject.trim()
      const problemDescription = ticketForm.problemDescription.trim()
      if (!subject || !problemDescription) throw new Error('Inserisci oggetto e descrizione del problema.')

      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          customer_id: user.id,
          subject,
          machine_name: ticketForm.machineName.trim() || null,
          serial_number: ticketForm.serialNumber.trim() || null,
          problem_description: problemDescription,
          priority: ticketForm.priority,
          status: 'open',
        })
        .select('*')
        .single()

      if (ticketError) throw ticketError

      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({ ticket_id: ticket.id, sender_id: user.id, message: problemDescription })
      if (messageError) throw messageError

      setTicketForm(emptyTicket)
      setShowNewTicket(false)
      setFilter('active')
      await loadTickets({ quiet: true })
      navigate(`/assistenza/portale/${ticket.id}`)
    } catch (err) {
      setFormError(err.message || 'Impossibile aprire il ticket.')
    } finally {
      setCreating(false)
    }
  }

  async function handleLogout() {
    await signOut()
    navigate('/assistenza')
  }

  const displayName = supportCustomer?.full_name || user?.user_metadata?.full_name || user?.email || 'Cliente'
  const company = supportCustomer?.company || user?.user_metadata?.company || ''

  return (
    <div className={`support-portal-shell ${selectedTicket ? 'has-open-ticket' : ''}`}>
      <aside className="support-portal-sidebar">
        <div className="support-portal-brand">
          <img src="/logo-idealtech-900.webp" alt="Idealtech" />
          <div><strong>Assistenza</strong><span>Portale clienti</span></div>
        </div>

        <div className="support-portal-toolbar">
          <button type="button" className="support-new-ticket-button" onClick={() => setShowNewTicket(true)}>＋ Nuovo ticket</button>
          <div className="support-ticket-tabs">
            <button type="button" className={filter === 'active' ? 'is-active' : ''} onClick={() => setFilter('active')}>In corso</button>
            <button type="button" className={filter === 'closed' ? 'is-active' : ''} onClick={() => setFilter('closed')}>Archivio</button>
          </div>
        </div>

        <div className="support-ticket-list">
          {loading ? <div className="support-sidebar-empty">Caricamento richieste...</div> : null}
          {!loading && error ? <div className="support-sidebar-empty">{error}</div> : null}
          {!loading && !error && visibleTickets.map((ticket) => {
            const status = SUPPORT_STATUS[ticket.status] || SUPPORT_STATUS.open
            const unread = unreadCounts[ticket.id] || 0
            return (
              <button
                key={ticket.id}
                type="button"
                className={`support-ticket-card ${ticket.id === ticketId ? 'is-active' : ''}`}
                onClick={() => navigate(`/assistenza/portale/${ticket.id}`)}
              >
                {unread > 0 ? <span className="support-unread-badge">{unread > 99 ? '99+' : unread}</span> : null}
                <div className="support-ticket-card__top">
                  <strong>{formatTicketNumber(ticket.ticket_number)}</strong>
                  <span className={`support-status support-status--${status.tone}`}>{status.label}</span>
                  <time>{formatSupportDate(ticket.last_message_at, { short: true })}</time>
                </div>
                <h3>{ticket.subject}</h3>
                <p>{ticket.machine_name || 'Macchinario non specificato'}{ticket.serial_number ? ` · S/N ${ticket.serial_number}` : ''}</p>
              </button>
            )
          })}
          {!loading && !error && !visibleTickets.length ? (
            <div className="support-sidebar-empty">
              {filter === 'closed' ? 'Non hai ancora ticket chiusi.' : 'Nessuna richiesta aperta. Puoi creare un nuovo ticket quando hai bisogno di assistenza.'}
            </div>
          ) : null}
        </div>

        <div className="support-portal-account">
          <span>Accesso cliente</span>
          <strong>{displayName}</strong>
          <small>{company || user?.email}</small>
          <a href="/">Torna al sito</a>
          <button type="button" onClick={handleLogout}>Esci</button>
        </div>
      </aside>

      <main className="support-portal-main">
        <SupportTicketChat
          ticket={selectedTicket}
          currentUserId={user?.id}
          customer={supportCustomer}
          onRead={clearUnread}
          onTicketUpdated={updateTicket}
          onBack={selectedTicket ? () => navigate('/assistenza/portale') : undefined}
        />
      </main>

      {showNewTicket ? (
        <div className="support-ticket-modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setShowNewTicket(false)}>
          <div className="support-ticket-modal" role="dialog" aria-modal="true" aria-labelledby="new-ticket-title">
            <div className="support-ticket-modal__head">
              <div><span>Assistenza tecnica</span><h2 id="new-ticket-title">Apri un nuovo ticket</h2></div>
              <button type="button" onClick={() => setShowNewTicket(false)} aria-label="Chiudi">×</button>
            </div>
            <form className="support-ticket-form" onSubmit={createTicket}>
              <label className="is-full">Oggetto della richiesta
                <input value={ticketForm.subject} onChange={(e) => setTicketForm((current) => ({ ...current, subject: e.target.value }))} placeholder="Es. Problema temperatura fusore" required />
              </label>
              <label>Macchinario / modello
                <input value={ticketForm.machineName} onChange={(e) => setTicketForm((current) => ({ ...current, machineName: e.target.value }))} placeholder="Es. Ideal Melt 5" />
              </label>
              <label>Numero di serie
                <input value={ticketForm.serialNumber} onChange={(e) => setTicketForm((current) => ({ ...current, serialNumber: e.target.value }))} placeholder="Se lo ricordi" />
                <small>Facoltativo: puoi lasciare il campo vuoto.</small>
              </label>
              <label>Priorità
                <select value={ticketForm.priority} onChange={(e) => setTicketForm((current) => ({ ...current, priority: e.target.value }))}>
                  <option value="normal">Normale</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>
              <label className="is-full">Descrivi il problema
                <textarea value={ticketForm.problemDescription} onChange={(e) => setTicketForm((current) => ({ ...current, problemDescription: e.target.value }))} placeholder="Indica cosa succede, eventuali errori e quando si verifica il problema..." required />
              </label>
              {formError ? <div className="support-ticket-form__error">{formError}</div> : null}
              <div className="support-ticket-form__actions">
                <button type="button" className="secondary" onClick={() => setShowNewTicket(false)}>Annulla</button>
                <button type="submit" className="primary" disabled={creating}>{creating ? 'Apertura...' : 'Apri ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
