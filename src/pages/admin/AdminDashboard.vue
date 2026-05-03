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
      <q-page class="admin-page q-pa-md">
        <!-- Dashboard Content -->
        <div v-if="activeMenu === 'dashboard'">
          <div class="dashboard-header q-mb-lg">
            <div>
              <h4 class="dashboard-title q-my-none">Dashboard Overview</h4>
              <p class="dashboard-subtitle q-mt-xs q-mb-none">
                <span v-if="adminData.role === 'super_admin'"
                  >Full system access — manage all aspects of Boost Baguio</span
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
              <q-card class="activity-card">
                <q-card-section>
                  <div class="row items-center justify-between q-mb-md">
                    <div class="activity-card-title">Recent Activity</div>
                    <q-chip
                      square
                      dense
                      class="activity-card-chip"
                      icon="history"
                      :label="`${recentActivities.length} recent`"
                    />
                  </div>
                  <q-list class="activity-list" separator>
                    <q-item
                      v-for="activity in recentActivities"
                      :key="activity.id"
                      class="activity-item"
                    >
                      <q-item-section avatar>
                        <div class="activity-icon" :class="`activity-icon--${activity.color}`">
                          <q-icon :name="activity.icon" size="18px" />
                        </div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="activity-title">{{ activity.title }}</q-item-label>
                        <q-item-label caption class="activity-time">{{
                          activity.time
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="recentActivities.length === 0" class="activity-empty">
                      <q-item-section class="text-center text-grey-6 q-py-lg">
                        <q-icon name="inbox" size="40px" color="grey-4" />
                        <div class="q-mt-sm text-body2">No recent activity</div>
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
$primary-green: #2e5d3e;
$dark-green: #1b4332;
$app-bg: #f4f5f7;

// Override Quasar primary color to green for admin dashboard
:deep(.text-primary) {
  color: $primary-green !important;
}

:deep(.bg-primary) {
  background-color: $primary-green !important;
}

:deep(.q-btn.bg-primary) {
  background-color: $primary-green !important;
}

:deep(.q-btn.q-btn--primary) {
  background-color: $primary-green !important;
}

:deep(.q-tab--active.text-primary) {
  color: $primary-green !important;
}

:deep(.q-item--active .text-primary) {
  color: $primary-green !important;
}

:deep(.q-item--active.bg-primary) {
  background-color: $primary-green !important;
}

// App background
:deep(.q-layout) {
  background: $app-bg;
}

:deep(.q-page-container) {
  background: $app-bg;
}

.admin-page {
  background: $app-bg;
  min-height: calc(100vh - 96px);
  padding: 8px 20px 24px !important;
}

.dashboard-header {
  padding: 4px 4px 0;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 800;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.dashboard-subtitle {
  font-size: 14px;
  color: #6c757d;
}

.activity-card {
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  :deep(.q-card__section) {
    padding: 22px 24px;
  }
}

.activity-card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1d1d1f;
}

.activity-card-chip {
  background: rgba($primary-green, 0.08);
  color: $primary-green;
  font-weight: 600;
  border-radius: 999px;

  :deep(.q-icon) {
    color: $primary-green;
  }
}

.activity-list {
  :deep(.q-separator) {
    background: rgba(0, 0, 0, 0.04);
  }
}

.activity-item {
  border-radius: 12px;
  padding: 12px 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #f9fafb;
  }
}

.activity-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($primary-green, 0.1);
  color: $primary-green;

  &--green {
    background: rgba(46, 93, 62, 0.12);
    color: $primary-green;
  }
  &--blue {
    background: rgba(33, 150, 243, 0.12);
    color: #1976d2;
  }
  &--red {
    background: rgba(244, 67, 54, 0.12);
    color: #d32f2f;
  }
  &--purple {
    background: rgba(149, 117, 205, 0.15);
    color: #6a3fb5;
  }
  &--grey {
    background: rgba(0, 0, 0, 0.06);
    color: #6c757d;
  }
  &--teal {
    background: rgba(0, 150, 136, 0.12);
    color: #00897b;
  }
  &--orange {
    background: rgba(255, 152, 0, 0.12);
    color: #e67e00;
  }
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.activity-time {
  font-size: 12px;
  color: #9aa0a6;
  margin-top: 2px;
}

@media (max-width: 700px) {
  .admin-page {
    padding: 4px 12px 20px !important;
  }

  .dashboard-title {
    font-size: 22px;
  }
}
</style>
