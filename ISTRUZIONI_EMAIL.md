# Invio email dei moduli del sito con Resend

I moduli **Contatti** e **Servizi** inviano una richiesta `POST` alla funzione Vercel:

```text
/api/contact
```

L'invio è gestito tramite l'API di **Resend**. La configurazione completa, inclusi dominio, DNS e variabili Vercel, è descritta in:

```text
CONFIGURAZIONE_RESEND.md
```

Variabili server richieste:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Sito Idealtech <contatti@mail.idealtech.it>
CONTACT_TO_EMAIL=info@idealtech.it
```

Non usare il prefisso `VITE_` e non inserire la chiave API nei file React.
