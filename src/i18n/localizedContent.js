import { TRANSLATIONS } from './translations'
import { translateContentText } from './contentTranslations'

export const CMS_LANGUAGES = ['it', 'en', 'tr']

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

const NORMALIZED_TRANSLATIONS = Object.fromEntries(
  Object.entries(TRANSLATIONS).map(([language, dictionary]) => [
    language,
    new Map(Object.entries(dictionary).map(([source, translated]) => [normalizeText(source), translated])),
  ])
)

export function isLocalizedValue(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.__i18n === true)
}

export function translateKnownText(value, language) {
  if (language === 'it' || typeof value !== 'string' || !value.trim()) return value
  const direct = TRANSLATIONS[language]?.[value]
  if (direct) return direct
  const known = NORMALIZED_TRANSLATIONS[language]?.get(normalizeText(value))
  if (known) return known
  return translateContentText(value, language) || value
}

export function readLocalizedText(value, language = 'it') {
  if (isLocalizedValue(value)) {
    const selected = value[language]
    if (typeof selected === 'string' && selected.trim()) return selected
    const italian = typeof value.it === 'string' ? value.it : ''
    return language === 'it' ? italian : translateKnownText(italian, language)
  }

  if (typeof value !== 'string') return value ?? ''
  return translateKnownText(value, language)
}

export function writeLocalizedText(value, language, nextText) {
  const base = isLocalizedValue(value)
    ? { ...value }
    : {
        __i18n: true,
        it: typeof value === 'string' ? value : '',
        en: '',
        tr: '',
      }

  base.__i18n = true
  base[language] = nextText
  return base
}

export function hasExplicitTranslation(value, language) {
  if (language === 'it') return true
  return isLocalizedValue(value) && typeof value[language] === 'string' && Boolean(value[language].trim())
}

export function resolveLocalizedContent(value, language = 'it') {
  if (isLocalizedValue(value)) return readLocalizedText(value, language)
  if (Array.isArray(value)) return value.map((item) => resolveLocalizedContent(item, language))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveLocalizedContent(child, language)])
    )
  }
  if (typeof value === 'string') return translateKnownText(value, language)
  return value
}
