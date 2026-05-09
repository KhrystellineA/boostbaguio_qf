<!--
  Left navigation drawer for the admin dashboard.
  Renders one menu entry per top-level admin module (Dashboard, Routes,
  Places, Events, Photos, Admins, Activity Logs). Each entry emits
  update:activeMenu with the new key, which the dashboard uses to swap the
  visible component. Items gate themselves on role/permission via the
  computed canManageX / canViewX fields.
-->
<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    show-if-above
    :width="270"
    :breakpoint="700"
    class="admin-drawer"
  >
    <div class="admin-drawer-inner">
      <!-- Brand block -->
      <div class="brand-block">
        <div class="brand-logo">
          <q-icon name="directions_bus" size="22px" color="white" />
        </div>
        <div class="brand-text">
          <div class="brand-title">Boost Baguio</div>
          <div class="brand-subtitle">Admin Panel</div>
        </div>
      </div>

      <q-scroll-area class="drawer-scroll">
        <q-list class="drawer-list">
          <div class="section-label">MENU</div>

          <q-item
            clickable
            v-ripple
            :active="activeMenu === 'dashboard'"
            @click="$emit('update:activeMenu', 'dashboard')"
            class="nav-item"
            active-class="nav-item--active"
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
            class="nav-item"
            active-class="nav-item--active"
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
            class="nav-item"
            active-class="nav-item--active"
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
            class="nav-item"
            active-class="nav-item--active"
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
            class="nav-item"
            active-class="nav-item--active"
          >
            <q-item-section avatar>
              <q-icon name="photo_library" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Page Photos</q-item-label>
            </q-item-section>
          </q-item>

          <div class="section-label">MANAGEMENT</div>

          <q-item
            v-if="canManageAdmins"
            clickable
            v-ripple
            :active="activeMenu === 'admins'"
            @click="$emit('update:activeMenu', 'admins')"
            class="nav-item"
            active-class="nav-item--active"
          >
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Admins</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :active="activeMenu === 'activity-logs'"
            @click="$emit('update:activeMenu', 'activity-logs')"
            class="nav-item"
            active-class="nav-item--active"
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

      <!-- Bottom info card -->
      <div class="drawer-footer-card">
        <div class="footer-card-icon">
          <q-icon name="shield" size="20px" color="white" />
        </div>
        <div class="footer-card-title">Secure Admin Access</div>
        <div class="footer-card-subtitle">Role: {{ formattedRole }}</div>
      </div>
    </div>
  </q-drawer>
</template>

<script>
export default {
  name: 'AdminSidebar',

  props: {
    modelValue: {
      type: Boolean,
      default: true,
    },
    activeMenu: {
      type: String,
      default: 'dashboard',
    },
    adminData: {
      type: Object,
      default: () => ({
        role: null,
        permissions: [],
      }),
    },
  },

  emits: ['update:modelValue', 'update:activeMenu'],

  computed: {
    canManageRoutes() {
      return (
        this.adminData.role === 'super_admin' ||
        this.adminData.role === 'routes_admin' ||
        this.adminData.permissions?.includes('routes:write') ||
        this.adminData.permissions?.includes('super_admin:all') ||
        false
      )
    },

    canManagePlaces() {
      return (
        this.adminData.role === 'super_admin' ||
        this.adminData.role === 'places_admin' ||
        this.adminData.permissions?.includes('places:write') ||
        this.adminData.permissions?.includes('super_admin:all') ||
        false
      )
    },

    canManageEvents() {
      return (
        this.adminData.role === 'super_admin' ||
        this.adminData.role === 'events_admin' ||
        this.adminData.permissions?.includes('events:write') ||
        this.adminData.permissions?.includes('super_admin:all') ||
        false
      )
    },

    canManagePhotos() {
      return (
        this.adminData.role === 'super_admin' ||
        this.adminData.permissions?.includes('photos:write') ||
        this.adminData.permissions?.includes('super_admin:all') ||
        false
      )
    },

    canManageAdmins() {
      return (
        this.adminData.role === 'super_admin' ||
        this.adminData.permissions?.includes('super_admin:all') ||
        false
      )
    },

    canViewAnalytics() {
      return (
        this.adminData.permissions?.includes('analytics:read') ||
        this.adminData.permissions?.includes('super_admin:all') ||
        ['super_admin', 'routes_admin', 'places_admin', 'events_admin'].includes(
          this.adminData.role
        ) ||
        false
      )
    },

    formattedRole() {
      const role = this.adminData.role
      if (!role) return 'Admin'
      return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    },
  },
}
</script>

<style lang="scss" scoped>
$primary-green: #2e5d3e;
$dark-green: #1b4332;
$light-green: #9ec98f;
$soft-green: #e8f5e9;

.admin-drawer {
  background: transparent;

  :deep(.q-drawer) {
    background: transparent !important;
    border: none !important;
  }
}

.admin-drawer-inner {
  background: #ffffff;
  border-radius: 22px;
  margin: 16px 8px 16px 16px;
  height: calc(100% - 32px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 22px 18px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba($primary-green, 0.25);
}

.brand-title {
  font-size: 16px;
  font-weight: 800;
  color: #1d1d1f;
  letter-spacing: 0.01em;
}

.brand-subtitle {
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.drawer-scroll {
  flex: 1;
  padding: 0 12px;
}

.drawer-list {
  padding: 4px 0;
}

.section-label {
  padding: 18px 12px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #9aa0a6;
}

.nav-item {
  border-radius: 12px;
  margin: 2px 0;
  padding: 10px 14px;
  min-height: 44px;
  color: #4a5057;
  font-weight: 500;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  :deep(.q-icon) {
    color: #6c757d;
    font-size: 20px;
  }

  :deep(.q-item__label) {
    font-size: 14px;
    font-weight: 500;
  }

  &:hover {
    background: #f4f5f7;
    color: #1d1d1f;

    :deep(.q-icon) {
      color: $primary-green;
    }
  }
}

.nav-item--active {
  background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba($primary-green, 0.25);

  :deep(.q-icon) {
    color: #ffffff !important;
  }

  :deep(.q-item__label) {
    color: #ffffff !important;
    font-weight: 600;
  }

  &:hover {
    background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%) !important;
  }
}

.drawer-footer-card {
  margin: 12px;
  padding: 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, $dark-green 0%, $primary-green 100%);
  color: #ffffff;
  text-align: left;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    right: -30px;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -40px;
    left: -20px;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
}

.footer-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.footer-card-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}

.footer-card-subtitle {
  font-size: 12px;
  opacity: 0.85;
  position: relative;
  z-index: 1;
}
</style>
