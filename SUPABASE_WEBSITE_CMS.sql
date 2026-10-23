-- IDEALTECH - Website Editor / CMS proprietario
-- Eseguire UNA VOLTA nel SQL Editor di Supabase prima di usare "Gestione sito".
-- Il sito continua a funzionare con i contenuti attuali anche prima della prima pubblicazione.

create or replace function public.can_edit_site()
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
      and role in ('admin', 'editor')
  );
$$;

grant execute on function public.can_edit_site() to authenticated;

-- Contenuto PUBBLICATO: leggibile anche dal sito pubblico.
create table if not exists public.site_content (
  content_key text primary key,
  section text not null,
  label text not null,
  field_type text not null default 'text',
  value jsonb not null default 'null'::jsonb,
  sort_order integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- BOZZE: accessibili solo ad admin/editor autenticati.
create table if not exists public.site_content_drafts (
  content_key text primary key,
  section text not null,
  label text not null,
  field_type text not null default 'text',
  value jsonb not null default 'null'::jsonb,
  sort_order integer not null default 0,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- VERSIONI: snapshot della versione online precedente a ogni pubblicazione.
create table if not exists public.site_content_versions (
  id uuid primary key default gen_random_uuid(),
  snapshot jsonb not null default '{}'::jsonb,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists site_content_section_idx on public.site_content (section, sort_order);
create index if not exists site_content_drafts_section_idx on public.site_content_drafts (section, sort_order);
create index if not exists site_content_versions_created_idx on public.site_content_versions (created_at desc);

alter table public.site_content enable row level security;
alter table public.site_content_drafts enable row level security;
alter table public.site_content_versions enable row level security;

-- PUBBLICATO
DROP POLICY IF EXISTS "site_content_public_read" ON public.site_content;
CREATE POLICY "site_content_public_read"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "site_content_editor_insert" ON public.site_content;
CREATE POLICY "site_content_editor_insert"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_editor_update" ON public.site_content;
CREATE POLICY "site_content_editor_update"
ON public.site_content FOR UPDATE
TO authenticated
USING (public.can_edit_site())
WITH CHECK (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_editor_delete" ON public.site_content;
CREATE POLICY "site_content_editor_delete"
ON public.site_content FOR DELETE
TO authenticated
USING (public.can_edit_site());

-- BOZZE
DROP POLICY IF EXISTS "site_content_drafts_editor_read" ON public.site_content_drafts;
CREATE POLICY "site_content_drafts_editor_read"
ON public.site_content_drafts FOR SELECT
TO authenticated
USING (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_drafts_editor_insert" ON public.site_content_drafts;
CREATE POLICY "site_content_drafts_editor_insert"
ON public.site_content_drafts FOR INSERT
TO authenticated
WITH CHECK (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_drafts_editor_update" ON public.site_content_drafts;
CREATE POLICY "site_content_drafts_editor_update"
ON public.site_content_drafts FOR UPDATE
TO authenticated
USING (public.can_edit_site())
WITH CHECK (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_drafts_editor_delete" ON public.site_content_drafts;
CREATE POLICY "site_content_drafts_editor_delete"
ON public.site_content_drafts FOR DELETE
TO authenticated
USING (public.can_edit_site());

-- VERSIONI
DROP POLICY IF EXISTS "site_content_versions_editor_read" ON public.site_content_versions;
CREATE POLICY "site_content_versions_editor_read"
ON public.site_content_versions FOR SELECT
TO authenticated
USING (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_versions_editor_insert" ON public.site_content_versions;
CREATE POLICY "site_content_versions_editor_insert"
ON public.site_content_versions FOR INSERT
TO authenticated
WITH CHECK (public.can_edit_site());

DROP POLICY IF EXISTS "site_content_versions_editor_delete" ON public.site_content_versions;
CREATE POLICY "site_content_versions_editor_delete"
ON public.site_content_versions FOR DELETE
TO authenticated
USING (public.can_edit_site());

-- Bucket pubblico dedicato alle immagini gestite dal CMS.
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = true;

DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;
CREATE POLICY "site_assets_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site_assets_editor_insert" ON storage.objects;
CREATE POLICY "site_assets_editor_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets' and public.can_edit_site());

DROP POLICY IF EXISTS "site_assets_editor_update" ON storage.objects;
CREATE POLICY "site_assets_editor_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets' and public.can_edit_site())
WITH CHECK (bucket_id = 'site-assets' and public.can_edit_site());

DROP POLICY IF EXISTS "site_assets_editor_delete" ON storage.objects;
CREATE POLICY "site_assets_editor_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets' and public.can_edit_site());
