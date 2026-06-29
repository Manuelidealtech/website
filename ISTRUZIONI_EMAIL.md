# Invio email modulo contatti tramite SMTP

Il modulo contatti invia una richiesta `POST` a `/api/contact`.
L'endpoint serverless invia la mail a:

```txt
info@idealtech.it
```

Questa versione usa SMTP con `nodemailer`, quindi non serve verificare il dominio su Resend e non servono record DNS. Devi solo avere i dati SMTP della casella email o del provider di posta.

## Variabili da configurare su Vercel

Nel progetto Vercel aggiungi queste variabili in **Settings → Environment Variables**:

```txt
SMTP_HOST=smtp.tuo-provider.it
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@idealtech.it
SMTP_PASS=password_o_password_app
SMTP_FROM_EMAIL=Sito Idealtech <info@idealtech.it>
CONTACT_TO_EMAIL=info@idealtech.it
```

## Come scegliere porta e sicurezza

Usa una di queste configurazioni:

```txt
SMTP_PORT=587
SMTP_SECURE=false
```

oppure:

```txt
SMTP_PORT=465
SMTP_SECURE=true
```

Di solito la porta `587` con `SMTP_SECURE=false` è quella più comune.

## Esempi provider

### Gmail / Google Workspace

```txt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@idealtech.it
SMTP_PASS=password_app_google
```

Con Google spesso non va inserita la password normale: serve una **password per app**.

### Aruba

```txt
SMTP_HOST=smtps.aruba.it
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@idealtech.it
SMTP_PASS=password_casella
```

### Register.it / altri provider

Controlla dal pannello della posta i dati SMTP. Di solito servono:

- server SMTP
- porta
- SSL/TLS sì/no
- email completa come username
- password della casella

## Cosa arriva nella mail

La mail contiene:

- Nome e cognome del cliente
- Email del cliente
- Telefono, se inserito
- Messaggio

La risposta alla mail usa automaticamente l'indirizzo del cliente tramite `replyTo`, quindi quando premi “Rispondi” scrivi direttamente al cliente.
