-- IDEALTECH - Aggiornamento area amministrazione
-- Eseguire una sola volta nel SQL Editor di Supabase.

-- 1) Indicazione IVA per i macchinari
alter table public.machines
  add column if not exists price_includes_vat boolean not null default true;

-- 2) Funzione di controllo amministratore, riutilizzata nelle policy
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

-- 3) Contatti modificabili dal pannello admin
create table if not exists public.contact_people (
  id text primary key default gen_random_uuid()::text,
  section_key text not null,
  section_title text not null,
  office text,
  employee text,
  description text,
  phone text,
  phone_href text,
  extension text,
  email text,
  photo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_people enable row level security;

drop policy if exists "contact_people_public_read" on public.contact_people;
create policy "contact_people_public_read"
on public.contact_people
for select
to anon, authenticated
using (true);

drop policy if exists "contact_people_admin_insert" on public.contact_people;
create policy "contact_people_admin_insert"
on public.contact_people
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "contact_people_admin_update" on public.contact_people;
create policy "contact_people_admin_update"
on public.contact_people
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "contact_people_admin_delete" on public.contact_people;
create policy "contact_people_admin_delete"
on public.contact_people
for delete
to authenticated
using (public.is_admin());

insert into public.contact_people
  (id, section_key, section_title, office, employee, description, phone, phone_href, extension, email, photo_url, sort_order)
values
  ('default-commerciale-italia', 'commerciale', 'Ufficio commerciale', 'Ufficio commerciale Italia', 'Lucia Bisceglia', null, '+39 0362 543041', '+390362543041', 'Interno 1', 'lucia.bisceglia@idealtech.it', '/images/team/lucia-bisceglia.png', 10),
  ('default-commerciale-estero', 'commerciale', 'Ufficio commerciale', 'Ufficio commerciale estero', 'Noemi Silvio', null, '+39 338 1382452', '+393381382452', 'Interno 2', 'info@idealtech.it', '/images/team/Noemi.png', 20),
  ('default-acquisti', 'acquisti', 'Ufficio acquisti', null, 'Lucia Bisceglia', 'Contattaci per ordini, forniture e richieste acquisti dedicate.', '+39 0362 543041', '+390362543041', 'Interno 3', 'acquisti@idealtech.it', '/images/team/lucia-bisceglia.png', 30),
  ('default-amministrazione', 'amministrazione', 'Amministrazione', null, 'Federica Ceppi', 'Supporto per fatturazione, pratiche amministrative e documentazione.', '+39 0362 543041', '+390362543041', 'Interno 4', 'amministrazione@idealtech.it', null, 40),
  ('default-tecnico', 'tecnico', 'Ufficio tecnico', null, 'Giorgio Perego', 'Supporto tecnico e consulenza.', '+39 0362 543041', '+390362543041', 'Interno 5', 'ufficiotecnico1@idealtech.it', null, 50),
  ('default-assistenza', 'assistenza', 'Assistenza tecnica', null, null, 'Supporto operativo e manutenzione su impianti e linee di incollaggio.', '+39 0362 543041', '+390362543041', 'Interno 6', 'assistenza@idealtech.it', null, 60)
on conflict (id) do nothing;

-- 4) Bucket pubblico per le foto dei dipendenti
insert into storage.buckets (id, name, public)
values ('contact-photos', 'contact-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "contact_photos_public_read" on storage.objects;
create policy "contact_photos_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'contact-photos');

drop policy if exists "contact_photos_admin_insert" on storage.objects;
create policy "contact_photos_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'contact-photos' and public.is_admin());

drop policy if exists "contact_photos_admin_update" on storage.objects;
create policy "contact_photos_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'contact-photos' and public.is_admin())
with check (bucket_id = 'contact-photos' and public.is_admin());

drop policy if exists "contact_photos_admin_delete" on storage.objects;
create policy "contact_photos_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'contact-photos' and public.is_admin());
