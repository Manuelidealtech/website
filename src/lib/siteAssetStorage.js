import { supabase } from './supabase'
import { sanitizeFileName } from './storage'
import { compressShopImage } from './shopImages'

export async function uploadSiteAsset({ file, userId = 'admin', section = 'site' }) {
  const compressedFile = await compressShopImage(file, {
    maxDimension: 2000,
    initialQuality: 0.82,
    targetBytes: 750 * 1024,
  })
  const safeName = sanitizeFileName(compressedFile.name)
  const objectPath = `${userId}/${section}/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`

  const { error } = await supabase.storage.from('site-assets').upload(objectPath, compressedFile, {
    cacheControl: '31536000',
    contentType: 'image/webp',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('site-assets').getPublicUrl(objectPath)
  return { url: data.publicUrl, path: objectPath, size: compressedFile.size }
}
