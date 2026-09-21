# Aggiornamento SEO, snippet Google e footer

## Modifiche applicate

- Rimossi telefono, email e PEC dal footer, così Google ha meno probabilità di usarli come testo descrittivo dei sitelink.
- Aggiunto `data-nosnippet` al footer per escludere il contenuto ripetitivo del footer dagli snippet generati dal motore di ricerca.
- Mantenuti nel footer ragione sociale, capitale sociale, P. IVA/C.F., indirizzo, collegamento ai contatti, privacy e copyright.
- Corrette le proporzioni delle icone Facebook, Instagram e LinkedIn su desktop e mobile con contenitori quadrati e `object-fit: contain`.
- Aggiornati i dati strutturati `Organization`, `LocalBusiness` e `WebSite`.
- Aggiunti dati strutturati dinamici `WebPage`, `CollectionPage`, `BreadcrumbList`, `ItemList` e `Product` in base alla pagina visitata.
- I macchinari usati pubblicati generano ora titolo, description, immagine, disponibilità, condizione e offerta SEO specifici.
- Uniformati sitemap, robots e riferimenti strutturati al dominio canonico `https://www.idealtech.it`.

## Pubblicazione

Non è necessario eseguire nuovi script SQL su Supabase.

1. Pubblicare il progetto aggiornato su GitHub/Vercel.
2. Eseguire un nuovo deployment di produzione.
3. Aprire Google Search Console e inviare nuovamente:
   - `https://www.idealtech.it/sitemap.xml`
4. Usare **Controllo URL → Richiedi indicizzazione** almeno per:
   - `https://www.idealtech.it/`
   - `https://www.idealtech.it/prodotti`
   - `https://www.idealtech.it/servizi`
   - `https://www.idealtech.it/contatti`
   - `https://www.idealtech.it/store`

Google può impiegare alcuni giorni o settimane per sostituire gli snippet già memorizzati. Le modifiche non cambiano istantaneamente il risultato già visibile nella ricerca.
