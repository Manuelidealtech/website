import { isLocalizedValue, readLocalizedText, translateKnownText } from './localizedContent.js'

const LANGUAGES = ['en', 'tr']
const SKIP_KEYS = new Set([
  'id', 'to', 'slug', 'url', 'href', 'image', 'images', 'galleryImages', 'visible', 'shop',
  'hasDropdown', 'external', 'code', 'sku', 'email', 'phone', 'telephone', 'mapUrl', 'icon',
])

function normalize(value = '') {
  return String(value)
    .normalize('NFKC')
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('it-IT')
}

function looksNonTextual(value = '') {
  const text = String(value).trim()
  if (!text) return true
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(text)) return true
  if (/\.(webp|png|jpe?g|svg|gif|pdf)(\?.*)?$/i.test(text)) return true
  if (/^[\d\s+().,;:/%°\-–—]+$/.test(text)) return true
  if (/^[A-Z0-9][A-Z0-9._/+\- ]{1,30}$/.test(text)) return true
  if (/^(Home|Packaging|Paper converting|Case maker|Spare Parts|Pompa)$/i.test(text)) return true
  return false
}

function isBrandLike(path, value) {
  const lastKey = path.split('.').pop()?.replace(/\[\d+\]$/, '')
  if (lastKey === 'name' || lastKey === 'kicker') return true
  if (/^footer\.(company|address)$/.test(path)) return true
  const text = String(value).trim()
  if (/^(Idealtech|IdealTech|IDM(?:-GP)?(?: EVO)?|Drum Line|Extruder Line|Assy Line|Gun Line|Hose Line|Cold Line|Ideal Melt|Coating Heads|Custom Machines|Hand Guns|Shop|News)$/i.test(text)) return true
  return false
}

function translationMissing(value, language) {
  const italian = isLocalizedValue(value)
    ? (typeof value.it === 'string' ? value.it.trim() : '')
    : (typeof value === 'string' ? value.trim() : '')
  if (!italian) return false

  const resolved = readLocalizedText(value, language)
  if (!resolved || !String(resolved).trim()) return true

  if (normalize(resolved) !== normalize(italian)) return false
  const known = translateKnownText(italian, language)
  return !known || normalize(known) === normalize(italian)
}

function walk(value, path, issues) {
  if (isLocalizedValue(value)) {
    const italian = typeof value.it === 'string' ? value.it.trim() : ''
    if (!italian || looksNonTextual(italian) || isBrandLike(path, italian)) return
    for (const language of LANGUAGES) {
      if (translationMissing(value, language)) {
        issues.push({ path, language, text: italian })
      }
    }
    return
  }

  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || looksNonTextual(text) || isBrandLike(path, text)) return
    for (const language of LANGUAGES) {
      if (translationMissing(value, language)) {
        issues.push({ path, language, text })
      }
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(child, `${path}[${index}]`, issues))
    return
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SKIP_KEYS.has(key)) continue
      walk(child, path ? `${path}.${key}` : key, issues)
    }
  }
}

export function findMissingCmsTranslations(values = {}, fields = []) {
  const issues = []
  const keys = fields.length ? fields.map((field) => field.key) : Object.keys(values)
  for (const key of keys) {
    walk(values[key], key, issues)
  }

  const seen = new Set()
  return issues.filter((issue) => {
    const signature = `${issue.language}|${issue.path}|${normalize(issue.text)}`
    if (seen.has(signature)) return false
    seen.add(signature)
    return true
  })
}
