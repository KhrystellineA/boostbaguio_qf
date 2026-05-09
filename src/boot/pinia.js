/**
 * Pinia boot file. Creates a single Pinia instance and registers it with the
 * Vue app. Stores live in src/stores/ (currently just user-store.js).
 */
import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'

export default boot(({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
})
