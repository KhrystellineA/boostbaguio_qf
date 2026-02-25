<template>
  <div class="shared-navbar">
    <!-- Logo Section -->
    <div class="logo-section cursor-pointer" @click="$router.push('/')">
      <div class="logo-bento">
        <img src="/logo.svg" alt="Logo" />
      </div>
      <div class="brand-text">
        <span class="brand-name">Baguio <span class="text-accent">Boost</span></span>
        <span class="brand-tagline">Navigate with ease</span>
      </div>
    </div>

      <q-space />

      <!-- Navigation Links - Bento Style (Desktop) -->
      <div class="nav-bento">
        <q-btn
          flat
          class="nav-btn"
          :class="{ 'active': isActiveRoute('/apanam') }"
          @click="navigateTo('/apanam')"
        >
          <q-icon name="route" size="18px" class="q-mr-xs" />
          Apanam
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ 'active': isActiveRoute('/pagnaam') }"
          @click="navigateTo('/pagnaam')"
        >
          <q-icon name="directions_bus" size="18px" class="q-mr-xs" />
          Pagnaam
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ 'active': isActiveRoute('/maykan') }"
          @click="navigateTo('/maykan')"
        >
          <q-icon name="place" size="18px" class="q-mr-xs" />
          Maykan
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ 'active': isActiveRoute('/aramidem') }"
          @click="navigateTo('/aramidem')"
        >
          <q-icon name="event" size="18px" class="q-mr-xs" />
          Aramidem
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          :class="{ 'active': isActiveRoute('/ayanmo') }"
          @click="navigateTo('/ayanmo')"
        >
          <q-icon name="my_location" size="18px" class="q-mr-xs" />
          Ayan Mo
        </q-btn>
      </div>

      <q-space />

      <!-- Auth Buttons -->
      <div class="auth-buttons desktop-only">
        <template v-if="userStore.isAuthenticated">
          <q-btn-dropdown
            flat
            class="profile-dropdown"
            no-caps
            :label="userInitials"
          >
            <template #label>
              <div class="profile-label">
                <div class="avatar-bento">{{ userInitials }}</div>
                <span class="user-name">{{ userStore.userName }}</span>
                <q-icon name="keyboard_arrow_down" size="16px" />
              </div>
            </template>
            <q-list class="profile-menu">
              <q-item clickable v-close-popup @click="navigateTo('/account')" class="menu-item">
                <q-item-section avatar class="menu-icon-section">
                  <div class="icon-bento">
                    <q-icon name="account_circle" size="18px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="menu-label">My Profile</q-item-label>
                  <q-item-label caption class="menu-caption">Manage your account</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="navigateTo('/saved-routes')" class="menu-item">
                <q-item-section avatar class="menu-icon-section">
                  <div class="icon-bento saved">
                    <q-icon name="bookmark" size="18px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="menu-label">Saved Routes</q-item-label>
                  <q-item-label caption class="menu-caption">Your bookmarked routes</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="handleLogout" class="menu-item logout">
                <q-item-section avatar class="menu-icon-section">
                  <div class="icon-bento logout">
                    <q-icon name="logout" size="18px" />
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="menu-label">Logout</q-item-label>
                  <q-item-label caption class="menu-caption">Sign out of your account</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
        <template v-else>
          <div class="auth-bento-group">
            <q-btn
              flat
              label="Login"
              class="auth-btn login-btn"
              @click="navigateTo('/login')"
            />
            <q-btn
              color="primary"
              unelevated
              label="Sign Up"
              class="auth-btn signup-btn"
              @click="navigateTo('/login')"
            />
          </div>
        </template>
      </div>

      <!-- Mobile Menu Button -->
      <q-btn
        flat
        dense
        round
        icon="menu"
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
      />
    </div>

    <!-- Mobile Drawer Menu -->
    <q-dialog v-model="showMobileMenu" persistent>
      <q-card class="mobile-menu-card">
        <q-card-section class="mobile-menu-header">
          <div class="logo-section">
            <div class="logo-bento">
              <img src="/logo.svg" alt="Logo" />
            </div>
            <div class="brand-text">
              <span class="brand-name">Baguio <span class="text-accent">Boost</span></span>
              <span class="brand-tagline">Navigate with Joy</span>
            </div>
          </div>
          <q-btn flat round dense icon="close" @click="toggleMobileMenu" />
        </q-card-section>

        <q-separator />

        <q-card-section class="mobile-nav-section">
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/apanam')"
              class="mobile-nav-item"
              :class="{ 'active': isActiveRoute('/apanam') }"
            >
              <q-item-section avatar>
                <div class="mobile-icon-bento">
                  <q-icon name="route" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Apanam</q-item-label>
                <q-item-label caption>P2P Navigation</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/pagnaam')"
              class="mobile-nav-item"
              :class="{ 'active': isActiveRoute('/pagnaam') }"
            >
              <q-item-section avatar>
                <div class="mobile-icon-bento">
                  <q-icon name="directions_bus" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Pagnaam</q-item-label>
                <q-item-label caption>City Jeeps</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/maykan')"
              class="mobile-nav-item"
              :class="{ 'active': isActiveRoute('/maykan') }"
            >
              <q-item-section avatar>
                <div class="mobile-icon-bento">
                  <q-icon name="place" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Maykan</q-item-label>
                <q-item-label caption>Places</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/aramidem')"
              class="mobile-nav-item"
              :class="{ 'active': isActiveRoute('/aramidem') }"
            >
              <q-item-section avatar>
                <div class="mobile-icon-bento">
                  <q-icon name="event" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Aramidem</q-item-label>
                <q-item-label caption>Events</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              clickable
              v-close-popup
              @click="navigateTo('/ayanmo')"
              class="mobile-nav-item"
              :class="{ 'active': isActiveRoute('/ayanmo') }"
            >
              <q-item-section avatar>
                <div class="mobile-icon-bento">
                  <q-icon name="my_location" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Ayan Mo</q-item-label>
                <q-item-label caption>Near Me</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator />

        <q-card-section class="mobile-auth-section">
          <template v-if="userStore.isAuthenticated">
            <q-item clickable v-close-popup @click="$router.push('/account')" class="mobile-nav-item">
              <q-item-section avatar>
                <div class="mobile-icon-bento">
                  <q-icon name="account_circle" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">My Profile</q-item-label>
                <q-item-label caption>{{ userStore.userEmail }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$router.push('/saved-routes')" class="mobile-nav-item">
              <q-item-section avatar>
                <div class="mobile-icon-bento saved">
                  <q-icon name="bookmark" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Saved Routes</q-item-label>
                <q-item-label caption>Your bookmarks</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleLogout" class="mobile-nav-item logout">
              <q-item-section avatar>
                <div class="mobile-icon-bento logout">
                  <q-icon name="logout" size="20px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="mobile-nav-label">Logout</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <div class="mobile-auth-buttons">
              <q-btn
                flat
                label="Login"
                to="/login"
                class="mobile-auth-btn"
                @click="toggleMobileMenu"
              />
              <q-btn
                color="primary"
                unelevated
                label="Sign Up"
                to="/login"
                class="mobile-auth-btn"
                @click="toggleMobileMenu"
              />
            </div>
          </template>
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from 'stores/user-store'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isScrolled = ref(false)
const showMobileMenu = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/')
}

