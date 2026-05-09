/**
 * Auth-readiness boot file.
 *
 * Awaits Firebase Auth's first `onAuthStateChanged` event before resolving
 * so the rest of the app can rely on `auth.currentUser` being settled by the
 * time it mounts. The actual route guards (requiresAuth, requiresAdmin,
 * requiresGuest, requiresPremium) live in src/router/index.js.
 */
import { auth } from './firebase'

/**
 * Helper to wait for auth to be ready
 * @returns {Promise} Resolves with current user or null
 */
const getCurrentUser = () => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      // Already loaded
      resolve(auth.currentUser)
    } else {
      // Wait for auth state to load
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        resolve(user)
      })
    }
  })
}

export default async () => {
  // Wait for auth to initialize before mounting app
  await getCurrentUser()

  console.log('[Router Guards] ✅ Auth initialized, app ready to mount')
}
