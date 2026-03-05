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
            outlined
            placeholder="Search by jeepney name, terminal, destination, or tourist spot..."
            dense
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn
                v-if="searchQuery"
                flat
                dense
                icon="clear"
                @click="searchQuery = ''"
              >
                <q-tooltip>Clear Search</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <div class="row justify-between items-center q-mt-xs">
            <div class="text-caption text-grey-7">
              <span v-if="searchQuery">
                Found {{ filteredRoutes.length }} jeepney(s) matching "{{ searchQuery }}"
              </span>
              <span v-else>
                Showing all {{ allRoutes.length }} jeepney(s) - Sorted A-Z
              </span>
            </div>
          </div>
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
              <div class="text-h6 text-primary text-weight-bold">{{ route.jeepName || route.routeName }}</div>
              <div class="text-subtitle2 text-grey-7 q-mt-xs">
                <q-icon name="location_on" size="14px" class="q-mr-xs" color="primary" />
                Terminal: {{ route.terminalLocation }}
              </div>
              <div class="text-subtitle2 text-grey-7 q-mt-xs">
                <q-icon name="flag" size="14px" class="q-mr-xs" color="secondary" />
                Destination: {{ route.endPoint }}
              </div>
              
              <!-- Fare Matrix -->
              <div class="fare-matrix q-mt-md">
                <div class="text-caption text-grey-7 q-mb-xs">Fare Matrix:</div>
                <div class="row q-col-gutter-xs">
                  <div class="col-6">
                    <q-badge color="primary" text-color="white" class="full-width">
                      <q-icon name="person" size="12px" class="q-mr-xs" />
                      Regular: ₱{{ route.fareRegular || route.fare }}
                    </q-badge>
                  </div>
                  <div class="col-6">
                    <q-badge color="secondary" text-color="white" class="full-width">
                      <q-icon name="school" size="12px" class="q-mr-xs" />
                      Student: ₱{{ route.fareStudent || route.fare }}
                    </q-badge>
                  </div>
                  <div class="col-6">
                    <q-badge color="accent" text-color="white" class="full-width">
                      <q-icon name="favorite" size="12px" class="q-mr-xs" />
                      Senior: ₱{{ route.fareSenior || route.fare }}
                    </q-badge>
                  </div>
                  <div class="col-6">
                    <q-badge color="info" text-color="white" class="full-width">
                      <q-icon name="accessible" size="12px" class="q-mr-xs" />
                      PWD: ₱{{ route.farePWD || route.fare }}
                    </q-badge>
                  </div>
                </div>
              </div>
              
              <!-- Operating Hours -->
              <div class="row items-center q-mt-md">
                <q-icon name="schedule" color="primary" size="xs" class="q-mr-sm" />
                <span class="text-caption">
                  <span v-if="route.operatingHours?.open && route.operatingHours?.close">
                    {{ formatOperatingHours(route.operatingHours) }}
                  </span>
                  <span v-else class="text-grey-7">Operating hours not specified</span>
                </span>
              </div>
              
              <!-- Tourist Spots Serviced -->
              <div v-if="route.touristSpotsServiced && route.touristSpotsServiced.length > 0" class="q-mt-md">
                <div class="text-caption text-grey-7 q-mb-xs">Tourist Spots:</div>
                <div class="row q-gutter-xs">
                  <q-badge
                    v-for="(spot, idx) in route.touristSpotsServiced.slice(0, 3)"
                    :key="idx"
                    color="grey-2"
                    text-color="grey-8"
                    class="text-caption"
                  >
                    {{ spot }}
                  </q-badge>
                  <q-badge
                    v-if="route.touristSpotsServiced.length > 3"
                    color="grey-2"
                    text-color="grey-8"
                    class="text-caption"
                  >
                    +{{ route.touristSpotsServiced.length - 3 }}
                  </q-badge>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- JEEPNEY DETAILS DIALOG -->
    <q-dialog v-model="showRouteDialog">
      <q-card class="route-dialog-card" style="min-width: 1100px;">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6 text-weight-bold">
            <q-icon name="directions_bus" class="q-mr-sm" />
            {{ selectedRoute?.routeName || selectedRoute?.jeepName }}
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-lg">
            <div class="col-lg-5 col-12">
              <q-card flat bordered class="q-pa-md">
                <q-card-section class="q-pa-none">
                  <div class="text-h5 text-primary text-weight-bold q-mb-md">Route Information</div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-12">
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="location_on" color="primary" size="md" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Terminal Start</q-item-label>
                          <q-item-label caption>{{ selectedRoute?.terminalStart || selectedRoute?.terminalLocation }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                    <div class="col-12">
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="location_city" color="primary" size="md" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Terminal End</q-item-label>
                          <q-item-label caption>{{ selectedRoute?.terminalEnd || selectedRoute?.endPoint }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                    <div class="col-12">
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="monetization_on" color="primary" size="md" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Fare Matrix</q-item-label>
                          <q-item-label caption>
                            <div class="row q-gutter-sm q-mt-xs">
                              <q-badge color="primary" text-color="white">
                                <q-icon name="person" size="12px" class="q-mr-xs" />
                                Regular: ₱{{ selectedRoute?.fareRegular || selectedRoute?.fare }}
                              </q-badge>
                              <q-badge color="secondary" text-color="white">
                                <q-icon name="school" size="12px" class="q-mr-xs" />
                                Student: ₱{{ selectedRoute?.fareStudent || selectedRoute?.fare }}
                              </q-badge>
                              <q-badge color="accent" text-color="white">
                                <q-icon name="favorite" size="12px" class="q-mr-xs" />
                                Senior: ₱{{ selectedRoute?.fareSenior || selectedRoute?.fare }}
                              </q-badge>
                              <q-badge color="info" text-color="white">
                                <q-icon name="accessible" size="12px" class="q-mr-xs" />
                                PWD: ₱{{ selectedRoute?.farePWD || selectedRoute?.fare }}
                              </q-badge>
                            </div>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                    <div class="col-12">
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="schedule" color="primary" size="md" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-bold">Operating Hours</q-item-label>
                          <q-item-label caption>
                            {{ formatOperatingHours(selectedRoute?.operatingHours) }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <div class="q-pa-md bg-grey-2 rounded-borders">
                    <h4 class="text-h6 text-weight-bold text-primary q-mb-md">How to Identify This Jeepney</h4>
                    <ul class="q-pl-md">
                      <li class="q-mb-sm">Look for "{{ selectedRoute?.routeName || selectedRoute?.jeepName }}" signage on the front and sides</li>
                      <li class="q-mb-sm">Check for route number indicators</li>
                      <li class="q-mb-sm">The driver will call out major stops along the route</li>
                      <li class="q-mb-sm">To get off, tap the side or say "para"</li>
                    </ul>
                  </div>

                  <q-separator class="q-my-md" />

                  <div v-if="selectedRoute?.touristSpotsServiced && selectedRoute.touristSpotsServiced.length > 0" class="q-mt-md">
                    <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Tourist Spots Along the Route</h4>
                    <div class="row q-gutter-sm">
                      <q-badge
                        v-for="(spot, idx) in selectedRoute.touristSpotsServiced"
                        :key="idx"
                        color="primary"
                        text-color="white"
                        class="text-body2"
                      >
                        <q-icon name="attractions" size="14px" class="q-mr-xs" />
                        {{ spot }}
                      </q-badge>
                    </div>
                  </div>
                </q-card-section>

                <q-card-actions align="center" class="q-mt-lg">
                  <q-btn
                    label="Navigate to Terminal"
                    color="primary"
                    icon="navigation"
                    @click="navigateToTerminal"
                    class="q-mr-sm"
                  />
                  <q-btn
                    flat
                    label="Close"
                    color="grey"
                    v-close-popup
                  />
                </q-card-actions>
              </q-card>
            </div>

            <div class="col-lg-7 col-12">
              <q-card flat bordered class="map-card" style="height: 550px;">
                <div id="route-map" style="height: 100%; width: 100%; min-height: 550px; background: #e8e8e8;"></div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

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
    const showRouteDialog = ref(false)
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
      let result = allRoutes.value

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(route =>
          (route.jeepName || route.routeName)?.toLowerCase().includes(query) ||
          route.terminalLocation?.toLowerCase().includes(query) ||
          route.endPoint?.toLowerCase().includes(query) ||
          route.touristSpotsServiced?.some(spot => spot.toLowerCase().includes(query))
        )
      }

      // Sort alphabetically by jeepney name
      result.sort((a, b) => {
        const nameA = (a.jeepName || a.routeName || '').toLowerCase()
        const nameB = (b.jeepName || b.routeName || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })

      return result
    })

    const formatOperatingHours = (hours) => {
      if (!hours || !hours.open || !hours.close) return 'Not specified'
      
      const formatTime = (timeStr) => {
        if (!timeStr) return ''
        const [hours, minutes] = timeStr.split(':')
        const period = parseInt(hours) >= 12 ? 'PM' : 'AM'
        const displayHours = parseInt(hours) % 12 || 12
        return `${displayHours}:${minutes || '00'}${period}`
      }
      
      const openTime = formatTime(hours.open)
      const closeTime = formatTime(hours.close)
      
      return `${openTime} - ${closeTime}`
    }

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
        const routesQuery = query(collection(db, 'jeepneys'), where('isActive', '==', true))
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
      showRouteDialog.value = true

      console.log('[PagnaamPage] Selected route:', route)
      console.log('[PagnaamPage] Route coordinates:', route.routeCoordinates)
      console.log('[PagnaamPage] Dialog show state:', showRouteDialog.value)
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
    })

    // Watch for dialog opening
    watch(showRouteDialog, async (newVal) => {
      if (newVal) {
        console.log('=== [PagnaamPage] === DIALOG OPENED ===')
        // Wait for dialog to fully render
        await new Promise(resolve => setTimeout(resolve, 500))
        initMap()
      } else {
        console.log('[PagnaamPage] Dialog closed, cleaning up map...')
        if (map) {
          map.remove()
          map = null
        }
        selectedRoute.value = null
      }
    })

    const initMap = () => {
      console.log('[PagnaamPage] Initializing map...')
      console.log('[PagnaamPage] Selected route:', selectedRoute.value?.routeName)
      
      const mapElement = document.getElementById('route-map')
      console.log('[PagnaamPage] Map element:', mapElement)
      console.log('[PagnaamPage] Map element dimensions:', mapElement?.offsetWidth, 'x', mapElement?.offsetHeight)
      console.log('[PagnaamPage] Map element computed style:', window.getComputedStyle(mapElement).height)
      
      if (mapElement) {
        if (map) {
          map.remove()
          map = null
          console.log('[PagnaamPage] Previous map removed')
        }
        
        console.log('[PagnaamPage] Creating new map instance...')
        
        // Create map
        map = L.map('route-map', {
          center: [16.4122, 120.5948],
          zoom: 13
        })

        console.log('[PagnaamPage] Map instance created:', map)

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map)

        console.log('[PagnaamPage] Tile layer added')

        const route = selectedRoute.value
        console.log('[PagnaamPage] Current route:', route?.routeName)
        console.log('[PagnaamPage] Route coordinates:', route?.routeCoordinates)

        // Draw route polyline if coordinates are available
        if (route?.routeCoordinates && route.routeCoordinates.length > 0) {
          console.log('[PagnaamPage] Drawing polyline with', route.routeCoordinates.length, 'points')
          
          // Convert coordinates to [lat, lng] format for Leaflet
          const latlngs = route.routeCoordinates.map(coord => {
            const point = [coord.lat, coord.lng]
            return point
          })

          console.log('[PagnaamPage] Latlngs:', latlngs)

          // Draw the route path as a polyline
          const routePath = L.polyline(latlngs, {
            color: '#2E5D3E',
            weight: 5,
            opacity: 0.8,
            dashArray: '10, 10',
            lineCap: 'round'
          }).addTo(map)

          console.log('[PagnaamPage] Polyline created:', routePath)

          // Fit map to show the entire route
          const bounds = routePath.getBounds()
          console.log('[PagnaamPage] Route bounds:', bounds)
          map.fitBounds(bounds, { padding: [50, 50] })

          // Add a popup to the polyline
          routePath.bindPopup(`<b>${route.routeName || route.jeepName}</b><br>Route Path`)
          
          console.log('[PagnaamPage] ✅ Polyline drawn successfully!')
        } else {
          console.log('[PagnaamPage] ⚠️ No route coordinates available')
        }

        // Add markers for start and end terminals
        const startCoords = route?.terminalCoordinates || route?.originCoordinates || { lat: 16.4122, lng: 120.5948 }
        const endCoords = route?.destinationCoordinates || { lat: 16.4178, lng: 120.6012 }

        console.log('[PagnaamPage] Start coords:', startCoords, 'End coords:', endCoords)

        // Convert to array format for Leaflet
        const startLatLng = [startCoords.lat, startCoords.lng]
        const endLatLng = [endCoords.lat, endCoords.lng]

        if (route?.terminalStart || route?.terminalLocation) {
          L.marker(startLatLng).addTo(map)
            .bindPopup(`<b>${route.terminalStart || route.terminalLocation}</b><br>Starting Terminal`)
        }

        if (route?.terminalEnd || route?.endPoint) {
          L.marker(endLatLng).addTo(map)
            .bindPopup(`<b>${route.terminalEnd || route.endPoint}</b><br>Destination Terminal`)
        }

        // If no route coordinates, fit map to show both terminals
        if (!route?.routeCoordinates || route.routeCoordinates.length === 0) {
          const bounds = L.latLngBounds([startLatLng, endLatLng])
          map.fitBounds(bounds, { padding: [50, 50] })
        }
        
        // Invalidate map size to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize()
          console.log('[PagnaamPage] Map size invalidated')
          console.log('[PagnaamPage] Map center:', map.getCenter(), 'Zoom:', map.getZoom())
          console.log('[PagnaamPage] ✅ Map fully loaded!')
        }, 200)
      } else {
        console.error('[PagnaamPage] ❌ Map element NOT found!')
      }
    }

    onUnmounted(() => {
      if (map) {
        map.remove()
        map = null
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
      showRouteDialog,
      faqs,
      leftFaqs,
      rightFaqs,
      formatOperatingHours,
      selectRoute,
      navigateToTerminal,
    }
  },
})
</script>

