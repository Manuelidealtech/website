-- IDEALTECH - Landing social / Link in bio
-- Eseguire una sola volta nel SQL Editor del progetto Supabase del sito.

-- La funzione public.is_admin() è già presente nel progetto Idealtech.
-- La ricreiamo in modo idempotente per rendere questo script autonomo.
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

create table if not exists public.social_landing_settings (
  id text primary key default 'main',
  enabled boolean not null default true,
  eyebrow text,
  title text not null default 'Industrial adhesive application, made easier.',
  subtitle text,
  description text,
  logo_url text,
  background_image_url text,
  background_color text not null default '#0b2d53',
  secondary_color text not null default '#123f72',
  accent_color text not null default '#5db8e9',
  card_color text not null default '#ffffff',
  text_color text not null default '#ffffff',
  button_text_color text not null default '#12345c',
  show_made_in_italy boolean not null default true,
  footer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_landing_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  subtitle text,
  url text not null,
  icon_key text not null default 'external',
  active boolean not null default true,
  featured boolean not null default false,
  new_tab boolean not null default true,
  sort_order integer not null default 0,
  background_color text,
  text_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_landing_settings enable row level security;
alter table public.social_landing_links enable row level security;

-- Impostazioni: la landing pubblica deve poterle leggere anche quando è disattivata.
drop policy if exists "social_landing_settings_public_read" on public.social_landing_settings;
create policy "social_landing_settings_public_read"
on public.social_landing_settings
for select
to anon, authenticated
using (true);

drop policy if exists "social_landing_settings_admin_insert" on public.social_landing_settings;
create policy "social_landing_settings_admin_insert"
on public.social_landing_settings
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "social_landing_settings_admin_update" on public.social_landing_settings;
create policy "social_landing_settings_admin_update"
on public.social_landing_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "social_landing_settings_admin_delete" on public.social_landing_settings;
create policy "social_landing_settings_admin_delete"
on public.social_landing_settings
for delete
to authenticated
using (public.is_admin());

-- Il pubblico vede solo link attivi; l'amministratore vede anche quelli disattivati.
drop policy if exists "social_landing_links_read" on public.social_landing_links;
create policy "social_landing_links_read"
on public.social_landing_links
for select
to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "social_landing_links_admin_insert" on public.social_landing_links;
create policy "social_landing_links_admin_insert"
on public.social_landing_links
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "social_landing_links_admin_update" on public.social_landing_links;
create policy "social_landing_links_admin_update"
on public.social_landing_links
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "social_landing_links_admin_delete" on public.social_landing_links;
create policy "social_landing_links_admin_delete"
on public.social_landing_links
for delete
to authenticated
using (public.is_admin());

-- Bucket pubblico per logo/sfondo caricati dal pannello.
insert into storage.buckets (id, name, public)
values ('social-assets', 'social-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "social_assets_public_read" on storage.objects;
create policy "social_assets_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'social-assets');

drop policy if exists "social_assets_admin_insert" on storage.objects;
create policy "social_assets_admin_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'social-assets' and public.is_admin());

drop policy if exists "social_assets_admin_update" on storage.objects;
create policy "social_assets_admin_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'social-assets' and public.is_admin())
with check (bucket_id = 'social-assets' and public.is_admin());

drop policy if exists "social_assets_admin_delete" on storage.objects;
create policy "social_assets_admin_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'social-assets' and public.is_admin());

-- Configurazione iniziale Idealtech.
insert into public.social_landing_settings (
  id, enabled, eyebrow, title, subtitle, description, logo_url,
  background_color, secondary_color, accent_color, card_color,
  text_color, button_text_color, show_made_in_italy, footer_text
)
values (
  'main', true,
  'IDEALTECH · MADE IN ITALY',
  'Industrial adhesive application, made easier.',
  'Hot-melt systems & equipment',
  'Engineering · Support · Spare parts',
  '/logo-cerchio.png',
  '#0b2d53', '#123f72', '#5db8e9', '#ffffff', '#ffffff', '#12345c',
  true,
  'Idealtech S.r.l. · Varedo, Italy'
)
on conflict (id) do nothing;

-- Link iniziali. Vengono creati solo se la tabella è vuota.
insert into public.social_landing_links
  (label, subtitle, url, icon_key, active, featured, new_tab, sort_order)
select *
from (values
  ('Sito web', 'Scopri Idealtech', 'https://www.idealtech.it/', 'website', true, false, false, 10),
  ('LinkedIn', 'Segui gli aggiornamenti aziendali', 'https://www.linkedin.com/company/idealtech-srl/', 'linkedin', true, false, true, 20),
  ('Instagram', 'Prodotti, applicazioni e novità', 'https://www.instagram.com/idealtech.srl/', 'instagram', true, false, true, 30),
  ('Contatti', 'Parla con il nostro team', 'https://www.idealtech.it/contatti', 'contact', true, true, false, 40)
) as seed(label, subtitle, url, icon_key, active, featured, new_tab, sort_order)
where not exists (select 1 from public.social_landing_links);
