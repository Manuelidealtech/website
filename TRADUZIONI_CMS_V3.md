# Sistema traduzioni CMS v3

Questa versione elimina la dipendenza dal testo italiano come identificatore delle voci prodotto.

## Regole

- Le traduzioni manuali IT / EN / TR inserite nel Website Editor hanno priorità.
- I dati legacy in cui EN o TR contengono per errore lo stesso testo italiano vengono autoriparati in lettura.
- Il sottomenu Prodotti usa ID/URL della pagina come chiave stabile per i prodotti esistenti.
- Descrizioni, paragrafi, caratteristiche ed elenchi delle pagine prodotto vengono risolti ricorsivamente.
- Se viene modificato un testo italiano, eventuali vecchie traduzioni automatiche/copiate vengono invalidate; le traduzioni manuali autentiche restano salvate.
- Per contenuti completamente nuovi non presenti nel dizionario, compilare EN/TR nel Website Editor. Non vengono generate traduzioni parola-per-parola.

Non sono necessarie modifiche SQL a Supabase.
