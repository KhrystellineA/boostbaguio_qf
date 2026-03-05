<template>
  <q-page class="page-wrapper">
    <section class="hero-section">
      <div class="container-custom">
        <div class="hero-box">
          <div class="hero-bg-wrapper">
            <q-img
              :src="heroImage || defaultHeroImage"
              class="hero-bg"
              :ratio="16/9"
            >
              <template v-slot:loading>
                <div class="absolute-full flex flex-center">
                  <q-spinner color="white" size="50px" />
                </div>
              </template>
            </q-img>
            <div class="hero-overlay"></div>
          </div>

          <div class="hero-content">
            <div class="content-grid">
              <div class="left-content">
                <h1 class="hero-title scroll-animate">BOOST BAGUIO</h1>
                <p class="hero-description scroll-animate">
                  Commute like a local in Baguio with ease. Discover tourist spots, events, and nearby attractions
                  right at the palm of your hand!
                </p>
                <p class="hero-tagline scroll-animate">Navigate. Connect. Sustain.</p>
              </div>

              <div class="right-content">
                <div class="route-card scroll-animate">
                  <div class="card-header">
                    <q-icon name="navigation" size="24px" class="q-mr-sm" />
                    <span class="card-title">APANAM - Point to Point Navigation</span>
                  </div>

                  <div class="input-group">
                    <div class="input-label">FROM:</div>
                    <q-input
                      v-if="!fromAutoDetect"
                      v-model="fromLocationText"
                      filled
                      placeholder="Enter starting location"
                      bg-color="white"
                      class="custom-input"
                      @keyup.enter="searchFromLocation"
                    >
                      <template v-slot:prepend>
                        <q-icon name="my_location" color="grey-7" />
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
                          style="margin-right: -8px;"
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
                    >
                      <template v-slot:prepend>
                        <q-icon name="gps_fixed" color="positive" />
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
                          style="margin-right: -8px;"
                        >
                          <q-tooltip>Enter location manually</q-tooltip>
                        </q-btn>
                      </template>
                    </q-input>
                  </div>

                  <div class="input-group">
                    <div class="input-label">TO:</div>
                    <q-select
                      v-model="toLocation"
                      :options="toLocationOptions"
                      filled
                      use-input
                      input-debounce="300"
                      placeholder="Enter destination"
                      bg-color="white"
                      class="custom-input"
                      @filter="filterToLocations"
                      behavior="menu"
                    >
                      <template v-slot:prepend>
                        <q-icon name="place" />
                      </template>
                    </q-select>
                  </div>

                  <q-btn
                    label="Start Navigation"
                    unelevated
                    class="start-nav-btn"
                    size="md"
                    @click="startNavigation"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="partners-section">
      <div class="partners-wrapper">
        <h2 class="partners-title scroll-animate">Our Partners</h2>
        <div class="partners-marquee">
          <div class="partners-track">
            <!-- First set of partners -->
            <div class="partners-row">
              <div class="partner-card" v-for="(partner, index) in partners" :key="index">
                <div class="partner-icon">
                  <q-icon :name="partner.icon" size="48px" color="primary" />
                </div>
                <div class="partner-name">{{ partner.name }}</div>
              </div>
            </div>
            <!-- Duplicate set for seamless loop -->
            <div class="partners-row" aria-hidden="true">
              <div class="partner-card" v-for="(partner, index) in partners" :key="`dup-${index}`">
                <div class="partner-icon">
                  <q-icon :name="partner.icon" size="48px" color="primary" />
                </div>
                <div class="partner-name">{{ partner.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FeaturesSection />

    <AboutSection />

    <GallerySection />

    <FAQSection />

    <FooterSection />
  </q-page>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import FeaturesSection from '../components/Home/FeaturesSection.vue'
import AboutSection from '../components/Home/AboutSection.vue'
import GallerySection from '../components/Home/GallerySection.vue'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default {
  name: 'BaguioHero',
  components: {
    FeaturesSection,
    AboutSection,
    GallerySection,
    FAQSection,
    FooterSection,
  },
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const fromLocationText = ref('')
    const fromLocation = ref(null)
    const toLocation = ref(null)
    const fromLocationOptions = ref([])
    const toLocationOptions = ref([])
    const fromAutoDetect = ref(false)
    const heroImage = ref('')
    const defaultHeroImage = 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=900&fit=crop'

    const partners = [
      { name: 'University of the Cordilleras', icon: 'school' },
      { name: 'Baguio Tourism Office', icon: 'tour' },
      { name: 'Baguio City Engineer\'s Office', icon: 'engineering' },
      { name: 'Baguio City Hall', icon: 'domain' },
      { name: 'Baguio MITD', icon: 'business' },
    ]

    const baguioLocations = [
      { label: 'SM City Baguio', value: 'sm-baguio', coords: [16.4088516, 120.5972273] },
      { label: 'Burnham Park', value: 'burnham-park', coords: [16.40954, 120.594808] },
      { label: 'Session Road', value: 'session-road', coords: [16.4091098, 120.597576] },
      { label: 'Baguio Cathedral', value: 'baguio-cathedral', coords: [16.412766, 120.598469] },
      { label: 'Baguio City Market', value: 'baguio-market', coords: [16.4149596, 120.5929984] },
      { label: 'Camp John Hay', value: 'camp-john-hay', coords: [16.397029, 120.608785] },
      { label: 'Mines View Park', value: 'mines-view', coords: [16.4240885, 120.6212975] },
      { label: 'Wright Park', value: 'wright-park', coords: [16.4156996, 120.6123524] },
      { label: 'The Mansion', value: 'the-mansion', coords: [16.4123678, 120.6188978] },
      { label: "Teacher's Camp", value: 'teachers-camp', coords: [16.4130217, 120.6072952] },
      { label: 'Botanical Garden', value: 'botanical-garden', coords: [16.4176, 120.597] },
      { label: 'Baguio Convention Center', value: 'convention-center', coords: [16.409, 120.594] },
      { label: 'Baguio General Hospital', value: 'bgh', coords: [16.4068, 120.5995] },
      { label: 'University of Baguio', value: 'ub', coords: [16.4111, 120.6005] },
      { label: 'Saint Louis University', value: 'slu', coords: [16.4133, 120.5967] },
      { label: 'Good Shepherd Convent', value: 'good-shepherd', coords: [16.4196, 120.604] },
      { label: 'Tam-awan Village', value: 'tam-awan', coords: [16.4231, 120.5889] },
      { label: 'Lourdes Grotto', value: 'lourdes-grotto', coords: [16.4253, 120.5972] },
      { label: 'PMA (Philippine Military Academy)', value: 'pma', coords: [16.3928, 120.5962] },
      { label: 'BenCab Museum', value: 'bencab-museum', coords: [16.3989, 120.5756] },
      { label: 'Strawberry Farm', value: 'strawberry-farm', coords: [16.3989, 120.5989] },
      { label: 'Igorot Stone Kingdom', value: 'igorot-stone-kingdom', coords: [16.4589, 120.5889] },
      { label: 'Baguio National Museum', value: 'national-museum', coords: [16.4156, 120.5989] },
      { label: 'Mirador Park', value: 'mirador-park', coords: [16.4267, 120.5956] },
      { label: 'Baguio Craft Brewery', value: 'craft-brewery', coords: [16.4056, 120.5989] },
      { label: 'Café by the Ruins', value: 'cafe-ruins', coords: [16.4145, 120.6012] },
      { label: 'Volcano Island Coffee', value: 'volcano-coffee', coords: [16.4145, 120.5972] },
      { label: 'Pinecone House', value: 'pinecone-house', coords: [16.4123, 120.5967] },
      { label: 'Baguio Country Club', value: 'country-club', coords: [16.4089, 120.6123] },
      { label: 'La Trinidad Fish Market', value: 'fish-market', coords: [16.3989, 120.5956] },
      { label: 'Baguio Sunset Point', value: 'sunset-point', coords: [16.4189, 120.5856] },
      { label: 'Baguio Heritage Park', value: 'heritage-park', coords: [16.4112, 120.5945] },
      { label: 'Baguio Arts Village', value: 'arts-village', coords: [16.4245, 120.5878] },
    ]

    const loadHeroImage = async () => {
      try {
        console.log('[IndexPage] Loading hero image from Firebase...')
        const docRef = doc(db, 'pagePhotos', 'home')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.imageUrl) {
            heroImage.value = data.imageUrl
            console.log('[IndexPage] Hero image loaded:', data.imageUrl)
          } else {
            console.log('[IndexPage] No custom hero image, using default')
          }
        } else {
          console.log('[IndexPage] No hero image document, using default')
        }
      } catch (error) {
        console.error('[IndexPage] Error loading hero image:', error)
        $q.notify({
          type: 'warning',
          message: 'Using default hero image',
          position: 'top',
          timeout: 2000
        })
      }
    }

    const filterFromLocations = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        if (needle === '') {
          fromLocationOptions.value = baguioLocations
        } else {
          fromLocationOptions.value = baguioLocations.filter(
            (loc) => loc.label.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }

    const filterToLocations = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        if (needle === '') {
          toLocationOptions.value = [...baguioLocations]
        } else {
          toLocationOptions.value = baguioLocations.filter(
            (loc) => loc.label.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }

    const enableFromAutoDetect = async () => {
      fromAutoDetect.value = true
      
      const loadingNotify = $q.notify({
        message: 'Detecting your location...',
        icon: 'gps_not_fixed',
        color: 'primary',
        timeout: 0,
        spinner: true,
      })

      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser')
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          })
        })

        const { latitude, longitude } = position.coords
        
        fromLocationText.value = 'Your Current Location'
        fromLocation.value = {
          label: '📍 Your Current Location',
          value: 'current-location',
          isCurrentLocation: true,
          coords: [latitude, longitude]
        }

        loadingNotify()
        
        $q.notify({
          message: 'Location detected successfully!',
          icon: 'gps_fixed',
          color: 'positive',
          timeout: 2000,
          position: 'top'
        })
      } catch (error) {
        loadingNotify()
        fromAutoDetect.value = false
        fromLocationText.value = ''
        fromLocation.value = null
        
        $q.notify({
          message: error.message || 'Unable to detect your location',
          icon: 'warning',
          color: 'negative',
          timeout: 3000,
          position: 'top'
        })
      }
    }

    const disableFromAutoDetect = () => {
      fromAutoDetect.value = false
      fromLocation.value = null
    }

    const searchFromLocation = () => {
      if (!fromLocationText.value.trim()) {
        $q.notify({
          message: 'Please enter a location',
          icon: 'warning',
          color: 'warning',
          timeout: 2000,
          position: 'top'
        })
        return
      }

      // For now, just store the text as the location
      // In production, you would call a geocoding API here
      fromLocation.value = {
        label: fromLocationText.value,
        value: 'custom-location',
        isCurrentLocation: false,
        coords: null // Would get from geocoding API
      }

      $q.notify({
        message: `Searching for "${fromLocationText.value}"...`,
        icon: 'search',
        color: 'primary',
        timeout: 2000,
        position: 'top'
      })
    }

    const startNavigation = () => {
      if (!fromLocation.value || !toLocation.value) {
        $q.notify({
          message: 'Please select both starting and destination points',
          color: 'warning',
          icon: 'warning',
        })
        return
      }

      const queryParams = {
        toName: toLocation.value.label,
        toLat: toLocation.value.coords[0],
        toLng: toLocation.value.coords[1],
      }

      if (fromLocation.value.isCurrentLocation) {
        router.push({
          path: '/apanam',
          query: queryParams,
        })
      } else {
        queryParams.fromName = fromLocation.value.label
        queryParams.fromLat = fromLocation.value.coords[0]
        queryParams.fromLng = fromLocation.value.coords[1]

        router.push({
          path: '/apanam',
          query: queryParams,
        })
      }
    }

    const scrollToFeatures = () => {
      const featuresSection = document.querySelector('#features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const observeElements = () => {
      const options = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, options)

      const elements = document.querySelectorAll('.scroll-animate')
      elements.forEach((el) => observer.observe(el))

      return observer
    }

    let observer

    onMounted(() => {
      // Check if admin - redirect to admin dashboard
      const adminRole = sessionStorage.getItem('adminRole')
      const adminRoles = ['super_admin', 'routes_admin', 'places_admin', 'events_admin']
      if (adminRoles.includes(adminRole)) {
        router.push('/admin/dashboard')
        return
      }

      // Load hero image from Firebase
      loadHeroImage()

      // Initialize location options
      fromLocationOptions.value = [...baguioLocations]
      toLocationOptions.value = [...baguioLocations]

      // Setup scroll animations
      setTimeout(() => {
        observer = observeElements()
      }, 100)
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      fromLocationText,
      fromLocation,
      toLocation,
      fromLocationOptions,
      toLocationOptions,
      fromAutoDetect,
      heroImage,
      defaultHeroImage,
      filterFromLocations,
      filterToLocations,
      enableFromAutoDetect,
      disableFromAutoDetect,
      searchFromLocation,
      startNavigation,
      partners,
      scrollToFeatures,
    }
  },
}
</script>

