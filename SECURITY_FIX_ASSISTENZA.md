# Fix sicurezza clienti Assistenza V2

Questa versione sostituisce la precedente patch SQL.

## Perché la V1 falliva
La tabella `machines` contiene una foreign key `machines_created_by_fkey` verso `profiles.id`. Eliminare un profilo già usato come creatore di un macchinario viola quindi l'integrità referenziale.

## Nuova strategia
- `profiles` non viene mai cancellato durante la conversione a cliente/tecnico;
- il record può restare come riferimento storico per macchinari e altri dati;
- i permessi effettivi derivano da `auth.users.app_metadata`, `support_customers` e `support_staff`;
- un cliente Assistenza prevale su eventuali vecchi ruoli `editor/admin` presenti in `profiles`;
- admin e tecnici assegnati esplicitamente dall'amministratore continuano a funzionare.

Eseguire `SUPABASE_SECURITY_FIX_CLIENTI_ASSISTENZA_V2.sql` nel SQL Editor. La V1 era racchiusa in una transazione, quindi se ha restituito errore non va considerata applicata.
