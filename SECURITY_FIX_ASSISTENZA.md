# Fix sicurezza clienti Assistenza

Questa versione corregge un problema di separazione ruoli: un cliente registrato dal portale Assistenza poteva ricevere anche un vecchio profilo `editor` nella tabella `profiles` e venire quindi interpretato come utente del CMS.

## Operazione obbligatoria

Dopo il deploy eseguire una sola volta in **Supabase > SQL Editor**:

`SUPABASE_SECURITY_FIX_CLIENTI_ASSISTENZA.sql`

Lo script:

- imposta gli account presenti in `support_customers` come `customer` in Auth, salvo admin/tecnici espliciti;
- elimina eventuali profili CMS/tecnico incompatibili dai clienti;
- aggiunge un trigger permanente che impedisce ai nuovi clienti di ereditare profili staff;
- rende `can_edit_site()`, `is_staff()`, `is_admin()` e le policy Assistenza dipendenti dal ruolo effettivo sicuro.

## Comportamento applicazione

- Cliente: `/assistenza/portale`
- Tecnico: `/admin/assistenza`
- Editor: `/admin`
- Admin: tutte le aree admin

Le route amministrative controllano il ruolo prima di renderizzare le pagine. Anche tentando di digitare manualmente `/admin`, un cliente viene rimandato al proprio portale ticket.

Inoltre, alla prima sessione cliente, `/api/support-session-security` rimuove automaticamente eventuali vecchi privilegi rimasti.
