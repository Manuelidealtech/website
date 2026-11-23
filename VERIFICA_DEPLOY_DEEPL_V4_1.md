# IDEALTECH - Verifica che Vercel stia servendo la versione giusta (DeepL v4.1)

Questa versione mostra **Rigenera tutte EN/TR** e **Traduci testi mancanti EN/TR** DIRETTAMENTE dentro il riquadro delle traduzioni mancanti, con identificativo **CMS DeepL v4.1**.

## Verifica inequivocabile

Dopo aver inserito il progetto nella directory CORRETTA del repository, verificato il commit e ottenuto un deployment Production READY:

Apri `https://www.idealtech.it/cms-build-version.txt` (sostituisci il dominio se diverso).

Deve contenere esattamente:

`IDEALTECH-CMS-DEEPL-v4.1-2026-11-23`

Se il file mostra 404 oppure un'altra versione, la build online NON sta usando il pacchetto v4.1: controlla `Root Directory` in Vercel, il branch di produzione e che il commit aggiornato includa `src/pages/AdminSiteEditorPage.jsx` e `public/cms-build-version.txt` nella root Vite realmente distribuita. Il file ZIP contiene una cartella esterna `idealtech-web/`: NON creare una directory `idealtech-web/idealtech-web/` nel repository se Vercel costruisce dalla prima.

Dopo aver verificato il marker, visita `/admin/gestione-sito` con Ctrl+Shift+R o in incognito. Il riquadro giallo deve mostrare i pulsanti e la scritta `CMS DeepL v4.1`.

Se **il marker è aggiornato** ma l'editor appare vecchio, controlla eventuale CDN/service worker, la console browser, e le impostazioni di progetto/domino Vercel: il frontend potrebbe essere servito da un progetto differente.

Se **il marker è aggiornato e i pulsanti compaiono**, traduci in bozza e verifica i testi prima di pubblicare. `Rigenera tutte EN/TR` sovrascrive traduzioni manuali EN/TR. È necessaria `DEEPL_API_KEY` SOLO su Vercel, senza prefisso VITE_ e senza inserirla in repo.

Nessun nuovo SQL.
