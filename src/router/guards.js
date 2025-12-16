
export function setupAuthGuard(router) {
  router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const adminData = sessionStorage.getItem('adminData')
    
    if (requiresAuth && !adminData) {
      next('/admin/adminlogin')
    } else {
      next()
    }
  })
}