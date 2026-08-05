# Invio email dei moduli del sito

I moduli **Contatti** e **Servizi** inviano una richiesta `POST` all'endpoint serverless:

```txt
/api/contact
```

L'endpoint usa `nodemailer` e invia il messaggio all'indirizzo indicato nella variabile:

```txt
CONTACT_TO_EMAIL
```

Se la variabile non è impostata, il destinatario predefinito nel codice è:

```txt
info@idealtech.it
```

## Configurazione Microsoft 365 su Vercel

In **Vercel → progetto Idealtech → Settings → Environment Variables** configura:

```txt
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@idealtech.it
SMTP_PASS=PASSWORD_DELLA_CASELLA_O_PASSWORD_APP
SMTP_FROM_EMAIL=Sito Idealtech <info@idealtech.it>
CONTACT_TO_EMAIL=info@idealtech.it
```

Applica le variabili agli ambienti desiderati, almeno **Production**, quindi esegui un nuovo deployment.

## Importante per Microsoft 365

La casella usata come `SMTP_USER` deve poter effettuare l'invio SMTP autenticato. Se Microsoft 365 restituisce un errore di autenticazione, controlla che **Authenticated SMTP** sia abilitato per la casella oppure utilizza una password/applicazione compatibile con le regole di sicurezza del tenant.

## Verifica pratica

1. Apri la pagina pubblica **Contatti**.
2. Compila tutti i campi e accetta la privacy.
3. Invia il messaggio.
4. Il sito deve mostrare “Messaggio inviato correttamente”.
5. Controlla la casella `info@idealtech.it`, inclusi posta indesiderata e quarantena.
6. In caso di errore, consulta i log della funzione `/api/contact` nel deployment Vercel.

La mail contiene nome, email, telefono e messaggio del cliente. Il campo `replyTo` è impostato sull'indirizzo del cliente, quindi premendo **Rispondi** la risposta viene indirizzata direttamente a lui.
