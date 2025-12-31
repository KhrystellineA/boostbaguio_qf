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
                <h1 class="hero-title scroll-animate">NAVIGATE BAGUIO'S<br />JEEPNEYS WITH EASE</h1>
                <p class="hero-description scroll-animate">
                  Boost Baguio is your go-to app for seamless jeepney navigation in Baguio City.
                  Discover curated tourist spots, real-time updates, and eco-friendly routes — all
                  at your fingertips!
                </p>
                <q-btn
                  label="Learn More"
                  unelevated
                  rounded
                  class="learn-more-btn scroll-animate"
                  size="md"
                />
              </div>

              <div class="right-content">
                <div class="route-card scroll-animate">
                  <div class="input-group">
                    <div class="input-label">FROM:</div>
                    <q-select
                      v-model="fromLocation"
                      :options="fromLocationOptions"
                      filled
                      use-input
                      input-debounce="300"
                      placeholder="Enter starting location"
                      bg-color="white"
                      class="custom-input"
                      @filter="filterFromLocations"
                      behavior="menu"
                    >
                      <template v-slot:prepend>
                        <q-icon name="my_location" />
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Type to search Baguio locations...
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
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
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            Type to search Baguio locations...
                          </q-item-section>
                        </q-item>
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

    <section class="brands-section">
      <div class="container-custom">
        <p class="brands-title scroll-animate">Trusted by top brands for sustainability efforts</p>
        <div class="brands-row">
          <div class="brand-item scroll-animate">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5 9.5c-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z"
              />
            </svg>
            <span class="brand-name">Webflow</span>
          </div>

          <div class="brand-item scroll-animate">
            <div class="brand-circle"></div>
            <span class="brand-name">Relume</span>
          </div>

          <div class="brand-item scroll-animate">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5 9.5c-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z"
              />
            </svg>
            <span class="brand-name">Webflow</span>
          </div>

          <div class="brand-item scroll-animate">
            <div class="brand-circle"></div>
            <span class="brand-name">Relume</span>
          </div>

          <div class="brand-item scroll-animate">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5 9.5c-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z"
              />
            </svg>
            <span class="brand-name">Webflow</span>
          </div>
        </div>
      </div>
    </section>

    <FeaturesSection />

    <GuideSection />

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
import GuideSection from '../components/Home/GuideSection.vue'
import AboutSection from '../components/Home/AboutSection.vue'
import GallerySection from '../components/Home/GallerySection.vue'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default {
  name: 'BaguioHero',
  components: {
    FeaturesSection,
    GuideSection,
    AboutSection,
    GallerySection,
    FAQSection,
    FooterSection,
  },
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const fromLocation = ref(null)
    const toLocation = ref(null)
    const fromLocationOptions = ref([])
    const toLocationOptions = ref([])
    const heroImage = ref('')
    const defaultHeroImage = 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=900&fit=crop'

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
          fromLocationOptions.value = [
            {
              label: '📍 Use Current Location',
              value: 'current-location',
              isCurrentLocation: true,
            },
            ...baguioLocations,
          ]
        } else {
          const filtered = baguioLocations.filter(
            (loc) => loc.label.toLowerCase().indexOf(needle) > -1
          )
          fromLocationOptions.value = [
            {
              label: '📍 Use Current Location',
              value: 'current-location',
              isCurrentLocation: true,
            },
            ...filtered,
          ]
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
      // Load hero image from Firebase
      loadHeroImage()

      // Initialize location options
      fromLocationOptions.value = [
        { label: '📍 Use Current Location', value: 'current-location', isCurrentLocation: true },
        ...baguioLocations,
      ]
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
      fromLocation,
      toLocation,
      fromLocationOptions,
      toLocationOptions,
      heroImage,
      defaultHeroImage,
      filterFromLocations,
      filterToLocations,
      startNavigation,
    }
  },
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  background: #99928b;
  min-height: 100vh;
  padding: 0;
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

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.container-custom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.hero-box {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 3rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  width: 100%;
  align-items: center;
}

.left-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hero-description {
  font-size: 0.95rem;
  color: white;
  line-height: 1.6;
  margin-bottom: 1.75rem;
  opacity: 0.95;
}

.learn-more-btn {
  background: white !important;
  color: #1a1a1a !important;
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
}

.route-card {
  background: rgba(211, 211, 211, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.input-group {
  margin-bottom: 1.25rem;

  &:last-of-type {
    margin-bottom: 1.75rem;
  }
}

.input-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4a4a4a;
  margin-bottom: 0.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    min-height: 48px;
    background: white;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  :deep(.q-field__native) {
    font-size: 0.95rem;
  }
}

.start-nav-btn {
  background: white !important;
  color: #1a1a1a !important;
  font-weight: 600;
  border-radius: 10px;
  text-transform: none;
  font-size: 0.9rem;
  width: 100%;
  height: 48px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.brands-section {
  background: #4a5f4a;
  padding: 3rem 0;
}

.brands-title {
  text-align: center;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
}

.brands-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.brand-icon {
  width: 24px;
  height: 24px;
}

.brand-circle {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

@media (max-width: 1023px) {
  .hero-section {
    padding: 1rem 0;
  }

  .hero-box {
    height: auto;
    min-height: calc(100vh - 2rem);
  }

  .hero-content {
    padding: 2rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2rem;
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
}

@media (max-width: 599px) {
  .hero-section {
    padding: 0.5rem;
  }

  .container-custom {
    padding: 0 0.5rem;
  }

  .hero-box {
    border-radius: 16px;
    min-height: calc(100vh - 1rem);
  }

  .hero-content {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-description {
    font-size: 0.875rem;
  }

  .route-card {
    padding: 1.5rem;
  }

  .brands-row {
    gap: 2rem;
  }
}
</style>