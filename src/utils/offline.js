/**
 * Boost Baguio - Offline Detection & Management Utility
 *
 * Provides:
 * - Online/offline status detection
 * - Connection quality monitoring
 * - Offline event handling
 * - Queue management for offline actions
 */

import { LocalStorage } from 'quasar'

const QUEUE_KEY = 'boost-baguio-offline-queue'

// State
let isOnline = navigator.onLine
let connectionQuality = 'good' // 'good', 'slow', 'offline'
let listeners = new Set()
let offlineQueue = LocalStorage.getItem(QUEUE_KEY) || []

/**
 * Get current online status
 * @returns {boolean}
 */
export function getOnlineStatus() {
  return isOnline
}

/**
 * Get connection quality
 * @returns {string} 'good', 'slow', or 'offline'
 */
export function getConnectionQuality() {
  return connectionQuality
}

/**
 * Check if connection is slow
 * @returns {boolean}
 */
export function isSlowConnection() {
  return connectionQuality === 'slow'
}

/**
 * Add listener for online/offline events
 * @param {Function} callback - Function to call on status change
 * @returns {Function} Cleanup function
 */
export function onOnlineStatusChange(callback) {
  listeners.add(callback)

  return () => {
    listeners.delete(callback)
  }
}

/**
 * Notify all listeners of status change
 */
function notifyListeners() {
  const status = {
    isOnline,
    connectionQuality,
    timestamp: new Date().toISOString()
  }

  listeners.forEach(callback => callback(status))
}

/**
 * Update connection quality based on Network Information API
 */
function updateConnectionQuality() {
  if (!isOnline) {
    connectionQuality = 'offline'
    return
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection

  if (connection) {
    const effectiveType = connection.effectiveType
    const downlink = connection.downlink

    if (effectiveType === '4g' && downlink > 5) {
      connectionQuality = 'good'
    } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 5)) {
      connectionQuality = 'slow'
    } else {
      connectionQuality = 'good'
    }
  } else {
    connectionQuality = 'good' // Default to good if API not available
  }
}

/**
 * Handle online event
 */
function handleOnline() {
  isOnline = true
  updateConnectionQuality()
  notifyListeners()

  // Announce to screen readers
  announceStatus('Connection restored. You are now online.')

  // Process offline queue
  processOfflineQueue()
}

/**
 * Handle offline event
 */
function handleOffline() {
  isOnline = false
  connectionQuality = 'offline'
  notifyListeners()

  // Announce to screen readers
  announceStatus('You are now offline. Some features may be unavailable.')
}

/**
 * Announce status to screen readers
 * @param {string} message
 */
function announceStatus(message) {
  const existing = document.getElementById('offline-status-announcement')
  if (existing) {
    existing.remove()
  }

  const announcement = document.createElement('div')
  announcement.id = 'offline-status-announcement'
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.remove()
    }
  }, 10000)
}

/**
 * Add action to offline queue
 * @param {Object} action - Action to queue
 * @param {string} action.type - Action type
 * @param {Object} action.payload - Action data
 * @param {string} action.endpoint - API endpoint
 */
export function addToOfflineQueue(action) {
  const queuedAction = {
    ...action,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    retries: 0
  }

  offlineQueue.push(queuedAction)
  LocalStorage.set(QUEUE_KEY, offlineQueue)

  notifyListeners()
}

/**
 * Get offline queue
 * @returns {Array}
 */
export function getOfflineQueue() {
  return offlineQueue
}

/**
 * Get queue length
 * @returns {number}
 */
export function getQueueLength() {
  return offlineQueue.length
}

/**
 * Process offline queue when back online
 * @param {Function} processCallback - Function to process each action
 */
export async function processOfflineQueue(processCallback) {
  if (!isOnline || offlineQueue.length === 0) {
    return
  }

  const pendingActions = [...offlineQueue]
  offlineQueue = []
  LocalStorage.set(QUEUE_KEY, offlineQueue)

  for (const action of pendingActions) {
    try {
      if (processCallback) {
        await processCallback(action)
      }
      // Action processed successfully
      notifyListeners()
    } catch (error) {
      console.error('[Offline] Failed to process queued action:', error)
      // Re-queue failed actions (max 3 retries)
      if (action.retries < 3) {
        action.retries++
        offlineQueue.push(action)
      }
      LocalStorage.set(QUEUE_KEY, offlineQueue)
    }
  }

  notifyListeners()
}

/**
 * Clear offline queue
 */
export function clearOfflineQueue() {
  offlineQueue = []
  LocalStorage.remove(QUEUE_KEY)
  notifyListeners()
}

/**
 * Remove specific action from queue
 * @param {string} actionId
 */
export function removeFromQueue(actionId) {
  offlineQueue = offlineQueue.filter(action => action.id !== actionId)
  LocalStorage.set(QUEUE_KEY, offlineQueue)
  notifyListeners()
}

/**
 * Get offline statistics
 * @returns {Object}
 */
export function getOfflineStats() {
  const savedPlaces = LocalStorage.getItem('saved-offline-places') || []
  const savedEvents = LocalStorage.getItem('saved-offline-events') || []

  return {
    savedPlacesCount: savedPlaces.length,
    savedEventsCount: savedEvents.length,
    queuedActionsCount: offlineQueue.length,
    lastSyncTime: LocalStorage.getItem('last-sync-time'),
    isOfflineMode: !isOnline
  }
}

/**
 * Initialize offline detection
 */
export function initOfflineDetection() {
  // Set initial status
  updateConnectionQuality()

  // Add event listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Listen for connection changes
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection) {
    connection.addEventListener('change', () => {
      updateConnectionQuality()
      notifyListeners()
    })
  }

  // Check connection periodically
  setInterval(() => {
    const wasOnline = isOnline
    isOnline = navigator.onLine
    if (wasOnline !== isOnline) {
      if (isOnline) {
        handleOnline()
      } else {
        handleOffline()
      }
    } else {
      updateConnectionQuality()
    }
  }, 30000) // Check every 30 seconds

  console.log('[Offline] Detection initialized')
}

/**
 * Cleanup offline detection
 */
export function cleanupOfflineDetection() {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection) {
    connection.removeEventListener('change', updateConnectionQuality)
  }

  listeners.clear()
}

export default {
  getOnlineStatus,
  getConnectionQuality,
  isSlowConnection,
  onOnlineStatusChange,
  addToOfflineQueue,
  getOfflineQueue,
  getQueueLength,
  processOfflineQueue,
  clearOfflineQueue,
  removeFromQueue,
  getOfflineStats,
  initOfflineDetection,
  cleanupOfflineDetection
}
