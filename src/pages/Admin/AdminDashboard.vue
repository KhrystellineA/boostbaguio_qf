<template>
  <q-layout view="hHh lpR fFf">
    <!-- Admin Header -->
    <AdminHeader
      :notifications-count="notifications.length"
      :admin-name="adminData.name"
      :admin-email="adminData.email"
      @toggle-drawer="drawer = !drawer"
      @view-profile="viewProfile"
      @logout="logout"
    />

    <!-- Admin Sidebar -->
    <AdminSidebar
      v-model="drawer"
      :active-menu="activeMenu"
      :admin-data="adminData"
      @update:active-menu="activeMenu = $event"
    />

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Dashboard Content -->
        <div v-if="activeMenu === 'dashboard'">
          <div class="row q-mb-md">
            <div class="col">
              <h4 class="q-my-none text-primary">Dashboard Overview</h4>
              <p class="text-grey-7 q-mb-none">
                <span v-if="adminData.role === 'super_admin'"
                  >Full system access - Manage all aspects</span
                >
                <span v-else-if="adminData.role === 'places_admin'"
                  >Manage tourist spots, restaurants, hotels, and other places</span
                >
                <span v-else-if="adminData.role === 'routes_admin'"
                  >Manage jeepney routes and options</span
                >
                <span v-else-if="adminData.role === 'events_admin'"
                  >Manage events and festivals</span
                >
                <span v-else>Welcome back, {{ adminData.name }}!</span>
              </p>
            </div>
          </div>

          <!-- Stats Cards -->
          <AdminStats
            :stats="stats"
            :show-routes="canManageRoutes"
            :show-places="canManagePlaces"
            :show-events="canManageEvents"
          />

          <!-- Recent Activity -->
          <div class="row q-mt-md">
            <div class="col-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Recent Activity</div>
                  <q-list separator>
                    <q-item v-for="activity in recentActivities" :key="activity.id">
                      <q-item-section avatar>
                        <q-icon :name="activity.icon" :color="activity.color" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ activity.title }}</q-item-label>
                        <q-item-label caption>{{ activity.time }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Management Components -->
        <JeepneyManagement
          v-else-if="activeMenu === 'routes'"
          :open-dialog="triggerRouteDialog"
          @dialog-opened="onDialogOpened('route')"
        />

        <PlacesManagement
          v-else-if="activeMenu === 'places'"
          :open-dialog="triggerPlaceDialog"
          @dialog-opened="onDialogOpened('place')"
        />

        <EventsManagement
          v-else-if="activeMenu === 'events'"
          :open-dialog="triggerEventDialog"
          @dialog-opened="onDialogOpened('event')"
        />

        <PhotosManagement v-else-if="activeMenu === 'photos'" />

        <AdminsManagement v-else-if="activeMenu === 'admins'" />

        <AnalyticsManagement v-else-if="activeMenu === 'analytics'" />

        <ActivityLogsManagement v-else-if="activeMenu === 'activity-logs'" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useAdminDashboard } from 'src/composables/useAdminDashboard'

// Import admin components
import AdminHeader from 'src/components/admin/AdminHeader.vue'
import AdminSidebar from 'src/components/admin/AdminSidebar.vue'
import AdminStats from 'src/components/admin/AdminStats.vue'
import JeepneyManagement from 'src/components/admin/JeepneyManagement.vue'
import PlacesManagement from 'src/components/admin/PlacesManagement.vue'
import EventsManagement from 'src/components/admin/EventsManagement.vue'
import AdminsManagement from 'src/components/admin/AdminsManagement.vue'
import PhotosManagement from 'src/components/admin/PhotosManagement.vue'
import AnalyticsManagement from 'src/components/admin/AnalyticsManagement.vue'
import ActivityLogsManagement from 'src/components/admin/ActivityLogsManagement.vue'

