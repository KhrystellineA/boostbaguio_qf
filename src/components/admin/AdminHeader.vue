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

      <!-- Search bar -->
      <div class="header-search">
        <q-icon name="search" size="18px" color="grey-6" class="q-mr-sm" />
        <input
          v-model="searchText"
          type="text"
          placeholder="Search..."
          class="header-search-input"
        />
        <span class="header-search-shortcut">⌘ F</span>
      </div>

      <q-space />

      <!-- Notifications -->
      <q-btn flat round dense class="header-icon-btn q-mr-sm">
        <q-icon name="mail_outline" size="20px" color="dark" />
      </q-btn>
      <q-btn flat round dense class="header-icon-btn q-mr-md">
        <q-icon name="notifications_none" size="20px" color="dark" />
        <q-badge v-if="notificationsCount > 0" color="red" floating rounded>
          {{ notificationsCount }}
        </q-badge>
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
import { ref } from 'vue'

export default {
  name: 'AdminHeader',

  props: {
    notificationsCount: {
      type: Number,
      default: 0,
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

  emits: ['toggle-drawer', 'view-profile', 'logout'],

  setup() {
    const searchText = ref('')
    return { searchText }
  },
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

.header-search {
  display: flex;
  align-items: center;
  background: #f4f5f7;
  border-radius: 14px;
  padding: 10px 16px;
  width: 360px;
  max-width: 40vw;
  border: 1px solid transparent;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:focus-within {
    background: #fff;
    border-color: rgba($primary-green, 0.35);
    box-shadow: 0 0 0 3px rgba($primary-green, 0.08);
  }
}

.header-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #1d1d1f;

  &::placeholder {
    color: #9aa0a6;
  }
}

.header-search-shortcut {
  font-size: 12px;
  color: #9aa0a6;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 500;
  margin-left: 8px;
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
  .header-search {
    display: none;
  }
  .profile-text {
    display: none;
  }
  .admin-header {
    padding: 12px 12px 4px;
  }
}
</style>
