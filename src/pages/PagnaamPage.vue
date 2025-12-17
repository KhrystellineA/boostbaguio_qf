<template>
  <q-page class="landing-page">
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <div class="text-overline text-white q-mb-sm">Navigate</div>
          <h1 class="hero-title">EXPLORE JEEPNEY ROUTES</h1>
          <p class="hero-description">
            Discover Baguio's jeepney routes with real-time updates and seamless navigation at your
            fingertips.
          </p>

          <div class="route-search-box">
            <q-input
              v-model="searchQuery"
              filled
              dark
              placeholder="Search for routes, destinations..."
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-btn label="Search" color="primary" unelevated @click="handleSearch" />
              </template>
            </q-input>
          </div>

          <div class="hero-actions">
            <q-btn
              label="Learn More"
              unelevated
              color="white"
              text-color="dark"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift q-mr-md"
              @click="scrollToSection('features')"
            />
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section" ref="featuresSection">
      <div class="container">
        <div class="features-wrapper">
          <div class="features-content">
            <h2 class="features-title section-animate">
              EXPLORE BAGUIO'S JEEPNEY ROUTES WITH OUR INTERACTIVE MAPPING FEATURE
            </h2>
            <p class="features-description section-animate">
              Navigate Baguio City effortlessly with our interactive map. Access real-time schedules
              and fares for a seamless commuting experience.
            </p>

            <div class="feature-cards">
              <div class="feature-card section-animate">
                <q-icon name="route" size="32px" class="feature-icon" />
                <div class="feature-text">
                  <h3 class="feature-card-title">ROUTE DETAILS</h3>
                  <p class="feature-card-description">
                    Find accurate jeepney routes and up-to-date fare information at your fingertips.
                  </p>
                </div>
              </div>

              <div class="feature-card section-animate">
                <q-icon name="person" size="32px" class="feature-icon" />
                <div class="feature-text">
                  <h3 class="feature-card-title">USER-FRIENDLY</h3>
                  <p class="feature-card-description">
                    Designed for easy navigation ensuring a smooth travel experience in Baguio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="features-image-col">
            <div class="features-image-wrapper section-animate">
              <img src="../assets/img1.png" alt="Jeepneys on street" class="features-image" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="jeepneys-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title section-animate">BAGUIO'S JEEPNEYS!</h2>
          <p class="section-subtitle section-animate">
            Curious about Baguio's Jeepneys? No worries. Check them out and learn more about them
            here!
          </p>
        </div>

        <div class="jeepneys-grid">
          <!-- Loading State -->
          <div v-if="isLoadingRoutes" class="text-center q-pa-xl">
            <q-spinner-dots color="primary" size="50px" />
            <p class="text-grey-7 q-mt-md">Loading jeepney routes...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="displayedJeepneys.length === 0" class="text-center q-pa-xl">
            <q-icon name="directions_bus" size="80px" color="grey-5" />
            <p class="text-h6 text-grey-7 q-mt-md">No routes available</p>
            <p class="text-grey-6">Please check back later or add routes in the admin panel.</p>
          </div>

          <!-- Jeepney Cards -->
          <div v-else>
            <div class="jeepney-cards-wrapper">
              <div
                v-for="(jeepney, index) in displayedJeepneys"
                :key="jeepney.id || index"
                class="jeepney-card section-animate card-hover"
                @click="selectJeepney(jeepney)"
              >
                <div class="jeepney-image-wrapper">
                  <img
                    v-if="jeepney.image"
                    :src="jeepney.image"
                    :alt="jeepney.name"
                    class="jeepney-image"
                  />
                  <div v-else class="jeepney-placeholder">
                    <q-icon name="directions_bus" size="48px" color="grey-5" />
                  </div>
                </div>
                <div class="jeepney-info">
                  <h3 class="jeepney-name">{{ jeepney.name }}</h3>
                  <p class="jeepney-route">{{ jeepney.route }}</p>
                </div>
              </div>
            </div>

            <div class="text-center q-mt-lg">
              <q-btn
                label="See More"
                outline
                color="dark"
                padding="10px 32px"
                class="btn-hover-lift"
                @click="loadMoreJeepneys"
              />
            </div>
          </div>
        </div>

        <div v-if="selectedJeepney" class="jeepney-detail-section section-animate">
          <div class="jeepney-detail-wrapper">
            <div class="jeepney-detail-map-col">
              <div class="map-wrapper">
                <div class="map-controls">
                  <q-btn
                    round
                    color="white"
                    text-color="primary"
                    icon="my_location"
                    size="sm"
                    @click="getUserLocation"
                    :loading="isLoadingLocation"
                    class="q-mr-sm"
                  >
                    <q-tooltip>Get my location</q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    color="white"
                    text-color="primary"
                    icon="fullscreen"
                    size="sm"
                    @click="showFullscreenMap = true"
                  >
                    <q-tooltip>Fullscreen map</q-tooltip>
                  </q-btn>
                </div>
                <div
                  ref="mapContainer"
                  style="height: 400px; width: 100%; border-radius: 12px"
                ></div>

                <div v-if="userLocation && distanceToTerminal" class="distance-info q-mt-sm">
                  <q-icon name="straighten" size="16px" class="q-mr-xs" />
                  <span>{{ distanceToTerminal }} km to terminal</span>
                  <span class="q-ml-sm">•</span>
                  <q-icon name="schedule" size="16px" class="q-ml-sm q-mr-xs" />
                  <span>{{ estimatedWalkingTime }} mins walk</span>
                </div>
              </div>
            </div>

            <div class="jeepney-detail-content-col">
              <div class="jeepney-detail-content">
                <div class="text-overline text-primary q-mb-sm">Discover</div>
                <h2 class="jeepney-detail-title">{{ selectedJeepney.name || 'Loading...' }}</h2>
                <p class="jeepney-detail-description">
                  Passes through:<br />
                  <strong>Starting point:</strong> {{ selectedJeepney.startingPoint || 'N/A'
                  }}<br />
                  <strong>Destination:</strong> {{ selectedJeepney.destination || 'N/A' }}
                </p>

                <div class="jeepney-detail-info">
                  <div class="info-item">
                    <h3 class="info-label">TERMINAL LOCATION:</h3>
                    <p class="info-value">{{ selectedJeepney.terminalLocation || 'N/A' }}</p>
                  </div>

                  <div class="info-item">
                    <h3 class="info-label">FARE:</h3>
                    <p class="info-value">
                      REGULAR: ₱{{ selectedJeepney.regularFare || '0.00' }}<br />
                      STUDENT: ₱{{ selectedJeepney.studentFare || '0.00' }}<br />
                      PWD/SENIOR: ₱{{ selectedJeepney.pwdSeniorFare || '0.00' }}
                    </p>
                  </div>
                </div>

                <div class="action-buttons">
                  <q-btn
                    label="GO THERE"
                    color="dark"
                    unelevated
                    padding="12px 32px"
                    class="btn-hover-lift"
                    @click="showNavigationTutorial = true"
                  />
                  <q-btn
                    label="Navigate on Map"
                    outline
                    color="dark"
                    padding="12px 32px"
                    class="btn-hover-lift"
                    @click="showNavigationOnMap"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <q-dialog v-model="showFullscreenMap" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="map" />
          <div class="text-weight-bold q-ml-sm">Navigation Map - {{ selectedJeepney?.name }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 50px)">
          <div ref="fullscreenMapContainer" style="height: 100%; width: 100%"></div>

          <div class="floating-info-panel">
            <div class="info-panel-header">
              <q-icon name="info" size="20px" class="q-mr-sm" />
              <span class="text-weight-bold">Route Information</span>
            </div>
            <div class="info-panel-content">
              <div v-if="userLocation && distanceToTerminal">
                <div class="info-row">
                  <q-icon name="straighten" size="18px" color="primary" />
                  <span
                    >Distance to terminal: <strong>{{ distanceToTerminal }} km</strong></span
                  >
                </div>
                <div class="info-row">
                  <q-icon name="schedule" size="18px" color="primary" />
                  <span
                    >Est. walking time: <strong>{{ estimatedWalkingTime }} mins</strong></span
                  >
                </div>
              </div>
              <div v-else class="text-grey-7 text-center">
                <q-icon name="my_location" size="24px" class="q-mb-xs" /><br />
                Click "Get my location" button to see directions
              </div>
            </div>
            <div class="info-panel-actions">
              <q-btn
                v-if="!userLocation"
                label="Get My Location"
                color="primary"
                unelevated
                @click="getUserLocation"
                icon="my_location"
                class="full-width"
              />
              <q-btn
                v-else
                label="Recenter Map"
                color="primary"
                outline
                @click="recenterMap"
                icon="center_focus_strong"
                class="full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showNavigationTutorial" position="bottom">
      <q-card style="width: 100%; max-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="navigation" class="q-mr-sm" />
            How to Get to {{ selectedJeepney?.name }} Terminal
          </div>
        </q-card-section>

        <q-card-section>
          <q-stepper v-model="tutorialStep" vertical animated color="primary">
            <q-step
              :name="1"
              title="Check Your Location"
              icon="my_location"
              :done="tutorialStep > 1"
            >
              <div class="q-mb-md">
                Make sure you know your current location or use GPS to pinpoint where you are in
                Baguio City.
              </div>
              <q-btn
                v-if="!userLocation"
                label="Get My Location"
                color="positive"
                @click="getUserLocation"
                icon="my_location"
                size="sm"
                unelevated
                class="q-mb-sm"
              />
              <div v-if="userLocation" class="q-mb-sm text-positive">
                <q-icon name="check_circle" /> Location detected!
              </div>
              <q-btn label="Next" color="primary" @click="tutorialStep = 2" size="sm" unelevated />
            </q-step>

            <q-step :name="2" title="Plan Your Route" icon="route" :done="tutorialStep > 2">
              <div class="q-mb-md">
                <strong>Terminal Location:</strong> {{ selectedJeepney?.terminalLocation }}<br />
                You can walk, take a taxi, or ride another jeepney to reach the terminal.
              </div>
              <div v-if="userLocation && distanceToTerminal" class="q-mb-md">
                <q-banner class="bg-blue-1">
                  <template v-slot:avatar>
                    <q-icon name="straighten" color="primary" />
                  </template>
                  Distance: <strong>{{ distanceToTerminal }} km</strong><br />
                  Walking time: <strong>{{ estimatedWalkingTime }} mins</strong>
                </q-banner>
              </div>
              <div class="q-mb-md">
                <q-btn
                  label="View on Fullscreen Map"
                  color="primary"
                  @click="showFullscreenMap = true"
                  icon="map"
                  size="sm"
                  outline
                  class="q-mr-sm"
                />
              </div>
              <q-stepper-navigation>
                <q-btn
                  label="Next"
                  color="primary"
                  @click="tutorialStep = 3"
                  size="sm"
                  unelevated
                />
                <q-btn
                  label="Back"
                  color="primary"
                  @click="tutorialStep = 1"
                  size="sm"
                  flat
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>

            <q-step :name="3" title="Board the Jeepney" icon="directions_bus">
              <div class="q-mb-md">
                Once at the terminal, look for jeepneys with the route sign:<br />
                <div class="route-sign q-mt-sm q-pa-md">
                  <strong style="font-size: 1.2rem">{{ selectedJeepney?.name }}</strong
                  ><br />
                  <span>{{ selectedJeepney?.route }}</span>
                </div>
              </div>
              <div class="q-mb-md">
                <strong>Fare:</strong>
                <ul style="margin: 8px 0; padding-left: 20px">
                  <li>Regular: ₱{{ selectedJeepney?.regularFare }}</li>
                  <li>Student: ₱{{ selectedJeepney?.studentFare }}</li>
                  <li>PWD/Senior: ₱{{ selectedJeepney?.pwdSeniorFare }}</li>
                </ul>
              </div>
              <q-stepper-navigation>
                <q-btn
                  label="Done"
                  color="primary"
                  @click="showNavigationTutorial = false"
                  size="sm"
                  unelevated
                />
                <q-btn
                  label="Back"
                  color="primary"
                  @click="tutorialStep = 2"
                  size="sm"
                  flat
                  class="q-ml-sm"
                />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Close" flat color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <FAQSection />
    <FooterSection />
  </q-page>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from 'vue'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default defineComponent({
  name: 'PagnaamPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const searchQuery = ref('')
    const selectedJeepney = ref(null)
    const showNavigationTutorial = ref(false)
    const showFullscreenMap = ref(false)
    const tutorialStep = ref(1)
    const userLocation = ref(null)
    const mapContainer = ref(null)
    const fullscreenMapContainer = ref(null)
    let map = null
    let fullscreenMap = null
    let userMarker = null
    let terminalMarker = null
    let destinationMarker = null
    let routeLine = null
    let navigationLine = null
    const isLoadingLocation = ref(false)
    const navigationRoute = ref([])
    const routeDistance = ref(0)

    const jeepneys = ref([])
    const isLoadingRoutes = ref(false)

    const displayedJeepneys = computed(() => {
      // Filter out invalid jeepneys and take first 8
      const displayed = jeepneys.value.filter((jeepney) => jeepney && jeepney.name).slice(0, 8)
      console.log('[DisplayedJeepneys] Count:', displayed.length, 'Data:', displayed)
      return displayed
    })

    const fetchRoutes = async () => {
      isLoadingRoutes.value = true
      try {
        console.log('[LandingPage] Fetching routes from Firebase...')
        const routesQuery = query(collection(db, 'routes'), orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(routesQuery)

        console.log('[LandingPage] Found documents:', querySnapshot.size)

        const routes = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          console.log('[LandingPage] Route document:', doc.id, data)

          const terminalCoords = data.terminalCoordinates ||
            data.originCoordinates || [16.4109, 120.5964]
          const destCoords = data.destinationCoordinates || [16.4145, 120.598]

          let routeCoords = []
          if (data.routeCoordinates && Array.isArray(data.routeCoordinates)) {
            if (data.routeCoordinates[0]?.lat !== undefined) {
              routeCoords = data.routeCoordinates.map((coord) => [coord.lat, coord.lng])
            } else {
              routeCoords = data.routeCoordinates
            }
          } else {
            routeCoords = [terminalCoords, destCoords]
          }

          const routeObj = {
            id: doc.id,
            name: data.name || data.routeName || 'Unknown Route',
            route: `${data.origin || data.startingPoint || 'Unknown'} - ${data.destination || 'Unknown'}`,
            image: data.imageUrl || null,
            startingPoint: data.origin || data.startingPoint || 'Unknown Origin',
            destination: data.destination || 'Unknown Destination',
            terminalLocation: data.terminalLocation || data.origin || 'Unknown Location',
            regularFare: data.fare?.toString() || data.regularFare?.toString() || '0.00',
            studentFare: data.studentFare?.toString() || (data.fare * 0.8)?.toFixed(2) || '0.00',
            pwdSeniorFare:
              data.pwdSeniorFare?.toString() || (data.fare * 0.8)?.toFixed(2) || '0.00',
            terminalCoordinates: terminalCoords,
            destinationCoordinates: destCoords,
            routeCoordinates: routeCoords,
          }

          console.log('[LandingPage] Processed route:', routeObj)
          routes.push(routeObj)
        })

        jeepneys.value = routes
        console.log('[LandingPage] Total routes loaded:', routes.length)

        if (routes.length === 0) {
          $q.notify({
            type: 'warning',
            message: 'No routes found in database',
            position: 'top',
          })
        }
      } catch (error) {
        console.error('[LandingPage] Error fetching routes:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load routes: ' + error.message,
          position: 'top',
        })
      } finally {
        isLoadingRoutes.value = false
      }
    }

    const getStreetRoute = async (startLat, startLon, endLat, endLon) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
        const response = await fetch(url)
        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const coordinates = route.geometry.coordinates.map((coord) => [coord[1], coord[0]])
          return { coordinates, distance: route.distance / 1000 }
        }
        return { coordinates: [], distance: 0 }
      } catch (error) {
        console.error('Error fetching route:', error)
        return { coordinates: [], distance: 0 }
      }
    }

    const fetchStreetRoutesForAllJeepneys = async () => {
      console.log('[LandingPage] Fetching street routes for all jeepneys...')

      const updatedJeepneys = await Promise.all(
        jeepneys.value.map(async (jeepney) => {
          const [terminalLat, terminalLng] = jeepney.terminalCoordinates
          const [destLat, destLng] = jeepney.destinationCoordinates

          const { coordinates: streetRoute } = await getStreetRoute(
            terminalLat,
            terminalLng,
            destLat,
            destLng
          )

          if (streetRoute.length > 0) {
            return {
              ...jeepney,
              routeCoordinates: streetRoute,
            }
          }

          return jeepney
        })
      )

      jeepneys.value = updatedJeepneys
      console.log('[LandingPage] Street routes fetched for all jeepneys')
    }

    const distanceToTerminal = computed(() => {
      if (!routeDistance.value) return null
      return routeDistance.value.toFixed(2)
    })

    const estimatedWalkingTime = computed(() => {
      if (!distanceToTerminal.value) return null
      const timeInHours = distanceToTerminal.value / 5
      const timeInMinutes = Math.ceil(timeInHours * 60)
      return timeInMinutes
    })

    const initMap = () => {
      console.log('[InitMap] Starting map initialization...')
      console.log('[InitMap] mapContainer.value:', mapContainer.value)
      console.log('[InitMap] selectedJeepney.value:', selectedJeepney.value)

      if (!mapContainer.value) {
        console.error('[InitMap] Map container not found!')
        return
      }

      if (!selectedJeepney.value) {
        console.error('[InitMap] No jeepney selected!')
        return
      }

      console.log('[InitMap] Terminal coords:', selectedJeepney.value.terminalCoordinates)
      console.log('[InitMap] Route coords:', selectedJeepney.value.routeCoordinates)

      try {
        if (map) {
          console.log('[InitMap] Removing existing map...')
          map.remove()
          map = null
        }

        console.log('[InitMap] Creating new map...')
        map = L.map(mapContainer.value).setView(selectedJeepney.value.terminalCoordinates, 15)

        console.log('[InitMap] Adding tile layer...')
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        console.log('[InitMap] Updating markers...')
        updateMapMarkers()

        console.log('[InitMap] Map initialized successfully!')
      } catch (error) {
        console.error('[InitMap] Error initializing map:', error)
      }
    }

    const initFullscreenMap = () => {
      if (!fullscreenMapContainer.value || !selectedJeepney.value) return

      if (fullscreenMap) {
        fullscreenMap.remove()
        fullscreenMap = null
      }

      fullscreenMap = L.map(fullscreenMapContainer.value).setView(
        selectedJeepney.value.terminalCoordinates,
        15
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(fullscreenMap)

      updateFullscreenMapMarkers()
    }

    const updateMapMarkers = () => {
      if (!map || !selectedJeepney.value) return

      if (terminalMarker) map.removeLayer(terminalMarker)
      if (destinationMarker) map.removeLayer(destinationMarker)
      if (routeLine) map.removeLayer(routeLine)
      if (navigationLine) map.removeLayer(navigationLine)
      if (userMarker) map.removeLayer(userMarker)

      const terminalIcon = L.divIcon({
        className: 'terminal-marker',
        html: '<div style="font-size: 32px">🚍</div>',
        iconSize: [32, 32],
      })
      terminalMarker = L.marker(selectedJeepney.value.terminalCoordinates, { icon: terminalIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${selectedJeepney.value.name}</strong><br>${selectedJeepney.value.terminalLocation}`
        )

      const destinationIcon = L.divIcon({
        className: 'destination-marker',
        html: '<div style="font-size: 28px">📍</div>',
        iconSize: [28, 28],
      })
      destinationMarker = L.marker(selectedJeepney.value.destinationCoordinates, {
        icon: destinationIcon,
      })
        .addTo(map)
        .bindPopup(`<strong>Destination</strong><br>${selectedJeepney.value.destination}`)

      routeLine = L.polyline(selectedJeepney.value.routeCoordinates, {
        color: '#4a5f4e',
        weight: 4,
      }).addTo(map)

      if (userLocation.value) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div class="pulse"></div>',
          iconSize: [20, 20],
        })
        userMarker = L.marker(userLocation.value, { icon: userIcon })
          .addTo(map)
          .bindPopup('You are here!')

        if (navigationRoute.value.length > 0) {
          navigationLine = L.polyline(navigationRoute.value, {
            color: '#2196F3',
            weight: 4,
            dashArray: '10, 10',
          }).addTo(map)

          const bounds = L.latLngBounds([
            userLocation.value,
            selectedJeepney.value.terminalCoordinates,
          ])
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }

    const updateFullscreenMapMarkers = () => {
      if (!fullscreenMap || !selectedJeepney.value) return

      const terminalIcon = L.divIcon({
        className: 'terminal-marker',
        html: '<div style="font-size: 40px">🚍</div>',
        iconSize: [40, 40],
      })
      L.marker(selectedJeepney.value.terminalCoordinates, { icon: terminalIcon })
        .addTo(fullscreenMap)
        .bindPopup(
          `<strong>${selectedJeepney.value.name}</strong><br>${selectedJeepney.value.terminalLocation}`
        )

      const destinationIcon = L.divIcon({
        className: 'destination-marker',
        html: '<div style="font-size: 36px">📍</div>',
        iconSize: [36, 36],
      })
      L.marker(selectedJeepney.value.destinationCoordinates, { icon: destinationIcon })
        .addTo(fullscreenMap)
        .bindPopup(`<strong>Destination</strong><br>${selectedJeepney.value.destination}`)

      L.polyline(selectedJeepney.value.routeCoordinates, {
        color: '#4a5f4e',
        weight: 5,
      }).addTo(fullscreenMap)

      if (userLocation.value) {
        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div class="pulse"></div>',
          iconSize: [20, 20],
        })
        L.marker(userLocation.value, { icon: userIcon })
          .addTo(fullscreenMap)
          .bindPopup('You are here!')

        if (navigationRoute.value.length > 0) {
          L.polyline(navigationRoute.value, {
            color: '#2196F3',
            weight: 5,
            dashArray: '10, 10',
          }).addTo(fullscreenMap)

          const bounds = L.latLngBounds([
            userLocation.value,
            selectedJeepney.value.terminalCoordinates,
          ])
          fullscreenMap.fitBounds(bounds, { padding: [100, 100] })
        }
      }
    }

    const handleSearch = () => {
      if (searchQuery.value) {
        $q.notify({
          message: `Searching for: ${searchQuery.value}`,
          color: 'primary',
          icon: 'search',
        })
      }
    }

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const selectJeepney = async (jeepney) => {
      console.log('[SelectJeepney] Selected:', jeepney)
      console.log(
        '[SelectJeepney] Has coordinates?',
        jeepney.terminalCoordinates,
        jeepney.destinationCoordinates
      )

      // Set selected jeepney - watch will handle map initialization
      selectedJeepney.value = { ...jeepney }
      tutorialStep.value = 1

      // Wait for DOM to render
      await nextTick()

      // Scroll to detail section
      setTimeout(() => {
        const detailSection = document.querySelector('.jeepney-detail-section')
        console.log('[SelectJeepney] Detail section found:', !!detailSection)

        if (detailSection) {
          detailSection.classList.add('animate-in')
        }
      }, 100)

      // Fetch street route in background if needed
      if (jeepney.routeCoordinates.length === 2) {
        console.log('[SelectJeepney] Fetching street route for 2-point route')
        const [terminalLat, terminalLng] = jeepney.terminalCoordinates
        const [destLat, destLng] = jeepney.destinationCoordinates

        getStreetRoute(terminalLat, terminalLng, destLat, destLng)
          .then(({ coordinates: streetRoute }) => {
            if (streetRoute.length > 0) {
              console.log(
                '[SelectJeepney] Street route fetched, updating:',
                streetRoute.length,
                'points'
              )
              selectedJeepney.value = {
                ...jeepney,
                routeCoordinates: streetRoute,
              }
            }
          })
          .catch((error) => {
            console.error('[SelectJeepney] Error fetching street route:', error)
          })
      }
    }

    const loadMoreJeepneys = () => {
      $q.notify({
        message: 'All routes are displayed',
        color: 'primary',
        icon: 'directions_bus',
      })
    }

    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        $q.notify({
          message: 'Geolocation is not supported by your browser',
          color: 'negative',
          icon: 'error',
        })
        return
      }

      isLoadingLocation.value = true
      $q.notify({
        message: 'Getting your location...',
        color: 'info',
        icon: 'my_location',
        timeout: 2000,
      })

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          isLoadingLocation.value = false
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude

          userLocation.value = [userLat, userLng]

          if (selectedJeepney.value) {
            const [terminalLat, terminalLon] = selectedJeepney.value.terminalCoordinates

            const { coordinates: route, distance } = await getStreetRoute(
              userLat,
              userLng,
              terminalLat,
              terminalLon
            )

            if (route.length > 0) {
              navigationRoute.value = route
              routeDistance.value = distance
            } else {
              navigationRoute.value = [
                userLocation.value,
                selectedJeepney.value.terminalCoordinates,
              ]
            }

            if (map) {
              updateMapMarkers()
            }
            if (fullscreenMap) {
              updateFullscreenMapMarkers()
            }
          }

          $q.notify({
            message: 'Location detected!',
            color: 'positive',
            icon: 'check_circle',
          })
        },
        (error) => {
          isLoadingLocation.value = false
          let errorMessage = 'Unable to get your location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }

          $q.notify({
            message: errorMessage,
            color: 'negative',
            icon: 'error',
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }

    const recenterMap = () => {
      if (userLocation.value && selectedJeepney.value && fullscreenMap) {
        const bounds = L.latLngBounds([
          userLocation.value,
          selectedJeepney.value.terminalCoordinates,
        ])
        fullscreenMap.fitBounds(bounds, { padding: [100, 100] })
      }
    }

    const showNavigationOnMap = async () => {
      if (!userLocation.value) {
        await getUserLocation()
      }

      showFullscreenMap.value = true

      setTimeout(() => {
        initFullscreenMap()
      }, 300)
    }

    const observeElements = () => {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, options)

      const elements = document.querySelectorAll('.section-animate')
      elements.forEach((el) => observer.observe(el))

      return observer
    }

    let observer

    watch(showFullscreenMap, (newVal) => {
      if (newVal) {
        setTimeout(() => {
          initFullscreenMap()
        }, 300)
      }
    })

    watch(
      selectedJeepney,
      async (newVal, oldVal) => {
        if (newVal && newVal !== oldVal) {
          console.log('[Watch] selectedJeepney changed')

          // Check if it's just coordinates that changed (street route update)
          if (
            oldVal &&
            newVal.id === oldVal.id &&
            newVal.routeCoordinates !== oldVal.routeCoordinates
          ) {
            console.log('[Watch] Route coordinates updated, refreshing map')
            if (map) {
              updateMapMarkers()
            }
            return
          }

          // New jeepney selected, initialize map
          console.log('[Watch] New jeepney selected, waiting for DOM...')
          await nextTick()

          setTimeout(() => {
            console.log('[Watch] Initializing map for selected jeepney')
            if (mapContainer.value) {
              initMap()
            } else {
              console.error('[Watch] Map container still not available!')
            }
          }, 600)
        }
      },
      { deep: true }
    )

    onMounted(async () => {
      console.log('[LandingPage] Component mounted')

      setTimeout(() => {
        observer = observeElements()
      }, 100)

      await fetchRoutes()

      // Fetch street routes for all jeepneys
      await fetchStreetRoutesForAllJeepneys()

      console.log('[LandingPage] After fetch, jeepneys:', jeepneys.value)

      // Don't auto-select first jeepney - let user click to see details
      // This avoids map initialization issues on page load
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    onBeforeUnmount(() => {
      if (map) {
        map.remove()
        map = null
      }
      if (fullscreenMap) {
        fullscreenMap.remove()
        fullscreenMap = null
      }
    })

    return {
      searchQuery,
      displayedJeepneys,
      selectedJeepney,
      showNavigationTutorial,
      showFullscreenMap,
      tutorialStep,
      userLocation,
      mapContainer,
      fullscreenMapContainer,
      isLoadingLocation,
      isLoadingRoutes,
      distanceToTerminal,
      estimatedWalkingTime,
      navigationRoute,
      handleSearch,
      scrollToSection,
      selectJeepney,
      loadMoreJeepneys,
      getUserLocation,
      showNavigationOnMap,
      recenterMap,
    }
  },
})
</script>

<style lang="scss" scoped>
$primary-green: #4a5f4e;
$dark-green: #3a4f3e;
$light-gray: #f5f5f5;
$light-green: #e8f5e0;
$text-dark: #333;
$text-light: #666;

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

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 95, 78, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(74, 95, 78, 0);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 95, 78, 0);
    transform: scale(1);
  }
}

:deep(.user-location-marker) {
  .pulse {
    width: 20px;
    height: 20px;
    background: $primary-green;
    border: 3px solid white;
    border-radius: 50%;
    animation: pulse 2s infinite;
    box-shadow: 0 0 0 0 rgba(74, 95, 78, 0.7);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.section-animate {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-hover-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}

.card-hover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  margin-bottom: 60px;

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 1px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .section-subtitle {
    font-size: 1.2rem;
    color: $text-light;
    max-width: 600px;
    margin: 0 auto;
  }
}

.hero-section {
  position: relative;
  min-height: 700px;
  background-image: url('../assets/44.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
    display: flex;
    align-items: center;
    padding: 0 5%;
  }

  .hero-content {
    max-width: 700px;
    color: white;
    z-index: 1;

    .hero-title {
      font-size: 4rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 1.5rem 0;
      letter-spacing: 2px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }

    .hero-description {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .route-search-box {
      margin-bottom: 2rem;
      max-width: 600px;

      .search-input {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 8px;
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
}

.features-section {
  background-color: $primary-green;
  padding: 80px 0;
  color: white;

  .features-wrapper {
    display: grid;
    grid-template-columns: 45fr 55fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .features-content {
    .features-title {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.4;
      margin: 0 0 1.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      @media (max-width: 768px) {
        font-size: 1.3rem;
      }
    }

    .features-description {
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .feature-cards {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .feature-card {
        display: flex;
        gap: 1rem;
        align-items: flex-start;

        .feature-icon {
          flex-shrink: 0;
          color: white;
          margin-top: 2px;
        }

        .feature-text {
          .feature-card-title {
            font-size: 0.9rem;
            font-weight: 700;
            margin: 0 0 0.4rem 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .feature-card-description {
            font-size: 0.85rem;
            line-height: 1.6;
            margin: 0;
            opacity: 0.85;
          }
        }
      }
    }
  }

  .features-image-col {
    display: flex;
    align-items: center;
    justify-content: center;

    .features-image-wrapper {
      width: 100%;
      max-width: 550px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

      .features-image {
        width: 100%;
        height: auto;
        display: block;
      }
    }
  }
}

.jeepneys-section {
  padding: 100px 0;
  background: #f8f9fa;

  .jeepneys-grid {
    margin-bottom: 80px;

    .jeepney-cards-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .jeepney-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .jeepney-image-wrapper {
        width: 100%;
        padding-top: 75%;
        position: relative;
        background: $light-gray;

        .jeepney-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .jeepney-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: $light-gray;
        }
      }

      .jeepney-info {
        padding: 1.5rem;
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .jeepney-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: $text-dark;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .jeepney-route {
          font-size: 0.9rem;
          color: $text-light;
          margin: 0;
        }
      }
    }
  }

  .jeepney-detail-section {
    background: $light-green;
    padding: 60px;
    border-radius: 16px;
    margin-top: 60px;

    @media (max-width: 768px) {
      padding: 30px 20px;
    }

    .jeepney-detail-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      align-items: start;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }

    .jeepney-detail-map-col {
      width: 100%;

      .map-wrapper {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .map-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          display: flex;
          gap: 8px;
        }
      }

      .distance-info {
        background: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        color: $text-dark;
        font-weight: 500;
      }
    }

    .jeepney-detail-content {
      .jeepney-detail-title {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0 0 1rem 0;
        color: $text-dark;
        text-transform: uppercase;
        letter-spacing: 1px;

        @media (max-width: 768px) {
          font-size: 2rem;
        }
      }

      .jeepney-detail-description {
        font-size: 1rem;
        line-height: 1.8;
        color: $text-dark;
        margin-bottom: 2rem;
      }

      .jeepney-detail-info {
        display: flex;
        gap: 3rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;

        .info-item {
          .info-label {
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            color: $text-dark;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .info-value {
            font-size: 0.95rem;
            line-height: 1.6;
            color: $text-dark;
            margin: 0;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
    }
  }
}

.route-sign {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #333;
}

.floating-info-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1000;

  @media (max-width: 600px) {
    left: 10px;
    right: 10px;
    bottom: 10px;
  }

  .info-panel-header {
    padding: 16px;
    background: $primary-green;
    color: white;
    border-radius: 12px 12px 0 0;
    display: flex;
    align-items: center;
  }

  .info-panel-content {
    padding: 16px;

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 0.9rem;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .info-panel-actions {
    padding: 0 16px 16px 16px;
  }
}
</style>
