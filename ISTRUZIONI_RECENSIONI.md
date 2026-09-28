# Recensioni clienti - Idealtech

## 1. Esegui lo SQL
Apri Supabase > SQL Editor ed esegui una sola volta:

`SUPABASE_RECENSIONI.sql`

Lo script crea:
- tabella `customer_reviews`
- permessi pubblici/staff
- bucket pubblico `review-assets`
- policy per upload/modifica/eliminazione immagini

## 2. Pubblica il sito aggiornato
Dopo il deploy, nel pannello admin comparirà la voce **Recensioni**.

Percorso:
`/admin/recensioni`

## 3. Gestione
Da lì puoi:
- aggiungere recensioni
- modificare nome, azienda, ruolo e testo
- impostare il voto da 1 a 5 stelle
- caricare foto cliente o logo azienda
- mostrare/nascondere una recensione
- impostare l'ordine di visualizzazione
- eliminare recensioni

Le immagini caricate vengono compresse automaticamente in WebP prima dell'upload.

## 4. Visualizzazione pubblica
Le recensioni pubblicate vengono mostrate automaticamente nella homepage, nella sezione:
`/#recensioni`

Se non ci sono recensioni pubblicate, la sezione non viene visualizzata.
