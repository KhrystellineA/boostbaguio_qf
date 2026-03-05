/**
 * Boost Baguio - Offline Data Cache Service
 *
 * Provides:
 * - Cache places, events, jeepneys for offline viewing
 * - Automatic cache management
 * - Cache expiration handling
 * - Sync with server when online
 */

import { LocalStorage } from 'quasar'
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getOnlineStatus, onOnlineStatusChange } from './offline'

const CACHE_CONFIG = {
  places: { key: 'cache-places', ttl: 24 * 60 * 60 * 1000 }, // 24 hours
  events: { key: 'cache-events', ttl: 12 * 60 * 60 * 1000 }, // 12 hours
  jeepneys: { key: 'cache-jeepneys', ttl: 24 * 60 * 60 * 1000 }, // 24 hours
  routes: { key: 'cache-routes', ttl: 24 * 60 * 60 * 1000 } // 24 hours
}

const SAVED_OFFLINE_KEY = 'saved-offline-items'

/**
 * Cache data with timestamp
 * @param {string} type - Data type (places, events, jeepneys, routes)
 * @param {Array} data - Data to cache
 */
export function cacheData(type, data) {
  const config = CACHE_CONFIG[type]
  if (!config) {
    console.error('[Cache] Unknown data type:', type)
    return
  }

  const cacheEntry = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + config.ttl
  }

  LocalStorage.set(config.key, cacheEntry)
  console.log(`[Cache] Cached ${data.length} ${type}`)
}

/**
 * Get cached data if not expired
 * @param {string} type - Data type
 * @returns {Array|null} Cached data or null if expired/missing
 */
export function getCachedData(type) {
  const config = CACHE_CONFIG[type]
  if (!config) return null

  const cacheEntry = LocalStorage.getItem(config.key)
  if (!cacheEntry) return null

  // Check if expired
  if (Date.now() > cacheEntry.expiresAt) {
    console.log(`[Cache] ${type} cache expired`)
    LocalStorage.remove(config.key)
    return null
  }

  return cacheEntry.data
}

/**
 * Get or fetch data (cache-first strategy)
 * @param {string} type - Data type
 * @param {Function} fetchFn - Function to fetch fresh data
 * @returns {Promise<Array>}
 */
export async function getOrFetchData(type, fetchFn) {
  // Try cache first
  const cached = getCachedData(type)
  if (cached) {
    console.log(`[Cache] Using cached ${type}`)
    return cached
  }

  // Fetch fresh data
  try {
    const data = await fetchFn()
    cacheData(type, data)
    return data
  } catch (error) {
    console.error(`[Cache] Failed to fetch ${type}:`, error)
    // Return empty array if offline and no cache
    if (!getOnlineStatus()) {
      console.warn('[Cache] Offline and no cache available')
      return []
    }
    throw error
  }
}

/**
 * Save specific item for offline viewing
 * @param {string} type - Item type
 * @param {string} itemId - Item ID
 * @param {Object} itemData - Item data
 */
export function saveItemForOffline(type, itemId, itemData) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}

  if (!savedItems[type]) {
    savedItems[type] = {}
  }

  savedItems[type][itemId] = {
    ...itemData,
    savedAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  }

  LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)
  console.log(`[Cache] Saved ${type}/${itemId} for offline`)
}

/**
 * Get saved offline item
 * @param {string} type - Item type
 * @param {string} itemId - Item ID
 * @returns {Object|null}
 */
export function getSavedOfflineItem(type, itemId) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}

  if (!savedItems[type] || !savedItems[type][itemId]) {
    return null
  }

  const item = savedItems[type][itemId]

  // Check if expired
  if (Date.now() > item.expiresAt) {
    removeSavedOfflineItem(type, itemId)
    return null
  }

  return item
}

/**
 * Remove saved offline item
 * @param {string} type - Item type
 * @param {string} itemId - Item ID
 */
export function removeSavedOfflineItem(type, itemId) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}

  if (savedItems[type]) {
    delete savedItems[type][itemId]
    LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)
  }
}

/**
 * Get all saved offline items
 * @param {string} type - Optional type filter
 * @returns {Object}
 */
export function getAllSavedOfflineItems(type = null) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}

  if (type) {
    return savedItems[type] || {}
  }

  return savedItems
}

