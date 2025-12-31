import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { useUserStore } from 'stores/user-store'

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
      next('/auth')
      return
    }

    if (to.meta.requiresPremium && !userStore.isPremium) {
      next('/account')
      return
    }

    if (to.path === '/auth' && userStore.isAuthenticated) {
      next('/')
      return
    }

    next()
  })

  return Router
})