<template>
  <header :class="['main-header', { 'scrolled': isScrolled }]">
    <q-toolbar class="main-toolbar">
      <!-- Logo Section -->
      <div class="logo-section cursor-pointer" @click="navigateTo('/')">
        <div class="logo-bento">
          <img src="/logo.svg" alt="Logo" />
        </div>
        <div class="brand-text">
          <span class="brand-name">Baguio <span class="text-accent">Boost</span></span>
          <span class="brand-tagline">Navigate with ease</span>
        </div>
      </div>

      <q-space />

      <!-- Navigation Links - Bento Style -->
      <div class="nav-bento">
        <q-btn
          flat
          class="nav-btn"
          @click="navigateTo('/apanam')"
        >
          <q-icon name="route" size="18px" class="q-mr-xs" />
          Apanam
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          @click="navigateTo('/pagnaam')"
        >
          <q-icon name="directions_bus" size="18px" class="q-mr-xs" />
          Pagnaam
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          @click="navigateTo('/maykan')"
        >
          <q-icon name="place" size="18px" class="q-mr-xs" />
          Maykan
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          @click="navigateTo('/aramidem')"
        >
          <q-icon name="event" size="18px" class="q-mr-xs" />
          Aramidem
        </q-btn>
        <q-separator vertical class="nav-separator" />
        <q-btn
          flat
          class="nav-btn"
          @click="navigateTo('/ayanmo')"
        >
          <q-icon name="my_location" size="18px" class="q-mr-xs" />
          Ayan Mo
        </q-btn>
      </div>

      <q-space />

      <!-- Auth Buttons -->
      <div class="auth-buttons">
        <div class="auth-bento-group">
          <q-btn
            flat
            label="Login"
            class="auth-btn login-btn"
            @click="navigateTo('/auth')"
          />
          <q-btn
            color="primary"
            unelevated
            label="Sign Up"
            class="auth-btn signup-btn"
            @click="navigateTo('/auth')"
          />
        </div>
      </div>
    </q-toolbar>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isScrolled = ref(false);

const navigateTo = (path) => {
  router.push(path);
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
// Color Variables
$primary: #2E5D3E;
$primary-light: #4A7D5D;
$accent: #FFD60A;
$text-dark: #2D3436;
$text-muted: #636E72;

.main-header {
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

// Responsive Design
@media (max-width: 1024px) {
  .main-header {
    padding: 0 16px;
  }

  .nav-bento {
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
}

.cursor-pointer {
  cursor: pointer;
}
</style>