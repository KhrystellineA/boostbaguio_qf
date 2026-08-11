/**
 * Offline-mode composable (premium feature).
 *
 * Exposes online/offline state and actions for the UI layer.
 * Delegates actual caching and queue management to the centralized offlineManager utility.
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from 'stores/user-store'
import offlineManager from 'src/utils/offlineManager'

export function useOfflineMode() {
  const userStore = useUserStore()
  const isOnline = ref(offlineManager.getOnlineStatus())

  // Create reactive queue property initialized from manager
  const offlineQueue = ref(offlineManager.getOfflineQueue())

  let cleanupListener = null

  const updateOnlineStatus = (status) => {
    isOnline.value = status.isOnline
    offlineQueue.value = offlineManager.getOfflineQueue()
  }

  const canUseOffline = computed(() => {
    return userStore.isPremium && !isOnline.value
  })

  // Expose simplified APIs for the UI that map to the underlying manager

  const cacheRouteData = async (routeData) => {
    if (!userStore.isPremium) return false
    try {
      offlineManager.saveItemForOffline('routes', routeData.id, routeData)

      // Let service worker know if it exists
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ROUTE',
          payload: routeData,
        })
      }
      return true
    } catch (error) {
      console.error('Error caching route:', error)
      return false
    }
  }

  const getCachedRoutes = () => {
    return offlineManager.getAllSavedOfflineItems('routes')
  }

  const getCachedRoute = (routeId) => {
    return offlineManager.getSavedOfflineItem('routes', routeId)
  }

  const removeCachedRoute = (routeId) => {
    offlineManager.removeSavedOfflineItem('routes', routeId)
    return true
  }

  const clearAllCachedRoutes = () => {
    offlineManager.clearAllSavedItems('routes')
    return true
  }

  const queueForOnline = (request) => {
    offlineManager.addToOfflineQueue(request)
    offlineQueue.value = offlineManager.getOfflineQueue()
  }

  const getCacheSize = async () => {
    const stats = await offlineManager.getOfflineStats()
    return stats.storageUsage
  }

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js')
        console.log('Service Worker registered:', registration)
        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return null
      }
    }
    return null
  }

  onMounted(() => {
    // Listen to changes from the centralized offline manager
    cleanupListener = offlineManager.onOnlineStatusChange(updateOnlineStatus)
    registerServiceWorker()
  })

  onUnmounted(() => {
    if (cleanupListener) {
      cleanupListener()
    }
  })

  return {
    isOnline,
    canUseOffline,
    offlineQueue,
    cacheRouteData,
    getCachedRoutes,
    getCachedRoute,
    removeCachedRoute,
    clearAllCachedRoutes,
    queueForOnline,
    getCacheSize,
    registerServiceWorker,
  }
}
// --rabbit
