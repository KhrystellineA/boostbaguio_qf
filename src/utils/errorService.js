/**
 * Boost Baguio - Error Service
 *
 * Provides a unified API for:
 * - Error categorization
 * - User-friendly error messages
 * - Retry mechanisms for failed requests
 * - Error logging and monitoring to Firestore
 */

import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  limit,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore'

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
  UNKNOWN: 'unknown',
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
  'auth/network-request-failed':
    'Network error during authentication. Please check your connection.',
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
  'generic/contact-support': 'An error occurred. If this persists, please contact support.',
}

/**
 * Categorize an error
 */
export function categorizeError(error) {
  const code = error?.code || error?.error?.code || ''
  const message = (error?.message || error?.error?.message || '').toLowerCase()

  if (
    code.includes('network') ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('connection')
  ) {
    return ErrorCategory.NETWORK
  }
  if (code.includes('auth/')) return ErrorCategory.AUTH
  if (code.includes('permission-denied') || message.includes('permission'))
    return ErrorCategory.PERMISSION
  if (code.includes('not-found') || code.includes('404')) return ErrorCategory.NOT_FOUND
  if (
    code.includes('invalid-argument') ||
    message.includes('invalid') ||
    message.includes('required')
  ) {
    return ErrorCategory.VALIDATION
  }
  if (
    code.includes('unavailable') ||
    code.includes('internal') ||
    code.includes('500') ||
    code.includes('503')
  ) {
    return ErrorCategory.SERVER
  }

  return ErrorCategory.UNKNOWN
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error, fallback = null) {
  const code = error?.code || error?.error?.code || ''

  if (errorMessages[code]) return errorMessages[code]

  for (const [key, message] of Object.entries(errorMessages)) {
    if (code.includes(key) || (error?.message || '').toLowerCase().includes(key)) {
      return message
    }
  }

  return error?.message || fallback || errorMessages['generic/unknown']
}

/**
 * Retry a failed operation with exponential backoff
 */
export async function withRetry(operation, options = {}) {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, factor = 2, onRetry } = options
  let lastError
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const category = categorizeError(error)
      if (
        category === ErrorCategory.AUTH ||
        category === ErrorCategory.PERMISSION ||
        category === ErrorCategory.VALIDATION
      ) {
        throw error
      }
      if (attempt === maxRetries) break
      if (onRetry) onRetry({ attempt: attempt + 1, maxRetries, error })
      await new Promise((resolve) => setTimeout(resolve, Math.min(delay, maxDelay)))
      delay *= factor
    }
  }
  throw lastError
}

/**
 * Check if user is online
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Wait for online status
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
      },
    }
  )
}

/**
 * Format error for display and logging
 */
export function formatError(error) {
  return {
    code: error?.code || error?.error?.code || 'unknown',
    message: getErrorMessage(error),
    rawMessage: error?.message || error?.error?.message || 'Unknown error',
    category: categorizeError(error),
    timestamp: new Date().toISOString(),
    stack: error?.stack || null,
  }
}

/**
 * Local console logging
 */
export function logError(context, error, metadata = {}) {
  const formatted = formatError(error)
  console.group(`[Error] ${context}`)
  console.error('Category:', formatted.category)
  console.error('Code:', formatted.code)
  console.error('Message:', formatted.message)
  console.error('Raw:', formatted.rawMessage)
  if (Object.keys(metadata).length > 0) console.error('Metadata:', metadata)
  if (formatted.stack) console.error('Stack:', formatted.stack)
  console.groupEnd()
}

/**
 * Log an error to Firestore monitoring service
 */
