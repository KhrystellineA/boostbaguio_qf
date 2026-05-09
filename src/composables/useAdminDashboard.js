/**
 * Composable for AdminDashboard logic and state management
 * @module useAdminDashboard
 */

import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useQuasar } from 'quasar'
import { auth, db } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { checkIsAdmin, getAdminRole, getPermissions } from 'src/composables/useAdminClaims'
import { watchPendingRequests } from 'src/composables/useFeatureRequests'

/**
 * @typedef {Object} AdminData
 * @property {string} uid - User ID
 * @property {string} email - Admin email
 * @property {string} name - Admin name
 * @property {string|null} role - Admin role
 * @property {string[]} permissions - Array of permissions
 */

/**
 * @typedef {Object} DashboardStats
 * @property {number} routes - Number of routes
 * @property {number} places - Number of places
 * @property {number} events - Number of events
 * @property {number} admins - Number of admins
 */

/**
 * @typedef {Object} UseAdminDashboardReturn
 * @property {import('vue').Ref<boolean>} drawer - Sidebar drawer state
 * @property {import('vue').Ref<string>} activeMenu - Current active menu
 * @property {import('vue').Ref<AdminData>} adminData - Admin user data
 * @property {import('vue').Ref<DashboardStats>} stats - Dashboard statistics
 * @property {import('vue').Ref<Array>} notifications - Pending feature requests (super-admin only)
 * @property {import('vue').Ref<boolean>} loading - Loading state
 * @property {Function} loadStats - Load dashboard statistics
 * @property {Function} logout - Sign out admin
 * @property {Function} viewProfile - View admin profile
 */

/**
 * Composable for AdminDashboard logic
 * @returns {UseAdminDashboardReturn}
 */
export function useAdminDashboard() {
  const $q = useQuasar()

  // State
  const drawer = ref(true)
  const activeMenu = ref('dashboard')
  const adminData = ref({
    uid: '',
    email: '',
    name: 'Admin',
    role: null,
    permissions: [],
  })
  const stats = ref({
    routes: 0,
    places: 0,
    events: 0,
    admins: 0,
  })
  const notifications = ref([])
  const loading = ref(true)
  const isSuperAdmin = computed(() => adminData.value.role === 'super_admin')
  let unsubscribePendingRequests = null

  // Load admin data from Firestore
  const loadAdminData = async () => {
    try {
      const isAdmin = await checkIsAdmin()

      if (!isAdmin) {
        $q.notify({
          type: 'negative',
          message: 'Admin access required',
          position: 'top',
        })
        return false
      }

      const user = auth.currentUser
      if (!user) return false

      const adminDoc = await getDocs(collection(db, 'admins'))
      const admin = adminDoc.docs.find((doc) => doc.id === user.uid)

      if (admin?.exists()) {
        const data = admin.data()
        adminData.value = {
          uid: user.uid,
          email: data.email || user.email || '',
          name: data.name || user.displayName || 'Admin',
          role: (await getAdminRole()) || data.role || '',
          permissions: (await getPermissions()) || data.permissions || [],
        }

        // Cache in sessionStorage for quick access
        sessionStorage.setItem('adminData', JSON.stringify(adminData.value))
      }

      return true
    } catch (error) {
      console.error('[AdminDashboard] Error loading admin data:', error)
      return false
    }
  }

  // Load dashboard statistics
  const loadStats = async () => {
    try {
      const [routesSnap, placesSnap, eventsSnap, adminsSnap] = await Promise.all([
        getDocs(collection(db, 'jeepneys')),
        getDocs(collection(db, 'places')),
        getDocs(collection(db, 'events')),
        getDocs(collection(db, 'admins')),
      ])

      stats.value = {
        routes: routesSnap.size,
        places: placesSnap.size,
        events: eventsSnap.size,
        admins: adminsSnap.size,
      }
    } catch (error) {
      console.error('[AdminDashboard] Error loading stats:', error)
    }
  }

  // Logout
  const logout = async () => {
    try {
      await signOut(auth)
      sessionStorage.removeItem('adminData')
      sessionStorage.removeItem('adminRole')

      $q.notify({
        type: 'info',
        message: 'Signed out successfully',
        position: 'top',
      })
    } catch (error) {
      console.error('[AdminDashboard] Logout error:', error)
    }
  }

  // View profile
  const viewProfile = () => {
    $q.notify({
      type: 'info',
      message: 'Profile feature coming soon',
      position: 'top',
    })
  }

  // Initialize
  onMounted(async () => {
    loading.value = true
    const success = await loadAdminData()
    if (success) {
      await loadStats()
      // Super admins receive a live feed of pending feature requests so they
      // can approve / reject from the header notifications dropdown.
      if (isSuperAdmin.value) {
        unsubscribePendingRequests = watchPendingRequests((list) => {
          notifications.value = list
        })
      }
    }
    loading.value = false
  })

  onBeforeUnmount(() => {
    if (unsubscribePendingRequests) {
      unsubscribePendingRequests()
      unsubscribePendingRequests = null
    }
  })

  return {
    // State
    drawer,
    activeMenu,
    adminData,
    stats,
    notifications,
    loading,

    // Methods
    loadStats,
    logout,
    viewProfile,
  }
}
