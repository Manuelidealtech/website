import { supabase } from './supabase'

function sanitizeFilename(name) {
  return String(name || 'foto')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function uploadContactPhoto(file, userId) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const baseName = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ''))
  const path = `${userId}/${Date.now()}-${baseName}.${extension}`

  const { error } = await supabase.storage
    .from('contact-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('contact-photos').getPublicUrl(path)
  return data.publicUrl
}
