function parseImages(value) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function normalizeProductImages(product) {
  const seen = new Set()
  const result = []

  const add = (entry) => {
    if (!entry) return
    const url = String(entry.url || entry.image_url || '').trim()
    const path = String(entry.path || entry.image_path || '').trim()
    if (!url) return
    const key = path || url
    if (seen.has(key)) return
    seen.add(key)
    result.push({ url, path: path || null })
  }

  parseImages(product?.images).forEach(add)

  if (product?.image_url) {
    add({ url: product.image_url, path: product.image_path })
  }

  return result
}

export function getPrimaryProductImage(product) {
  return normalizeProductImages(product)[0] || null
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Impossibile leggere l’immagine selezionata.'))
    }
    image.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Impossibile comprimere l’immagine.'))
    }, type, quality)
  })
}

export async function compressShopImage(file, {
  maxDimension = 1600,
  initialQuality = 0.8,
  targetBytes = 600 * 1024,
} = {}) {
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    throw new Error('Seleziona un file immagine valido.')
  }

  const image = await loadImageElement(file)
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height

  if (!width || !height) throw new Error('Dimensioni immagine non valide.')

  const scale = Math.min(1, maxDimension / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d', { alpha: true })
  if (!context) throw new Error('Compressione immagine non supportata dal browser.')

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, targetWidth, targetHeight)

  let quality = initialQuality
  let blob = await canvasToBlob(canvas, 'image/webp', quality)

  while (blob.size > targetBytes && quality > 0.52) {
    quality = Math.max(0.52, quality - 0.08)
    blob = await canvasToBlob(canvas, 'image/webp', quality)
  }

  const cleanBase = String(file.name || 'immagine')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'immagine'

  return new File([blob], `${cleanBase}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}
