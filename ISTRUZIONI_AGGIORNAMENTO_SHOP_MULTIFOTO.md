# Aggiornamento shop: multi-foto + scheda prodotto

## 1. Aggiornare Supabase
Nel progetto Supabase apri **SQL Editor** ed esegui una volta:

`SUPABASE_SHOP_MULTIFOTO.sql`

Lo script aggiunge il campo `images` ai prodotti esistenti e importa automaticamente l'attuale `image_url/image_path` come prima foto, quindi le immagini già presenti non vengono perse.

## 2. Pubblicare il sito
Pubblica normalmente il progetto su Vercel.

## Cosa cambia
- Più immagini per prodotto nell'admin.
- Prima foto = copertina.
- Riordino, cambio copertina e rimozione foto.
- Compressione automatica nel browser prima dell'upload: WebP, max 1600 px, qualità adattiva e target circa 600 KB.
- Retrocompatibilità con i prodotti che hanno ancora solo `image_url/image_path`.
- Nuova scheda prodotto su `/shop/:productId` in stile e-commerce/Amazon.
- Galleria con miniature e foto principale.
- Descrizione completa senza taglio/ellipsis nella scheda prodotto.
- Layout responsive per smartphone e tablet.

## Nota
Le card nella pagina `/shop` mantengono volutamente la descrizione sintetica per non creare riquadri enormi. Cliccando immagine, titolo o “Vedi dettagli e descrizione completa” si apre la scheda completa del prodotto.
