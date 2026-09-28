-- IDEALTECH - Recensioni clienti
-- Eseguire UNA SOLA VOLTA nel SQL Editor del progetto Supabase.

-- Funzione staff: amministratori ed editor possono gestire le recensioni.
create or replace function public.is_staff()
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

grant execute on function public.is_staff() to anon, authenticated;

-- Recensioni mostrate nel sito.
create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  company text,
  reviewer_role text,
  review_text text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  avatar_url text,
  avatar_path text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_reviews_public_idx
  on public.customer_reviews (published, sort_order, created_at desc);

alter table public.customer_reviews enable row level security;

drop policy if exists "customer_reviews_public_read" on public.customer_reviews;
create policy "customer_reviews_public_read"
on public.customer_reviews
for select
to anon, authenticated
using (published = true or public.is_staff());

drop policy if exists "customer_reviews_staff_insert" on public.customer_reviews;
create policy "customer_reviews_staff_insert"
on public.customer_reviews
for insert
to authenticated
with check (public.is_staff());

drop policy if exists "customer_reviews_staff_update" on public.customer_reviews;
create policy "customer_reviews_staff_update"
on public.customer_reviews
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "customer_reviews_staff_delete" on public.customer_reviews;
create policy "customer_reviews_staff_delete"
on public.customer_reviews
for delete
to authenticated
using (public.is_staff());

-- Bucket pubblico per foto clienti / loghi associati alle recensioni.
insert into storage.buckets (id, name, public)
values ('review-assets', 'review-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "review_assets_public_read" on storage.objects;
create policy "review_assets_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'review-assets');

drop policy if exists "review_assets_staff_insert" on storage.objects;
create policy "review_assets_staff_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'review-assets' and public.is_staff());

drop policy if exists "review_assets_staff_update" on storage.objects;
create policy "review_assets_staff_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'review-assets' and public.is_staff())
with check (bucket_id = 'review-assets' and public.is_staff());

drop policy if exists "review_assets_staff_delete" on storage.objects;
create policy "review_assets_staff_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'review-assets' and public.is_staff());
