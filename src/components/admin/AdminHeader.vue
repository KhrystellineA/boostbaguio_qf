<!--
  Top bar for the admin dashboard.
  Contents (left to right): drawer toggle → spacer → notifications bell
  (only super-admins see live pending feature-requests in its dropdown) →
  profile pill with Profile / Logout menu.
  Used by: src/pages/admin/AdminDashboard.vue.
-->
<template>
  <q-header class="admin-header">
    <q-toolbar class="admin-toolbar">
      <q-btn
        flat
        dense
        round
        icon="menu"
        color="dark"
        @click="$emit('toggle-drawer')"
        class="menu-btn q-mr-md"
      />

      <q-space />

      <!-- Notifications: super-admin gets pending feature-request approvals -->
      <q-btn flat round dense class="header-icon-btn q-mr-md">
        <q-icon name="notifications_none" size="20px" color="dark" />
        <q-badge v-if="notifications.length > 0" color="red" floating rounded>
          {{ notifications.length }}
        </q-badge>
        <q-menu anchor="bottom right" self="top right" :offset="[0, 8]">
          <q-card style="min-width: 360px; max-width: 420px">
            <q-card-section class="row items-center q-py-sm bg-grey-2">
              <div class="text-subtitle2 text-weight-bold">Feature requests</div>
              <q-space />
              <q-chip
                v-if="notifications.length > 0"
                dense
                square
                color="primary"
                text-color="white"
                :label="`${notifications.length} pending`"
              />
            </q-card-section>
            <q-separator />

            <div v-if="notifications.length === 0" class="q-pa-lg text-center text-grey-7">
              <q-icon name="inbox" size="36px" color="grey-4" />
              <div class="q-mt-sm text-body2">No pending requests</div>
            </div>

            <q-scroll-area
              v-else
              :thumb-style="{ background: '#2d6a4f', width: '4px' }"
              style="max-height: 60vh; height: auto"
            >
              <q-list separator>
                <q-item v-for="req in notifications" :key="req.id" class="q-py-sm">
                  <q-item-section avatar top>
                    <q-avatar
                      size="36px"
                      :color="req.targetType === 'event' ? 'orange-7' : 'green-7'"
                      text-color="white"
                      :icon="req.targetType === 'event' ? 'event' : 'place'"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">
                      Feature {{ req.targetType }}: {{ req.targetName || '(unnamed)' }}
                    </q-item-label>
                    <q-item-label caption>
                      Requested by <strong>{{ req.requestedByName || 'Admin' }}</strong>
                      <span v-if="req.requestedByRole"> · {{ req.requestedByRole }}</span>
                    </q-item-label>
                    <q-item-label v-if="req.note" caption class="text-grey-8 q-mt-xs">
                      “{{ req.note }}”
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <div class="row q-gutter-xs">
                      <q-btn
                        round
                        dense
                        unelevated
                        icon="check"
                        color="positive"
                        size="sm"
                        :loading="decidingId === req.id"
                        @click="$emit('approve-request', req)"
                      >
                        <q-tooltip>Approve & feature</q-tooltip>
                      </q-btn>
                      <q-btn
                        round
                        dense
                        unelevated
                        icon="close"
                        color="negative"
                        size="sm"
                        :loading="decidingId === req.id"
                        @click="$emit('reject-request', req)"
                      >
                        <q-tooltip>Reject</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card>
        </q-menu>
      </q-btn>

      <!-- Profile pill -->
      <q-btn-dropdown flat no-caps class="profile-pill" dropdown-icon="expand_more">
        <template v-slot:label>
          <div class="row items-center no-wrap">
            <q-avatar size="36px" class="q-mr-sm profile-avatar">
              <q-icon name="person" color="white" size="20px" />
            </q-avatar>
            <div class="text-left profile-text">
              <div class="profile-name">{{ adminName }}</div>
              <div class="profile-email">{{ adminEmail }}</div>
            </div>
          </div>
        </template>
        <q-list>
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
    notifications: {
      type: Array,
      default: () => [],
    },
    /** Optional: id of the request currently being approved/rejected. */
    decidingId: {
      type: String,
      default: '',
    },
    adminName: {
      type: String,
      default: 'Admin',
    },
    adminEmail: {
      type: String,
      default: '',
    },
  },

  emits: ['toggle-drawer', 'view-profile', 'logout', 'approve-request', 'reject-request'],
}
</script>

<style lang="scss" scoped>
$primary-green: #2e5d3e;
$dark-green: #1b4332;

.admin-header {
  background: transparent;
  color: #1d1d1f;
  box-shadow: none;
  padding: 16px 20px 8px;
}

.admin-toolbar {
  background: #ffffff;
  border-radius: 18px;
  padding: 10px 16px;
  min-height: 64px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.menu-btn {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.header-icon-btn {
  background: #f4f5f7;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  transition: background 0.2s ease;

  &:hover {
    background: #e8eaed;
  }
}

.profile-pill {
  background: #f4f5f7;
  border-radius: 999px;
  padding: 4px 10px 4px 4px;
  text-transform: none;
  font-weight: 500;
  transition: background 0.2s ease;

  &:hover {
    background: #e8eaed;
  }

  :deep(.q-btn__content) {
    color: #1d1d1f;
  }

  :deep(.q-icon) {
    color: #6c757d;
  }
}

.profile-avatar {
  background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%);
}

.profile-text {
  line-height: 1.2;
  margin-right: 6px;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}

.profile-email {
  font-size: 11px;
  color: #6c757d;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 700px) {
  .profile-text {
    display: none;
  }
  .admin-header {
    padding: 12px 12px 4px;
  }
}
</style>
