-- IDEALTECH - Portale assistenza / ticket
-- Eseguire una volta nel SQL Editor di Supabase.
-- Il file crea clienti assistenza, tecnici, ticket, chat, letture e policy RLS.

create extension if not exists pgcrypto;
create schema if not exists private_support;
revoke all on schema private_support from public, anon;
grant usage on schema private_support to authenticated;

-- Staff tecnico separato dai normali profili admin/editor del sito.
create table if not exists public.support_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'technician' check (role = 'technician'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profilo cliente del portale assistenza.
create table if not exists public.support_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_customers add column if not exists email text;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number bigint generated always as identity unique,
  customer_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  machine_name text,
  serial_number text,
  problem_description text not null,
  priority text not null default 'normal' check (priority in ('normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting_customer', 'closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(trim(message)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.support_ticket_reads (
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (ticket_id, user_id)
);

create index if not exists support_tickets_customer_idx on public.support_tickets(customer_id, status, last_message_at desc);
create index if not exists support_tickets_status_idx on public.support_tickets(status, last_message_at desc);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id, created_at);
create index if not exists support_reads_user_idx on public.support_ticket_reads(user_id, ticket_id);

-- Verifica staff usata dalle policy. È in schema non esposto e restituisce solo un booleano.
create or replace function private_support.is_support_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'admin'
    )
    or exists (
      select 1 from public.support_staff
      where user_id = (select auth.uid()) and role = 'technician' and active = true
    );
$$;
revoke all on function private_support.is_support_staff() from public, anon;
grant execute on function private_support.is_support_staff() to authenticated;

-- Crea automaticamente il profilo assistenza quando un cliente si registra.
-- I metadata sono usati solo come dati anagrafici, mai per autorizzazioni.
create or replace function private_support.handle_new_support_customer()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') = 'support_customer' then
    insert into public.support_customers (user_id, full_name, company, phone, email)
    values (
      new.id,
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'company', '')), ''),
      nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
      new.email
    )
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      company = excluded.company,
      phone = excluded.phone,
      email = excluded.email,
      updated_at = now();
  end if;
  return new;
end;
$$;
revoke all on function private_support.handle_new_support_customer() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_support_customer on auth.users;
create trigger on_auth_user_created_support_customer
after insert on auth.users
for each row execute function private_support.handle_new_support_customer();

-- Aggiornamento timestamp ticket quando arriva un messaggio.
create or replace function private_support.touch_support_ticket_from_message()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.support_tickets
  set last_message_at = new.created_at,
      updated_at = new.created_at
  where id = new.ticket_id;
  return new;
end;
$$;
revoke all on function private_support.touch_support_ticket_from_message() from public, anon, authenticated;

drop trigger if exists support_message_touch_ticket on public.support_messages;
create trigger support_message_touch_ticket
after insert on public.support_messages
for each row execute function private_support.touch_support_ticket_from_message();

create or replace function private_support.set_ticket_timestamps()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  if new.status = 'closed' and old.status is distinct from 'closed' then
    new.closed_at = now();
  elsif new.status <> 'closed' then
    new.closed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists support_ticket_timestamps on public.support_tickets;
create trigger support_ticket_timestamps
before update on public.support_tickets
for each row execute function private_support.set_ticket_timestamps();

alter table public.support_staff enable row level security;
alter table public.support_customers enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_ticket_reads enable row level security;

-- Staff: il tecnico vede il proprio record, gli admin possono leggere tutti.
drop policy if exists support_staff_read on public.support_staff;
create policy support_staff_read on public.support_staff
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
);

-- Clienti: ciascuno vede/modifica i propri dati; staff vede i dati necessari al ticket.
drop policy if exists support_customers_read on public.support_customers;
create policy support_customers_read on public.support_customers
for select to authenticated
using (user_id = (select auth.uid()) or private_support.is_support_staff());

drop policy if exists support_customers_insert_self on public.support_customers;
create policy support_customers_insert_self on public.support_customers
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists support_customers_update_self on public.support_customers;
create policy support_customers_update_self on public.support_customers
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Ticket: il cliente vede solo i propri; admin e tecnici vedono tutti.
drop policy if exists support_tickets_read on public.support_tickets;
create policy support_tickets_read on public.support_tickets
for select to authenticated
using (customer_id = (select auth.uid()) or private_support.is_support_staff());

drop policy if exists support_tickets_customer_insert on public.support_tickets;
create policy support_tickets_customer_insert on public.support_tickets
for insert to authenticated
with check (
  customer_id = (select auth.uid())
  and status = 'open'
  and assigned_to is null
);

drop policy if exists support_tickets_staff_update on public.support_tickets;
create policy support_tickets_staff_update on public.support_tickets
for update to authenticated
using (private_support.is_support_staff())
with check (private_support.is_support_staff());

-- Messaggi: accessibili solo ai partecipanti del ticket; ticket chiuso = chat bloccata.
drop policy if exists support_messages_read on public.support_messages;
create policy support_messages_read on public.support_messages
for select to authenticated
using (
  exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id
      and (t.customer_id = (select auth.uid()) or private_support.is_support_staff())
  )
);

drop policy if exists support_messages_insert on public.support_messages;
create policy support_messages_insert on public.support_messages
for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id
      and t.status <> 'closed'
      and (t.customer_id = (select auth.uid()) or private_support.is_support_staff())
  )
);

-- Stato di lettura personale, usato per i badge non letti stile chat.
drop policy if exists support_reads_read_own on public.support_ticket_reads;
create policy support_reads_read_own on public.support_ticket_reads
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists support_reads_insert_own on public.support_ticket_reads;
create policy support_reads_insert_own on public.support_ticket_reads
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id
      and (t.customer_id = (select auth.uid()) or private_support.is_support_staff())
  )
);

drop policy if exists support_reads_update_own on public.support_ticket_reads;
create policy support_reads_update_own on public.support_ticket_reads
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Data API grants (RLS continua a filtrare le righe).
grant select on public.support_staff to authenticated;
grant select, insert, update on public.support_customers to authenticated;

-- Limitiamo anche i permessi a livello colonna: il browser cliente non può falsificare
-- timestamp/stato di chiusura e il tecnico può modificare solo lo stato operativo.
revoke insert, update on public.support_tickets from authenticated;
grant select on public.support_tickets to authenticated;
grant insert (customer_id, subject, machine_name, serial_number, problem_description, priority, status)
  on public.support_tickets to authenticated;
grant update (status) on public.support_tickets to authenticated;

revoke insert on public.support_messages from authenticated;
grant select on public.support_messages to authenticated;
grant insert (ticket_id, sender_id, message) on public.support_messages to authenticated;

grant select, insert, update on public.support_ticket_reads to authenticated;
grant usage, select on sequence public.support_tickets_ticket_number_seq to authenticated;

-- Realtime per chat e aggiornamenti ticket.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_messages'
  ) then
    alter publication supabase_realtime add table public.support_messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_tickets'
  ) then
    alter publication supabase_realtime add table public.support_tickets;
  end if;
end $$;