<style lang="scss" scoped>
// Color Palette Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$brown: #6B5344;
$white: #FFFFFF;

// Cute minimalist colors
$soft-green: #E8F5E9;
$mint-cream: #F1F8F4;
$blush-pink: #FCE4EC;
$soft-peach: #FFE5D9;
$lavender-mist: #F3E5F5;

// Glassmorphism
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: rgba(255, 255, 255, 0.3);
$glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

.page-wrapper {
  background: linear-gradient(180deg, $mint-cream 0%, $white 100%) !important;
  min-height: 100vh;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scroll-animate {
  opacity: 0;
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;

  &.animate-in {
    opacity: 1;
    animation-duration: 0.8s;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:nth-child(1) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.1s;
    }
  }

  &:nth-child(2) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.2s;
    }
  }

  &:nth-child(3) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.3s;
    }
  }

  &:nth-child(4) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.4s;
    }
  }

  &:nth-child(5) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.5s;
    }
  }
}

.route-card.scroll-animate {
  &.animate-in {
    animation-name: fadeInRight;
    animation-delay: 0.3s;
  }
}

// Bento Grid Animation
.bento-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-section {
  width: 100%;
  min-height: 100vh !important;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  position: relative;
  background: none;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
}

.container-custom {
  max-width: 100%;
  margin: 0;
  padding: 0;
  width: 100%;
  position: relative;
  z-index: 1;
}

