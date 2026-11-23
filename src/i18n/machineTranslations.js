import { supabase } from '../lib/supabase'

// Usato is stored in public.machines, NOT in the Website Editor's site_content.
// Never translate individual words on the public site: incomplete translations
// must fall back to a complete original sentence until the record is translated.
export const MACHINE_TRANSLATABLE_FIELDS = ['title', 'category', 'condition', 'description']
export const MACHINE_TRANSLATION_LANGUAGES = ['en', 'tr']

const MACHINE_UI = {
  it: {
    storeTitle: 'Store macchinari usati', storeIntro: 'Consulta i macchinari attualmente pubblicati.',
    loading: 'Caricamento...', emptyTitle: 'Nessun macchinario pubblicato', emptyText: 'Al momento lo store è vuoto.',
    missing: 'Nessuna immagine', detailTitle: 'Dettaglio macchinario', problem: 'Si è verificato un problema.',
    brand: 'Marca', model: 'Modello', category: 'Categoria', condition: 'Condizione', year: 'Anno',
    description: 'Descrizione', noDescription: 'Nessuna descrizione disponibile.',
    request: 'Richiedi informazioni', vatExcluded: 'IVA esclusa', used: 'usato',
  },
  en: {
    storeTitle: 'Used machinery', storeIntro: 'Explore our currently available used equipment.',
    loading: 'Loading...', emptyTitle: 'No machinery available', emptyText: 'There are currently no machines listed.',
    missing: 'No image', detailTitle: 'Machine details', problem: 'An error occurred.',
    brand: 'Brand', model: 'Model', category: 'Category', condition: 'Condition', year: 'Year',
    description: 'Description', noDescription: 'No description available.',
    request: 'Request information', vatExcluded: 'Excluding VAT', used: 'used',
  },
  tr: {
    storeTitle: 'İkinci el makineler', storeIntro: 'Şu anda satışta olan ikinci el makinelerimizi inceleyin.',
    loading: 'Yükleniyor...', emptyTitle: 'Yayımlanmış makine yok', emptyText: 'Şu anda listede makine bulunmuyor.',
    missing: 'Görsel yok', detailTitle: 'Makine detayları', problem: 'Bir sorun oluştu.',
    brand: 'Marka', model: 'Model', category: 'Kategori', condition: 'Durum', year: 'Yıl',
    description: 'Açıklama', noDescription: 'Açıklama bulunmuyor.',
    request: 'Bilgi isteyin', vatExcluded: 'KDV hariç', used: 'ikinci el',
  },
}

export function machineUi(key, language) {
  return MACHINE_UI[language]?.[key] || MACHINE_UI.it[key] || key
}

function localizedBlock(machine, language) {
  let translations = machine?.translations || {}
  if (typeof translations === 'string') {
    try { translations = JSON.parse(translations) } catch { translations = {} }
  }
  return translations?.[language] || {}
}

export function getMachineLocalizedField(machine, field, language) {
  if (!machine) return ''
  const original = String(machine[field] ?? '')
  if (!language || language === 'it') return original
  const nested = localizedBlock(machine, language)?.[field]
  if (typeof nested === 'string' && nested.trim()) return nested
  // Deliberate whole-text fallback. Never return a partially translated phrase.
  return original
}

export function getMachineMissingTranslations(machine) {
  const missing = []
  for (const language of MACHINE_TRANSLATION_LANGUAGES) {
    for (const field of MACHINE_TRANSLATABLE_FIELDS) {
      if (!String(machine?.[field] ?? '').trim()) continue
      if (!String(localizedBlock(machine, language)?.[field] ?? '').trim()) {
        missing.push(`${language.toUpperCase()} · ${field}`)
      }
    }
  }
  return missing
}

async function translateBatch(texts, targetLanguage) {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data?.session?.access_token) {
    throw new Error('Sessione scaduta: effettua nuovamente l’accesso come amministratore.')
  }
  const response = await fetch('/api/cms-translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({ texts, targetLanguage }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || `Traduzione DeepL non riuscita (HTTP ${response.status}).`)
  if (!Array.isArray(payload.translations) || payload.translations.length !== texts.length) {
    throw new Error('DeepL ha restituito una risposta incompleta: nessuna modifica salvata.')
  }
  return payload.translations
}

export async function translateMachineWithDeepL(machine, { force = false } = {}) {
  const translated = structuredClone(machine?.translations && typeof machine.translations === 'object' ? machine.translations : {})
  for (const language of MACHINE_TRANSLATION_LANGUAGES) {
    const current = translated[language] && typeof translated[language] === 'object' ? translated[language] : {}
    const fields = MACHINE_TRANSLATABLE_FIELDS.filter((field) => {
      const source = String(machine?.[field] ?? '').trim()
      return source && (force || !String(current[field] ?? '').trim())
    })
    if (!fields.length) { translated[language] = { ...current }; continue }

    const texts = fields.map((field) => String(machine[field]).trim())
    if (texts.some((value) => value.length > 8000) || texts.join('').length > 13000) {
      throw new Error('Uno dei testi del macchinario è troppo lungo per una singola traduzione DeepL.')
    }
    const outputs = await translateBatch(texts, language)
    translated[language] = { ...current }
    fields.forEach((field, index) => { translated[language][field] = outputs[index] })
  }
  return translated
}
