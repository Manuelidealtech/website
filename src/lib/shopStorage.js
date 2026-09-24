import { supabase } from './supabase'
import { sanitizeFileName } from './storage'
import { compressShopImage } from './shopImages'

export async function uploadShopProductImage({ file, userId, productId = 'new' }) {
  const compressedFile = await compressShopImage(file)
  const safeName = sanitizeFileName(compressedFile.name)
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`
  const filePath = `${userId}/${productId}/${fileName}`

  const { error } = await supabase.storage.from('shop-products').upload(filePath, compressedFile, {
    cacheControl: '31536000',
    contentType: 'image/webp',
    upsert: false,
  })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('shop-products').getPublicUrl(filePath)
  return {
    imagePath: filePath,
    imageUrl: data.publicUrl,
    originalBytes: Number(file.size || 0),
    compressedBytes: Number(compressedFile.size || 0),
  }
}

export async function uploadShopProductImages({ files, userId, productId = 'new' }) {
  const results = []
  for (const file of Array.from(files || [])) {
    results.push(await uploadShopProductImage({ file, userId, productId }))
  }
  return results
}

export async function removeShopProductImage(imagePath) {
  if (!imagePath) return
  const { error } = await supabase.storage.from('shop-products').remove([imagePath])
  if (error) throw new Error(error.message)
}

export async function removeShopProductImages(imagePaths) {
  const paths = [...new Set(Array.from(imagePaths || []).filter(Boolean))]
  if (!paths.length) return
  const { error } = await supabase.storage.from('shop-products').remove(paths)
  if (error) throw new Error(error.message)
}
