# Idealtech — Setup portale assistenza

## 1. Database Supabase

Apri **Supabase → SQL Editor**, incolla ed esegui tutto il file:

`SUPABASE_ASSISTENZA_TICKET.sql`

Crea:
- `support_staff` — tecnici assistenza;
- `support_customers` — profili clienti;
- `support_tickets` — richieste con stato/priorità/macchinario/seriale;
- `support_messages` — chat ticket;
- `support_ticket_reads` — letture e badge messaggi non letti;
- policy RLS cliente/staff;
- trigger per profilo cliente e timestamp;
- Realtime per ticket e messaggi.

## 2. Variabili Vercel

L'API `/api/admin-users` usa una chiave server per creare admin e tecnici.
Se il progetto la possiede già non devi cambiare nulla.

Variabili supportate:
- `SUPABASE_URL` (oppure `VITE_SUPABASE_URL`)
- `SUPABASE_SECRET_KEY` **oppure** il precedente `SUPABASE_SERVICE_ROLE_KEY`

La secret/service-role key deve esistere **solo su Vercel/server**, mai nelle variabili `VITE_` accessibili dal browser.

## 3. Redirect email Supabase Auth

Se è attiva la conferma email:

**Supabase → Authentication → URL Configuration → Redirect URLs**

aggiungi:

`https://www.idealtech.it/assistenza/portale`

Aggiungi anche il dominio di preview/staging se usato durante i test.

## 4. Test consigliato

1. Pubblica il progetto aggiornato.
2. Vai su `/assistenza/registrazione` e crea un cliente test.
3. Conferma l'email, se richiesto.
4. Apri un ticket con modello e numero seriale.
5. Da admin vai in **Utenti e tecnici** e crea un utente con ruolo **Tecnico assistenza**.
6. Accedi con il tecnico: deve vedere soltanto **Assistenza**.
7. Apri il ticket, rispondi e verifica che il cliente riceva il messaggio senza refresh.
8. Cambia stato in **In lavorazione**, poi **Chiuso / archivia**.
9. Verifica che il ticket compaia nella scheda **Chiusi/Archivio** e che non siano più inviabili messaggi.

## Rotte aggiunte

- `/assistenza` — landing pubblica
- `/assistenza/login` — login clienti
- `/assistenza/registrazione` — registrazione clienti
- `/assistenza/portale` — portale cliente
- `/assistenza/portale/:ticketId` — chat cliente
- `/admin/assistenza` — portale admin/tecnico
- `/admin/assistenza/:ticketId` — chat operatore
