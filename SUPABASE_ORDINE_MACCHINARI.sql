-- IDEALTECH - Ordine manuale dei macchinari nello store
-- Eseguire una sola volta nel SQL Editor di Supabase.

-- 1) Posizione del macchinario nello store pubblico
alter table public.machines
  add column if not exists display_order integer;

-- Assegna un ordine iniziale ai macchinari già presenti.
-- Mantiene in alto quelli creati più recentemente, come nella versione precedente.
with ranked_machines as (
  select
    id,
    (row_number() over (order by created_at desc, id) - 1)::integer as new_display_order
  from public.machines
)
update public.machines as machines
set display_order = ranked_machines.new_display_order
from ranked_machines
where machines.id = ranked_machines.id
  and machines.display_order is null;

update public.machines
set display_order = 0
where display_order is null;

alter table public.machines
  alter column display_order set default 0;

alter table public.machines
  alter column display_order set not null;

create index if not exists machines_display_order_idx
  on public.machines (display_order, created_at desc);

-- Funzione di controllo amministratore (riutilizzabile anche dalle altre policy)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 2) Riordinamento atomico richiamato dal pannello admin
create or replace function public.reorder_machines(p_order jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Operazione consentita solo agli amministratori.';
  end if;

  if jsonb_typeof(p_order) <> 'array' then
    raise exception 'L''ordine deve essere un array di identificativi.';
  end if;

  update public.machines as machine
  set display_order = (ordered.position - 1)::integer
  from jsonb_array_elements_text(p_order)
    with ordinality as ordered(machine_id, position)
  where machine.id::text = ordered.machine_id;
end;
$$;

grant execute on function public.reorder_machines(jsonb) to authenticated;