<style scoped lang="scss">
// Color Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$soft-green: #E8F5E9;
$mint-cream: #F1F8F4;
$blush-pink: #FCE4EC;
$white: #FFFFFF;
$brown: #6B5344;
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: rgba(255, 255, 255, 0.3);
$bento-radius: 20px;

.pagnaam-page {
  background: linear-gradient(180deg, $mint-cream 0%, $white 100%) !important;
  min-height: 100vh;
}

.hero-section {
  height: 40vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 $bento-radius $bento-radius;
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
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-description {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;
}

.extended-hero {
  padding: 4rem 0;
  background: $glass-bg;
  backdrop-filter: blur(20px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.directories-section {
  padding: 4rem 0;
  background: transparent;
}

.search-bar-section {
  max-width: 700px;
  margin: 0 auto 2rem;
  
  :deep(.q-field) {
    background: $glass-bg;
    backdrop-filter: blur(20px);
    border-radius: $bento-radius;
    border: 1px solid $glass-border;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    
    &.q-field--focused {
      box-shadow: 0 8px 24px rgba($primary-green, 0.15);
      border-color: $primary-green;
    }
  }
  
  :deep(.q-field__control) {
    border-radius: $bento-radius;
  }
  
  :deep(.q-field__prepend) {
    color: $primary-green;
  }
}

// Bento Grid for Routes
.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 10px;
}

.route-card {
  background: $glass-bg;
  backdrop-filter: blur(20px);
  border-radius: $bento-radius;
  border: 1px solid $glass-border;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba($primary-green, 0.15);
    border-color: rgba($primary-green, 0.3);
  }
  
  :deep(.q-img) {
    border-radius: $bento-radius $bento-radius 0 0;
    height: 180px;
  }
  
  :deep(.q-card__section) {
    padding: 20px;
  }
}

.route-image {
  height: 180px;
  object-fit: cover;
}

.fare-matrix {
  background: $soft-green;
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
}

.route-dialog-card {
  border-radius: $bento-radius;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border: 1px solid $glass-border;
  
  :deep(.q-card__section) {
    background: linear-gradient(135deg, $soft-green 0%, $mint-cream 100%);
  }
  
  .map-card {
    border-radius: $bento-radius;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    
    #route-map {
      min-height: 550px;
      background: #f0f0f0;
      border-radius: $bento-radius;
    }
  }
}

