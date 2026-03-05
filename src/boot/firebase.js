import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration from environment variables
// Quasar passes these via quasar.config.js > build > env
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
  measurementId: import.meta.env.FIREBASE_MEASUREMENT_ID
}

// Validate required config
const requiredConfigKeys = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
]

const missingConfig = requiredConfigKeys.filter(
  (key) => !import.meta.env[key]
)

if (missingConfig.length > 0) {
  console.error(
    '[Firebase] Missing required environment variables:',
    missingConfig.join(', ')
  )
  console.error(
    '[Firebase] Please ensure these are set in quasar.config.js or your deployment environment'
  )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
    tabManager: persistentMultipleTabManager()
  })
})

export const storage = getStorage(app)

// Export app for any advanced usage
export { app }

// Log initialization status
console.log('[Firebase] ✅ Initialized successfully')
console.log('[Firebase] 📦 Offline persistence enabled (50MB cache)')
console.log('[Firebase] 🗄️ Project ID:', firebaseConfig.projectId || 'NOT CONFIGURED')
