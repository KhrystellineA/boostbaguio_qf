// src/boot/router-guards.js
// FIXED: Waits for Firebase auth to be ready

import { auth } from './firebase'

// Helper to wait for auth to be ready
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

export default ({ router }) => {
  router.beforeEach(async (to, from, next) => {
    // ✅ WAIT for auth to be ready
    const currentUser = await getCurrentUser()
    
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

    // Check if user is admin (from sessionStorage)
    const adminRole = sessionStorage.getItem('adminRole')
    const isAdmin = !!adminRole

    console.log('[Router Guard]', {
      path: to.path,
      currentUser: !!currentUser,
      userEmail: currentUser?.email,
      isAdmin,
      requiresAuth,
      requiresGuest,
      requiresAdmin
    })

    // GUEST ONLY ROUTES (login/signup pages)
    if (requiresGuest && currentUser) {
      // If user is logged in and tries to access login page
      if (isAdmin) {
        console.log('[Router Guard] Admin logged in, redirect to admin dashboard')
        return next('/admin/dashboard')
      } else {
        console.log('[Router Guard] User logged in, redirect to home')
        return next('/')
      }
    }

    // ROUTES REQUIRING AUTHENTICATION
    if (requiresAuth && !currentUser) {
      console.log('[Router Guard] Auth required but no user, redirect to login')
      
      // Redirect to appropriate login page
      if (requiresAdmin) {
        return next('/admin/adminlogin')
      } else {
        return next('/login')
      }
    }

    // ADMIN-ONLY ROUTES (admin dashboard, etc)
    if (requiresAdmin) {
      if (!isAdmin) {
        console.log('[Router Guard] Admin route but user is not admin')
        
        // If regular user tries to access admin routes
        if (currentUser) {
          // Regular user trying to access admin area - redirect to home
          return next('/')
        } else {
          // Not logged in at all - redirect to admin login
          return next('/admin/adminlogin')
        }
      }
    }

    // All checks passed
    console.log('[Router Guard] ✅ All checks passed, proceeding to route')
    next()
  })
}