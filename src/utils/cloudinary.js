/**
 * Cloudinary Image Optimization Utilities
 * Provides optimized image URLs with transformations
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dc9vkemqm'
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'BoostBaguio'

/**
 * Image transformation options
 * @typedef {Object} CloudinaryTransform
 * @property {number} [width] - Target width
 * @property {number} [height] - Target height
 * @property {number} [quality] - Quality (1-100)
 * @property {string} [format] - Output format (auto, webp, jpg, png)
 * @property {string} [crop] - Crop mode (fill, fit, crop, scale)
 */

/**
 * Generate optimized Cloudinary URL
 * @param {string} publicId - Cloudinary public ID or full URL
 * @param {CloudinaryTransform} options - Transformation options
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(publicId, options = {}) {
  const {
    width = 1920,
    height = 1080,
    quality = 85,
    format = 'auto',
    crop = 'fill'
  } = options

  // If it's already a full Cloudinary URL, extract the public ID
  if (publicId.includes('cloudinary.com')) {
    const match = publicId.match(/\/upload\/(.+)$/)
    if (match) {
      publicId = match[1]
    }
  }

  // If it's a relative path or external URL, return as-is
  if (publicId.startsWith('/') || publicId.startsWith('http')) {
    return publicId
  }

  // Build transformation string
  const transforms = [
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    `f_${format}`,
    `c_${crop}`
  ]

  const transformation = transforms.join(',')

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`
}

/**
 * Generate responsive image srcset
 * @param {string} publicId - Cloudinary public ID
 * @param {number[]} widths - Array of widths for srcset
 * @returns {string} Srcset string
 */
export function getSrcSet(publicId, widths = [400, 800, 1200, 1600, 2000]) {
  return widths
    .map(w => `${getOptimizedImageUrl(publicId, { width: w })} ${w}w`)
    .join(', ')
}

/**
 * Get Cloudinary upload URL
 * @returns {string} Upload URL
 */
export function getUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
}

/**
 * Get Cloudinary upload params
 * @returns {Object} Upload params
 */
export function getUploadParams() {
  return {
    cloud_name: cloudName,
    upload_preset: uploadPreset
  }
}

/**
 * Lazy load image helper
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Image source
 * @returns {Promise<void>}
 */
export function lazyLoadImage(img, src) {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Preload image
 * @param {string} src - Image source to preload
 * @returns {Promise<void>}
 */
export function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Image optimization presets for common use cases
 */
export const ImagePresets = {
  /** Hero/Banner images */
  hero: {
    width: 1920,
    height: 1080,
    quality: 85,
    format: 'auto',
    crop: 'fill'
  },

  /** Card/thumbnail images */
  thumbnail: {
    width: 400,
    height: 300,
    quality: 80,
    format: 'webp',
    crop: 'fill'
  },

  /** Gallery images */
  gallery: {
    width: 800,
    height: 600,
    quality: 85,
    format: 'auto',
    crop: 'fill'
  },

  /** Profile/avatar images */
  avatar: {
    width: 200,
    height: 200,
    quality: 80,
    format: 'auto',
    crop: 'fill'
  },

  /** Product/item images */
  product: {
    width: 600,
    height: 600,
    quality: 85,
    format: 'auto',
    crop: 'fill'
  },

  /** Background images */
  background: {
    width: 1920,
    height: 1080,
    quality: 75,
    format: 'auto',
    crop: 'fill'
  }
}
