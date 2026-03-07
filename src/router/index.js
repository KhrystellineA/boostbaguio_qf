import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useUserStore } from 'stores/user-store'
import { checkIsAdmin, getAdminRole } from 'src/composables/useAdminClaims'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })


  Router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()

    if (userStore.loading) {
      await userStore.initAuth()
    }

    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      next('/login')
      return
    }

    if (to.meta.requiresPremium && !userStore.isPremium) {
      next('/account')
      return
    }

    if (to.path === '/login' && userStore.isAuthenticated) {
      // Check if admin and redirect to admin dashboard
      // Only check if user is authenticated
      try {
        const isAdmin = await checkIsAdmin()
        if (isAdmin) {
          next('/admin/dashboard')
          return
        }
      } catch (error) {
        console.warn('[Router] Error checking admin status:', error)
      }
      next('/')
      return
    }

    // Check admin routes
    if (to.meta.requiresAdmin) {
      try {
        const isAdmin = await checkIsAdmin()

        if (!isAdmin) {
          // Not an admin - redirect to appropriate login
          if (userStore.isAuthenticated) {
            // Regular user trying to access admin area
            next('/')
          } else {
            // Not logged in at all
            next('/admin/adminlogin')
          }
          return
        }

        // Store admin role in memory for the session (not sessionStorage)
        const adminRole = await getAdminRole()
        if (adminRole) {
          // Make role available to components via router meta
          to.meta.adminRole = adminRole
        }
      } catch (error) {
        console.error('[Router] Error checking admin access:', error)
        // If there's an error checking admin, redirect to home for safety
        next('/')
        return
      }
    }

    next()
  })

  return Router
})