import { supabase } from './supabase'

const BUCKET = 'social-assets'

function sanitizeFilename(name = 'asset') {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function uploadSocialAsset(file, userId = 'admin', folder = 'assets') {
  if (!file) throw new Error('Nessun file selezionato.')

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const baseName = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''))
  const objectPath = `${userId}/${folder}/${Date.now()}-${baseName}.${extension}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}
