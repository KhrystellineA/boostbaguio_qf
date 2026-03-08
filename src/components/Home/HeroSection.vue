<template>
  <section class="hero-section" aria-label="Hero section - Boost Baguio navigation app">
    <div class="container-custom">
      <div class="hero-box">
        <div class="hero-bg-wrapper">
          <q-img
            :src="heroImage || defaultHeroImage"
            class="hero-bg"
            :ratio="16 / 9"
            alt="Beautiful scenery of Baguio City"
          >
            <template v-slot:loading>
              <div class="absolute-full flex flex-center">
                <q-spinner color="white" size="50px" aria-label="Loading image" />
              </div>
            </template>
          </q-img>
          <div class="hero-overlay" aria-hidden="true"></div>
        </div>

        <div class="hero-content" role="region" aria-label="Hero content">
          <div class="content-grid">
            <div class="left-content scroll-animate" :class="{ 'animate-in': true }">
              <h1 class="hero-title">BOOST BAGUIO</h1>
              <p class="hero-description">
                Commute like a local in Baguio with ease. Discover tourist spots, events, and nearby
                attractions right at the palm of your hand!
              </p>
              <p class="hero-tagline">Navigate. Connect. Sustain.</p>
            </div>

            <div
              class="right-content route-card scroll-animate"
              :class="{ 'animate-in': true }"
              role="region"
              aria-label="APANAM Point to Point Navigation form"
            >
              <div class="card-header">
                <q-icon name="navigation" size="24px" class="q-mr-sm" aria-hidden="true" />
                <span class="card-title">APANAM - Point to Point Navigation</span>
              </div>

              <div class="input-group">
                <div class="input-label" id="from-label">FROM:</div>
                <q-input
                  v-if="!fromAutoDetect"
                  :model-value="fromLocationText"
                  @update:model-value="$emit('update:fromLocationText', $event)"
                  filled
                  placeholder="Enter starting location"
                  bg-color="white"
                  class="custom-input"
                  aria-label="Enter starting location"
                  aria-labelledby="from-label"
                  @keyup.enter="searchFromLocation"
                >
                  <template v-slot:prepend>
                    <q-icon name="my_location" color="grey-7" aria-hidden="true" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      round
                      icon="search"
                      color="primary"
                      size="sm"
                      @click="searchFromLocation"
                      style="margin-right: -8px"
                      aria-label="Search for location"
                    >
                      <q-tooltip>Search location</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
                <q-input
                  v-else
                  filled
                  readonly
                  :value="fromLocationText || 'Detecting your location...'"
                  bg-color="white"
                  class="custom-input"
                  disable
                  aria-label="Location being detected automatically"
                >
                  <template v-slot:prepend>
                    <q-icon name="gps_fixed" color="positive" aria-hidden="true" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      size="sm"
                      @click="disableFromAutoDetect"
                      style="margin-right: -8px"
                      aria-label="Enter location manually"
                    >
                      <q-tooltip>Enter location manually</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <div class="input-group">
                <div class="input-label" id="to-label">TO:</div>
                <q-select
                  :model-value="toLocation"
                  @update:model-value="$emit('update:toLocation', $event)"
                  :options="toLocationOptions"
                  filled
                  placeholder="Select destination"
                  bg-color="white"
                  class="custom-input"
                  emit-value
                  map-options
                  aria-label="Select destination"
                  aria-labelledby="to-label"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" color="grey-7" aria-hidden="true" />
                  </template>
                </q-select>
              </div>

              <q-btn
                class="start-nav-btn"
                color="primary"
                label="START NAVIGATION"
                unelevated
                no-caps
                @click="startNavigation"
                :disable="!fromLocation && !fromLocationText"
                aria-label="Start navigation with selected route"
              />
            </div>
          </div>
        </div>
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
    fromLocationText: {
      type: String,
      default: '',
    },
    fromLocation: {
      type: [Object, null],
      default: null,
    },
    toLocation: {
      type: [Object, null],
      default: null,
    },
    fromLocationOptions: {
      type: Array,
      default: () => [],
    },
    toLocationOptions: {
      type: Array,
      default: () => [],
    },
    fromAutoDetect: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    'update:fromLocationText',
    'update:fromLocation',
    'update:toLocation',
    'search',
    'detect',
    'disable-auto',
    'start',
  ],

  computed: {
    defaultHeroImage() {
      return 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920'
    },
  },

  methods: {
    searchFromLocation() {
      this.$emit('search')
    },
    detectCurrentLocation() {
      this.$emit('detect')
    },
    disableFromAutoDetect() {
      this.$emit('disable-auto')
    },
    startNavigation() {
      this.$emit('start')
    },
  },
}
</script>

<style lang="scss" scoped>
// Import shared styles from IndexPage
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$white: #ffffff;
$glass-bg: rgba(255, 255, 255, 0.85);

.hero-section {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  padding: 0;
}

.container-custom {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

.hero-box {
  position: relative;
}

.hero-bg-wrapper {
  position: relative;
  width: 100%;
  height: 50vh;
  overflow: hidden;

  .hero-bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(27, 67, 50, 0.7) 0%, rgba(46, 93, 62, 0.5) 100%);
  }
}

.hero-content {
  padding: 3rem 5%;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;

  @media (max-width: 959px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.left-content {
  color: $white;

  .hero-title {
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 1.5rem 0;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    letter-spacing: 2px;

    @media (max-width: 959px) {
      font-size: 3rem;
    }

    @media (max-width: 599px) {
      font-size: 2.5rem;
    }
  }

  .hero-description {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1rem;
    opacity: 0.95;

    @media (max-width: 959px) {
      font-size: 1rem;
    }
  }

  .hero-tagline {
    font-size: 1rem;
    font-weight: 600;
    font-style: italic;
    opacity: 0.9;
    margin-top: 1.5rem;
  }
}

.route-card {
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.98);

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(46, 93, 62, 0.1);

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: $primary-green;
      text-align: center;
    }
  }

  .input-group {
    margin-bottom: 1rem;

    .input-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #666;
      margin-bottom: 0.5rem;
      letter-spacing: 0.5px;
    }

    .custom-input {
      width: 100%;
    }
  }

  .start-nav-btn {
    width: 100%;
    height: 48px;
    font-size: 0.95rem;
    font-weight: 600;
    margin-top: 0.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(46, 93, 62, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(46, 93, 62, 0.4);
    }
  }
}

@media (max-width: 599px) {
  .hero-content {
    padding: 2rem 4%;
  }

  .route-card {
    padding: 1.25rem;
  }
}
</style>
