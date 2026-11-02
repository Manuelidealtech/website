import { supabase } from './supabase'

export const SUPPORT_STATUS = {
  open: { label: 'Aperto', tone: 'blue' },
  in_progress: { label: 'In lavorazione', tone: 'amber' },
  waiting_customer: { label: 'In attesa cliente', tone: 'purple' },
  closed: { label: 'Chiuso', tone: 'gray' },
}

export const SUPPORT_PRIORITY = {
  normal: { label: 'Normale', tone: 'gray' },
  high: { label: 'Alta', tone: 'amber' },
  urgent: { label: 'Urgente', tone: 'red' },
}

export function formatTicketNumber(ticketNumber) {
  const numeric = Number(ticketNumber || 0)
  return `TCK-${String(numeric).padStart(6, '0')}`
}

export function formatSupportDate(value, options = {}) {
  if (!value) return ''
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: options.short ? undefined : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export async function markTicketRead(ticketId, userId) {
  if (!ticketId || !userId) return
  const { error } = await supabase
    .from('support_ticket_reads')
    .upsert(
      { ticket_id: ticketId, user_id: userId, last_read_at: new Date().toISOString() },
      { onConflict: 'ticket_id,user_id' }
    )
  if (error) throw error
}

export async function loadUnreadCounts(ticketIds, userId) {
  if (!ticketIds?.length || !userId) return {}

  const [{ data: reads, error: readsError }, { data: messages, error: messagesError }] = await Promise.all([
    supabase
      .from('support_ticket_reads')
      .select('ticket_id,last_read_at')
      .eq('user_id', userId)
      .in('ticket_id', ticketIds),
    supabase
      .from('support_messages')
      .select('ticket_id,sender_id,created_at')
      .in('ticket_id', ticketIds)
      .neq('sender_id', userId),
  ])

  if (readsError) throw readsError
  if (messagesError) throw messagesError

  const readMap = new Map((reads || []).map((row) => [row.ticket_id, new Date(row.last_read_at).getTime()]))
  const counts = Object.fromEntries(ticketIds.map((id) => [id, 0]))

  for (const message of messages || []) {
    const lastRead = readMap.get(message.ticket_id) || 0
    if (new Date(message.created_at).getTime() > lastRead) {
      counts[message.ticket_id] = (counts[message.ticket_id] || 0) + 1
    }
  }

  return counts
}

export async function ensureSupportCustomer(user) {
  if (!user?.id) return null

  const { data: existing, error: readError } = await supabase
    .from('support_customers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) throw readError
  if (existing) return existing

  const metadata = user.user_metadata || {}
  const { data, error } = await supabase
    .from('support_customers')
    .upsert({
      user_id: user.id,
      full_name: metadata.full_name || '',
      company: metadata.company || '',
      phone: metadata.phone || '',
      email: user.email || '',
    }, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) throw error
  return data
}
