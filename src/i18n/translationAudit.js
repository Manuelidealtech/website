import { isLocalizedValue, readLocalizedText, translateKnownText } from './localizedContent.js'

export const TARGET_CMS_LANGUAGES = ['en', 'tr']

// These keys are technical identifiers or URLs, not text intended for visitors.
const SKIP_KEYS = new Set([
  'id', 'to', 'slug', 'url', 'href', 'image', 'images', 'galleryImages',
  'visible', 'enabled', 'shop', 'hasDropdown', 'external', 'code', 'sku',
  'email', 'phone', 'telephone', 'mapUrl', 'icon', 'type', 'latitude',
  'longitude', 'className', 'source', 'target', 'sort_order',
])

function normalize(value = '') {
  return String(value).normalize('NFKC').replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ').trim().toLocaleLowerCase('it-IT')
}

function looksNonTextual(value = '') {
  const text = String(value).trim()
  if (!text) return true
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(text)) return true
  if (/\.(webp|png|jpe?g|svg|gif|pdf)(\?.*)?$/i.test(text)) return true
  if (/^[\d\s+().,;:/%°\-–—]+$/.test(text)) return true
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true
  if (/^[A-Z0-9]{1,8}(?:-[A-Z0-9]{1,8}){0,3}$/.test(text)) return true
  if (/^(Idealtech|IdealTech|Idealtech S\.r\.l\.|IDM-GP EVO|IDM-GP|Drum Line|Extruder Line|Assy Line|Gun Line|Hose Line|Cold Line|Ideal Melt|IdealMelt)$/i.test(text)) return true
  return false
}

export function shouldTranslateCmsText(value, property = '') {
  const text = isLocalizedValue(value) ? value.it : value
  if (typeof text !== 'string' || looksNonTextual(text)) return false
  if (SKIP_KEYS.has(String(property))) return false
  return true
}

function hasTranslation(value, language) {
  const italian = isLocalizedValue(value) ? String(value.it || '').trim() : String(value || '').trim()
  if (!italian) return true
  const resolved = readLocalizedText(value, language)
  if (!resolved || !String(resolved).trim()) return false
  if (normalize(resolved) !== normalize(italian)) return true
  // Natural international UI terms are already correct in English.
  if (language === 'en' && /^(Home|News|Shop|Packaging|Gluing Technology|Custom Machines|Coating Heads|Spare Parts)$/i.test(italian)) return true
  // DeepL may legitimately return proper names/technical terms unchanged.
  if (isLocalizedValue(value) && value.__verified?.[language] === italian) return true
  // For legacy strings, a complete known dictionary entry is acceptable.
  const known = translateKnownText(italian, language)
  return Boolean(known && normalize(known) !== normalize(italian))
}

function traverse(value, fieldKey, path, property, callback) {
  if (isLocalizedValue(value) || typeof value === 'string') {
    if (!shouldTranslateCmsText(value, property)) return
    callback(value, fieldKey, path)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => traverse(item, fieldKey, [...path, index], property, callback))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      if (!SKIP_KEYS.has(key)) traverse(child, fieldKey, [...path, key], key, callback)
    })
  }
}

/**
 * The same traversal drives the admin report AND the automatic translation.
 * This prevents the old bug: "0 missing" while published CMS paragraphs were still Italian.
 */
export function collectCmsTranslationJobs(values = {}, fields = [], { force = false } = {}) {
  const keys = fields.length ? fields.map((field) => field.key) : Object.keys(values)
  const jobs = []
  for (const fieldKey of keys) {
    traverse(values[fieldKey], fieldKey, [], fieldKey, (value, key, path) => {
      const italian = isLocalizedValue(value) ? String(value.it || '') : String(value || '')
      if (!italian.trim()) return
      for (const language of TARGET_CMS_LANGUAGES) {
        if (force || !hasTranslation(value, language)) {
          jobs.push({ fieldKey: key, path, language, italian })
        }
      }
    })
  }
  return jobs
}

export function findMissingCmsTranslations(values = {}, fields = []) {
  return collectCmsTranslationJobs(values, fields).map((job) => ({
    ...job,
    path: `${job.fieldKey}${job.path.map((part) => typeof part === 'number' ? `[${part}]` : `.${part}`).join('')}`,
    text: job.italian,
  }))
}

/** Apply only after ALL remote batches succeeded; never lose a half-complete edit. */
export function applyCmsTranslationJobs(values, jobs, translatedByLanguage) {
  const updated = structuredClone(values)
  for (const job of jobs) {
    const translated = translatedByLanguage[job.language]?.[job.italian]
    if (typeof translated !== 'string' || !translated.trim()) {
      throw new Error(`Traduzione ${job.language.toUpperCase()} assente per: ${job.italian.slice(0, 70)}`)
    }
    let container = updated
    let key = job.fieldKey
    for (const part of job.path) {
      container = container[key]
      key = part
    }
    const existing = container[key]
    const previous = isLocalizedValue(existing)
      ? existing
      : { __i18n: true, it: String(existing || ''), en: '', tr: '' }
    container[key] = { ...previous, __i18n: true, [job.language]: translated, __verified: { ...(previous.__verified || {}), [job.language]: job.italian } }
  }
  return updated
}