export async function logErrorToMonitoring({
  context,
  error,
  severity = 'medium',
  metadata = {},
  userId = null,
  action = null,
}) {
  try {
    const formatted = formatError(error)
    const errorLog = {
      context,
      error: {
        code: formatted.code,
        message: formatted.message,
        rawMessage: formatted.rawMessage,
        category: formatted.category,
        stack: formatted.stack,
      },
      severity,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        language: navigator.language,
      },
      userId,
      action,
      timestamp: serverTimestamp(),
    }

    await addDoc(collection(db, 'error_logs'), errorLog)

    if (process.env.DEV) {
      console.error(`[Error Monitor] ${context}:`, formatted.message)
    }
  } catch (logError) {
    console.error('[Error Monitor] Failed to log error:', logError)
  }
}

export async function logHandledError(context, error, metadata = {}) {
  return logErrorToMonitoring({ context, error, severity: 'low', metadata })
}

export async function logUnhandledError(context, error, metadata = {}) {
  return logErrorToMonitoring({ context, error, severity: 'critical', metadata })
}

export async function logApiFailure(endpoint, error, method = 'GET', metadata = {}) {
  return logErrorToMonitoring({
    context: `API:${method}:${endpoint}`,
    error,
    severity: 'high',
    metadata: { endpoint, method, ...metadata },
  })
}

export async function logActionFailure(action, error, metadata = {}) {
  return logErrorToMonitoring({
    context: `Action:${action}`,
    error,
    severity: 'medium',
    action,
    metadata,
  })
}

export async function getRecentErrorLogs(limitCount = 50) {
  try {
    const q = query(collection(db, 'error_logs'), orderBy('timestamp', 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error('[Error Monitor] Error getting recent logs:', error)
    return []
  }
}

export async function getErrorStatistics() {
  try {
    const snapshot = await getDocs(collection(db, 'error_logs'))
    const logs = snapshot.docs.map((doc) => doc.data())
    const stats = {
      total: logs.length,
      byCategory: {},
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byContext: {},
      last24Hours: 0,
      last7Days: 0,
    }

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    logs.forEach((log) => {
      const category = log.error?.category || 'unknown'
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
      const severity = log.severity || 'medium'
      if (stats.bySeverity[severity] !== undefined) stats.bySeverity[severity]++
      const context = log.context || 'unknown'
      stats.byContext[context] = (stats.byContext[context] || 0) + 1
      const logTimestamp = log.timestamp?.toDate?.() || new Date(log.timestamp)
      if (logTimestamp >= twentyFourHoursAgo) stats.last24Hours++
      if (logTimestamp >= sevenDaysAgo) stats.last7Days++
    })
    return stats
  } catch (error) {
    console.error('[Error Monitor] Error getting statistics:', error)
    return null
  }
}

export async function clearOldErrorLogs(daysOld = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    const snapshot = await getDocs(collection(db, 'error_logs'))
    let deletedCount = 0
    const deletePromises = []

    snapshot.docs.forEach((doc) => {
      const data = doc.data()
      const logDate = data.timestamp?.toDate?.() || new Date(data.timestamp)
      if (logDate < cutoffDate) {
        deletePromises.push(
          import('firebase/firestore').then(({ deleteDoc, docRef }) =>
            deleteDoc(docRef(db, 'error_logs', doc.id))
          )
        )
        deletedCount++
      }
    })

    if (deletePromises.length > 0) {
      const { deleteDoc, doc: docRef } = await import('firebase/firestore')
      await Promise.all(
        snapshot.docs
          .filter((d) => {
            const data = d.data()
            const logDate = data.timestamp?.toDate?.() || new Date(data.timestamp)
            return logDate < cutoffDate
          })
          .map((d) => deleteDoc(docRef(db, 'error_logs', d.id)))
      )
    }
    return deletedCount
  } catch (error) {
    console.error('[Error Monitor] Error clearing old logs:', error)
    return 0
  }
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
  logError,
  logErrorToMonitoring,
  logHandledError,
  logUnhandledError,
  logApiFailure,
  logActionFailure,
  getRecentErrorLogs,
  getErrorStatistics,
  clearOldErrorLogs,
}
// --rabbit
