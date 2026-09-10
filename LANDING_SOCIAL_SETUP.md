# Landing social Idealtech — setup

## Cosa è stato aggiunto

- Pagina pubblica nascosta: `/links`
- Nessuna voce nel menu o nel footer pubblico
- `noindex, nofollow` automatico per evitare l'indicizzazione della pagina
- Pagina admin: `/admin/link-in-bio`
- Personalizzazione di testi, logo, sfondo, colori, badge Made in Italy e footer
- Gestione completa dei pulsanti: aggiunta, eliminazione, ordine, visibilità, evidenza, icona, URL, colori e apertura in nuova scheda
- Anteprima mobile live nel pannello admin
- Upload di logo e sfondo su Supabase Storage

## 1. Supabase

Apri **Supabase → SQL Editor** ed esegui tutto il file:

`SUPABASE_LINK_IN_BIO.sql`

Lo script crea:

- `social_landing_settings`
- `social_landing_links`
- bucket pubblico `social-assets`
- policy RLS: lettura pubblica e scrittura solo admin

## 2. Deploy

Pubblica normalmente il progetto su Vercel.

Non servono nuove variabili ambiente: vengono riutilizzate `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` già presenti nel sito.

## 3. Gestione

Dopo il deploy accedi al pannello sito e apri **Link in bio**.

La landing pubblica sarà disponibile a:

`https://www.idealtech.it/links`

È una pagina pubblica raggiungibile tramite URL, ma non è collegata da menu/footer e viene marcata `noindex, nofollow`.
