/**
 * Boost Baguio - Validation Utilities
 *
 * Provides:
 * - Reusable form validators
 * - Phone number validation (PH format)
 * - Email validation
 * - URL validation
 * - Custom validation rules
 */

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [message] - Error message if validation failed
 */

/**
 * Check if value is required
 * @param {*} value - Value to check
 * @param {string} [fieldName='Field'] - Field name for error message
 * @returns {ValidationResult}
 */
export function required(value, fieldName = 'Field') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` }
  }
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, message: `At least one ${fieldName.toLowerCase()} is required` }
  }
  return { valid: true }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {ValidationResult}
 */
export function email(email) {
  if (!email) {
    return { valid: true } // Let required handle empty values
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' }
  }

  // Check for common typos
  const commonDomains = {
    'gmail.com': true,
    'yahoo.com': true,
    'hotmail.com': true,
    'outlook.com': true,
    'icloud.com': true,
    'protonmail.com': true
  }

  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && !commonDomains[domain]) {
    // Check for typos in common domains
    const typos = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com'
    }

    if (typos[domain]) {
      return {
        valid: false,
        message: `Did you mean ${email.replace(domain, typos[domain])}?`
      }
    }
  }

  return { valid: true }
}

/**
 * Validate Philippine phone number format
 * Accepts various formats:
 * - 09171234567
 * - +639171234567
 * - 639171234567
 * - 0917-123-4567
 * - 0917 123 4567
 * @param {string} phone - Phone number to validate
 * @returns {ValidationResult}
 */
export function phone(phone) {
  if (!phone) {
    return { valid: true } // Let required handle empty values
  }

  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Philippine mobile number patterns
  // Globe/TM: 0917, 0916, 0915, 0906, 0905, 0935, 0936, 0937, 0945, 0956, 0966, 0977, 0996
  // Smart/TNT: 0918, 0919, 0909, 0910, 0911, 0912, 0913, 0914, 0920, 0921, 0928, 0929, 0939, 0949, 0950, 0951
  // DITO: 0991, 0992, 0993, 0994
  const patterns = [
    /^(\+63|63)?9[1-9]\d{7}$/, // International format
    /^09[1-9]\d{7}$/ // Local format
  ]

  const isValid = patterns.some(pattern => pattern.test(cleaned))

  if (!isValid) {
    return {
      valid: false,
      message: 'Please enter a valid Philippine mobile number (e.g., 09171234567)'
    }
  }

  return { valid: true }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @param {boolean} [options.requireHttps=false] - Require HTTPS protocol
 * @param {Array<string>} [options.allowedProtocols] - Allowed protocols
 * @returns {ValidationResult}
 */
export function url(url, options = {}) {
  if (!url) {
    return { valid: true } // Let required handle empty values
  }

  const { requireHttps = false, allowedProtocols = ['http', 'https'] } = options

  try {
    const urlObj = new URL(url)

    // Check protocol
    if (!allowedProtocols.includes(urlObj.protocol.replace(':', ''))) {
      return {
        valid: false,
        message: `URL must start with ${allowedProtocols.join(' or ')}`
      }
    }

    // Check for HTTPS if required
    if (requireHttps && urlObj.protocol !== 'https:') {
      return {
        valid: false,
        message: 'URL must use HTTPS protocol for security'
      }
    }

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname === 'localhost') {
      return {
        valid: false,
        message: 'Please enter a valid URL with a domain name'
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, message: 'Please enter a valid URL (e.g., https://example.com)' }
  }
}

/**
 * Validate image URL specifically
 * @param {string} url - Image URL to validate
 * @returns {ValidationResult}
 */
export function imageUrl(url) {
  if (!url) {
    return { valid: true }
  }

  // First validate as general URL
  const urlResult = url(url, { allowedProtocols: ['http', 'https'] })
  if (!urlResult.valid) {
    return urlResult
  }

  // Check for image file extensions or image hosting services
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)(\?.*)?$/i
  const imageHosts = ['cloudinary.com', 'imgur.com', 'images.unsplash.com', 'cdn.pixabay.com']

  try {
    const urlObj = new URL(url)
    const hasImageExtension = imageExtensions.test(urlObj.pathname)
    const isImageHost = imageHosts.some(host => urlObj.hostname.includes(host))

    if (!hasImageExtension && !isImageHost) {
      return {
        valid: false,
        message: 'URL must point to an image file (JPG, PNG, GIF, WebP, etc.) or image hosting service'
      }
    }

    return { valid: true }
  } catch {
    return { valid: false, message: 'Please enter a valid image URL' }
  }
}

/**
 * Validate minimum length
 * @param {string|Array} value - Value to check
 * @param {number} min - Minimum length
 * @param {string} [fieldName='Field'] - Field name for error message
 * @returns {ValidationResult}
 */
export function minLength(value, min, fieldName = 'Field') {
  if (!value) {
    return { valid: true }
  }

  const length = Array.isArray(value) ? value.length : value.length
  if (length < min) {
    return {
      valid: false,
      message: `${fieldName} must be at least ${min} character${min > 1 ? 's' : ''}`
    }
  }
  return { valid: true }
}

/**
 * Validate maximum length
 * @param {string|Array} value - Value to check
 * @param {number} max - Maximum length
 * @param {string} [fieldName='Field'] - Field name for error message
 * @returns {ValidationResult}
 */
export function maxLength(value, max, fieldName = 'Field') {
  if (!value) {
    return { valid: true }
  }

  const length = Array.isArray(value) ? value.length : value.length
  if (length > max) {
    return {
      valid: false,
      message: `${fieldName} must not exceed ${max} character${max > 1 ? 's' : ''}`
    }
  }
  return { valid: true }
}

/**
 * Validate number range
 * @param {number} value - Value to check
 * @param {Object} options - Range options
 * @param {number} [options.min] - Minimum value
 * @param {number} [options.max] - Maximum value
 * @param {string} [fieldName='Value'] - Field name for error message
 * @returns {ValidationResult}
 */
export function range(value, options = {}, fieldName = 'Value') {
  if (value === null || value === undefined || value === '') {
    return { valid: true }
  }

  const num = Number(value)
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} must be a number` }
  }

  const { min, max } = options

  if (min !== undefined && num < min) {
    return {
      valid: false,
      message: `${fieldName} must be at least ${min}`
    }
  }

  if (max !== undefined && num > max) {
    return {
      valid: false,
      message: `${fieldName} must not exceed ${max}`
    }
  }

  return { valid: true }
}

