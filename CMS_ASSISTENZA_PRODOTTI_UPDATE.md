# Aggiornamento CMS - Assistenza e prodotti dinamici

## Assistenza online/offline
In **Admin > Gestione sito > Assistenza** è disponibile il controllo **Pubblica area assistenza online**.

- Online: la voce Assistenza è visibile e le rotte cliente sono accessibili.
- Offline: i link pubblici vengono nascosti e le rotte `/assistenza`, `/assistenza/login`, `/assistenza/registrazione` e `/assistenza/portale` reindirizzano alla Home.
- L'area tecnica `/admin/assistenza` resta accessibile ai tecnici/admin anche quando il portale pubblico è offline.
- L'anteprima CMS continua a funzionare anche se la sezione è offline.

## Nuove pagine prodotto
In **Gestione sito > Pagine prodotto** usare **+ Crea nuova pagina prodotto**.

Ogni pagina ha uno slug modificabile e genera un indirizzo del tipo:
`/prodotti/nome-prodotto`

Il sito ora usa anche la rotta dinamica `/prodotti/:productSlug`, quindi le nuove pagine create dal CMS non richiedono modifiche manuali a `App.jsx` né nuovi deploy per aggiungere una nuova rotta.

## Sottomenu Prodotti
In **Gestione sito > Navbar > Prodotti nel menu** è possibile:

- aggiungere nuove voci;
- eliminare voci;
- riordinare le voci;
- mostrarle/nasconderle;
- modificare nome e Redirect URL.

Il campo Redirect URL suggerisce automaticamente le pagine prodotto già create.

## Catalogo pagina Prodotti
In **Gestione sito > Prodotti > Catalogo prodotti** è disponibile **+ Aggiungi nuovo prodotto**.

Per ogni scheda sono modificabili:
- linea/nome;
- titolo;
- descrizione;
- testo pulsante;
- Redirect URL;
- immagine;
- visibilità;
- ordine.

Le schede possono anche essere eliminate.

## Database
Non serve eseguire nuovo SQL. Tutte le nuove impostazioni vengono salvate nella struttura JSON già esistente di `site_content` / `site_content_drafts`.
