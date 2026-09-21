-- IDEALTECH - Shop e-commerce con ordini e pagamento tramite bonifico
-- Eseguire una sola volta nel SQL Editor di Supabase prima di pubblicare il sito aggiornato.

create extension if not exists pgcrypto;

-- Utenti autorizzati a gestire il sito (amministratori ed editor).
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

-- Catalogo prodotti dello shop.
create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  name text not null,
  description text,
  category text,
  price numeric(12,2) not null default 0 check (price >= 0),
  vat_rate numeric(5,2) not null default 22 check (vat_rate >= 0 and vat_rate <= 100),
  image_url text,
  image_path text,
  track_stock boolean not null default false,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_products_public_idx
  on public.shop_products (is_published, sort_order, created_at desc);

-- Impostazioni modificabili dal pannello. È prevista una sola riga (id = 1).
create table if not exists public.shop_settings (
  id smallint primary key default 1 check (id = 1),
  shop_enabled boolean not null default true,
  commercial_email text not null default 'info@idealtech.it',
  shipping_cost numeric(12,2) not null default 0 check (shipping_cost >= 0),
  bank_account_holder text not null default 'Idealtech s.r.l.',
  bank_name text,
  bank_iban text,
  bank_bic text,
  bank_instructions text default 'Indicare il numero d’ordine nella causale del bonifico.',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.shop_settings (id)
values (1)
on conflict (id) do nothing;

-- Numerazione progressiva degli ordini.
create sequence if not exists public.shop_order_number_seq start 1;

create or replace function public.next_shop_order_number()
returns text
language sql
volatile
security definer
set search_path = public
as $$
  select 'ORD-' || to_char(current_date, 'YYYY') || '-' || lpad(nextval('public.shop_order_number_seq')::text, 6, '0');
$$;

-- Testata ordine: contiene anche uno snapshot completo del cliente e dei totali.
create table if not exists public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.next_shop_order_number(),
  status text not null default 'new'
    check (status in ('new', 'awaiting_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
  company text not null,
  vat_number text not null,
  tax_code text,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  province text,
  country text not null,
  notes text,
  net_total numeric(12,2) not null default 0,
  vat_total numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,
  email_sent_at timestamptz,
  email_message_id text,
  email_error text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_orders_status_created_idx
  on public.shop_orders (status, created_at desc);

-- Righe ordine con snapshot del prodotto: gli ordini storici non cambiano se il catalogo viene modificato.
create table if not exists public.shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_id uuid references public.shop_products(id) on delete restrict,
  sku text,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_net_price numeric(12,2) not null,
  vat_rate numeric(5,2) not null,
  line_net numeric(12,2) not null,
  line_vat numeric(12,2) not null,
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists shop_order_items_order_idx
  on public.shop_order_items (order_id);

-- Timestamp automatico sulle modifiche admin.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shop_products_set_updated_at on public.shop_products;
create trigger shop_products_set_updated_at
before update on public.shop_products
for each row execute function public.set_updated_at();

drop trigger if exists shop_settings_set_updated_at on public.shop_settings;
create trigger shop_settings_set_updated_at
before update on public.shop_settings
for each row execute function public.set_updated_at();

drop trigger if exists shop_orders_set_updated_at on public.shop_orders;
create trigger shop_orders_set_updated_at
before update on public.shop_orders
for each row execute function public.set_updated_at();

-- Creazione atomica dell’ordine. Prezzi, IVA, disponibilità e totale vengono
-- sempre ricalcolati nel database; il browser non può decidere gli importi.
create or replace function public.create_shop_order(p_customer jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product public.shop_products%rowtype;
  v_order public.shop_orders%rowtype;
  v_quantity integer;
  v_product_id uuid;
  v_line_net numeric(12,2);
  v_line_vat numeric(12,2);
  v_line_total numeric(12,2);
  v_net_total numeric(12,2) := 0;
  v_vat_total numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_result_items jsonb := '[]'::jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Il carrello non contiene prodotti validi.';
  end if;

  if jsonb_array_length(p_items) > 50 then
    raise exception 'Il carrello contiene troppi prodotti.';
  end if;

  select shipping_cost into v_shipping
  from public.shop_settings
  where id = 1 and shop_enabled = true;

  if not found then
    raise exception 'Lo shop è momentaneamente sospeso.';
  end if;

  -- Primo passaggio: blocco delle righe prodotto e calcolo dei totali.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity < 1 or v_quantity > 99 then
      raise exception 'Quantità non valida.';
    end if;

    select * into v_product
    from public.shop_products
    where id = v_product_id
    for update;

    if not found or not v_product.is_published then
      raise exception 'Un prodotto nel carrello non è più disponibile.';
    end if;

    if v_product.track_stock and v_product.stock_quantity < v_quantity then
      raise exception 'Quantità non disponibile per il prodotto %.', v_product.name;
    end if;

    v_line_net := round(v_product.price * v_quantity, 2);
    v_line_vat := round(v_line_net * v_product.vat_rate / 100, 2);
    v_net_total := v_net_total + v_line_net;
    v_vat_total := v_vat_total + v_line_vat;
  end loop;

  insert into public.shop_orders (
    company, vat_number, tax_code, full_name, email, phone,
    address, city, postal_code, province, country, notes,
    net_total, vat_total, shipping_total, grand_total
  ) values (
    trim(p_customer ->> 'company'),
    trim(p_customer ->> 'vat_number'),
    nullif(trim(p_customer ->> 'tax_code'), ''),
    trim(p_customer ->> 'full_name'),
    lower(trim(p_customer ->> 'email')),
    trim(p_customer ->> 'phone'),
    trim(p_customer ->> 'address'),
    trim(p_customer ->> 'city'),
    trim(p_customer ->> 'postal_code'),
    nullif(trim(p_customer ->> 'province'), ''),
    trim(p_customer ->> 'country'),
    nullif(trim(p_customer ->> 'notes'), ''),
    v_net_total,
    v_vat_total,
    v_shipping,
    v_net_total + v_vat_total + v_shipping
  ) returning * into v_order;

  -- Secondo passaggio: snapshot delle righe e scarico della giacenza.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    select * into v_product from public.shop_products where id = v_product_id;
    v_line_net := round(v_product.price * v_quantity, 2);
    v_line_vat := round(v_line_net * v_product.vat_rate / 100, 2);
    v_line_total := v_line_net + v_line_vat;

    insert into public.shop_order_items (
      order_id, product_id, sku, product_name, quantity,
      unit_net_price, vat_rate, line_net, line_vat, line_total
    ) values (
      v_order.id, v_product.id, v_product.sku, v_product.name, v_quantity,
      v_product.price, v_product.vat_rate, v_line_net, v_line_vat, v_line_total
    );

    if v_product.track_stock then
      update public.shop_products
      set stock_quantity = stock_quantity - v_quantity
      where id = v_product.id;
    end if;

    v_result_items := v_result_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'sku', v_product.sku,
      'name', v_product.name,
      'quantity', v_quantity,
      'unit_net_price', v_product.price,
      'vat_rate', v_product.vat_rate,
      'line_net', v_line_net,
      'line_vat', v_line_vat,
      'line_total', v_line_total
    ));
  end loop;

  return jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'company', v_order.company,
    'vat_number', v_order.vat_number,
    'tax_code', v_order.tax_code,
    'full_name', v_order.full_name,
    'email', v_order.email,
    'phone', v_order.phone,
    'address', v_order.address,
    'city', v_order.city,
    'postal_code', v_order.postal_code,
    'province', v_order.province,
    'country', v_order.country,
    'notes', v_order.notes,
    'net_total', v_order.net_total,
    'vat_total', v_order.vat_total,
    'shipping_total', v_order.shipping_total,
    'grand_total', v_order.grand_total,
    'items', v_result_items
  );
end;
$$;

revoke all on function public.create_shop_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_shop_order(jsonb, jsonb) to service_role;

-- Permessi database e Row Level Security.
grant select on public.shop_products to anon, authenticated;
grant insert, update, delete on public.shop_products to authenticated;
grant select, update on public.shop_settings to authenticated;
grant select, update on public.shop_orders to authenticated;
grant select on public.shop_order_items to authenticated;
grant usage, select on sequence public.shop_order_number_seq to service_role;
grant all privileges on public.shop_products, public.shop_settings, public.shop_orders, public.shop_order_items to service_role;

alter table public.shop_products enable row level security;
alter table public.shop_settings enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;

drop policy if exists "shop_products_public_read" on public.shop_products;
create policy "shop_products_public_read"
on public.shop_products for select to anon, authenticated
using (is_published or public.is_staff());

drop policy if exists "shop_products_staff_insert" on public.shop_products;
create policy "shop_products_staff_insert"
on public.shop_products for insert to authenticated
with check (public.is_staff());

drop policy if exists "shop_products_staff_update" on public.shop_products;
create policy "shop_products_staff_update"
on public.shop_products for update to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "shop_products_staff_delete" on public.shop_products;
create policy "shop_products_staff_delete"
on public.shop_products for delete to authenticated
using (public.is_staff());

drop policy if exists "shop_settings_staff_read" on public.shop_settings;
create policy "shop_settings_staff_read"
on public.shop_settings for select to authenticated
using (public.is_staff());

drop policy if exists "shop_settings_staff_update" on public.shop_settings;
create policy "shop_settings_staff_update"
on public.shop_settings for update to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "shop_orders_staff_read" on public.shop_orders;
create policy "shop_orders_staff_read"
on public.shop_orders for select to authenticated
using (public.is_staff());

drop policy if exists "shop_orders_staff_update" on public.shop_orders;
create policy "shop_orders_staff_update"
on public.shop_orders for update to authenticated
using (public.is_staff()) with check (public.is_staff());

drop policy if exists "shop_order_items_staff_read" on public.shop_order_items;
create policy "shop_order_items_staff_read"
on public.shop_order_items for select to authenticated
using (public.is_staff());

-- Bucket pubblico per le immagini prodotto.
insert into storage.buckets (id, name, public)
values ('shop-products', 'shop-products', true)
on conflict (id) do update set public = true;

drop policy if exists "shop_product_images_public_read" on storage.objects;
create policy "shop_product_images_public_read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'shop-products');

drop policy if exists "shop_product_images_staff_insert" on storage.objects;
create policy "shop_product_images_staff_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'shop-products' and public.is_staff());

drop policy if exists "shop_product_images_staff_update" on storage.objects;
create policy "shop_product_images_staff_update"
on storage.objects for update to authenticated
using (bucket_id = 'shop-products' and public.is_staff())
with check (bucket_id = 'shop-products' and public.is_staff());

drop policy if exists "shop_product_images_staff_delete" on storage.objects;
create policy "shop_product_images_staff_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'shop-products' and public.is_staff());