/**
 * Check if item is saved for offline
 * @param {string} type - Item type
 * @param {string} itemId - Item ID
 * @returns {boolean}
 */
export function isSavedForOffline(type, itemId) {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  return !!(savedItems[type] && savedItems[type][itemId])
}

/**
 * Clear expired saved items
 */
export function clearExpiredSavedItems() {
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  let cleared = 0

  for (const type of Object.keys(savedItems)) {
    for (const itemId of Object.keys(savedItems[type])) {
      const item = savedItems[type][itemId]
      if (Date.now() > item.expiresAt) {
        delete savedItems[type][itemId]
        cleared++
      }
    }
  }

  LocalStorage.set(SAVED_OFFLINE_KEY, savedItems)

  if (cleared > 0) {
    console.log(`[Cache] Cleared ${cleared} expired saved items`)
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  Object.values(CACHE_CONFIG).forEach(config => {
    LocalStorage.remove(config.key)
  })
  console.log('[Cache] All cache cleared')
}

/**
 * Clear specific cache type
 * @param {string} type
 */
export function clearCache(type) {
  const config = CACHE_CONFIG[type]
  if (config) {
    LocalStorage.remove(config.key)
    console.log(`[Cache] ${type} cache cleared`)
  }
}

/**
 * Get cache statistics
 * @returns {Object}
 */
export function getCacheStats() {
  const stats = {
    totalCacheSize: 0,
    caches: {}
  }

  // Calculate cache sizes
  for (const [type, config] of Object.entries(CACHE_CONFIG)) {
    const cacheEntry = LocalStorage.getItem(config.key)
    const hasCache = !!cacheEntry
    const isExpired = cacheEntry && Date.now() > cacheEntry.expiresAt

    stats.caches[type] = {
      hasCache,
      isExpired,
      itemCount: cacheEntry?.data?.length || 0,
      cachedAt: cacheEntry?.timestamp,
      expiresAt: cacheEntry?.expiresAt
    }

    if (hasCache) {
      stats.totalCacheSize++
    }
  }

  // Saved items
  const savedItems = LocalStorage.getItem(SAVED_OFFLINE_KEY) || {}
  let totalSavedItems = 0

  for (const type of Object.keys(savedItems)) {
    const count = Object.keys(savedItems[type]).length
    stats.caches[`${type}-saved`] = { count }
    totalSavedItems += count
  }

  stats.totalSavedItems = totalSavedItems

  return stats
}

/**
 * Pre-cache essential data for offline use
 */
export async function preCacheEssentials() {
  if (!getOnlineStatus()) {
    console.log('[Cache] Skipping pre-cache while offline')
    return
  }

  try {
    // Cache places
    const placesSnapshot = await getDocs(collection(db, 'places'))
    const places = placesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    cacheData('places', places)

    // Cache events
    const eventsSnapshot = await getDocs(collection(db, 'events'))
    const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    cacheData('events', events)

    // Cache jeepneys
    const jeepneysSnapshot = await getDocs(collection(db, 'jeepneys'))
    const jeepneys = jeepneysSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    cacheData('jeepneys', jeepneys)

    console.log('[Cache] Pre-cached essential data')
  } catch (error) {
    console.error('[Cache] Pre-cache failed:', error)
  }
}

/**
 * Initialize cache service
 */
export function initCacheService() {
  // Clear expired items on init
  clearExpiredSavedItems()

  // Listen for online status to sync
  onOnlineStatusChange((status) => {
    if (status.isOnline && status.connectionQuality === 'good') {
      // Refresh cache when back online with good connection
      preCacheEssentials()
    }
  })

  // Periodic cleanup
  setInterval(clearExpiredSavedItems, 60 * 60 * 1000) // Every hour

  console.log('[Cache] Service initialized')
}

export default {
  cacheData,
  getCachedData,
  getOrFetchData,
  saveItemForOffline,
  getSavedOfflineItem,
  removeSavedOfflineItem,
  getAllSavedOfflineItems,
  isSavedForOffline,
  clearExpiredSavedItems,
  clearAllCache,
  clearCache,
  getCacheStats,
  preCacheEssentials,
  initCacheService
}
