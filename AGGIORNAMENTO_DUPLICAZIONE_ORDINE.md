# Duplicazione e ordine dello store

## Funzioni aggiunte

- Duplicazione dei macchinari dalla pagina **Admin → Macchinari**.
- La copia include dati, prezzo e galleria immagini, ma viene creata come **bozza**.
- Duplicazione delle news dalla pagina **Admin → News**.
- La news duplicata conserva testo e immagine, ma viene creata come **bozza**.
- Selezione di un macchinario nella lista admin e spostamento con i pulsanti **Sposta sopra** e **Sposta sotto**.
- Lo stesso ordine viene utilizzato nella pagina pubblica dello store.
- I nuovi macchinari e le copie vengono aggiunti in fondo alla lista e possono poi essere riordinati.

## Operazione necessaria su Supabase

Prima di utilizzare il nuovo ordinamento, aprire il **SQL Editor** di Supabase ed eseguire:

`SUPABASE_ORDINE_MACCHINARI.sql`

Lo script aggiunge il campo `display_order`, assegna un ordine iniziale ai macchinari già presenti e crea la funzione protetta usata dal pannello admin.

Non sono necessarie nuove variabili ambiente.