.hero-box {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

.hero-bg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

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
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 5rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  align-items: center;
  padding: 4rem 5%;
}

.left-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
}

.hero-title {
  font-size: 3.75rem;
  font-weight: 800;
  color: white;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.hero-description {
  font-size: 1.15rem;
  color: rgba($white, 0.95);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-weight: 300;
  max-width: 560px;
}

.hero-tagline {
  font-size: 1.1rem;
  color: rgba($white, 0.9);
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 0;
  padding-top: 1.25rem;
  border-top: 2px solid rgba($white, 0.3);
}

.learn-more-btn {
  background: white !important;
  color: #2E5D3E !important;
  font-weight: 600;
  padding: 0.625rem 1.75rem;
  border-radius: 50px;
  text-transform: none;
  font-size: 0.9rem;
  align-self: flex-start;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.right-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.route-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 440px;
  margin-left: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  border: none;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 100%
    );
    border-radius: 20px 20px 0 0;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.5);
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba($primary-green, 0.15);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: $primary-green;
  letter-spacing: 0.02em;
  line-height: 1.3;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

.input-group {
  margin-bottom: 1.25rem;

  &:last-of-type {
    margin-bottom: 1.5rem;
  }
}

.input-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: $brown;
  margin-bottom: 0.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.input-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  .input-label {
    margin-bottom: 0;
  }
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    min-height: 48px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(248, 248, 248, 1) 100%
    );
    transition: all 0.3s ease;
    border: 1.5px solid rgba($primary-green, 0.15);
    box-shadow:
      inset 0 2px 4px rgba(0, 0, 0, 0.06),
      0 1px 0 rgba(255, 255, 255, 1);

    &:hover {
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.08),
        0 4px 12px rgba($primary-green, 0.1);
      border-color: $primary-green;
    }

    &.q-field--focused {
      border-color: $primary-green;
      box-shadow:
        inset 0 2px 4px rgba(0, 0, 0, 0.1),
        0 6px 20px rgba($primary-green, 0.15),
        0 0 0 3px rgba($primary-green, 0.08);
    }
  }

  :deep(.q-field__native) {
    font-size: 0.9rem;
    color: $dark-green;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  :deep(.q-field__label) {
    color: #999;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  }
}

.start-nav-btn {
  background: linear-gradient(
    180deg,
    $primary-green 0%,
    $dark-green 100%
  ) !important;
  color: white !important;
  font-weight: 600;
  border-radius: 10px;
  text-transform: none;
  font-size: 0.95rem;
  width: 100%;
  height: 48px;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 16px rgba($primary-green, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 100%
    );
    border-radius: 10px 10px 0 0;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 24px rgba($primary-green, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow:
      0 4px 12px rgba($primary-green, 0.3),
      inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.partners-section {
  background: linear-gradient(180deg, $white 0%, $mint-cream 100%);
  padding: 5rem 0;
  overflow: hidden;
  position: relative;
}

.partners-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  width: 100%;
}

.partners-title {
  text-align: center;
  color: $primary-green;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 3.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, $primary-green, $light-green);
    border-radius: 2px;
  }
}

