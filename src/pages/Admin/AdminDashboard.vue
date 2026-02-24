<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" class="q-mr-sm" />
        <q-toolbar-title class="flex items-center">
          <q-icon name="directions_bus" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Boost Baguio</span>
          <q-badge color="yellow" text-color="black" class="q-ml-sm">Admin</q-badge>
        </q-toolbar-title>

        <q-btn flat round dense icon="notifications" class="q-mr-sm">
          <q-badge color="red" floating>{{ notifications.length }}</q-badge>
        </q-btn>

        <q-btn-dropdown flat round dense icon="person">
          <q-list>
            <q-item-label header>{{ adminData.name }}</q-item-label>
            <q-item clickable v-close-popup @click="viewProfile">
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Profile</q-item-label>
                <q-item-label caption>{{ adminData.email }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Logout</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Navigation -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="260"
      :breakpoint="700"
      bordered
      class="bg-grey-2"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-weight-bold text-grey-8">Navigation</q-item-label>

          <q-item
            clickable
            v-ripple
            :active="activeMenu === 'dashboard'"
            @click="activeMenu = 'dashboard'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="canManageRoutes"
            clickable
            v-ripple
            :active="activeMenu === 'routes'"
            @click="activeMenu = 'routes'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="directions_bus" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Routes / Jeepney</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="canManagePlaces"
            clickable
            v-ripple
            :active="activeMenu === 'places'"
            @click="activeMenu = 'places'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="place" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Places</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="canManageEvents"
            clickable
            v-ripple
            :active="activeMenu === 'events'"
            @click="activeMenu = 'events'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Events</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :active="activeMenu === 'photos'"
            @click="activeMenu = 'photos'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="photo_library" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Page Photos</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item-label header class="text-weight-bold text-grey-8">Management</q-item-label>

          <q-item
            v-if="canManageAdmins"
            clickable
            v-ripple
            :active="activeMenu === 'admins'"
            @click="activeMenu = 'admins'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Admins</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="canViewAnalytics"
            clickable
            v-ripple
            :active="activeMenu === 'analytics'"
            @click="activeMenu = 'analytics'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Analytics</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item
            clickable
            v-ripple
            :active="activeMenu === 'settings'"
            @click="activeMenu = 'settings'"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div class="absolute-bottom q-pa-md">
        <q-card flat bordered>
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-grey-7">Logged in as</div>
            <div class="text-weight-bold text-primary">{{ roleName }}</div>
          </q-card-section>
        </q-card>
      </div>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <q-page class="q-pa-md">
        <div v-if="activeMenu === 'dashboard'">
          <!-- Dashboard Header -->
          <div class="row q-mb-md">
            <div class="col">
              <h4 class="q-my-none text-primary">Dashboard Overview</h4>
              <p class="text-grey-7 q-mb-none">
                <span v-if="adminData.role === 'super_admin'">Full system access - Manage all aspects</span>
                <span v-else-if="adminData.role === 'places_admin'">Manage tourist spots, restaurants, hotels, and other places</span>
                <span v-else-if="adminData.role === 'routes_admin'">Manage jeepney routes and options</span>
                <span v-else-if="adminData.role === 'events_admin'">Manage events and festivals</span>
                <span v-else>Welcome back, {{ adminData.name }}!</span>
              </p>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6 col-md-3" v-if="canManageRoutes">
              <q-card class="stat-card">
                <q-card-section>
                  <div class="row items-center">
                    <div class="col">
                      <div class="stat-icon bg-blue-1">
                        <q-icon name="directions_bus" size="md" color="blue" />
                      </div>
                    </div>
                    <div class="col text-right">
                      <div class="stat-value">{{ stats.routes }}</div>
                      <div class="stat-label">Routes / Jeepneys</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3" v-if="canManagePlaces">
              <q-card class="stat-card">
                <q-card-section>
                  <div class="row items-center">
                    <div class="col">
                      <div class="stat-icon bg-green-1">
                        <q-icon name="place" size="md" color="green" />
                      </div>
                    </div>
                    <div class="col text-right">
                      <div class="stat-value">{{ stats.places }}</div>
                      <div class="stat-label">Places</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3" v-if="canManageEvents">
              <q-card class="stat-card">
                <q-card-section>
                  <div class="row items-center">
                    <div class="col">
                      <div class="stat-icon bg-orange-1">
                        <q-icon name="event" size="md" color="orange" />
                      </div>
                    </div>
                    <div class="col text-right">
                      <div class="stat-value">{{ stats.events }}</div>
                      <div class="stat-label">Events</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card">
                <q-card-section>
                  <div class="row items-center">
                    <div class="col">
                      <div class="stat-icon bg-purple-1">
                        <q-icon name="people" size="md" color="purple" />
                      </div>
                    </div>
                    <div class="col text-right">
                      <div class="stat-value">{{ stats.admins }}</div>
                      <div class="stat-label">Admins</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Dashboard Content -->
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card class="dashboard-card">
                <q-card-section>
                  <div class="text-h6 text-primary">Quick Actions</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pt-none">
                  <div class="q-gutter-sm">
                    <q-btn
                      v-if="canManageRoutes"
                      unelevated
                      color="primary"
                      label="Add New Route / Jeepney"
                      icon="directions_bus"
                      no-caps
                      class="full-width q-mb-sm"
                      @click="openAddRoute"
                    />
                    <q-btn
                      v-if="canManagePlaces"
                      unelevated
                      color="primary"
                      label="Add New Place"
                      icon="add"
                      no-caps
                      class="full-width q-mb-sm"
                      @click="openAddPlace"
                    />
                    <q-btn
                      v-if="canManageEvents"
                      unelevated
                      color="primary"
                      label="Add New Event"
                      icon="add"
                      no-caps
                      class="full-width q-mb-sm"
                      @click="openAddEvent"
                    />
                    <q-btn
                      v-if="canManageAdmins"
                      unelevated
                      outline
                      color="primary"
                      label="Manage Admins"
                      icon="admin_panel_settings"
                      no-caps
                      class="full-width"
                      @click="activeMenu = 'admins'"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-6">
              <q-card class="dashboard-card">
                <q-card-section>
                  <div class="text-h6 text-primary">Recent Activity</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pt-none">
                  <q-list padding v-if="recentActivities.length > 0">
                    <q-item v-for="activity in recentActivities" :key="activity.id">
                      <q-item-section avatar>
                        <q-avatar
                          :color="activity.color"
                          text-color="white"
                          :icon="activity.icon"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ activity.title }}</q-item-label>
                        <q-item-label caption>{{ activity.time }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-center text-grey-6 q-py-md">No recent activity</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Component Sections -->
        <JeepneyManagement
          v-else-if="activeMenu === 'routes'"
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

        <div v-else-if="activeMenu === 'settings'" class="content-section">
          <h4 class="text-primary">Settings</h4>
          <p class="text-grey-7">Configure system settings</p>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
import { auth, db } from 'src/boot/firebase'
import { signOut } from 'firebase/auth'
import { collection, getDocs } from 'firebase/firestore'
import JeepneyManagement from 'src/components/admin/JeepneyManagement.vue'
import PlacesManagement from 'src/components/admin/PlacesManagement.vue'
import EventsManagement from 'src/components/admin/EventsManagement.vue'
import AdminsManagement from 'src/components/admin/AdminsManagement.vue'
import PhotosManagement from 'src/components/admin/PhotosManagement.vue'
import AnalyticsManagement from 'src/components/admin/AnalyticsManagement.vue'

export default {
  name: 'AdminDashboard',

  components: {
    JeepneyManagement,
    PlacesManagement,
    EventsManagement,
    AdminsManagement,
    PhotosManagement,
    AnalyticsManagement,
  },

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      drawer: true,
      activeMenu: 'dashboard',
      adminData: {},
      stats: {
        routes: 0,
        places: 0,
        events: 0,
        admins: 0,
      },
      recentActivities: [],
      notifications: [],
      triggerRouteDialog: false,
      triggerPlaceDialog: false,
      triggerEventDialog: false,
    }
  },

  computed: {
    roleName() {
      const roles = {
        super_admin: 'Super Admin',
        route_manager: 'Route Manager',
        routes_admin: 'Routes Administrator',
        places_admin: 'Places Administrator',
        events_admin: 'Events Administrator',
        content_admin: 'Content Admin',
      }
      return roles[this.adminData.role] || 'Admin'
    },

    canManageRoutes() {
      // Super admin and routes admin can manage routes
      return this.adminData.role === 'super_admin' || 
             this.adminData.role === 'routes_admin' ||
             this.adminData.permissions?.includes('routes:write') ||
             this.adminData.permissions?.manageRoutes || false
    },

    canManagePlaces() {
      // Super admin and places admin can manage places
      return this.adminData.role === 'super_admin' || 
             this.adminData.role === 'places_admin' ||
             this.adminData.permissions?.includes('places:write') ||
             this.adminData.permissions?.managePlaces || false
    },

    canManageEvents() {
      // Super admin and events admin can manage events
      return this.adminData.role === 'super_admin' || 
             this.adminData.role === 'events_admin' ||
             this.adminData.permissions?.includes('events:write') ||
             this.adminData.permissions?.manageEvents || false
    },

    canManageAdmins() {
      // Only super admin can manage admins
      return this.adminData.role === 'super_admin' ||
             this.adminData.permissions?.manageAdmins || false
    },

    canViewAnalytics() {
      // All admins can view analytics
      return this.adminData.permissions?.viewAnalytics || 
             ['super_admin', 'routes_admin', 'places_admin', 'events_admin'].includes(this.adminData.role) ||
             false
    },
  },

  watch: {
    activeMenu(newVal) {
      if (newVal === 'dashboard') {
        this.loadStats()
      }
    },
  },

  mounted() {
    this.loadAdminData()
    this.loadStats()
    this.loadRecentActivity()
    
    // Check for hash in URL and navigate to specific section
    this.handleHashNavigation()
  },

  methods: {
    handleHashNavigation() {
      const hash = window.location.hash
      if (hash) {
        const section = hash.replace('#', '')
        // Map hash to menu items
        const sectionMap = {
          'places': 'places',
          'routes': 'routes',
          'events': 'events',
        }
        
        if (sectionMap[section] && this[sectionMap[section]]) {
          this.activeMenu = sectionMap[section]
        }
      }
    },
    
    loadAdminData() {
      const adminDataStr = sessionStorage.getItem('adminData')
      if (adminDataStr) {
        this.adminData = JSON.parse(adminDataStr)
      } else {
        this.$router.push('/admin/adminlogin')
      }
    },

    async loadStats() {
      try {
        const [routesSnap, placesSnap, eventsSnap, adminsSnap] = await Promise.all([
          getDocs(collection(db, 'routes')),
          getDocs(collection(db, 'places')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'admins')),
        ])

        this.stats = {
          routes: routesSnap.size,
          places: placesSnap.size,
          events: eventsSnap.size,
          admins: adminsSnap.size,
        }

        console.log('[Dashboard] Stats loaded:', this.stats)
      } catch (error) {
        console.error('[Dashboard] Error loading stats:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load statistics',
          position: 'top',
        })
      }
    },

    async loadRecentActivity() {
      this.recentActivities = []
    },

    openAddRoute() {
      this.activeMenu = 'routes'
      this.triggerRouteDialog = false
      this.$nextTick(() => {
        this.triggerRouteDialog = true
      })
    },

    openAddPlace() {
      this.activeMenu = 'places'
      this.triggerPlaceDialog = false
      this.$nextTick(() => {
        this.triggerPlaceDialog = true
      })
    },

    openAddEvent() {
      this.activeMenu = 'events'
      this.triggerEventDialog = false
      this.$nextTick(() => {
        this.triggerEventDialog = true
      })
    },

    onDialogOpened(type) {
      if (type === 'route') this.triggerRouteDialog = false
      if (type === 'place') this.triggerPlaceDialog = false
      if (type === 'event') this.triggerEventDialog = false
    },

    viewProfile() {
      this.$q.notify({
        type: 'info',
        message: 'Profile page coming soon!',
        position: 'top',
      })
    },

    async logout() {
      try {
        await signOut(auth)
        sessionStorage.clear()

        this.$q.notify({
          type: 'positive',
          message: 'Logged out successfully',
          icon: 'check_circle',
          position: 'top',
        })

        this.$router.push('/admin/adminlogin')
      } catch (error) {
        console.error('[Logout] Error:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Logout failed',
          position: 'top',
        })
      }
    },
  },
}
</script>

