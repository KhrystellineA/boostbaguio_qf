<template>
  <q-page class="pagnaam-page">
    <!-- HERO SECTION (Section 1) -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">PAGNAAM - City Jeeps</h1>
          <p class="hero-description">Discover all jeepney routes operating in Baguio City with comprehensive information about terminals, fares, and operating hours.</p>
        </div>
      </div>
    </section>

    <!-- EXTENDED HERO SECTION (Section 2) -->
    <section class="extended-hero bg-white">
      <div class="container">
        <div class="row items-center">
          <div class="col-md-6 col-12 q-pa-xl">
            <h2 class="text-h4 text-weight-bold text-primary q-mb-lg">Baguio's Jeepney System</h2>
            <p class="text-body1 q-mb-md">
              Baguio City's transportation system centers around its iconic jeepneys - the colorful Filipino public utility vehicles that have become a symbol of the city. Our PAGNAAM feature provides comprehensive information about all routes operating in Baguio City.
            </p>
            <p class="text-body1 q-mb-lg">
              Unlike conventional public transportation systems, Baguio's jeepneys operate with unique routes and terminologies. Our system focuses on teaching you how to navigate this system effectively.
            </p>
            <div class="q-gutter-sm">
              <q-chip square color="primary" text-color="white">Route Information</q-chip>
              <q-chip square color="secondary" text-color="white">Terminal Locations</q-chip>
              <q-chip square color="primary" text-color="white">Operating Hours</q-chip>
            </div>
          </div>
          <div class="col-md-6 col-12 q-pa-xl">
            <div class="image-placeholder bg-grey-3 q-pa-xl rounded-borders">
              <q-icon name="directions_bus" size="64px" color="grey-6"/>
              <div class="text-center q-mt-md">Jeepney Route Visualization</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- JEEPNEY DIRECTORIES SECTION (Section 3) -->
    <section class="directories-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Jeepney Directories</h2>
          <p class="text-body1">Browse all available jeepney routes in Baguio City</p>
        </div>

        <div class="search-bar-section q-mb-xl">
          <q-input
            v-model="searchQuery"
            filled
            placeholder="Search for routes, destinations..."
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="routes-grid">
          <q-card
            v-for="route in filteredRoutes"
            :key="route.id"
            class="route-card q-ma-sm"
            @click="selectRoute(route)"
          >
            <q-img
              :src="route.imageUrl || '~assets/jeepney.png'"
              spinner-color="primary"
              class="route-image"
            />
            <q-card-section>
              <div class="text-h6 text-primary">{{ route.routeName }}</div>
              <div class="text-subtitle2">From: {{ route.terminalStart }}</div>
              <div class="text-subtitle2">To: {{ route.terminalEnd }}</div>
              <div class="row items-center q-mt-md">
                <q-icon name="monetization_on" color="primary" size="xs" class="q-mr-sm" />
                <span>Fare: ₱{{ route.fare }}</span>
              </div>
              <div class="row items-center q-mt-sm">
                <q-icon name="schedule" color="secondary" size="xs" class="q-mr-sm" />
                <span>{{ route.operatingHours }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- JEEPNEY DETAILS SECTION (Section 4) -->
    <section v-if="selectedRoute" class="details-section bg-white q-py-xl">
      <div class="container">
        <div class="row">
          <div class="col-md-8 col-12 q-pa-lg">
            <q-card class="route-detail-card">
              <q-card-section class="bg-primary text-white">
                <div class="row items-center">
                  <div class="col">
                    <div class="text-h5 text-weight-bold">{{ selectedRoute.routeName }}</div>
                    <div class="text-subtitle1">{{ selectedRoute.terminalStart }} → {{ selectedRoute.terminalEnd }}</div>
                  </div>
                  <div class="col-auto">
                    <q-badge color="white" text-color="primary" class="text-bold">
                      ₱{{ selectedRoute.fare }}
                    </q-badge>
                  </div>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="row q-col-gutter-lg">
                  <div class="col-md-6 col-12">
                    <q-list>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="location_on" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Terminal Start</q-item-label>
                          <q-item-label caption>{{ selectedRoute.terminalStart }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="location_city" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Terminal End</q-item-label>
                          <q-item-label caption>{{ selectedRoute.terminalEnd }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="monetization_on" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Fare</q-item-label>
                          <q-item-label caption>₱{{ selectedRoute.fare }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="schedule" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Operating Hours</q-item-label>
                          <q-item-label caption>{{ selectedRoute.operatingHours }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                  <div class="col-md-6 col-12">
                    <div class="q-pa-md bg-grey-2 rounded-borders">
                      <h4 class="text-h6 text-weight-bold text-primary q-mb-md">How to Identify This Jeepney</h4>
                      <ul class="q-pl-md">
                        <li class="q-mb-sm">Look for "{{ selectedRoute.routeName }}" signage on the front and sides</li>
                        <li class="q-mb-sm">Check for route number indicators</li>
                        <li class="q-mb-sm">The driver will call out major stops along the route</li>
                        <li class="q-mb-sm">To get off, tap the side or say "para"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </q-card-section>

              <q-card-actions>
                <q-btn 
                  label="Go There" 
                  color="primary" 
                  @click="navigateToTerminal"
                />
                <q-btn 
                  flat 
                  label="View on Map" 
                  @click="showMap = true"
                  v-close-popup
                />
              </q-card-actions>
            </q-card>
          </div>
          <div class="col-md-4 col-12 q-pa-lg">
            <div class="map-container">
              <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQS SECTION (Section 5) -->
    <section class="faqs-section">
      <div class="container-faqs">
        <div class="faqs-header">
          <h2 class="faqs-title">PAGNAAM FAQs</h2>
          <p class="faqs-description">Common questions about navigating Baguio's jeepney system</p>
        </div>
        <div class="faqs-grid">
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in leftFaqs"
              :key="index"
              :label="faq.question"
              class="faq-item"
              dark
              expand-icon="add"
              expanded-icon="close"
              header-class="faq-header"
            >
              <q-card dark class="faq-card">
                <q-card-section class="faq-answer">
                  {{ faq.answer }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in rightFaqs"
              :key="index"
              :label="faq.question"
              class="faq-item"
              dark
              expand-icon="add"
              expanded-icon="close"
              header-class="faq-header"
            >
              <q-card dark class="faq-card">
                <q-card-section class="faq-answer">
                  {{ faq.answer }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER SECTION (Section 6) -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import FooterSection from '../components/Home/FooterSection.vue'
import fallbackImage from '../assets/44.png'

export default defineComponent({
  name: 'PagnaamPage',
  components: {
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const searchQuery = ref('')
    const allRoutes = ref([])
    const selectedRoute = ref(null)
    const heroImageUrl = ref(fallbackImage)
    const showMap = ref(false)
    let map = null

    const faqs = [
      {
        question: 'How do I identify the correct jeepney?',
        answer: 'Look for the route name and number on the front and sides of the jeepney. Drivers usually call out major stops along the route.'
      },
      {
        question: 'What is the typical fare for Baguio jeepneys?',
        answer: 'Fares typically range from ₱12-20 depending on the route length. Always have exact change as drivers may not have change.'
      },
      {
        question: 'When do jeepneys operate?',
        answer: 'Most jeepneys operate from 5:00 AM to 10:00 PM. Operating hours may vary by route and season.'
      },
      {
        question: 'Can I use this for navigation?',
        answer: 'Yes! PAGNAAM provides comprehensive information about routes and terminals. Combine this with APANAM for complete navigation instructions.'
      }
    ]

    const leftFaqs = computed(() => faqs.slice(0, 2))
    const rightFaqs = computed(() => faqs.slice(2))

    // Filter routes based on search query
    const filteredRoutes = computed(() => {
      if (!searchQuery.value) {
        return allRoutes.value
      }
      return allRoutes.value.filter(route => 
        route.routeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        route.terminalStart.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        route.terminalEnd.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const fetchHeroImage = async () => {
      try {
        console.log('[PagnaamPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'pagnaam')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[PagnaamPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[PagnaamPage] No hero image found in Firestore, using fallback')
        }
      } catch (error) {
        console.error('[PagnaamPage] Error fetching hero image:', error)
      }
    }

    const fetchRoutes = async () => {
      try {
        console.log('[PagnaamPage] Fetching routes from Firebase...')
        const routesQuery = query(collection(db, 'jeepneyOptions'), where('isActive', '==', true))
        const querySnapshot = await getDocs(routesQuery)
        allRoutes.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('[PagnaamPage] Loaded routes:', allRoutes.value.length)
      } catch (error) {
        console.error('[PagnaamPage] Error fetching routes:', error)
        console.log('[PagnaamPage] Using fallback default routes')
        allRoutes.value = getDefaultRoutes()
        $q.notify({
          message: 'Using default jeepney routes',
          color: 'info',
          icon: 'info',
          position: 'top',
        })
      }
    }

    const getDefaultRoutes = () => {
      return [
        {
          id: 'route-1',
          routeName: 'Route 1',
          terminalStart: 'SM Baguio Terminal',
          terminalEnd: 'Burnham Park Terminal',
          fare: 15,
          operatingHours: '5:00 AM - 10:00 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png'
        },
        {
          id: 'route-2',
          routeName: 'Route 2',
          terminalStart: 'Session Road Terminal',
          terminalEnd: 'Lakeside Terminal',
          fare: 20,
          operatingHours: '5:00 AM - 10:00 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png'
        },
        {
          id: 'route-3',
          routeName: 'Route 3',
          terminalStart: 'Market Market Terminal',
          terminalEnd: 'Mines View Terminal',
          fare: 18,
          operatingHours: '5:00 AM - 10:00 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png'
        },
        {
          id: 'route-4',
          routeName: 'Route 4',
          terminalStart: 'University of Baguio Terminal',
          terminalEnd: 'Good Shepherd Terminal',
          fare: 16,
          operatingHours: '5:00 AM - 9:30 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png'
        }
      ]
    }

    const selectRoute = (route) => {
      selectedRoute.value = route
      
      // Initialize map
      setTimeout(() => {
        if (document.getElementById('map')) {
          if (map) {
            map.remove()
          }
          map = L.map('map').setView([16.4122, 120.5948], 13)
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map)
          
          // Add markers for start and end terminals
          if (route.terminalStart) {
            L.marker([16.4122, 120.5948]).addTo(map)
              .bindPopup(route.terminalStart)
          }
          
          if (route.terminalEnd) {
            L.marker([16.4178, 120.6012]).addTo(map)
              .bindPopup(route.terminalEnd)
          }
        }
      }, 100)
    }

    const navigateToTerminal = () => {
      if (selectedRoute.value) {
        // Navigate to APANAM with terminal as destination
        router.push(`/apanam?start=${encodeURIComponent('Current Location')}&end=${encodeURIComponent(selectedRoute.value.terminalStart)}`)
      }
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchRoutes()
      
      // Initialize map if there's a selected route
      if (selectedRoute.value && document.getElementById('map')) {
        map = L.map('map').setView([16.4122, 120.5948], 13)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)
      }
    })

    onUnmounted(() => {
      if (map) {
        map.remove()
      }
    })

    // Watch for search query changes
    watch(searchQuery, (newVal) => {
      console.log('[PagnaamPage] Search query changed:', newVal)
    })

    return {
      searchQuery,
      allRoutes,
      filteredRoutes,
      selectedRoute,
      heroImageUrl,
      showMap,
      faqs,
      leftFaqs,
      rightFaqs,
      selectRoute,
      navigateToTerminal,
    }
  },
})
</script>

<style scoped lang="scss">
.pagnaam-page {
  background-color: #F5F5F5 !important;
}

.hero-section {
  height: 40vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.hero-description {
  font-size: 1.2rem;
  margin: 0;
}

.extended-hero {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.directories-section {
  background-color: #F5F5F5;
}

.search-bar-section {
  max-width: 600px;
  margin: 0 auto;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.route-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #2E5D3E;
}

.route-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.route-image {
  height: 150px;
  object-fit: cover;
}

.route-detail-card {
  border-left: 4px solid #2E5D3E;
}

.details-section {
  background-color: white;
}

// Color Palette Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$brown: #6B5344;
$white: #FFFFFF;

.faqs-section {
  background: $brown;
  padding: 6rem 0;
  color: $white;
  position: relative;
}

.container-faqs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.faqs-header {
  text-align: center;
  margin-bottom: 4rem;
}

.faqs-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: $white;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
}

.faqs-description {
  font-size: 1.05rem;
  color: rgba($white, 0.9);
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-bottom: 4rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  background: rgba($white, 0.1);
  border: 1px solid rgba($white, 0.2);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba($white, 0.15);
    border-color: rgba($white, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  :deep(.q-item) {
    padding: 1.25rem 1.5rem;
  }

  :deep(.q-item__label) {
    font-size: 0.9rem;
    font-weight: 700;
    color: $white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :deep(.q-icon) {
    color: $light-green;
    font-size: 20px;
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-icon) {
    transform: scale(1.1);
  }
}

.faq-card {
  background: transparent;
  box-shadow: none;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  font-size: 0.95rem;
  color: rgba($white, 0.85);
  line-height: 1.7;
}

.bg-primary {
  background-color: #2E5D3E !important;
}

.text-primary {
  color: #2E5D3E !important;
}

.bg-secondary {
  background-color: #8D6E63 !important;
}

.text-secondary {
  color: #8D6E63 !important;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.image-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.map-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .routes-grid {
    grid-template-columns: 1fr;
  }
  
  .row {
    flex-direction: column;
  }
  
  .col-md-6, .col-md-4, .col-md-8 {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>