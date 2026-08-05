-- IDEALTECH - Gestione SEO dal pannello amministratore
-- Eseguire una sola volta nel SQL Editor di Supabase.

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

create table if not exists public.seo_settings (
  path text primary key,
  page_name text not null,
  title text not null,
  description text not null,
  keywords text not null default '',
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  indexable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_settings enable row level security;

drop policy if exists "seo_settings_public_read" on public.seo_settings;
create policy "seo_settings_public_read"
on public.seo_settings
for select
to anon, authenticated
using (true);

drop policy if exists "seo_settings_admin_insert" on public.seo_settings;
create policy "seo_settings_admin_insert"
on public.seo_settings
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "seo_settings_admin_update" on public.seo_settings;
create policy "seo_settings_admin_update"
on public.seo_settings
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "seo_settings_admin_delete" on public.seo_settings;
create policy "seo_settings_admin_delete"
on public.seo_settings
for delete
to authenticated
using (public.is_admin());

insert into public.seo_settings
  (path, page_name, title, description, keywords, og_image_url, indexable)
values
  ('/', 'Home', 'Idealtech | Sistemi industriali di incollaggio', 'Idealtech progetta, installa e assiste sistemi professionali per l’applicazione di adesivi hot-melt e cold glue nel settore industriale.', 'sistemi di incollaggio, hot melt, cold glue, impianti industriali, Idealtech', '/home-hero-1280.webp', true),
  ('/chi-siamo', 'Chi siamo', 'Chi siamo | Idealtech', 'Scopri Idealtech, l’esperienza tecnica e la rete internazionale dedicata alle soluzioni industriali di incollaggio.', 'Idealtech, azienda incollaggio industriale, sistemi hot melt', '/home-hero-1280.webp', true),
  ('/prodotti', 'Prodotti', 'Prodotti e sistemi di incollaggio | Idealtech', 'Fusori, estrusori, applicatori, pistole, ricambi e linee complete per l’incollaggio industriale hot-melt e cold glue.', 'fusori hot melt, applicatori colla, pistole colla, linee incollaggio, ricambi hot melt', '/home-hero-1280.webp', true),
  ('/store', 'Macchinari usati', 'Macchinari usati per incollaggio industriale | Idealtech', 'Consulta i macchinari usati e ricondizionati disponibili presso Idealtech, con caratteristiche, immagini e prezzo.', 'macchinari usati incollaggio, impianti hot melt usati, Idealtech usato', '/home-hero-1280.webp', true),
  ('/servizi', 'Servizi', 'Assistenza e servizi tecnici | Idealtech', 'Progettazione, installazione, manutenzione, ricambi e assistenza tecnica per sistemi e linee di incollaggio industriale.', 'assistenza hot melt, manutenzione sistemi colla, progettazione linee incollaggio', '/home-hero-1280.webp', true),
  ('/contatti', 'Contatti', 'Contatti | Idealtech', 'Contatta Idealtech per informazioni commerciali, preventivi, assistenza tecnica e supporto sui sistemi di incollaggio.', 'contatti Idealtech, preventivo incollaggio industriale, assistenza Idealtech', '/home-hero-1280.webp', true),
  ('/news', 'News', 'News ed eventi | Idealtech', 'Aggiornamenti, fiere, novità e comunicazioni dal mondo Idealtech e dell’incollaggio industriale.', 'news Idealtech, fiere incollaggio industriale, novità hot melt', '/home-hero-1280.webp', true),
  ('/prodotti/drum-line', 'Drum line', 'Drum line | Idealtech', 'Sistemi Drum Line Idealtech per la fusione e l’alimentazione industriale di adesivi hot-melt.', 'drum melter, drum line, fusore fusti hot melt', '/home-hero-1280.webp', true),
  ('/prodotti/extruder-line', 'Extruder line', 'Extruder line | Idealtech', 'Soluzioni Extruder Line Idealtech per processi industriali continui e applicazioni hot-melt.', 'extruder line, estrusore hot melt, sistemi incollaggio continuo', '/home-hero-1280.webp', true),
  ('/prodotti/assy-line', 'Assy line', 'Assy line | Idealtech', 'Linee Assy Idealtech per assemblaggio e incollaggio industriale integrate nei processi produttivi.', 'assy line, linea assemblaggio, incollaggio industriale automatico', '/home-hero-1280.webp', true),
  ('/prodotti/coating-heads', 'Coating heads', 'Coating heads | Idealtech', 'Teste di spalmatura e applicazione Idealtech per un dosaggio uniforme e preciso degli adesivi.', 'coating heads, teste spalmatura colla, applicatori hot melt', '/home-hero-1280.webp', true),
  ('/prodotti/custom-machines', 'Macchine speciali', 'Macchine speciali su misura | Idealtech', 'Macchine e automazioni speciali progettate da Idealtech sulle esigenze del processo produttivo.', 'macchine speciali, automazioni industriali, progettazione su misura', '/home-hero-1280.webp', true),
  ('/prodotti/ideal-melt', 'Ideal Melt', 'Ideal Melt | Idealtech', 'Gamma Ideal Melt di fusori e sistemi professionali per l’applicazione di adesivi hot-melt.', 'Ideal Melt, fusore hot melt, impianto colla a caldo', '/home-hero-1280.webp', true),
  ('/prodotti/idm-gp', 'IDM GP', 'IDM GP | Idealtech', 'Sistemi IDM GP Idealtech per applicazioni industriali affidabili e precise.', 'IDM GP, Idealtech, sistema incollaggio industriale', '/home-hero-1280.webp', true),
  ('/prodotti/gun-line', 'Gun line', 'Gun line | Idealtech', 'Applicatori e pistole automatiche Idealtech per il dosaggio professionale degli adesivi.', 'gun line, pistole hot melt, applicatori automatici colla', '/home-hero-1280.webp', true),
  ('/prodotti/hose-line', 'Hose line', 'Hose line | Idealtech', 'Tubi riscaldati e componenti Hose Line Idealtech per sistemi hot-melt industriali.', 'tubi riscaldati hot melt, hose line, ricambi hot melt', '/home-hero-1280.webp', true),
  ('/prodotti/cold-line', 'Cold line', 'Cold line | Idealtech', 'Sistemi Idealtech per l’applicazione precisa di adesivi cold glue nei processi industriali.', 'cold glue, cold line, applicazione colla a freddo', '/home-hero-1280.webp', true),
  ('/prodotti/hand-gun', 'Hand gun', 'Hand gun | Idealtech', 'Pistole manuali Idealtech per applicazioni professionali di adesivi hot-melt.', 'hand gun hot melt, pistola manuale colla, Idealtech', '/home-hero-1280.webp', true),
  ('/prodotti/spare-parts', 'Ricambi', 'Ricambi e componenti | Idealtech', 'Ricambi compatibili e componenti tecnici per mantenere efficienti i sistemi di incollaggio industriale.', 'ricambi hot melt, componenti sistemi colla, ricambi Idealtech', '/home-hero-1280.webp', true)
on conflict (path) do nothing;

create index if not exists seo_settings_indexable_idx
  on public.seo_settings (indexable, path);
