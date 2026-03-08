<template>
  <header :class="['app-header', { scrolled: isScrolled }]" role="banner">
    <q-toolbar class="main-toolbar" aria-label="Main navigation">
      <!-- Mobile Menu Button -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        aria-label="Open main menu"
        class="mobile-only q-mr-sm"
        @click="leftDrawerOpen = !leftDrawerOpen"
      />

      <!-- Logo Section -->
      <div
        class="logo-section cursor-pointer"
        role="button"
        tabindex="0"
        aria-label="Go to homepage"
        @click="$router.push('/')"
        @keydown.enter="$router.push('/')"
        @keydown.space.prevent="$router.push('/')"
      >
        <div class="logo-bento">
          <img src="../assets/logo.png" alt="Boost Baguio Logo" />
        </div>
        <div class="brand-text">
          <span class="brand-name">Baguio <span class="text-accent">Boost</span></span>
          <span class="brand-tagline">Navigate with ease</span>
        </div>
      </div>

      <q-space />

      <!-- Navigation Links - Bento Style -->
      <div class="nav-bento desktop-only" role="navigation" aria-label="Main navigation links">
        <q-btn
          flat
          class="nav-btn"
          :class="{ active: isActiveRoute('/apanam') }"
          :aria-label="
            isActiveRoute('/apanam')
              ? 'Apanam, current page'
              : 'Navigate to Apanam - Point to Point Navigation'
          "
          :aria-current="isActiveRoute('/apanam') ? 'page' : undefined"
          @click="navigateTo('/apanam')"
        >
          <q-icon name="route" size="18px" class="q-mr-xs" aria-hidden="true" />
          Apanam
        </q-btn>
        <q-separator vertical class="nav-separator" aria-hidden="true" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ active: isActiveRoute('/pagnaam') }"
          :aria-label="
            isActiveRoute('/pagnaam')
              ? 'Pagnaam, current page'
              : 'Navigate to Pagnaam - Jeepney Routes Directory'
          "
          :aria-current="isActiveRoute('/pagnaam') ? 'page' : undefined"
          @click="navigateTo('/pagnaam')"
        >
          <q-icon name="directions_bus" size="18px" class="q-mr-xs" aria-hidden="true" />
          Pagnaam
        </q-btn>
        <q-separator vertical class="nav-separator" aria-hidden="true" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ active: isActiveRoute('/maykan') }"
          :aria-label="
            isActiveRoute('/maykan')
              ? 'Maykan, current page'
              : 'Navigate to Maykan - Tourist Spots and Places'
          "
          :aria-current="isActiveRoute('/maykan') ? 'page' : undefined"
          @click="navigateTo('/maykan')"
        >
          <q-icon name="place" size="18px" class="q-mr-xs" aria-hidden="true" />
          Maykan
        </q-btn>
        <q-separator vertical class="nav-separator" aria-hidden="true" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ active: isActiveRoute('/aramidem') }"
          :aria-label="
            isActiveRoute('/aramidem')
              ? 'Aramidem, current page'
              : 'Navigate to Aramidem - Events Calendar'
          "
          :aria-current="isActiveRoute('/aramidem') ? 'page' : undefined"
          @click="navigateTo('/aramidem')"
        >
          <q-icon name="event" size="18px" class="q-mr-xs" aria-hidden="true" />
          Aramidem
        </q-btn>
        <q-separator vertical class="nav-separator" aria-hidden="true" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ active: isActiveRoute('/ayanmo') }"
          :aria-label="
            isActiveRoute('/ayanmo')
              ? 'Ayan Mo, current page'
              : 'Navigate to Ayan Mo - Nearby Places Search'
          "
          :aria-current="isActiveRoute('/ayanmo') ? 'page' : undefined"
          @click="navigateTo('/ayanmo')"
        >
          <q-icon name="my_location" size="18px" class="q-mr-xs" aria-hidden="true" />
          Ayan Mo
        </q-btn>
      </div>

      <q-space />

      <!-- Auth Section (Desktop) -->
      <div class="auth-buttons desktop-only" role="navigation" aria-label="Account actions">
        <!-- Not Logged In -->
        <template v-if="!userStore.isAuthenticated">
          <div class="auth-bento-group">
            <q-btn
              label="Log In"
              flat
              class="auth-btn login-btn"
              aria-label="Log in to your account"
              @click="handleLogin"
            />
            <q-btn
              label="Sign Up"
              color="primary"
              unelevated
              class="auth-btn signup-btn"
              aria-label="Create a new account"
              @click="handleSignup"
            />
          </div>
        </template>

        <!-- Logged In -->
        <template v-else>
          <q-btn-dropdown
            flat
            class="profile-dropdown"
            no-caps
            :label="userInitials"
            aria-label="Open user menu"
          >
            <template #label>
              <div class="profile-label">
                <div class="avatar-bento" aria-hidden="true">
                  {{ userInitials }}
                </div>
                <span class="user-name">{{ userStore.userName }}</span>
                <q-icon name="keyboard_arrow_down" size="16px" aria-hidden="true" />
              </div>
            </template>
            <q-list class="profile-menu" role="menu" aria-label="User account menu">
              <q-item
                clickable
                v-close-popup
                @click="handleMyAccount"
                class="menu-item"
                role="menuitem"
                aria-label="Go to My Account settings"
              >
                <q-item-section avatar class="menu-icon-section">
                  <div class="icon-bento" aria-hidden="true">
                    <q-icon name="person_outline" size="18px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="menu-label">My Account</q-item-label>
                  <q-item-label caption class="menu-caption">Manage your settings</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator aria-hidden="true" />
              <q-item
                clickable
                v-close-popup
                @click="handleLogout"
                class="menu-item logout"
                role="menuitem"
                aria-label="Sign out of your account"
              >
                <q-item-section avatar class="menu-icon-section">
                  <div class="icon-bento logout" aria-hidden="true">
                    <q-icon name="logout" size="18px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="menu-label">Sign Out</q-item-label>
                  <q-item-label caption class="menu-caption">Log out of your account</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        class="mobile-menu-btn"
        aria-label="Open mobile menu"
        @click="drawer = !drawer"
      />
    </q-toolbar>
  </header>

  <!-- Mobile Drawer -->
  <q-drawer
    v-model="drawer"
    overlay
    behavior="mobile"
    side="right"
    :width="320"
    aria-label="Mobile navigation menu"
  >
    <div class="mobile-drawer-header">
      <div
        class="logo-section"
        role="button"
        tabindex="0"
        aria-label="Go to homepage"
        @click="$router.push('/')"
      >
        <div class="logo-bento">
          <img src="../assets/logo.png" alt="Boost Baguio Logo" />
        </div>
        <div class="brand-text">
          <span class="brand-name">Baguio <span class="text-accent">Boost</span></span>
          <span class="brand-tagline">Navigate with ease</span>
        </div>
      </div>
      <q-btn flat round dense icon="close" aria-label="Close menu" @click="drawer = !drawer" />
    </div>
    <q-separator />
    <q-scroll-area class="fit">
      <q-list padding>
        <!-- Navigation Items -->
        <q-item-label header class="drawer-header" role="heading" aria-level="2"
          >Navigation</q-item-label
        >
        <q-item
          v-for="link in navLinks"
          :key="link.label"
          clickable
          v-ripple
          :href="link.path"
          class="mobile-nav-item"
          :class="{ active: isActiveRoute(link.path) }"
          :aria-label="
            isActiveRoute(link.path) ? `${link.label}, current page` : `Navigate to ${link.label}`
          "
          :aria-current="isActiveRoute(link.path) ? 'page' : undefined"
          @click="drawer = !drawer"
        >
          <q-item-section avatar>
            <div class="mobile-icon-bento" aria-hidden="true">
              <q-icon :name="getIconForRoute(link.path)" size="20px" />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="mobile-nav-label">{{ link.label }}</q-item-label>
            <q-item-label caption>{{ getCaptionForRoute(link.label) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" aria-hidden="true" />

        <!-- Mobile Auth Section -->
        <q-item-label header class="drawer-header" role="heading" aria-level="2"
          >Account</q-item-label
        >

        <!-- Not Logged In (Mobile) -->
        <template v-if="!userStore.isAuthenticated">
          <q-item
            clickable
            v-ripple
            @click="handleLogin"
            class="mobile-nav-item"
            role="button"
            aria-label="Log in to your account"
          >
            <q-item-section avatar>
              <div class="mobile-icon-bento" aria-hidden="true">
                <q-icon name="login" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="mobile-nav-label">Log In</q-item-label>
              <q-item-label caption>Access your account</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            @click="handleSignup"
            class="mobile-nav-item"
            role="button"
            aria-label="Create a new account"
          >
            <q-item-section avatar>
              <div class="mobile-icon-bento signup" aria-hidden="true">
                <q-icon name="person_add" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="mobile-nav-label">Sign Up</q-item-label>
              <q-item-label caption>Create a new account</q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <!-- Logged In (Mobile) -->
        <template v-else>
          <!-- User Info -->
          <q-item class="user-info-card" aria-label="User information">
            <q-item-section avatar>
              <div class="avatar-bento large" aria-hidden="true">
                {{ userInitials }}
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="user-name">{{ userStore.userName }}</q-item-label>
              <q-item-label caption class="user-email">{{ userStore.userEmail }}</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Premium Badge (Mobile) -->
          <q-item
            v-if="userStore.isPremium"
            class="premium-card"
            aria-label="Premium member status"
          >
            <q-item-section avatar>
              <div class="mobile-icon-bento premium" aria-hidden="true">
                <q-icon name="workspace_premium" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="mobile-nav-label">Premium Member</q-item-label>
              <q-item-label caption>Enjoy premium features</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-sm" aria-hidden="true" />

          <!-- My Account -->
          <q-item
            clickable
            v-ripple
            @click="handleMyAccount"
            class="mobile-nav-item"
            role="button"
            aria-label="Go to My Account settings"
          >
            <q-item-section avatar>
              <div class="mobile-icon-bento" aria-hidden="true">
                <q-icon name="person_outline" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="mobile-nav-label">My Account</q-item-label>
              <q-item-label caption>Manage your settings</q-item-label>
            </q-item-section>
          </q-item>

          <!-- Sign Out -->
          <q-item
            clickable
            v-ripple
            @click="handleLogout"
            class="mobile-nav-item logout"
            role="button"
            aria-label="Sign out of your account"
          >
            <q-item-section avatar>
              <div class="mobile-icon-bento logout" aria-hidden="true">
                <q-icon name="logout" size="20px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="mobile-nav-label">Sign Out</q-item-label>
              <q-item-label caption>Log out of your account</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const $q = useQuasar()

const drawer = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { label: 'APANAM', path: 'apanam' },
  { label: 'PAGNAAM', path: 'pagnaam' },
  { label: 'MAYKAN', path: 'maykan' },
  { label: 'ARAMIDEM', path: 'aramidem' },
  { label: 'AYAN MO', path: 'ayanmo' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const isActiveRoute = (path) => {
  return route.path.startsWith('/' + path)
}

const getIconForRoute = (path) => {
  const icons = {
    apanam: 'route',
    pagnaam: 'directions_bus',
    maykan: 'place',
    aramidem: 'event',
    ayanmo: 'my_location',
  }
  return icons[path] || 'link'
}

const getCaptionForRoute = (label) => {
  const captions = {
    APANAM: 'P2P Navigation',
    PAGNAAM: 'City Jeeps',
    MAYKAN: 'Places',
    ARAMIDEM: 'Events',
    'AYAN MO': 'Near Me',
  }
  return captions[label] || ''
}

// Get user initials for avatar
const userInitials = computed(() => {
  const name = userStore.userName || 'User'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const handleLogin = () => {
  drawer.value = false
  router.push('/login')
}

const handleSignup = () => {
  drawer.value = false
  router.push('/login')
}

const handleMyAccount = () => {
  drawer.value = false
  router.push('/account')
}

const handleLogout = async () => {
  drawer.value = false

  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to sign out?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await userStore.logout()
    router.push('/')
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
// Color Variables
$primary: #2e5d3e;
$primary-light: #4a7d5d;
$accent: #ffd60a;
$text-dark: #2d3436;
$text-muted: #636e72;

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(46, 93, 62, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 32px;

  &.scrolled {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: 0 4px 20px rgba(46, 93, 62, 0.08);
    border-bottom: none;

    .main-toolbar {
      height: 64px;
    }

    .logo-bento {
      transform: scale(0.95);
    }
  }
}

.main-toolbar {
  height: 72px;
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 16px;
}

// Logo Section with Bento Design
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(4px);
  }

  .logo-bento {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(46, 93, 62, 0.2);
    transition: all 0.3s ease;

    img {
      height: 24px;
      width: 24px;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }

    &:hover {
      transform: scale(1.05) rotate(-5deg);
      box-shadow: 0 6px 16px rgba(46, 93, 62, 0.3);
    }
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .brand-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: $text-dark;
      letter-spacing: -0.5px;

      .text-accent {
        color: $primary;
        background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .brand-tagline {
      font-size: 0.7rem;
      color: $text-muted;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  }
}

// Navigation Bento Box
.nav-bento {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 6px 8px;
  border: 1px solid rgba(46, 93, 62, 0.08);
  gap: 4px;

  .nav-separator {
    height: 24px;
    opacity: 0.3;
    margin: 0 4px;
  }

  .nav-btn {
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    color: $text-muted;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: none;
    letter-spacing: 0.3px;

    &:hover {
      background: rgba(46, 93, 62, 0.08);
      color: $primary;
      transform: translateY(-2px);
    }

    &.active {
      background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(46, 93, 62, 0.25);

      .q-icon {
        animation: bounce 0.5s ease;
      }
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

// Auth Buttons
.auth-buttons {
  display: flex;
  align-items: center;
}

.auth-bento-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.auth-btn {
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.login-btn {
    color: $primary;

    &:hover {
      background: rgba(46, 93, 62, 0.08);
      transform: translateY(-2px);
    }
  }

  &.signup-btn {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(46, 93, 62, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(46, 93, 62, 0.3);
    }
  }
}

// Profile Dropdown
.profile-dropdown {
  text-transform: none;
  padding: 6px 12px;
  border-radius: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(46, 93, 62, 0.08);
  }

  .profile-label {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar-bento {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    box-shadow: 0 2px 8px rgba(46, 93, 62, 0.2);

    &.large {
      width: 44px;
      height: 44px;
      font-size: 1rem;
    }
  }

  .user-name {
    font-weight: 600;
    color: $text-dark;
    font-size: 0.9rem;
  }
}

// Profile Menu
.profile-menu {
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(46, 93, 62, 0.1);

  .menu-item {
    border-radius: 12px;
    padding: 12px;
    margin: 4px 0;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(46, 93, 62, 0.05);
      transform: translateX(4px);

      .icon-bento {
        transform: scale(1.1) rotate(5deg);
      }
    }

    &.logout:hover {
      background: rgba(211, 47, 47, 0.08);

      .menu-label {
        color: #d32f2f;
      }
    }

    .menu-icon-section {
      padding: 0;
      margin-right: 12px;
    }

    .icon-bento {
      width: 36px;
      height: 36px;
      background: rgba(46, 93, 62, 0.1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $primary;
      transition: all 0.3s ease;

      &.logout {
        background: rgba(211, 47, 47, 0.1);
        color: #d32f2f;
      }
    }

    .menu-label {
      font-weight: 600;
      color: $text-dark;
      font-size: 0.9rem;
    }

    .menu-caption {
      font-size: 0.75rem;
      color: $text-muted;
    }
  }
}

// Mobile Drawer Styles
.mobile-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, $primary 0%, $primary-light 100%);

  .logo-section {
    .logo-bento {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);

      img {
        filter: brightness(0) invert(1);
      }
    }

    .brand-text {
      display: flex;

      .brand-name {
        color: white;

        .text-accent {
          color: $accent;
          -webkit-text-fill-color: $accent;
        }
      }

      .brand-tagline {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.drawer-header {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $text-muted;
  padding: 16px 16px 8px;
}

.mobile-nav-item {
  border-radius: 12px;
  padding: 16px 16px;
  margin: 4px 8px;
  min-height: 56px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(46, 93, 62, 0.05);
  }

  &.active {
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);

    .mobile-nav-label {
      color: white;
    }

    .mobile-icon-bento {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    q-item-label[caption] {
      color: rgba(255, 255, 255, 0.8);
    }
  }

  &.logout {
    .mobile-icon-bento {
      background: rgba(211, 47, 47, 0.1);
      color: #d32f2f;
    }

    &:hover {
      background: rgba(211, 47, 47, 0.08);

      .mobile-nav-label {
        color: #d32f2f;
      }
    }
  }

  .mobile-icon-bento {
    width: 40px;
    height: 40px;
    background: rgba(46, 93, 62, 0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary;
    transition: all 0.3s ease;

    &.signup {
      background: rgba(255, 193, 7, 0.15);
      color: #ffc107;
    }

    &.premium {
      background: rgba(255, 152, 0, 0.15);
      color: #ff9800;
    }

    &.logout {
      background: rgba(211, 47, 47, 0.1);
      color: #d32f2f;
    }
  }

  .mobile-nav-label {
    font-weight: 600;
    color: $text-dark;
    font-size: 0.95rem;
  }

  q-item-label[caption] {
    font-size: 0.75rem;
    color: $text-muted;
  }
}

.user-info-card {
  background: rgba(46, 93, 62, 0.05);
  border-radius: 12px;
  margin: 8px;
  padding: 12px;

  .user-name {
    font-weight: 600;
    color: $text-dark;
  }

  .user-email {
    font-size: 0.75rem;
    color: $text-muted;
  }
}

.premium-card {
  background: rgba(255, 152, 0, 0.08);
  border-radius: 12px;
  margin: 8px;

  .mobile-nav-label {
    color: #f57c00;
  }
}

// Responsive Design
@media (max-width: 1024px) {
  .app-header {
    padding: 0 16px;
  }

  .nav-bento {
    display: none;
  }

  .desktop-only {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }
}

@media (min-width: 1025px) {
  .mobile-menu-btn {
    display: none;
  }
}

@media (max-width: 768px) {
  .logo-section {
    .brand-text {
      display: none;
    }

    .logo-bento {
      width: 40px;
      height: 40px;
    }
  }

  .user-name {
    display: none;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
