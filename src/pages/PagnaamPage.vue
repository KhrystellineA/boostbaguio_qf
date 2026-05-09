<template>
  <q-page class="pagnaam-page">
    <!-- HERO SECTION -->
    <section class="pagnaam-hero">
      <div class="hero-card" :style="{ backgroundImage: `url(${heroImageUrl})` }">
        <div class="hero-overlay-grad" />
        <div class="hero-inner animate-fade-in">
          <span class="hero-tag">
            <q-icon name="directions_bus" size="14px" />
            City Jeepney Directory
          </span>
          <h1 class="hero-title">
            <em>Pagnaam</em>
          </h1>
          <p class="hero-description">
            Explore all jeepney routes in Baguio City — comprehensive information about terminals,
            fares, operating hours, and the unique routes that make up the city's iconic transport
            system.
          </p>
          <div class="hero-chips">
            <span class="hero-chip">Route Information</span>
            <span class="hero-chip">Terminal Locations</span>
            <span class="hero-chip">Operating Hours</span>
          </div>
        </div>
      </div>
    </section>

    <!-- JEEPNEY DIRECTORIES SECTION (Section 3) -->
    <section class="directories-section">
      <div class="container">
        <div class="section-eyebrow text-center">
          <p class="eyebrow-text">JEEPNEY DIRECTORIES</p>
          <h2 class="eyebrow-title">Browse every <em>route</em> in the city</h2>
          <p class="eyebrow-description">
            Comprehensive details for every active jeepney route in Baguio.
          </p>
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
              <q-btn v-if="searchQuery" flat dense icon="clear" @click="searchQuery = ''">
                <q-tooltip>Clear Search</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <div class="row justify-between items-center q-mt-xs">
            <div class="text-caption text-grey-7">
              <span v-if="searchQuery">
                Found {{ filteredRoutes.length }} jeepney(s) matching "{{ searchQuery }}"
              </span>
              <span v-else> Showing all {{ allRoutes.length }} jeepney(s) - Sorted A-Z </span>
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
              :src="route.imageUrl || fallbackImage"
              @error="$event.target.src = fallbackImage"
              spinner-color="primary"
              class="route-image"
            />
            <q-card-section>
              <div class="text-h6 text-primary text-weight-bold">
                {{ route.jeepName || route.routeName }}
              </div>
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
              <div
                v-if="route.touristSpotsServiced && route.touristSpotsServiced.length > 0"
                class="q-mt-md"
              >
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
      <q-card class="route-dialog-card column no-wrap" style="min-width: 1100px; max-height: 90vh">
        <q-card-section class="row items-center q-pb-none bg-primary text-white col-auto">
          <div class="text-h6 text-weight-bold">
            <q-icon name="directions_bus" class="q-mr-sm" />
            {{ selectedRoute?.routeName || selectedRoute?.jeepName }}
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>

        <q-card-section class="q-pt-md scroll col">
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
                          <q-item-label caption>{{
                            selectedRoute?.terminalStart || selectedRoute?.terminalLocation
                          }}</q-item-label>
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
                          <q-item-label caption>{{
                            selectedRoute?.terminalEnd || selectedRoute?.endPoint
                          }}</q-item-label>
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
                    <h4 class="text-h6 text-weight-bold text-primary q-mb-md">
                      How to Identify This Jeepney
                    </h4>
                    <ul class="q-pl-md">
                      <li class="q-mb-sm">
                        Look for "{{ selectedRoute?.routeName || selectedRoute?.jeepName }}" signage
                        on the front and sides
                      </li>
                      <li class="q-mb-sm">Check for route number indicators</li>
                      <li class="q-mb-sm">The driver will call out major stops along the route</li>
                      <li class="q-mb-sm">To get off, tap the side or say "para"</li>
                    </ul>
                  </div>

                  <q-separator class="q-my-md" />

                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Map Legend</h4>
                  <div class="map-legend q-mb-md">
                    <div class="legend-item">
                      <span class="legend-dot legend-dot--start"></span>
                      <span>Start terminal</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-dot legend-dot--stop"></span>
                      <span>Tourist spot along the route</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-dot legend-dot--end"></span>
                      <span>End terminal</span>
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <div
                    v-if="isResolvingStops && selectedRouteStops.length === 0"
                    class="row items-center q-mt-md text-grey-7"
                  >
                    <q-spinner-dots color="primary" size="20px" class="q-mr-sm" />
                    <span class="text-caption">Looking up tourist spot locations…</span>
                  </div>

                  <div v-if="selectedRouteStops.length > 0" class="q-mt-md">
                    <h4 class="text-h6 text-weight-bold text-primary q-mb-md">
                      Route Stops ({{ selectedRouteStops.length }})
                    </h4>
                    <q-list dense>
                      <q-item
                        v-for="(stop, idx) in selectedRouteStops"
                        :key="idx"
                        class="q-px-none"
                      >
                        <q-item-section avatar>
                          <q-badge
                            :color="
                              idx === 0
                                ? 'green'
                                : idx === selectedRouteStops.length - 1
                                  ? 'red'
                                  : 'blue'
                            "
                            text-color="white"
                          >
                            {{ idx + 1 }}
                          </q-badge>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-body2">{{ stop.name }}</q-item-label>
                          <q-item-label caption>
                            <span v-if="idx === 0">Start terminal</span>
                            <span v-else-if="idx === selectedRouteStops.length - 1"
                              >End terminal</span
                            >
                            <span v-else>Tourist spot</span>
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
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
                  <q-btn flat label="Close" color="grey" v-close-popup />
                </q-card-actions>
              </q-card>
            </div>

            <div class="col-lg-7 col-12">
              <q-card flat bordered class="map-card" style="height: 550px">
                <RouteMap
                  :route-coordinates="selectedRoute?.routeCoordinates || selectedRoute?.routePoints"
                  :waypoints="selectedRouteStops"
                  :distance="selectedRoute?.routeDistance"
                  :duration="selectedRoute?.routeDuration"
                  height="550px"
                  :show-controls="true"
                  :show-waypoints-info="false"
                  :show-stats="true"
                  :show-empty-state="false"
                  :center="[16.4023, 120.596]"
                  :zoom="13"
                />
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- FAQS SECTION (Section 5) -->
    <section class="faqs-section">
      <div class="container-faqs">
        <div class="section-eyebrow text-center">
          <p class="eyebrow-text">QUESTIONS &amp; ANSWERS</p>
          <h2 class="eyebrow-title"><em>Pagnaam</em> FAQs</h2>
          <p class="eyebrow-description">
            Common questions about navigating Baguio's jeepney system.
          </p>
        </div>
        <div class="faqs-grid">
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in leftFaqs"
              :key="index"
              :label="faq.question"
              class="faq-item"
              expand-icon="add"
              expanded-icon="remove"
              header-class="faq-header"
            >
              <q-card class="faq-card" flat>
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
              expand-icon="add"
              expanded-icon="remove"
              header-class="faq-header"
            >
              <q-card class="faq-card" flat>
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import FooterSection from '../components/home/FooterSection.vue'
import RouteMap from 'src/components/RouteMap.vue'
import { fetchPlaces, fuzzyMatch } from 'src/composables/useRouteGeneration'
import { useGeocoding } from 'src/composables/useGeocoding'
import fallbackImage from '../assets/44.png'

