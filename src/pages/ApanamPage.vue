<template>
  <q-page class="apanam-page">
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">P2P NAVIGATION</h1>
          <p class="hero-description">
            Easily navigate Baguio's jeepney routes with step-by-step directions tailored just for
            you.
          </p>
        </div>
      </div>
    </section>

    <section class="navigation-section">
      <div class="container">
        <div class="navigation-wrapper">
          <div class="navigation-content">
            <div class="text-overline text-white q-mb-sm">Navigate</div>
            <h2 class="navigation-title">EFFORTLESS JEEPNEY NAVIGATION AT YOUR FINGERTIPS</h2>
            <p class="navigation-description">
              Easily enter your starting and destination points to receive precise jeepney routes.
              Our user-friendly interface ensures you never miss a stop.
            </p>

            <div class="features-row">
              <div class="feature-item">
                <h3 class="feature-label">INPUT LOCATIONS</h3>
                <p class="feature-text">Get step-by-step directions tailored to your journey</p>
              </div>

              <div class="feature-item">
                <h3 class="feature-label">START YOUR JOURNEY</h3>
                <p class="feature-text">Experience seamless navigation with our intuitive system</p>
              </div>
            </div>

            <div class="action-buttons">
              <q-btn
                label="Go"
                unelevated
                color="white"
                text-color="dark"
                padding="10px 32px"
                class="btn-hover-lift"
                @click="scrollToNavigation"
              />
              <q-btn
                flat
                label="Learn More"
                color="white"
                padding="10px 20px"
                icon-right="arrow_forward"
                class="learn-more-btn"
                @click="learnMore"
              />
            </div>
          </div>

          <div class="navigation-card-wrapper">
            <div class="navigation-card">
              <div class="input-group">
                <label class="input-label">FROM:</label>
                <q-select
                  v-model="fromLocation"
                  :options="fromLocationOptions"
                  filled
                  use-input
                  input-debounce="300"
                  placeholder="Enter starting location"
                  bg-color="white"
                  class="location-input"
                  @filter="filterFromLocations"
                  @input-value="onFromInputChange"
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
                <label class="input-label">TO:</label>
                <q-select
                  v-model="toLocation"
                  :options="toLocationOptions"
                  filled
                  use-input
                  input-debounce="300"
                  placeholder="Enter destination"
                  bg-color="white"
                  class="location-input"
                  @filter="filterToLocations"
                  @input-value="onToInputChange"
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
                color="dark"
                size="lg"
                padding="12px 32px"
                class="btn-hover-lift start-nav-btn"
                :loading="isCalculatingRoute"
                @click="startNavigation"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- OPTIONS SECTION - Shows after Start Navigation -->
    <section id="options" class="options-section" ref="optionsSection" v-show="showJeepneyOptions">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">OPTIONS</h2>
          <p class="section-subtitle">
            Choose which jeepney you want to ride to get to your destination!
          </p>
        </div>

        <div class="options-grid">
          <div
            v-for="(option, index) in jeepneyOptions"
            :key="index"
            class="option-card section-animate card-hover"
            :class="{ 'selected-card': selectedJeepney?.name === option.name }"
            @click="selectJeepney(option)"
          >
            <h3 class="option-name">{{ option.name }}</h3>
            <p class="option-route">{{ option.route }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- JEEPNEY DETAIL SECTION - Shows after selecting a jeepney option -->
    <section v-if="selectedJeepney" class="jeepney-detail-section">
      <div class="container">
        <div class="detail-header">
          <div class="header-content">
            <h1 class="jeep-title">{{ selectedJeepney.name }}</h1>
            <div class="action-buttons">
              <q-btn
                label="Near Me"
                icon="my_location"
                unelevated
                color="primary"
                padding="10px 24px"
                class="btn-hover-lift near-me-btn"
                :loading="isLoadingLocation"
                @click="findNearMe"
              />
              <q-btn
                label="Test: SM Baguio"
                icon="location_searching"
                outline
                color="primary"
                padding="10px 24px"
                class="btn-hover-lift test-btn"
                @click="testSMBaguioLocation"
              >
                <q-tooltip>Start from SM Baguio (for testing)</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <div class="content-grid">
          <!-- MAP COLUMN -->
          <div class="map-column">
            <div class="map-wrapper" ref="mapContainer"></div>
            
            <div class="route-legend">
              <div class="legend-item">
                <div class="legend-line walking-line"></div>
                <span class="legend-text">Walking Route (Current Location → Terminal)</span>
              </div>
              <div class="legend-item">
                <div class="legend-line jeepney-line"></div>
                <span class="legend-text">Jeepney Route (Terminal → Drop-off Point)</span>
              </div>
            </div>
          </div>

          <!-- INFO COLUMN -->
          <div class="info-column">
            <div class="info-list">
              <div class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="location_on" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">TERMINAL LOCATION</h3>
                  <p class="info-description">{{ selectedJeepney.terminalAddress }}</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="directions_walk" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">HOW TO GET THERE</h3>
                  <p class="info-description">{{ selectedJeepney.terminalInstructions }}</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="record_voice_over" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">WHAT TO TELL THE DRIVER</h3>
                  <p class="info-description highlight-text">"{{ selectedJeepney.whatToSay }}"</p>
                  <p class="info-subdescription">Tell the driver this phrase when you board the jeepney</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="schedule" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">ESTIMATED RIDE TIME</h3>
                  <p class="info-description">{{ selectedJeepney.rideTime }}</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="payments" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">JEEPNEY FARE</h3>
                  <p class="info-description">{{ selectedJeepney.fare }}</p>
                </div>
              </div>

              <div v-if="selectedJeepney.additionalInfo" class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="info" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">ADDITIONAL INFO</h3>
                  <p class="info-description">{{ selectedJeepney.additionalInfo }}</p>
                </div>
              </div>

              <div v-if="showWalkingRoute" class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="directions" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">WALKING ROUTE</h3>
                  <p class="info-description">{{ walkingInstructions }}</p>
                </div>
              </div>

              <div class="info-item journey-summary">
                <div class="info-icon-wrapper">
                  <q-icon name="map" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">COMPLETE JOURNEY</h3>
                  <div class="journey-steps">
                    <div class="journey-step">
                      <div class="step-number">1</div>
                      <div class="step-content">
                        <strong>Walk to Terminal</strong>
                        <p>{{ walkingInstructions }}</p>
                      </div>
                    </div>
                    <div class="journey-step">
                      <div class="step-number">2</div>
                      <div class="step-content">
                        <strong>Board Jeepney</strong>
                        <p>Tell driver: "{{ selectedJeepney.whatToSay }}"</p>
                      </div>
                    </div>
                    <div class="journey-step">
                      <div class="step-number">3</div>
                      <div class="step-content">
                        <strong>Jeepney Ride</strong>
                        <p>{{ selectedJeepney.rideTime }} to {{ selectedJeepney.destinationName }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="arrived-button-wrapper">
              <q-btn
                label="I HAVE ARRIVED!"
                outline
                color="dark"
                size="lg"
                padding="12px 40px"
                class="btn-hover-lift"
                @click="markArrived"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <FAQSection />

    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default defineComponent({
  name: 'ApanamPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const optionsSection = ref(null)
    const fromLocation = ref(null)
    const toLocation = ref(null)
    const fromLocationOptions = ref([])
    const toLocationOptions = ref([])
    const mapContainer = ref(null)
    let map = null
    let userMarker = null
    let terminalMarker = null
    let destinationMarker = null
    let routeLine = null
    let jeepneyRouteLine = null
    const isLoadingLocation = ref(false)
    const isCalculatingRoute = ref(false)
    const selectedJeepney = ref(null)
    const userLocation = ref(null)
    const routeData = ref(null)
    const showJeepneyOptions = ref(false)

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
      { label: 'Botanical Garden', value: 'botanical-garden', coords: [16.4176, 120.5970] },
      { label: 'Baguio Convention Center', value: 'convention-center', coords: [16.4090, 120.5940] },
      { label: 'Baguio General Hospital', value: 'bgh', coords: [16.4068, 120.5995] },
      { label: 'University of Baguio', value: 'ub', coords: [16.4111, 120.6005] },
      { label: 'Saint Louis University', value: 'slu', coords: [16.4133, 120.5967] },
      { label: 'Good Shepherd Convent', value: 'good-shepherd', coords: [16.4196, 120.6040] },
      { label: 'Tam-awan Village', value: 'tam-awan', coords: [16.4231, 120.5889] },
      { label: 'Lourdes Grotto', value: 'lourdes-grotto', coords: [16.4253, 120.5972] },
      { label: 'PMA (Philippine Military Academy)', value: 'pma', coords: [16.3928, 120.5962] },
    ]

    const jeepneyOptions = computed(() => {
      if (!toLocation.value) {
        return []
      }

      const destinationLabel = toLocation.value.label || 'destination'
      const destinationCoords = toLocation.value.coords || [16.4176, 120.5970]

      return [
        {
          name: 'MARIA BASA',
          route: 'Maria Basa to Session Road',
          terminalCoords: [16.4108, 120.5969],
          terminalAddress: 'Governor Pack Road Terminal (Maria Basa Route), Near Sunshine Park, Baguio City',
          terminalInstructions: 'From Session Road, walk to Upper Session near Casa Vallejo Hotel, then head to Sunshine Park area. The Governor Pack Road terminal is located here. Look for jeepneys with "Maria Basa" signage. Staging area is at Sandico Street.',
          whatToSay: `${destinationLabel} po`,
          fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
          rideTime: '10-15 minutes',
          additionalInfo: 'This jeepney passes by major landmarks including Session Road, Burnham Park, and the Cathedral area.',
          destinationCoords: destinationCoords,
          destinationName: destinationLabel,
        },
        {
          name: 'TIPTOP',
          route: 'Tiptop to Market',
          terminalCoords: [16.4108, 120.5969],
          terminalAddress: 'Governor Pack Road Terminal (Tiptop Route), Near Sunshine Park, Baguio City',
          terminalInstructions: 'From Session Road, walk to Upper Session near Casa Vallejo Hotel, then head to Sunshine Park area. The Governor Pack Road terminal is located here. Look for jeepneys with "Tiptop" signage. Staging area is at Sandico Street.',
          whatToSay: `${destinationLabel} po`,
          fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
          rideTime: '12-18 minutes',
          additionalInfo: 'Route covers the market area and passes through several major roads. Great option if coming from downtown.',
          destinationCoords: destinationCoords,
          destinationName: destinationLabel,
        },
        {
          name: 'NAVY BASE',
          route: 'Navy Base to Session Road',
          terminalCoords: [16.4107, 120.5917],
          terminalAddress: 'Perfecto Street Terminal (PMA/Loakan/Navy Base Route), Near Hotel Veniz, Baguio City',
          terminalInstructions: 'From Session Road, turn to Lower Mabini Street, cross Harrison Road using the pedestrian overpass. Turn right after descending the overpass stairs, then immediately turn left to Perfecto Street. The terminal is located near Hotel Veniz with "PMA-KIAS-SITEL-EPZA" jeepney loading area sign.',
          whatToSay: `${destinationLabel} po`,
          fare: '₱15.00 (Regular), ₱12.00 (Student/PWD/Senior)',
          rideTime: '15-20 minutes',
          additionalInfo: 'This jeepney route goes to Loakan, KIAS, PMA, and Springhills. Good for destinations along Loakan Road area.',
          destinationCoords: destinationCoords,
          destinationName: destinationLabel,
        },
        {
          name: 'MINES VIEW',
          route: 'Mines View to Market',
          terminalCoords: [16.4108, 120.5969],
          terminalAddress: 'Governor Pack Road Terminal (Mines View Route), Near Sunshine Park, Baguio City',
          terminalInstructions: 'From Session Road, walk to Upper Session near Casa Vallejo Hotel, then head to Sunshine Park area. The Governor Pack Road terminal is located here. Look for jeepneys with "Mines View" signage. Alternative: You can also catch the jeepney at Lower Mabini Street near the old McDonald\'s area.',
          whatToSay: `${destinationLabel} po`,
          fare: '₱15.00 (Regular), ₱12.00 (Student/PWD/Senior)',
          rideTime: '15-20 minutes',
          additionalInfo: 'This route passes through Teacher\'s Camp, Botanical Garden, Wright Park, The Mansion, and Good Shepherd Convent before reaching Mines View Park.',
          destinationCoords: destinationCoords,
          destinationName: destinationLabel,
        },
      ]
    })

    const walkingInstructions = computed(() => {
      if (!selectedJeepney.value || !userLocation.value) {
        return 'Click "Near Me" or "Test: SM Baguio" to get walking directions to the terminal.'
      }

      if (routeData.value && routeData.value.distance) {
        const distanceKm = (routeData.value.distance / 1000).toFixed(2)
        return `Follow the route on the map. Total walking distance: ${distanceKm} km along streets and sidewalks.`
      }

      return 'Follow the route on the map to reach the terminal. Walk along the marked path.'
    })

    const showWalkingRoute = computed(() => {
      return userLocation.value && selectedJeepney.value
    })

    const estimatedTime = computed(() => {
      if (!selectedJeepney.value || !userLocation.value) {
        return 'Location required'
      }

      if (routeData.value && routeData.value.duration) {
        const timeInMinutes = Math.round(routeData.value.duration / 60)
        return `Approximately ${timeInMinutes} minutes walking`
      }

      const distance = calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        selectedJeepney.value.terminalCoords[0],
        selectedJeepney.value.terminalCoords[1]
      )
      const walkingSpeed = 5
      const timeInMinutes = Math.round((distance / walkingSpeed) * 60)
      return `Approximately ${timeInMinutes} minutes walking`
    })

    const filterFromLocations = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        if (needle === '') {
          fromLocationOptions.value = [
            { label: '📍 Use Current Location', value: 'current-location', isCurrentLocation: true },
            ...baguioLocations,
          ]
        } else {
          const filtered = baguioLocations.filter(
            (loc) => loc.label.toLowerCase().indexOf(needle) > -1
          )
          fromLocationOptions.value = [
            { label: '📍 Use Current Location', value: 'current-location', isCurrentLocation: true },
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

    const onFromInputChange = () => {
}

const onToInputChange = () => {
}

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const fetchStreetRoute = async (startLat, startLng, endLat, endLng) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`

        const response = await fetch(url)
        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const coordinates = data.routes[0].geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ])
          return {
            coordinates,
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
          }
        }
        return null
      } catch {
        console.log('Error fetching route:')
        return null
      }
    }

    const initMap = () => {
      if (!mapContainer.value) return

      const baguioCoords = [16.411, 120.593]

      map = L.map(mapContainer.value).setView(baguioCoords, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      baguioLocations.forEach((location) => {
        L.marker(location.coords).addTo(map).bindPopup(location.label)
      })

      if (selectedJeepney.value) {
        updateMapForJeepney()
      }
    }

    const updateMapForJeepney = async () => {
      if (!map || !selectedJeepney.value) return

      if (terminalMarker) {
        map.removeLayer(terminalMarker)
      }
      if (destinationMarker) {
        map.removeLayer(destinationMarker)
      }
      if (jeepneyRouteLine) {
        map.removeLayer(jeepneyRouteLine)
      }

      const terminalIcon = L.divIcon({
        className: 'terminal-marker',
        html: '<div class="terminal-icon">🚍</div>',
        iconSize: [30, 30],
      })

      terminalMarker = L.marker(selectedJeepney.value.terminalCoords, { icon: terminalIcon })
        .addTo(map)
        .bindPopup(
          `<b>Terminal: ${selectedJeepney.value.name}</b><br>${selectedJeepney.value.terminalAddress}`
        )
        .openPopup()

      if (selectedJeepney.value.destinationCoords) {
        const destinationIcon = L.divIcon({
          className: 'destination-marker',
          html: '<div class="destination-icon">📍</div>',
          iconSize: [30, 30],
        })

        destinationMarker = L.marker(selectedJeepney.value.destinationCoords, {
          icon: destinationIcon,
        })
          .addTo(map)
          .bindPopup(`<b>Drop-off Point</b><br>${selectedJeepney.value.destinationName}`)

        const jeepneyRouteData = await fetchStreetRoute(
          selectedJeepney.value.terminalCoords[0],
          selectedJeepney.value.terminalCoords[1],
          selectedJeepney.value.destinationCoords[0],
          selectedJeepney.value.destinationCoords[1]
        )

        if (jeepneyRouteData && jeepneyRouteData.coordinates) {
          jeepneyRouteLine = L.polyline(jeepneyRouteData.coordinates, {
            color: '#FF6B35',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            dashArray: '10, 10',
          }).addTo(map)
        } else {
          jeepneyRouteLine = L.polyline([
            selectedJeepney.value.terminalCoords,
            selectedJeepney.value.destinationCoords,
          ], {
            color: '#FF6B35',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
          }).addTo(map)
        }

        const bounds = L.latLngBounds([
          selectedJeepney.value.terminalCoords,
          selectedJeepney.value.destinationCoords,
        ])
        
        if (userLocation.value) {
          bounds.extend([userLocation.value.lat, userLocation.value.lng])
        }
        
        map.fitBounds(bounds, { padding: [50, 50] })
      } else {
        map.setView(selectedJeepney.value.terminalCoords, 15)
      }

      if (userLocation.value) {
        drawRouteToTerminal()
      }
    }

    const drawRouteToTerminal = async () => {
      if (!map || !userLocation.value || !selectedJeepney.value) return

      if (routeLine) {
        map.removeLayer(routeLine)
      }

      const fetchedRouteData = await fetchStreetRoute(
        userLocation.value.lat,
        userLocation.value.lng,
        selectedJeepney.value.terminalCoords[0],
        selectedJeepney.value.terminalCoords[1]
      )

      if (fetchedRouteData && fetchedRouteData.coordinates) {
        routeData.value = fetchedRouteData

        routeLine = L.polyline(fetchedRouteData.coordinates, {
          color: '#4a5f4e',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(map)

        const bounds = L.latLngBounds(fetchedRouteData.coordinates)
        
        if (selectedJeepney.value.destinationCoords) {
          bounds.extend(selectedJeepney.value.destinationCoords)
        }
        
        map.fitBounds(bounds, { padding: [50, 50] })

        $q.notify({
          message: `Walking route: ${(fetchedRouteData.distance / 1000).toFixed(2)} km, ~${Math.round(fetchedRouteData.duration / 60)} min walk to terminal`,
          color: 'positive',
          icon: 'directions_walk',
          timeout: 3000,
        })
      } else {
        routeData.value = null

        const routeCoords = [
          [userLocation.value.lat, userLocation.value.lng],
          selectedJeepney.value.terminalCoords,
        ]

        routeLine = L.polyline(routeCoords, {
          color: '#4a5f4e',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(map)

        const bounds = L.latLngBounds(routeCoords)
        
        if (selectedJeepney.value.destinationCoords) {
          bounds.extend(selectedJeepney.value.destinationCoords)
        }
        
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }

    const scrollToNavigation = () => {
      const element = document.querySelector('.navigation-card')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    const scrollToOptions = () => {
      const element = document.getElementById('options')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const learnMore = () => {
      $q.notify({
        message: 'Loading more information...',
        color: 'primary',
        icon: 'info',
      })
    }

    const startNavigation = async () => {
      if (!fromLocation.value || !toLocation.value) {
        $q.notify({
          message: 'Please select both starting and destination points',
          color: 'warning',
          icon: 'warning',
        })
        return
      }

      if (fromLocation.value.isCurrentLocation) {
        if (!navigator.geolocation) {
          $q.notify({
            message: 'Geolocation is not supported by your browser',
            color: 'negative',
            icon: 'error',
          })
          return
        }

        isCalculatingRoute.value = true
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            proceedWithNavigation()
          },
          () => {
            isCalculatingRoute.value = false
            $q.notify({
              message: 'Unable to get your location. Please enable location access.',
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
      } else {
        proceedWithNavigation()
      }
    }

    const proceedWithNavigation = async () => {
      isCalculatingRoute.value = true

      $q.notify({
        message: `Finding jeepney routes from ${fromLocation.value.label || 'your location'} to ${toLocation.value.label}...`,
        color: 'positive',
        icon: 'navigation',
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      isCalculatingRoute.value = false

      showJeepneyOptions.value = true

      setTimeout(() => {
        scrollToOptions()
      }, 300)

      $q.notify({
        message: 'Select a jeepney route below to see terminal directions',
        color: 'info',
        icon: 'info',
        timeout: 3000,
      })
    }

    const selectJeepney = (jeepney) => {
      selectedJeepney.value = jeepney

      $q.notify({
        message: `Selected ${jeepney.name}`,
        color: 'primary',
        icon: 'directions_bus',
      })

      setTimeout(() => {
        const mapSection = document.querySelector('.jeepney-detail-section')
        if (mapSection) {
          mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }

        if (map) {
          setTimeout(() => {
            map.invalidateSize()
            updateMapForJeepney()
          }, 300)
        } else {
          initMap()
        }
      }, 100)
    }

    const findNearMe = () => {
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
        (position) => {
          isLoadingLocation.value = false
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude

          userLocation.value = { lat: userLat, lng: userLng }

          if (map) {
            if (userMarker) {
              map.removeLayer(userMarker)
            }

            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: '<div class="pulse"></div>',
              iconSize: [20, 20],
            })

            userMarker = L.marker([userLat, userLng], { icon: userIcon })
              .addTo(map)
              .bindPopup('You are here!')
              .openPopup()

            if (selectedJeepney.value) {
              drawRouteToTerminal()
            } else {
              map.setView([userLat, userLng], 15)
            }

            $q.notify({
              message: 'Showing your current location',
              color: 'positive',
              icon: 'location_on',
            })
          }
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

    const markArrived = () => {
      $q.notify({
        message: 'You have arrived at your destination!',
        color: 'positive',
        icon: 'check_circle',
        position: 'top',
      })
    }

    const testSMBaguioLocation = () => {
      const testLat = 16.4088516
      const testLng = 120.5972273

      userLocation.value = { lat: testLat, lng: testLng }

      $q.notify({
        message: 'TEST: Starting from SM City Baguio',
        color: 'info',
        icon: 'bug_report',
      })

      if (map) {
        if (userMarker) {
          map.removeLayer(userMarker)
        }

        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div class="pulse"></div>',
          iconSize: [20, 20],
        })

        userMarker = L.marker([testLat, testLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Test Location: SM City Baguio')
          .openPopup()

        if (selectedJeepney.value) {
          drawRouteToTerminal()
        } else {
          map.setView([testLat, testLng], 15)
        }

        $q.notify({
          message: 'Showing route from SM Baguio',
          color: 'positive',
          icon: 'location_on',
        })
      }
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

    onMounted(() => {
  fromLocationOptions.value = [
    { label: '📍 Use Current Location', value: 'current-location', isCurrentLocation: true },
    ...baguioLocations,
  ]
  toLocationOptions.value = [...baguioLocations]

  const route = router.currentRoute.value
  if (route.query && (route.query.toName || route.query.toLat)) {
    if (route.query.toName && route.query.toLat && route.query.toLng) {
      toLocation.value = {
        label: route.query.toName,
        value: route.query.toName.toLowerCase().replace(/\s+/g, '-'),
        coords: [parseFloat(route.query.toLat), parseFloat(route.query.toLng)],
      }

      $q.notify({
        message: `Destination set to: ${route.query.toName}`,
        color: 'positive',
        icon: 'place',
      })
    }

    if (route.query.fromLat && route.query.fromLng) {
      userLocation.value = {
        lat: parseFloat(route.query.fromLat),
        lng: parseFloat(route.query.fromLng),
      }
      fromLocation.value = {
        label: route.query.fromName || 'Your Location',
        value: 'from-ayan-mo',
        coords: [parseFloat(route.query.fromLat), parseFloat(route.query.fromLng)],
      }
    } else {
      fromLocation.value = { 
        label: '📍 Use Current Location', 
        value: 'current-location', 
        isCurrentLocation: true 
      }
    }

    if (toLocation.value && fromLocation.value) {
      setTimeout(() => {
        $q.notify({
          message: 'Preparing your route...',
          color: 'info',
          icon: 'navigation',
          timeout: 1500,
        })
        
        setTimeout(() => {
          startNavigation()
        }, 1000)
      }, 500)
    }
  } else {
    fromLocation.value = baguioLocations.find((loc) => loc.value === 'sm-baguio')
    toLocation.value = baguioLocations.find((loc) => loc.value === 'botanical-garden')
  }

  setTimeout(() => {
    observer = observeElements()
  }, 100)
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
    })

    return {
      fromLocation,
      toLocation,
      fromLocationOptions,
      toLocationOptions,
      jeepneyOptions,
      optionsSection,
      mapContainer,
      isLoadingLocation,
      isCalculatingRoute,
      selectedJeepney,
      routeData,
      showJeepneyOptions,
      walkingInstructions,
      showWalkingRoute,
      estimatedTime,
      scrollToNavigation,
      scrollToOptions,
      learnMore,
      startNavigation,
      selectJeepney,
      findNearMe,
      testSMBaguioLocation,
      markArrived,
      filterFromLocations,
      filterToLocations,
      onFromInputChange,
      onToInputChange,
    }
  },
})
</script>

<style lang="scss" scoped>
$primary-green: #4a5f4e;
$dark-green: #3a4f3e;
$light-gray: #f5f5f5;
$text-dark: #333;
$text-light: #666;
$cream-bg: #e8ebe3;

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
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
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

:deep(.terminal-marker) {
  .terminal-icon {
    font-size: 30px;
    text-align: center;
    line-height: 30px;
  }
}

:deep(.destination-marker) {
  .destination-icon {
    font-size: 30px;
    text-align: center;
    line-height: 30px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  position: relative;
  min-height: 400px;
  background-image: url('../assets/2.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    min-height: 300px;
  }

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
      font-size: 3rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 1rem 0;
      letter-spacing: 2px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 0;
      opacity: 0.95;
      max-width: 600px;
    }
  }
}

.navigation-section {
  background-color: $primary-green;
  padding: 80px 0;
  color: white;

  .navigation-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .navigation-content {
    .navigation-title {
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.2;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }
    }

    .navigation-description {
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .features-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 2rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .feature-item {
        .feature-label {
          font-size: 0.85rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .feature-text {
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0;
          color: rgba(255, 255, 255, 0.85);
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;

      .learn-more-btn {
        font-weight: 600;
        text-transform: none;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .navigation-card-wrapper {
    display: flex;
    justify-content: center;
  }

  .navigation-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    .input-group {
      margin-bottom: 24px;

      &:last-of-type {
        margin-bottom: 32px;
      }

      .input-label {
        display: block;
        font-size: 1rem;
        font-weight: 700;
        margin-bottom: 12px;
        color: white;
        letter-spacing: 1px;
      }

      .location-input {
        :deep(.q-field__control) {
          border-radius: 8px;
          min-height: 50px;
        }

        :deep(.q-field__native) {
          font-size: 0.95rem;
        }
      }
    }

    .start-nav-btn {
      width: 100%;
    }
  }
}

.options-section {
  background: $cream-bg;
  padding: 100px 0;

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
      font-size: 1.1rem;
      color: $text-dark;
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 900px;
    margin: 0 auto;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .option-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 30px;
      text-align: left;

      &.selected-card {
        border: 2px solid $primary-green;
        background: rgba(74, 95, 78, 0.05);
      }

      .option-name {
        font-size: 1rem;
        font-weight: 800;
        margin: 0 0 0.5rem 0;
        color: $text-dark;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .option-route {
        font-size: 0.9rem;
        color: $text-light;
        margin: 0;
      }
    }
  }
}

.jeepney-detail-section {
  background: white;
  padding: 60px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }

  .detail-header {
    margin-bottom: 40px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }

      .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        @media (max-width: 768px) {
          width: 100%;
          flex-direction: column;

          .q-btn {
            width: 100%;
          }
        }
      }
    }

    .jeep-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      color: $text-dark;
      text-transform: uppercase;
      letter-spacing: 1px;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }
  }

  .content-grid {
    display: grid;
    grid-template-columns: 55fr 45fr;
    gap: 60px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .map-column {
    .map-wrapper {
      width: 100%;
      height: 600px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      background: $light-gray;
      margin-bottom: 20px;

      @media (max-width: 768px) {
        height: 400px;
      }

      :deep(.leaflet-container) {
        width: 100%;
        height: 100%;
        border-radius: 12px;
      }

      :deep(.leaflet-popup-content-wrapper) {
        border-radius: 8px;
      }

      :deep(.leaflet-popup-content) {
        font-family: 'Inter', sans-serif;
        font-size: 14px;
      }
    }

    .route-legend {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      @media (max-width: 768px) {
        padding: 12px 15px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .legend-line {
          width: 40px;
          height: 4px;
          border-radius: 2px;

          &.walking-line {
            background: $primary-green;
          }

          &.jeepney-line {
            background: #FF6B35;
            background-image: repeating-linear-gradient(
              90deg,
              #FF6B35,
              #FF6B35 10px,
              transparent 10px,
              transparent 20px
            );
          }
        }

        .legend-text {
          font-size: 0.85rem;
          color: $text-dark;
          font-weight: 500;
        }
      }
    }
  }

  .info-column {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 40px;
      margin-bottom: 40px;

      .info-item {
        display: grid;
        grid-template-columns: auto auto 1fr;
        gap: 20px;
        align-items: flex-start;

        .info-icon-wrapper {
          .info-icon {
            color: $text-dark;
          }
        }

        .info-separator {
          width: 2px;
          height: 100%;
          min-height: 80px;
          background: #e0e0e0;
          margin: 0 10px;

          @media (max-width: 768px) {
            min-height: 60px;
          }
        }

        .info-content {
          .info-title {
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 0.75rem 0;
            color: $text-dark;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .info-description {
            font-size: 0.9rem;
            line-height: 1.6;
            color: $text-light;
            margin: 0;
          }

          .highlight-text {
            font-weight: 700;
            color: $primary-green;
            background: rgba(74, 95, 78, 0.1);
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
            font-size: 1.1rem;
            margin-bottom: 8px;
          }

          .info-subdescription {
            font-size: 0.85rem;
            line-height: 1.5;
            color: $text-light;
            margin: 8px 0 0 0;
            font-style: italic;
          }
        }

        &.journey-summary {
          .journey-steps {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin-top: 10px;

            .journey-step {
              display: flex;
              gap: 15px;
              align-items: flex-start;

              .step-number {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: $primary-green;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 1rem;
                flex-shrink: 0;
              }

              .step-content {
                flex: 1;

                strong {
                  display: block;
                  font-size: 0.95rem;
                  color: $text-dark;
                  margin-bottom: 4px;
                }

                p {
                  font-size: 0.85rem;
                  color: $text-light;
                  margin: 0;
                  line-height: 1.5;
                }
              }
            }
          }
        }
      }
    }

    .arrived-button-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;

      @media (max-width: 768px) {
        justify-content: stretch;

        .q-btn {
          width: 100%;
        }
      }
    }
  }
}
</style>