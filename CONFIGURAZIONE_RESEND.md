# Configurazione Resend per il modulo contatti Idealtech

Il progetto invia ora le richieste dei moduli **Contatti** e **Servizi** tramite la funzione Vercel `api/contact.js` e l'API di Resend.

## Variabili richieste

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Idealtech <info@idealtech.it>
CONTACT_TO_EMAIL=info@idealtech.it
```

Non usare il prefisso `VITE_`: queste variabili devono rimanere esclusivamente lato server.

## 1. Creare l'account Resend

1. Accedere a Resend.
2. Confermare l'indirizzo email dell'account.
3. Aprire la sezione **Domains**.

## 2. Aggiungere il sottodominio di invio

Aggiungere:

```text
mail.idealtech.it
```

È preferibile usare un sottodominio separato, così la posta Microsoft 365 del dominio principale continua a funzionare senza modificare gli attuali record MX di `idealtech.it`.

## 3. Inserire i record DNS

Resend mostrerà i record DNS specifici da aggiungere. Copiarli esattamente nel pannello del provider che gestisce il DNS di `idealtech.it`.

Normalmente saranno presenti record DKIM e SPF, tra cui record TXT e un record MX riferiti al sottodominio usato da Resend.

Importante:

- non eliminare i record Microsoft 365 già esistenti;
- non sostituire l'MX principale di `idealtech.it`;
- aggiungere solo i record generati da Resend per `mail.idealtech.it`;
- attendere che Resend mostri lo stato **Verified**.

## 4. Creare la chiave API

1. Aprire **API Keys** in Resend.
2. Creare una chiave chiamata, ad esempio, `Idealtech sito produzione`.
3. Scegliere il permesso di solo invio, se disponibile.
4. Limitare la chiave al dominio `mail.idealtech.it`, se l'opzione è disponibile.
5. Copiare subito la chiave: viene mostrata una sola volta.

## 5. Configurare Vercel

Nel progetto Idealtech aprire:

**Settings → Environment Variables**

Aggiungere queste tre variabili:

```text
RESEND_API_KEY
```

Valore: la chiave che inizia con `re_`.

```text
RESEND_FROM_EMAIL
```

Valore:

```text
Sito Idealtech <contatti@mail.idealtech.it>
```

```text
CONTACT_TO_EMAIL
```

Valore:

```text
info@idealtech.it
```

Applicarle almeno a **Production**. È consigliato applicarle anche a **Preview** e **Development**.

## 6. Pubblicare nuovamente il sito

Dopo aver salvato le variabili:

1. aprire **Deployments** su Vercel;
2. selezionare l'ultimo deployment;
3. scegliere **Redeploy**;
4. non riutilizzare la cache di build se si sospetta che il vecchio codice sia rimasto in cache.

## 7. Fare il test

1. Aprire la pagina pubblica **Contatti**.
2. Compilare nome, email, messaggio e privacy.
3. Inviare il modulo.
4. Controllare la casella `info@idealtech.it`.
5. Aprire la sezione **Emails** di Resend per verificare lo stato `Delivered` o leggere eventuali errori.
6. Provare a rispondere al messaggio ricevuto: grazie al campo `reply_to`, la risposta sarà indirizzata direttamente al visitatore.

## Errori più comuni

### `Servizio email non configurato`
Manca `RESEND_API_KEY` su Vercel oppure il sito non è stato ridistribuito dopo averla aggiunta.

### Errore di dominio o mittente
Il valore di `RESEND_FROM_EMAIL` non appartiene al dominio verificato oppure `mail.idealtech.it` non è ancora nello stato `Verified`.

### La mail risulta inviata ma non arriva
Controllare **Emails** in Resend, la cartella posta indesiderata e le regole della casella Microsoft 365 `info@idealtech.it`.

### La chiave è stata pubblicata per errore
Eliminarla subito da Resend, crearne una nuova e aggiornare la variabile su Vercel. La chiave non deve mai essere inserita nei file React o in variabili che iniziano con `VITE_`.
