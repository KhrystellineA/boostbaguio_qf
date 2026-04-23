<template>
  <section class="hero-section" aria-label="Hero section">
    <!-- Background Image -->
    <div class="hero-bg-wrapper">
      <q-img
        :src="heroImage || defaultHeroImage"
        class="hero-bg"
        alt="Beautiful scenery of Baguio City"
      >
        <template v-slot:loading>
          <div class="absolute-full flex flex-center">
            <q-spinner color="white" size="50px" />
          </div>
        </template>
      </q-img>
      <div class="hero-overlay" />
    </div>

    <!-- Content -->
    <div class="hero-inner">
      <div class="hero-content">
        <p class="hero-tag">Your Baguio City Companion</p>
        <h1 class="hero-title">BOOST BAGUIO</h1>
        <p class="hero-description">
          Commute like a local, discover tourist spots, browse events, and find nearby attractions —
          all in one place.
        </p>

        <!-- Feature quick-links -->
        <div class="hero-actions">
          <router-link to="/apanam" class="hero-btn hero-btn--primary">
            <q-icon name="navigation" size="20px" />
            <span>Navigate</span>
          </router-link>
          <router-link to="/pagnaam" class="hero-btn hero-btn--outline">
            <q-icon name="directions_bus" size="20px" />
            <span>Jeepney Routes</span>
          </router-link>
          <router-link to="/maykan" class="hero-btn hero-btn--outline">
            <q-icon name="place" size="20px" />
            <span>Places</span>
          </router-link>
          <router-link to="/aramidem" class="hero-btn hero-btn--outline">
            <q-icon name="event" size="20px" />
            <span>Events</span>
          </router-link>
          <router-link to="/ayanmo" class="hero-btn hero-btn--outline">
            <q-icon name="near_me" size="20px" />
            <span>Nearby</span>
          </router-link>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="scroll-hint" @click="scrollDown">
        <q-icon name="keyboard_arrow_down" size="28px" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',

  props: {
    heroImage: {
      type: String,
      default: '',
    },
  },

  computed: {
    defaultHeroImage() {
      return 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920'
    },
  },

  methods: {
    scrollDown() {
      const next = this.$el.nextElementSibling
      if (next) next.scrollIntoView({ behavior: 'smooth' })
    },
  },
}
</script>

<style lang="scss" scoped>
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$white: #ffffff;

.hero-section {
  width: 100%;
  min-height: 70vh;
  position: relative;
  overflow: hidden;
}

/* Background */
.hero-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;

  .hero-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba($dark-green, 0.55) 0%,
    rgba($dark-green, 0.4) 50%,
    rgba($dark-green, 0.65) 100%
  );
}

/* Layout */
.hero-inner {
  position: relative;
  z-index: 10;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 5% 2.5rem;
}

.hero-content {
  text-align: center;
  max-width: 720px;
}

/* Typography */
.hero-tag {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $light-green;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900;
  color: $white;
  margin: 0 0 1.25rem;
  letter-spacing: 3px;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);

  @media (max-width: 959px) {
    font-size: 3.25rem;
  }
  @media (max-width: 599px) {
    font-size: 2.5rem;
  }
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba($white, 0.92);
  margin-bottom: 2.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  @media (max-width: 599px) {
    font-size: 0.95rem;
  }
}

/* Feature buttons */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  cursor: pointer;

  &--primary {
    background: $primary-green;
    color: $white;
    box-shadow: 0 4px 16px rgba($primary-green, 0.4);

    &:hover {
      background: $dark-green;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba($primary-green, 0.5);
    }
  }

  &--outline {
    background: rgba($white, 0.12);
    color: $white;
    border: 1.5px solid rgba($white, 0.35);
    backdrop-filter: blur(6px);

    &:hover {
      background: rgba($white, 0.22);
      border-color: rgba($white, 0.6);
      transform: translateY(-2px);
    }
  }
}

/* Scroll indicator */
.scroll-hint {
  margin-top: auto;
  color: rgba($white, 0.6);
  cursor: pointer;
  animation: bounce 2s infinite;
  transition: color 0.2s;

  &:hover {
    color: $white;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(8px);
  }
}

/* Mobile */
@media (max-width: 599px) {
  .hero-inner {
    padding: 5rem 6% 2rem;
  }

  .hero-actions {
    gap: 8px;
  }

  .hero-btn {
    padding: 9px 16px;
    font-size: 0.8rem;
  }
}
</style>
