# Attivazione shop e-commerce Idealtech

## 1. Preparare il database

1. Aprire il progetto Idealtech su Supabase.
2. Entrare in **SQL Editor**.
3. Copiare ed eseguire tutto il contenuto di `SUPABASE_SHOP_ECOMMERCE.sql`.

Lo script crea catalogo, ordini, righe ordine, impostazioni, controlli di sicurezza, numerazione progressiva e bucket per le immagini.

## 2. Controllare le variabili su Vercel

Devono essere presenti per Production, Preview e Development:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

`SUPABASE_URL` è facoltativa: se non è presente, l’API usa `VITE_SUPABASE_URL`.

La service role key deve restare esclusivamente tra le variabili server di Vercel e non deve mai avere il prefisso `VITE_`.

## 3. Configurare shop, bonifico ed email

1. Pubblicare il progetto aggiornato.
2. Accedere all’area admin.
3. Aprire **Shop e ordini → Impostazioni**.
4. Inserire:
   - email del commerciale che riceverà i nuovi ordini;
   - costo di spedizione;
   - intestatario, banca, IBAN e BIC/SWIFT;
   - eventuali istruzioni aggiuntive per il bonifico.
5. Salvare le impostazioni.

## 4. Inserire i prodotti

Da **Shop e ordini → Prodotti** usare **Nuovo prodotto**. Per ogni prodotto si possono impostare codice, categoria, prezzo imponibile, IVA, immagine, giacenza e pubblicazione.

Un prodotto in bozza non è visibile nello shop. Se la giacenza è tracciata, il sistema impedisce ordini superiori alla quantità disponibile e la scala automaticamente quando l’ordine viene registrato.

## 5. Verifica finale consigliata

1. Aprire `/shop` e inserire un prodotto nel carrello.
2. Completare un ordine di prova.
3. Verificare che:
   - compaia nella scheda **Ordini** dell’admin;
   - l’email arrivi all’indirizzo commerciale configurato;
   - numero ordine, totale e coordinate bancarie siano corretti;
   - l’eventuale giacenza venga scalata.

L’ordine viene salvato prima dell’invio email. Se Resend non è disponibile, resta quindi comunque visibile nell’area admin con l’indicazione dell’errore di notifica.
