import { supabase } from './supabase'

export function sanitizeFileName(fileName = '') {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

export async function uploadMachineImage({ file, userId, machineId }) {
  const safeName = sanitizeFileName(file.name)
  const fileExt = safeName.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${userId}/${machineId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('machines')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data } = supabase.storage.from('machines').getPublicUrl(filePath)

  return {
    imagePath: filePath,
    imageUrl: data.publicUrl,
  }
}