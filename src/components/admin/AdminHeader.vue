<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn flat dense round icon="menu" @click="$emit('toggle-drawer')" class="q-mr-sm" />
      <q-toolbar-title class="flex items-center">
        <q-icon name="directions_bus" size="sm" class="q-mr-sm" />
        <span class="text-weight-bold">Boost Baguio</span>
        <q-badge color="yellow" text-color="black" class="q-ml-sm">Admin</q-badge>
      </q-toolbar-title>

      <q-btn flat round dense icon="notifications" class="q-mr-sm">
        <q-badge color="red" floating>{{ notificationsCount }}</q-badge>
      </q-btn>

      <q-btn-dropdown flat round dense icon="person">
        <q-list>
          <q-item-label header>{{ adminName }}</q-item-label>
          <q-item clickable v-close-popup @click="$emit('view-profile')">
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Profile</q-item-label>
              <q-item-label caption>{{ adminEmail }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup @click="$emit('logout')">
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
</template>

<script>
export default {
  name: 'AdminHeader',

  props: {
    notificationsCount: {
      type: Number,
      default: 0
    },
    adminName: {
      type: String,
      default: 'Admin'
    },
    adminEmail: {
      type: String,
      default: ''
    }
  },

  emits: ['toggle-drawer', 'view-profile', 'logout']
}
</script>
