<template>
  <q-page class="apanam-page">
    <q-scroll-observer @scroll="onScroll" />

    <!-- HERO SECTION (Section 1) -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">APANAM - Point to Point Navigation</h1>
          <p class="hero-description">
            Plan your route between any two points in Baguio City using the jeepney system. We teach
            you how to navigate, not track vehicles!
          </p>
        </div>
      </div>
    </section>

    <!-- EXTENDED HERO SECTION (Section 2) -->
    <section class="extended-hero bg-white">
      <div class="container">
        <div class="row items-center">
          <div class="col-md-6 col-12 q-pa-xl">
            <h2 class="text-h4 text-weight-bold text-primary q-mb-lg">Point-to-Point Navigation</h2>
            <p class="text-body1 q-mb-md">
              APANAM helps you navigate Baguio City by showing you which jeepneys to take and how to
              get to their terminals. Our system focuses on teaching you the route rather than
              tracking vehicles in real-time.
            </p>
            <p class="text-body1 q-mb-lg">
              Input your starting point and destination to get step-by-step instructions on how to
              navigate Baguio's jeepney system efficiently.
            </p>
            <div class="q-gutter-sm">
              <q-chip square color="primary" text-color="white">Route Planning</q-chip>
              <q-chip square color="secondary" text-color="white">Step-by-Step Guide</q-chip>
              <q-chip square color="primary" text-color="white">Terminal Info</q-chip>
              <q-chip square color="secondary" text-color="white">Fare Estimates</q-chip>
            </div>
          </div>
          <div class="col-md-6 col-12 q-pa-xl">
            <div class="image-placeholder bg-grey-3 q-pa-xl rounded-borders">
              <q-icon name="directions_bus" size="64px" color="grey-6" />
              <div class="text-center q-mt-md">Route Planning Visualization</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN FEATURE SECTION (Section 3) -->
    <section class="navigation-section bg-grey-1">
      <div class="container">
        <div class="navigation-wrapper">
          <div class="navigation-content">
            <div class="text-overline text-primary q-mb-sm">Plan Your Route</div>

            <div class="row q-col-gutter-lg">
              <div class="col-md-6 col-12">
                <div class="info-section">
                  <h3 class="text-h5 text-weight-bold text-primary q-mb-lg">How APANAM Works</h3>
                  <p class="text-body1 q-mb-md">
                    APANAM helps you navigate Baguio City by showing you which jeepneys to take and
                    how to get to their terminals. Our system focuses on teaching you the route
                    rather than tracking vehicles in real-time.
                  </p>

                  <div class="q-mt-lg">
                    <q-list>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="location_on" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Input your starting point and destination</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="directions_bus" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>See available jeepney options</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label
                            >Get step-by-step instructions on how to get there</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </div>

              <div class="col-md-6 col-12">
                <div class="frosted-glass-card q-pa-lg">
                  <h4 class="text-primary text-weight-bold q-mb-lg">Enter Your Locations</h4>

                  <div class="q-mb-md">
                    <!-- FROM Location -->
                    <div class="q-mb-sm">
                      <div class="input-label q-mb-xs">FROM:</div>
                      <q-input
                        v-if="!fromAutoDetect"
                        :model-value="fromLocationText"
                        @update:model-value="fromLocationText = $event"
                        filled
                        placeholder="Enter starting location or use GPS"
                        bg-color="white"
                        class="custom-input"
                        @keyup.enter="searchFromLocation"
                      >
                        <template v-slot:prepend>
                          <q-btn
                            flat
                            dense
                            round
                            icon="gps_fixed"
                            color="primary"
                            @click="enableFromAutoDetect"
                            :loading="geoLoading"
                          >
                            <q-tooltip>Detect my location</q-tooltip>
                          </q-btn>
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
                          >
                            <q-tooltip>Search location</q-tooltip>
                          </q-btn>
                        </template>
                      </q-input>
                      <q-input
                        v-if="fromAutoDetect"
                        :model-value="fromLocationText"
                        @update:model-value="fromLocationText = $event"
                        filled
                        readonly
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
                            style="margin-right: -8px"
                          >
                            <q-tooltip>Enter location manually</q-tooltip>
                          </q-btn>
                        </template>
                      </q-input>
                    </div>

                    <!-- TO Location -->
                    <div
                      class="text-caption text-weight-bold text-primary q-mb-xs"
                      style="letter-spacing: 0.08em; text-transform: uppercase"
                    >
                      TO:
                    </div>
                    <q-select
                      filled
                      v-model="toLocation"
                      :options="toLocationOptions"
                      option-label="label"
                      option-value="value"
                      label="Desired End Point Location"
                      placeholder="Search and select destination..."
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="300"
                      @filter="filterToLocations"
                      @update:model-value="onToLocationChange"
                    >
                      <template v-slot:prepend>
                        <q-icon name="location_searching" color="primary" />
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            <q-item-label caption>Type to search locations...</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <q-btn
                    label="Start Navigation!"
                    color="primary"
                    class="full-width"
                    :disable="!fromLocation || !toLocation"
                    @click="findRoutes"
                    :loading="isLoadingOptions"
                  >
                    <template v-slot:loading>
                      <q-spinner-facebook />
                      Finding routes...
                    </template>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- JEEPNEY OPTIONS SECTION (Section 3) -->
    <section v-if="filteredOptions.length > 0" class="options-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h3 class="text-h4 text-weight-bold text-primary">Available Jeepney Options</h3>
          <p class="text-body1">
            Choose from the available routes that connect your start and end points
          </p>
        </div>

        <!-- Route Map Visualization -->
        <div class="route-map-container q-mb-xl" v-if="selectedOption">
          <q-card class="map-card">
            <div class="row items-center justify-between q-pa-md">
              <div class="text-h6 text-weight-bold text-primary">
                <q-icon name="map" class="q-mr-sm" />
                Route Map: {{ selectedOption.routeName }}
              </div>
              <q-badge color="primary" text-color="white">
                <q-icon name="directions_bus" class="q-mr-xs" />
                {{ selectedOption.estimatedDuration }} min
              </q-badge>
            </div>
            <div id="route-map" style="height: 400px; width: 100%; border-radius: 12px"></div>
            <q-card-section class="q-pt-md">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-12">
                  <div class="route-info">
                    <div class="info-label">Starting Point</div>
                    <div class="info-value">
                      <q-icon name="location_on" color="primary" class="q-mr-xs" />
                      {{ fromLocation?.label || customFromLocation || 'Selected location' }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6 col-12">
                  <div class="route-info">
                    <div class="info-label">Destination</div>
                    <div class="info-value">
                      <q-icon name="flag" color="secondary" class="q-mr-xs" />
                      {{ toLocation?.label || customToLocation || 'Selected location' }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div ref="optionsSection" class="options-grid">
          <q-card
            v-for="option in filteredOptions"
            :key="option.id"
            class="bento-card q-ma-sm"
            @click="selectOption(option)"
          >
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="row items-center q-mb-xs">
                    <div class="text-h6 text-primary">{{ option.routeName }}</div>
                    <q-btn
                      v-if="isFavoriteRoute(option)"
                      icon="favorite"
                      size="sm"
                      color="red"
                      flat
                      dense
                      class="q-ml-xs"
                      @click.stop="toggleFavoriteRoute(option)"
                    />
                    <q-btn
                      v-else
                      icon="favorite_border"
                      size="sm"
                      color="grey"
                      flat
                      dense
                      class="q-ml-xs"
                      @click.stop="toggleFavoriteRoute(option)"
                    />
                  </div>
                  <div class="text-subtitle2">From: {{ option.terminalStart }}</div>
                  <div class="text-subtitle2">To: {{ option.terminalEnd }}</div>
                  <div class="text-caption text-grey-7 q-mt-xs" v-if="jeepneyAvailability.status">
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />
                    Next: {{ jeepneyAvailability.nextJeepney }} mins | Frequency:
                    {{ jeepneyAvailability.frequency }}
                    <q-badge
                      :color="
                        jeepneyAvailability.status === 'high'
                          ? 'positive'
                          : jeepneyAvailability.status === 'limited'
                            ? 'warning'
                            : 'primary'
                      "
                      class="q-ml-xs"
                    >
                      {{
                        jeepneyAvailability.status === 'high'
                          ? 'High Frequency'
                          : jeepneyAvailability.status === 'limited'
                            ? 'Limited'
                            : 'Available'
                      }}
                    </q-badge>
                  </div>
                </div>
                <div class="col-auto">
                  <q-badge color="primary" class="q-mr-sm"> ₱{{ option.fare }} </q-badge>
                  <q-badge color="secondary">
                    {{ travelTimeEstimate || option.estimatedDuration }} min
                  </q-badge>
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions>
              <q-btn flat color="primary" @click="selectOption(option)">View Details</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </section>

    <!-- NAVIGATION TUTORIAL SECTION (Section 4) -->
    <section v-if="selectedOption" class="tutorial-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h3 class="text-h4 text-weight-bold text-primary">How to Get There</h3>
          <p class="text-body1">
            Follow these steps to reach your destination using the
            {{ selectedOption.routeName }} jeepney
          </p>
        </div>

        <!-- Teaching Steps Overview -->
        <div class="teaching-steps-overview q-mb-xl">
          <div class="row q-col-gutter-md justify-center">
            <div class="col-md-3 col-6" v-for="(step, idx) in teachingSteps" :key="idx">
              <div
                class="teaching-step-card"
                :class="{
                  'step-active': currentStep === idx + 1,
                  'step-done': currentStep > idx + 1,
                }"
              >
                <div class="step-icon-wrapper">
                  <span class="step-emoji">{{ step.emoji }}</span>
                </div>
                <div class="step-label">{{ step.title }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-8 col-12 q-mb-lg">
            <div class="navigation-steps q-pa-lg">
              <q-stepper
                v-model="currentStep"
                vertical
                color="primary"
                animated
                flat
                class="bg-transparent"
              >
                <q-step
                  :name="1"
                  title="Go to Starting Point"
                  icon="location_on"
                  :done="currentStep > 1"
                >
                  <div class="step-content">
                    <p class="text-body1 q-mb-md">
                      <strong>Starting Point:</strong> {{ selectedFromLocation.label }}
                    </p>

                    <div
                      v-if="getWalkingInstructions('from')"
                      class="walking-instructions q-pa-md bg-blue-1 rounded-borders"
                    >
                      <div class="row items-center q-mb-sm">
                        <q-icon
                          name="directions_walk"
                          color="primary"
                          size="24px"
                          class="q-mr-sm"
                        />
                        <span class="text-subtitle2 text-weight-bold">Walking Directions</span>
                      </div>
                      <p class="text-body2 mb-0">{{ getWalkingInstructions('from') }}</p>
                    </div>

                    <div class="q-mt-md">
                      <q-badge color="info" class="q-mr-sm">
                        <q-icon name="near_me" size="14px" class="q-mr-xs" />
                        Distance: {{ getEstimatedDistance('from') }}
                      </q-badge>
                      <q-badge color="info">
                        <q-icon name="schedule" size="14px" class="q-mr-xs" />
                        Walk Time: {{ getEstimatedWalkTime('from') }}
                      </q-badge>
                    </div>
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="nextStep" color="primary" label="Continue" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="2"
                  title="Reach Jeepney Terminal"
                  icon="directions_bus"
                  :done="currentStep > 2"
                >
                  <div class="step-content">
                    <p class="text-body1 q-mb-md">
                      <strong>Terminal:</strong> {{ selectedOption.terminalStart }}
                    </p>

                    <div class="terminal-info-card q-pa-md bg-amber-1 rounded-borders q-mb-md">
                      <div class="row items-center q-mb-sm">
                        <q-icon name="info" color="warning" size="24px" class="q-mr-sm" />
                        <span class="text-subtitle2 text-weight-bold">Terminal Landmarks</span>
                      </div>
                      <p class="text-body2 mb-0">{{ getTerminalLandmarks('start') }}</p>
                    </div>

                    <div class="q-mt-md">
                      <q-badge color="warning" class="q-mr-sm">
                        <q-icon name="access_time" size="14px" class="q-mr-xs" />
                        Jeepneys arrive every 5-10 mins
                      </q-badge>
                    </div>
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="nextStep" color="primary" label="Continue" />
                    <q-btn @click="prevStep" flat color="primary" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="3"
                  title="Take {{ selectedOption.routeName }}"
                  icon="local_shipping"
                  :done="currentStep > 3"
                >
                  <div class="step-content">
                    <p class="text-body1 q-mb-md">
                      Take the {{ selectedOption.routeName }} jeepney from
                      {{ selectedOption.terminalStart }} to {{ selectedOption.terminalEnd }}
                    </p>

                    <!-- WHAT TO TELL THE DRIVER CARD -->
                    <div
                      class="driver-phrase-card q-pa-lg bg-primary text-white rounded-borders q-mb-md shadow-2"
                    >
                      <div class="row items-center q-mb-sm">
                        <q-icon name="record_voice_over" size="28px" class="q-mr-sm" />
                        <span class="text-h6 text-weight-bold">What to Tell the Driver</span>
                      </div>
                      <p class="text-h5 text-weight-bold q-my-md">"{{ getDriverPhrase() }}"</p>
                      <p class="text-body2 opacity-80">
                        Say this clearly when boarding. Drivers will confirm if they pass by your
                        destination.
                      </p>
                    </div>

                    <div class="ride-details-grid row q-col-gutter-sm q-mt-md">
                      <div class="col-6">
                        <div class="detail-card q-pa-sm bg-white rounded-borders text-center">
                          <q-icon name="payments" color="primary" size="24px" />
                          <div class="text-caption text-grey-7">Fare</div>
                          <div class="text-h6 text-primary text-weight-bold">
                            ₱{{ selectedOption.fare }}
                          </div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="detail-card q-pa-sm bg-white rounded-borders text-center">
                          <q-icon name="schedule" color="primary" size="24px" />
                          <div class="text-caption text-grey-7">Duration</div>
                          <div class="text-h6 text-primary text-weight-bold">
                            {{ selectedOption.estimatedDuration }} min
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="q-mt-md">
                      <q-badge color="secondary" class="q-mr-sm">
                        <q-icon name="visibility" size="14px" class="q-mr-xs" />
                        Tip: Look for jeepneys with "{{ selectedOption.routeName }}" signage
                      </q-badge>
                    </div>

                    <div
                      v-if="getCulturalContext()"
                      class="cultural-context-card q-pa-md bg-green-1 rounded-borders q-mt-md"
                    >
                      <div class="row items-center q-mb-sm">
                        <q-icon name="history_edu" color="positive" size="24px" class="q-mr-sm" />
                        <span class="text-subtitle2 text-weight-bold">Cultural Context</span>
                      </div>
                      <p class="text-body2 mb-0">{{ getCulturalContext() }}</p>
                    </div>
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="nextStep" color="primary" label="Continue" />
                    <q-btn @click="prevStep" flat color="primary" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>

                <q-step :name="4" title="Arrive at Destination" icon="location_city">
                  <div class="step-content">
                    <p class="text-body1 q-mb-md">
                      <strong>Destination:</strong> {{ selectedToLocation.label }}
                    </p>

                    <div class="arrival-info-card q-pa-md bg-purple-1 rounded-borders q-mb-md">
                      <div class="row items-center q-mb-sm">
                        <q-icon name="flag" color="secondary" size="24px" class="q-mr-sm" />
                        <span class="text-subtitle2 text-weight-bold"
                          >From Terminal to Destination</span
                        >
                      </div>
                      <p class="text-body1 q-mb-sm">{{ getWalkingInstructions('to') }}</p>
                    </div>

                    <div class="q-mt-md">
                      <q-badge color="info" class="q-mr-sm">
                        <q-icon name="near_me" size="14px" class="q-mr-xs" />
                        Distance: {{ getEstimatedDistance('to') }}
                      </q-badge>
                      <q-badge color="info">
                        <q-icon name="schedule" size="14px" class="q-mr-xs" />
                        Walk Time: {{ getEstimatedWalkTime('to') }}
                      </q-badge>
                    </div>

                    <div
                      v-if="getDestinationHighlights()"
                      class="destination-highlights q-pa-md bg-white rounded-borders shadow-1 q-mt-md"
                    >
                      <div class="row items-center q-mb-sm">
                        <q-icon name="star" color="warning" size="24px" class="q-mr-sm" />
                        <span class="text-subtitle2 text-weight-bold">What to See Here</span>
                      </div>
                      <p class="text-body2 mb-0">{{ getDestinationHighlights() }}</p>
                    </div>
                  </div>
                  <q-stepper-navigation>
                    <q-btn @click="resetSelection" color="primary" label="Start New Route" />
                    <q-btn @click="prevStep" flat color="primary" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
            </div>
          </div>
          <div class="col-md-4 col-12">
            <div class="map-container">
              <div id="map" style="height: 400px; width: 100%; border-radius: 8px"></div>
            </div>

            <!-- Quick Reference Card -->
            <div class="quick-reference-card q-mt-md q-pa-md bg-white rounded-borders shadow-1">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Quick Reference</div>
              <q-list dense>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="local_atm" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Bring small bills</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="volume_up" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Speak clearly to driver</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="group" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Jeepneys may wait for passengers</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQS SECTION (Section 5) -->
    <FAQSection />

    <!-- FOOTER SECTION (Section 6) -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'
import fallbackImage from '../assets/2.png'

// NEW: Import custom composables for enhanced functionality (will be used in next increments)
import { useGeolocation } from 'src/composables/useGeolocation'
import { useGeocoding } from 'src/composables/useGeocoding'
// eslint-disable-next-line no-unused-vars
import { useJeepneyRouteMatching } from 'src/composables/useJeepneyRouteMatching'
// eslint-disable-next-line no-unused-vars
import { useWalkingDirections } from 'src/composables/useWalkingDirections'

export default defineComponent({
  name: 'ApanamPage',
  components: {
    FAQSection,
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    
    // NEW: Initialize custom composables directly (will be used in next increments)
    const { getCurrentLocation, loading: geoLoading } = useGeolocation()
    const { searchLocations } = useGeocoding()
    
    // Existing refs
    const optionsSection = ref(null)
    const fromLocationText = ref('')
    const fromLocation = ref(null)
    const toLocation = ref(null)
    const fromAutoDetect = ref(false)
    const customFromLocation = ref('')
    const customToLocation = ref('')
    const isLoadingOptions = ref(false)
    const allJeepneyOptions = ref([])
    const filteredOptions = ref([])
    const selectedOption = ref(null)
    const currentStep = ref(1)
    const heroImageUrl = ref(fallbackImage)
    const map = ref(null)
    const routeMap = ref(null)
    const isScrolled = ref(false)
    const favoriteRoutes = ref([])
    const jeepneyAvailability = ref({})
    const travelTimeEstimate = ref(null)
    const routeAnimationInterval = ref(null)
    
    // NEW: State for enhanced route finding (will be used in next increments)
    // eslint-disable-next-line no-unused-vars
    const routeOptions = ref([])
    // eslint-disable-next-line no-unused-vars
    const walkingRoute = ref(null)

    // Location options - All 33 destinations from Maykan
    const locationOptions = [
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
      { label: 'Other', value: 'other' },
    ]

    const selectedFromLocation = ref(null)
    const selectedToLocation = ref(null)
    
    // NEW: TO location options (initialized after locationOptions is defined)
    const toLocationOptions = ref([])
    
    // Initialize toLocationOptions
    toLocationOptions.value = [...locationOptions]

    // Teaching steps for visual overview
    const teachingSteps = [
      { emoji: '🚶', title: 'Walk to Terminal' },
      { emoji: '📍', title: 'Find Terminal' },
      { emoji: '💬', title: 'Tell Driver' },
      { emoji: '🎯', title: 'Arrive' },
    ]

    // Walking instructions database (landmark-based)
    const walkingInstructionsDB = {
      sm: {
        from: 'Head towards the main entrance of SM Baguio. Walk towards Session Road side.',
        to: 'From the terminal, walk straight for 2 blocks. You will see SM Baguio on your right.',
        landmarks: 'Near SM Baguio main entrance, beside BDO Bank',
      },
      burnham: {
        from: 'Walk towards Burnham Park main entrance. Look for the lagoon area.',
        to: 'From the terminal, cross the street and you will see Burnham Park lagoon. Walk straight for 100 meters.',
        landmarks: "Near the lagoon, beside the children's playground",
      },
      session: {
        from: 'Head to Session Road. Look for the uphill/downhill slope - this is the main commercial strip.',
        to: 'From the terminal, walk along Session Road. You will see many shops and restaurants.',
        landmarks: 'Main Session Road strip, near Jollibee',
      },
      ub: {
        from: 'Walk towards University of Baguio. Look for the main gate with UB signage.',
        to: 'From the terminal, enter the UB gate. The main building is straight ahead.',
        landmarks: 'UB Main Gate, near the guard house',
      },
      slu: {
        from: 'Head to Saint Louis University main campus. Look for the SLU marker.',
        to: 'From the terminal, walk towards the SLU chapel. The campus is on your left.',
        landmarks: 'SLU Chapel area, near the student center',
      },
      'good-shepherd': {
        from: 'Walk uphill towards Good Shepherd Convent. Look for the iconic architecture.',
        to: 'From the terminal, follow the path towards the convent. You can buy pastillas here.',
        landmarks: 'Good Shepherd Convent main building',
      },
      'tam-awan': {
        from: 'Head to Tam-awan Village. This is in the arts district - look for traditional Ifugao huts.',
        to: 'From the drop-off, walk through the art gallery path. The village proper is 5 minutes away.',
        landmarks: 'Tam-awan art gallery entrance',
      },
      'lourdes-grotto': {
        from: 'Walk towards the base of Lourdes Grotto. You will see the stairs or take the elevator.',
        to: 'From the terminal, climb the 252 steps or take the elevator. The shrine is at the top.',
        landmarks: 'Lourdes Grotto shrine, near the bell tower',
      },
      pma: {
        from: 'Head to PMA main gate. This is a military academy - expect security checks.',
        to: 'From the gate, follow the main road. The PMA museum is on your right.',
        landmarks: 'PMA Main Gate, near the sentinel box',
      },
    }

    // Driver phrases database (what to say in Tagalog/English)
    const driverPhrasesDB = {
      sm: 'SM Baguio po!',
      burnham: 'Burnham Park po!',
      session: 'Session Road po!',
      ub: 'University of Baguio po!',
      slu: 'SLU po! / Saint Louis University po!',
      'good-shepherd': 'Good Shepherd po!',
      'tam-awan': 'Tam-awan Village po!',
      'lourdes-grotto': 'Lourdes Grotto po!',
      pma: 'PMA po! / Philippine Military Academy po!',
    }

    // Cultural context for destinations
    const culturalContextDB = {
      sm: 'SM Baguio is the largest mall in Northern Luzon, built on what was once a military base.',
      burnham:
        'Burnham Park was designed by American architect Daniel Burnham in 1905. The lagoon is perfect for boat rides!',
      session:
        "Session Road is Baguio's main commercial hub, named after an American governor-general. It's the heart of Baguio's nightlife.",
      ub: 'University of Baguio, founded in 1948, is known for its strong criminology and medical programs.',
      slu: 'Saint Louis University is one of the oldest universities in the north, established by Belgian missionaries in 1911.',
      'good-shepherd':
        'Good Shepherd Convent is famous for its handmade pastillas (milk candies) and embroidered vestments.',
      'tam-awan':
        'Tam-awan Village showcases traditional Cordillera architecture with authentic Ifugao huts relocated from the mountains.',
      'lourdes-grotto':
        'The Our Lady of Lourdes Grotto has been a pilgrimage site since 1913. The view from the top offers a panoramic view of Baguio.',
      pma: "The Philippine Military Academy is the country's premier military school, training future AFP officers since 1936.",
    }

    // Destination highlights
    const destinationHighlightsDB = {
      sm: "Check out the SM Baguio Food Court on the 3rd floor for local delicacies. Don't miss the strawberry taho!",
      burnham:
        'Rent a boat at the lagoon, bike around the park, or have a picnic at the grassy areas. Great for photos!',
      session:
        'Try the famous Baguio coffee at Volcano Island Coffee, shop at Session Road boutiques, and experience the night market.',
      ub: 'Visit the UB Museum to see Cordillera artifacts. The campus has beautiful views of the city.',
      slu: "The SLU Museum houses indigenous artifacts. Don't miss the beautiful SLU Chapel architecture.",
      'good-shepherd':
        'Buy fresh pastillas at the convent shop. They have unique flavors like ube, strawberry, and cheese.',
      'tam-awan':
        'Explore the art galleries, try traditional Cordillera food, and enjoy the mountain view deck.',
      'lourdes-grotto':
        'Light a candle at the shrine, ring the bell tower, and enjoy the 360° view of Baguio City.',
      pma: 'Visit the PMA Museum to see military artifacts. The campus grounds are beautifully maintained with flowering trees.',
    }

    const fetchHeroImage = async () => {
      try {
        console.log('[ApanamPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'apanam')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[ApanamPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[ApanamPage] No hero image found in Firestore, using fallback')
        }
      } catch (error) {
        console.error('[ApanamPage] Error fetching hero image:', error)
      }
    }

    const fetchJeepneyOptions = async () => {
      isLoadingOptions.value = true
      try {
        console.log('[ApanamPage] Fetching jeepney options from Firebase...')
        const optionsQuery = query(collection(db, 'jeepneys'), where('isActive', '==', true))
        const querySnapshot = await getDocs(optionsQuery)
        allJeepneyOptions.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('[ApanamPage] Loaded jeepney options:', allJeepneyOptions.value.length)
      } catch (error) {
        console.error('[ApanamPage] Error fetching jeepney options:', error)
        console.log('[ApanamPage] Using fallback default options')
        allJeepneyOptions.value = getDefaultJeepneyOptions()
        $q.notify({
          message: 'Using default jeepney routes',
          color: 'info',
          icon: 'info',
          position: 'top',
        })
      } finally {
        isLoadingOptions.value = false
      }
    }

    const getDefaultJeepneyOptions = () => {
      return [
        {
          id: 'route-1',
          routeName: 'Route 1',
          terminalStart: 'SM Baguio Terminal',
          terminalEnd: 'Burnham Park Terminal',
          fare: 15,
          estimatedDuration: 25,
          isActive: true,
        },
        {
          id: 'route-2',
          routeName: 'Route 2',
          terminalStart: 'Session Road Terminal',
          terminalEnd: 'Lakeside Terminal',
          fare: 20,
          estimatedDuration: 30,
          isActive: true,
        },
        {
          id: 'route-3',
          routeName: 'Route 3',
          terminalStart: 'Market Market Terminal',
          terminalEnd: 'Mines View Terminal',
          fare: 18,
          estimatedDuration: 28,
          isActive: true,
        },
      ]
    }

    const findRoutes = () => {
      if (!fromLocation.value || !toLocation.value) {
        $q.notify({
          message: 'Please select both starting and ending locations',
          color: 'warning',
          icon: 'warning',
          position: 'top',
        })
        return
      }

      // Filter options based on selected locations
      filteredOptions.value = allJeepneyOptions.value.filter((option) => {
        const fromMatch =
          selectedFromLocation.value?.coords &&
          Math.abs(option.startCoords[0] - selectedFromLocation.value.coords[0]) < 0.01 &&
          Math.abs(option.startCoords[1] - selectedFromLocation.value.coords[1]) < 0.01

        const toMatch =
          selectedToLocation.value?.coords &&
          Math.abs(option.endCoords[0] - selectedToLocation.value.coords[0]) < 0.01 &&
          Math.abs(option.endCoords[1] - selectedToLocation.value.coords[1]) < 0.01

        return fromMatch && toMatch
      })

      if (filteredOptions.value.length === 0) {
        $q.notify({
          message: 'No routes found for the selected locations. Try different locations.',
          color: 'info',
          icon: 'info',
          position: 'top',
        })
      }

      // Scroll to options section
      if (optionsSection.value) {
        optionsSection.value.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Helper function to calculate distance between two coordinates
    const calculateDistance = (coords1, coords2) => {
      const R = 6371 // Earth's radius in km
      const dLat = deg2rad(coords2[0] - coords1[0])
      const dLon = deg2rad(coords2[1] - coords1[1])
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(coords1[0])) *
          Math.cos(deg2rad(coords2[0])) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180)
    }

    const selectOption = (option) => {
      selectedOption.value = option
      currentStep.value = 1

      // Calculate travel time estimate
      calculateTravelTime(option)

      // Simulate jeepney availability
      simulateJeepneyAvailability(option)

      // Initialize main map
      setTimeout(() => {
        if (document.getElementById('map')) {
          if (map.value) {
            map.value.remove()
          }
          map.value = L.map('map').setView([16.4122, 120.5948], 13)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(map.value)

          // Add markers for start and end locations
          if (selectedFromLocation.value?.coords) {
            L.marker(selectedFromLocation.value.coords)
              .addTo(map.value)
              .bindPopup(selectedFromLocation.value.label)
          }

          if (selectedToLocation.value?.coords) {
            L.marker(selectedToLocation.value.coords)
              .addTo(map.value)
              .bindPopup(selectedToLocation.value.label)
          }
        }
      }, 100)

      // Initialize route map with animation
      setTimeout(() => {
        if (document.getElementById('route-map')) {
          if (routeMap.value) {
            routeMap.value.remove()
          }

          // Get coordinates for terminal start and end
          const terminalStart = option.terminalStart
          const terminalEnd = option.terminalEnd

          // Default to Baguio center
          routeMap.value = L.map('route-map').setView([16.4122, 120.5948], 14)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(routeMap.value)

          // Add custom icons
          const startIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#2196F3;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })

          const endIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#FF5722;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })

          // Get approximate coordinates for terminals (centered on Baguio for now)
          const startCoords = option.terminalStartCoords || [16.4122, 120.5948]
          const endCoords = option.terminalEndCoords || [16.42, 120.6]

          // Calculate distance
          const distance = calculateDistance(startCoords, endCoords)

          // Add markers
          L.marker(startCoords, { icon: startIcon })
            .addTo(routeMap.value)
            .bindPopup(
              `<strong>Start:</strong> ${terminalStart}<br>Distance: ${distance.toFixed(2)} km`
            )
            .openPopup()

          L.marker(endCoords, { icon: endIcon })
            .addTo(routeMap.value)
            .bindPopup(`<strong>Destination:</strong> ${terminalEnd}`)

          // Draw animated route line
          const routeLine = L.polyline([startCoords, endCoords], {
            color: '#2196F3',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round',
          }).addTo(routeMap.value)

          // Add animated jeepney marker
          const jeepneyIcon = L.divIcon({
            className: 'jeepney-marker',
            html: "<div style='background-color:#4EA96D;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;'>🚌</div>",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })

          const jeepneyMarker = L.marker(startCoords, { icon: jeepneyIcon }).addTo(routeMap.value)

          // Animate jeepney along route
          let progress = 0
          routeAnimationInterval.value = setInterval(() => {
            progress += 0.02
            if (progress > 1) progress = 0

            const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * progress
            const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * progress
            jeepneyMarker.setLatLng([lat, lng])
          }, 100)

          // Fit map to show both markers
          routeMap.value.fitBounds(routeLine.getBounds(), { padding: [50, 50] })
        }
      }, 200)
    }

    // Calculate travel time estimate
    const calculateTravelTime = (option) => {
      const baseTime = option.estimatedDuration || 15
      const trafficMultiplier = 1 + Math.random() * 0.5 // Add 0-50% variance
      travelTimeEstimate.value = Math.round(baseTime * trafficMultiplier)
    }

    // Simulate jeepney availability
    const simulateJeepneyAvailability = () => {
      const hour = new Date().getHours()
      const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
      const isLateNight = hour >= 22 || hour <= 5

      let availability = 'available'
      let frequency = '5-10 mins'

      if (isLateNight) {
        availability = 'limited'
        frequency = '20-30 mins'
      } else if (isPeakHour) {
        availability = 'high'
        frequency = '2-5 mins'
      }

      jeepneyAvailability.value = {
        status: availability,
        frequency: frequency,
        nextJeepney: Math.floor(Math.random() * 10) + 1,
      }
    }

    // Toggle favorite route
    const toggleFavoriteRoute = (option) => {
      const index = favoriteRoutes.value.findIndex((r) => r.id === option.id)
      if (index > -1) {
        favoriteRoutes.value.splice(index, 1)
        $q.notify({
          type: 'info',
          message: 'Route removed from favorites',
          position: 'top',
        })
      } else {
        favoriteRoutes.value.push({
          id: option.id,
          routeName: option.routeName,
          terminalStart: option.terminalStart,
          terminalEnd: option.terminalEnd,
          fare: option.fare,
          estimatedDuration: option.estimatedDuration,
          savedAt: new Date(),
        })
        $q.notify({
          type: 'positive',
          message: 'Route added to favorites!',
          position: 'top',
        })
      }
      // Save to localStorage
      localStorage.setItem('apanam-favorite-routes', JSON.stringify(favoriteRoutes.value))
    }

    // Check if route is favorite
    const isFavoriteRoute = (option) => {
      return favoriteRoutes.value.some((r) => r.id === option.id)
    }

    // Load favorite routes from localStorage
    const loadFavoriteRoutes = () => {
      const saved = localStorage.getItem('apanam-favorite-routes')
      if (saved) {
        try {
          favoriteRoutes.value = JSON.parse(saved)
        } catch (e) {
          console.error('[APANAM] Error loading favorite routes:', e)
        }
      }
    }

    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const resetSelection = () => {
      selectedOption.value = null
      currentStep.value = 1
      filteredOptions.value = []
      fromLocation.value = null
      toLocation.value = null
      customFromLocation.value = ''
      customToLocation.value = ''
      selectedFromLocation.value = null
      selectedToLocation.value = null

      if (map.value) {
        map.value.remove()
        map.value = null
      }
    }

    const enableFromAutoDetect = async () => {
      console.log('[ApanamPage] GPS button clicked')
      
      const loadingNotify = $q.notify({
        message: 'Detecting your location...',
        icon: 'gps_not_fixed',
        color: 'primary',
        timeout: 0,
        spinner: true,
      })

      try {
        console.log('[ApanamPage] Calling getCurrentLocation()...')
        // Use our geolocation composable
        const coords = await getCurrentLocation()
        console.log('[ApanamPage] Location detected:', coords)

        // Set the text FIRST before toggling visibility
        fromLocationText.value = '📍 Your Current Location'
        fromLocation.value = {
          label: '📍 Your Current Location',
          value: 'current-location',
          isCurrentLocation: true,
          coords: [coords.lat, coords.lng],
          accuracy: coords.accuracy,
        }
        
        // Force Vue reactivity
        await nextTick()
        console.log('[ApanamPage] fromLocationText:', fromLocationText.value)
        console.log('[ApanamPage] fromLocation:', fromLocation.value)
        
        // NOW toggle to show the GPS field
        fromAutoDetect.value = true
        await nextTick()
        console.log('[ApanamPage] fromAutoDetect:', fromAutoDetect.value)

        loadingNotify()

        $q.notify({
          message: 'Location detected successfully!',
          icon: 'gps_fixed',
          color: 'positive',
          timeout: 2000,
          position: 'top',
        })
      } catch (error) {
        console.error('[ApanamPage] GPS Error:', error)
        loadingNotify()
        fromAutoDetect.value = false
        fromLocation.value = null
        fromLocationText.value = ''

        $q.notify({
          message: error.message || 'Unable to detect your location',
          icon: 'warning',
          color: 'negative',
          timeout: 3000,
          position: 'top',
        })
      }
    }

    const disableFromAutoDetect = () => {
      fromAutoDetect.value = false
      fromLocation.value = null
      fromLocationText.value = ''
    }

    const searchFromLocation = async () => {
      console.log('[ApanamPage] Search button clicked, input:', fromLocationText.value)
      if (!fromLocationText.value.trim()) {
        $q.notify({
          message: 'Please enter a location',
          icon: 'warning',
          color: 'warning',
          timeout: 2000,
          position: 'top',
        })
        return
      }

      const searchQuery = fromLocationText.value.trim()
      
      // Show loading
      const loadingNotify = $q.notify({
        message: `Searching for "${searchQuery}"...`,
        icon: 'search',
        color: 'primary',
        timeout: 0,
        spinner: true,
      })

      try {
        console.log('[ApanamPage] Calling searchLocations()...')
        // Search using geocoding API
        const results = await searchLocations(searchQuery, true)
        console.log('[ApanamPage] Search results:', results)
        
        loadingNotify()
        
        if (results && results.length > 0) {
          // Use the first result (most relevant)
          const bestMatch = results[0]
          console.log('[ApanamPage] Best match:', bestMatch)
          
          fromLocation.value = {
            label: bestMatch.label,
            value: 'geocoded-location',
            isCurrentLocation: false,
            isGeocoded: true,
            coords: [bestMatch.lat, bestMatch.lng],
            fullAddress: bestMatch.fullAddress,
          }
          
          fromLocationText.value = bestMatch.label
          
          // Force Vue reactivity
          await nextTick()
          console.log('[ApanamPage] Search complete, fromLocationText:', fromLocationText.value)
          
          $q.notify({
            message: `Location found: ${bestMatch.label}`,
            icon: 'check_circle',
            color: 'positive',
            timeout: 2000,
            position: 'top',
          })
        } else {
          // Fallback: store as text location
          fromLocation.value = {
            label: searchQuery,
            value: 'custom-location',
            isCurrentLocation: false,
            coords: null,
          }
          
          $q.notify({
            message: 'Location not found in Baguio. Using text search.',
            icon: 'info',
            color: 'info',
            timeout: 3000,
            position: 'top',
          })
        }
      } catch (error) {
        console.error('[ApanamPage] Search error:', error)
        loadingNotify()
        
        // Fallback on error
        fromLocation.value = {
          label: searchQuery,
          value: 'custom-location',
          isCurrentLocation: false,
          coords: null,
        }
        
        $q.notify({
          message: 'Search failed. Using text location.',
          icon: 'warning',
          color: 'warning',
          timeout: 3000,
          position: 'top',
        })
      }
    }

    const filterToLocations = async (val, update) => {
      update(async () => {
        const needle = val?.toLowerCase() || ''
        
        // Start with local tourist spots
        let filtered = locationOptions.filter((opt) => 
          opt.value !== 'other' && opt.label.toLowerCase().includes(needle)
        )
        
        // If search query is long enough, also search geocoding API
        if (needle.length >= 3) {
          try {
            const geocodeResults = await searchLocations(val, true)
            
            // Add geocoded results (avoid duplicates)
            geocodeResults.forEach(geo => {
              const isDuplicate = filtered.some(f => f.label === geo.label)
              if (!isDuplicate) {
                filtered.push({
                  label: geo.label,
                  value: `geocoded-${geo.osmId || Date.now()}`,
                  coords: [geo.lat, geo.lng],
                  isGeocoded: true,
                  fullAddress: geo.fullAddress,
                })
              }
            })
          } catch (error) {
            console.error('[ApanamPage] Geocoding search failed:', error)
            // Continue with local results only
          }
        }
        
        // Sort by relevance (local spots first, then geocoded)
        filtered.sort((a, b) => {
          if (a.isGeocoded && !b.isGeocoded) return 1
          if (!a.isGeocoded && b.isGeocoded) return -1
          return 0
        })
        
        // Limit results
        filtered = filtered.slice(0, 10)
        
        // Update TO location options
        toLocationOptions.value = filtered.length > 0 ? filtered : locationOptions.filter(opt => opt.value !== 'other')
      })
    }

    const onFromLocationChange = (val) => {
      if (val) {
        selectedFromLocation.value = val
      }
    }

    const onToLocationChange = (val) => {
      if (val) {
        selectedToLocation.value = val
      }
    }

    // Watch for changes in custom location inputs
    watch(customFromLocation, (newVal) => {
      if (fromLocation.value && fromLocation.value.value === 'other') {
        selectedFromLocation.value = { label: newVal, value: 'other', coords: null }
      }
    })

    watch(customToLocation, (newVal) => {
      if (toLocation.value && toLocation.value.value === 'other') {
        selectedToLocation.value = { label: newVal, value: 'other', coords: null }
      }
    })

    const onScroll = (info) => {
      isScrolled.value = info.position.top > 50
    }

    // Helper function to get walking instructions
    const getWalkingInstructions = (direction) => {
      const locationKey =
        direction === 'from' ? selectedFromLocation.value?.value : selectedToLocation.value?.value
      if (!locationKey || !walkingInstructionsDB[locationKey]) {
        return direction === 'from'
          ? 'Walk towards the nearest jeepney terminal. Look for signage or ask locals for directions.'
          : 'From the terminal, walk towards your destination. Use the map for guidance.'
      }
      return walkingInstructionsDB[locationKey][direction]
    }

    // Helper function to get terminal landmarks
    const getTerminalLandmarks = (position) => {
      const locationKey =
        position === 'start' ? selectedFromLocation.value?.value : selectedToLocation.value?.value
      if (!locationKey || !walkingInstructionsDB[locationKey]) {
        return 'Look for jeepney signage and other passengers. Terminals are usually near main roads.'
      }
      return walkingInstructionsDB[locationKey].landmarks
    }

    // Helper function to get driver phrase
    const getDriverPhrase = () => {
      const destKey = selectedToLocation.value?.value
      if (!destKey || !driverPhrasesDB[destKey]) {
        return selectedToLocation.value?.label + ' po!'
      }
      return driverPhrasesDB[destKey]
    }

    // Helper function to get cultural context
    const getCulturalContext = () => {
      const destKey = selectedToLocation.value?.value
      if (!destKey || !culturalContextDB[destKey]) {
        return null
      }
      return culturalContextDB[destKey]
    }

    // Helper function to get destination highlights
    const getDestinationHighlights = () => {
      const destKey = selectedToLocation.value?.value
      if (!destKey || !destinationHighlightsDB[destKey]) {
        return null
      }
      return destinationHighlightsDB[destKey]
    }

    // Helper function to get estimated distance
    const getEstimatedDistance = (direction) => {
      // Simple estimation based on location value
      const locationKey =
        direction === 'from' ? selectedFromLocation.value?.value : selectedToLocation.value?.value
      if (!locationKey) return 'N/A'

      // Mock distances - in production, calculate from actual coordinates
      const distances = {
        sm: '200m',
        burnham: '350m',
        session: '150m',
        ub: '500m',
        slu: '400m',
        'good-shepherd': '600m',
        'tam-awan': '800m',
        'lourdes-grotto': '1.2km',
        pma: '1.5km',
      }
      return distances[locationKey] || '500m'
    }

    // Helper function to get estimated walk time
    const getEstimatedWalkTime = (direction) => {
      const distance = getEstimatedDistance(direction)
      if (distance === 'N/A') return 'N/A'

      // Rough estimate: 5 min per 400m
      const distanceNum = parseFloat(distance)
      if (distance.includes('km')) {
        return Math.round(distanceNum * 12) + ' min'
      }
      return Math.round((distanceNum / 400) * 5) + ' min'
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchJeepneyOptions()
      loadFavoriteRoutes()

      // Handle query parameters from IndexPage (hero section inputs)
      if (route.query.toName) {
        // Set destination from query
        const toCoords = [parseFloat(route.query.toLat), parseFloat(route.query.toLng)]
        toLocation.value = {
          label: route.query.toName,
          value: 'custom-from-query',
          coords: toCoords,
        }

        // Set starting point if provided
        if (route.query.fromName) {
          const fromCoords = [parseFloat(route.query.fromLat), parseFloat(route.query.fromLng)]
          fromLocation.value = {
            label: route.query.fromName,
            value: 'custom-from-query',
            coords: fromCoords,
          }
        } else if (route.query.fromLat && route.query.fromLng) {
          // Using current location
          fromLocation.value = {
            label: '📍 Current Location',
            value: 'current-location',
            coords: [parseFloat(route.query.fromLat), parseFloat(route.query.fromLng)],
          }
        }

        // Scroll to navigation section
        setTimeout(() => {
          const navSection = document.querySelector('.navigation-section')
          if (navSection) {
            navSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 500)
      }

      // Initialize map if there's a selected option
      if (selectedOption.value && document.getElementById('map')) {
        map.value = L.map('map').setView([16.4122, 120.5948], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.value)
      }
    })

    onUnmounted(() => {
      if (map.value) {
        map.value.remove()
      }
    })

    return {
      fromLocationText,
      fromLocation,
      toLocation,
      fromAutoDetect,
      geoLoading,
      customFromLocation,
      customToLocation,
      isLoadingOptions,
      allJeepneyOptions,
      filteredOptions,
      selectedOption,
      currentStep,
      heroImageUrl,
      locationOptions,
      toLocationOptions,
      optionsSection,
      selectedFromLocation,
      selectedToLocation,
      teachingSteps,
      favoriteRoutes,
      jeepneyAvailability,
      travelTimeEstimate,
      findRoutes,
      selectOption,
      toggleFavoriteRoute,
      isFavoriteRoute,
      nextStep,
      prevStep,
      resetSelection,
      onFromLocationChange,
      onToLocationChange,
      enableFromAutoDetect,
      disableFromAutoDetect,
      searchFromLocation,
      filterToLocations,
      isScrolled,
      onScroll,
      getWalkingInstructions,
      getTerminalLandmarks,
      getDriverPhrase,
      getCulturalContext,
      getDestinationHighlights,
      getEstimatedDistance,
      getEstimatedWalkTime,
    }
  },
})
</script>

<style lang="scss" scoped>
// Color Palette
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$soft-green: #e8f5e9;
$mint-cream: #f1f8f4;
$blush-pink: #fce4ec;
$white: #ffffff;
$brown: #6b5344;

// Glassmorphism
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: rgba(255, 255, 255, 0.3);
$glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);

// Bento
$bento-radius: 20px;
$bento-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
$bento-shadow-hover: 0 12px 48px rgba(0, 0, 0, 0.1);

.apanam-page {
  background: linear-gradient(180deg, $mint-cream 0%, $white 100%) !important;
  min-height: 100vh;
}

/* Navbar Animation */
.transition-all {
  transition: all 0.3s ease;
}

.floating-nav {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  color: #212121 !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  width: calc(100% - 32px);
  left: 16px;
  right: 16px;
  border-radius: 16px;
  margin-top: 16px;
}

.hero-section {
  height: 40vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

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
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hero-description {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.95;
}

.extended-hero {
  padding: 4rem 0;
  background: $glass-bg;
  backdrop-filter: blur(20px);
}

.navigation-section {
  padding: 4rem 0;
  background: linear-gradient(180deg, $white 0%, $mint-cream 100%);
}

.image-placeholder {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  border-radius: $bento-radius;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  border: 2px dashed #ddd;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.frosted-glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 520px;
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
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
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
    background: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%);
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
  background: linear-gradient(180deg, $primary-green 0%, $dark-green 100%) !important;
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
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
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

.options-section {
  background: linear-gradient(180deg, $mint-cream 0%, $white 100%);
}

/* Route Map Container */
.route-map-container {
  max-width: 900px;
  margin: 0 auto;
}

.map-card {
  border-radius: $bento-radius;
  overflow: hidden;
  box-shadow: $bento-shadow;
  background: $white;
  border: 1px solid rgba($primary-green, 0.08);
}

#route-map {
  border-radius: 12px;
  z-index: 1;
}

/* Animated Jeepney Marker */
.jeepney-marker {
  transition: all 0.1s ease;
}

.jeepney-marker div {
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba($primary-green, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba($primary-green, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba($primary-green, 0);
  }
}

.route-info {
  background: $soft-green;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid $primary-green;
}

.route-info .info-label {
  font-size: 0.75rem;
  color: $dark-green;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.route-info .info-value {
  font-size: 0.95rem;
  color: $dark-green;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* Bento Card Style - Enhanced */
.bento-card {
  background: $white;
  border-radius: $bento-radius;
  border: 1px solid rgba($primary-green, 0.08);
  box-shadow: $bento-shadow;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: $bento-shadow-hover;
    border-color: rgba($primary-green, 0.15);
  }
}

.navigation-steps {
  background: $white;
  border-radius: $bento-radius;
  box-shadow: $bento-shadow;
  border: 1px solid rgba($primary-green, 0.08);
}

.tutorial-section {
  background: linear-gradient(180deg, $mint-cream 0%, $white 100%);
}

.bg-primary {
  background-color: $primary-green !important;
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
  animation: fadeIn 0.5s ease-in;
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
  padding: 1rem;
  border-radius: $bento-radius;
  box-shadow: $bento-shadow;
  border: 1px solid rgba($primary-green, 0.08);
}

/* Teaching Steps Overview Styles */
.teaching-steps-overview {
  padding: 1rem 0;
}

.teaching-step-card {
  background: $white;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: $bento-shadow;
  border: 1px solid rgba($primary-green, 0.08);
}

.teaching-step-card:hover {
  transform: translateY(-3px);
  box-shadow: $bento-shadow-hover;
}

.teaching-step-card.step-active {
  border-color: $primary-green;
  background: linear-gradient(135deg, $soft-green 0%, rgba($light-green, 0.1) 100%);
  box-shadow: 0 4px 16px rgba($primary-green, 0.2);
}

.teaching-step-card.step-done {
  background: #f5f5f5;
  opacity: 0.7;
}

.step-icon-wrapper {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, $soft-green 0%, $mint-cream 100%);
  transition: all 0.3s ease;
}

.step-active .step-icon-wrapper {
  background: linear-gradient(135deg, $primary-green 0%, $light-green 100%);
}

.step-done .step-icon-wrapper {
  background: #9e9e9e;
}

.step-emoji {
  font-size: 32px;
  line-height: 1;
}

.step-label {
  font-size: 13px;
  font-weight: 600;
  color: $dark-green;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Step Content Styles */
.step-content {
  padding: 0.5rem 0;
}

.walking-instructions,
.terminal-info-card,
.arrival-info-card {
  border-left: 4px solid;
  border-radius: 12px;
}

.walking-instructions {
  border-left-color: #2196f3;
  background: #e3f2fd;
}

.terminal-info-card {
  border-left-color: #ffc107;
  background: #fff8e1;
}

.arrival-info-card {
  border-left-color: #9c27b0;
  background: #f3e5f5;
}

.mb-0 {
  margin-bottom: 0 !important;
}

/* Driver Phrase Card - Enhanced */
.driver-phrase-card {
  background: linear-gradient(135deg, $primary-green 0%, $light-green 100%);
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba($primary-green, 0.3);
}

.driver-phrase-card::before {
  content: '"';
  position: absolute;
  top: -20px;
  right: 20px;
  font-size: 120px;
  opacity: 0.1;
  color: white;
  font-family: Georgia, serif;
}

/* Detail Cards */
.detail-card {
  transition: all 0.2s ease;
  background: $white;
  border-radius: 12px;
  border: 1px solid rgba($primary-green, 0.08);
}

.detail-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Cultural Context Card */
.cultural-context-card {
  border-left: 4px solid $primary-green;
  background: $soft-green;
  border-radius: 12px;
}

/* Destination Highlights */
.destination-highlights {
  border-left: 4px solid #ff9800;
  background: #fff3e0;
  border-radius: 12px;
}

/* Quick Reference Card */
.quick-reference-card {
  font-size: 13px;
  background: $white;
  border-radius: $bento-radius;
  box-shadow: $bento-shadow;
  border: 1px solid rgba($primary-green, 0.08);
}

.quick-reference-card .q-item {
  padding: 4px 0;
}

/* Opacity utility */
.opacity-80 {
  opacity: 0.8;
}

/* Rounded borders */
.rounded-borders {
  border-radius: 12px !important;
}

/* Background colors */
.bg-blue-1 {
  background-color: #e3f2fd !important;
}

.bg-amber-1 {
  background-color: #fff8e1 !important;
}

.bg-green-1 {
  background-color: $soft-green !important;
}

.bg-purple-1 {
  background-color: #f3e5f5 !important;
}

/* Shadow utilities */
.shadow-1 {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}

.shadow-2 {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