export default defineComponent({
  name: 'PagnaamPage',
  components: {
    FooterSection,
    RouteMap,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const { searchLocations } = useGeocoding()
    const searchQuery = ref('')
    const allRoutes = ref([])
    const selectedRoute = ref(null)
    const heroImageUrl = ref(fallbackImage)
    const showRouteDialog = ref(false)
    const placesCache = ref([])
    const stopsCoordCache = new Map()
    const selectedRouteStops = ref([])
    const isResolvingStops = ref(false)

    const faqs = [
      {
        question: 'How do I identify the correct jeepney?',
        answer:
          'Look for the route name and number on the front and sides of the jeepney. Drivers usually call out major stops along the route.',
      },
      {
        question: 'What is the typical fare for Baguio jeepneys?',
        answer:
          'Fares typically range from ₱12-20 depending on the route length. Always have exact change as drivers may not have change.',
      },
      {
        question: 'When do jeepneys operate?',
        answer:
          'Most jeepneys operate from 5:00 AM to 10:00 PM. Operating hours may vary by route and season.',
      },
      {
        question: 'Can I use this for navigation?',
        answer:
          'Yes! PAGNAAM provides comprehensive information about routes and terminals. Combine this with APANAM for complete navigation instructions.',
      },
    ]

    const leftFaqs = computed(() => faqs.slice(0, 2))
    const rightFaqs = computed(() => faqs.slice(2))

    // Filter routes based on search query
    const filteredRoutes = computed(() => {
      let result = allRoutes.value

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(
          (route) =>
            (route.jeepName || route.routeName)?.toLowerCase().includes(query) ||
            route.terminalLocation?.toLowerCase().includes(query) ||
            route.endPoint?.toLowerCase().includes(query) ||
            route.touristSpotsServiced?.some((spot) => spot.toLowerCase().includes(query))
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
        allRoutes.value = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          // Normalize invalid or placeholder image URLs
          if (
            !data.imageUrl ||
            data.imageUrl.includes('via.placeholder') ||
            data.imageUrl.includes('placeholder') ||
            data.imageUrl.includes('800x600')
          ) {
            data.imageUrl = fallbackImage
          }
          return {
            id: doc.id,
            ...data,
          }
        })
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
          imageUrl: '~assets/jeepney.png',
        },
        {
          id: 'route-2',
          routeName: 'Route 2',
          terminalStart: 'Session Road Terminal',
          terminalEnd: 'Lakeside Terminal',
          fare: 20,
          operatingHours: '5:00 AM - 10:00 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png',
        },
        {
          id: 'route-3',
          routeName: 'Route 3',
          terminalStart: 'Market Market Terminal',
          terminalEnd: 'Mines View Terminal',
          fare: 18,
          operatingHours: '5:00 AM - 10:00 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png',
        },
        {
          id: 'route-4',
          routeName: 'Route 4',
          terminalStart: 'University of Baguio Terminal',
          terminalEnd: 'Good Shepherd Terminal',
          fare: 16,
          operatingHours: '5:00 AM - 9:30 PM',
          isActive: true,
          imageUrl: '~assets/jeepney.png',
        },
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
        router.push(
          `/apanam?start=${encodeURIComponent('Current Location')}&end=${encodeURIComponent(selectedRoute.value.terminalStart)}`
        )
      }
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchRoutes()
      try {
        placesCache.value = await fetchPlaces()
      } catch (err) {
        console.warn(
          '[PagnaamPage] Could not preload places — geocoding will fall back to OSM.',
          err
        )
      }
    })

    // Watch for selected route changes (dialog opens)
    watch(selectedRoute, (newRoute) => {
      if (newRoute) {
        console.log('[PagnaamPage] Route selected:', newRoute.jeepName)
        // Map will be initialized by RouteMap component
      }
    })

    // Watch for search query changes
    watch(searchQuery, (newVal) => {
      console.log('[PagnaamPage] Search query changed:', newVal)
    })

    /**
     * Resolve a stop's coordinates by name. Tries the Firestore `places`
     * collection first (curated, instant), then falls back to OSM Nominatim.
     * Results are cached per session so the same name isn't geocoded twice.
     */
    const resolveStopCoords = async (name) => {
      if (!name) return null
      const key = name.toLowerCase().trim()
      if (stopsCoordCache.has(key)) return stopsCoordCache.get(key)

      const matched = fuzzyMatch(name, placesCache.value)
      if (matched && matched.latitude && matched.longitude) {
        const coords = { latitude: matched.latitude, longitude: matched.longitude }
        stopsCoordCache.set(key, coords)
        return coords
      }

      try {
        const results = await searchLocations(name, true)
        if (results && results.length > 0) {
          const coords = { latitude: results[0].lat, longitude: results[0].lng }
          stopsCoordCache.set(key, coords)
          return coords
        }
      } catch (err) {
        console.warn('[PagnaamPage] Geocoding failed for', name, err)
      }

      stopsCoordCache.set(key, null)
      return null
    }

    /**
     * Build the ordered list of stops for the selected route, geocoding any
     * tourist spots / terminals that don't have coordinates baked into the
     * jeepney document.
     */
    const buildStopsFromRoute = async (route) => {
      if (!route) return []

      const stops = []

      // Start terminal — prefer stored lat/lng, geocode the name otherwise.
      const startName = route.terminalLocation || route.terminalStart || 'Terminal'
      if (route.terminalLat && route.terminalLng) {
        stops.push({
          name: startName,
          latitude: route.terminalLat,
          longitude: route.terminalLng,
        })
      } else {
        const coords = await resolveStopCoords(startName)
        if (coords) stops.push({ name: startName, ...coords })
      }

      // Tourist spots — resolve each one in parallel.
      const spots = route.touristSpotsServiced || []
      if (spots.length > 0) {
        const resolved = await Promise.all(
          spots.map(async (spot) => {
            const coords = await resolveStopCoords(spot)
            return coords ? { name: spot, ...coords } : null
          })
        )
        stops.push(...resolved.filter(Boolean))
      }

      // End terminal.
      const endName = route.endPoint || route.terminalEnd
      if (endName) {
        const endCoords = await resolveStopCoords(endName)
        if (endCoords) {
          stops.push({ name: endName, ...endCoords })
        } else if (route.terminalLat && route.terminalLng) {
          stops.push({
            name: endName,
            latitude: route.terminalLat,
            longitude: route.terminalLng,
          })
        }
      }

      return stops
    }

    watch(
      selectedRoute,
      async (newRoute) => {
        selectedRouteStops.value = []
        if (!newRoute) return
        isResolvingStops.value = true
        try {
          selectedRouteStops.value = await buildStopsFromRoute(newRoute)
        } finally {
          isResolvingStops.value = false
        }
      },
      { immediate: true }
    )

    return {
      searchQuery,
      allRoutes,
      filteredRoutes,
      selectedRoute,
      selectedRouteStops,
      isResolvingStops,
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
// Color Palette — aligned with home page
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$sage: #b8cfa3;
$mint-bg: #e8f0e0;
$soft-green: #e8f5e9;
$mint-cream: #f1f8f4;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;
$brown: #6b5344;

$bento-radius: 18px;
$bento-shadow: 0 6px 18px rgba(20, 36, 26, 0.06);
$bento-shadow-hover: 0 14px 30px rgba(20, 36, 26, 0.12);

.pagnaam-page {
  background: $white !important;
  min-height: 100vh;
}

/* HERO — rounded card mountain backdrop */
.pagnaam-hero {
  width: 100%;
  padding: 1.25rem 1.25rem 2rem;
  background: $white;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: clamp(420px, 58vh, 560px);
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
  background-size: cover;
  background-position: center;
  box-shadow: 0 20px 50px rgba(20, 36, 26, 0.18);
}

.hero-overlay-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 36, 26, 0.45) 0%,
    rgba(20, 36, 26, 0.2) 50%,
    rgba(20, 36, 26, 0.65) 100%
  );
  z-index: 1;
}