.partners-marquee {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 1rem 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 150px;
    height: 100%;
    z-index: 2;
    pointer-events: none;
  }

  &::before {
    left: 0;
    background: linear-gradient(90deg, $mint-cream 0%, transparent 100%);
  }

  &::after {
    right: 0;
    background: linear-gradient(-90deg, $mint-cream 0%, transparent 100%);
  }
}

.partners-track {
  display: flex;
  width: max-content;
  animation: scrollPartners 35s linear infinite;
}

.partners-row {
  display: flex;
  gap: 3rem;
  padding-right: 3rem;
}

@keyframes scrollPartners {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.partner-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  background: $white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-width: 220px;
  border: 1px solid rgba($primary-green, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 12px 40px rgba($primary-green, 0.15);
    background: linear-gradient(135deg, $soft-green 0%, rgba($light-green, 0.05) 100%);
    border-color: rgba($primary-green, 0.2);
  }
}

.partner-icon {
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: linear-gradient(135deg, $soft-green 0%, $mint-cream 100%);
  transition: all 0.3s ease;

  .partner-card:hover & {
    background: linear-gradient(135deg, $light-green 0%, $soft-green 100%);
    transform: scale(1.1) rotate(5deg);
  }
}

.partner-name {
  font-weight: 600;
  color: $dark-green;
  font-size: 0.95rem;
  line-height: 1.4;
  transition: color 0.3s ease;

  .partner-card:hover & {
    color: $primary-green;
  }
}

