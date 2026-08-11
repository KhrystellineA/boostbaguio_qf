/**
 * Boost Baguio - Offline Support Boot File
 *
 * Initializes:
 * - Offline detection
 * - Data caching service
 * - Pre-caching of essential data
 */

import {
  initOfflineDetection,
  getOnlineStatus,
  onOnlineStatusChange,
  preCacheEssentials,
} from 'src/utils/offlineManager'

export default async () => {
  try {
    // Initialize offline detection
    initOfflineDetection()

    // Cache service is now initialized within initOfflineDetection

    // Pre-cache essential data in background (non-blocking)
    preCacheEssentials().catch((error) => {
      console.log('[Offline] Pre-cache skipped or failed:', error.message)
    })

    // Add offline class to body when offline
    const updateBodyClass = () => {
      if (getOnlineStatus()) {
        document.body.classList.remove('is-offline')
        document.body.classList.add('is-online')
      } else {
        document.body.classList.remove('is-online')
        document.body.classList.add('is-offline')
      }
    }

    // Initial check
    updateBodyClass()

    // Listen for changes
    const cleanup = onOnlineStatusChange(() => {
      updateBodyClass()
    })

    // Cleanup on unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', cleanup)
    }

    console.log('[Offline] Boot complete')
  } catch (error) {
    console.error('[Offline] Boot failed:', error)
    // Don't block app initialization if offline features fail
  }
}
// --rabbit --K
