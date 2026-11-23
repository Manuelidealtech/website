# Idealtech — traduzioni CMS affidabili (IT / EN / TR)

## Perché prima restavano testi in italiano
I titoli più comuni venivano tradotti dal dizionario presente nel frontend. I testi personalizzati già pubblicati su Supabase, come descrizioni e caratteristiche di Coating Heads, potevano NON coincidere con le frasi conosciute e restavano in italiano. Il precedente audit poteva controllare la bozza e i default senza verificare i valori online separatamente.

## Soluzione introdotta
- Il Website Editor mostra un conteggio **separato** dei testi ancora da tradurre *nel contenuto online*, oltre al controllo della bozza.
- Pulsante **Traduci testi mancanti EN/TR**: traduce solo le stringhe senza una traduzione completa.
- Pulsante **Rigenera tutte EN/TR**: traduce *anche* i campi preesistenti già compilati in modo errato (compresi paragrafi, caratteristiche e voci dei sottomenu). Attenzione: sostituisce anche eventuali traduzioni manuali EN/TR; una finestra di conferma avvisa prima di procedere.
- Le traduzioni vengono copiate dentro ciascun testo come valore `__i18n` con `it`, `en`, `tr` e verifiche per campo; URL, slug, immagini, visibilità e ordine non vengono tradotti.
- Nessun dato viene modificato finché TUTTE le richieste API di traduzione non hanno avuto successo. Il risultato viene prima inserito **in bozza**, poi richiede un controllo in anteprima e la pubblicazione manuale.
- Nessun nuovo SQL è richiesto: continua a usare il JSONB del CMS già esistente.

## Configurazione obbligatoria per traduzioni automatiche
1. Attiva un account che fornisca la **DeepL API** su https://www.deepl.com/en/developers e genera una chiave API. Controlla il piano disponibile e le condizioni economiche, che possono cambiare; l'abbonamento ChatGPT non fornisce questa chiave.
2. In **Vercel → Project Idealtech → Settings → Environment Variables** aggiungi `DEEPL_API_KEY` come variabile **server-side**, per Production (e Preview se necessario). Non usarla con il prefisso `VITE_`.
3. Verifica che su Vercel ci siano anche `SUPABASE_URL` e `SUPABASE_SECRET_KEY` oppure `SUPABASE_SERVICE_ROLE_KEY`, già usati da altre funzioni server.
4. Distribuisci il progetto. Non inviare mai la chiave DeepL in chat, né nel codice del browser.

## Aggiorna i contenuti già pubblicati (PASSAGGIO FONDAMENTALE)
1. Accedi come amministratore in **Gestione sito**.
2. Clicca **Rigenera tutte EN/TR**. È importante per vecchi valori contenenti italiano nel campo inglese.
3. Attendi il completamento del contatore. Se il provider segnala un errore, nessuna traduzione parziale viene applicata ai valori nell'editor.
4. Apri una **Anteprima**, imposta la bandiera EN e controlla almeno **Coating Heads, Manual Applicators, Ideal Melt, Shop, Chi siamo, Servizi**; ripeti per TR.
5. Se necessario, correggi le traduzioni nel selettore IT/EN/TR dell'editor, quindi premi **Salva bozza → Pubblica**.
6. Verifica in una sessione anonima: il CMS pubblicato è distinto dalla bozza, quindi l'aggiornamento non compare online finché non premi Pubblica.

## Attenzione allo Shop
I prodotti dello Shop si trovano in `shop_products`, NON in `site_content`. La stessa pagina di gestione Shop dispone dei campi IT/EN/TR e ora anche del pulsante **Traduci nome, categoria e descrizione EN/TR** all’interno di ogni scheda prodotto. La traduzione resta in bozza fino al clic su **Salva prodotto**. Il pulsante per rigenerare il **CMS non modifica** il catalogo Shop. Non confondere le pagine `/prodotti/…` con i singoli prodotti `/shop/…`.

## Sicurezza
L'endpoint `/api/cms-translate` richiede un access token Supabase valido e verifica il ruolo server-side. I clienti Assistenza e i tecnici non sono autorizzati. La chiave DeepL e la chiave Supabase privilegiata rimangono esclusivamente sul server Vercel. Le traduzioni sono inviate a DeepL solo quando l'operatore preme l'apposito comando.

## Verifiche eseguite durante lo sviluppo
- Parser JS e JSX e risoluzione degli import relativi.
- Test dei modelli `products.details`: la funzione converte ricorsivamente paragrafi, sottosezioni ed elenchi in `__i18n`.
- Test locale delle frasi visibili nello screenshot Coating Heads in EN e TR con il dizionario aggiornato.

**Non eseguiti in questo ambiente:** chiamate a DeepL con credenziali reali, test live dei dati presenti nel Supabase di produzione, build Vite completo senza dipendenze npm locali. Esegui il test in anteprima prima della pubblicazione.
