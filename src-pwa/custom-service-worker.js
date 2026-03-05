/* eslint-env serviceworker */

/*
 * Boost Baguio - Custom Service Worker
 * Enhanced caching strategies for optimal performance
 */

import { clientsClaim, setCacheNameDetails } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// Skip waiting and claim clients immediately
self.skipWaiting()
clientsClaim()

// Custom cache names for better organization
setCacheNameDetails({
  prefix: 'boost-baguio',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime'
})

// Precache and route all assets from build
precacheAndRoute(self.__WB_MANIFEST)

// Clean up old caches
cleanupOutdatedCaches()

// ============================================
// Runtime Caching Strategies
// ============================================

// 1. Google Fonts - Cache First
registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
)

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
)

// 2. Images - Cache First with fallback
registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg|webp|avif|ico)$/,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
)

// 3. Firebase Storage - Network First with cache fallback
registerRoute(
  /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
  new NetworkFirst({
    cacheName: 'firebase-storage-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
      })
    ]
  })
)

// 4. Cloudinary Images - Cache First
registerRoute(
  /^https:\/\/res\.cloudinary\.com\/.*/i,
  new CacheFirst({
    cacheName: 'cloudinary-images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      })
    ]
  })
)

// 5. API Calls - Network First with cache fallback
registerRoute(
  /^https:\/\/.*\.firebaseio\.com\/.*/i,
  new NetworkFirst({
    cacheName: 'firebase-api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 5 // 5 minutes
      })
    ]
  })
)

// 6. Static Assets (JS/CSS) - Cache First
registerRoute(
  /\.(?:js|css|woff|woff2|ttf|otf|eot)$/,
  new CacheFirst({
    cacheName: 'static-assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
)

// 7. Offline Pages - Network First
registerRoute(
  ({ request, url }) =>
    request.method === 'GET' &&
    !url.pathname.startsWith('/api') &&
    !/\.(?:png|jpg|jpeg|svg|gif|css|js|woff|woff2)$/.test(url.pathname),
  new NetworkFirst({
    cacheName: 'pages-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 // 1 day
      })
    ]
  })
)

// ============================================
// Background Sync for Offline Actions
// ============================================

// Register background sync for offline form submissions
const bgSyncPlugin = new BackgroundSyncPlugin('boostBaguioQueue', {
  maxRetentionTime: 24 * 60 // Retry for 24 hours
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/save'),
  new NetworkFirst({
    cacheName: 'api-save-cache',
    plugins: [bgSyncPlugin]
  }),
  'POST'
)

// ============================================
// Navigation Route (SPA Fallback)
// ============================================

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  )
}

// ============================================
// Service Worker Messages
// ============================================

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  // Handle cache cleanup requests
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        if (cacheName.startsWith('boost-baguio-')) {
          caches.delete(cacheName)
        }
      })
    })
  }
})

// ============================================
// Push Notifications (Optional)
// ============================================

self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'New notification from Boost Baguio',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    }
    event.waitUntil(
      self.registration.showNotification(data.title || 'Boost Baguio', options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})
