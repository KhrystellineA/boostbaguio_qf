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

    <!-- ROUTE MAP SECTION (Shows after Start Navigation) -->
    <section v-if="showRouteMap" class="route-map-section">
      <div class="container">
        <div class="route-header">
          <div class="route-header-content">
            <div>
              <h2 class="route-title">YOUR ROUTE</h2>
              <p class="route-subtitle">
                From <strong>{{ fromLocation?.label || fromLocation }}</strong> to
                <strong>{{ toLocation?.label || toLocation }}</strong>
              </p>
            </div>
            <q-btn
              icon="close"
              flat
              round
              color="dark"
              size="md"
              @click="closeRouteMap"
            >
              <q-tooltip>Close route map</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="route-content-grid">
          <!-- MAP COLUMN -->
          <div class="route-map-column">
            <div class="route-map-wrapper" ref="routeMapContainer"></div>

            <div class="route-info-cards">
              <div class="info-card">
                <q-icon name="straighten" size="32px" color="primary" />
                <div class="info-card-content">
                  <div class="info-card-label">Walking Distance</div>
                  <div class="info-card-value">{{ routeDistance }}</div>
                </div>
              </div>
              <div class="info-card">
                <q-icon name="schedule" size="32px" color="primary" />
                <div class="info-card-content">
                  <div class="info-card-label">Walking Time</div>
                  <div class="info-card-value">{{ routeDuration }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- JEEPNEY INFO COLUMN -->
          <div v-if="recommendedRoute" class="jeepney-info-column">
            <div class="jeepney-card">
              <div class="jeepney-card-header">
                <q-icon name="directions_bus" size="40px" :color="recommendedRoute.color" />
                <div>
                  <h3 class="jeepney-route-name">{{ recommendedRoute.name }}</h3>
                  <p class="jeepney-route-desc">{{ recommendedRoute.description }}</p>
                </div>
              </div>

              <div class="jeepney-details">
                <!-- TERMINAL INFO -->
                <div class="detail-section">
                  <div class="detail-icon-wrapper">
                    <q-icon name="location_on" size="28px" />
                  </div>
                  <div class="detail-content">
                    <h4 class="detail-title">JEEPNEY TERMINAL</h4>
                    <p class="detail-text">{{ recommendedRoute.terminalName }}</p>
                    <p class="detail-instruction">{{ recommendedRoute.terminalInstructions }}</p>
                  </div>
                </div>

                <!-- WHAT TO SAY -->
                <div class="detail-section">
                  <div class="detail-icon-wrapper">
                    <q-icon name="record_voice_over" size="28px" />
                  </div>
                  <div class="detail-content">
                    <h4 class="detail-title">WHAT TO TELL THE DRIVER</h4>
                    <p class="detail-text highlight-text">{{ recommendedRoute.rideInstructions }}</p>
                  </div>
                </div>

                <!-- FARE INFO -->
                <div class="detail-section">
                  <div class="detail-icon-wrapper">
                    <q-icon name="payments" size="28px" />
                  </div>
                  <div class="detail-content">
                    <h4 class="detail-title">JEEPNEY FARE</h4>
                    <p class="detail-text">
                      <strong>₱{{ recommendedRoute.fare.regular }}</strong> (Regular)<br>
                      <strong>₱{{ recommendedRoute.fare.discounted }}</strong> (Student/PWD/Senior)
                    </p>
                  </div>
                </div>

                <!-- RIDE TIME -->
                <div class="detail-section">
                  <div class="detail-icon-wrapper">
                    <q-icon name="access_time" size="28px" />
                  </div>
                  <div class="detail-content">
                    <h4 class="detail-title">ESTIMATED RIDE TIME</h4>
                    <p class="detail-text">{{ recommendedRoute.estimatedRideTime }}</p>
                  </div>
                </div>

                <!-- ADDITIONAL NOTE -->
                <div v-if="recommendedRoute.note" class="note-section">
                  <q-icon name="info" size="20px" color="primary" />
                  <p class="note-text">{{ recommendedRoute.note }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="options" class="options-section" ref="optionsSection">
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
          <div class="map-column">
            <div class="map-wrapper" ref="mapContainer"></div>
          </div>

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
                  <p class="info-description">{{ walkingInstructions }}</p>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon-wrapper">
                  <q-icon name="schedule" size="32px" class="info-icon" />
                </div>
                <div class="info-separator"></div>
                <div class="info-content">
                  <h3 class="info-title">ESTIMATED TIME</h3>
                  <p class="info-description">{{ estimatedTime }}</p>
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
    const optionsSection = ref(null)
    const fromLocation = ref(null)
    const toLocation = ref(null)
    const fromLocationOptions = ref([])
    const toLocationOptions = ref([])
    const mapContainer = ref(null)
    const routeMapContainer = ref(null)
    let map = null
    let routeMap = null
    let userMarker = null
    let terminalMarker = null
    let destinationMarker = null
    let routeLine = null
    const isLoadingLocation = ref(false)
    const isCalculatingRoute = ref(false)
    const selectedJeepney = ref(null)
    const userLocation = ref(null)
    const routeData = ref(null)
    const showRouteMap = ref(false)
    const navigationRouteData = ref(null)

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

    const jeepneyRoutesDatabase = {
      'MINES_VIEW_ROUTE': {
        name: 'Baguio Plaza - Mines View',
        description: 'Main tourist route covering most attractions',
        stops: ['session-road', 'teachers-camp', 'botanical-garden', 'wright-park', 'the-mansion', 'good-shepherd', 'mines-view'],
        terminalName: 'Lower Mabini Street Terminal (Mines View Terminal)',
        terminalCoords: [16.4098, 120.5979],
        terminalInstructions: 'From Session Road, walk downhill until McDonald\'s area (now City Center Hotel), turn left to Mabini Street. Terminal on the right side near corner of Session Road.',
        fare: { regular: 13, discounted: 10 },
        color: '#2196F3',
        estimatedRideTime: '10-20 minutes depending on destination'
      },
      'PMA_ROUTE': {
        name: 'Baguio Plaza - KIAS - PMA - Springhills',
        description: 'Route to Philippine Military Academy',
        stops: ['burnham-park', 'pma'],
        terminalName: 'Perfecto Street Terminal (PMA/Kias Station)',
        terminalCoords: [16.4108, 120.5912],
        terminalInstructions: 'From Session Road, walk to Harrison Road, cross via overpass. Turn left after the stairs. Terminal is at Perfecto Street, near Hotel Veniz.',
        fare: { regular: 15, discounted: 12 },
        color: '#4CAF50',
        estimatedRideTime: '20-25 minutes'
      },
      'CAMP_JOHN_HAY_ROUTE': {
        name: 'Baguio Plaza - Scout Barrio',
        description: 'Route to Camp John Hay area',
        stops: ['session-road', 'burnham-park', 'camp-john-hay'],
        terminalName: 'Igorot Park Terminal (Scout Barrio Jeepney)',
        terminalCoords: [16.4111, 120.5927],
        terminalInstructions: 'Head to Igorot Park (KM 0) near Burnham Park. Look for jeepneys with "Scout Barrio" or "Loakan" signs. Also available at Bakakeng Terminal.',
        fare: { regular: 15, discounted: 12 },
        color: '#4CAF50',
        estimatedRideTime: '15-20 minutes'
      },
      'TAM_AWAN_ROUTE': {
        name: 'Baguio Plaza - Quezon Hill - Tam-awan',
        description: 'Route to Tam-awan Village and Lourdes Grotto',
        stops: ['session-road', 'lourdes-grotto', 'tam-awan'],
        terminalName: 'Zandueta Street Terminal (Lourdes Dominical Terminal)',
        terminalCoords: [16.4119, 120.5931],
        terminalInstructions: 'From Harrison Road, climb overpass, walk along footbridge to Zandueta Street. Terminal across Chowking restaurant.',
        fare: { regular: 13, discounted: 10 },
        color: '#FF9800',
        estimatedRideTime: '15-20 minutes'
      },
      'TRANCOVILLE_ROUTE': {
        name: 'Trancoville Circular Route',
        description: 'Circular route through city center',
        stops: ['sm-baguio', 'session-road', 'burnham-park', 'baguio-cathedral', 'baguio-market', 'convention-center', 'ub', 'slu'],
        terminalName: 'Multiple Terminals (Centermall / Gov Pack / Igorot Garden)',
        terminalCoords: [16.4104, 120.5952],
        terminalInstructions: 'Available at multiple points: Centermall Terminal, Gov Pack Road Terminal, Igorot Garden, and Slaughterhouse Terminal. This route circles the city.',
        fare: { regular: 13, discounted: 10 },
        color: '#9C27B0',
        estimatedRideTime: '15-30 minutes depending on traffic'
      },
      'MARKET_ROUTE': {
        name: 'City Center - Kayang Street Route',
        description: 'Routes serving the public market area',
        stops: ['session-road', 'baguio-market', 'baguio-cathedral', 'convention-center'],
        terminalName: 'Kayang Street Terminal (Near Public Market)',
        terminalCoords: [16.4147, 120.5952],
        terminalInstructions: 'Terminal located at Kayang Street near the Baguio Public Market. Multiple city-center jeepneys pass through here.',
        fare: { regular: 13, discounted: 10 },
        color: '#F44336',
        estimatedRideTime: '5-10 minutes'
      }
    }

    const locationNames = {
      'sm-baguio': 'SM Baguio',
      'burnham-park': 'Burnham Park',
      'session-road': 'Session Road',
      'baguio-cathedral': 'Cathedral',
      'baguio-market': 'Market',
      'camp-john-hay': 'Camp John Hay',
      'mines-view': 'Mines View',
      'wright-park': 'Wright Park',
      'the-mansion': 'The Mansion',
      'teachers-camp': 'Teacher\'s Camp',
      'botanical-garden': 'Botanical Garden',
      'convention-center': 'Convention Center',
      'bgh': 'BGH',
      'ub': 'UB',
      'slu': 'SLU',
      'good-shepherd': 'Good Shepherd',
      'tam-awan': 'Tam-awan',
      'lourdes-grotto': 'Lourdes Grotto',
      'pma': 'PMA'
    }

    const recommendedRoute = ref(null)

    const findBestJeepneyRoute = (fromValue, toValue) => {
      const destinationName = locationNames[toValue] || toValue
      
      for (const [routeKey, route] of Object.entries(jeepneyRoutesDatabase)) {
        const fromIndex = route.stops.indexOf(fromValue)
        const toIndex = route.stops.indexOf(toValue)
        
        if (fromIndex !== -1 && toIndex !== -1) {
          return {
            routeKey,
            ...route,
            directRoute: true,
            transferNeeded: false,
            rideInstructions: `Tell driver: "${destinationName} po"`
          }
        }
      }

      for (const [routeKey, route] of Object.entries(jeepneyRoutesDatabase)) {
        if (route.stops.includes(toValue)) {
          return {
            routeKey,
            ...route,
            directRoute: false,
            transferNeeded: false,
            rideInstructions: `Tell driver: "${destinationName} po"`,
            note: 'Walk or take taxi to terminal, then ride this jeepney'
          }
        }
      }

      return {
        routeKey: 'MINES_VIEW_ROUTE',
        ...jeepneyRoutesDatabase.MINES_VIEW_ROUTE,
        directRoute: false,
        transferNeeded: false,
        rideInstructions: `Tell driver: "${destinationName} po"`,
        note: 'Main tourist route - ask driver for nearest stop to your destination'
      }
    }

    const jeepneyOptions = [
      {
        name: 'ROUTE 01 - CITY HALL',
        route: 'City Hall to Session Road',
        terminalCoords: [16.4145, 120.5929],
        terminalAddress: 'City Hall Terminal, Harrison Road, Baguio City',
        fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 02 - PUBLIC MARKET',
        route: 'Market to BCM',
        terminalCoords: [16.4147, 120.5952],
        terminalAddress: 'Baguio Public Market Terminal, Magsaysay Avenue',
        fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 03 - PMA',
        route: 'PMA to Session Road',
        terminalCoords: [16.402, 120.5955],
        terminalAddress: 'Philippine Military Academy Gate, Loakan Road',
        fare: '₱15.00 (Regular), ₱12.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 04 - CAMP JOHN HAY',
        route: 'Camp John Hay to Market',
        terminalCoords: [16.398, 120.583],
        terminalAddress: 'Camp John Hay Main Gate, Loakan Road',
        fare: '₱15.00 (Regular), ₱12.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 05 - SM BAGUIO',
        route: 'SM Baguio to Session Road',
        terminalCoords: [16.4136, 120.597],
        terminalAddress: 'SM City Baguio Terminal, Luneta Hill',
        fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 06 - BURNHAM PARK',
        route: 'Burnham Park to Market',
        terminalCoords: [16.4117, 120.5926],
        terminalAddress: 'Burnham Park Main Entrance, Jose Abad Santos Drive',
        fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
      },
      {
        name: "ROUTE 07 - TEACHER'S CAMP",
        route: "Teacher's Camp to Session Road",
        terminalCoords: [16.4063, 120.5977],
        terminalAddress: "Teacher's Camp Gate, Leonard Wood Road",
        fare: '₱15.00 (Regular), ₱12.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 08 - MINES VIEW',
        route: 'Mines View to Market',
        terminalCoords: [16.402, 120.609],
        terminalAddress: 'Mines View Park Terminal, Outlook Drive',
        fare: '₱15.00 (Regular), ₱12.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 09 - BAGUIO CATHEDRAL',
        route: 'Cathedral to Market',
        terminalCoords: [16.4089, 120.5937],
        terminalAddress: 'Baguio Cathedral Area, Cathedral Loop',
        fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
      },
      {
        name: 'ROUTE 10 - WRIGHT PARK',
        route: 'Wright Park to Session Road',
        terminalCoords: [16.4063, 120.5977],
        terminalAddress: 'Wright Park, Gibraltar Road',
        fare: '₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)',
      },
    ]

    const routeDistance = computed(() => {
      if (!navigationRouteData.value || !navigationRouteData.value.distance) {
        return 'Calculating...'
      }
      const distanceKm = (navigationRouteData.value.distance / 1000).toFixed(2)
      return `${distanceKm} km`
    })

    const routeDuration = computed(() => {
      if (!navigationRouteData.value || !navigationRouteData.value.duration) {
        return 'Calculating...'
      }
      const timeInMinutes = Math.round(navigationRouteData.value.duration / 60)
      return `~${timeInMinutes} minutes`
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

    const onFromInputChange = (val) => {
    }

    const onToInputChange = (val) => {
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
      } catch (error) {
        console.error('Error fetching route:', error)
        return null
      }
    }

    const initRouteMap = async () => {
      if (!routeMapContainer.value) return

      if (routeMap) {
        routeMap.remove()
        routeMap = null
      }

      const fromCoords =
        fromLocation.value?.isCurrentLocation && userLocation.value
          ? [userLocation.value.lat, userLocation.value.lng]
          : fromLocation.value?.coords

      const toCoords = toLocation.value?.coords

      if (!fromCoords || !toCoords) return

      await new Promise((resolve) => setTimeout(resolve, 100))

      routeMap = L.map(routeMapContainer.value).setView(fromCoords, 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(routeMap)

      const fromIcon = L.divIcon({
        className: 'from-marker',
        html: '<div class="from-icon">🔵</div>',
        iconSize: [30, 30],
      })
      L.marker(fromCoords, { icon: fromIcon })
        .addTo(routeMap)
        .bindPopup(`<b>FROM</b><br>${fromLocation.value.label}`)

      const toIcon = L.divIcon({
        className: 'to-marker',
        html: '<div class="to-icon">🔴</div>',
        iconSize: [30, 30],
      })
      L.marker(toCoords, { icon: toIcon })
        .addTo(routeMap)
        .bindPopup(`<b>TO</b><br>${toLocation.value.label}`)

      const routeInfo = await fetchStreetRoute(
        fromCoords[0],
        fromCoords[1],
        toCoords[0],
        toCoords[1]
      )

      if (routeInfo && routeInfo.coordinates) {
        navigationRouteData.value = routeInfo

        const routeLine = L.polyline(routeInfo.coordinates, {
          color: '#2196F3',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(routeMap)

        const bounds = L.latLngBounds(routeInfo.coordinates)
        routeMap.fitBounds(bounds, { padding: [50, 50] })
      } else {
        const straightLine = L.polyline([fromCoords, toCoords], {
          color: '#2196F3',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }).addTo(routeMap)

        const bounds = L.latLngBounds([fromCoords, toCoords])
        routeMap.fitBounds(bounds, { padding: [50, 50] })
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

    const updateMapForJeepney = () => {
      if (!map || !selectedJeepney.value) return

      if (terminalMarker) {
        map.removeLayer(terminalMarker)
      }
      if (destinationMarker) {
        map.removeLayer(destinationMarker)
      }

      const terminalIcon = L.divIcon({
        className: 'terminal-marker',
        html: '<div class="terminal-icon">🚍</div>',
        iconSize: [30, 30],
      })

      terminalMarker = L.marker(selectedJeepney.value.terminalCoords, { icon: terminalIcon })
        .addTo(map)
        .bindPopup(
          `<b>${selectedJeepney.value.name}</b><br>${selectedJeepney.value.terminalAddress}`
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
          .bindPopup(`<b>Destination</b><br>${selectedJeepney.value.destinationAddress}`)

        const bounds = L.latLngBounds([
          selectedJeepney.value.terminalCoords,
          selectedJeepney.value.destinationCoords,
        ])
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
        map.fitBounds(bounds, { padding: [50, 50] })

        $q.notify({
          message: `Route calculated: ${(fetchedRouteData.distance / 1000).toFixed(2)} km, ~${Math.round(fetchedRouteData.duration / 60)} min walk`,
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
          (error) => {
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
      
      navigationRouteData.value = null
      recommendedRoute.value = null
      
      if (routeMap) {
        routeMap.remove()
        routeMap = null
      }
      
      const fromVal = fromLocation.value?.value
      const toVal = toLocation.value?.value
      
      if (fromVal && toVal) {
        recommendedRoute.value = findBestJeepneyRoute(fromVal, toVal)
      }
      
      showRouteMap.value = true

      $q.notify({
        message: `Calculating route from ${fromLocation.value.label || 'your location'} to ${toLocation.value.label}...`,
        color: 'positive',
        icon: 'navigation',
      })

      await new Promise((resolve) => setTimeout(resolve, 300))

      await initRouteMap()

      isCalculatingRoute.value = false

      setTimeout(() => {
        const routeSection = document.querySelector('.route-map-section')
        if (routeSection) {
          routeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)

      setTimeout(() => {
        scrollToOptions()
      }, 2000)
    }

    const closeRouteMap = () => {
      showRouteMap.value = false
      navigationRouteData.value = null
      
      if (routeMap) {
        routeMap.remove()
        routeMap = null
      }

      $q.notify({
        message: 'Route map closed',
        color: 'info',
        icon: 'close',
        timeout: 1500,
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

      fromLocation.value = baguioLocations.find((loc) => loc.value === 'sm-baguio')
      toLocation.value = baguioLocations.find((loc) => loc.value === 'botanical-garden')

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
      if (routeMap) {
        routeMap.remove()
        routeMap = null
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
      routeMapContainer,
      isLoadingLocation,
      isCalculatingRoute,
      selectedJeepney,
      routeData,
      showRouteMap,
      navigationRouteData,
      recommendedRoute,
      routeDistance,
      routeDuration,
      walkingInstructions,
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
      closeRouteMap,
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

:deep(.from-marker) {
  .from-icon {
    font-size: 30px;
    text-align: center;
    line-height: 30px;
  }
}

:deep(.to-marker) {
  .to-icon {
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

.route-map-section {
  background: white;
  padding: 60px 0;
  border-bottom: 1px solid #e0e0e0;

  .route-header {
    margin-bottom: 40px;

    .route-header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .route-title {
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

    .route-subtitle {
      font-size: 1.1rem;
      color: $text-light;
      margin: 0;
    }
  }

  .route-content-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 40px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }
  }

  .route-map-column {
    .route-map-wrapper {
      width: 100%;
      height: 500px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      background: $light-gray;
      margin-bottom: 30px;

      @media (max-width: 768px) {
        height: 350px;
      }

      :deep(.leaflet-container) {
        width: 100%;
        height: 100%;
        border-radius: 12px;
      }
    }

    .route-info-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .info-card {
        background: $light-gray;
        border-radius: 12px;
        padding: 25px;
        display: flex;
        align-items: center;
        gap: 20px;

        .info-card-content {
          .info-card-label {
            font-size: 0.85rem;
            color: $text-light;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }

          .info-card-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: $text-dark;
          }
        }
      }
    }
  }

  .jeepney-info-column {
    .jeepney-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .jeepney-card-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #f0f0f0;

        .jeepney-route-name {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: $text-dark;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1.2;
        }

        .jeepney-route-desc {
          font-size: 0.9rem;
          color: $text-light;
          margin: 0;
        }
      }

      .jeepney-details {
        display: flex;
        flex-direction: column;
        gap: 25px;

        .detail-section {
          display: flex;
          gap: 15px;
          align-items: flex-start;

          .detail-icon-wrapper {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: $cream-bg;
            border-radius: 8px;
            color: $primary-green;
          }

          .detail-content {
            flex: 1;

            .detail-title {
              font-size: 0.85rem;
              font-weight: 700;
              margin: 0 0 0.5rem 0;
              color: $text-dark;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .detail-text {
              font-size: 0.95rem;
              line-height: 1.6;
              color: $text-light;
              margin: 0;

              strong {
                color: $text-dark;
                font-weight: 700;
              }
            }

            .detail-instruction {
              font-size: 0.85rem;
              line-height: 1.5;
              color: $text-light;
              margin: 0.5rem 0 0 0;
              font-style: italic;
            }

            .highlight-text {
              font-weight: 600;
              color: $primary-green;
              background: rgba(74, 95, 78, 0.1);
              padding: 8px 12px;
              border-radius: 6px;
              display: inline-block;
            }
          }
        }

        .note-section {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          background: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2196F3;

          .note-text {
            font-size: 0.9rem;
            line-height: 1.5;
            color: #1565c0;
            margin: 0;
            font-weight: 500;
          }
        }
      }
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