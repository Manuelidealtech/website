# Idealtech – completamento multilingua CMS + Shop

## 1. Aggiornamento richiesto per lo Shop
Sul database già esistente eseguire una sola volta nel SQL Editor di Supabase:

`SUPABASE_SHOP_TRADUZIONI.sql`

Aggiunge la colonna JSONB `translations` a `shop_products` per salvare nome, categoria e descrizione in inglese e turco.

## 2. Website Editor
I contenuti del Website Editor continuano a usare lo stesso `site_content`: non serve alcun nuovo SQL.

Nelle schede IT / EN / TR:
- IT è il contenuto principale;
- EN/TR possono essere personalizzati manualmente;
- se una traduzione nota è già presente nel dizionario del sito viene usata automaticamente;
- se manca una traduzione, viene mostrato l’italiano anziché creare frasi ibride parola-per-parola.

## 3. Shop admin
In `Shop e ordini > Prodotti > Modifica` sono disponibili IT / EN / TR per:
- nome prodotto;
- categoria;
- descrizione.

SKU, prezzo, IVA, immagini, giacenza e pubblicazione sono condivisi tra le lingue.
