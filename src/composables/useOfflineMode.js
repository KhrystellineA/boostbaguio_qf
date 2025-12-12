import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from 'stores/user-store'

export function useOfflineMode() {
  const userStore = useUserStore()
  const isOnline = ref(navigator.onLine)
  const offlineQueue = ref([])

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    
    if (isOnline.value && offlineQueue.value.length > 0) {
      processOfflineQueue()
    }
  }

  const canUseOffline = computed(() => {
    return userStore.isPremium && !isOnline.value
  })

  const cacheRouteData = async (routeData) => {
    if (!userStore.isPremium) return false

    try {
      const cachedRoutes = JSON.parse(localStorage.getItem('cachedRoutes') || '[]')
      
      const existingIndex = cachedRoutes.findIndex(r => r.id === routeData.id)
      
      if (existingIndex >= 0) {
        cachedRoutes[existingIndex] = {
          ...routeData,
          cachedAt: new Date().toISOString()
        }
      } else {
        cachedRoutes.push({
          ...routeData,
          cachedAt: new Date().toISOString()
        })
      }

      if (cachedRoutes.length > 50) {
        cachedRoutes.sort((a, b) => 
          new Date(b.cachedAt) - new Date(a.cachedAt)
        )
        cachedRoutes.length = 50
      }

      localStorage.setItem('cachedRoutes', JSON.stringify(cachedRoutes))
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ROUTE',
          payload: routeData
        })
      }

      return true
    } catch (error) {
      console.error('Error caching route:', error)
      return false
    }
  }

  const getCachedRoutes = () => {
    try {
      return JSON.parse(localStorage.getItem('cachedRoutes') || '[]')
    } catch (error) {
      console.error('Error getting cached routes:', error)
      return []
    }
  }

  const getCachedRoute = (routeId) => {
    const routes = getCachedRoutes()
    return routes.find(r => r.id === routeId)
  }

  const removeCachedRoute = (routeId) => {
    try {
      const routes = getCachedRoutes()
      const filtered = routes.filter(r => r.id !== routeId)
      localStorage.setItem('cachedRoutes', JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error removing cached route:', error)
      return false
    }
  }

  const clearAllCachedRoutes = () => {
    try {
      localStorage.removeItem('cachedRoutes')
      return true
    } catch (error) {
      console.error('Error clearing cached routes:', error)
      return false
    }
  }

  const queueForOnline = (request) => {
    offlineQueue.value.push({
      ...request,
      timestamp: Date.now()
    })
    
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue.value))
  }

  const processOfflineQueue = async () => {
    const queue = [...offlineQueue.value]
    
    for (const request of queue) {
      try {
        if (request.type === 'favorite') {
          await fetch(request.url, {
            method: request.method,
            body: JSON.stringify(request.data),
            headers: { 'Content-Type': 'application/json' }
          })
        }
        
        offlineQueue.value = offlineQueue.value.filter(
          r => r.timestamp !== request.timestamp
        )
      } catch (error) {
        console.error('Error processing offline request:', error)
      }
    }

    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue.value))
  }

  const getCacheSize = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
        quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2),
        percentageUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      }
    }
    return null
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
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    try {
      const saved = localStorage.getItem('offlineQueue')
      if (saved) {
        offlineQueue.value = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading offline queue:', error)
    }

    registerServiceWorker()
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
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
    registerServiceWorker
  }
}