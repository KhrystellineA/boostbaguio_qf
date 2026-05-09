<template>
  <q-layout view="hHh lpR fFf">
    <!-- Admin Header -->
    <AdminHeader
      :notifications="notifications"
      :deciding-id="decidingRequestId"
      :admin-name="adminData.name"
      :admin-email="adminData.email"
      @toggle-drawer="drawer = !drawer"
      @view-profile="viewProfile"
      @logout="logout"
      @approve-request="onApproveRequest"
      @reject-request="onRejectRequest"
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

          <!-- Stats Cards (also act as analytics filters) -->
          <AdminStats
            :stats="stats"
            :active-categories="activeCategories"
            :show-routes="canManageRoutes"
            :show-places="canManagePlaces"
            :show-events="canManageEvents"
            @toggle-category="toggleAnalyticsCategory"
          />

          <!-- Analytics, scoped to whichever filter cards are active -->
          <AnalyticsManagement :categories="activeCategories" />
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

        <ActivityLogsManagement v-else-if="activeMenu === 'activity-logs'" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAdminDashboard } from 'src/composables/useAdminDashboard'
import { approveFeatureRequest, rejectFeatureRequest } from 'src/composables/useFeatureRequests'

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

    // Active analytics filter categories. The four AdminStats cards toggle
    // entries in/out of this array. Defaults to Places; if everything ever
    // gets deselected it falls back to Places to avoid an empty dashboard.
    const activeCategories = ref(['places'])

    const toggleAnalyticsCategory = (cat) => {
      const idx = activeCategories.value.indexOf(cat)
      if (idx >= 0) activeCategories.value.splice(idx, 1)
      else activeCategories.value.push(cat)
      if (activeCategories.value.length === 0) activeCategories.value = ['places']
    }

    // Feature-request approval (super-admin only). The pending list lives on
    // `notifications` from useAdminDashboard, fed by a Firestore subscription.
    const $q = useQuasar()
    const decidingRequestId = ref('')

    const onApproveRequest = async (req) => {
      decidingRequestId.value = req.id
      try {
        await approveFeatureRequest(req)
        $q.notify({
          type: 'positive',
          message: `Approved · ${req.targetName} is now featured`,
          position: 'top',
        })
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: err.message || 'Could not approve request',
          position: 'top',
        })
      } finally {
        decidingRequestId.value = ''
      }
    }

    const onRejectRequest = async (req) => {
      decidingRequestId.value = req.id
      try {
        await rejectFeatureRequest(req)
        $q.notify({
          type: 'info',
          message: `Rejected request for "${req.targetName}"`,
          position: 'top',
        })
      } catch (err) {
        $q.notify({
          type: 'negative',
          message: err.message || 'Could not reject request',
          position: 'top',
        })
      } finally {
        decidingRequestId.value = ''
      }
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
      activeCategories,
      triggerRouteDialog,
      triggerPlaceDialog,
      triggerEventDialog,

      decidingRequestId,

      // Methods
      logout,
      viewProfile,
      onDialogOpened,
      toggleAnalyticsCategory,
      onApproveRequest,
      onRejectRequest,

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

@media (max-width: 700px) {
  .admin-page {
    padding: 4px 12px 20px !important;
  }

  .dashboard-title {
    font-size: 22px;
  }
}
</style>
