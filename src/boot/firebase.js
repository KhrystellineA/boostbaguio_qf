import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAllxHJVBHgH3P70gfCqV4494t4ssARbig",
  authDomain: "baguioboost.firebaseapp.com",
  projectId: "baguioboost",
  storageBucket: "baguioboost.firebasestorage.app",
  messagingSenderId: "851799020380",
  appId: "1:851799020380:web:a89dc01ea4472b54a2e799",
  measurementId: "G-CBC0ZZPBDX"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const storage = getStorage(app)

// =========================================
// MODERN OFFLINE PERSISTENCE (No deprecation warnings!)
// =========================================
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    cacheSizeBytes: 50 * 1024 * 1024, 
    tabManager: persistentMultipleTabManager() 
  })
})

console.log('[Firebase] ✅ Offline persistence enabled (modern method)')

export default boot(({ app }) => {
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
})

export { auth, db, storage }