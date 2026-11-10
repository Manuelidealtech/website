-- IDEALTECH - Traduzioni multilingua prodotti Shop
-- Eseguire una sola volta nel SQL Editor di Supabase sul database già esistente.

alter table public.shop_products
  add column if not exists translations jsonb not null default '{}'::jsonb;

comment on column public.shop_products.translations is
  'Traduzioni prodotto Shop per lingua, es. {"en":{"name":"...","category":"...","description":"..."},"tr":{...}}';
