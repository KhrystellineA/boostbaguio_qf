/**
 * Cloudinary Image Upload Utility
 * 
 * Free alternative to Firebase Storage for image uploads.
 * Free tier: 25GB storage, 25GB bandwidth/month
 * 
 * Setup:
 * 1. Sign up at https://cloudinary.com/
 * 2. Get your cloud name from dashboard
 * 3. Create an upload preset (Settings > Upload > Add upload preset)
 *    - Signing mode: Unsigned
 *    - Add allowed folders if needed
 * 4. Add to .env:
 *    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *    VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
 * 
 * @example
 * const imageUrl = await uploadImage(file, 'events')
 * // Store imageUrl in Firestore
 */

/**
 * Upload an image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export async function uploadImage(file, folder = 'baguiboost') {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  
  if (folder) {
    formData.append('folder', folder)
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes
    }
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error)
    throw error
  }
}

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @param {string} folder - Optional folder name
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function uploadMultipleImages(files, folder = 'baguiboost') {
  const results = await Promise.all(
    files.map(file => uploadImage(file, folder))
  )
  return results.map(result => result.url)
}

/**
 * Delete an image from Cloudinary
 * Note: Requires signed uploads with API secret (server-side only)
 * For client-side only apps, consider images as permanent
 * or implement a cleanup strategy
 * 
 * @param {string} publicId - The public ID of the image to delete
 * @returns {void}
 */
export async function deleteImage(publicId) {
  console.warn(
    '[Cloudinary] Delete requires server-side API. ' +
    'Consider implementing a cleanup cron job or marking images as deleted in Firestore.',
    publicId
  )
  // For client-side only apps, you can:
  // 1. Mark as deleted in Firestore
  // 2. Use Cloudinary's delete API from a Cloud Function (requires Blaze plan)
  // 3. Implement periodic cleanup manually via Cloudinary dashboard
}

/**
 * Generate Cloudinary transformation URL
 * @param {string} publicId - The public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Transformed image URL
 * 
 * @example
 * const thumbnail = getTransformedImageUrl('events/img123', {
 *   width: 300,
 *   height: 200,
 *   crop: 'fill'
 * })
 */
export function getTransformedImageUrl(publicId, options = {}) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  
  if (!cloudName) {
    return ''
  }

  const transformations = []
  
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)
  if (options.crop) transformations.push(`c_${options.crop}`)
  if (options.quality) transformations.push(`q_${options.quality}`)
  if (options.format) transformations.push(`f_${options.format}`)

  const transformString = transformations.join(',')
  const transformPath = transformString ? `${transformString}/` : ''

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformPath}${publicId}`
}

/**
 * Compress and optimize image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'))
            return
          }

          const compressedFile = new File([blob], file.name, {
            type: format,
            lastModified: Date.now()
          })

          resolve(compressedFile)
        },
        format,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload with automatic compression
 * @param {File} file - Image file to upload
 * @param {string} folder - Folder name
 * @param {Object} compressOptions - Compression options
 * @returns {Promise<Object>} Upload result
 */
export async function uploadOptimizedImage(file, folder = 'baguiboost', compressOptions = {}) {
  const compressedFile = await compressImage(file, compressOptions)
  return uploadImage(compressedFile, folder)
}

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getTransformedImageUrl,
  compressImage,
  uploadOptimizedImage
}
