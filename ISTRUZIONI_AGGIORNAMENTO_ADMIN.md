# Attivazione nuove funzioni admin

## 1. Supabase

Apri **Supabase → SQL Editor**, incolla tutto il contenuto di `SUPABASE_AGGIORNAMENTO.sql` ed eseguilo.

Questo aggiunge:
- opzione prezzo con IVA inclusa/esclusa;
- tabella per nomi, recapiti e foto della pagina Contatti;
- bucket pubblico `contact-photos` con modifica riservata agli admin.

## 2. Creazione utenti amministratori

La creazione di account Auth deve avvenire lato server. In **Vercel → Project → Settings → Environment Variables** aggiungi:

- `SUPABASE_SERVICE_ROLE_KEY`: la chiave **service_role** del progetto Supabase;
- `SUPABASE_URL`: facoltativa, perché il codice usa già `VITE_SUPABASE_URL` come fallback.

La service role key non deve mai essere inserita in un file con prefisso `VITE_` e non deve essere pubblicata nel browser.

Dopo aver aggiunto la variabile, esegui un nuovo deployment. La sezione sarà disponibile in **Admin → Utenti admin**.

## 3. Comportamento bozza macchinario

Campi e immagini del nuovo macchinario vengono salvati nel browser. La bozza viene cancellata solo quando:
- il macchinario viene creato correttamente;
- si preme “Svuota bozza”.

Dopo la creazione si torna alla dashboard usando una navigazione sostitutiva, quindi il tasto Indietro non riapre il form appena inviato.
