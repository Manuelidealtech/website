import { supabase } from './supabase'

export function getStoragePublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || ''
}

export function getMachineImageUrl(path) {
  return getStoragePublicUrl('machines', path)
}

export function getNewsImageUrl(path) {
  return getStoragePublicUrl('news', path)
}