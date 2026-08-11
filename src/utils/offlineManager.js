/**
 * Boost Baguio - Unified Offline Manager
 *
 * Provides a single source of truth for:
 * - Online/offline status detection & connection quality
 * - Automatic background syncing (queue management)
 * - Firebase data caching (places, events, jeepneys)
 * - User-saved offline items (Saved Routes)
 */

import { LocalStorage } from 'quasar'
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'

const QUEUE_KEY = 'boost-baguio-offline-queue'
const SAVED_OFFLINE_KEY = 'saved-offline-items'
const CACHE_CONFIG = {
  places: { key: 'cache-places', ttl: 24 * 60 * 60 * 1000 },
  events: { key: 'cache-events', ttl: 12 * 60 * 60 * 1000 },
  jeepneys: { key: 'cache-jeepneys', ttl: 24 * 60 * 60 * 1000 },
  routes: { key: 'cache-routes', ttl: 24 * 60 * 60 * 1000 },
}

// State
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
let connectionQuality = 'good' // 'good', 'slow', 'offline'
let listeners = new Set()
let offlineQueue = []

// Safely initialize queue
if (typeof window !== 'undefined') {
  offlineQueue = LocalStorage.getItem(QUEUE_KEY) || []
}

/* ==========================================================================
   Connection & Detection
   ========================================================================== */

export function getOnlineStatus() {
  return isOnline
}

export function getConnectionQuality() {
  return connectionQuality
}

export function isSlowConnection() {
  return connectionQuality === 'slow'
}

export function onOnlineStatusChange(callback) {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function notifyListeners() {
  const status = {
    isOnline,
    connectionQuality,
    timestamp: new Date().toISOString(),
  }
  listeners.forEach((callback) => callback(status))
}

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
    connectionQuality = 'good'
  }
}

function handleOnline() {
  isOnline = true
  updateConnectionQuality()
  notifyListeners()
  announceStatus('Connection restored. You are now online.')
  processOfflineQueue()
  if (connectionQuality === 'good') {
    preCacheEssentials()
  }
}

function handleOffline() {
  isOnline = false
  connectionQuality = 'offline'
  notifyListeners()
  announceStatus('You are now offline. Some features may be unavailable.')
}

function announceStatus(message) {
  if (typeof document === 'undefined') return
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

let connectionCheckInterval = null

export function initOfflineDetection() {
  if (typeof window === 'undefined') return

  updateConnectionQuality()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection) {
    connection.addEventListener('change', () => {
      updateConnectionQuality()
      notifyListeners()
    })
  }

  connectionCheckInterval = setInterval(() => {
    const wasOnline = isOnline
    isOnline = navigator.onLine
    if (wasOnline !== isOnline) {
      if (isOnline) handleOnline()
      else handleOffline()
    } else {
      updateConnectionQuality()
    }
  }, 30000)

  // Clear expired saved items on startup
  clearExpiredSavedItems()
  console.log('[OfflineManager] Initialized')
}

export function cleanupOfflineDetection() {
  if (typeof window === 'undefined') return
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (connection) {
    connection.removeEventListener('change', updateConnectionQuality)
  }
  if (connectionCheckInterval) clearInterval(connectionCheckInterval)
  listeners.clear()
}

/* ==========================================================================
   Action Queue
   ========================================================================== */

export function addToOfflineQueue(action) {
  const queuedAction = {
    ...action,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    retries: 0,
  }
  offlineQueue.push(queuedAction)
  LocalStorage.set(QUEUE_KEY, offlineQueue)
  notifyListeners()
}

export function getOfflineQueue() {
  return offlineQueue
}

export function getQueueLength() {
  return offlineQueue.length
}

