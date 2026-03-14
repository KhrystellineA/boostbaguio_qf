<template>
  <q-card class="route-form-dialog">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ editMode ? 'Edit Jeepney Route' : 'Add New Jeepney Route' }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form @submit="submitForm" class="q-gutter-md">
        <!-- Basic Information Section -->
        <div class="text-subtitle2 text-primary q-mb-md">
          <q-icon name="info" class="q-mr-xs" />
          Basic Information
        </div>

        <div class="row q-col-gutter-md">
          <!-- Jeepney Name -->
          <div class="col-12">
            <q-input
              v-model="form.jeepName"
              label="Jeepney Name *"
              outlined
              :rules="[(val) => !!val || 'Jeepney name is required']"
              hint="e.g., Tuba A, Market-SM Jeep"
            />
          </div>

          <!-- Terminal Location -->
          <div class="col-12">
            <q-input
              v-model="form.terminalLocation"
              label="Terminal Location *"
              outlined
              :rules="[(val) => !!val || 'Terminal location is required']"
              hint="Full address of the terminal"
            >
              <template #append>
                <q-btn flat dense icon="my_location" color="primary" @click="useCurrentLocation">
                  <q-tooltip>Use Current Location</q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>

          <!-- Terminal Coordinates -->
          <div class="col-6">
            <q-input
              v-model.number="form.terminalLat"
              label="Terminal Latitude *"
              type="number"
              outlined
              dense
              step="0.000001"
              :rules="[(val) => !!val || 'Required']"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.terminalLng"
              label="Terminal Longitude *"
              type="number"
              outlined
              dense
              step="0.000001"
              :rules="[(val) => !!val || 'Required']"
            />
          </div>

          <!-- End Point -->
          <div class="col-12">
            <q-input
              v-model="form.endPoint"
              label="End Point *"
              outlined
              :rules="[(val) => !!val || 'End point is required']"
              hint="Final destination name (must exist in places collection)"
            />
          </div>

          <!-- Tourist Spots Serviced -->
          <div class="col-12">
            <q-select
              v-model="form.touristSpotsServiced"
              label="Tourist Spots Serviced"
              :options="touristSpotsOptions"
              multiple
              use-chips
              use-input
              input-debounce="300"
              outlined
              hint="Select tourist spots this jeepney services (optional)"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-checkbox :model-value="scope.selected" size="sm" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Fare Information Section -->
        <div class="text-subtitle2 text-primary q-mb-md">
          <q-icon name="money" class="q-mr-xs" />
          Fare Information
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input
              v-model.number="form.fareRegular"
              label="Regular Fare (₱) *"
              type="number"
              outlined
              :rules="[
                (val) => (val !== undefined && val !== null) || 'Required',
                (val) => val >= 0 || 'Must be 0 or higher',
              ]"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.fareStudent"
              label="Student Fare (₱) *"
              type="number"
              outlined
              :rules="[
                (val) => (val !== undefined && val !== null) || 'Required',
                (val) => val >= 0 || 'Must be 0 or higher',
              ]"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.fareSenior"
              label="Senior Citizen Fare (₱) *"
              type="number"
              outlined
              :rules="[
                (val) => (val !== undefined && val !== null) || 'Required',
                (val) => val >= 0 || 'Must be 0 or higher',
              ]"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form.farePWD"
              label="PWD Fare (₱) *"
              type="number"
              outlined
              :rules="[
                (val) => (val !== undefined && val !== null) || 'Required',
                (val) => val >= 0 || 'Must be 0 or higher',
              ]"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Operating Hours Section -->
        <div class="text-subtitle2 text-primary q-mb-md">
          <q-icon name="schedule" class="q-mr-xs" />
          Operating Hours
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-input v-model="form.operatingHours.open" label="Opening Time" type="time" outlined />
          </div>
          <div class="col-6">
            <q-input
              v-model="form.operatingHours.close"
              label="Closing Time"
              type="time"
              outlined
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Route Generation Section -->
        <div class="text-subtitle2 text-primary q-mb-md">
          <q-icon name="route" class="q-mr-xs" />
          Route Generation
        </div>

        <!-- Route Generation Controls -->
        <div class="route-generation-controls q-mb-md">
          <q-banner
            v-if="!form.terminalLat || !form.terminalLng || !form.endPoint"
            class="bg-warning text-white"
          >
            <template #avatar>
              <q-icon name="warning" color="white" />
            </template>
            Please fill in Terminal Latitude, Terminal Longitude, and End Point before generating
            route.
          </q-banner>

          <div v-else class="row q-gutter-sm">
            <q-btn
              unelevated
              color="primary"
              label="Generate Route"
              icon="auto_fix_high"
              :loading="generatingRoute"
              :disable="generatingRoute"
              @click="generateRoute"
            />
            <q-btn
              v-if="generatedRoute && !routeConfirmed"
              outline
              color="negative"
              label="Regenerate"
              icon="refresh"
              :loading="generatingRoute"
              @click="generateRoute"
            />
          </div>

          <!-- Generation Status -->
          <q-banner
            v-if="generationStatus"
            :class="
              generationStatus.type === 'error' ? 'bg-negative text-white' : 'bg-info text-white'
            "
            class="q-mt-md"
            rounded
          >
            <template #avatar>
              <q-icon :name="generationStatus.type === 'error' ? 'error' : 'info'" color="white" />
            </template>
            {{ generationStatus.message }}
          </q-banner>
        </div>

        <!-- Route Preview Map -->
        <div v-if="generatedRoute && !routeConfirmed" class="route-preview-section q-mb-md">
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="map" class="q-mr-xs" />
            Route Preview
            <q-badge v-if="generatedRoute.distance" color="primary" class="q-ml-sm">
              {{ formatDistance(generatedRoute.distance) }}
            </q-badge>
            <q-badge v-if="generatedRoute.duration" color="secondary" class="q-ml-xs">
              {{ formatDuration(generatedRoute.duration) }}
            </q-badge>
          </div>

          <RouteMap
            :route-points="generatedRoute.coordinates"
            :waypoints="generatedRoute.waypoints"
            :distance="generatedRoute.distance"
            :duration="generatedRoute.duration"
            height="400px"
            :show-controls="true"
            :show-waypoints-info="true"
            :show-stats="false"
          />

          <q-banner
            v-if="generatedRoute.unmatchedSpots && generatedRoute.unmatchedSpots.length > 0"
            class="bg-warning q-mt-md"
            rounded
          >
            <template #avatar>
              <q-icon name="warning" color="warning" />
            </template>
            <strong>Warning:</strong> Could not find coordinates for:
            {{ generatedRoute.unmatchedSpots.join(', ') }}. These spots will be skipped. Please add
            them to the places collection.
          </q-banner>
        </div>

        <!-- Saved Route Display -->
        <div
          v-if="routeConfirmed && form.routeCoordinates && form.routeCoordinates.length > 0"
          class="saved-route-section q-mb-md"
        >
          <div class="text-subtitle2 q-mb-sm">
            <q-icon name="check_circle" color="positive" class="q-mr-xs" />
            Route Saved
            <q-badge v-if="generatedRoute?.distance" color="positive" class="q-ml-sm">
              {{ formatDistance(generatedRoute.distance) }}
            </q-badge>
          </div>
          <RouteMap
            :route-coordinates="form.routeCoordinates"
            :waypoints="generatedRoute?.waypoints"
            :distance="generatedRoute?.distance"
            :duration="generatedRoute?.duration"
            height="300px"
            :show-controls="true"
            :show-waypoints-info="false"
          />
        </div>

        <q-separator class="q-my-md" />

        <!-- Action Buttons -->
        <div class="row q-mt-md">
          <q-space />
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            v-if="generatedRoute && !routeConfirmed"
            unelevated
            label="Confirm & Save Route"
            color="primary"
            icon="check"
            @click="confirmRoute"
            :loading="saving"
          />
          <q-btn
            unelevated
            :label="editMode ? 'Update' : 'Create'"
            color="primary"
            type="submit"
            :loading="saving"
            :disable="generatingRoute"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import RouteMap from 'src/components/RouteMap.vue'
