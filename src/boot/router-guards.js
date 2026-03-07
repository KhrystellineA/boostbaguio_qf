// src/boot/router-guards.js
// Boot file to ensure Firebase auth is ready before app initialization
// Note: Route guards are now handled in src/router/index.js

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