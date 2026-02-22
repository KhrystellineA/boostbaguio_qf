import { auth, db, storage } from 'src/boot/firebase'

/**
 * Firebase Composable
 * 
 * Provides access to Firebase services in a Vue 3 composable pattern.
 * This is the recommended way to access Firebase in Vue 3 components.
 * 
 * @example
 * // In a Vue component
 * import { useFirebase } from 'src/composables/useFirebase'
 * 
 * export default defineComponent({
 *   setup() {
 *     const { auth, db, storage } = useFirebase()
 *     // Use auth, db, storage directly
 *   }
 * })
 */
export function useFirebase() {
  return {
    auth,
    db,
    storage
  }
}

/**
 * Auth Composable
 * 
 * Provides authentication-related utilities.
 * 
 * @example
 * const { currentUser, isAuthenticated, loading } = useAuth()
 */
export function useAuth() {
  const { auth } = useFirebase()
  
  return {
    auth,
    get currentUser() {
      return auth.currentUser
    },
    get isAuthenticated() {
      return !!auth.currentUser
    },
    get loading() {
      // Auth state is being determined
      return auth.currentUser === null && auth._currentUserRecalculated === undefined
    }
  }
}

/**
 * Firestore Composable
 * 
 * Provides Firestore-related utilities.
 * 
 * @example
 * const { db } = useFirestore()
 */
export function useFirestore() {
  const { db } = useFirebase()
  return { db }
}

/**
 * Storage Composable
 * 
 * Provides Storage-related utilities.
 * 
 * @example
 * const { storage } = useStorage()
 */
export function useStorage() {
  const { storage } = useFirebase()
  return { storage }
}

export default useFirebase
