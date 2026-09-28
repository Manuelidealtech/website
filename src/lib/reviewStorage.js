import { supabase } from './supabase'
import { compressShopImage } from './shopImages'
import { getStoragePublicUrl } from './storagePublicUrl'

const REVIEW_BUCKET = 'review-assets'

function sanitizeFileName(name = 'recensione') {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .toLowerCase() || 'recensione'
}

export async function uploadReviewImage(file, userId = 'staff') {
  if (!file) throw new Error('Nessuna immagine selezionata.')

  const compressed = await compressShopImage(file, {
    maxDimension: 900,
    initialQuality: 0.82,
    targetBytes: 350 * 1024,
  })

  const safeName = sanitizeFileName(compressed.name)
  const path = `${userId}/${Date.now()}-${safeName}.webp`

  const { error } = await supabase.storage
    .from(REVIEW_BUCKET)
    .upload(path, compressed, {
      cacheControl: '31536000',
      upsert: false,
      contentType: 'image/webp',
    })

  if (error) throw error

  return {
    path,
    url: getStoragePublicUrl(REVIEW_BUCKET, path),
  }
}

export async function deleteReviewImage(path) {
  if (!path) return
  const { error } = await supabase.storage.from(REVIEW_BUCKET).remove([path])
  if (error) throw error
}
