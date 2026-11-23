# Idealtech — Traduzioni corrette dei macchinari usati (IT / EN / TR)

## Perché succedeva

La pagina pubblica `/macchinario/:slug` e la griglia dello Store usavano `getLocalizedField()`, una funzione legacy che cercava di tradurre *parole isolate*, non frasi complete. Il risultato era “Impianto reconditioned, ideale per la fusione of adesivi ...”. L'integrazione DeepL del Website Editor non toccava la tabella separata `public.machines`.

## Attivazione (in ordine)

1. Fai il deploy dello ZIP aggiornato su Vercel (non contiene credenziali).
2. Su Supabase del sito Idealtech apri SQL Editor ed esegui **una sola volta** `SUPABASE_TRADUZIONI_MACCHINARI_USATI.sql`. Lo script aggiunge `machines.translations jsonb`, senza modificare i macchinari esistenti.
3. Controlla che la variabile server `DEEPL_API_KEY` sia impostata su Vercel Production e che la chiave Supabase privilegiata per `/api/cms-translate` sia già configurata.
4. Apri il sito come admin → **Macchinari** → premi **Rigenera EN/TR di tutti i macchinari con DeepL**. Conferma l'operazione. Il comando esegue traduzione completa di titolo, categoria, condizione e descrizione di ogni scheda, salvando su Supabase dopo ciascuna scheda. Se si interrompe, puoi ripetere l'operazione.
5. Apri lo stesso macchinario dello screenshot su `/macchinario/...`, cambia la lingua a EN e TR e verifica la frase completa, non soltanto le etichette. Ricontrolla anche la griglia dello Store.

## Per le prossime schede

Nella schermata Admin → Macchinari → **Modifica** (o **Nuovo macchinario**) trovi un riquadro **Traduzioni della scheda** con schede EN/TR e un pulsante DeepL. Puoi correggere manualmente ogni testo. Se pubblichi una scheda con traduzioni mancanti, il sistema le genera prima del salvataggio; se DeepL non è disponibile, non pubblica testi non tradotti. Puoi comunque tenere la scheda in bozza.

**Comportamento di sicurezza:** se un vecchio macchinario non ha ancora EN/TR, il sito visualizza *il testo italiano integro*, senza mescolare parole tradotte. Dopo il comando in blocco, usa il testo completo salvato. Il sito non chiama DeepL a ogni visita.

I dati tecnici e commerciali, le immagini, gli URL e i riferimenti storici non vengono modificati. Il pulsante in blocco **sovrascrive le precedenti traduzioni EN/TR delle schede Usato**: controlla le descrizioni tecniche dopo l'operazione. DeepL consuma caratteri del piano API.

## Test e limiti

È stato verificato staticamente il codice React e il resolver con testi di esempio. Il test di traduzione reale con DeepL e la modifica di dati di produzione devono essere eseguiti sull'ambiente Idealtech, dopo la configurazione SQL; non sono stati eseguiti dal pacchetto locale.