export default defineComponent({
  name: 'AdminDashboard',

  components: {
    AdminHeader,
    AdminSidebar,
    AdminStats,
    JeepneyManagement,
    PlacesManagement,
    EventsManagement,
    AdminsManagement,
    PhotosManagement,
    AnalyticsManagement,
    ActivityLogsManagement,
  },

  setup() {
    // Use the composable
    const {
      drawer,
      activeMenu,
      adminData,
      stats,
      notifications,
      loading,
      loadStats,
      logout,
      viewProfile,
    } = useAdminDashboard()

    // Dialog triggers
    const triggerRouteDialog = ref(false)
    const triggerPlaceDialog = ref(false)
    const triggerEventDialog = ref(false)

    // Recent activities
    const recentActivities = ref([])

    // Load recent activity
    const loadRecentActivity = async () => {
      try {
        const { getRecentActivityLogs } = await import('src/utils/activityLogger')
        const logs = await getRecentActivityLogs(10)

        recentActivities.value = logs.map((log) => ({
          id: log.id,
          title: log.description,
          time: formatRelativeTime(log.timestamp),
          icon: getActivityIcon(log.action),
          color: getActionColor(log.action),
        }))
      } catch (error) {
        console.error('[AdminDashboard] Error loading recent activity:', error)
      }
    }

    // Format relative time
    const formatRelativeTime = (timestamp) => {
      if (!timestamp) return ''
      const date = timestamp.toDate()
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    }

    // Get activity icon
    const getActivityIcon = (action) => {
      const icons = {
        create: 'add_circle',
        update: 'edit',
        delete: 'delete',
        bulk_delete: 'delete_sweep',
        login: 'login',
        logout: 'logout',
        export: 'download',
        import: 'upload_file',
      }
      return icons[action] || 'info'
    }

    // Get action color
    const getActionColor = (action) => {
      const colors = {
        create: 'green',
        update: 'blue',
        delete: 'red',
        bulk_delete: 'red',
        login: 'purple',
        logout: 'grey',
        export: 'teal',
        import: 'orange',
      }
      return colors[action] || 'grey'
    }

    // Handle dialog opened
    const onDialogOpened = (type) => {
      console.log('[AdminDashboard] Dialog opened:', type)
    }

    // Computed permissions
    const canManageRoutes = computed(() => {
      return (
        adminData.value.role === 'super_admin' ||
        adminData.value.role === 'routes_admin' ||
        adminData.value.permissions?.includes('routes:write') ||
        adminData.value.permissions?.includes('super_admin:all') ||
        false
      )
    })

    const canManagePlaces = computed(() => {
      return (
        adminData.value.role === 'super_admin' ||
        adminData.value.role === 'places_admin' ||
        adminData.value.permissions?.includes('places:write') ||
        adminData.value.permissions?.includes('super_admin:all') ||
        false
      )
    })

    const canManageEvents = computed(() => {
      return (
        adminData.value.role === 'super_admin' ||
        adminData.value.role === 'events_admin' ||
        adminData.value.permissions?.includes('events:write') ||
        adminData.value.permissions?.includes('super_admin:all') ||
        false
      )
    })

    // Load data on mount
    onMounted(async () => {
      if (!loading.value) {
        await loadStats()
        await loadRecentActivity()
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
      recentActivities,
      triggerRouteDialog,
      triggerPlaceDialog,
      triggerEventDialog,

      // Methods
      logout,
      viewProfile,
      onDialogOpened,

      // Computed
      canManageRoutes,
      canManagePlaces,
      canManageEvents,
    }
  },
})
</script>

<style lang="scss" scoped>
// Override Quasar primary color to green for admin dashboard
:deep(.text-primary) {
  color: #2e5d3e !important;
}

:deep(.bg-primary) {
  background-color: #2e5d3e !important;
}

:deep(.q-btn.bg-primary) {
  background-color: #2e5d3e !important;
}

:deep(.q-btn.q-btn--primary) {
  background-color: #2e5d3e !important;
}

:deep(.q-tab--active.text-primary) {
  color: #2e5d3e !important;
}

:deep(.q-item--active .text-primary) {
  color: #2e5d3e !important;
}

:deep(.q-item--active.bg-primary) {
  background-color: #2e5d3e !important;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