.hero-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 5%;
  color: $white;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: $white;
  backdrop-filter: blur(8px);
  margin-bottom: 1.25rem;
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 700;
  color: $white;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
  line-height: 1.05;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);

  em {
    font-style: italic;
    color: $sage;
    font-weight: 700;
  }
}

.hero-description {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba($white, 0.94);
  margin: 0 auto 1.75rem;
  max-width: 600px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: $primary-green;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Section eyebrow */
.section-eyebrow {
  margin-bottom: 2.5rem;

  &.text-center {
    text-align: center;
  }
}

.eyebrow-text {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin: 0 0 0.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.eyebrow-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.7rem, 3.2vw, 2.3rem);
  font-weight: 600;
  color: $ink;
  margin: 0 0 0.75rem;
  line-height: 1.18;
  letter-spacing: -0.01em;

  em {
    font-style: italic;
    font-weight: 600;
    color: $primary-green;
  }
}

.eyebrow-description {
  font-size: 0.95rem;
  color: $muted;
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Directories section */
.directories-section {
  background: $white;
  padding: 4rem 0;
}

.search-bar-section {
  max-width: 700px;
  margin: 0 auto 2.5rem;

  :deep(.q-field) {
    background: $white;
    border-radius: 999px;
    border: 1px solid $border;
    box-shadow: 0 2px 8px rgba(20, 36, 26, 0.04);
    transition: all 0.25s ease;

    &:hover {
      border-color: rgba($primary-green, 0.4);
    }

    &.q-field--focused {
      border-color: $primary-green;
      box-shadow: 0 0 0 3px rgba($primary-green, 0.12);
    }
  }

  :deep(.q-field__control) {
    border-radius: 999px;
    padding: 0 1rem;

    &:before,
    &:after {
      border: none !important;
    }
  }

  :deep(.q-field__prepend) {
    color: $primary-green;
  }

  :deep(.q-field__native) {
    color: $ink;
  }
}

/* Routes grid — image-card style from home */
.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.route-card {
  background: $white;
  border-radius: $bento-radius;
  border: 1px solid $border;
  box-shadow: $bento-shadow;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $bento-shadow-hover;
    border-color: rgba($primary-green, 0.3);
  }

  :deep(.q-img) {
    border-radius: $bento-radius $bento-radius 0 0;
    height: 180px;
  }

  :deep(.q-card__section) {
    padding: 1.25rem;
  }

  :deep(.text-h6) {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.15rem !important;
    font-weight: 600 !important;
    color: $ink !important;
    letter-spacing: -0.005em;
  }
}

