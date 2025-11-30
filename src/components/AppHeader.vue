<template>
  <q-header elevated class="app-header bg-white text-dark">
    <q-toolbar class="toolbar-custom">
      <div class="container-header">
        <div class="row items-center full-width no-wrap">
          <!-- Logo -->
          <div class="col-auto">
            <q-toolbar-title
              class="row items-center cursor-pointer q-pa-none"
              @click="$router.push('/')"
            >
              <div class="logo-wrapper">
                <img src="../assets/logo.png" alt="Logo" class="logo-img" />
              </div>
            </q-toolbar-title>
          </div>

          <!-- Spacer -->
          <div class="col"></div>

          <!-- Desktop Navigation -->
          <div class="col-auto gt-md">
            <div class="row items-center q-gutter-md nav-menu">
              <a v-for="link in navLinks" :key="link.label" :href="link.path" class="nav-link">
                {{ link.label }}
              </a>

              <!-- More Options Dropdown -->
              <q-btn-dropdown
                flat
                dense
                no-caps
                label="More Options"
                class="more-options-btn"
                dropdown-icon="expand_more"
              >
                <q-list>
                  <q-item
                    clickable
                    v-close-popup
                    :href="option.path"
                    v-for="option in moreOptions"
                    :key="option.label"
                  >
                    <q-item-section>
                      <q-item-label>{{ option.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </div>

          <!-- Auth Buttons (Desktop) -->
          <div class="col-auto gt-md">
            <div class="row items-center q-gutter-sm">
              <q-btn label="Log In" flat no-caps class="auth-btn login-btn" @click="handleLogin" />
              <q-btn
                label="Sign Up"
                unelevated
                no-caps
                class="auth-btn signup-btn"
                @click="handleSignup"
              />
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <div class="col-auto lt-lg">
            <q-btn flat dense round icon="menu" @click="drawer = !drawer" />
          </div>
        </div>
      </div>
    </q-toolbar>
  </q-header>

  <!-- Mobile Drawer -->
  <q-drawer v-model="drawer" overlay behavior="mobile" side="right" :width="280">
    <q-scroll-area class="fit">
      <q-list padding>
        <q-item-label header class="text-weight-bold">Navigation</q-item-label>
        <q-item v-for="link in navLinks" :key="link.label" clickable v-ripple :href="link.path">
          <q-item-section>
            <q-item-label>{{ link.label }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header class="text-weight-bold">More</q-item-label>
        <q-item
          v-for="option in moreOptions"
          :key="option.label"
          clickable
          v-ripple
          :href="option.path"
        >
          <q-item-section>
            <q-item-label>{{ option.label }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header class="text-weight-bold">Account</q-item-label>
        <q-item clickable v-ripple @click="handleLogin">
          <q-item-section>
            <q-item-label>Log In</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-ripple @click="handleSignup">
          <q-item-section>
            <q-item-label>Sign Up</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AppHeader',
  setup() {
    const drawer = ref(false)

    const navLinks = [
      { label: 'APANAM', path: 'apanam' },
      { label: 'PAGNAAM', path: 'pagnaam' },
      { label: 'ARAMIDEM', path: 'aramidem' },
    ]

    const moreOptions = [
      { label: 'Features', path: 'features' },
      { label: 'Routes', path: 'routes' },
      { label: 'About', path: 'about' },
      { label: 'Contact', path: 'contact' },
      { label: 'FAQ', path: 'faq' },
    ]

    const handleLogin = () => {
      console.log('Navigate to login')
    }

    const handleSignup = () => {
      console.log('Navigate to signup')
    }

    return {
      drawer,
      navLinks,
      moreOptions,
      handleLogin,
      handleSignup,
    }
  },
}
</script>

<style lang="scss" scoped>
.app-header {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.toolbar-custom {
  padding: 0.5rem 1.5rem;
  min-height: 80px;
}

.container-header {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
}

// Logo Section
.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

// Navigation Menu
.nav-menu {
  margin-right: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: #2c3e50;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: #1976d2;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #1976d2;
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
}

.more-options-btn {
  color: #2c3e50;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 0.5rem 0.75rem;

  &:hover {
    color: #1976d2;
  }

  :deep(.q-icon) {
    font-size: 1.25rem;
  }
}

// Auth Buttons
.auth-btn {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.login-btn {
  color: #2c3e50;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.signup-btn {
  background: #f5f5f5;
  color: #2c3e50;
  border: 1px solid #e0e0e0;

  &:hover {
    background: #ebebeb;
    border-color: #d0d0d0;
  }
}

// Mobile Responsive
@media (max-width: 1023px) {
  .toolbar-custom {
    padding: 0.5rem 1rem;
  }

  .container-header {
    padding: 0 0.5rem;
  }
}

// Dropdown List Styling
:deep(.q-list) {
  min-width: 160px;
  padding: 0.5rem 0;
}

:deep(.q-item) {
  padding: 0.625rem 1rem;
  min-height: auto;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

:deep(.q-item__label) {
  font-size: 0.875rem;
  color: #2c3e50;
}
</style>
