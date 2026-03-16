import { supabase } from './supabase'
import { getStoragePublicUrl } from './storagePublicUrl'

const NEWS_BUCKET = 'news'

function sanitizeFileName(name = 'image') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function uploadNewsImage(file, userId = 'anonymous') {
  if (!file) {
    throw new Error('Nessun file selezionato.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, ''))
  const fileName = `${userId}/${Date.now()}-${safeName}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(NEWS_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (uploadError) {
    throw uploadError
  }

  return getStoragePublicUrl(NEWS_BUCKET, fileName)
}