<style lang="sass" scoped>
.bg-primary
  background: #2E5D3E !important

.text-primary
  color: #2E5D3E

.text-yellow
  color: #FFD60A

.stat-card
  border-radius: 12px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
  transition: all 0.3s ease
  height: 100%

  &:hover
    transform: translateY(-4px)
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12)

.stat-icon
  width: 60px
  height: 60px
  border-radius: 12px
  display: flex
  align-items: center
  justify-content: center

.stat-value
  font-size: 32px
  font-weight: 700
  color: #2E5D3E

.stat-label
  font-size: 14px
  color: #6c757d
  text-transform: uppercase
  letter-spacing: 0.5px

.dashboard-card
  border-radius: 12px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
  overflow: hidden
  height: 100%

.content-section
  h4
    margin-top: 0

// Active menu item styling
.q-item.active-class
  background: #2E5D3E
  color: white
  border-radius: 8px
  margin: 0 8px

// Drawer styling
.q-drawer
  border-right: 1px solid #e0e0e0

// Responsive adjustments
@media (max-width: 768px)
  .q-toolbar-title
    font-size: 1rem

  .stat-card
    margin-bottom: 1rem

  .row.q-col-gutter-md
    flex-direction: column

  .col-12.col-md-6
    width: 100%
    margin-bottom: 1rem
</style>