.route-image {
  height: 180px;
  object-fit: cover;
}

.fare-matrix {
  background: $mint-bg;
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;

  .text-caption {
    color: $primary-green !important;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  :deep(.q-badge) {
    border-radius: 999px;
    padding: 4px 8px;
    font-weight: 600;
    font-size: 0.75rem;
  }
}

/* Dialog */
.route-dialog-card {
  border-radius: $bento-radius;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(20, 36, 26, 0.18);
  border: 1px solid $border;
  background: $white;

  .map-card {
    border-radius: $bento-radius;
    overflow: hidden;
    box-shadow: $bento-shadow;
    border: 1px solid $border;
  }
}

/* Map marker legend */
.map-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(20, 36, 26, 0.04);
  border: 1px solid $border;
  border-radius: 10px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.85rem;
    color: $ink;
  }

  .legend-dot {
    flex: 0 0 14px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .legend-dot--start {
    background: #22c55e;
  }

  .legend-dot--stop {
    background: #3b82f6;
  }

  .legend-dot--end {
    background: #ef4444;
  }
}

/* FAQ section — light, matches home */
.faqs-section {
  background: $white;
  padding: 5rem 0;
  color: $ink;
  position: relative;
  border-top: 1px solid $border;
}

.container-faqs {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background: $white;
  border: 1px solid $border;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba($primary-green, 0.35);
    box-shadow: 0 6px 18px rgba(20, 36, 26, 0.06);
  }

  :deep(.q-item) {
    padding: 0.95rem 1.25rem;
    min-height: auto;
    border-radius: 14px;
  }

  :deep(.q-item__label) {
    font-size: 0.92rem;
    font-weight: 600;
    color: $ink;
    text-transform: none;
    letter-spacing: -0.005em;
    line-height: 1.4;
  }

  :deep(.q-icon) {
    color: $primary-green;
    font-size: 18px;
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
  padding: 0 1.25rem 1.1rem;
  font-size: 0.88rem;
  color: $muted;
  line-height: 1.65;
}

/* Color overrides for Quasar utilities scoped to this page */
.bg-primary {
  background: $primary-green !important;
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.map-container {
  background: $white;
  border: 1px solid $border;
  padding: 1.5rem;
  border-radius: $bento-radius;
  box-shadow: $bento-shadow;
}

@media (max-width: 1023px) {
  .directories-section {
    padding: 3rem 0;
  }

  .faqs-section {
    padding: 4rem 0;
  }

  .faqs-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pagnaam-hero {
    padding: 0.75rem 0.75rem 1.5rem;
  }

  .hero-card {
    height: clamp(420px, 60vh, 560px);
    border-radius: 20px;
  }

  .hero-title {
    font-size: 2.4rem;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-chip {
    font-size: 0.72rem;
    padding: 6px 12px;
  }

  .container,
  .container-faqs {
    padding: 0 1.25rem;
  }

  .routes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .row {
    flex-direction: column;
  }

  .col-md-6,
  .col-md-4,
  .col-md-8 {
    width: 100%;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-card {
    height: clamp(380px, 60vh, 500px);
    border-radius: 18px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 0.9rem;
  }
}
</style>
