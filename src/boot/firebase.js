import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration from environment variables
// Using VITE_ prefix as defined in .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate required config
const requiredConfigKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
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
    '[Firebase] Please check your .env file'
  )
  // Don't throw - let app continue in case of partial config
}

// Initialize Firebase
let app, auth, db, storage

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig)
    
    // Initialize services
    auth = getAuth(app)
    
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
        tabManager: persistentMultipleTabManager()
      })
    })
    
    storage = getStorage(app)
    
    console.log('[Firebase] ✅ Initialized successfully')
    console.log('[Firebase] 📦 Offline persistence enabled (50MB cache)')
    console.log('[Firebase] 🗄️ Project ID:', firebaseConfig.projectId || 'NOT CONFIGURED')
  } else {
    console.warn('[Firebase] ⚠️ Firebase not configured - app will run in limited mode')
  }
} catch (error) {
  console.error('[Firebase] ❌ Initialization failed:', error.message)
}

// Export services (may be undefined if not configured)
export { app, auth, db, storage }
