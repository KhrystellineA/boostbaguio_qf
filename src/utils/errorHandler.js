/**
 * Boost Baguio - Error Handling Service
 *
 * Provides:
 * - User-friendly error messages
 * - Retry mechanisms for failed requests
 * - Error logging and monitoring
 * - Error categorization
 */

import { db } from 'src/boot/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Error categories for better handling
 */
export const ErrorCategory = {
  NETWORK: 'network',
  AUTH: 'auth',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown'
}

/**
 * User-friendly error messages
 */
const errorMessages = {
  // Network errors
  'network/online': 'You appear to be offline. Please check your internet connection.',
  'network/timeout': 'Request timed out. Please try again.',
  'network/server-unreachable': 'Server is temporarily unavailable. Please try again later.',
  
  // Firebase/Auth errors
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/unauthorized-domain': 'This domain is not authorized for authentication.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/network-request-failed': 'Network error during authentication. Please check your connection.',
  'auth/requires-recent-login': 'This action requires recent authentication. Please log in again.',
  
  // Firestore errors
  'firestore/permission-denied': 'You do not have permission to perform this action.',
  'firestore/unavailable': 'Database is temporarily unavailable. Please try again.',
  'firestore/not-found': 'The requested data was not found.',
  'firestore/already-exists': 'This document already exists.',
  
  // Storage errors
  'storage/unauthorized': 'You do not have permission to upload files.',
  'storage/canceled': 'File upload was canceled.',
  'storage/invalid-format': 'Invalid file format. Please upload a valid image.',
  'storage/size-limit': 'File is too large. Please upload a file under 5MB.',
  'storage/quota-exceeded': 'Storage quota exceeded. Please contact support.',
  
  // Validation errors
  'validation/required': 'This field is required.',
  'validation/invalid-format': 'Invalid format. Please check your input.',
  'validation/too-short': 'Input is too short.',
  'validation/too-long': 'Input is too long.',
  'validation/invalid-date': 'Invalid date. Please select a valid date.',
  'validation/invalid-number': 'Please enter a valid number.',
  
  // General errors
  'generic/unknown': 'An unexpected error occurred. Please try again.',
  'generic/retry': 'Something went wrong. You can retry this action.',
  'generic/contact-support': 'An error occurred. If this persists, please contact support.'
}

/**
 * Categorize an error
 * @param {Error|any} error - The error to categorize
 * @returns {string} Error category
 */
export function categorizeError(error) {
  const code = error?.code || error?.error?.code || ''
  const message = (error?.message || error?.error?.message || '').toLowerCase()
  
  // Network errors
  if (code.includes('network') || message.includes('network') || 
      message.includes('offline') || message.includes('connection')) {
    return ErrorCategory.NETWORK
  }
  
  // Auth errors
  if (code.includes('auth/')) {
    return ErrorCategory.AUTH
  }
  
  // Permission errors
  if (code.includes('permission-denied') || message.includes('permission')) {
    return ErrorCategory.PERMISSION
  }
  
  // Not found errors
  if (code.includes('not-found') || code.includes('404')) {
    return ErrorCategory.NOT_FOUND
  }
  
  // Validation errors
  if (code.includes('invalid-argument') || message.includes('invalid') || 
      message.includes('required')) {
    return ErrorCategory.VALIDATION
  }
  
  // Server errors
  if (code.includes('unavailable') || code.includes('internal') || 
      code.includes('500') || code.includes('503')) {
    return ErrorCategory.SERVER
  }
  
  return ErrorCategory.UNKNOWN
}

/**
 * Get user-friendly error message
 * @param {Error|any} error - The error object
 * @param {string} [fallback] - Fallback message if no match found
 * @returns {string} User-friendly message
 */
export function getErrorMessage(error, fallback = null) {
  const code = error?.code || error?.error?.code || ''
  
  // Check for exact match
  if (errorMessages[code]) {
    return errorMessages[code]
  }
  
  // Check for partial matches
  for (const [key, message] of Object.entries(errorMessages)) {
    if (code.includes(key) || (error?.message || '').toLowerCase().includes(key)) {
      return message
    }
  }
  
  // Return custom message or fallback
  return error?.message || fallback || errorMessages['generic/unknown']
}