const isActiveRoute = (path) => {
  return route.path.startsWith(path)
}

const navigateTo = (path) => {
  router.push(path)
  showMobileMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const userInitials = computed(() => {
  const name = userStore.userName || 'User'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
// Color Variables
$primary: #2E5D3E;
$primary-light: #4A7D5D;
$accent: #FFD60A;
$bg-light: #F8F9FA;
$text-dark: #2D3436;
$text-muted: #636E72;
$white: #FFFFFF;
$dark-green: #1B4332;
$light-green: #9EC98F;
$brown: #6B5344;

.main-toolbar {
  background: $white !important;
  border-bottom: 1px solid rgba(46, 93, 62, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 32px;
  height: 72px;
  gap: 16px;

  &.scrolled {
    background: $white !important;
    box-shadow: 0 4px 20px rgba(46, 93, 62, 0.08);
    border-bottom: none;
    height: 64px;

    .logo-bento {
      transform: scale(0.95);
    }
  }
}

.shared-navbar {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
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
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
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
        color: #D32F2F;
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

      &.saved {
        background: rgba(255, 193, 7, 0.15);
        color: #FFC107;
      }

      &.logout {
        background: rgba(211, 47, 47, 0.1);
        color: #D32F2F;
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

// Responsive Design
@media (max-width: 1024px) {
  .main-toolbar {
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

// Mobile Menu Card Styles
.mobile-menu-card {
  width: 100%;
  max-width: 400px;
  border-radius: 20px 20px 0 0;
  overflow: hidden;

  .mobile-menu-header {
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

  .mobile-nav-section {
    padding: 16px 8px;
    max-height: 50vh;
    overflow-y: auto;

    .mobile-nav-item {
      border-radius: 12px;
      padding: 14px 16px;
      margin: 4px 8px;
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
          color: #D32F2F;
        }

        &:hover {
          background: rgba(211, 47, 47, 0.08);

          .mobile-nav-label {
            color: #D32F2F;
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

        &.saved {
          background: rgba(255, 193, 7, 0.15);
          color: #FFC107;
        }

        &.logout {
          background: rgba(211, 47, 47, 0.1);
          color: #D32F2F;
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
  }

  .mobile-auth-section {
    padding: 16px;

    .mobile-auth-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px;

      .mobile-auth-btn {
        border-radius: 12px;
        padding: 14px;
        font-weight: 600;
        text-transform: none;
      }
    }
  }
}

// Cursor pointer utility
.cursor-pointer {
  cursor: pointer;
}
</style>
