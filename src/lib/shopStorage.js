import { supabase } from './supabase'
import { sanitizeFileName } from './storage'

export async function uploadShopProductImage({ file, userId, productId = 'new' }) {
  const safeName = sanitizeFileName(file.name)
  const extension = safeName.includes('.') ? safeName.split('.').pop() : 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  const filePath = `${userId}/${productId}/${fileName}`

  const { error } = await supabase.storage.from('shop-products').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('shop-products').getPublicUrl(filePath)
  return { imagePath: filePath, imageUrl: data.publicUrl }
}

export async function removeShopProductImage(imagePath) {
  if (!imagePath) return
  const { error } = await supabase.storage.from('shop-products').remove([imagePath])
  if (error) throw new Error(error.message)
}