import { useRouteGeneration } from 'src/composables/useRouteGeneration'
import { useFirestore } from 'src/composables/useFirebase'
import { collection, getDocs } from 'firebase/firestore'

export default defineComponent({
  name: 'RouteFormDialog',

  components: {
    RouteMap,
  },

  props: {
    routeData: {
      type: Object,
      default: null,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const { generateRoute: generateRouteFromComposable } = useRouteGeneration()
    const { db } = useFirestore()

    const saving = ref(false)
    const generatingRoute = ref(false)
    const routeConfirmed = ref(false)
    const generationStatus = ref(null)
    const generatedRoute = ref(null)
    const touristSpotsOptions = ref([])

    // Form data
    const form = ref({
      jeepName: '',
      terminalLocation: '',
      terminalLat: null,
      terminalLng: null,
      endPoint: '',
      touristSpotsServiced: [],
      fareRegular: 0,
      fareStudent: 0,
      fareSenior: 0,
      farePWD: 0,
      operatingHours: {
        open: '',
        close: '',
      },
      imageUrl: '',
      imagePublicId: '',
      routeCoordinates: [],
    })

    // Load tourist spots options on mount
    onMounted(async () => {
      await loadTouristSpots()
    })

    /**
     * Load tourist spots from places collection
     */
    const loadTouristSpots = async () => {
      try {
        const placesRef = collection(db, 'places')
        const querySnapshot = await getDocs(placesRef)

        const spots = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((place) => place.category === 'tourist_spot')
          .map((place) => place.name)

        touristSpotsOptions.value = spots.sort()
        console.log('[RouteFormDialog] Loaded', spots.length, 'tourist spots')
      } catch (error) {
        console.error('[RouteFormDialog] Error loading tourist spots:', error)
      }
    }

    // Watch for route data changes
    watch(
      () => props.routeData,
      (newData) => {
        if (newData) {
          form.value = {
            jeepName: newData.jeepName || '',
            terminalLocation: newData.terminalLocation || '',
            terminalLat: newData.terminalLat || null,
            terminalLng: newData.terminalLng || null,
            endPoint: newData.endPoint || '',
            touristSpotsServiced: newData.touristSpotsServiced || [],
            fareRegular: newData.fareRegular || 0,
            fareStudent: newData.fareStudent || 0,
            fareSenior: newData.fareSenior || 0,
            farePWD: newData.farePWD || 0,
            operatingHours: {
              open: newData.operatingHours?.open || '',
              close: newData.operatingHours?.close || '',
            },
            imageUrl: newData.imageUrl || '',
            imagePublicId: newData.imagePublicId || '',
            routeCoordinates: newData.routeCoordinates || newData.routePoints || [],
          }

          // If route coordinates exist, mark as confirmed
          if (newData.routeCoordinates && newData.routeCoordinates.length > 0) {
            routeConfirmed.value = true
            generatedRoute.value = {
              coordinates: newData.routeCoordinates,
              waypoints: buildWaypointsFromFormData(newData),
              distance: newData.routeDistance || 0,
              duration: newData.routeDuration || 0,
              matchedSpots: newData.touristSpotsServiced || [],
              unmatchedSpots: [],
            }
          } else {
            routeConfirmed.value = false
            generatedRoute.value = null
          }
        } else {
          resetForm()
        }
      },
      { immediate: true }
    )

    /**
     * Build waypoints from form data for display
     */
    const buildWaypointsFromFormData = (data) => {
      const waypoints = []

      // Add terminal
      if (data.terminalLat && data.terminalLng) {
        waypoints.push({
          name: 'Terminal',
          latitude: data.terminalLat,
          longitude: data.terminalLng,
        })
      }

      // Note: We can't get exact coordinates for tourist spots without fuzzy matching
      // This is just for display purposes
      if (data.touristSpotsServiced && data.touristSpotsServiced.length > 0) {
        data.touristSpotsServiced.forEach((spot) => {
          waypoints.push({
            name: spot,
            latitude: 0,
            longitude: 0,
          })
        })
      }

      // Add end point
      if (data.endPoint) {
        waypoints.push({
          name: data.endPoint,
          latitude: 0,
          longitude: 0,
        })
      }

      return waypoints
    }

    // Reset form
    const resetForm = () => {
      form.value = {
        jeepName: '',
        terminalLocation: '',
        terminalLat: null,
        terminalLng: null,
        endPoint: '',
        touristSpotsServiced: [],
        fareRegular: 0,
        fareStudent: 0,
        fareSenior: 0,
        farePWD: 0,
        operatingHours: {
          open: '',
          close: '',
        },
        imageUrl: '',
        imagePublicId: '',
        routeCoordinates: [],
      }
      routeConfirmed.value = false
      generatedRoute.value = null
      generationStatus.value = null
    }

    /**
     * Use current location for terminal coordinates
     */
    const useCurrentLocation = () => {
      if (!navigator.geolocation) {
        $q.notify({
          type: 'negative',
          message: 'Geolocation is not supported by your browser',
          position: 'top',
        })
        return
      }

      $q.loading.show({ message: 'Getting your location...' })

      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.value.terminalLat = position.coords.latitude
          form.value.terminalLng = position.coords.longitude

          $q.notify({
            type: 'positive',
            message: 'Location acquired!',
            position: 'top',
          })
        },
        (error) => {
          console.error('[RouteFormDialog] Geolocation error:', error)
          $q.notify({
            type: 'negative',
            message: 'Unable to get your location',
            position: 'top',
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )

      $q.loading.hide()
    }

    /**
     * Generate route using OSRM
     */
    const generateRoute = async () => {
      // Validate required fields
      if (!form.value.terminalLat || !form.value.terminalLng) {
        generationStatus.value = {
          type: 'error',
          message: 'Please provide terminal coordinates (latitude and longitude)',
        }
        return
      }

      if (!form.value.endPoint) {
        generationStatus.value = {
          type: 'error',
          message: 'Please provide an end point',
        }
        return
      }

      generatingRoute.value = true
      generationStatus.value = {
        type: 'info',
        message: 'Generating route... This may take a few seconds.',
      }
      generatedRoute.value = null
      routeConfirmed.value = false

      try {
        // Prepare jeepney data for route generation
        const jeepneyData = {
          terminalLat: form.value.terminalLat,
          terminalLng: form.value.terminalLng,
          endPoint: form.value.endPoint,
          touristSpotsServiced: form.value.touristSpotsServiced,
        }

        // Generate route using composable
        const result = await generateRouteFromComposable(jeepneyData)

        // Store generated route
        generatedRoute.value = {
          coordinates: result.coordinates,
          distance: result.distance,
          duration: result.duration,
          waypoints: result.waypoints,
          matchedSpots: result.matchedSpots,
          unmatchedSpots: result.unmatchedSpots,
        }

        generationStatus.value = {
          type: 'success',
          message: `Route generated successfully! ${formatDistance(result.distance)} • ${formatDuration(result.duration)}`,
        }

        $q.notify({
          type: 'positive',
          message: 'Route generated! Please review and confirm.',
          position: 'top',
          icon: 'route',
        })
      } catch (error) {
        console.error('[RouteFormDialog] Route generation error:', error)
        generationStatus.value = {
          type: 'error',
          message: error.message || 'Failed to generate route',
        }

        $q.notify({
          type: 'negative',
          message: 'Route generation failed: ' + error.message,
          position: 'top',
          timeout: 5000,
        })
      } finally {
        generatingRoute.value = false
      }
    }

    /**
     * Confirm the generated route
     */
    const confirmRoute = () => {
      if (!generatedRoute.value) return

      // Save coordinates to form
      form.value.routeCoordinates = generatedRoute.value.coordinates
      form.value.routeDistance = generatedRoute.value.distance
      form.value.routeDuration = generatedRoute.value.duration

      routeConfirmed.value = true

      $q.notify({
        type: 'positive',
        message: 'Route confirmed! Click Create/Update to save.',
        position: 'top',
      })
    }

    /**
     * Format distance for display
     */
    const formatDistance = (meters) => {
      if (!meters) return ''
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`
      }
      return `${Math.round(meters)} m`
    }

    /**
     * Format duration for display
     */
    const formatDuration = (seconds) => {
      if (!seconds) return ''
      const minutes = Math.round(seconds / 60)
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
      }
      return `${minutes} min`
    }

    // Submit form
    const submitForm = () => {
      // Validate route points if route was generated
      if (generatedRoute.value && !routeConfirmed.value) {
        $q.notify({
          type: 'warning',
          message: 'Please confirm the generated route before saving',
          position: 'top',
        })
        return
      }

      emit('save', form.value)
    }

    return {
      form,
      saving,
      generatingRoute,
      routeConfirmed,
      generationStatus,
      generatedRoute,
      touristSpotsOptions,
      useCurrentLocation,
      generateRoute,
      confirmRoute,
      formatDistance,
      formatDuration,
      submitForm,
    }
  },
})
</script>

<style lang="scss" scoped>
.route-form-dialog {
  max-height: 90vh;
  overflow-y: auto;
}

.route-generation-controls {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.route-preview-section,
.saved-route-section {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
</style>
