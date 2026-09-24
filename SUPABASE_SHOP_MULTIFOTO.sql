-- IDEALTECH - Aggiornamento shop: più foto per prodotto
-- Eseguire UNA VOLTA nel SQL Editor di Supabase sul database già configurato.

alter table public.shop_products
  add column if not exists images jsonb not null default '[]'::jsonb;

update public.shop_products
set images = jsonb_build_array(jsonb_build_object('url', image_url, 'path', image_path))
where image_url is not null
  and image_url <> ''
  and coalesce(jsonb_array_length(images), 0) = 0;

comment on column public.shop_products.images is
  'Galleria ordinata immagini prodotto. Primo elemento = copertina. Oggetti: {url, path}.';
