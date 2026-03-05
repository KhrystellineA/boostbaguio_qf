/**
 * Boost Baguio - Offline Support Boot File
 *
 * Initializes:
 * - Offline detection
 * - Data caching service
 * - Pre-caching of essential data
 */

import { initOfflineDetection } from 'src/utils/offline'
import { initCacheService, preCacheEssentials } from 'src/utils/offlineCache'

export default async () => {
  // Initialize offline detection
  initOfflineDetection()

  // Initialize cache service
  initCacheService()

  // Pre-cache essential data in background
  // This doesn't block app initialization
  preCacheEssentials().catch((error) => {
    console.log('[Offline] Pre-cache skipped or failed:', error.message)
  })

  // Add offline class to body when offline
  const { getOnlineStatus, onOnlineStatusChange } = await import('src/utils/offline')

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
  onOnlineStatusChange(() => {
    updateBodyClass()
  })

  console.log('[Offline] Boot complete')
}
