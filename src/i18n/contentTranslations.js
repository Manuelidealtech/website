import { TRANSLATIONS } from './translations'

const EXACT_DYNAMIC_TRANSLATIONS = {
  en: {
    'Test nuova news': 'New news test',
    'Test nuova nota': 'New note test',
    'Test nuova nota per mantenimento dei file nel database': 'Test note for maintaining files in the database',
    'News 1': 'News 1',
    'News 2': 'News 2',
    'Test card bozza': 'Draft card test',
    'Estratto test fiera 1': 'Trade fair test excerpt 1',
    'Test descrizione macchinario': 'Machine description test',
    'Macchinari': 'Machinery',
    'Macchinario': 'Machine',
    'Machinery': 'Machinery',
    'Machine': 'Machine',
    'Usato': 'Used',
    'Used': 'Used',
    'Nuovo': 'New',
    'New': 'New',
    'Come nuovo': 'Like new',
    'Like new': 'Like new',
    'Revisionato': 'Reconditioned',
    'Reconditioned': 'Reconditioned',
    'Disponibile': 'Available',
    'Available': 'Available',
    'Riservato': 'Reserved',
    'Reserved': 'Reserved',
    'Venduto': 'Sold',
    'Sold': 'Sold',
  },
  tr: {
    'Test nuova news': 'Yeni haber testi',
    'Test nuova nota': 'Yeni not testi',
    'Test nuova nota per mantenimento dei file nel database': 'Veritabanındaki dosyaların bakımı için test notu',
    'News 1': 'Haber 1',
    'News 2': 'Haber 2',
    'Test card bozza': 'Taslak kart testi',
    'Estratto test fiera 1': 'Fuar testi özeti 1',
    'Test descrizione macchinario': 'Makine açıklama testi',
    'Macchinari': 'Makineler',
    'Macchinario': 'Makine',
    'Machinery': 'Makineler',
    'Machine': 'Makine',
    'Usato': 'İkinci el',
    'Used': 'İkinci el',
    'Nuovo': 'Yeni',
    'New': 'Yeni',
    'Come nuovo': 'Yeni gibi',
    'Like new': 'Yeni gibi',
    'Revisionato': 'Revize edilmiş',
    'Reconditioned': 'Revize edilmiş',
    'Disponibile': 'Mevcut',
    'Available': 'Mevcut',
    'Riservato': 'Rezerve edildi',
    'Reserved': 'Rezerve edildi',
    'Venduto': 'Satıldı',
    'Sold': 'Satıldı',
  },
}

const PHRASE_TRANSLATIONS = {
  en: {
    'per mantenimento dei file nel database': 'for maintaining files in the database',
    'mantenimento dei file nel database': 'maintaining files in the database',
    'nel database': 'in the database',
    'dei file': 'of the files',
    'test nuova nota': 'new note test',
    'nuova nota': 'new note',
    'nuova news': 'new news',
    'descrizione macchinario': 'machine description',
    'macchinario usato': 'used machine',
    'macchinari usati': 'used machines',
    'fiera': 'trade fair',
    'bozza': 'draft',
    'estratto': 'excerpt',
  },
  tr: {
    'per mantenimento dei file nel database': 'veritabanındaki dosyaların bakımı için',
    'mantenimento dei file nel database': 'veritabanındaki dosyaların bakımı',
    'nel database': 'veritabanında',
    'dei file': 'dosyaların',
    'test nuova nota': 'yeni not testi',
    'nuova nota': 'yeni not',
    'nuova news': 'yeni haber',
    'descrizione macchinario': 'makine açıklaması',
    'macchinario usato': 'ikinci el makine',
    'macchinari usati': 'ikinci el makineler',
    'fiera': 'fuar',
    'bozza': 'taslak',
    'estratto': 'özet',
  },
}

const WORD_TRANSLATIONS = {
  en: {
    test: 'test',
    nuova: 'new',
    nuovo: 'new',
    news: 'news',
    nota: 'note',
    note: 'notes',
    per: 'for',
    mantenimento: 'maintenance',
    manutenzione: 'maintenance',
    dei: 'of the',
    del: 'of the',
    della: 'of the',
    delle: 'of the',
    di: 'of',
    file: 'files',
    nel: 'in the',
    database: 'database',
    descrizione: 'description',
    macchinario: 'machine',
    macchinari: 'machines',
    macchina: 'machine',
    macchine: 'machines',
    fiera: 'trade fair',
    fiere: 'trade fairs',
    estratto: 'excerpt',
    bozza: 'draft',
    card: 'card',
    usato: 'used',
    usati: 'used',
    nuovo: 'new',
    nuova: 'new',
    disponibile: 'available',
    venduto: 'sold',
    riservato: 'reserved',
    revisionato: 'reconditioned',
  },
  tr: {
    test: 'test',
    nuova: 'yeni',
    nuovo: 'yeni',
    news: 'haber',
    nota: 'not',
    note: 'notlar',
    per: 'için',
    mantenimento: 'bakım',
    manutenzione: 'bakım',
    dei: '',
    del: '',
    della: '',
    delle: '',
    di: '',
    file: 'dosyalar',
    nel: '',
    database: 'veritabanı',
    descrizione: 'açıklama',
    macchinario: 'makine',
    macchinari: 'makineler',
    macchina: 'makine',
    macchine: 'makineler',
    fiera: 'fuar',
    fiere: 'fuarlar',
    estratto: 'özet',
    bozza: 'taslak',
    card: 'kart',
    usato: 'ikinci el',
    usati: 'ikinci el',
    disponibile: 'mevcut',
    venduto: 'satıldı',
    riservato: 'rezerve edildi',
    revisionato: 'revize edilmiş',
  },
}

