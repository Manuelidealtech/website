# Aggiornamento Idealtech: SEO, prestazioni, footer e Resend

## Prestazioni e PageSpeed

- home hero convertita in WebP responsive per mobile, tablet e desktop;
- preload della sola immagine principale;
- caricamento differito delle pagine React tramite code splitting;
- immagini sotto la piega caricate in lazy loading;
- immagini dei settori e mappa convertite in WebP ottimizzati;
- galleria Servizi convertita da PNG pesanti a WebP ottimizzati;
- Google Analytics caricato dopo l'evento `load`;
- dimensioni esplicite sulle immagini principali per limitare gli spostamenti del layout;
- rendering differito delle sezioni della home sotto la piega.

## Gestione SEO dal pannello

È disponibile la voce **SEO** nel pannello amministratore. Per ogni pagina pubblica è possibile impostare:

- titolo SEO;
- meta description;
- parole chiave;
- titolo e descrizione social;
- immagine Open Graph;
- URL canonico;
- indicizzazione oppure `noindex, nofollow`;
- anteprima del risultato Google.

Prima dell'uso eseguire `SUPABASE_SEO_PERFORMANCE.sql` nel SQL Editor di Supabase.

Sono inclusi anche:

- `robots.txt`;
- `sitemap.xml`;
- dati strutturati Organization;
- meta Open Graph e Twitter;
- noindex automatico per login e area amministrativa.

## Footer

Nel footer è stata aggiunta la dicitura:

```text
Capitale sociale: € 70.000,00
```

## Moduli Contatti e Servizi

I due moduli inviano ora le email tramite la funzione Vercel `/api/contact` e Resend. La chiave API resta sul server, mai nel frontend. Sono presenti validazione dei campi, escape dei contenuti, campo antispam honeypot e `reply_to` impostato sull'indirizzo del visitatore.

La procedura completa è in `CONFIGURAZIONE_RESEND.md`.
