-- IDEALTECH - FIX SICUREZZA RUOLI CLIENTI ASSISTENZA V2
-- ESEGUIRE UNA VOLTA nel SQL Editor del progetto Supabase Idealtech.
-- Questa versione NON elimina righe da public.profiles, perché possono essere
-- referenziate da public.machines.created_by e da altri record storici.
-- I profili legacy restano come riferimenti storici, ma NON concedono privilegi
-- quando l'utente è un cliente Assistenza.

begin;

create schema if not exists private_support;
revoke all on schema private_support from public, anon;
grant usage on schema private_support to authenticated;

-- 1) Ruolo effettivo unico.
-- I ruoli server-side espliciti admin/technician hanno precedenza perché possono
-- essere assegnati volontariamente dall'admin. Un cliente Assistenza, invece,
-- prevale SEMPRE su vecchi profili editor/admin rimasti per ragioni storiche/FK.
create or replace function public.current_effective_role()
returns text
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  with me as (
    select
      u.id,
      lower(coalesce(u.raw_app_meta_data ->> 'role', '')) as app_role,
      lower(coalesce(
        u.raw_app_meta_data ->> 'account_type',
        u.raw_user_meta_data ->> 'account_type',
        ''
      )) as account_type
    from auth.users u
    where u.id = (select auth.uid())
  )
  select case
    when not exists (select 1 from me) then null

    -- Ruoli assegnati esplicitamente lato server dall'admin.
    when (select app_role from me) = 'admin' then 'admin'
    when (select app_role from me) = 'technician' then 'technician'
    when (select app_role from me) = 'customer' then 'customer'
    when (select account_type from me) = 'support_customer' then 'customer'

    -- Tabelle applicative. Il cliente viene controllato PRIMA dei profili legacy.
    when exists (
      select 1 from public.support_staff s
      where s.user_id = (select id from me)
        and s.role = 'technician'
        and s.active = true
    ) then 'technician'
    when exists (
      select 1 from public.support_customers c
      where c.user_id = (select id from me)
    ) then 'customer'

    -- Compatibilità con vecchi account staff che non hanno ancora app_metadata.
    when (select app_role from me) = 'editor' then 'editor'
    when exists (
      select 1 from public.profiles p
      where p.id = (select id from me) and p.role = 'admin'
    ) then 'admin'
    when exists (
      select 1 from public.profiles p
      where p.id = (select id from me) and p.role = 'editor'
    ) then 'editor'
    else null
  end;
$$;

revoke all on function public.current_effective_role() from public;
grant execute on function public.current_effective_role() to authenticated;

-- 2) Ripara gli account clienti già creati.
-- NON tocchiamo public.profiles: può essere referenziato da machines.created_by.
update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'customer', 'account_type', 'support_customer')
where exists (
  select 1 from public.support_customers c where c.user_id = u.id
)
and lower(coalesce(u.raw_app_meta_data ->> 'role', '')) not in ('admin', 'technician');

-- Un cliente non deve risultare anche tecnico. Questo record è separato da profiles
-- e non è usato come FK dai macchinari.
delete from public.support_staff s
using auth.users u
where s.user_id = u.id
  and lower(coalesce(u.raw_app_meta_data ->> 'role', '')) = 'customer';

-- 3) Protezione permanente. Non cancelliamo profiles: normalizziamo soltanto
-- il ruolo Auth e rimuoviamo eventuale support_staff incompatibile.
create or replace function private_support.enforce_support_customer_isolation()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_role text := lower(coalesce(new.raw_app_meta_data ->> 'role', ''));
  v_account_type text := lower(coalesce(
    new.raw_app_meta_data ->> 'account_type',
    new.raw_user_meta_data ->> 'account_type',
    ''
  ));
begin
  -- Admin/tecnico assegnati esplicitamente possono esistere anche se in passato
  -- l'account era un cliente.
  if v_role in ('admin', 'technician') then
    return new;
  end if;

  if v_role = 'customer' or v_account_type = 'support_customer' then
    delete from public.support_staff where user_id = new.id;
  end if;

  return new;
end;
$$;

revoke all on function private_support.enforce_support_customer_isolation() from public, anon, authenticated;

drop trigger if exists zzzz_support_customer_isolation on auth.users;
create trigger zzzz_support_customer_isolation
after insert or update of raw_app_meta_data, raw_user_meta_data on auth.users
for each row execute function private_support.enforce_support_customer_isolation();

-- 4) Tutte le funzioni di autorizzazione principali usano SOLO il ruolo effettivo.
create or replace function public.can_edit_site()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_effective_role() in ('admin', 'editor');
$$;
revoke all on function public.can_edit_site() from public;
grant execute on function public.can_edit_site() to authenticated;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_effective_role() in ('admin', 'editor');
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_effective_role() = 'admin';
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function private_support.is_support_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.current_effective_role() in ('admin', 'technician');
$$;
revoke all on function private_support.is_support_staff() from public, anon;
grant execute on function private_support.is_support_staff() to authenticated;

-- 5) Policy support_staff: niente controllo diretto sul vecchio profiles.role.
drop policy if exists support_staff_read on public.support_staff;
create policy support_staff_read on public.support_staff
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.current_effective_role() = 'admin'
);

commit;

-- VERIFICA CONSIGLIATA
-- La colonna profile_role può continuare a mostrare editor/admin: è intenzionale
-- se quel record è referenziato da macchinari. Quello che conta è effective_role.
select
  u.email,
  u.raw_app_meta_data ->> 'role' as auth_role,
  u.raw_app_meta_data ->> 'account_type' as account_type,
  p.role as profile_role_storico,
  c.user_id is not null as support_customer,
  case
    when lower(coalesce(u.raw_app_meta_data ->> 'role','')) in ('admin','technician','customer')
      then lower(u.raw_app_meta_data ->> 'role')
    when c.user_id is not null then 'customer'
    else coalesce(p.role, 'nessun ruolo')
  end as effective_role_atteso
from auth.users u
left join public.profiles p on p.id = u.id
left join public.support_customers c on c.user_id = u.id
order by u.created_at desc;
