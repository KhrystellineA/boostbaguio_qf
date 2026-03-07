<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
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
          @click="$emit('update:activeMenu', 'dashboard')"
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
          @click="$emit('update:activeMenu', 'routes')"
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
          @click="$emit('update:activeMenu', 'places')"
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
          @click="$emit('update:activeMenu', 'events')"
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
          v-if="canManagePhotos"
          clickable
          v-ripple
          :active="activeMenu === 'photos'"
          @click="$emit('update:activeMenu', 'photos')"
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
          @click="$emit('update:activeMenu', 'admins')"
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
          @click="$emit('update:activeMenu', 'analytics')"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Analytics</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="activeMenu === 'activity-logs'"
          @click="$emit('update:activeMenu', 'activity-logs')"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Activity Logs</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script>
export default {
  name: 'AdminSidebar',

  props: {
    modelValue: {
      type: Boolean,
      default: true
    },
    activeMenu: {
      type: String,
      default: 'dashboard'
    },
    adminData: {
      type: Object,
      default: () => ({
        role: null,
        permissions: []
      })
    }
  },

  emits: ['update:modelValue', 'update:activeMenu'],

  computed: {
    canManageRoutes() {
      return this.adminData.role === 'super_admin' ||
             this.adminData.role === 'routes_admin' ||
             this.adminData.permissions?.includes('routes:write') ||
             this.adminData.permissions?.includes('super_admin:all') ||
             false
    },

    canManagePlaces() {
      return this.adminData.role === 'super_admin' ||
             this.adminData.role === 'places_admin' ||
             this.adminData.permissions?.includes('places:write') ||
             this.adminData.permissions?.includes('super_admin:all') ||
             false
    },

    canManageEvents() {
      return this.adminData.role === 'super_admin' ||
             this.adminData.role === 'events_admin' ||
             this.adminData.permissions?.includes('events:write') ||
             this.adminData.permissions?.includes('super_admin:all') ||
             false
    },

    canManagePhotos() {
      return this.adminData.role === 'super_admin' ||
             this.adminData.permissions?.includes('photos:write') ||
             this.adminData.permissions?.includes('super_admin:all') ||
             false
    },

    canManageAdmins() {
      return this.adminData.role === 'super_admin' ||
             this.adminData.permissions?.includes('super_admin:all') ||
             false
    },

    canViewAnalytics() {
      return this.adminData.permissions?.includes('analytics:read') ||
             this.adminData.permissions?.includes('super_admin:all') ||
             ['super_admin', 'routes_admin', 'places_admin', 'events_admin'].includes(this.adminData.role) ||
             false
    }
  }
}
</script>
