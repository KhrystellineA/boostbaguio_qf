<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-pine-green">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" class="q-mr-sm" />
        <q-toolbar-title class="flex items-center">
          <q-icon name="directions_bus" size="sm" class="q-mr-sm" />
          <span>BaguioBoost<span class="text-yellow">PH</span></span>
          <q-badge color="white" text-color="pine-green" class="q-ml-sm">Admin</q-badge>
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

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="260"
      :breakpoint="700"
      bordered
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item-label header class="text-weight-bold text-grey-8">
            Navigation
          </q-item-label>

          <q-item
            clickable
            v-ripple
            :active="activeMenu === 'dashboard'"
            @click="activeMenu = 'dashboard'"
            active-class="bg-pine-green text-white"
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
            active-class="bg-pine-green text-white"
          >
            <q-item-section avatar>
              <q-icon name="route" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Routes</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="canManagePlaces"
            clickable
            v-ripple
            :active="activeMenu === 'places'"
            @click="activeMenu = 'places'"
            active-class="bg-pine-green text-white"
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
            active-class="bg-pine-green text-white"
          >
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Events</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <q-item-label header class="text-weight-bold text-grey-8">
            Management
          </q-item-label>

          <q-item
            v-if="canManageAdmins"
            clickable
            v-ripple
            :active="activeMenu === 'admins'"
            @click="activeMenu = 'admins'"
            active-class="bg-pine-green text-white"
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
            active-class="bg-pine-green text-white"
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
            active-class="bg-pine-green text-white"
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
            <div class="text-weight-bold text-pine-green">{{ roleName }}</div>
          </q-card-section>
        </q-card>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md">
        <div v-if="activeMenu === 'dashboard'">
          <div class="row q-mb-md">
            <div class="col">
              <h4 class="q-my-none text-pine-green">Dashboard Overview</h4>
              <p class="text-grey-7 q-mb-none">Welcome back, {{ adminData.name }}!</p>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6 col-md-3" v-if="canManageRoutes">
              <q-card class="stat-card">
                <q-card-section>
                  <div class="row items-center">
                    <div class="col">
                      <div class="stat-icon bg-blue-1">
                        <q-icon name="route" size="md" color="blue" />
                      </div>
                    </div>
                    <div class="col text-right">
                      <div class="stat-value">{{ stats.routes }}</div>
                      <div class="stat-label">Routes</div>
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

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card>
                <q-card-section>
                  <div class="text-h6 text-pine-green">Quick Actions</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pt-none">
                  <div class="q-gutter-sm">
                    <q-btn
                      v-if="canManageRoutes"
                      unelevated
                      style="background: #2d6a4f; color: white"
                      label="Add New Route"
                      icon="add"
                      no-caps
                      class="full-width"
                      @click="openAddRoute"
                    />
                    <q-btn
                      v-if="canManagePlaces"
                      unelevated
                      style="background: #2d6a4f; color: white"
                      label="Add New Place"
                      icon="add"
                      no-caps
                      class="full-width"
                      @click="openAddPlace"
                    />
                    <q-btn
                      v-if="canManageEvents"
                      unelevated
                      style="background: #2d6a4f; color: white"
                      label="Add New Event"
                      icon="add"
                      no-caps
                      class="full-width"
                      @click="openAddEvent"
                    />
                    <q-btn
                      v-if="canManageAdmins"
                      unelevated
                      outline
                      color="positive"
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
              <q-card>
                <q-card-section>
                  <div class="text-h6 text-pine-green">Recent Activity</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pt-none">
                  <q-list padding v-if="recentActivities.length > 0">
                    <q-item v-for="activity in recentActivities" :key="activity.id">
                      <q-item-section avatar>
                        <q-avatar :color="activity.color" text-color="white" :icon="activity.icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ activity.title }}</q-item-label>
                        <q-item-label caption>{{ activity.time }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-center text-grey-6 q-py-md">
                    No recent activity
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <RoutesManagement
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

        <AdminsManagement
          v-else-if="activeMenu === 'admins'"
        />

        <div v-else-if="activeMenu === 'analytics'" class="content-section">
          <h4 class="text-pine-green">Analytics</h4>
          <p class="text-grey-7">View usage statistics and analytics</p>
        </div>

        <div v-else-if="activeMenu === 'settings'" class="content-section">
          <h4 class="text-pine-green">Settings</h4>
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
import RoutesManagement from 'src/components/admin/RoutesManagement.vue'
import PlacesManagement from 'src/components/admin/PlacesManagement.vue'
import EventsManagement from 'src/components/admin/EventsManagement.vue'
import AdminsManagement from 'src/components/admin/AdminsManagement.vue'

export default {
  name: 'AdminDashboard',

  components: {
    RoutesManagement,
    PlacesManagement,
    EventsManagement,
    AdminsManagement
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
        admins: 0
      },
      recentActivities: [],
      notifications: [],
      triggerRouteDialog: false,
      triggerPlaceDialog: false,
      triggerEventDialog: false
    }
  },

  computed: {
    roleName() {
      const roles = {
        super_admin: 'Super Admin',
        route_manager: 'Route Manager',
        content_admin: 'Content Admin'
      }
      return roles[this.adminData.role] || 'Admin'
    },

    canManageRoutes() {
      return this.adminData.permissions?.manageRoutes || false
    },

    canManagePlaces() {
      return this.adminData.permissions?.managePlaces || false
    },

    canManageEvents() {
      return this.adminData.permissions?.manageEvents || false
    },

    canManageAdmins() {
      return this.adminData.permissions?.manageAdmins || false
    },

    canViewAnalytics() {
      return this.adminData.permissions?.viewAnalytics || false
    }
  },

  watch: {
    activeMenu(newVal) {
      if (newVal === 'dashboard') {
        this.loadStats()
      }
    }
  },

  mounted() {
    this.loadAdminData()
    this.loadStats()
    this.loadRecentActivity()
  },

  methods: {
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
          getDocs(collection(db, 'admins'))
        ])

        this.stats = {
          routes: routesSnap.size,
          places: placesSnap.size,
          events: eventsSnap.size,
          admins: adminsSnap.size
        }

        console.log('[Dashboard] Stats loaded:', this.stats)
      } catch (error) {
        console.error('[Dashboard] Error loading stats:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load statistics',
          position: 'top'
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
        position: 'top'
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
          position: 'top'
        })

        this.$router.push('/admin/adminlogin')
      } catch (error) {
        console.error('[Logout] Error:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Logout failed',
          position: 'top'
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.bg-pine-green
  background: #2d6a4f !important

.text-pine-green
  color: #2d6a4f

.text-yellow
  color: #ffd60a

.stat-card
  transition: all 0.3s ease
  
  &:hover
    transform: translateY(-4px)
    box-shadow: 0 4px 12px rgba(0,0,0,0.1)

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
  color: #2d6a4f

.stat-label
  font-size: 14px
  color: #6c757d
  text-transform: uppercase
  letter-spacing: 0.5px

.content-section
  h4
    margin-top: 0
</style>