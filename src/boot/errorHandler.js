/**
 * Boost Baguio - Global Error Handler Boot File
 *
 * Sets up global error handlers for:
 * - Unhandled promise rejections
 * - Global Vue errors
 * - Window errors
 */

import { logErrorToMonitoring } from 'src/utils/errorMonitoring'
import { isOnline } from 'src/utils/errorHandler'

export default async ({ app, router }) => {
  // Track if we're in development mode
  const isDev = process.env.DEV

  /**
   * Handle unhandled promise rejections
   */
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    console.error('[Global Handler] Unhandled promise rejection:', error)

    // Log to monitoring
    logErrorToMonitoring({
      context: 'Global:unhandledrejection',
      error,
      severity: 'high',
      metadata: {
        type: 'promise-rejection'
      }
    })

    // Don't prevent default in production to avoid double logging
    if (!isDev) {
      event.preventDefault()
    }
  })

  /**
   * Handle global window errors
   */
  window.addEventListener('error', (event) => {
    const { error, message, filename, lineno, colno } = event

    console.error('[Global Handler] Global error:', {
      message,
      filename,
      lineno,
      colno,
      error
    })

    // Log to monitoring
    logErrorToMonitoring({
      context: 'Global:error',
      error: error || new Error(message),
      severity: 'critical',
      metadata: {
        type: 'window-error',
        filename,
        lineno,
        colno,
        message,
        url: window.location.href,
        online: isOnline()
      }
    })
  })

  /**
   * Handle Vue app errors
   */
  app.config.errorHandler = (error, instance, info) => {
    console.error('[Global Handler] Vue error:', { error, instance, info })

    // Get component name if available
    const componentName = instance?.$options?.name || instance?.type?.name || 'Unknown'

    // Log to monitoring
    logErrorToMonitoring({
      context: `Vue:${componentName}`,
      error,
      severity: 'high',
      metadata: {
        type: 'vue-error',
        info,
        component: componentName,
        url: window.location.href
      }
    })

    // In development, show error overlay
    if (isDev) {
      console.warn('[Vue Error] Component:', componentName)
      console.warn('[Vue Error] Info:', info)
    }
  }

  /**
   * Handle navigation errors
   */
  if (router) {
    router.onError((error, to, from) => {
      // Ignore navigation cancelled errors (normal behavior)
      if (error?.message?.includes('Navigation cancelled')) {
        return
      }

      // Ignore duplicate navigation errors
      if (error?.message?.includes('Avoided redundant navigation')) {
        return
      }

      console.error('[Global Handler] Navigation error:', { error, to, from })

      // Log to monitoring
      logErrorToMonitoring({
        context: 'Router:navigation',
        error,
        severity: 'medium',
        metadata: {
          type: 'navigation-error',
          from: from?.fullPath,
          to: to?.fullPath
        }
      })
    })
  }

  /**
   * Handle online/offline events
   */
  window.addEventListener('offline', () => {
    console.warn('[Global Handler] User went offline')
    logErrorToMonitoring({
      context: 'Network:offline',
      error: new Error('User went offline'),
      severity: 'low',
      metadata: {
        type: 'network-status'
      }
    })
  })

  window.addEventListener('online', () => {
    console.log('[Global Handler] User came back online')
  })

  /**
   * Log initialization complete
   */
  console.log('[Global Handler] Error monitoring initialized')
}