const LANGUAGE_SUFFIXES = {
  en: ['_en', '_gb', '_uk', '_english', 'En', 'EN'],
  tr: ['_tr', '_turkish', 'Tr', 'TR'],
}

const JSON_TRANSLATION_FIELDS = ['translations', 'translation', 'i18n', 'localized', 'locales']

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function getFieldValue(item, fieldName) {
  const value = item?.[fieldName]
  return value === null || value === undefined ? '' : String(value)
}

function safeParseJson(value) {
  if (!value) return null
  if (typeof value === 'object') return value

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function getJsonLocalizedValue(item, fieldName, language) {
  for (const key of JSON_TRANSLATION_FIELDS) {
    const block = safeParseJson(item?.[key])
    if (!block) continue

    const byLanguage = block?.[language]?.[fieldName]
    if (typeof byLanguage === 'string' && byLanguage.trim()) return byLanguage

    const byField = block?.[fieldName]?.[language]
    if (typeof byField === 'string' && byField.trim()) return byField

    const nested = block?.[fieldName]
    if (nested && typeof nested === 'object' && typeof nested?.[language] === 'string' && nested[language].trim()) {
      return nested[language]
    }
  }

  return ''
}

function matchCase(source, translated) {
  if (!source || !translated) return translated
  if (source === source.toUpperCase()) return translated.toUpperCase()
  if (source[0] === source[0].toUpperCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1)
  }
  return translated
}

function replacePhrases(value, language) {
  let output = String(value)
  const phrases = PHRASE_TRANSLATIONS[language] || {}
  const entries = Object.entries(phrases).sort((a, b) => b[0].length - a[0].length)

  entries.forEach(([source, translated]) => {
    const escaped = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'gi')
    output = output.replace(regex, (match) => matchCase(match, translated))
  })

  return output
}

function replaceKnownWords(value, language) {
  const words = WORD_TRANSLATIONS[language] || {}

  return String(value)
    .replace(/\b[\p{L}'’]+\b/gu, (word) => {
      const key = word.toLowerCase()
      if (!Object.prototype.hasOwnProperty.call(words, key)) return word
      return matchCase(word, words[key])
    })
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim()
}

function translateLine(value, language) {
  const source = normalizeText(value)
  if (!source) return value

  const exact =
    EXACT_DYNAMIC_TRANSLATIONS[language]?.[source] ||
    TRANSLATIONS[language]?.[source]

  if (exact) return exact

  const phraseTranslated = replacePhrases(source, language)
  const wordTranslated = replaceKnownWords(phraseTranslated, language)

  return wordTranslated || value
}

export function translateContentText(value, language) {
  if (!value || language === 'it') return value || ''

  const sourceValue = String(value)
  const source = normalizeText(sourceValue)
  if (!source) return value

  return sourceValue
    .split('\n')
    .map((line) => translateLine(line, language))
    .join('\n')
}

export function getLocalizedField(item, fieldName, language) {
  if (!item) return ''

  if (language && language !== 'it') {
    const jsonLocalizedValue = getJsonLocalizedValue(item, fieldName, language)
    if (jsonLocalizedValue.trim()) return jsonLocalizedValue

    const suffixes = LANGUAGE_SUFFIXES[language] || [`_${language}`]

    for (const suffix of suffixes) {
      const localizedValue = getFieldValue(item, `${fieldName}${suffix}`)
      if (localizedValue.trim()) return localizedValue
    }
  }

  return translateContentText(getFieldValue(item, fieldName), language)
}

export function getLocalizedNewsPreview(item, language, maxLength = 140) {
  const text =
    getLocalizedField(item, 'excerpt', language) ||
    getLocalizedField(item, 'summary', language) ||
    getLocalizedField(item, 'content', language) ||
    ''

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

export function getMachineStatusLabel(status, language) {
  const source =
    status === 'available'
      ? 'Disponibile'
      : status === 'reserved'
      ? 'Riservato'
      : 'Venduto'

  return translateContentText(source, language)
}
