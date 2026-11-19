# Registrazione assistenza senza dipendenza dalle email Supabase

La registrazione clienti del portale assistenza non usa più `supabase.auth.signUp()` dal browser.

## Nuovo flusso

1. Il cliente compila il form `/assistenza/registrazione`.
2. Il browser invia i dati a `/api/support-register`.
3. La funzione Vercel usa la chiave Supabase server-side e crea l'utente con `auth.admin.createUser()` e `email_confirm: true`.
4. Viene creato/aggiornato il record in `support_customers`.
5. Il browser esegue subito `signInWithPassword()` e apre `/assistenza/portale`.

Non viene inviata alcuna email di conferma durante la registrazione, quindi la creazione account non dipende dal limite email del servizio SMTP integrato di Supabase.

## Variabili Vercel richieste

Sono le stesse già usate da `api/admin-users.js`:

- `SUPABASE_URL` (oppure `VITE_SUPABASE_URL`)
- `SUPABASE_SECRET_KEY` (oppure `SUPABASE_SERVICE_ROLE_KEY`)

La chiave secret/service role deve esistere solo nelle variabili server di Vercel e non deve mai essere esposta con prefisso `VITE_`.

## Database

Non serve nuovo SQL se `SUPABASE_ASSISTENZA_TICKET.sql` è già stato eseguito.

## Nota sicurezza

L'endpoint valida i campi lato server, controlla l'origine delle richieste browser e include un campo honeypot invisibile contro i bot più semplici. L'autorizzazione dei ticket resta protetta dalle RLS già configurate in Supabase.