export async function processOfflineQueue(processCallback = null) {
  if (!isOnline || offlineQueue.length === 0) return

  const pendingActions = [...offlineQueue]
  offlineQueue = []
  LocalStorage.set(QUEUE_KEY, offlineQueue)

  for (const action of pendingActions) {
    try {
      if (processCallback) {
        await processCallback(action)
      } else if (action.type === 'fetch' && action.url) {
        // Default generic fetch handler for backward compatibility
        await fetch(action.url, {
          method: action.method || 'POST',
          body: action.data ? JSON.stringify(action.data) : null,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      notifyListeners()
    } catch (error) {
      console.error('[OfflineManager] Failed to process queued action:', error)
      if (action.retries < 3) {
        action.retries++
        offlineQueue.push(action)
      }
      LocalStorage.set(QUEUE_KEY, offlineQueue)
    }
  }
  notifyListeners()
}

export function clearOfflineQueue() {
  offlineQueue = []
  LocalStorage.remove(QUEUE_KEY)
  notifyListeners()
}

export function removeFromQueue(actionId) {
  offlineQueue = offlineQueue.filter((action) => action.id !== actionId)
  LocalStorage.set(QUEUE_KEY, offlineQueue)
  notifyListeners()
}

/* ==========================================================================
   General Caching (Firestore Collections)
   ========================================================================== */

export function cacheData(type, data) {
  const config = CACHE_CONFIG[type]
  if (!config) {
    console.error('[OfflineManager] Unknown data type:', type)
    return
  }
  const cacheEntry = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + config.ttl,
  }
  LocalStorage.set(config.key, cacheEntry)
}

export function getCachedData(type) {
  const config = CACHE_CONFIG[type]
  if (!config) return null
  const cacheEntry = LocalStorage.getItem(config.key)
  if (!cacheEntry) return null
  if (Date.now() > cacheEntry.expiresAt) {
    LocalStorage.remove(config.key)
    return null
  }
  return cacheEntry.data
}

export async function getOrFetchData(type, fetchFn) {
  const cached = getCachedData(type)
  if (cached) return cached

  try {
    const data = await fetchFn()
    cacheData(type, data)
    return data
  } catch (error) {
    if (!isOnline) {
      return []
    }
    throw error
  }
}

export function clearCache(type) {
  if (type) {
    const config = CACHE_CONFIG[type]
    if (config) LocalStorage.remove(config.key)
  } else {
    Object.values(CACHE_CONFIG).forEach((c) => LocalStorage.remove(c.key))
  }
}

export async function preCacheEssentials() {
  if (!isOnline) return
  try {
    const placesSnap = await getDocs(collection(db, 'places'))
    cacheData(
      'places',
      placesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    )

    const eventsSnap = await getDocs(collection(db, 'events'))
    cacheData(
      'events',
      eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    )

    const jeepneysSnap = await getDocs(collection(db, 'jeepneys'))
    cacheData(
      'jeepneys',
      jeepneysSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    )
  } catch (error) {
    console.error('[OfflineManager] Pre-cache failed:', error)
  }
}

/* ==========================================================================
   User Saved Items (Saved Routes, Offline Events)
   ========================================================================== */

export function saveItemForOffline(type, itemId, itemData) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  if (!savedItems[type]) savedItems[type] = {}

  savedItems[type][itemId] = {
    ...itemData,
    savedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  }

  // Cap at 50 items per type to avoid quota limits
  const items = Object.entries(savedItems[type])
  if (items.length > 50) {
    items.sort((a, b) => b[1].savedAt - a[1].savedAt)
    const toRemove = items.slice(50)
    toRemove.forEach(([id]) => delete savedItems[type][id])
  }

  LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)
}

export function getSavedOfflineItem(type, itemId) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  if (!savedItems[type] || !savedItems[type][itemId]) return null

  const item = savedItems[type][itemId]
  if (Date.now() > item.expiresAt) {
    removeSavedOfflineItem(type, itemId)
    return null
  }
  return item
}

export function removeSavedOfflineItem(type, itemId) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  if (savedItems[type]) {
    delete savedItems[type][itemId]
    LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)
  }
}

export function getAllSavedOfflineItems(type = null) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  if (type)
    return Object.values(savedItems[type] || {}).filter((item) => Date.now() <= item.expiresAt)

  const all = {}
  Object.keys(savedItems).forEach((t) => {
    all[t] = Object.values(savedItems[t]).filter((item) => Date.now() <= item.expiresAt)
  })
  return all
}

export function isSavedForOffline(type, itemId) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  const item = savedItems[type]?.[itemId]
  if (!item) return false
  if (Date.now() > item.expiresAt) {
    removeSavedOfflineItem(type, itemId)
    return false
  }
  return true
}

export function clearExpiredSavedItems() {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  let cleared = false
  for (const type of Object.keys(savedItems)) {
    for (const itemId of Object.keys(savedItems[type])) {
      if (Date.now() > savedItems[type][itemId].expiresAt) {
        delete savedItems[type][itemId]
        cleared = true
      }
    }
  }
  if (cleared) LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)
}

export function clearAllSavedItems(type = null) {
  if (type) {
    const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
    delete savedItems[type]
    LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)
  } else {
    LocalStorage.remove(SAVED_OFFLINE_KEY)
  }
}

/* ==========================================================================
   Statistics
   ========================================================================== */

export async function getOfflineStats() {
  let storageUsage = null
  if (
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    'estimate' in navigator.storage
  ) {
    const estimate = await navigator.storage.estimate()
    storageUsage = {
      usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2),
      percentageUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2),
    }
  }

  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}

  return {
    isOnline,
    connectionQuality,
    queueLength: offlineQueue.length,
    storageUsage,
    savedCounts: {
      routes: Object.keys(savedItems['routes'] || {}).length,
      places: Object.keys(savedItems['places'] || {}).length,
      events: Object.keys(savedItems['events'] || {}).length,
    },
  }
}

export default {
  getOnlineStatus,
  getConnectionQuality,
  isSlowConnection,
  onOnlineStatusChange,
  initOfflineDetection,
  cleanupOfflineDetection,

  addToOfflineQueue,
  getOfflineQueue,
  getQueueLength,
  processOfflineQueue,
  clearOfflineQueue,
  removeFromQueue,

  cacheData,
  getCachedData,
  getOrFetchData,
  clearCache,
  preCacheEssentials,

  saveItemForOffline,
  getSavedOfflineItem,
  removeSavedOfflineItem,
  getAllSavedOfflineItems,
  isSavedForOffline,
  clearExpiredSavedItems,
  clearAllSavedItems,

  getOfflineStats,
}
// --rabbit
