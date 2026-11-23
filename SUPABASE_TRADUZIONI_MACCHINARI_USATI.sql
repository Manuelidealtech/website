-- Idealtech: traduzioni persistenti per le schede dei macchinari usati.
-- Aggiunge un campo non distruttivo; non cambia prezzi, immagini o storici.
ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.machines.translations IS
  'Traduzioni EN/TR dei campi title, category, condition e description. Gestite dal portale admin tramite DeepL.';

-- Verifica di sola lettura; eseguire dopo l'ALTER TABLE:
SELECT id, title, translations FROM public.machines ORDER BY created_at DESC LIMIT 5;
