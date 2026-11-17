import { isLocalizedValue, readLocalizedText, translateKnownText } from './localizedContent'

const PRODUCT_MENU_BY_ROUTE = {
  '/prodotti/drum-line': {
    en: 'Drum Melters',
    tr: 'Varil Eritme Sistemleri',
  },
  '/prodotti/extruder-line': {
    en: 'Extruders',
    tr: 'Ekstrüderler',
  },
  '/prodotti/assy-line': {
    en: 'Hot-Melt Adhesive Melters',
    tr: 'Hot-Melt Yapıştırıcı Eritme Üniteleri',
  },
  '/prodotti/coating-heads': {
    en: 'Coating Heads',
    tr: 'Kaplama Kafaları',
  },
  '/prodotti/gun-line': {
    en: 'Automatic Applicators',
    tr: 'Otomatik Aplikatörler',
  },
  '/prodotti/hand-gun': {
    en: 'Manual Applicators',
    tr: 'Manuel Aplikatörler',
  },
  '/prodotti/hose-line': {
    en: 'Electrically Heated Hoses',
    tr: 'Elektrikli Isıtmalı Hortumlar',
  },
  '/prodotti/cold-line': {
    en: 'Cold Glue Applicators',
    tr: 'Soğuk Tutkal Aplikatörleri',
  },
  '/prodotti/custom-machines': {
    en: 'Custom Machines',
    tr: 'Özel Makineler',
  },
  '/prodotti/spare-parts': {
    en: 'Compatible Spare Parts',
    tr: 'Uyumlu Yedek Parçalar',
  },
  '/prodotti/ideal-melt': {
    en: 'IdealMelt Melters',
    tr: 'IdealMelt Eritme Üniteleri',
  },
}

const PRODUCT_MENU_BY_ID = {
  'idm-gp': {
    en: 'IDM-GP Melters',
    tr: 'IDM-GP Eritme Üniteleri',
  },
  'idm-gp-evo': {
    en: 'IDM-GP EVO Melters',
    tr: 'IDM-GP EVO Eritme Üniteleri',
  },
  'idm-gp-plug': {
    en: 'IDM-GP Melters',
    tr: 'IDM-GP Eritme Üniteleri',
  },
  'pump-station': {
    en: 'Pump Station',
    tr: 'Pompa İstasyonu',
  },
}

function normalizeRoute(value = '') {
  const route = String(value || '').trim().split('?')[0].split('#')[0]
  if (!route) return ''
  return route.endsWith('/') && route !== '/' ? route.slice(0, -1) : route
}

function hasUsableManualTranslation(value, language) {
  if (!isLocalizedValue(value) || language === 'it') return false
  const translated = typeof value[language] === 'string' ? value[language].trim() : ''
  const italian = typeof value.it === 'string' ? value.it.trim() : ''
  if (!translated) return false
  if (translated.localeCompare(italian, undefined, { sensitivity: 'base' }) === 0) return false
  return translateKnownText(translated, language) === translated
}

/**
 * Risolve il nome del sottomenu usando una chiave stabile (id/URL), non il testo.
 * Una traduzione manuale compilata nel CMS ha sempre priorità.
 */
export function resolveProductMenuLabel(item, language = 'it') {
  const labelValue = item?.label
  if (language === 'it') return readLocalizedText(labelValue, 'it')

  if (hasUsableManualTranslation(labelValue, language)) {
    return readLocalizedText(labelValue, language)
  }

  const byId = PRODUCT_MENU_BY_ID[item?.id]?.[language]
  if (byId) return byId

  const byRoute = PRODUCT_MENU_BY_ROUTE[normalizeRoute(item?.to)]?.[language]
  if (byRoute) return byRoute

  const italian = readLocalizedText(labelValue, 'it')
  return translateKnownText(italian, language)
}
