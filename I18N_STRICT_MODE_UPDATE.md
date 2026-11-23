# Idealtech – Strict i18n

Questa versione elimina i fallback parziali che potevano lasciare testo italiano nelle pagine EN/TR.

## Cosa cambia
- Il Website Editor controlla tutti i contenuti CMS prima della pubblicazione.
- Se manca una traduzione EN o TR per un testo realmente traducibile, Pubblica viene bloccato e mostra i primi elementi da completare.
- Brand, URL, immagini, slug, codici tecnici, indirizzi e termini internazionali non vengono considerati errori.
- Le traduzioni note coprono anche i contenuti legacy delle pagine prodotto, incluso Manual Applicators.
- AutoTranslate usa ora anche il dizionario CMS/legacy, quindi le stringhe hardcoded pubbliche possono usare lo stesso resolver.
- Lo Shop richiede nome/descrizione/categoria EN e TR prima di pubblicare un prodotto (quando i corrispondenti campi IT sono valorizzati).

## Nessun SQL richiesto
Non sono state aggiunte tabelle o colonne.