@media (max-width: 1023px) {
  .hero-section {
    padding: 0;
  }

  .hero-box {
    height: auto;
    min-height: 100vh;
  }

  .hero-content {
    padding: 3rem 5%;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 0;
    max-width: 100%;
  }

  .left-content {
    max-width: 100%;
  }

  .hero-title {
    font-size: 2.75rem;
  }

  .hero-description {
    font-size: 1.05rem;
    max-width: 100%;
  }

  .right-content {
    justify-content: center;
  }

  .route-card {
    max-width: 100%;
  }

  .route-card.scroll-animate {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.4s;
    }
  }

  .partners-section {
    padding: 4rem 0;
  }

  .partners-wrapper {
    padding: 0 2rem;
  }

  .partners-title {
    font-size: 1.75rem;
    margin-bottom: 2.5rem;
  }

  .partner-card {
    min-width: 180px;
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 599px) {
  .container-custom {
    padding: 0;
  }

  .hero-section {
    padding: 0;

    &::before {
      display: none;
    }
  }

  .hero-box {
    border-radius: 0;
    min-height: 100vh;
  }

  .hero-content {
    padding: 2.5rem 5%;
  }

  .hero-title {
    font-size: 2.25rem;
    margin-bottom: 1rem;
  }

  .hero-description {
    font-size: 1rem;
    line-height: 1.6;
  }

  .hero-tagline {
    font-size: 0.95rem;
    letter-spacing: 0.15em;
  }

  .route-card {
    padding: 1.75rem;
    border-radius: 16px;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .partners-section {
    padding: 3rem 0;
    background: $mint-cream;
  }

  .partners-title {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }

  .partners-row {
    gap: 1.5rem;
    padding-right: 1.5rem;
  }

  .partner-card {
    min-width: 150px;
    padding: 1.5rem 1rem;
  }

  .partner-icon {
    width: 60px;
    height: 60px;
  }
}

// ============================================
// Mobile Responsive Fixes (max-width: 599px)
// ============================================
@media (max-width: 599px) {
  .page-wrapper {
    overflow-x: hidden;
  }

  .hero-section {
    padding: 0;
    margin: 0;

    .hero-box {
      border-radius: 0;
      overflow: hidden;
    }
  }

  .container-custom {
    padding: 0;
  }

  .hero-content {
    padding: 2.5rem 5%;

    .content-grid {
      grid-template-columns: 1fr;
      gap: 2.5rem;
    }

    .left-content,
    .right-content {
      width: 100%;
    }
  }

  .hero-title {
    font-size: 2rem;
    word-break: break-word;
    line-height: 1.2;
  }

  .hero-description {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .hero-tagline {
    font-size: 0.9rem;
    letter-spacing: 0.1em;
  }

  .route-card {
    padding: 1.75rem;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 0.98);
    max-width: 100%;
    margin: 0;

    .card-header {
      flex-direction: column;
      gap: 8px;

      .card-title {
        font-size: 1.05rem;
        text-align: center;
      }
    }
  }

  .input-group {
    margin-bottom: 1rem;

    .input-label {
      font-size: 0.65rem;
    }

    .q-field {
      min-height: 46px;

      .q-field__control {
        min-height: 46px;
      }

      .q-field__label {
        font-size: 0.8rem;
      }
    }
  }

  .start-nav-btn {
    min-height: 48px;
    font-size: 0.9rem;
  }

  .partners-section {
    padding: 2.5rem 0;
  }

  .partners-title {
    font-size: 1.35rem;
    text-align: center;
  }

  .partners-row {
    justify-content: center;
    padding: 0 1rem;

    .partner-card {
      min-width: 130px;
      padding: 1.25rem 0.75rem;

      .partner-icon {
        width: 50px;
        height: 50px;
      }

      .partner-name {
        font-size: 0.8rem;
      }
    }
  }

  // Fix for q-select dropdown on mobile
  .q-menu {
    max-width: 90vw;
  }

  // Ensure buttons are touch-friendly
  .q-btn {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
}

// ============================================
// Tablet Responsive (600px - 1023px)
// ============================================
@media (min-width: 600px) and (max-width: 1023px) {
  .container-custom {
    padding: 0;
  }

  .hero-content {
    padding: 3rem 5%;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .route-card {
    padding: 1.75rem;
  }
}
</style>