import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import SupportTicketChat from '../components/SupportTicketChat'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { formatSupportDate, formatTicketNumber, loadUnreadCounts, SUPPORT_STATUS } from '../lib/support'
import '../styles/SupportPortal.css'

export default function AdminSupportPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user, isTechnician } = useAuth()
  const [tickets, setTickets] = useState([])
  const [customers, setCustomers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === ticketId) || null,
    [tickets, ticketId]
  )

  const visibleTickets = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return tickets.filter((ticket) => {
      const matchesArchive = filter === 'closed' ? ticket.status === 'closed' : ticket.status !== 'closed'
      if (!matchesArchive) return false
      if (!needle) return true
      const customer = customers[ticket.customer_id] || {}
      return [
        ticket.subject,
        ticket.machine_name,
        ticket.serial_number,
        ticket.ticket_number,
        customer.full_name,
        customer.company,
      ].some((value) => String(value || '').toLowerCase().includes(needle))
    })
  }, [tickets, customers, filter, search])

  async function loadTickets({ quiet = false } = {}) {
    if (!user?.id) return
    try {
      if (!quiet) setLoading(true)
      setError('')

      const { data, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('last_message_at', { ascending: false })
      if (ticketsError) throw ticketsError

      const nextTickets = data || []
      setTickets(nextTickets)

      const customerIds = [...new Set(nextTickets.map((ticket) => ticket.customer_id).filter(Boolean))]
      if (customerIds.length) {
        const { data: customerRows, error: customerError } = await supabase
          .from('support_customers')
          .select('user_id,full_name,company,phone,email')
          .in('user_id', customerIds)
        if (customerError) throw customerError
        setCustomers(Object.fromEntries((customerRows || []).map((customer) => [customer.user_id, customer])))
      } else {
        setCustomers({})
      }

      const counts = await loadUnreadCounts(nextTickets.map((item) => item.id), user.id)
      setUnreadCounts(counts)
    } catch (err) {
      setError(err.message || 'Impossibile caricare le richieste di assistenza.')
    } finally {
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return undefined
    loadTickets()

    const channel = supabase
      .channel(`support-staff-portal-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => loadTickets({ quiet: true }))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, () => loadTickets({ quiet: true }))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user?.id])

  function clearUnread(id) {
    setUnreadCounts((current) => ({ ...current, [id]: 0 }))
  }

  function updateTicket(updated) {
    setTickets((current) => current
      .map((ticket) => ticket.id === updated.id ? updated : ticket)
      .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at)))
    if (updated.status === 'closed') setFilter('closed')
    else setFilter('active')
  }

  const activeCount = tickets.filter((ticket) => ticket.status !== 'closed').length
  const closedCount = tickets.filter((ticket) => ticket.status === 'closed').length
  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + Number(count || 0), 0)

  return (
    <AdminLayout
      title="Assistenza clienti"
      subtitle={isTechnician
        ? 'Gestisci richieste, chat e stato dei ticket assegnati al reparto assistenza.'
        : 'Portale operativo per controllare tutte le richieste e le conversazioni con i clienti.'}
      actions={<div className="admin-support-summary"><span><strong>{activeCount}</strong> attivi</span><span><strong>{totalUnread}</strong> non letti</span></div>}
    >
      <div className="admin-support-workspace">
        <aside className="admin-support-list admin-panel-card">
          <div className="admin-support-list__head">
            <div>
              <span>Ticket</span>
              <strong>{filter === 'closed' ? `${closedCount} archiviati` : `${activeCount} in corso`}</strong>
            </div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca ticket..." />
          </div>

          <div className="support-ticket-tabs">
            <button type="button" className={filter === 'active' ? 'is-active' : ''} onClick={() => setFilter('active')}>In corso ({activeCount})</button>
            <button type="button" className={filter === 'closed' ? 'is-active' : ''} onClick={() => setFilter('closed')}>Chiusi ({closedCount})</button>
          </div>

          <div className="support-ticket-list admin-support-list__scroll">
            {loading ? <div className="support-sidebar-empty">Caricamento ticket...</div> : null}
            {!loading && error ? <div className="support-sidebar-empty">{error}</div> : null}
            {!loading && !error && visibleTickets.map((ticket) => {
              const status = SUPPORT_STATUS[ticket.status] || SUPPORT_STATUS.open
              const customer = customers[ticket.customer_id] || {}
              const unread = unreadCounts[ticket.id] || 0
              return (
                <button
                  type="button"
                  key={ticket.id}
                  className={`support-ticket-card ${ticket.id === ticketId ? 'is-active' : ''}`}
                  onClick={() => navigate(`/admin/assistenza/${ticket.id}`)}
                >
                  {unread > 0 ? <span className="support-unread-badge">{unread > 99 ? '99+' : unread}</span> : null}
                  <div className="support-ticket-card__top">
                    <strong>{formatTicketNumber(ticket.ticket_number)}</strong>
                    <span className={`support-status support-status--${status.tone}`}>{status.label}</span>
                    <time>{formatSupportDate(ticket.last_message_at, { short: true })}</time>
                  </div>
                  <h3>{ticket.subject}</h3>
                  <p>{customer.company || customer.full_name || 'Cliente'} · {ticket.machine_name || 'Macchinario non specificato'}</p>
                </button>
              )
            })}
            {!loading && !error && !visibleTickets.length ? <div className="support-sidebar-empty">Nessun ticket in questa sezione.</div> : null}
          </div>
        </aside>

        <SupportTicketChat
          ticket={selectedTicket}
          currentUserId={user?.id}
          isStaff
          customer={selectedTicket ? customers[selectedTicket.customer_id] : null}
          onRead={clearUnread}
          onTicketUpdated={updateTicket}
          onBack={selectedTicket ? () => navigate('/admin/assistenza') : undefined}
        />
      </div>
    </AdminLayout>
  )
}
