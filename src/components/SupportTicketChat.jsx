import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatSupportDate, formatTicketNumber, markTicketRead, SUPPORT_PRIORITY, SUPPORT_STATUS } from '../lib/support'
import '../styles/SupportPortal.css'

export default function SupportTicketChat({
  ticket,
  currentUserId,
  isStaff = false,
  customer = null,
  onTicketUpdated,
  onRead,
  onBack,
}) {
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!ticket?.id || !currentUserId) {
      setMessages([])
      return undefined
    }

    let active = true

    async function loadMessages() {
      try {
        setLoading(true)
        setError('')
        const { data, error: loadError } = await supabase
          .from('support_messages')
          .select('id,ticket_id,sender_id,message,created_at')
          .eq('ticket_id', ticket.id)
          .order('created_at', { ascending: true })

        if (loadError) throw loadError
        if (!active) return
        setMessages(data || [])
        await markTicketRead(ticket.id, currentUserId)
        if (active) onRead?.(ticket.id)
      } catch (err) {
        if (active) setError(err.message || 'Impossibile caricare la conversazione.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMessages()

    const channel = supabase
      .channel(`support-ticket-${ticket.id}-${currentUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticket.id}` },
        async (payload) => {
          if (!active) return
          const incoming = payload.new
          setMessages((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming])
          try {
            await markTicketRead(ticket.id, currentUserId)
            if (active) onRead?.(ticket.id)
          } catch (readError) {
            console.error('Errore aggiornamento lettura ticket:', readError)
          }
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [ticket?.id, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length, ticket?.id])

  if (!ticket) {
    return (
      <div className="support-chat support-chat--empty">
        <div className="support-empty-state">
          <span className="support-empty-state__icon">✦</span>
          <h2>Seleziona un ticket</h2>
          <p>Apri una richiesta dall’elenco per visualizzare la conversazione e i dettagli tecnici.</p>
        </div>
      </div>
    )
  }

  const status = SUPPORT_STATUS[ticket.status] || SUPPORT_STATUS.open
  const priority = SUPPORT_PRIORITY[ticket.priority] || SUPPORT_PRIORITY.normal
  const isClosed = ticket.status === 'closed'

  async function sendMessage(event) {
    event.preventDefault()
    const cleanMessage = messageText.trim()
    if (!cleanMessage || isClosed || sending) return

    try {
      setSending(true)
      setError('')
      const { data, error: sendError } = await supabase
        .from('support_messages')
        .insert({ ticket_id: ticket.id, sender_id: currentUserId, message: cleanMessage })
        .select('id,ticket_id,sender_id,message,created_at')
        .single()

      if (sendError) throw sendError
      setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data])
      setMessageText('')
      await markTicketRead(ticket.id, currentUserId)
      onRead?.(ticket.id)
    } catch (err) {
      setError(err.message || 'Messaggio non inviato.')
    } finally {
      setSending(false)
    }
  }

  async function changeStatus(nextStatus) {
    if (!isStaff || nextStatus === ticket.status) return
    try {
      setStatusSaving(true)
      setError('')
      const { data, error: updateError } = await supabase
        .from('support_tickets')
        .update({ status: nextStatus })
        .eq('id', ticket.id)
        .select('*')
        .single()

      if (updateError) throw updateError
      onTicketUpdated?.(data)
    } catch (err) {
      setError(err.message || 'Impossibile aggiornare lo stato del ticket.')
    } finally {
      setStatusSaving(false)
    }
  }

  return (
    <div className="support-chat">
      <header className="support-chat__header">
        <div className="support-chat__title-row">
          {onBack ? <button type="button" className="support-chat__back" onClick={onBack} aria-label="Torna ai ticket">←</button> : null}
          <div className="support-chat__heading">
            <div className="support-chat__eyebrow">
              <strong>{formatTicketNumber(ticket.ticket_number)}</strong>
              <span className={`support-status support-status--${status.tone}`}>{status.label}</span>
              <span className={`support-priority support-priority--${priority.tone}`}>{priority.label}</span>
            </div>
            <h2>{ticket.subject}</h2>
            {isStaff && customer ? (
              <p>{customer.company || customer.full_name || customer.email || 'Cliente'}{customer.full_name && customer.company ? ` · ${customer.full_name}` : ''}{customer.email ? ` · ${customer.email}` : ''}</p>
            ) : null}
          </div>
          {isStaff ? (
            <label className="support-status-select">
              <span>Stato</span>
              <select value={ticket.status} onChange={(e) => changeStatus(e.target.value)} disabled={statusSaving}>
                <option value="open">Aperto</option>
                <option value="in_progress">In lavorazione</option>
                <option value="waiting_customer">In attesa cliente</option>
                <option value="closed">Chiuso / archivia</option>
              </select>
            </label>
          ) : null}
        </div>

        <div className="support-ticket-meta">
          <div><span>Macchinario</span><strong>{ticket.machine_name || 'Non specificato'}</strong></div>
          <div><span>Numero di serie</span><strong>{ticket.serial_number || 'Non disponibile'}</strong></div>
          <div><span>Aperto il</span><strong>{formatSupportDate(ticket.created_at)}</strong></div>
        </div>
        {ticket.problem_description ? <p className="support-ticket-problem">{ticket.problem_description}</p> : null}
      </header>

      <div className="support-chat__messages" aria-live="polite">
        {loading ? <div className="support-chat__loading">Caricamento conversazione...</div> : null}
        {!loading && !messages.length ? (
          <div className="support-chat__day"><span>Nessun messaggio ancora</span></div>
        ) : null}
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId
          const fromCustomer = message.sender_id === ticket.customer_id
          return (
            <div key={message.id} className={`support-message-row ${mine ? 'is-mine' : ''}`}>
              <div className={`support-message ${mine ? 'is-mine' : ''}`}>
                <span className="support-message__sender">
                  {mine ? 'Tu' : fromCustomer ? (customer?.full_name || 'Cliente') : 'Assistenza Idealtech'}
                </span>
                <p>{message.message}</p>
                <time>{formatSupportDate(message.created_at, { short: true })}</time>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {error ? <div className="support-chat__error">{error}</div> : null}

      {isClosed ? (
        <div className="support-chat__closed">
          <strong>Ticket chiuso</strong>
          <span>La conversazione è archiviata e non accetta nuovi messaggi.</span>
          {isStaff ? <button type="button" onClick={() => changeStatus('in_progress')} disabled={statusSaving}>Riapri ticket</button> : null}
        </div>
      ) : (
        <form className="support-chat__composer" onSubmit={sendMessage}>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Scrivi un messaggio..."
            rows="2"
            maxLength="5000"
          />
          <button type="submit" disabled={!messageText.trim() || sending} aria-label="Invia messaggio">
            {sending ? '...' : '➤'}
          </button>
        </form>
      )}
    </div>
  )
}
