<template>
  <q-page class="apanam-page">
    <q-scroll-observer @scroll="onScroll" />

    <!-- HERO SECTION -->
    <section class="apanam-hero">
      <div class="hero-card" :style="{ backgroundImage: `url(${heroImageUrl})` }">
        <div class="hero-overlay-grad" />
        <div class="hero-inner animate-fade-in">
          <span class="hero-tag">
            <q-icon name="navigation" size="14px" />
            Point-to-Point Navigation
          </span>
          <h1 class="hero-title">
            <em>Apanam</em>
          </h1>
          <p class="hero-description">
            Learn how to navigate Baguio City's jeepney system. Input your starting point and
            destination to get step-by-step instructions, terminal info, and fare estimates.
          </p>
          <div class="hero-chips">
            <span class="hero-chip">Route Planning</span>
            <span class="hero-chip">Step-by-Step Guide</span>
            <span class="hero-chip">Terminal Info</span>
            <span class="hero-chip">Fare Estimates</span>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN FEATURE SECTION (Section 3) -->
    <section class="navigation-section">
      <div class="container">
        <div class="section-eyebrow">
          <p class="eyebrow-text">PLAN YOUR ROUTE</p>
          <h2 class="eyebrow-title">Get from <em>here</em> to <em>there</em></h2>
        </div>

        <div class="navigation-wrapper">
          <div class="navigation-content">
            <div class="row q-col-gutter-lg">
              <div class="col-md-6 col-12">
                <div class="info-section">
                  <h3 class="how-it-works-title">How it works</h3>

                  <q-list dense class="how-it-works-list">
                    <q-item>
                      <q-item-section avatar>
                        <q-avatar size="36px" color="primary" text-color="white" font-size="14px"
                          >1</q-avatar
                        >
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium"
                          >Input your starting point and destination</q-item-label
                        >
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-avatar size="36px" color="primary" text-color="white" font-size="14px"
                          >2</q-avatar
                        >
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium"
                          >See available jeepney options (direct & transfers)</q-item-label
                        >
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section avatar>
                        <q-avatar size="36px" color="primary" text-color="white" font-size="14px"
                          >3</q-avatar
                        >
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium"
                          >Get step-by-step instructions, fare info & map</q-item-label
                        >
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <div class="col-md-6 col-12">
                <div class="frosted-glass-card q-pa-lg">
                  <h4 class="form-card-title">Enter your locations</h4>

                  <div class="q-mb-md">
                    <!-- FROM Location -->
                    <div class="q-mb-sm">
                      <div class="input-label q-mb-xs">FROM:</div>
                      <q-input
                        :model-value="fromLocationText"
                        @update:model-value="fromLocationText = $event"
                        filled
                        placeholder="Enter starting location or use GPS"
                        bg-color="white"
                        class="custom-input"
                        @keyup.enter="searchFromLocation"
                        @focus="onFromInputFocus"
                      >
                        <template v-slot:prepend>
                          <q-btn
                            flat
                            dense
                            round
                            :icon="fromAutoDetect ? 'gps_fixed' : 'gps_not_fixed'"
                            :color="fromAutoDetect ? 'positive' : 'primary'"
                            @click="enableFromAutoDetect"
                            :loading="geoLoading"
                          >
                            <q-tooltip>Detect my location</q-tooltip>
                          </q-btn>
                        </template>
                        <template v-slot:append>
                          <q-btn
                            v-if="fromLocationText"
                            flat
                            dense
                            round
                            icon="clear"
                            color="grey"
                            size="sm"
                            @click="clearFromLocation"
                            style="margin-right: -4px"
                          >
                            <q-tooltip>Clear</q-tooltip>
                          </q-btn>
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

    <!-- LOADING STATE SECTION -->
    <section v-if="isLoadingOptions" class="loading-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <q-spinner-facebook color="primary" size="3em" />
          <h3 class="text-h5 text-weight-bold text-primary q-mt-md">Finding Your Route...</h3>
          <p class="text-body1 text-grey-7">Searching for the best jeepney options for your trip</p>
        </div>
        <div class="row justify-center q-gutter-md">
          <div class="col-auto">
            <q-chip outline color="primary">
              <q-spinner-dots size="16px" />
              <span class="q-ml-xs">Loading jeepney routes</span>
            </q-chip>
          </div>
          <div class="col-auto">
            <q-chip outline color="secondary">
              <q-spinner-dots size="16px" />
              <span class="q-ml-xs">Calculating distances</span>
            </q-chip>
          </div>
          <div class="col-auto">
            <q-chip outline color="accent">
              <q-spinner-dots size="16px" />
              <span class="q-ml-xs">Finding transfers</span>
            </q-chip>
          </div>
        </div>
      </div>
    </section>

    <!-- JEEPNEY OPTIONS SECTION (Section 3) -->
    <section v-if="routeOptions.length > 0" class="options-section q-py-xl">
      <div class="container">
        <div class="section-eyebrow text-center">
          <p class="eyebrow-text">AVAILABLE OPTIONS</p>
          <h3 class="eyebrow-title">Choose your <em>jeepney</em></h3>
          <p class="eyebrow-description">
            Pick from the available routes that connect your start and end points.
          </p>
        </div>

        <!-- Route Summary Cards -->
        <div class="row q-col-gutter-md q-mb-xl">
          <!-- Single Rides Summary -->
          <div class="col-12 col-md-6">
            <q-card class="route-summary-card bg-positive text-white">
              <q-card-section class="text-center q-py-md">
                <div class="text-h3 q-mb-xs">🚌</div>
                <div class="text-h6 text-weight-bold">Direct Routes</div>
                <div class="text-subtitle1 q-mt-xs">
                  {{ routeOptions.filter((o) => o.priority === 'single').length }} option(s)
                  available
                </div>
                <q-separator class="q-my-sm bg-white" />
                <div class="text-caption">
                  <q-icon name="check_circle" size="xs" class="q-mr-xs" />
                  No transfers needed
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Double Rides Summary -->
          <div class="col-12 col-md-6">
            <q-card class="route-summary-card bg-warning text-white">
              <q-card-section class="text-center q-py-md">
                <div class="text-h3 q-mb-xs">🔄</div>
                <div class="text-h6 text-weight-bold">Transfer Routes</div>
                <div class="text-subtitle1 q-mt-xs">
                  {{ routeOptions.filter((o) => o.priority === 'double').length }} option(s)
                  available
                </div>
                <q-separator class="q-my-sm bg-white" />
                <div class="text-caption">
                  <q-icon name="walk" size="xs" class="q-mr-xs" />
                  Short walk to transfer
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Route Map Visualization -->
        <div class="route-map-container q-mb-xl" v-if="selectedOption">
          <q-card class="map-card">
            <div class="row items-center justify-between q-pa-md">
              <div class="text-h6 text-weight-bold text-primary">
                <q-icon name="map" class="q-mr-sm" />
                Route Visualization
              </div>
              <div class="row q-gutter-xs items-center">
                <q-badge color="orange-8" text-color="white" class="q-pa-xs">
                  <span
                    style="
                      display: inline-block;
                      width: 18px;
                      border-top: 2px dashed white;
                      margin-right: 6px;
                      vertical-align: middle;
                    "
                  ></span>
                  Walking
                </q-badge>
                <q-badge color="indigo-8" text-color="white" class="q-pa-xs">
                  <span
                    style="
                      display: inline-block;
                      width: 18px;
                      border-top: 3px solid white;
                      margin-right: 6px;
                      vertical-align: middle;
                    "
                  ></span>
                  Jeepney Route
                </q-badge>
              </div>
            </div>

            <!-- Single Consolidated Map -->
            <div id="route-map" style="height: 450px; width: 100%"></div>

            <!-- Compact route summary bar -->
            <q-card-section class="q-py-sm">
              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <div class="row items-center no-wrap">
                    <q-icon name="location_on" color="positive" size="20px" class="q-mr-xs" />
                    <div class="text-caption ellipsis">{{ fromLocation?.label || 'Start' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="row items-center no-wrap">
                    <q-icon name="flag" color="negative" size="20px" class="q-mr-xs" />
                    <div class="text-caption ellipsis">
                      {{
                        selectedOption.priority === 'single'
                          ? selectedOption.jeepney?.terminalLocation
                          : selectedOption.firstJeepney?.terminalLocation
                      }}
                    </div>
                  </div>
                </div>
              </div>
              <!-- Walking summary if available -->
              <div
                v-if="walkingRoute && walkingRoute.distance"
                class="row items-center q-mt-xs q-gutter-sm"
              >
                <q-badge outline color="orange-8" size="sm">
                  <q-icon name="directions_walk" size="12px" class="q-mr-xs" />
                  {{ formatDistance(walkingRoute.distance) }}
                </q-badge>
                <q-badge outline color="grey-7" size="sm">
                  <q-icon name="schedule" size="12px" class="q-mr-xs" />
                  {{ formatDuration(walkingRoute.duration) }} walk
                </q-badge>
              </div>
            </q-card-section>

            <!-- How to Get There — step-by-step -->
            <q-separator />
            <q-card-section class="route-directions">
              <div class="text-subtitle1 text-weight-bold text-primary q-mb-sm">
                <q-icon name="directions" class="q-mr-xs" />
                How to Get There
              </div>

              <!-- Single ride steps -->
              <template v-if="selectedOption.priority === 'single'">
                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="positive"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >1</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Walk to
                      {{
                        selectedOption.boardingLabel || selectedOption.jeepney?.terminalLocation
                      }}</span
                    >
                    <span v-if="walkingRoute?.distance" class="text-caption text-grey-7 q-ml-xs">
                      ({{ formatDistance(walkingRoute.distance) }}, ~{{
                        formatDuration(walkingRoute.duration)
                      }})
                    </span>
                  </div>
                </div>

                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="blue-8"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >2</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Ride the
                      <strong>{{ selectedOption.jeepney?.jeepName }}</strong> jeepney</span
                    >
                    <div class="text-caption text-grey-7">
                      Tell the driver:
                      <em>"Para po sa {{ selectedOption.dropoff?.name || toLocation?.label }}!"</em>
                      &nbsp;&bull;&nbsp; Fare: ₱{{ selectedOption.jeepney?.fareRegular }}
                    </div>
                  </div>
                </div>

                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="negative"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >3</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Get off at {{ selectedOption.dropoff?.name || 'your stop' }}</span
                    >
                    <span
                      v-if="walkingRouteToDest?.distance"
                      class="text-caption text-grey-7 q-ml-xs"
                    >
                      then walk {{ formatDistance(walkingRouteToDest.distance) }} (~{{
                        formatDuration(walkingRouteToDest.duration)
                      }}) to destination
                    </span>
                  </div>
                </div>
              </template>

              <!-- Double ride steps -->
              <template v-else>
                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="positive"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >1</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Walk to {{ selectedOption.firstJeepney?.terminalLocation }}</span
                    >
                    <span v-if="walkingRoute?.distance" class="text-caption text-grey-7 q-ml-xs">
                      ({{ formatDistance(walkingRoute.distance) }}, ~{{
                        formatDuration(walkingRoute.duration)
                      }})
                    </span>
                  </div>
                </div>

                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="blue-8"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >2</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Ride <strong>{{ selectedOption.firstJeepney?.jeepName }}</strong></span
                    >
                    <div class="text-caption text-grey-7">
                      Fare: ₱{{ selectedOption.firstJeepney?.fareRegular || 0 }} &nbsp;&bull;&nbsp;
                      Get off near
                      {{ selectedOption.secondJeepney?.terminalLocation || 'the transfer point' }}
                    </div>
                  </div>
                </div>

                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="warning"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >3</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Walk to
                      {{
                        selectedOption.secondJeepney?.terminalLocation || 'the next terminal'
                      }}</span
                    >
                    <span
                      v-if="walkingRouteTransfer?.distance"
                      class="text-caption text-grey-7 q-ml-xs"
                    >
                      ({{ formatDistance(walkingRouteTransfer.distance) }}, ~{{
                        formatDuration(walkingRouteTransfer.duration)
                      }})
                    </span>
                  </div>
                </div>

                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="accent"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >4</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Ride <strong>{{ selectedOption.secondJeepney?.jeepName }}</strong></span
                    >
                    <div class="text-caption text-grey-7">
                      Tell the driver:
                      <em>"Para po sa {{ selectedOption.dropoff?.name || toLocation?.label }}!"</em>
                      &nbsp;&bull;&nbsp; Fare: ₱{{ selectedOption.secondJeepney?.fareRegular || 0 }}
                    </div>
                  </div>
                </div>

                <div class="direction-step">
                  <q-avatar
                    size="28px"
                    color="negative"
                    text-color="white"
                    font-size="13px"
                    class="q-mr-sm"
                    >5</q-avatar
                  >
                  <div>
                    <span class="text-weight-medium"
                      >Get off at {{ selectedOption.dropoff?.name || 'your stop' }}</span
                    >
                    <span
                      v-if="walkingRouteToDest?.distance"
                      class="text-caption text-grey-7 q-ml-xs"
                    >
                      then walk {{ formatDistance(walkingRouteToDest.distance) }} (~{{
                        formatDuration(walkingRouteToDest.duration)
                      }}) to destination
                    </span>
                  </div>
                </div>
              </template>
            </q-card-section>
          </q-card>
        </div>

        <div ref="optionsSection" class="options-grid">
          <q-card
            v-for="(option, index) in routeOptions"
            :key="option.jeepney?.id || option.firstJeepney?.id || index"
            class="bento-card q-ma-sm route-option-card"
            :class="{
              'single-ride': option.priority === 'single',
              'double-ride': option.priority === 'double',
            }"
            @click="selectOption(option)"
          >
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="row items-center q-mb-xs">
                    <!-- Ride type badge -->
                    <q-badge
                      :color="option.priority === 'single' ? 'positive' : 'warning'"
                      class="q-mr-sm ride-type-badge"
                    >
                      {{ option.priority === 'single' ? '🚌 Direct' : '🔄 Transfer' }}
                    </q-badge>

                    <div class="text-h6 text-primary jeepney-name">
                      {{
                        option.priority === 'single'
                          ? option.jeepney?.jeepName
                          : option.firstJeepney?.jeepName
                      }}
                    </div>
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

                  <!-- Single ride info -->
                  <div v-if="option.priority === 'single'" class="route-details">
                    <div class="route-detail-item">
                      <q-icon name="pin_drop" size="xs" color="primary" class="q-mr-xs" />
                      <span class="text-subtitle2"
                        >Board at:
                        {{ option.boardingLabel || option.jeepney?.terminalLocation }}</span
                      >
                    </div>
                    <div v-if="option.dropoff?.name" class="route-detail-item">
                      <q-icon name="flag" size="xs" color="secondary" class="q-mr-xs" />
                      <span class="text-subtitle2">Get off at: {{ option.dropoff.name }}</span>
                    </div>
                    <div class="route-detail-item">
                      <q-icon name="walk" size="xs" color="grey-7" class="q-mr-xs" />
                      <span class="text-caption"
                        >Walk to board:
                        {{ Math.round(option.walkToBoard ?? option.startDistance) }}m</span
                      >
                    </div>
                    <div v-if="option.walkFromDropoff != null" class="route-detail-item">
                      <q-icon name="directions_walk" size="xs" color="grey-7" class="q-mr-xs" />
                      <span class="text-caption"
                        >Walk to destination: {{ Math.round(option.walkFromDropoff) }}m</span
                      >
                    </div>
                  </div>

                  <!-- Double ride info -->
                  <div v-else class="route-details double-ride-details">
                    <div class="route-detail-item">
                      <q-badge color="primary" class="q-mr-xs">1st</q-badge>
                      <span class="text-subtitle2"
                        >{{ option.firstJeepney?.jeepName }} from
                        {{ option.firstJeepney?.terminalLocation }}</span
                      >
                    </div>
                    <div v-if="option.transferName" class="route-detail-item q-ml-md">
                      <q-icon
                        name="transfer_within_a_station"
                        size="xs"
                        color="warning"
                        class="q-mr-xs"
                      />
                      <span class="text-caption">Transfer at: {{ option.transferName }}</span>
                    </div>
                    <div class="route-detail-item">
                      <q-badge color="secondary" class="q-mr-xs">2nd</q-badge>
                      <span class="text-subtitle2">{{ option.secondJeepney?.jeepName }}</span>
                    </div>
                    <div v-if="option.dropoff?.name" class="route-detail-item q-ml-md">
                      <q-icon name="flag" size="xs" color="secondary" class="q-mr-xs" />
                      <span class="text-caption">Get off at: {{ option.dropoff.name }}</span>
                    </div>
                    <div class="route-detail-item">
                      <q-icon name="walk" size="xs" color="grey-7" class="q-mr-xs" />
                      <span class="text-caption"
                        >Total walking: {{ Math.round(option.totalWalkDistance) }}m</span
                      >
                    </div>
                  </div>
                </div>
                <div class="col-auto text-right">
                  <div class="fare-badge q-mb-xs">
                    <q-badge
                      :color="option.priority === 'single' ? 'primary' : 'secondary'"
                      size="lg"
                    >
                      <q-icon name="payments" size="xs" class="q-mr-xs" />
                      ₱{{
                        option.priority === 'single'
                          ? option.jeepney?.fareRegular
                          : option.firstJeepney?.fareRegular + option.secondJeepney?.fareRegular
                      }}
                    </q-badge>
                  </div>
                  <div class="duration-badge">
                    <q-badge outline color="grey-7" size="sm">
                      <q-icon name="schedule" size="xs" class="q-mr-xs" />
                      ~{{
                        Math.round(
                          option.priority === 'single' ? option.jeepney?.estimatedDuration : 40
                        )
                      }}
                      min
                    </q-badge>
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="right">
              <q-btn flat color="primary" @click="selectOption(option)">
                <q-icon name="visibility" class="q-mr-xs" />
                View Details
              </q-btn>
            </q-card-actions>
          </q-card>
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
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore'
import FAQSection from '../components/home/FAQSection.vue'
import FooterSection from '../components/home/FooterSection.vue'
import fallbackImage from '../assets/2.png'

// NEW: Import custom composables for enhanced functionality (will be used in next increments)
import { useGeolocation } from 'src/composables/useGeolocation'
import { useGeocoding } from 'src/composables/useGeocoding'
import { useJeepneyRouteMatching } from 'src/composables/useJeepneyRouteMatching'
import { useWalkingDirections } from 'src/composables/useWalkingDirections'
import { fuzzyMatch, fetchPlaces, callOSRM } from 'src/composables/useRouteGeneration'

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
    const { searchLocations, reverseGeocode } = useGeocoding()
    const {
      loadJeepneys,
      jeepneys,
      calculateDistance: calcDistanceGeo,
      isNearRoute,
    } = useJeepneyRouteMatching()
    const { getWalkingDirections, formatDistance, formatDuration } = useWalkingDirections()

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
    const routeMap = ref(null)
    const isScrolled = ref(false)
    const favoriteRoutes = ref([])
    const jeepneyAvailability = ref({})
    const travelTimeEstimate = ref(null)

    // NEW: State for enhanced route finding (will be used in next increments)
    const routeOptions = ref([])
    const walkingRoute = ref(null)
    const walkingRouteToDest = ref(null)
    const walkingRouteTransfer = ref(null)

    // Session caches to avoid repeat OSRM/Firestore work
    const placesCache = ref(null)
    const jeepneyRouteCache = new Map() // jeepney.id -> coordinates array ([lng,lat] pairs)

    const loadPlacesOnce = async () => {
      if (!placesCache.value) {
        placesCache.value = await fetchPlaces()
      }
      return placesCache.value
    }

    // Firestore rejects nested arrays, so route polylines are persisted as
    // [{ lng, lat }, ...] objects but consumed in-memory as [[lng, lat], ...].
    // These helpers convert between the two shapes and tolerate legacy docs
    // that still store the nested-array form.
    const normalizeRouteCoords = (raw) => {
      if (!Array.isArray(raw) || raw.length === 0) return null
      const first = raw[0]
      if (Array.isArray(first) && first.length === 2) return raw
      if (first && typeof first === 'object' && 'lng' in first && 'lat' in first) {
        return raw.map((p) => [p.lng, p.lat])
      }
      return null
    }
    const coordsForStorage = (coords) => coords.map(([lng, lat]) => ({ lng, lat }))

    // Public OSRM rate-limits aggressive concurrency, so we serialize calls
    // with a small delay between regenerations.
    const OSRM_THROTTLE_MS = 250
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    /**
     * Ensure a jeepney has a road-following routeCoordinates polyline.
     * - Session cache hit → return immediately.
     * - Already persisted in Firestore → cache and return.
     * - Otherwise build waypoints leniently (unmatched endPoint / spots just get skipped
     *   or geocoded via Nominatim), call OSRM driving, persist to Firestore, cache.
     * Returns null only if we cannot build at least 2 waypoints.
     */
    const ensureJeepneyRoute = async (jeepney) => {
      if (jeepneyRouteCache.has(jeepney.id)) {
        return jeepneyRouteCache.get(jeepney.id)
      }
      const existing = normalizeRouteCoords(jeepney.routeCoordinates)
      if (existing && existing.length >= 2) {
        jeepney.routeCoordinates = existing
        jeepneyRouteCache.set(jeepney.id, existing)
        return existing
      }
      if (!jeepney.terminalLat || !jeepney.terminalLng) {
        console.warn(`[ApanamPage] Jeepney "${jeepney.jeepName}" missing terminal coords`)
        return null
      }

      const places = await loadPlacesOnce()
      const terminal = {
        name: 'Terminal',
        latitude: jeepney.terminalLat,
        longitude: jeepney.terminalLng,
      }
      const intermediates = []
      const unmatched = []

      for (const spotName of jeepney.touristSpotsServiced || []) {
        const place = fuzzyMatch(spotName, places)
        if (place) {
          intermediates.push({
            name: place.name,
            latitude: place.latitude,
            longitude: place.longitude,
          })
        } else {
          unmatched.push(`spot: "${spotName}"`)
        }
      }

      // endPoint is often a road/street name — try places first, then Nominatim
      let endPointWaypoint = null
      if (jeepney.endPoint) {
        const endPlace = fuzzyMatch(jeepney.endPoint, places)
        if (endPlace) {
          endPointWaypoint = {
            name: endPlace.name,
            latitude: endPlace.latitude,
            longitude: endPlace.longitude,
          }
        } else {
          try {
            const geoResults = await searchLocations(jeepney.endPoint + ', Baguio', true)
            if (geoResults && geoResults.length > 0) {
              endPointWaypoint = {
                name: jeepney.endPoint,
                latitude: geoResults[0].lat,
                longitude: geoResults[0].lng,
              }
            } else {
              unmatched.push(`endPoint: "${jeepney.endPoint}"`)
            }
          } catch {
            unmatched.push(`endPoint: "${jeepney.endPoint}" (geocode failed)`)
          }
        }
      }

      // Sort intermediate stops by their projection onto the terminal→endPoint axis
      // so OSRM visits them roughly in travel order (avoids a zigzagging polyline).
      // Falls back to distance-from-terminal when no endPoint is available.
      const anchor = endPointWaypoint || intermediates[intermediates.length - 1]
      if (anchor && intermediates.length > 1) {
        const dx = anchor.longitude - terminal.longitude
        const dy = anchor.latitude - terminal.latitude
        const denom = dx * dx + dy * dy || 1
        intermediates.sort((a, b) => {
          const ta =
            ((a.longitude - terminal.longitude) * dx + (a.latitude - terminal.latitude) * dy) /
            denom
          const tb =
            ((b.longitude - terminal.longitude) * dx + (b.latitude - terminal.latitude) * dy) /
            denom
          return ta - tb
        })
      }

      const waypoints = [terminal, ...intermediates]
      if (endPointWaypoint) waypoints.push(endPointWaypoint)

      if (unmatched.length > 0) {
        console.warn(
          `[ApanamPage] Jeepney "${jeepney.jeepName}" could not match:`,
          unmatched,
          '— route will still be built from the matched waypoints.'
        )
      }

      if (waypoints.length < 2) {
        console.warn(
          `[ApanamPage] Jeepney "${jeepney.jeepName}" only has terminal as a waypoint — skipping.`
        )
        return null
      }

      try {
        const result = await callOSRM(waypoints)
        const coords = result.coordinates
        jeepney.routeCoordinates = coords
        jeepneyRouteCache.set(jeepney.id, coords)
        try {
          await updateDoc(doc(db, 'jeepneys', jeepney.id), {
            routeCoordinates: coordsForStorage(coords),
            routeDistance: result.distance,
            routeDuration: result.duration,
          })
        } catch (persistErr) {
          console.warn(
            `[ApanamPage] Could not persist routeCoordinates for ${jeepney.jeepName}:`,
            persistErr.message
          )
        }
        return coords
      } catch (err) {
        console.warn(`[ApanamPage] OSRM failed for "${jeepney.jeepName}":`, err.message)
        return null
      }
    }

    /**
     * Find the nearest drop-off spot for a destination from a jeepney's serviced spots.
     * Looks up each spot's coords via the places collection (fuzzy match) and picks the
     * one closest to the user's destination. If no named spot is within
     * DROPOFF_NAMED_THRESHOLD, falls back to the nearest point on the route polyline
     * (so users still get an accurate drop-off location even when touristSpotsServiced
     * doesn't include their specific destination).
     */
    const findNearestDropoff = (jeepney, places, destCoords, nearestRoutePoint = null) => {
      const candidates = []
      const spots = jeepney.touristSpotsServiced || []
      for (const name of spots) {
        const place = fuzzyMatch(name, places)
        if (place) {
          candidates.push({ name: place.name, coords: [place.latitude, place.longitude] })
        }
      }
      if (jeepney.endPoint) {
        const endPlace = fuzzyMatch(jeepney.endPoint, places)
        if (endPlace) {
          candidates.push({
            name: endPlace.name,
            coords: [endPlace.latitude, endPlace.longitude],
          })
        }
      }
      if (jeepney.terminalLat && jeepney.terminalLng) {
        candidates.push({
          name: jeepney.terminalLocation || 'Terminal',
          coords: [jeepney.terminalLat, jeepney.terminalLng],
        })
      }
      let best = null
      for (const c of candidates) {
        const dist = calcDistanceGeo(destCoords, c.coords)
        if (!best || dist < best.distance) {
          best = { ...c, distance: dist }
        }
      }
      // Fall back to nearest point on route if no named spot is close enough
      if (nearestRoutePoint && (!best || best.distance > DROPOFF_NAMED_THRESHOLD)) {
        const routePointDist = calcDistanceGeo(destCoords, nearestRoutePoint)
        if (!best || routePointDist < best.distance) {
          best = {
            name: 'nearest stop to your destination',
            coords: nearestRoutePoint,
            distance: routePointDist,
          }
        }
      }
      return best
    }

    // Location options are built from the Firestore `places` collection on mount,
    // so SM Baguio / Botanical Garden / etc. always use the canonical coordinates
    // the admin curated, not stale hardcoded values.
    const OTHER_OPTION = { label: 'Other', value: 'other' }
    const locationOptions = ref([OTHER_OPTION])

    const loadLocationOptions = async () => {
      try {
        const places = await loadPlacesOnce()
        const fromPlaces = (places || [])
          .filter(
            (p) => p?.name && typeof p.latitude === 'number' && typeof p.longitude === 'number'
          )
          .map((p) => ({
            label: p.name,
            value: `place-${p.id}`,
            coords: [p.latitude, p.longitude],
            placeId: p.id,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
        locationOptions.value = [...fromPlaces, OTHER_OPTION]
        toLocationOptions.value = [...locationOptions.value]
      } catch (err) {
        console.warn('[ApanamPage] Failed to load places for location options:', err.message)
      }
    }

    // Fuzzy-match a free-text query against the places collection.
    // Used by the From search so "SM Baguio" resolves to the admin-curated
    // SM City Baguio place document instead of whatever Nominatim guesses.
    const matchQueryToPlace = (query) => {
      if (!query) return null
      const places = placesCache.value || []
      if (places.length === 0) return null
      const needle = query.toLowerCase().trim()
      const normalize = (s) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      const normNeedle = normalize(query)
      // 1. Exact case-insensitive match
      let hit = places.find((p) => p.name?.toLowerCase().trim() === needle)
      if (hit) return hit
      // 2. Normalized equality
      hit = places.find((p) => normalize(p.name || '') === normNeedle)
      if (hit) return hit
      // 3. Name contains query or vice versa (on normalized forms)
      hit = places.find((p) => {
        const n = normalize(p.name || '')
        return n && (n.includes(normNeedle) || normNeedle.includes(n))
      })
      return hit || null
    }

    const selectedFromLocation = ref(null)
    const selectedToLocation = ref(null)

    // Populated once places load; empty until then.
    const toLocationOptions = ref([OTHER_OPTION])

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

    // Distance thresholds for route matching (meters)
    const DEST_NEAR_ROUTE_THRESHOLD = 250 // destination must be this close to jeepney polyline
    const MAX_WALK_TO_BOARD = 500 // user must be able to reach the route within this walk
    const DROPOFF_NAMED_THRESHOLD = 400 // use a named spot only if it's this close to destination
    const TRANSFER_NEAR_ROUTE_THRESHOLD = 400 // transfer point must be this close to connecting route

    const findRoutes = async () => {
      console.log('[ApanamPage] findRoutes called')
      console.log('[ApanamPage] fromLocation:', fromLocation.value)
      console.log('[ApanamPage] toLocation:', toLocation.value)

      if (!fromLocation.value || !toLocation.value) {
        $q.notify({
          message: 'Please select both starting and ending locations',
          color: 'warning',
          icon: 'warning',
          position: 'top',
        })
        return
      }

      isLoadingOptions.value = true
      selectedOption.value = null
      routeOptions.value = []

      try {
        if (jeepneys.value.length === 0) {
          await loadJeepneys()
        }
        const places = await loadPlacesOnce()

        const startCoords = fromLocation.value.coords || []
        const endCoords = toLocation.value.coords || []

        if (!endCoords || endCoords.length !== 2) {
          isLoadingOptions.value = false
          $q.notify({
            message: 'Destination has no coordinates. Please pick a location from the suggestions.',
            color: 'warning',
            icon: 'warning',
            position: 'top',
          })
          return
        }
        if (!startCoords || startCoords.length !== 2) {
          isLoadingOptions.value = false
          $q.notify({
            message: 'Starting point has no coordinates. Use GPS or pick a suggested location.',
            color: 'warning',
            icon: 'warning',
            position: 'top',
          })
          return
        }

        // Ensure every jeepney has a road-following polyline (generate + persist if missing).
        // Serialized to avoid 429s from the public OSRM endpoint; cached jeepneys return
        // immediately so the throttle only kicks in for genuine regenerations.
        console.log(
          `[ApanamPage] Processing ${jeepneys.value.length} jeepneys for route matching...`
        )
        const processed = []
        for (const j of jeepneys.value) {
          const hadCache =
            jeepneyRouteCache.has(j.id) ||
            (normalizeRouteCoords(j.routeCoordinates)?.length ?? 0) >= 2
          const coords = await ensureJeepneyRoute(j)
          processed.push({ jeepney: j, routeCoords: coords })
          if (!hadCache) await sleep(OSRM_THROTTLE_MS)
        }
        const withRoutes = processed.filter((p) => p.routeCoords && p.routeCoords.length >= 2)
        console.log(
          `[ApanamPage] ${withRoutes.length}/${processed.length} jeepneys have usable routes`
        )

        const singleRides = []
        const skippedForDistance = []
        const skippedForStart = []

        for (const { jeepney, routeCoords } of processed) {
          if (!routeCoords || routeCoords.length < 2) continue

          // Destination must be on (or very near) this jeepney's actual road path
          const destNear = isNearRoute(endCoords, routeCoords, DEST_NEAR_ROUTE_THRESHOLD)
          if (!destNear.isNear) {
            skippedForDistance.push({
              jeepName: jeepney.jeepName,
              distance: Math.round(destNear.minDistance),
            })
            continue
          }

          // Boarding is always at the jeepney's terminal — user must be within
          // walking distance of it.
          const terminalCoordsArr =
            jeepney.terminalLat && jeepney.terminalLng
              ? [jeepney.terminalLat, jeepney.terminalLng]
              : null

          if (!terminalCoordsArr) {
            skippedForStart.push({
              jeepName: jeepney.jeepName,
              startDistance: Infinity,
            })
            continue
          }

          const terminalDist = calcDistanceGeo(startCoords, terminalCoordsArr)

          if (terminalDist > MAX_WALK_TO_BOARD) {
            skippedForStart.push({
              jeepName: jeepney.jeepName,
              startDistance: Math.round(terminalDist),
            })
            continue
          }

          const boardingPoint = terminalCoordsArr
          const boardingLabel = jeepney.terminalLocation || 'Terminal'
          const walkToBoard = terminalDist

          let dropoff = findNearestDropoff(jeepney, places, endCoords, destNear.nearestPoint)
          // If the drop-off fell back to an unnamed route point, use the destination's own
          // label so "Para po sa <X>" reads naturally.
          if (dropoff && dropoff.name === 'nearest stop to your destination') {
            const destLabel = toLocation.value?.label || toLocation.value?.display_name || 'my stop'
            dropoff = { ...dropoff, name: destLabel }
          }
          const walkFromDropoff = dropoff
            ? calcDistanceGeo(dropoff.coords, endCoords)
            : destNear.minDistance

          singleRides.push({
            jeepney: { ...jeepney },
            routeGeometry: routeCoords,
            dropoff,
            boardingPoint,
            boardingLabel,
            walkToBoard,
            walkFromDropoff,
            rideType: 'single',
            priority: 'single',
            startDistance: walkToBoard,
            endDistance: destNear.minDistance,
            confidence: destNear.minDistance < 100 ? 0.95 : 0.85,
            // Fields consumed by the tutorial stepper section
            routeName: jeepney.jeepName,
            terminalStart: boardingLabel,
            terminalEnd: dropoff?.name || jeepney.endPoint,
            fare: jeepney.fareRegular,
            estimatedDuration: jeepney.estimatedDuration || 20,
          })
        }

        // Rank: favor short walk to board + short walk from drop-off (drop-off weighted 2x)
        singleRides.sort((a, b) => {
          const aScore = (a.walkToBoard || 0) + (a.walkFromDropoff || 0) * 2
          const bScore = (b.walkToBoard || 0) + (b.walkFromDropoff || 0) * 2
          return aScore - bScore
        })

        // Double rides — only if single rides are sparse
        const doubleRides = []
        if (singleRides.length < 2) {
          const startJeepneys = processed.filter(({ jeepney, routeCoords }) => {
            if (!routeCoords) return false
            if (!jeepney.terminalLat || !jeepney.terminalLng) return false
            return (
              calcDistanceGeo(startCoords, [jeepney.terminalLat, jeepney.terminalLng]) <=
              MAX_WALK_TO_BOARD
            )
          })
          const destJeepneys = processed.filter(({ routeCoords }) => {
            if (!routeCoords) return false
            return isNearRoute(endCoords, routeCoords, DEST_NEAR_ROUTE_THRESHOLD).isNear
          })

          for (const first of startJeepneys) {
            for (const second of destJeepneys) {
              if (first.jeepney.id === second.jeepney.id) continue

              // Candidate transfer points: first jeepney's serviced spots + terminal
              const candidateSpots = []
              for (const name of first.jeepney.touristSpotsServiced || []) {
                const place = fuzzyMatch(name, places)
                if (place) {
                  candidateSpots.push({
                    name: place.name,
                    coords: [place.latitude, place.longitude],
                  })
                }
              }
              if (first.jeepney.terminalLat && first.jeepney.terminalLng) {
                candidateSpots.push({
                  name: first.jeepney.terminalLocation || 'Terminal',
                  coords: [first.jeepney.terminalLat, first.jeepney.terminalLng],
                })
              }

              let bestTransfer = null
              for (const spot of candidateSpots) {
                const near = isNearRoute(
                  spot.coords,
                  second.routeCoords,
                  TRANSFER_NEAR_ROUTE_THRESHOLD
                )
                if (near.isNear) {
                  if (!bestTransfer || near.minDistance < bestTransfer.walkDistance) {
                    bestTransfer = { spot, walkDistance: near.minDistance }
                  }
                }
              }
              if (!bestTransfer) continue

              const startDist = first.jeepney.terminalLat
                ? calcDistanceGeo(startCoords, [
                    first.jeepney.terminalLat,
                    first.jeepney.terminalLng,
                  ])
                : 0
              const destNearSecond = isNearRoute(
                endCoords,
                second.routeCoords,
                DEST_NEAR_ROUTE_THRESHOLD
              )
              let secondDropoff = findNearestDropoff(
                second.jeepney,
                places,
                endCoords,
                destNearSecond.nearestPoint
              )
              if (secondDropoff && secondDropoff.name === 'nearest stop to your destination') {
                const destLabel =
                  toLocation.value?.label || toLocation.value?.display_name || 'my stop'
                secondDropoff = { ...secondDropoff, name: destLabel }
              }
              const walkFromDropoff = secondDropoff
                ? calcDistanceGeo(secondDropoff.coords, endCoords)
                : 0

              // The user's spec: ride-2 is boarded at JEEPNEY-2's TERMINAL, not
              // mid-route. So we treat it as a fixed anchor and figure out the
              // ride-1 alight point as the closest point on jeepney-1's
              // polyline to that terminal. This guarantees the two ride
              // polylines are visually disjoint, separated by a walking leg.
              const firstBoardingPoint = first.jeepney.terminalLat
                ? [first.jeepney.terminalLat, first.jeepney.terminalLng]
                : null
              const secondBoardingPoint = second.jeepney.terminalLat
                ? [second.jeepney.terminalLat, second.jeepney.terminalLng]
                : bestTransfer.spot.coords
              const firstDropoffPoint =
                isNearRoute(secondBoardingPoint, first.routeCoords, Infinity).nearestPoint ||
                bestTransfer.spot.coords

              doubleRides.push({
                rideType: 'double',
                priority: 'double',
                firstJeepney: { ...first.jeepney, startDistance: startDist },
                secondJeepney: { ...second.jeepney },
                firstRouteGeometry: first.routeCoords,
                secondRouteGeometry: second.routeCoords,
                firstBoardingPoint,
                firstDropoffPoint,
                secondBoardingPoint,
                boardingPoint: firstBoardingPoint,
                transferPoint: bestTransfer.spot.coords,
                transferName: bestTransfer.spot.name,
                walkToTransfer: bestTransfer.walkDistance,
                dropoff: secondDropoff,
                walkFromDropoff,
                totalWalkDistance: startDist + bestTransfer.walkDistance + walkFromDropoff,
                confidence: 0.7,
                routeName: `${first.jeepney.jeepName} → ${second.jeepney.jeepName}`,
                terminalStart: first.jeepney.terminalLocation,
                terminalEnd: secondDropoff?.name || second.jeepney.endPoint,
                fare: (first.jeepney.fareRegular || 0) + (second.jeepney.fareRegular || 0),
                estimatedDuration: 40,
              })
            }
          }
          doubleRides.sort((a, b) => a.totalWalkDistance - b.totalWalkDistance)
        }

        routeOptions.value = [...singleRides, ...doubleRides.slice(0, 5)]
        console.log('[ApanamPage] Route options:', routeOptions.value)
        if (singleRides.length === 0) {
          if (skippedForDistance.length > 0) {
            console.log(
              `[ApanamPage] Closest jeepneys to destination (none within ${DEST_NEAR_ROUTE_THRESHOLD}m):`,
              skippedForDistance.sort((a, b) => a.distance - b.distance).slice(0, 5)
            )
          }
          if (skippedForStart.length > 0) {
            console.log(
              `[ApanamPage] Jeepneys that pass the destination but are too far from start (>${MAX_WALK_TO_BOARD}m):`,
              skippedForStart.sort((a, b) => a.startDistance - b.startDistance).slice(0, 5)
            )
          }
        }

        isLoadingOptions.value = false

        if (routeOptions.value.length === 0) {
          $q.notify({
            message: 'No jeepney routes found for this destination. Try a different location.',
            color: 'info',
            icon: 'info',
            position: 'top',
          })
          return
        }

        await nextTick()
        if (optionsSection.value) {
          optionsSection.value.scrollIntoView({ behavior: 'smooth' })
        }

        $q.notify({
          message: `Found ${routeOptions.value.length} route option(s)!`,
          color: 'positive',
          icon: 'check_circle',
          position: 'top',
          timeout: 2000,
        })
      } catch (error) {
        console.error('[ApanamPage] Error finding routes:', error)
        isLoadingOptions.value = false
        $q.notify({
          message: 'Error finding routes. Please try again.',
          color: 'negative',
          icon: 'error',
          position: 'top',
        })
      }
    }

    // Helper function to calculate distance between two coordinates
    // eslint-disable-next-line no-unused-vars
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

    const selectOption = async (option) => {
      console.log('[ApanamPage] selectOption called with:', option)
      selectedOption.value = option
      currentStep.value = 1
      walkingRoute.value = null
      walkingRouteToDest.value = null
      walkingRouteTransfer.value = null

      calculateTravelTime(option)
      simulateJeepneyAvailability(option)

      // Small delay so the public OSRM server recovers from the jeepney-route
      // generation calls that just finished in findRoutes.
      await sleep(400)

      // Walking legs via OSRM (road-following, not straight lines)
      await fetchWalkingDirections(option)
      await fetchWalkingToDestination(option)
      await fetchWalkingTransfer(option)

      // Build the consolidated map using road-following polylines
      setTimeout(() => {
        if (!document.getElementById('route-map')) return
        if (routeMap.value) {
          routeMap.value.remove()
        }

        routeMap.value = L.map('route-map').setView([16.4122, 120.5948], 14)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(routeMap.value)

        const allBounds = []
        const startCoords = fromLocation.value?.coords
        const endCoords = toLocation.value?.coords

        const boardingCoords =
          option.boardingPoint ||
          (option.priority === 'single'
            ? [option.jeepney?.terminalLat, option.jeepney?.terminalLng]
            : [option.firstJeepney?.terminalLat, option.firstJeepney?.terminalLng])

        // Helper: jeepney routeCoordinates are stored as [lng, lat] pairs from OSRM
        const toLatLngList = (coords) =>
          Array.isArray(coords) ? coords.map(([lng, lat]) => [lat, lng]) : []

        // Clip a [lat, lng] polyline to only show from a boarding point to a dropoff point
        const clipPolyline = (polyline, fromCoord, toCoord) => {
          if (!polyline || polyline.length < 2 || !fromCoord || !toCoord) return polyline
          let fromIdx = 0,
            fromMin = Infinity
          let toIdx = polyline.length - 1,
            toMin = Infinity
          for (let i = 0; i < polyline.length; i++) {
            const dFrom = calcDistanceGeo(fromCoord, polyline[i])
            if (dFrom < fromMin) {
              fromMin = dFrom
              fromIdx = i
            }
            const dTo = calcDistanceGeo(toCoord, polyline[i])
            if (dTo < toMin) {
              toMin = dTo
              toIdx = i
            }
          }
          if (fromIdx > toIdx) [fromIdx, toIdx] = [toIdx, fromIdx]
          return polyline.slice(fromIdx, toIdx + 1)
        }

        // 1. Walking start → boarding point. Dashed line matches step 1's
        // green avatar / start marker (between markers 1 and 2).
        if (walkingRoute.value?.geometry?.length) {
          L.polyline(walkingRoute.value.geometry, {
            color: 'var(--q-positive)',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 12',
          }).addTo(routeMap.value)
          walkingRoute.value.geometry.forEach((c) => allBounds.push(c))
        } else if (startCoords && boardingCoords && boardingCoords[0]) {
          L.polyline([startCoords, boardingCoords], {
            color: 'var(--q-positive)',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 12',
          }).addTo(routeMap.value)
        }

        // 2. Jeepney ride 1 — solid line, clipped to the actual ridden segment.
        // Color matches step 2's avatar / marker 2 (blue) so the ride visually
        // belongs to the same instruction step.
        const firstRideFullPolyline =
          option.priority === 'single'
            ? toLatLngList(option.routeGeometry)
            : toLatLngList(option.firstRouteGeometry)
        const firstClipEnd =
          option.priority === 'single'
            ? option.dropoff?.coords
            : option.firstDropoffPoint || option.transferPoint
        const firstRidePolyline = clipPolyline(firstRideFullPolyline, boardingCoords, firstClipEnd)
        if (firstRidePolyline.length >= 2) {
          L.polyline(firstRidePolyline, {
            color: 'var(--q-primary)',
            weight: 5,
            opacity: 0.9,
          }).addTo(routeMap.value)
          firstRidePolyline.forEach((c) => allBounds.push(c))
        } else if (
          option.priority === 'single' &&
          boardingCoords &&
          boardingCoords[0] &&
          endCoords &&
          endCoords.length === 2
        ) {
          // Single-ride fallback only — never collapse a double ride into a
          // straight line, which would visually merge the two routes.
          L.polyline([boardingCoords, endCoords], {
            color: 'var(--q-primary)',
            weight: 5,
            opacity: 0.9,
          }).addTo(routeMap.value)
        }

        // Double-ride extras: transfer walk + second jeepney polyline
        if (option.priority === 'double') {
          const firstDropoff = option.firstDropoffPoint || option.transferPoint
          const secondBoarding = option.secondBoardingPoint || option.transferPoint

          // 2b. Transfer walk: drop-off-1 → boarding-2. Dashed line matches
          // step 3's yellow avatar / alight-1 marker (between markers 3 and 4).
          if (firstDropoff && secondBoarding) {
            if (walkingRouteTransfer.value?.geometry?.length) {
              L.polyline(walkingRouteTransfer.value.geometry, {
                color: 'var(--q-warning)',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 12',
              }).addTo(routeMap.value)
              walkingRouteTransfer.value.geometry.forEach((c) => allBounds.push(c))
            } else {
              L.polyline([firstDropoff, secondBoarding], {
                color: 'var(--q-warning)',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 12',
              }).addTo(routeMap.value)
              allBounds.push(firstDropoff, secondBoarding)
            }
          }

          // 2c. Jeepney ride 2 — solid line, clipped from boarding-2 to
          // drop-off-2. Purple matches step 4's avatar / marker 4, making the
          // two rides visually distinct from each other.
          //
          // A small lat/lng shift (~5 m NE at Baguio's latitude) is applied so
          // that when ride 2 shares roads with ride 1 the two lines render as
          // parallel siblings instead of being painted on top of each other.
          const secondRideFullPolyline = toLatLngList(option.secondRouteGeometry)
          const secondRidePolylineRaw = clipPolyline(
            secondRideFullPolyline,
            secondBoarding,
            option.dropoff?.coords
          )
          const SECOND_LINE_OFFSET = 0.00005
          const secondRidePolyline = secondRidePolylineRaw.map(([lat, lng]) => [
            lat + SECOND_LINE_OFFSET,
            lng + SECOND_LINE_OFFSET,
          ])
          if (secondRidePolyline.length >= 2) {
            L.polyline(secondRidePolyline, {
              color: 'var(--q-accent)',
              weight: 5,
              opacity: 0.9,
            }).addTo(routeMap.value)
            secondRidePolyline.forEach((c) => allBounds.push(c))
          }
        }

        // 3. Walking drop-off → destination (OSRM foot, dashed orange)
        if (walkingRouteToDest.value?.geometry?.length) {
          L.polyline(walkingRouteToDest.value.geometry, {
            color: '#E65100',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 12',
          }).addTo(routeMap.value)
          walkingRouteToDest.value.geometry.forEach((c) => allBounds.push(c))
        } else if (option.dropoff?.coords && endCoords && endCoords.length === 2) {
          L.polyline([option.dropoff.coords, endCoords], {
            color: '#E65100',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 12',
          }).addTo(routeMap.value)
        }

        // Markers
        // 1) Starting location — positive green (matches step 1: "Walk to …")
        if (startCoords) {
          L.marker(startCoords, {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:var(--q-positive);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          })
            .addTo(routeMap.value)
            .bindPopup('<b>Start</b>')
          allBounds.push(startCoords)
        }

        // Helper to add a colored circular marker
        const addMarker = (coord, color, popup) => {
          if (!coord || coord[0] == null || coord[1] == null) return
          L.marker(coord, {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: `<div style='background-color:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          })
            .addTo(routeMap.value)
            .bindPopup(popup)
          allBounds.push(coord)
        }

        // Marker colors mirror the step avatars. The page's scoped SCSS
        // overrides .bg-primary to dark green, so step avatars use blue-8 /
        // negative tokens directly to render the same blue and red the markers
        // use here (--q-primary CSS var still resolves to #1976D2).
        const COLOR_BLUE = 'var(--q-primary)' // = blue-8 / #1976D2
        const COLOR_WARNING = 'var(--q-warning)'
        const COLOR_ACCENT = 'var(--q-accent)'
        const COLOR_RED = 'var(--q-negative)'

        if (option.priority === 'double') {
          const terminal1Label = option.firstJeepney?.terminalLocation || 'Terminal 1'
          const terminal2Label = option.secondJeepney?.terminalLocation || 'Terminal 2'
          // 2) Board jeepney 1 — blue (matches step 2: "Ride <jeep 1>")
          addMarker(
            boardingCoords,
            COLOR_BLUE,
            `<b>Board ${option.firstJeepney?.jeepName || 'jeepney 1'}</b><br>${terminal1Label}`
          )
          // 3) Alight ride 1 — warning (matches step 3: "Walk to <terminal 2>")
          addMarker(
            option.firstDropoffPoint || option.transferPoint,
            COLOR_WARNING,
            `<b>Get off ${option.firstJeepney?.jeepName || 'jeepney 1'}</b><br>Walk to ${terminal2Label}`
          )
          // 4) Board jeepney 2 — accent (matches step 4: "Ride <jeep 2>")
          addMarker(
            option.secondBoardingPoint || option.transferPoint,
            COLOR_ACCENT,
            `<b>Board ${option.secondJeepney?.jeepName || 'jeepney 2'}</b><br>${terminal2Label}`
          )
          // 5) Drop-off ride 2 — red (matches step 5: "Get off at …")
          if (option.dropoff?.coords) {
            addMarker(
              option.dropoff.coords,
              COLOR_RED,
              `<b>Get off ${option.secondJeepney?.jeepName || 'jeepney 2'}</b><br>${option.dropoff.name}`
            )
          }
        } else {
          // Single ride: 2) Board — blue, 3) Drop-off — red
          if (boardingCoords && boardingCoords[0]) {
            const boardingLabel = option.boardingLabel || 'Board jeepney here'
            addMarker(boardingCoords, COLOR_BLUE, `<b>Board jeepney</b><br>${boardingLabel}`)
          }
          if (option.dropoff?.coords) {
            addMarker(option.dropoff.coords, COLOR_RED, `<b>Get off at ${option.dropoff.name}</b>`)
          }
        }

        // Final destination — Quasar `negative` red, separate from drop-off
        if (endCoords && endCoords.length === 2) {
          L.marker(endCoords, {
            icon: L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:var(--q-negative);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          })
            .addTo(routeMap.value)
            .bindPopup('<b>Destination</b>')
          allBounds.push(endCoords)
        }

        if (allBounds.length >= 2) {
          routeMap.value.fitBounds(
            allBounds.filter((c) => c && c[0]),
            { padding: [40, 40] }
          )
        }
      }, 200)
    }

    // Use callOSRM (proven reliable for jeepney routes) as a secondary fallback
    // when useWalkingDirections fails to get road-following geometry.
    const fetchRoadGeometry = async (from, to) => {
      try {
        const result = await callOSRM([
          { latitude: from[0], longitude: from[1] },
          { latitude: to[0], longitude: to[1] },
        ])
        return result.coordinates.map(([lng, lat]) => [lat, lng])
      } catch {
        return null
      }
    }

    // Fetch walking directions using OSRM
    const fetchWalkingDirections = async (option) => {
      try {
        // Get start coordinates
        const startCoords = fromLocation.value?.coords
        if (!startCoords || startCoords.length === 0) {
          console.log('[ApanamPage] No start coordinates available')
          return
        }

        // Prefer the boarding point computed in findRoutes (nearest point on route
        // OR terminal, whichever is closer to user). Fall back to terminal if absent.
        let boardingCoords = null
        if (option.priority === 'single') {
          boardingCoords =
            option.boardingPoint ||
            (option.jeepney?.terminalLat
              ? [option.jeepney.terminalLat, option.jeepney.terminalLng]
              : null)
        } else {
          boardingCoords =
            option.boardingPoint ||
            (option.firstJeepney?.terminalLat
              ? [option.firstJeepney.terminalLat, option.firstJeepney.terminalLng]
              : null)
        }

        if (!boardingCoords || !boardingCoords[0] || !boardingCoords[1]) {
          console.log('[ApanamPage] No boarding coordinates available')
          return
        }

        // Skip walking leg if user is basically already at boarding point
        if (calcDistanceGeo(startCoords, boardingCoords) < 30) return

        console.log(
          '[ApanamPage] Fetching walking directions from',
          startCoords,
          'to',
          boardingCoords
        )

        const directions = await getWalkingDirections(startCoords, boardingCoords)

        if (directions && directions.steps) {
          // If the composable's OSRM calls all failed, geometry will be empty.
          // Try callOSRM (the same function that works for jeepney routes) as
          // a secondary fallback to get a road-following polyline for the map.
          if (!directions.geometry?.length) {
            const geo = await fetchRoadGeometry(startCoords, boardingCoords)
            if (geo) directions.geometry = geo
          }
          walkingRoute.value = directions
          console.log('[ApanamPage] Walking directions fetched:', directions)
        }
      } catch (error) {
        console.error('[ApanamPage] Error fetching walking directions:', error)
      }
    }

    // Walking leg from jeepney drop-off spot to the user's actual destination
    const fetchWalkingToDestination = async (option) => {
      try {
        const endCoords = toLocation.value?.coords
        if (!endCoords || endCoords.length !== 2) return
        if (!option.dropoff?.coords) return
        // Skip if the drop-off IS effectively the destination
        if (option.walkFromDropoff !== undefined && option.walkFromDropoff < 30) return
        const directions = await getWalkingDirections(option.dropoff.coords, endCoords)
        if (directions) {
          if (!directions.geometry?.length) {
            const geo = await fetchRoadGeometry(option.dropoff.coords, endCoords)
            if (geo) directions.geometry = geo
          }
          walkingRouteToDest.value = directions
        }
      } catch (error) {
        console.error('[ApanamPage] Error fetching walking-to-destination directions:', error)
      }
    }

    // Walking leg for double-ride transfer (first drop-off → second boarding)
    const fetchWalkingTransfer = async (option) => {
      try {
        if (option.priority !== 'double') return
        const transferStart = option.firstDropoffPoint || option.transferPoint
        const transferEnd = option.secondBoardingPoint || option.transferPoint
        if (!transferStart || !transferEnd) return
        if (calcDistanceGeo(transferStart, transferEnd) < 30) return
        const directions = await getWalkingDirections(transferStart, transferEnd)
        if (directions) {
          if (!directions.geometry?.length) {
            const geo = await fetchRoadGeometry(transferStart, transferEnd)
            if (geo) directions.geometry = geo
          }
          walkingRouteTransfer.value = directions
        }
      } catch (error) {
        console.error('[ApanamPage] Error fetching transfer walking directions:', error)
      }
    }

    // NEW: Helper functions for walking directions display
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

    const resetSelection = () => {
      selectedOption.value = null
      currentStep.value = 1
      filteredOptions.value = []
      routeOptions.value = []
      walkingRoute.value = null
      walkingRouteToDest.value = null
      walkingRouteTransfer.value = null
      fromLocation.value = null
      toLocation.value = null
      fromLocationText.value = ''
      fromAutoDetect.value = false
      customFromLocation.value = ''
      customToLocation.value = ''
      selectedFromLocation.value = null
      selectedToLocation.value = null

      if (routeMap.value) {
        routeMap.value.remove()
        routeMap.value = null
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

        // Reverse geocode to get actual place name
        let locationLabel = '📍 Your Current Location'
        try {
          const geoResult = await reverseGeocode(coords.lat, coords.lng)
          if (geoResult && geoResult.label && geoResult.label !== 'Unknown location') {
            locationLabel = `📍 ${geoResult.label}`
          }
          console.log('[ApanamPage] Reverse geocoded:', locationLabel)
        } catch (geoErr) {
          console.warn('[ApanamPage] Reverse geocoding failed, using fallback label:', geoErr)
        }

        fromLocationText.value = locationLabel
        fromLocation.value = {
          label: locationLabel,
          value: 'current-location',
          isCurrentLocation: true,
          coords: [coords.lat, coords.lng],
          accuracy: coords.accuracy,
        }

        await nextTick()

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

    const clearFromLocation = () => {
      fromAutoDetect.value = false
      fromLocation.value = null
      fromLocationText.value = ''
    }

    const onFromInputFocus = () => {
      // When user focuses the input to edit, clear the auto-detect flag
      // so the next search uses the typed text instead of old GPS coords
      if (fromAutoDetect.value) {
        fromAutoDetect.value = false
      }
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
        // Prefer the admin-curated places collection — Nominatim often mis-resolves
        // local landmark names (e.g. "SM Baguio" → Session Road).
        await loadPlacesOnce()
        const placeHit = matchQueryToPlace(searchQuery)
        if (placeHit) {
          console.log('[ApanamPage] Matched query to place:', placeHit.name)
          fromLocation.value = {
            label: placeHit.name,
            value: `place-${placeHit.id}`,
            isCurrentLocation: false,
            coords: [placeHit.latitude, placeHit.longitude],
            placeId: placeHit.id,
          }
          fromLocationText.value = placeHit.name
          loadingNotify()
          await nextTick()
          $q.notify({
            message: `Location found: ${placeHit.name}`,
            icon: 'check_circle',
            color: 'positive',
            timeout: 2000,
            position: 'top',
          })
          return
        }

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

        // Start with places-collection entries (canonical coords from Firestore)
        let filtered = locationOptions.value.filter(
          (opt) => opt.value !== 'other' && opt.label.toLowerCase().includes(needle)
        )

        // If search query is long enough, also search geocoding API
        if (needle.length >= 3) {
          try {
            const geocodeResults = await searchLocations(val, true)

            // Add geocoded results (avoid duplicates)
            geocodeResults.forEach((geo) => {
              const isDuplicate = filtered.some((f) => f.label === geo.label)
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
        toLocationOptions.value =
          filtered.length > 0
            ? filtered
            : locationOptions.value.filter((opt) => opt.value !== 'other')
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

    const autoDetectFromOnStartup = async () => {
      if (!navigator.geolocation) return
      try {
        const coords = await getCurrentLocation()
        let locationLabel = '📍 Your Current Location'
        try {
          const geoResult = await reverseGeocode(coords.lat, coords.lng)
          if (geoResult && geoResult.label && geoResult.label !== 'Unknown location') {
            locationLabel = `📍 ${geoResult.label}`
          }
        } catch (geoErr) {
          console.warn('[ApanamPage] Startup reverse geocode failed:', geoErr)
        }

        fromLocationText.value = locationLabel
        fromLocation.value = {
          label: locationLabel,
          value: 'current-location',
          isCurrentLocation: true,
          coords: [coords.lat, coords.lng],
          accuracy: coords.accuracy,
        }
        fromAutoDetect.value = true
      } catch (err) {
        // Fail silently — user can still type a location manually.
        console.warn('[ApanamPage] Startup geolocation skipped:', err?.message || err)
      }
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchJeepneyOptions()
      await loadLocationOptions()
      loadFavoriteRoutes()

      // Auto-fill FROM with the user's current location on startup, unless a
      // FROM was already supplied via query params (e.g. from the home page).
      // When only the destination was passed in (toName without fromName), we
      // still detect so the route search can run end-to-end automatically.
      if (!route.query.fromName) {
        await autoDetectFromOnStartup()
      }

      // Handle query parameters from IndexPage (hero section inputs)
      if (route.query.toName) {
        const toLabel = route.query.toName
        const toCoords = [parseFloat(route.query.toLat), parseFloat(route.query.toLng)]
        toLocation.value = {
          label: toLabel,
          value: 'custom-from-query',
          coords: toCoords,
        }

        if (route.query.fromName) {
          const fromLabel = route.query.fromName
          const hasFromCoords =
            route.query.fromLat &&
            route.query.fromLng &&
            !Number.isNaN(parseFloat(route.query.fromLat)) &&
            !Number.isNaN(parseFloat(route.query.fromLng))

          if (hasFromCoords) {
            const fromCoords = [parseFloat(route.query.fromLat), parseFloat(route.query.fromLng)]
            fromLocationText.value = fromLabel
            fromLocation.value = {
              label: fromLabel,
              value: 'current-location',
              isCurrentLocation: true,
              coords: fromCoords,
            }
            fromAutoDetect.value = true
          } else {
            fromLocationText.value = fromLabel
          }
        }

        // Scroll to the navigation form right away so the user sees their TO input
        nextTick(() => {
          const navSection = document.querySelector('.navigation-section')
          if (navSection) {
            navSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })

        // Auto-trigger route search once data is ready
        setTimeout(() => {
          if (fromLocation.value?.coords && toLocation.value?.coords) {
            findRoutes()
          } else if (fromLocationText.value && toLocation.value?.coords) {
            searchFromLocation().then(() => {
              setTimeout(() => {
                if (fromLocation.value?.coords) findRoutes()
              }, 300)
            })
          }
        }, 800)
      }
    })

    onUnmounted(() => {
      if (routeMap.value) {
        routeMap.value.remove()
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
      heroImageUrl,
      locationOptions,
      toLocationOptions,
      routeOptions,
      walkingRoute,
      walkingRouteToDest,
      optionsSection,
      selectedFromLocation,
      selectedToLocation,
      favoriteRoutes,
      jeepneyAvailability,
      travelTimeEstimate,
      findRoutes,
      selectOption,
      toggleFavoriteRoute,
      isFavoriteRoute,
      resetSelection,
      onFromLocationChange,
      onToLocationChange,
      enableFromAutoDetect,
      clearFromLocation,
      onFromInputFocus,
      searchFromLocation,
      filterToLocations,
      isScrolled,
      onScroll,
      formatDistance,
      formatDuration,
    }
  },
})
</script>

<style lang="scss" scoped>
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

// Card vars
$bento-radius: 18px;
$bento-shadow: 0 6px 18px rgba(20, 36, 26, 0.06);
$bento-shadow-hover: 0 14px 30px rgba(20, 36, 26, 0.12);

.apanam-page {
  background: $white !important;
  min-height: 100vh;
}

/* Floating navbar (kept) */
.transition-all {
  transition: all 0.3s ease;
}

.floating-nav {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  color: $ink !important;
  box-shadow: 0 4px 30px rgba(20, 36, 26, 0.1);
  width: calc(100% - 32px);
  left: 16px;
  right: 16px;
  border-radius: 16px;
  margin-top: 16px;
}

/* HERO — rounded card mountain backdrop */
.apanam-hero {
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

/* Section eyebrow — shared header */
.section-eyebrow {
  margin-bottom: 2.25rem;

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
  margin: 0 0 0.5rem;
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

/* Navigation section */
.navigation-section {
  padding: 4rem 0;
  background: $white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.info-section {
  padding: 1.5rem 0;
}

.how-it-works-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.35rem;
  font-weight: 600;
  color: $ink;
  margin: 0 0 1.25rem;
  letter-spacing: -0.005em;
}

.how-it-works-list {
  :deep(.q-item) {
    padding: 0.5rem 0;
  }

  :deep(.q-avatar) {
    background: $primary-green !important;
    color: $white !important;
  }

  :deep(.q-item__label) {
    color: $ink;
    font-size: 0.95rem;
  }
}

.frosted-glass-card {
  background: $white;
  border: 1px solid $border;
  border-radius: 20px;
  padding: 1.75rem;
  width: 100%;
  max-width: 520px;
  margin-left: auto;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(20, 36, 26, 0.06);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 36px rgba(20, 36, 26, 0.1);
    border-color: rgba($primary-green, 0.25);
  }

  @media (max-width: 1023px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
  }
}

.form-card-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: $ink;
  margin: 0 0 1.25rem;
  letter-spacing: -0.005em;
}

.input-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: $primary-green;
  margin-bottom: 0.4rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.input-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;

  .input-label {
    margin-bottom: 0;
  }
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    min-height: 48px;
    background: $white;
    transition: all 0.25s ease;
    border: 1px solid $border;

    &:hover {
      border-color: rgba($primary-green, 0.4);
    }

    &.q-field--focused {
      border-color: $primary-green;
      box-shadow: 0 0 0 3px rgba($primary-green, 0.12);
    }
  }

  :deep(.q-field__native) {
    font-size: 0.9rem;
    color: $ink;
  }

  :deep(.q-field__label) {
    color: $muted;
  }
}

/* Quasar primary button override on this page */
:deep(.q-btn.bg-primary),
:deep(.q-btn--standard.text-white.bg-primary) {
  background: $primary-green !important;
  color: $white !important;
}

.options-section {
  background: $white;
  padding: 4rem 0;
  border-top: 1px solid $border;
}

/* Route Map Container */
.route-map-container {
  max-width: 1000px;
  margin: 0 auto;
}

.map-card {
  border-radius: $bento-radius;
  overflow: hidden;
  box-shadow: $bento-shadow;
  background: $white;
  border: 1px solid $border;
}

#route-map {
  border-radius: 0;
  z-index: 1;
}

/* Route directions under the map */
.route-directions {
  .direction-step {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;

    &:not(:last-child) {
      border-bottom: 1px solid $border;
    }
  }
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
  background: $mint-bg;
  padding: 16px;
  border-radius: 14px;
  border-left: 4px solid $primary-green;
}

.route-info .info-label {
  font-size: 0.74rem;
  color: $primary-green;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.route-info .info-value {
  font-size: 0.92rem;
  color: $ink;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

/* Card style for route options & summaries */
.bento-card {
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

.mb-0 {
  margin-bottom: 0 !important;
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

/* Loading Section Styles */
.loading-section {
  background: $white;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.loading-section .q-chip {
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 999px;
}

/* Route Summary Cards */
.route-summary-card {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border-radius: $bento-radius;
  overflow: hidden;
  border: 1px solid transparent;
}

.route-summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(20, 36, 26, 0.14);
}

/* Route Option Cards */
.route-option-card {
  transition: all 0.3s ease;
  border: 1px solid $border;
  border-radius: $bento-radius;
  overflow: hidden;
}

.route-option-card:hover {
  transform: translateY(-4px);
  box-shadow: $bento-shadow-hover;
  cursor: pointer;
}

.route-option-card.single-ride:hover {
  border-color: $primary-green;
}

.route-option-card.double-ride:hover {
  border-color: $sage;
}

/* Ride Type Badge */
.ride-type-badge {
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.02em;
}

/* Jeepney Name */
.jeepney-name {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: $ink !important;
  line-height: 1.3;
  letter-spacing: -0.005em;
}

/* Route Details */
.route-details {
  margin-top: 8px;
}

.route-detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.88rem;
  color: $muted;
}

.double-ride-details .route-detail-item {
  margin-bottom: 6px;
}

/* Fare and Duration Badges */
.fare-badge .q-badge {
  font-size: 1rem;
  padding: 6px 12px;
  border-radius: 999px;
}

.duration-badge .q-badge {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 999px;
}

/* Options Grid */
.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

@media (max-width: 1023px) {
  .navigation-section {
    padding: 3rem 0;
  }

  .options-section {
    padding: 3rem 0;
  }

  .route-map-container {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .apanam-hero {
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

  .options-grid {
    grid-template-columns: 1fr;
  }

  .route-summary-card {
    margin-bottom: 12px;
  }

  .navigation-section {
    padding: 2.5rem 0;
  }

  .container {
    padding: 0 1.25rem;
  }

  #route-map {
    height: 300px !important;
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

  .hero-tag {
    font-size: 0.7rem;
    padding: 5px 12px;
  }

  .frosted-glass-card {
    padding: 1.25rem;
    border-radius: 16px;
  }

  .jeepney-name {
    font-size: 0.95rem;
  }

  .fare-badge .q-badge {
    font-size: 0.9rem;
    padding: 4px 10px;
  }
}
</style>