// FAQ Section with Glassmorphism
$faqs-bg: $brown;

.faqs-section {
  background: linear-gradient(135deg, $faqs-bg 0%, darken($faqs-bg, 10%) 100%);
  padding: 5rem 0;
  color: $white;
  position: relative;
  
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

.container-faqs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  position: relative;
  z-index: 1;
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
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
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
  gap: 24px;
  margin-bottom: 4rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-item {
  background: rgba($white, 0.1);
  border: 1px solid rgba($white, 0.2);
  border-radius: $bento-radius;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;

  &:hover {
    background: rgba($white, 0.15);
    border-color: rgba($white, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  :deep(.q-item) {
    padding: 18px 24px;
    min-height: 70px;
  }

  :deep(.q-item__label) {
    font-size: 0.95rem;
    font-weight: 700;
    color: $white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.4;
  }

  :deep(.q-icon) {
    color: $light-green;
    font-size: 22px;
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-icon) {
    transform: scale(1.15) rotate(90deg);
  }
  
  :deep(.q-expansion-item__content) {
    padding: 0;
  }
}

.faq-card {
  background: transparent;
  box-shadow: none;
}

.faq-answer {
  padding: 0 24px 24px;
  font-size: 0.95rem;
  color: rgba($white, 0.9);
  line-height: 1.8;
}

.bg-primary {
  background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%) !important;
}

.text-primary {
  color: $primary-green !important;
}

.bg-secondary {
  background-color: $brown !important;
}

.text-secondary {
  color: $brown !important;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.image-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: linear-gradient(135deg, $soft-green 0%, $mint-cream 100%);
  border-radius: $bento-radius;
  border: 1px solid $glass-border;
}

.map-container {
  background: $glass-bg;
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-radius: $bento-radius;
  border: 1px solid $glass-border;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
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
    gap: 16px;
  }
  
  .faqs-grid {
    grid-template-columns: 1fr;
  }
  
  .container-faqs {
    padding: 0 20px;
  }

  .row {
    flex-direction: column;
  }

  .col-md-6, .col-md-4, .col-md-8 {
    width: 100%;
    margin-bottom: 1.5rem;
  }
}
</style>