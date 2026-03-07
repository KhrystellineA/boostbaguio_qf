/**
 * Composable for AdminDashboard logic
 */

import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { auth, db } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import { checkIsAdmin, getAdminRole, getPermissions } from 'src/composables/useAdminClaims'

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
    permissions: []
  })
  const stats = ref({
    routes: 0,
    places: 0,
    events: 0,
    admins: 0
  })
  const notifications = ref([])
  const loading = ref(true)

  // Load admin data from Firestore
  const loadAdminData = async () => {
    try {
      const isAdmin = await checkIsAdmin()
      
      if (!isAdmin) {
        $q.notify({
          type: 'negative',
          message: 'Admin access required',
          position: 'top'
        })
        return false
      }

      const user = auth.currentUser
      if (!user) return false

      const adminDoc = await getDocs(collection(db, 'admins'))
      const admin = adminDoc.docs.find(doc => doc.id === user.uid)
      
      if (admin?.exists()) {
        const data = admin.data()
        adminData.value = {
          uid: user.uid,
          email: data.email || user.email || '',
          name: data.name || user.displayName || 'Admin',
          role: await getAdminRole() || data.role || '',
          permissions: await getPermissions() || data.permissions || []
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
        position: 'top'
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
      position: 'top'
    })
  }

  // Toggle drawer
  const toggleDrawer = () => {
    drawer.value = !drawer.value
  }

  // Initialize
  onMounted(async () => {
    loading.value = true
    const success = await loadAdminData()
    if (success) {
      await loadStats()
    }
    loading.value = false
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
    loadAdminData,
    loadStats,
    logout,
    viewProfile,
    toggleDrawer,
  }
}
