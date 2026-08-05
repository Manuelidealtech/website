let settingsCache = null
let settingsPromise = null

export function getSeoCache() {
  return settingsCache
}

export function setSeoCache(value) {
  settingsCache = value
  settingsPromise = null
  window.dispatchEvent(new CustomEvent('idealtech:seo-updated'))
}

export function getSeoPromise() {
  return settingsPromise
}

export function setSeoPromise(value) {
  settingsPromise = value
}
