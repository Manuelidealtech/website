# Idealtech Website Editor

## Prima attivazione

1. Apri Supabase -> SQL Editor.
2. Esegui tutto il file `SUPABASE_WEBSITE_CMS.sql`.
3. Pubblica normalmente questa versione del progetto su Vercel.
4. Accedi al pannello admin e apri **Gestione sito**.

Il sito pubblico continua a usare i contenuti inclusi nel codice finché non viene effettuata la prima pubblicazione dal CMS.

## Flusso consigliato

1. Modifica i campi della sezione desiderata.
2. Premi **Salva bozza**.
3. Premi **Anteprima** per aprire la pagina con i contenuti in bozza (visibile solo mentre sei autenticato).
4. Premi **Pubblica** quando il risultato è corretto.

Prima di ogni nuova pubblicazione viene salvato uno snapshot della versione online precedente. Dalla sezione **Versioni precedenti** puoi ricaricarlo in bozza, controllarlo in anteprima e pubblicarlo nuovamente.

## Cosa è gestibile in questa prima versione

- Navbar: nomi, visibilità e ordine delle voci.
- Menu Prodotti: nomi, visibilità e ordine.
- Home: hero, immagini responsive e principali titoli di sezione.
- Chi siamo: hero, tutti e quattro i blocchi testuali, foto esterna Idealtech e sezione completa di Enrico Bozza.
- Prodotti: hero, riquadro “Applicatori Hot Melt”, riquadro “Your Partner for Glueing”, settori e catalogo con nome, titolo, descrizione, foto, visibilità e ordine.
- Pagine prodotto: titolo, linea, introduzione, blocchi descrittivi, caratteristiche, sottosezioni, elenchi puntati e titoli galleria per ogni singolo prodotto.
- Gallerie prodotto: aggiunta, eliminazione e riordino delle foto delle singole pagine prodotto.
- Servizi: hero, elenco servizi, titoli e call to action.
- Footer: dati societari e link social.
- SEO: resta disponibile nella sezione SEO già presente nel pannello.

## Immagini

Le immagini caricate dal Website Editor vengono automaticamente ridimensionate e convertite in WebP e salvate nel bucket pubblico Supabase `site-assets`.

## Aggiornamento editor esteso

Se `SUPABASE_WEBSITE_CMS.sql` era già stato eseguito in precedenza, per queste nuove sezioni **non serve eseguire altro SQL**: i nuovi campi vengono creati automaticamente alla prima bozza/pubblicazione dal pannello.
