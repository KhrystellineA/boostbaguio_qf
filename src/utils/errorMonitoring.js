/**
 * Boost Baguio - Error Monitoring Service
 *
 * Logs errors to Firestore for monitoring and debugging:
 * - Application errors
 * - API failures
 * - User action failures
 * - Performance issues
 */

import { db } from 'src/boot/firebase'
import { collection, addDoc, serverTimestamp, limit, query, orderBy, getDocs } from 'firebase/firestore'
import { formatError } from './errorHandler'

/**
 * Log an error to monitoring service
 * @param {Object} params - Error parameters
 * @param {string} params.context - Where the error occurred (e.g., 'AdminDashboard', 'PlacesManagement')
 * @param {Error|any} params.error - The error object
 * @param {string} [params.severity] - Error severity (low, medium, high, critical)
 * @param {Object} [params.metadata] - Additional context about the error
 * @param {string} [params.userId] - User ID if available
 * @param {string} [params.action] - User action that triggered the error
 */
export async function logErrorToMonitoring({
  context,
  error,
  severity = 'medium',
  metadata = {},
  userId = null,
  action = null
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
        stack: formatted.stack
      },
      severity,
      metadata: {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        language: navigator.language
      },
      userId,
      action,
      timestamp: serverTimestamp()
    }
    
    // Add to error logs collection
    await addDoc(collection(db, 'error_logs'), errorLog)
    
    // Also log to console in development
    if (process.env.DEV) {
      console.error(`[Error Monitor] ${context}:`, formatted.message)
    }
  } catch (logError) {
    // If logging fails, just log to console
    console.error('[Error Monitor] Failed to log error:', logError)
  }
}

/**
 * Log a handled error (non-critical)
 */
export async function logHandledError(context, error, metadata = {}) {
  return logErrorToMonitoring({
    context,
    error,
    severity: 'low',
    metadata
  })
}

/**
 * Log an unhandled error (critical)
 */
export async function logUnhandledError(context, error, metadata = {}) {
  return logErrorToMonitoring({
    context,
    error,
    severity: 'critical',
    metadata
  })
}

/**
 * Log an API failure
 */
export async function logApiFailure(endpoint, error, method = 'GET', metadata = {}) {
  return logErrorToMonitoring({
    context: `API:${method}:${endpoint}`,
    error,
    severity: 'high',
    metadata: {
      endpoint,
      method,
      ...metadata
    }
  })
}

/**
 * Log a user action failure
 */
export async function logActionFailure(action, error, metadata = {}) {
  return logErrorToMonitoring({
    context: `Action:${action}`,
    error,
    severity: 'medium',
    action,
    metadata
  })
}

/**
 * Get recent error logs
 * @param {number} limitCount - Number of logs to retrieve
 * @returns {Promise<Array>}
 */
export async function getRecentErrorLogs(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'error_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('[Error Monitor] Error getting recent logs:', error)
    return []
  }
}

/**
 * Get error statistics
 * @returns {Promise<Object>}
 */
export async function getErrorStatistics() {
  try {
    const snapshot = await getDocs(collection(db, 'error_logs'))
    const logs = snapshot.docs.map(doc => doc.data())
    
    const stats = {
      total: logs.length,
      byCategory: {},
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byContext: {},
      last24Hours: 0,
      last7Days: 0
    }
    
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    logs.forEach(log => {
      // Category stats
      const category = log.error?.category || 'unknown'
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1
      
      // Severity stats
      const severity = log.severity || 'medium'
      if (stats.bySeverity[severity] !== undefined) {
        stats.bySeverity[severity]++
      }
      
      // Context stats
      const context = log.context || 'unknown'
      stats.byContext[context] = (stats.byContext[context] || 0) + 1
      
      // Time-based stats
      const logTimestamp = log.timestamp?.toDate?.() || new Date(log.timestamp)
      if (logTimestamp >= twentyFourHoursAgo) {
        stats.last24Hours++
      }
      if (logTimestamp >= sevenDaysAgo) {
        stats.last7Days++
      }
    })
    
    return stats
  } catch (error) {
    console.error('[Error Monitor] Error getting statistics:', error)
    return null
  }
}

/**
 * Clear old error logs
 * @param {number} daysOld - Delete logs older than this many days
 */
export async function clearOldErrorLogs(daysOld = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const snapshot = await getDocs(collection(db, 'error_logs'))
    let deletedCount = 0
    
    const deletePromises = []
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const logDate = data.timestamp?.toDate?.() || new Date(data.timestamp)
      
      if (logDate < cutoffDate) {
        deletePromises.push(import('firebase/firestore').then(({ deleteDoc, doc }) => 
          deleteDoc(doc(db, 'error_logs', doc.id))
        ))
        deletedCount++
      }
    })
    
    if (deletePromises.length > 0) {
      const { deleteDoc, doc } = await import('firebase/firestore')
      await Promise.all(
        snapshot.docs
          .filter(d => {
            const data = d.data()
            const logDate = data.timestamp?.toDate?.() || new Date(data.timestamp)
            return logDate < cutoffDate
          })
          .map(d => deleteDoc(doc(db, 'error_logs', d.id)))
      )
    }
    
    return deletedCount
  } catch (error) {
    console.error('[Error Monitor] Error clearing old logs:', error)
    return 0
  }
}

export default {
  logErrorToMonitoring,
  logHandledError,
  logUnhandledError,
  logApiFailure,
  logActionFailure,
  getRecentErrorLogs,
  getErrorStatistics,
  clearOldErrorLogs
}
