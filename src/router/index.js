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

  // Update meta tags after navigation
  Router.afterEach((to) => {
    // Update document title
    const title = to.meta?.title
    if (title) {
      document.title = title
    }

    // Update meta description
    const description = to.meta?.description
    if (description) {
      updateMetaTag('name', 'description', description)
    }

    // Update Open Graph tags
    const url = 'https://boost-baguio.web.app' + to.path
    const ogImage = to.meta?.ogImage || 'https://boost-baguio.web.app/og-image.png'

    updateMetaTag('property', 'og:title', to.meta?.title || 'Boost Baguio')
    updateMetaTag('property', 'og:description', description || '')
    updateMetaTag('property', 'og:image', ogImage)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:type', 'website')
    updateMetaTag('property', 'og:site_name', 'Boost Baguio')

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', to.meta?.title || 'Boost Baguio')
    updateMetaTag('name', 'twitter:description', description || '')
    updateMetaTag('name', 'twitter:image', ogImage)

    // Update canonical URL
    updateCanonicalLink(url)
  })

  return Router
})

/**
 * Helper to update or create a meta tag
 */
function updateMetaTag(attributeType, attributeName, content) {
  let tag = document.querySelector(`meta[${attributeType}="${attributeName}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attributeType, attributeName)
    document.head.appendChild(tag)
  }

  tag.setAttribute('content', content)
}

/**
 * Update or create canonical link
 */
function updateCanonicalLink(href) {
  let link = document.querySelector('link[rel="canonical"]')

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', href)
}
