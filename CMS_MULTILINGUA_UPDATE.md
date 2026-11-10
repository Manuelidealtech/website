# Website Editor multilingua

Il Website Editor gestisce ora i contenuti testuali in Italiano, Inglese e Turco.

## Come si usa

1. Aprire **Admin > Gestione sito**.
2. Selezionare la sezione da modificare.
3. In alto scegliere **IT**, **EN** o **TR**.
4. Modificare i testi della lingua selezionata.
5. Salvare la bozza, controllare l'anteprima e pubblicare.

Immagini, URL, slug, ordine, visibilità e impostazioni tecniche sono condivisi tra tutte le lingue.

Sono multilingua anche i contenuti complessi:
- menu principale e sottomenu Prodotti;
- testi Home, Chi siamo, Prodotti, Servizi e Footer;
- elenchi e settori;
- catalogo prodotti (nome, titolo, descrizione e CTA);
- singole pagine prodotto (hero, paragrafi, blocchi, sottosezioni, elenchi e titolo galleria).

I contenuti esistenti restano compatibili. I valori precedenti sono considerati italiani. Per EN/TR il sito usa le traduzioni già note quando disponibili; una traduzione inserita manualmente nell'editor ha sempre priorità. Se non esiste alcuna traduzione disponibile, viene mostrato il testo italiano.

Non sono necessarie nuove tabelle o query SQL: le traduzioni vengono conservate nel JSONB già usato da `site_content` e `site_content_drafts`.