/**
 * Retry a failed operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.initialDelay=1000] - Initial delay in ms
 * @param {number} [options.maxDelay=10000] - Maximum delay in ms
 * @param {number} [options.factor=2] - Exponential backoff factor
 * @param {Function} [options.onRetry] - Callback on each retry
 * @returns {Promise<any>} Result of the operation
 */
export async function withRetry(operation, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry
  } = options
  
  let lastError
  let delay = initialDelay
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain errors
      const category = categorizeError(error)
      if (category === ErrorCategory.AUTH || 
          category === ErrorCategory.PERMISSION ||
          category === ErrorCategory.VALIDATION) {
        throw error
      }
      
      // Last attempt
      if (attempt === maxRetries) {
        break
      }
      
      // Call retry callback
      if (onRetry) {
        onRetry({ attempt: attempt + 1, maxRetries, error })
      }
      
      // Wait with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.min(delay, maxDelay))
      )
      
      // Increase delay for next attempt
      delay *= factor
    }
  }
  
  throw lastError
}

/**
 * Check if user is online
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Wait for online status
 * @param {number} timeout - Max time to wait in ms
 * @returns {Promise<boolean>}
 */
export function waitForOnline(timeout = 30000) {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve(true)
      return
    }
    
    const checkOnline = () => {
      if (isOnline()) {
        cleanup()
        resolve(true)
      }
    }
    
    const timeoutId = setTimeout(() => {
      cleanup()
      resolve(false)
    }, timeout)
    
    const cleanup = () => {
      clearTimeout(timeoutId)
      window.removeEventListener('online', checkOnline)
    }
    
    window.addEventListener('online', checkOnline)
  })
}

/**
 * Execute operation with online check
 * @param {Function} operation - Async function to execute
 * @param {Object} options - Options
 * @returns {Promise<any>}
 */
export async function executeWithOnlineCheck(operation, options = {}) {
  const { retryOffline = false, timeout = 30000 } = options
  
  if (!isOnline()) {
    if (retryOffline) {
      const online = await waitForOnline(timeout)
      if (!online) {
        throw new Error('Unable to connect. Please check your internet connection.')
      }
    } else {
      throw new Error('You appear to be offline. Please check your internet connection.')
    }
  }
  
  return operation()
}

/**
 * Create a wrapped fetch with automatic retry
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options = {}) {
  return withRetry(
    async () => {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response
    },
    {
      maxRetries: 3,
      onRetry: ({ attempt, maxRetries }) => {
        console.log(`[Fetch] Retry ${attempt}/${maxRetries} for ${url}`)
      }
    }
  )
}

/**
 * Format error for display
 * @param {Error|any} error - Error object
 * @returns {Object} Formatted error
 */
export function formatError(error) {
  return {
    code: error?.code || error?.error?.code || 'unknown',
    message: getErrorMessage(error),
    rawMessage: error?.message || error?.error?.message || 'Unknown error',
    category: categorizeError(error),
    timestamp: new Date().toISOString(),
    stack: error?.stack || null
  }
}

/**
 * Log error to console with formatting
 * @param {string} context - Where the error occurred
 * @param {Error|any} error - Error object
 * @param {Object} [metadata] - Additional metadata
 */
export function logError(context, error, metadata = {}) {
  const formatted = formatError(error)
  
  console.group(`[Error] ${context}`)
  console.error('Category:', formatted.category)
  console.error('Code:', formatted.code)
  console.error('Message:', formatted.message)
  console.error('Raw:', formatted.rawMessage)
  if (metadata) {
    console.error('Metadata:', metadata)
  }
  if (formatted.stack) {
    console.error('Stack:', formatted.stack)
  }
  console.groupEnd()
}

export default {
  ErrorCategory,
  categorizeError,
  getErrorMessage,
  withRetry,
  isOnline,
  waitForOnline,
  executeWithOnlineCheck,
  fetchWithRetry,
  formatError,
  logError
}