/**
 * Validate against a pattern/regex
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Regex pattern
 * @param {string} message - Error message
 * @returns {ValidationResult}
 */
export function pattern(value, pattern, message) {
  if (!value) {
    return { valid: true }
  }

  if (!pattern.test(value)) {
    return { valid: false, message }
  }

  return { valid: true }
}

/**
 * Validate coordinates (latitude/longitude)
 * @param {number} value - Coordinate value
 * @param {string} type - 'lat' or 'lng'
 * @returns {ValidationResult}
 */
export function coordinates(value, type) {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: 'Coordinates are required' }
  }

  const num = Number(value)
  if (isNaN(num)) {
    return { valid: false, message: 'Please enter valid coordinates' }
  }

  if (type === 'lat') {
    if (num < -90 || num > 90) {
      return { valid: false, message: 'Latitude must be between -90 and 90' }
    }
  } else if (type === 'lng') {
    if (num < -180 || num > 180) {
      return { valid: false, message: 'Longitude must be between -180 and 180' }
    }
  }

  return { valid: true }
}

/**
 * Validate date is not in the past
 * @param {string} date - Date string
 * @returns {ValidationResult}
 */
export function notInPast(date) {
  if (!date) {
    return { valid: true }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selectedDate = new Date(date)
  if (selectedDate < today) {
    return { valid: false, message: 'Date cannot be in the past' }
  }

  return { valid: true }
}

/**
 * Validate date is on or after another date
 * @param {string} date - Date to validate
 * @param {string} minDate - Minimum date
 * @returns {ValidationResult}
 */
export function dateOnOrAfter(date, minDate) {
  if (!date || !minDate) {
    return { valid: true }
  }

  const dateObj = new Date(date)
  const minDateObj = new Date(minDate)

  if (dateObj < minDateObj) {
    return { valid: false, message: 'Date must be on or after the start date' }
  }

  return { valid: true }
}

/**
 * Create a Quasar-compatible validator function
 * @param {Function} validator - Validator function
 * @param {string} [customMessage] - Custom error message
 * @returns {Function} Quasar validator
 */
export function quasarValidator(validator, customMessage) {
  return (value) => {
    const result = validator(value)
    if (!result.valid) {
      return customMessage || result.message
    }
    return true
  }
}

/**
 * Create a composed validator (multiple validators)
 * @param  {...Function} validators - Validator functions
 * @returns {Function} Combined validator
 */
export function composeValidators(...validators) {
  return (value) => {
    for (const validator of validators) {
      const result = validator(value)
      if (!result.valid) {
        return result
      }
    }
    return { valid: true }
  }
}

/**
 * Validate form with multiple fields
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with errors by field
 */
export function validateForm(formData, rules) {
  const errors = {}
  let isValid = true

  for (const [field, validators] of Object.entries(rules)) {
    const value = formData[field]

    for (const validator of validators) {
      const result = validator(value)
      if (!result.valid) {
        if (!errors[field]) {
          errors[field] = result.message
          isValid = false
        }
        break // Stop at first error for this field
      }
    }
  }

  return { isValid, errors }
}

export default {
  required,
  email,
  phone,
  url,
  imageUrl,
  minLength,
  maxLength,
  range,
  pattern,
  coordinates,
  notInPast,
  dateOnOrAfter,
  quasarValidator,
  composeValidators,
  validateForm
}
