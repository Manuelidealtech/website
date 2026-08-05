# Aggiornamento area amministrazione

## Interfaccia mobile

- Il menu laterale desktop diventa una barra mobile compatta con pulsante menu.
- La navigazione non forza più la larghezza della pagina e non genera scorrimento orizzontale.
- Titoli, azioni, schede riepilogo, moduli, elenco macchinari, contatti e utenti admin si adattano agli schermi piccoli.
- Pulsanti e campi diventano a larghezza piena quando serve.

## Caricamento file

È stato introdotto un componente grafico riutilizzabile per il caricamento delle immagini:

- pulsante coerente con lo stile Idealtech;
- nome del file selezionato;
- conteggio quando vengono selezionate più immagini;
- visualizzazione mobile verticale;
- reset automatico dopo salvataggio o annullamento.

Il nuovo componente viene usato in:

- creazione e modifica news;
- creazione e modifica macchinari.

## Modulo contatti

Il modulo pubblico è collegato a `/api/contact` e il destinatario predefinito nel codice è:

```txt
info@idealtech.it
```

L'invio avviene solamente se su Vercel sono presenti le variabili SMTP descritte in `ISTRUZIONI_EMAIL.md`.
