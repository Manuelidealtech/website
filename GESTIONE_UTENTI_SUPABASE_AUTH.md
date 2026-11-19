# Gestione utenti Supabase Auth dal portale Idealtech

La pagina **Admin > Utenti e tecnici** ora legge direttamente gli utenti da Supabase Auth tramite una API server-side protetta.

## Funzioni disponibili

- visualizzazione di tutti gli utenti presenti in `auth.users`;
- ricerca per nome, email, azienda, telefono o UUID;
- filtro Cliente / Tecnico / Admin / Senza ruolo;
- cambio ruolo Cliente <-> Tecnico <-> Admin;
- modifica diretta della password tramite `auth.admin.updateUserById`;
- eliminazione definitiva tramite `auth.admin.deleteUser` per account senza storico assistenza;
- visualizzazione di account rimasti in Auth anche se il relativo profilo applicativo è stato rimosso.

## Sicurezza

Le operazioni privilegiate vengono eseguite soltanto in `/api/admin-users.js` con la chiave server Supabase.
La chiave `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` non deve essere esposta al frontend.

Il backend verifica sempre che la sessione chiamante appartenga a un record `profiles` con ruolo `admin`.

Per evitare blocchi amministrativi:

- non è possibile declassare o eliminare il proprio account mentre è in uso;
- non è possibile eliminare o declassare l'ultimo amministratore;
- l'eliminazione è bloccata se l'utente ha ticket o messaggi assistenza collegati, per evitare cancellazioni a cascata dello storico.

## Database

Non serve eseguire nuovo SQL. Il sistema utilizza le tabelle già create dal portale assistenza e Supabase Auth.
