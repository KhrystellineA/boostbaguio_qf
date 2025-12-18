<template>
  <div class="routes-management">
    <div class="management-header">
      <h4 class="text-pine-green q-my-none">Routes Management</h4>
      <q-btn
        label="Add New Route"
        icon="add"
        style="background: #2d6a4f; color: white"
        unelevated
        @click="showDialog = true"
      />
    </div>

    <q-card class="q-mt-md">
      <q-card-section>
        <!-- Conflict Warning Banner -->
        <q-banner 
          v-if="detectedConflicts.length > 0" 
          class="bg-warning text-white q-mb-md"
        >
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>
          <div class="text-weight-bold">
            {{ detectedConflicts.length }} route conflict(s) detected
          </div>
          <div class="q-mt-xs">
            <q-chip 
              v-for="(conflict, index) in detectedConflicts" 
              :key="index"
              dense
              color="white"
              text-color="dark"
              class="q-mr-xs"
            >
              {{ conflict.message }}
            </q-chip>
          </div>
          <template v-slot:action>
            <q-btn 
              flat 
              color="white" 
              label="Review Conflicts" 
              @click="showConflictDialog = true" 
            />
          </template>
        </q-banner>

        <q-input
          v-model="searchFilter"
          outlined
          placeholder="Search routes..."
          dense
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredRoutes"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template v-slot:body-cell-imageUrl="props">
            <q-td :props="props">
              <q-avatar v-if="props.row.imageUrl" square size="50px">
                <img :src="props.row.imageUrl" />
              </q-avatar>
              <q-icon v-else name="directions_bus" size="md" color="grey-5" />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="edit" color="primary" @click="editRoute(props.row)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="deleteRoute(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Conflict Resolution Dialog -->
    <q-dialog v-model="showConflictDialog" persistent>
      <q-card style="min-width: 800px; max-width: 900px">
        <q-card-section class="bg-warning text-white">
          <div class="text-h6">
            <q-icon name="warning" class="q-mr-sm" />
            Resolve Route Conflicts
          </div>
          <div class="text-caption">
            Review conflicts before saving this route
          </div>
        </q-card-section>

        <q-card-section style="max-height: 70vh; overflow-y: auto">
          <div v-for="(conflict, index) in detectedConflicts" :key="index" class="q-mb-lg">
            <q-banner 
              :class="conflict.severity === 'high' ? 'bg-red-1' : 'bg-orange-1'"
              class="q-mb-sm"
            >
              <template v-slot:avatar>
                <q-icon 
                  :name="conflict.severity === 'high' ? 'error' : 'warning'" 
                  :color="conflict.severity === 'high' ? 'negative' : 'orange'" 
                />
              </template>
              <div class="text-weight-bold">{{ conflict.message }}</div>
              <div class="text-caption">Type: {{ conflict.type }}</div>
            </q-banner>

            <div class="row q-col-gutter-md">
              <!-- Existing Route -->
              <div class="col-6">
                <q-card flat bordered class="bg-grey-2">
                  <q-card-section>
                    <div class="text-caption text-grey-7 q-mb-xs">EXISTING ROUTE</div>
                    <div class="text-h6 text-weight-bold">{{ conflict.existing.routeName }}</div>
                    <div class="text-body2 q-mt-xs">
                      {{ conflict.existing.startingPoint }} → {{ conflict.existing.destination }}
                    </div>
                    <q-separator class="q-my-sm" />
                    <div class="text-body2">
                      <div><strong>Terminal:</strong> {{ conflict.existing.terminalLocation }}</div>
                      <div><strong>Regular Fare:</strong> ₱{{ conflict.existing.regularFare }}</div>
                    </div>
                  </q-card-section>
                  <q-card-section v-if="conflict.existing.imageUrl" class="q-pt-none">
                    <q-img :src="conflict.existing.imageUrl" style="max-height: 120px; border-radius: 8px" />
                  </q-card-section>
                </q-card>
              </div>

              <!-- New Route -->
              <div class="col-6">
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section>
                    <div class="text-caption text-grey-7 q-mb-xs">NEW ROUTE (Pending)</div>
                    <div class="text-h6 text-weight-bold">{{ conflict.new.routeName }}</div>
                    <div class="text-body2 q-mt-xs">
                      {{ conflict.new.startingPoint }} → {{ conflict.new.destination }}
                    </div>
                    <q-separator class="q-my-sm" />
                    <div class="text-body2">
                      <div><strong>Terminal:</strong> {{ conflict.new.terminalLocation }}</div>
                      <div><strong>Regular Fare:</strong> ₱{{ conflict.new.regularFare }}</div>
                    </div>
                  </q-card-section>
                  <q-card-section v-if="imagePreview" class="q-pt-none">
                    <q-img :src="imagePreview" style="max-height: 120px; border-radius: 8px" />
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Resolution Actions -->
            <div class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-sm">Choose an action:</div>
              <q-btn-group unelevated spread>
                <q-btn 
                  label="Keep Both" 
                  color="primary"
                  icon="done_all"
                  @click="resolveConflict(conflict, 'keep-both')"
                  no-caps
                >
                  <q-tooltip>Save both routes as separate entries</q-tooltip>
                </q-btn>
                <q-btn 
                  label="Create Variant" 
                  color="orange"
                  icon="alt_route"
                  @click="resolveConflict(conflict, 'variant')"
                  no-caps
                >
                  <q-tooltip>Save as Express/Regular variant</q-tooltip>
                </q-btn>
                <q-btn 
                  label="Replace" 
                  color="negative"
                  icon="swap_horiz"
                  @click="resolveConflict(conflict, 'replace')"
                  no-caps
                >
                  <q-tooltip>Delete existing and save new route</q-tooltip>
                </q-btn>
                <q-btn 
                  label="Cancel New" 
                  color="grey"
                  icon="cancel"
                  @click="resolveConflict(conflict, 'cancel')"
                  flat
                  no-caps
                >
                  <q-tooltip>Discard the new route</q-tooltip>
                </q-btn>
              </q-btn-group>
            </div>

            <q-separator class="q-mt-lg" v-if="index < detectedConflicts.length - 1" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn 
            flat 
            label="Cancel All" 
            color="grey-7" 
            @click="cancelAllConflicts" 
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Variant Dialog -->
    <q-dialog v-model="showVariantDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Create Route Variant</div>
        </q-card-section>

        <q-card-section>
          <div class="text-body1 q-mb-md">
            Choose how to differentiate this route:
          </div>
          <q-option-group
            v-model="variantType"
            :options="variantOptions"
            color="primary"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup no-caps />
          <q-btn 
            unelevated 
            label="Create Variant" 
            color="primary"
            @click="createVariant"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Main Form Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 700px; max-width: 900px">
        <q-card-section class="bg-pine-green text-white">
          <div class="text-h6">
            {{ editMode ? 'Edit Route' : 'Add New Route' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveRoute" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="routeForm.routeName"
                  label="Route Name *"
                  outlined
                  :rules="[(val) => !!val || 'Route name is required']"
                  hint="e.g., ROUTE 01, Market to Session Road"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="routeForm.startingPoint"
                  label="Starting Point *"
                  outlined
                  :rules="[(val) => !!val || 'Starting point is required']"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="routeForm.destination"
                  label="Destination *"
                  outlined
                  :rules="[(val) => !!val || 'Destination is required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="routeForm.terminalLocation"
                  label="Terminal Location *"
                  outlined
                  :rules="[(val) => !!val || 'Terminal location is required']"
                  hint="Full address of the terminal"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model.number="routeForm.regularFare"
                  label="Regular Fare *"
                  type="number"
                  outlined
                  prefix="₱"
                  :rules="[(val) => val >= 0 || 'Must be positive']"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model.number="routeForm.studentFare"
                  label="Student Fare *"
                  type="number"
                  outlined
                  prefix="₱"
                  :rules="[(val) => val >= 0 || 'Must be positive']"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model.number="routeForm.pwdSeniorFare"
                  label="PWD/Senior Fare *"
                  type="number"
                  outlined
                  prefix="₱"
                  :rules="[(val) => val >= 0 || 'Must be positive']"
                />
              </div>

              <!-- Terminal Coordinates with Search -->
              <div class="col-12">
                <div class="coordinate-section">
                  <div class="text-subtitle2 q-mb-sm">Terminal Coordinates</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.terminalLat"
                        label="Latitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.terminalLng"
                        label="Longitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-2">
                      <q-btn
                        icon="search"
                        color="primary"
                        unelevated
                        dense
                        @click="openMapPicker('terminal')"
                        style="width: 100%; height: 40px"
                      >
                        <q-tooltip>Search location</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Destination Coordinates with Search -->
              <div class="col-12">
                <div class="coordinate-section">
                  <div class="text-subtitle2 q-mb-sm">Destination Coordinates</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.destinationLat"
                        label="Latitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.destinationLng"
                        label="Longitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-2">
                      <q-btn
                        icon="search"
                        color="primary"
                        unelevated
                        dense
                        @click="openMapPicker('destination')"
                        style="width: 100%; height: 40px"
                      >
                        <q-tooltip>Search location</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image Upload -->
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Route Image</div>
                <q-file
                  v-model="routeForm.imageFile"
                  outlined
                  accept="image/jpeg,image/jpg,image/png"
                  max-file-size="5242880"
                  @rejected="onImageRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="image" />
                  </template>
                  <template v-slot:hint> Max file size: 5MB | Accepted formats: JPG, PNG only </template>
                </q-file>

                <div v-if="routeForm.imageUrl || imagePreview" class="q-mt-sm">
                  <q-img
                    :src="imagePreview || routeForm.imageUrl"
                    style="max-width: 200px; border-radius: 8px"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" flat color="grey-7" @click="closeDialog" />
          <q-btn
            label="Save Route"
            unelevated
            style="background: #2d6a4f; color: white"
            @click="saveRoute"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Map Picker Dialog with Search -->
    <q-dialog v-model="showMapPicker" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="map" />
          <div class="text-weight-bold q-ml-sm">
            Select {{ pickerMode === 'terminal' ? 'Terminal' : 'Destination' }} Location
          </div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeMapPicker" />
        </q-bar>

        <!-- Search Section -->
        <q-card-section class="q-pa-md bg-grey-1">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="locationSearch"
                outlined
                placeholder="Search for a location (e.g., 'Session Road' or 'SM City Baguio')"
                dense
                @keyup.enter="searchLocation"
                :loading="searching"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
                <template v-slot:append>
                  <q-btn 
                    v-if="locationSearch"
                    flat dense round icon="close" 
                    @click="locationSearch = ''"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-btn
                label="Search"
                icon="search"
                color="primary"
                unelevated
                class="full-width"
                :loading="searching"
                :disable="!locationSearch"
                @click="searchLocation"
                style="height: 40px"
              />
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="q-mt-md">
            <div class="text-caption text-grey-7 q-mb-xs">Search Results:</div>
            <q-list bordered separator>
              <q-item
                v-for="(result, index) in searchResults"
                :key="index"
                clickable
                v-ripple
                @click="selectSearchResult(result)"
                class="search-result-item"
              >
                <q-item-section avatar>
                  <q-icon name="place" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ result.display_name }}</q-item-label>
                  <q-item-label caption>{{ result.lat }}, {{ result.lon }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense round icon="my_location" color="primary">
                    <q-tooltip>Select this location</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- No Results -->
          <div v-if="searchAttempted && searchResults.length === 0" class="q-mt-md">
            <q-banner class="bg-grey-3">
              <template v-slot:avatar>
                <q-icon name="info" color="grey-7" />
              </template>
              No results found. Try a different search term or click on the map.
            </q-banner>
          </div>
        </q-card-section>

        <!-- Map Container -->
        <q-card-section class="q-pa-none" style="height: calc(100vh - 280px)">
          <div ref="mapPickerContainer" style="height: 100%; width: 100%"></div>
        </q-card-section>

        <!-- Footer Actions -->
        <q-card-actions align="between" class="q-pa-md bg-grey-1">
          <div class="col">
            <div class="text-caption text-grey-7">
              Search for a location above or click on the map
            </div>
            <div v-if="tempCoords" class="text-body2 q-mt-xs">
              <strong>Selected:</strong> 
              <span class="text-primary">
                {{ tempCoords.lat.toFixed(6) }}, {{ tempCoords.lng.toFixed(6) }}
              </span>
              <span v-if="selectedLocationName" class="q-ml-sm text-grey-7">
                ({{ selectedLocationName }})
              </span>
            </div>
          </div>
          <div class="col-auto">
            <q-btn label="Cancel" flat color="grey-7" @click="closeMapPicker" class="q-mr-sm" />
            <q-btn
              label="Confirm Location"
              unelevated
              color="primary"
              icon="check"
              @click="confirmMapSelection"
              :disable="!tempCoords"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'RoutesManagement',

  props: {
    openDialog: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['dialog-opened'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const routes = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const showDialog = ref(false)
    const editMode = ref(false)
    const searchFilter = ref('')
    const imagePreview = ref(null)

    const showConflictDialog = ref(false)
    const detectedConflicts = ref([])
    const pendingRoute = ref(null)
    const showVariantDialog = ref(false)
    const variantType = ref('express')
    const currentConflict = ref(null)

    const variantOptions = [
      { label: 'Express Route', value: 'express' },
      { label: 'Regular Route', value: 'regular' },
      { label: 'Via Market', value: 'via-market' },
      { label: 'Via Mall', value: 'via-mall' },
      { label: 'Alternative Route', value: 'alternative' },
    ]

    const showMapPicker = ref(false)
    const mapPickerContainer = ref(null)
    const pickerMode = ref('terminal')
    const tempCoords = ref(null)
    let mapPickerInstance = null
    let markerInstance = null

    const locationSearch = ref('')
    const searchResults = ref([])
    const searching = ref(false)
    const searchAttempted = ref(false)
    const selectedLocationName = ref('')

    const routeForm = ref({
      id: null,
      routeName: '',
      startingPoint: '',
      destination: '',
      terminalLocation: '',
      regularFare: 0,
      studentFare: 0,
      pwdSeniorFare: 0,
      terminalLat: 16.4109,
      terminalLng: 120.5964,
      destinationLat: 16.4145,
      destinationLng: 120.598,
      imageFile: null,
      imageUrl: null,
      createdAt: null,
    })

    const columns = [
      {
        name: 'imageUrl',
        label: 'Image',
        align: 'left',
        field: 'imageUrl',
      },
      {
        name: 'routeName',
        label: 'Route Name',
        align: 'left',
        field: 'routeName',
        sortable: true,
      },
      {
        name: 'route',
        label: 'Route',
        align: 'left',
        field: (row) => `${row.startingPoint} → ${row.destination}`,
        sortable: true,
      },
      {
        name: 'fare',
        label: 'Regular Fare',
        align: 'center',
        field: 'regularFare',
        format: (val) => `₱${val}`,
        sortable: true,
      },
      {
        name: 'actions',
        label: 'Actions',
        align: 'center',
      },
    ]

    const filteredRoutes = computed(() => {
      if (!searchFilter.value) return routes.value

      const search = searchFilter.value.toLowerCase()
      return routes.value.filter(
        (route) =>
          route.routeName?.toLowerCase().includes(search) ||
          route.startingPoint?.toLowerCase().includes(search) ||
          route.destination?.toLowerCase().includes(search)
      )
    })

    const fetchRoutes = async () => {
      loading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'routes'))
        routes.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('[Routes] Loaded:', routes.value.length)
      } catch (error) {
        console.error('[Routes] Error fetching:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load routes',
          position: 'top',
        })
      } finally {
        loading.value = false
      }
    }

    const searchLocation = async () => {
      if (!locationSearch.value.trim()) {
        $q.notify({
          type: 'warning',
          message: 'Please enter a location to search',
          position: 'top'
        })
        return
      }

      searching.value = true
      searchAttempted.value = true
      searchResults.value = []

      try {
        let searchQuery = locationSearch.value.trim()
        if (!searchQuery.toLowerCase().includes('baguio')) {
          searchQuery = `${searchQuery}, Baguio City, Philippines`
        }

        console.log('[Search] Searching for:', searchQuery)

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(searchQuery)}` +
          `&format=json` +
          `&limit=5` +
          `&addressdetails=1` +
          `&bounded=1` +
          `&viewbox=120.50,16.35,120.65,16.45`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'BaguioBoostPH/1.0'
            }
          }
        )

        if (!response.ok) {
          throw new Error('Search request failed')
        }

        const data = await response.json()
        console.log('[Search] Results:', data.length)

        searchResults.value = data

        if (data.length === 0) {
          $q.notify({
            type: 'info',
            message: 'No results found. Try a different search term.',
            position: 'top'
          })
        } else {
          $q.notify({
            type: 'positive',
            message: `Found ${data.length} result(s)`,
            position: 'top'
          })
        }
      } catch (error) {
        console.error('[Search] Error:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to search location. Please try again.',
          position: 'top'
        })
      } finally {
        searching.value = false
      }
    }

    const selectSearchResult = (result) => {
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      tempCoords.value = { lat, lng }
      selectedLocationName.value = result.display_name

      if (mapPickerInstance) {
        mapPickerInstance.setView([lat, lng], 16)

        if (markerInstance) {
          mapPickerInstance.removeLayer(markerInstance)
        }

        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="font-size: 32px">📍</div>',
          iconSize: [32, 32],
        })

        markerInstance = L.marker([lat, lng], { icon: markerIcon }).addTo(mapPickerInstance)
      }

      searchResults.value = []
      
      $q.notify({
        type: 'positive',
        message: 'Location selected',
        icon: 'place',
        position: 'top'
      })
    }

    const checkRouteConflicts = async (newRoute) => {
      const conflicts = []

      for (const existingRoute of routes.value) {
        if (editMode.value && existingRoute.id === routeForm.value.id) {
          continue
        }

        const existing = {
          ...existingRoute,
          terminalLat: existingRoute.terminalCoordinates?.[0] || existingRoute.originCoordinates?.[0],
          terminalLng: existingRoute.terminalCoordinates?.[1] || existingRoute.originCoordinates?.[1],
          destinationLat: existingRoute.destinationCoordinates?.[0],
          destinationLng: existingRoute.destinationCoordinates?.[1],
        }

        if (existing.routeName?.toLowerCase() === newRoute.routeName?.toLowerCase()) {
          conflicts.push({
            type: 'duplicate-name',
            message: `Duplicate route name found`,
            existing,
            new: newRoute,
            severity: 'high'
          })
          continue
        }

        const nameSimilarity = calculateSimilarity(existing.routeName || '', newRoute.routeName || '')
        if (nameSimilarity > 0.8) {
          conflicts.push({
            type: 'similar-name',
            message: `Similar route name: "${existing.routeName}" (${Math.round(nameSimilarity * 100)}% match)`,
            existing,
            new: newRoute,
            severity: 'medium'
          })
        }

        if (
          existing.startingPoint?.toLowerCase() === newRoute.startingPoint?.toLowerCase() &&
          existing.destination?.toLowerCase() === newRoute.destination?.toLowerCase()
        ) {
          conflicts.push({
            type: 'same-endpoints',
            message: `Route serves same endpoints: ${existing.startingPoint} → ${existing.destination}`,
            existing,
            new: newRoute,
            severity: 'high'
          })
        }

        if (existing.terminalLat && existing.terminalLng && newRoute.terminalLat && newRoute.terminalLng) {
          const distance = calculateDistance(
            existing.terminalLat,
            existing.terminalLng,
            newRoute.terminalLat,
            newRoute.terminalLng
          )

          if (distance < 0.1) {
            conflicts.push({
              type: 'same-terminal',
              message: `Same terminal location: ${Math.round(distance * 1000)}m from "${existing.routeName}"`,
              existing,
              new: newRoute,
              severity: 'medium'
            })
          }
        }

        if (existing.terminalLocation && newRoute.terminalLocation) {
          if (existing.terminalLocation.toLowerCase() === newRoute.terminalLocation.toLowerCase()) {
            conflicts.push({
              type: 'same-terminal-address',
              message: `Same terminal address as "${existing.routeName}"`,
              existing,
              new: newRoute,
              severity: 'medium'
            })
          }
        }
      }

      return conflicts
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371
      const dLat = deg2rad(lat2 - lat1)
      const dLon = deg2rad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180)
    }

    const calculateSimilarity = (str1, str2) => {
      const longer = str1.length > str2.length ? str1 : str2
      const shorter = str1.length > str2.length ? str2 : str1

      if (longer.length === 0) return 1.0

      const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase())
      return (longer.length - editDistance) / longer.length
    }

    const levenshteinDistance = (str1, str2) => {
      const matrix = []

      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
      }

      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
      }

      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }

      return matrix[str2.length][str1.length]
    }

    const resolveConflict = async (conflict, action) => {
      try {
        switch (action) {
          case 'keep-both':
            const routeWithSuffix = {
              ...conflict.new,
              routeName: `${conflict.new.routeName} (New)`
            }
            await saveRouteToDatabase(routeWithSuffix)
            removeConflict(conflict)
            break

          case 'variant':
            currentConflict.value = conflict
            showVariantDialog.value = true
            break

          case 'replace':
            if (conflict.existing.imageUrl) {
              await deleteImage(conflict.existing.imageUrl)
            }
            await deleteDoc(doc(db, 'routes', conflict.existing.id))
            await saveRouteToDatabase(conflict.new)
            removeConflict(conflict)
            break

          case 'cancel':
            removeConflict(conflict)
            break
        }
      } catch (error) {
        console.error('[Routes] Error resolving conflict:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to resolve conflict',
          position: 'top'
        })
      }
    }

    const createVariant = async () => {
      if (!currentConflict.value) return

      const variantName = `${currentConflict.value.new.routeName} (${variantType.value.replace('-', ' ')})`
      const routeWithVariant = {
        ...currentConflict.value.new,
        routeName: variantName
      }

      await saveRouteToDatabase(routeWithVariant)
      removeConflict(currentConflict.value)
      showVariantDialog.value = false
      currentConflict.value = null
    }

    const removeConflict = (conflict) => {
      const index = detectedConflicts.value.indexOf(conflict)
      if (index > -1) {
        detectedConflicts.value.splice(index, 1)
      }

      if (detectedConflicts.value.length === 0) {
        showConflictDialog.value = false
        pendingRoute.value = null
      }
    }

    const cancelAllConflicts = () => {
      detectedConflicts.value = []
      showConflictDialog.value = false
      pendingRoute.value = null
      showDialog.value = true
    }

    const uploadImage = async (file) => {
      try {
        const timestamp = Date.now()
        const fileName = `routes/${timestamp}_${file.name}`
        const imageRef = storageRef(storage, fileName)

        console.log('[Upload] Starting upload:', fileName)
        await uploadBytes(imageRef, file)
        const downloadURL = await getDownloadURL(imageRef)
        console.log('[Upload] Success:', downloadURL)

        return downloadURL
      } catch (error) {
        console.error('[Routes] Error uploading image:', error)
        throw error
      }
    }

    const deleteImage = async (imageUrl) => {
      if (!imageUrl) return

      try {
        const imageRef = storageRef(storage, imageUrl)
        await deleteObject(imageRef)
      } catch (error) {
        console.error('[Routes] Error deleting image:', error)
      }
    }

    const saveRoute = async () => {
      if (!routeForm.value.routeName || !routeForm.value.startingPoint || !routeForm.value.destination || !routeForm.value.terminalLocation) {
        $q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      if (detectedConflicts.value.length === 0) {
        const preparedRoute = {
          routeName: routeForm.value.routeName,
          startingPoint: routeForm.value.startingPoint,
          destination: routeForm.value.destination,
          terminalLocation: routeForm.value.terminalLocation,
          regularFare: routeForm.value.regularFare,
          studentFare: routeForm.value.studentFare,
          pwdSeniorFare: routeForm.value.pwdSeniorFare,
          terminalLat: routeForm.value.terminalLat,
          terminalLng: routeForm.value.terminalLng,
          destinationLat: routeForm.value.destinationLat,
          destinationLng: routeForm.value.destinationLng,
        }

        const conflicts = await checkRouteConflicts(preparedRoute)

        if (conflicts.length > 0) {
          detectedConflicts.value = conflicts
          pendingRoute.value = { ...routeForm.value }
          showConflictDialog.value = true
          showDialog.value = false
          return
        }
      }

      await saveRouteToDatabase(routeForm.value)
    }

    const saveRouteToDatabase = async (formData) => {
      saving.value = true
      try {
        console.log('[Save] Starting save process...')

        let imageUrl = null

        if (formData.imageFile) {
          console.log('[Save] New image file detected, uploading...')
          
          if (editMode.value && formData.imageUrl) {
            console.log('[Save] Deleting old image:', formData.imageUrl)
            try {
              await deleteImage(formData.imageUrl)
            } catch (error) {
              console.error('[Save] Error deleting old image:', error)
            }
          }
          
          try {
            imageUrl = await uploadImage(formData.imageFile)
            console.log('[Save] New image uploaded:', imageUrl)
          } catch (error) {
            console.error('[Save] Error uploading image:', error)
            throw new Error('Failed to upload image: ' + error.message)
          }
        } else if (editMode.value && formData.imageUrl) {
          imageUrl = formData.imageUrl
        }

        const routeData = {
          name: formData.routeName,
          routeName: formData.routeName,
          code: formData.routeName.toLowerCase().replace(/\s+/g, '-'),

          origin: formData.startingPoint,
          startingPoint: formData.startingPoint,
          destination: formData.destination,
          terminalLocation: formData.terminalLocation,
          description: `${formData.startingPoint} to ${formData.destination}`,

          fare: formData.regularFare,
          regularFare: formData.regularFare,
          studentFare: formData.studentFare,
          pwdSeniorFare: formData.pwdSeniorFare,

          originCoordinates: [formData.terminalLat, formData.terminalLng],
          terminalCoordinates: [formData.terminalLat, formData.terminalLng],
          destinationCoordinates: [formData.destinationLat, formData.destinationLng],

          routeCoordinates: [
            {
              lat: formData.terminalLat,
              lng: formData.terminalLng,
            },
            {
              lat: formData.destinationLat,
              lng: formData.destinationLng,
            },
          ],

          updatedAt: new Date().toISOString(),
        }

        if (imageUrl) {
          routeData.imageUrl = imageUrl
        }

        if (editMode.value) {
          routeData.createdAt = formData.createdAt || new Date().toISOString()
        } else {
          routeData.createdAt = new Date().toISOString()
        }

        if (editMode.value && formData.id) {
          await updateDoc(doc(db, 'routes', formData.id), routeData)
          $q.notify({
            type: 'positive',
            message: 'Route updated successfully',
            icon: 'check_circle',
            position: 'top',
          })
        } else {
          await addDoc(collection(db, 'routes'), routeData)
          $q.notify({
            type: 'positive',
            message: 'Route added successfully',
            icon: 'check_circle',
            position: 'top',
          })
        }

        await fetchRoutes()
        closeDialog()
        
        detectedConflicts.value = []
        showConflictDialog.value = false
        pendingRoute.value = null
      } catch (error) {
        console.error('[Routes] Error saving:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to save route: ' + error.message,
          position: 'top',
          timeout: 5000
        })
      } finally {
        saving.value = false
      }
    }

    const editRoute = (route) => {
      console.log('[Edit] Loading route for edit:', route)
      editMode.value = true
      routeForm.value = {
        id: route.id,
        routeName: route.routeName || '',
        startingPoint: route.startingPoint || '',
        destination: route.destination || '',
        terminalLocation: route.terminalLocation || '',
        regularFare: route.regularFare || 0,
        studentFare: route.studentFare || 0,
        pwdSeniorFare: route.pwdSeniorFare || 0,
        terminalLat: route.terminalCoordinates?.[0] || 16.4109,
        terminalLng: route.terminalCoordinates?.[1] || 120.5964,
        destinationLat: route.destinationCoordinates?.[0] || 16.4145,
        destinationLng: route.destinationCoordinates?.[1] || 120.598,
        imageFile: null,
        imageUrl: route.imageUrl || null,
        createdAt: route.createdAt || null,
      }
      showDialog.value = true
    }

    const deleteRoute = async (route) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${route.routeName}"? This action cannot be undone.`,
        cancel: true,
        persistent: true,
        ok: {
          label: 'Delete',
          color: 'negative',
          unelevated: true
        },
        cancel: {
          label: 'Cancel',
          flat: true
        }
      }).onOk(async () => {
        try {
          if (route.imageUrl) {
            await deleteImage(route.imageUrl)
          }

          await deleteDoc(doc(db, 'routes', route.id))

          $q.notify({
            type: 'positive',
            message: 'Route deleted successfully',
            icon: 'check_circle',
            position: 'top',
          })

          await fetchRoutes()
        } catch (error) {
          console.error('[Routes] Error deleting:', error)
          $q.notify({
            type: 'negative',
            message: 'Failed to delete route',
            position: 'top',
          })
        }
      })
    }

    const closeDialog = () => {
      showDialog.value = false
      editMode.value = false
      imagePreview.value = null
      routeForm.value = {
        id: null,
        routeName: '',
        startingPoint: '',
        destination: '',
        terminalLocation: '',
        regularFare: 0,
        studentFare: 0,
        pwdSeniorFare: 0,
        terminalLat: 16.4109,
        terminalLng: 120.5964,
        destinationLat: 16.4145,
        destinationLng: 120.598,
        imageFile: null,
        imageUrl: null,
        createdAt: null,
      }
    }

    const openMapPicker = (mode) => {
      pickerMode.value = mode
      tempCoords.value = null
      locationSearch.value = ''
      searchResults.value = []
      searchAttempted.value = false
      selectedLocationName.value = ''
      showMapPicker.value = true

      nextTick(() => {
        initMapPicker()
      })
    }

    const initMapPicker = () => {
      if (!mapPickerContainer.value) return

      const currentLat =
        pickerMode.value === 'terminal'
          ? routeForm.value.terminalLat
          : routeForm.value.destinationLat
      const currentLng =
        pickerMode.value === 'terminal'
          ? routeForm.value.terminalLng
          : routeForm.value.destinationLng

      if (mapPickerInstance) {
        mapPickerInstance.remove()
      }

      mapPickerInstance = L.map(mapPickerContainer.value).setView([currentLat, currentLng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapPickerInstance)

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="font-size: 32px">📍</div>',
        iconSize: [32, 32],
      })

      markerInstance = L.marker([currentLat, currentLng], { icon: markerIcon }).addTo(
        mapPickerInstance
      )
      tempCoords.value = { lat: currentLat, lng: currentLng }

      mapPickerInstance.on('click', (e) => {
        const { lat, lng } = e.latlng
        tempCoords.value = { lat, lng }
        selectedLocationName.value = 'Manual selection'

        if (markerInstance) {
          mapPickerInstance.removeLayer(markerInstance)
        }

        markerInstance = L.marker([lat, lng], { icon: markerIcon }).addTo(mapPickerInstance)

        $q.notify({
          type: 'info',
          message: 'Location selected from map',
          position: 'top'
        })
      })
    }

    const confirmMapSelection = () => {
      if (!tempCoords.value) return

      if (pickerMode.value === 'terminal') {
        routeForm.value.terminalLat = tempCoords.value.lat
        routeForm.value.terminalLng = tempCoords.value.lng
      } else {
        routeForm.value.destinationLat = tempCoords.value.lat
        routeForm.value.destinationLng = tempCoords.value.lng
      }

      $q.notify({
        type: 'positive',
        message: `${pickerMode.value === 'terminal' ? 'Terminal' : 'Destination'} coordinates set`,
        icon: 'check_circle',
        position: 'top',
      })

      closeMapPicker()
    }

    const closeMapPicker = () => {
      if (mapPickerInstance) {
        mapPickerInstance.remove()
        mapPickerInstance = null
      }
      markerInstance = null
      tempCoords.value = null
      locationSearch.value = ''
      searchResults.value = []
      searchAttempted.value = false
      selectedLocationName.value = ''
      showMapPicker.value = false
    }

    const onImageRejected = (rejectedEntries) => {
      console.log('[Image Rejected]', rejectedEntries)
      
      if (!rejectedEntries || rejectedEntries.length === 0) {
        $q.notify({
          type: 'negative',
          message: 'Invalid image file',
          position: 'top',
          icon: 'error'
        })
        return
      }

      const rejection = rejectedEntries[0]
      
      if (rejection.failedPropValidation === 'accept') {
        $q.notify({
          type: 'negative',
          message: 'Only JPG and PNG images are allowed. WebP is not supported.',
          position: 'top',
          icon: 'error',
          timeout: 3000
        })
      } else if (rejection.failedPropValidation === 'max-file-size') {
        $q.notify({
          type: 'negative',
          message: 'Image must be less than 5MB',
          position: 'top',
          icon: 'error',
          timeout: 3000
        })
      } else {
        $q.notify({
          type: 'negative',
          message: 'Invalid image file. Please use JPG or PNG format.',
          position: 'top',
          icon: 'error',
          timeout: 3000
        })
      }
    }

    watch(
      () => routeForm.value.imageFile,
      (newFile) => {
        if (newFile) {
          console.log('[Watch] New image file selected:', newFile.name)
          const reader = new FileReader()
          reader.onload = (e) => {
            imagePreview.value = e.target.result
          }
          reader.readAsDataURL(newFile)
        } else {
          imagePreview.value = null
        }
      }
    )

    watch(
      () => props.openDialog,
      (newVal) => {
        if (newVal) {
          showDialog.value = true
          emit('dialog-opened')
        }
      }
    )

    onMounted(() => {
      fetchRoutes()
    })

    return {
      routes,
      loading,
      saving,
      showDialog,
      editMode,
      searchFilter,
      routeForm,
      columns,
      filteredRoutes,
      imagePreview,
      showMapPicker,
      mapPickerContainer,
      pickerMode,
      tempCoords,
      showConflictDialog,
      detectedConflicts,
      showVariantDialog,
      variantType,
      variantOptions,
      // Location search
      locationSearch,
      searchResults,
      searching,
      searchAttempted,
      selectedLocationName,
      searchLocation,
      selectSearchResult,
      // Functions
      resolveConflict,
      createVariant,
      cancelAllConflicts,
      saveRoute,
      editRoute,
      deleteRoute,
      closeDialog,
      openMapPicker,
      confirmMapSelection,
      closeMapPicker,
      onImageRejected,
    }
  },
}
</script>

<style lang="sass" scoped>
.routes-management
  .management-header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 20px

.text-pine-green
  color: #2d6a4f

.coordinate-section
  background: #f5f5f5
  padding: 12px
  border-radius: 8px

.search-result-item
  &:hover
    background: #f0f0f0

:deep(.custom-marker)
  background: transparent
  border: none
</style>