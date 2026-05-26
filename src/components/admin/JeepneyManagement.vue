<!--
  Admin module: jeepneys + their stored route polylines (the `jeepneys`
  Firestore collection).
  - Searchable table; multi-select bulk delete.
  - Add/edit dialog: jeepney metadata, image upload, terminal location
    picker (Leaflet), `touristSpotsServiced` chips, route-coordinate editor,
    fare matrix.
  - Route column has TWO action buttons:
      • green map button  → preview the stored polyline (RouteMap)
      • red compare-arrows → open RouteCompareDialog (overlay stored vs
        fresh OSRM, with Apply/Generate to overwrite Firestore)
  - CSV bulk import.
  Mounted from: AdminDashboard when activeMenu === 'routes'.
-->
<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Jeepney Management</h4>
        <p class="text-grey-7 q-mb-none">Manage jeepney routes and information</p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          v-if="selectedJeepneys.length > 0"
          color="negative"
          :label="`Delete Selected (${selectedJeepneys.length})`"
          icon="delete"
          no-caps
          @click="bulkDelete"
        />
        <q-btn
          v-if="filteredJeepneys.length > 0"
          color="negative"
          outline
          :label="`Delete All (${filteredJeepneys.length})`"
          icon="delete_sweep"
          no-caps
          @click="deleteAllJeepneys"
        />
        <q-btn
          outline
          style="border-color: #2d6a4f; color: #2d6a4f"
          label="Download CSV Template"
          icon="download"
          no-caps
          @click="downloadCsvTemplate"
        />
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Import CSV"
          icon="upload_file"
          no-caps
          @click="showCsvImportDialog = true"
        />
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Add Jeepney"
          icon="add"
          no-caps
          @click="showAddDialog = true"
        />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-input v-model="search" outlined placeholder="Search jeepneys..." dense class="q-mb-md">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredJeepneys"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          v-model:selected="selectedJeepneys"
          selection="multiple"
        >
          <template #body-cell-imageUrl="props">
            <q-td :props="props">
              <q-avatar size="60px" square>
                <img
                  :src="props.value || DEFAULT_JEEPNEY_IMAGE"
                  @error="$event.target.src = DEFAULT_JEEPNEY_IMAGE"
                />
              </q-avatar>
            </q-td>
          </template>

          <template #body-cell-route="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="map"
                style="background: #2d6a4f; color: white"
                @click="viewRoute(props.row)"
              >
                <q-tooltip>View Route Map</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="compare_arrows"
                class="q-ml-xs"
                style="background: #c10015; color: white"
                @click="compareRoute(props.row)"
              >
                <q-tooltip>
                  {{
                    props.value && props.value.length > 0
                      ? 'Compare with OSRM'
                      : 'Generate route from OSRM'
                  }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                style="background: #2d6a4f; color: white"
                @click="editJeepney(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showAddDialog" @hide="onDialogHide">
      <q-card style="min-width: 700px; max-width: 800px">
        <q-card-section>
          <div class="text-h6 text-pine-green">
            {{ editingJeepney ? 'Edit Jeepney' : 'Add New Jeepney' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Image Upload -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Jeepney Image</div>
            <div v-show="imagePreview || form.imageUrl" class="image-preview-container q-mb-sm">
              <img
                :src="imagePreview || form.imageUrl || DEFAULT_JEEPNEY_IMAGE"
                class="image-preview"
              />
              <q-btn
                round
                dense
                icon="close"
                color="negative"
                size="sm"
                class="remove-image-btn"
                @click="removeImage"
              >
                <q-tooltip>Remove Image</q-tooltip>
              </q-btn>
            </div>
            <q-file
              v-model="imageFile"
              outlined
              label="Choose Jeepney Image"
              accept="image/*"
              max-file-size="5242880"
              @update:model-value="onImageSelected"
              @rejected="onImageRejected"
            >
              <template #prepend>
                <q-icon name="image" />
              </template>
              <template #hint> Max 5MB (JPG, PNG, WebP) </template>
            </q-file>
          </div>

          <q-separator class="q-my-md" />

          <!-- 1. Jeep Name -->
          <q-input
            v-model="form.jeepName"
            outlined
            label="Jeepney Name *"
            class="q-mb-md"
            :rules="[(val) => !!val || 'Jeepney name is required']"
            hint="e.g., J-001, Market-SM Jeep"
          />

          <!-- 2. Terminal Location -->
          <q-input
            v-model="form.terminalLocation"
            outlined
            label="Terminal Location *"
            class="q-mb-md"
            :rules="[(val) => !!val || 'Terminal location is required']"
          >
            <template #append>
              <q-btn flat dense icon="my_location" color="primary" @click="useCurrentLocation">
                <q-tooltip>Use Current Location</q-tooltip>
              </q-btn>
            </template>
          </q-input>

          <!-- 3. Terminal Coordinates -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model.number="form.terminalLat"
                outlined
                type="number"
                label="Terminal Latitude"
                step="0.000001"
                hint="Optional - for accuracy"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.terminalLng"
                outlined
                type="number"
                label="Terminal Longitude"
                step="0.000001"
                hint="Optional - for accuracy"
              />
            </div>
          </div>

          <!-- 4. Fare Matrix -->
          <div class="text-subtitle2 q-mb-sm">Fare Matrix (₱)</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model.number="form.fareRegular"
                outlined
                type="number"
                label="Regular Fare *"
                :rules="[
                  (val) => (val !== undefined && val !== null) || 'Required',
                  (val) => val >= 0 || 'Must be 0 or higher',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.fareStudent"
                outlined
                type="number"
                label="Student Fare *"
                :rules="[
                  (val) => (val !== undefined && val !== null) || 'Required',
                  (val) => val >= 0 || 'Must be 0 or higher',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.fareSenior"
                outlined
                type="number"
                label="Senior Citizen Fare *"
                :rules="[
                  (val) => (val !== undefined && val !== null) || 'Required',
                  (val) => val >= 0 || 'Must be 0 or higher',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model.number="form.farePWD"
                outlined
                type="number"
                label="PWD Fare *"
                :rules="[
                  (val) => (val !== undefined && val !== null) || 'Required',
                  (val) => val >= 0 || 'Must be 0 or higher',
                ]"
              />
            </div>
          </div>

          <!-- 5. Operating Hours -->
          <div class="text-subtitle2 q-mb-sm">Operating Hours</div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.operatingHours.open"
                outlined
                type="time"
                label="Opening Time"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.operatingHours.close"
                outlined
                type="time"
                label="Closing Time"
              />
            </div>
          </div>

          <!-- 6. Tourist Spots Serviced -->
          <div class="text-subtitle2 q-mb-sm">Tourist Spots Serviced</div>
          <q-select
            v-model="form.touristSpotsServiced"
            outlined
            label="Select Tourist Spots"
            :options="touristSpotsOptions"
            multiple
            use-chips
            use-input
            input-debounce="300"
            hint="Check multiple spots that this jeepney services"
            class="q-mb-md"
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

          <!-- 7. Route Taken on Map -->
          <div class="text-subtitle2 q-mb-sm">Route Taken (Pin on Map)</div>
          <div
            class="map-container q-mb-md"
            ref="mapContainer"
            id="jeepney-map"
            style="height: 300px"
          ></div>
          <div class="q-mb-md">
            <q-expansion-item
              v-if="form.routeCoordinates && form.routeCoordinates.length > 0"
              icon="place"
              label="Route Points"
              caption="Click the arrow to view exact coordinates"
              dense
            >
              <div class="q-mb-sm">
                <q-chip
                  v-for="(point, index) in form.routeCoordinates"
                  :key="index"
                  removable
                  @remove="removeRoutePoint(index)"
                  color="primary"
                  text-color="white"
                  size="sm"
                  class="q-mr-sm q-mb-sm"
                >
                  Point {{ index + 1 }}: {{ point.lat.toFixed(4) }}, {{ point.lng.toFixed(4) }}
                </q-chip>
              </div>
              <div class="text-caption text-grey-7 q-pt-xs">
                Click on map to add route points. Click chip remove icon to remove.
              </div>
            </q-expansion-item>
          </div>

          <!-- 8. End Point -->
          <q-input
            v-model="form.endPoint"
            outlined
            label="End Point *"
            class="q-mb-md"
            :rules="[(val) => !!val || 'End point is required']"
            hint="Final destination of this route"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="editingJeepney ? 'Update' : 'Create'"
            style="background: #2d6a4f; color: white"
            @click="saveJeepney()"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Route Preview Dialog -->
    <q-dialog v-model="showRoutePreviewDialog" maximized>
      <q-card class="route-preview-card">
        <q-btn
          round
          dense
          unelevated
          icon="close"
          color="negative"
          text-color="white"
          class="route-preview-close"
          aria-label="Close"
          v-close-popup
        >
          <q-tooltip>Close</q-tooltip>
        </q-btn>
        <q-card-section class="text-white row items-center" style="background: #2d6a4f">
          <div class="text-h6">
            <q-icon name="map" class="q-mr-sm" />
            Route Preview - {{ selectedJeepneyForRoute?.jeepName }}
          </div>
          <q-space />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Map -->
            <div class="col-12 col-md-8">
              <RouteMap
                :route-coordinates="selectedJeepneyForRoute?.routeCoordinates"
                :waypoints="routeWaypoints"
                :distance="selectedJeepneyForRoute?.routeDistance"
                :duration="selectedJeepneyForRoute?.routeDuration"
                height="500px"
                :show-controls="true"
                :show-waypoints-info="true"
                :show-stats="true"
              />
            </div>

            <!-- Info Panel -->
            <div class="col-12 col-md-4">
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-h6 q-mb-md">Route Information</div>

                  <q-list separator>
                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="directions_bus" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Jeepney Name</q-item-label>
                        <q-item-label>{{ selectedJeepneyForRoute?.jeepName }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="place" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Terminal</q-item-label>
                        <q-item-label>{{ selectedJeepneyForRoute?.terminalLocation }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section avatar>
                        <q-icon name="flag" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>End Point</q-item-label>
                        <q-item-label>{{ selectedJeepneyForRoute?.endPoint }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="selectedJeepneyForRoute?.routeDistance">
                      <q-item-section avatar>
                        <q-icon name="straighten" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Total Distance</q-item-label>
                        <q-item-label>{{
                          formatDistance(selectedJeepneyForRoute.routeDistance)
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="selectedJeepneyForRoute?.routeDuration">
                      <q-item-section avatar>
                        <q-icon name="schedule" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Est. Duration</q-item-label>
                        <q-item-label>{{
                          formatDuration(selectedJeepneyForRoute.routeDuration)
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="selectedJeepneyForRoute?.touristSpotsServiced?.length > 0">
                      <q-item-section avatar>
                        <q-icon name="attractions" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label caption>Tourist Spots</q-item-label>
                        <q-item-label>
                          <q-chip
                            v-for="spot in selectedJeepneyForRoute.touristSpotsServiced"
                            :key="spot"
                            size="sm"
                            color="primary"
                            text-color="white"
                            class="q-ma-xs"
                          >
                            {{ spot }}
                          </q-chip>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Route Compare Dialog (stored polyline vs fresh OSRM) -->
    <RouteCompareDialog
      v-model="showRouteCompareDialog"
      :jeepney="selectedJeepneyForCompare"
      @apply="onApplyOsrmRoute"
    />

    <!-- CSV Import Dialog -->
    <q-dialog v-model="showCsvImportDialog" persistent>
      <q-card style="min-width: 800px; max-width: 1000px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="upload_file" class="q-mr-sm" />
            Import Jeepneys from CSV
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Step 1: File Upload -->
          <div v-if="importStep === 1">
            <div class="text-body2 q-mb-md">
              Upload a CSV file containing jeepney data. Make sure to follow the template format.
            </div>

            <q-file
              v-model="csvFile"
              outlined
              label="Select CSV File"
              accept=".csv"
              class="q-mb-md"
              @update:model-value="onCsvFileSelected"
            >
              <template #prepend>
                <q-icon name="attach_file" />
              </template>
              <template #hint> Only .csv files are accepted </template>
            </q-file>

            <q-banner v-if="csvError" class="bg-negative text-white q-mb-md" rounded>
              <q-icon name="error" size="md" />
              {{ csvError }}
            </q-banner>

            <q-banner class="bg-info text-white q-mb-md" rounded>
              <q-icon name="info" size="md" />
              <div class="text-body2">
                <strong>Required CSV columns:</strong><br />
                jeep_name, terminal_location, terminal_lat, terminal_lng, fare_regular,
                fare_student, fare_senior, fare_pwd, end_point<br /><br />
                <strong>Optional columns:</strong><br />
                operating_hours_open, operating_hours_close, tourist_spots_serviced (comma-separated
                list)
              </div>
            </q-banner>
          </div>

          <!-- Step 2: Preview Data -->
          <div v-if="importStep === 2">
            <div class="text-body2 q-mb-md">
              Preview of {{ parsedJeepneys.length }} jeepney(s) to be imported:
            </div>

            <q-table
              :rows="parsedJeepneys"
              :columns="previewColumns"
              row-key="index"
              flat
              bordered
              :rows-per-page-options="[10, 25, 50]"
              style="max-height: 400px"
            >
              <template #body-cell-valid="props">
                <q-td :props="props">
                  <q-badge :color="props.value ? 'positive' : 'negative'">
                    {{ props.value ? 'Valid' : 'Invalid' }}
                  </q-badge>
                </q-td>
              </template>
              <template #body-cell-error="props">
                <q-td :props="props">
                  <span class="text-negative text-caption">{{ props.value || '-' }}</span>
                </q-td>
              </template>
            </q-table>

            <div v-if="invalidCount > 0" class="q-mt-md">
              <q-banner class="bg-warning text-white" rounded>
                <q-icon name="warning" size="md" />
                <strong>{{ invalidCount }} invalid row(s) detected.</strong> These will be skipped
                during import.
              </q-banner>
            </div>
          </div>

          <!-- Step 3: Progress -->
          <div v-if="importStep === 3">
            <div class="text-body2 q-mb-md text-center">Importing jeepneys... Please wait.</div>

            <q-linear-progress :value="importProgress" color="primary" class="q-mb-md" />

            <div class="text-center">
              <q-badge color="primary" class="q-pa-sm">
                {{ importedCount }} / {{ parsedJeepneys.length }} imported
              </q-badge>
            </div>

            <q-list class="q-mt-md" style="max-height: 300px; overflow-y: auto">
              <q-item v-for="(log, index) in importLogs" :key="index">
                <q-item-section avatar>
                  <q-icon
                    :name="log.success ? 'check_circle' : 'error'"
                    :color="log.success ? 'positive' : 'negative'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ log.message }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            v-if="importStep === 1"
            flat
            label="Cancel"
            color="grey-7"
            @click="closeCsvImportDialog"
          />
          <q-btn
            v-if="importStep === 1"
            unelevated
            label="Preview Import"
            color="primary"
            @click="parseCsvFile"
            :disable="!csvFile"
          />
          <q-btn v-if="importStep === 2" flat label="Back" color="grey-7" @click="importStep = 1" />
          <q-btn
            v-if="importStep === 2"
            unelevated
            label="Start Import"
            color="primary"
            @click="startImport"
            :disable="validCount === 0"
          />
          <q-btn
            v-if="importStep === 3"
            flat
            label="Close"
            color="grey-7"
            @click="closeCsvImportDialog"
            :disable="isImporting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import RouteMap from 'src/components/RouteMap.vue'
import RouteCompareDialog from 'src/components/admin/RouteCompareDialog.vue'
import defaultJeepneyImage from 'src/assets/jeepney.png'

export default {
  name: 'JeepneyManagement',

  components: {
    RouteMap,
    RouteCompareDialog,
  },

  props: {
    openDialog: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      jeepneys: [],
      search: '',
      loading: false,
      saving: false,
      showAddDialog: false,
      showRoutePreviewDialog: false,
      showRouteCompareDialog: false,
      selectedJeepneyForRoute: null,
      selectedJeepneyForCompare: null,
      editingJeepney: null,
      imageFile: null,
      imagePreview: null,
      map: null,
      marker: null,
      routeLine: null,
      routeMarkers: [],
      DEFAULT_JEEPNEY_IMAGE: defaultJeepneyImage,
      form: {
        jeepName: '',
        terminalLocation: '',
        terminalLat: null,
        terminalLng: null,
        fareRegular: null,
        fareStudent: null,
        fareSenior: null,
        farePWD: null,
        operatingHours: {
          open: '',
          close: '',
        },
        touristSpotsServiced: [],
        routeCoordinates: [],
        endPoint: '',
        imageUrl: '',
        imagePublicId: '',
      },
      touristSpotsOptions: [
        'Burnham Park',
        'Session Road',
        'Baguio Cathedral',
        'SM City Baguio',
        'Mines View Park',
        'The Mansion',
        'Wright Park',
        'Camp John Hay',
        'Tam-awan Village',
        'BenCab Museum',
        'Baguio Botanical Garden',
        'Strawberry Farm',
        'Baguio City Market',
        'Our Lady of Lourdes Grotto',
        'PMA (Philippine Military Academy)',
        'Teachers Camp',
        'Baguio Convention Center',
        'Mirador House',
      ],
      columns: [
        { name: 'image', label: 'Image', field: 'imageUrl', align: 'center' },
        {
          name: 'jeepName',
          label: 'Jeepney Name',
          field: 'jeepName',
          align: 'left',
          sortable: true,
        },
        { name: 'terminalLocation', label: 'Terminal', field: 'terminalLocation', align: 'left' },
        { name: 'endPoint', label: 'End Point', field: 'endPoint', align: 'left' },
        {
          name: 'route',
          label: 'Route Map',
          field: 'routePoints',
          align: 'center',
          sortable: false,
        },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],

      // CSV Import
      showCsvImportDialog: false,
      importStep: 1,
      csvFile: null,
      csvError: '',
      parsedJeepneys: [],
      importProgress: 0,
      importedCount: 0,
      isImporting: false,
      importLogs: [],
      selectedJeepneys: [],
      previewColumns: [
        {
          name: 'jeepName',
          label: 'Jeepney Name',
          field: 'jeepName',
          align: 'left',
          sortable: true,
        },
        { name: 'terminalLocation', label: 'Terminal', field: 'terminalLocation', align: 'left' },
        { name: 'endPoint', label: 'End Point', field: 'endPoint', align: 'left' },
        { name: 'fareRegular', label: 'Regular Fare', field: 'fareRegular', align: 'center' },
        { name: 'valid', label: 'Status', field: 'valid', align: 'center' },
        { name: 'error', label: 'Error', field: 'error', align: 'left' },
      ],
    }
  },

  computed: {
    filteredJeepneys() {
      let result = this.jeepneys

      // Filter by search query
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        result = result.filter(
          (jeepney) =>
            jeepney.jeepName?.toLowerCase().includes(searchLower) ||
            jeepney.terminalLocation?.toLowerCase().includes(searchLower) ||
            jeepney.endPoint?.toLowerCase().includes(searchLower)
        )
      }

      // Sort alphabetically by jeepney name
      result.sort((a, b) => {
        const nameA = (a.jeepName || '').toLowerCase()
        const nameB = (b.jeepName || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })

      return result
    },

    validCount() {
      return this.parsedJeepneys.filter((j) => j.valid).length
    },

    invalidCount() {
      return this.parsedJeepneys.filter((j) => !j.valid).length
    },
  },

  mounted() {
    this.loadJeepneys()
  },

  watch: {
    openDialog(val) {
      if (val) {
        this.showAddDialog = true
        this.$emit('dialog-opened')
      }
    },
    showAddDialog(val) {
      if (val) {
        this.$nextTick(() => {
          this.initMap()
        })
      }
    },
  },

  methods: {
    async loadJeepneys() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'jeepneys'))
        this.jeepneys = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          // Normalize invalid or placeholder image URLs
          if (
            !data.imageUrl ||
            data.imageUrl.includes('800x600') ||
            data.imageUrl.includes('placeholder')
          ) {
            data.imageUrl = this.DEFAULT_JEEPNEY_IMAGE
          }
          return {
            id: doc.id,
            ...data,
          }
        })
      } catch (error) {
        console.error('[Jeepneys] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load jeepneys',
          position: 'top',
        })
      } finally {
        this.loading = false
      }
    },

    onImageSelected(file) {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    onImageRejected(rejectedEntries) {
      const reason = rejectedEntries[0]?.failedPropValidation
      let message = 'Image upload failed'

      if (reason === 'max-file-size') {
        message = 'Image size must be less than 5MB'
      } else if (reason === 'accept') {
        message = 'Only image files are allowed'
      }

      this.$q.notify({
        type: 'negative',
        message: message,
        position: 'top',
      })
    },

    removeImage() {
      this.imageFile = null
      this.imagePreview = null
      this.form.imageUrl = ''
      this.form.imagePublicId = ''
    },

    async uploadImage() {
      if (!this.imageFile) return null

      try {
        const { uploadOptimizedImage } = await import('src/utils/cloudinary')

        const uploadResult = await uploadOptimizedImage(this.imageFile, 'baguiboost/jeepneys', {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'image/webp',
        })

        return {
          imageUrl: uploadResult.url,
          imagePublicId: uploadResult.publicId,
        }
      } catch (error) {
        console.error('[Jeepneys] Error uploading image:', error)
        throw error
      }
    },

    useCurrentLocation() {
      if (navigator.geolocation) {
        this.$q.loading.show({ message: 'Getting your location...' })

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.form.terminalLat = position.coords.latitude
            this.form.terminalLng = position.coords.longitude

            this.$q.notify({
              type: 'positive',
              message: 'Location acquired!',
              position: 'top',
            })
          },
          (error) => {
            this.$q.notify({
              type: 'negative',
              message: 'Unable to get location: ' + error.message,
              position: 'top',
            })
          }
        )
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'Geolocation is not supported by this browser',
          position: 'top',
        })
      }
    },

    initMap() {
      // Wait for DOM to be ready
      if (!document.getElementById('jeepney-map')) return

      // Destroy existing map if any
      if (this.map) {
        this.map.remove()
        this.map = null
      }

      // Initialize map centered on Baguio
      this.map = L.map('jeepney-map').setView([16.4023, 120.596], 14)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(this.map)

      // Add click handler to add route points
      this.map.on('click', (e) => {
        if (!this.form.routeCoordinates) {
          this.form.routeCoordinates = []
        }
        this.form.routeCoordinates.push({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        })
        this.updateRouteLine()
      })

      // Invalidate size after map is fully loaded
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
          // After invalidating size, redraw route if points exist. Use a slightly
          // longer delay to ensure the dialog/container is visible.
          setTimeout(() => {
            if (this.form.routeCoordinates && this.form.routeCoordinates.length > 0) {
              this.updateRouteLine()
            }
          }, 250)
        }
      }, 100)
    },

    updateRouteLine() {
      if (!this.map || !this.form.routeCoordinates || this.form.routeCoordinates.length === 0)
        return

      // Remove existing layers
      if (this.routeLine) {
        this.map.removeLayer(this.routeLine)
      }
      if (this.routeMarkers) {
        this.routeMarkers.forEach((marker) => this.map.removeLayer(marker))
      }
      this.routeMarkers = []

      // Draw polyline
      const latlngs = this.form.routeCoordinates.map((point) => [point.lat, point.lng])
      this.routeLine = L.polyline(latlngs, {
        color: 'red',
        weight: 4,
        opacity: 0.8,
      }).addTo(this.map)

      // No markers for each point — only draw the polyline for a cleaner view
      // routeMarkers remains empty to allow removal logic to run safely
      this.routeMarkers = []

      // Fit map to show all points
      this.map.fitBounds(L.latLngBounds(latlngs))
    },

    removeRoutePoint(index) {
      if (this.form.routeCoordinates) {
        this.form.routeCoordinates.splice(index, 1)
        this.updateRouteLine()
      }
    },

    editJeepney(jeepney) {
      // Show dialog immediately with a minimal form to speed up UI response.
      this.editingJeepney = jeepney
      this.form = {
        jeepName: jeepney.jeepName || '',
        terminalLocation: jeepney.terminalLocation || '',
        terminalLat: jeepney.terminalLat || null,
        terminalLng: jeepney.terminalLng || null,
        fareRegular: jeepney.fareRegular || null,
        fareStudent: jeepney.fareStudent || null,
        fareSenior: jeepney.fareSenior || null,
        farePWD: jeepney.farePWD || null,
        operatingHours: { open: '', close: '' },
        touristSpotsServiced: [],
        routeCoordinates: [],
        endPoint: jeepney.endPoint || '',
        imageUrl: jeepney.imageUrl || this.DEFAULT_JEEPNEY_IMAGE,
        imagePublicId: jeepney.imagePublicId || '',
      }

      // Open dialog first so the UI can render quickly
      this.showAddDialog = true

      // Defer heavier normalization and coordinate conversion so the dialog appears faster.
      this.$nextTick(() => {
        setTimeout(() => {
          // Convert routeCoordinates from [lng, lat] format to {lat, lng} format for the form
          let formRoutePoints = []
          const routeCoords = jeepney.routeCoordinates || jeepney.routePoints || []
          if (routeCoords && routeCoords.length > 0) {
            formRoutePoints = routeCoords
              .map((coord) => {
                if (Array.isArray(coord)) {
                  const lng = Array.isArray(coord[0]) ? coord[0][0] : coord[0]
                  const lat = Array.isArray(coord[0]) ? coord[0][1] : coord[1]
                  return { lat: parseFloat(lat), lng: parseFloat(lng) }
                }
                if (coord && coord.lat !== undefined && coord.lng !== undefined) {
                  return { lat: parseFloat(coord.lat), lng: parseFloat(coord.lng) }
                }
                return null
              })
              .filter((point) => point !== null)
          }

          // Normalize operatingHours from database - handle if it's an array or object
          let operatingHours = { open: '', close: '' }
          if (jeepney.operatingHours) {
            if (
              typeof jeepney.operatingHours === 'object' &&
              !Array.isArray(jeepney.operatingHours)
            ) {
              operatingHours = {
                open: jeepney.operatingHours.open || '',
                close: jeepney.operatingHours.close || '',
              }
            } else if (typeof jeepney.operatingHours === 'string') {
              operatingHours = { open: jeepney.operatingHours, close: '' }
            }
          }

          // Normalize touristSpotsServiced from database - flatten if needed
          let touristSpots = []
          if (Array.isArray(jeepney.touristSpotsServiced)) {
            touristSpots = jeepney.touristSpotsServiced
              .map((spot) => (Array.isArray(spot) ? spot[0] || '' : spot))
              .filter((spot) => typeof spot === 'string' && spot.trim().length > 0)
          }

          // Apply the heavier fields after dialog is visible
          this.form.operatingHours = operatingHours
          this.form.touristSpotsServiced = touristSpots
          this.form.routeCoordinates = formRoutePoints
          this.form.imageUrl = jeepney.imageUrl || this.DEFAULT_JEEPNEY_IMAGE
          this.form.imagePublicId = jeepney.imagePublicId || ''

          // If the map is already initialized (watcher initializes it when dialog opens), redraw route
          if (this.map && this.form.routeCoordinates && this.form.routeCoordinates.length > 0) {
            this.updateRouteLine()
          }
        }, 50)
      })
    },

    /**
     * Validate that data doesn't contain nested arrays
     * Returns the path to any nested array found
     */
    findNestedArrays(obj, path = '') {
      const issues = []

      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => {
          const itemPath = `${path}[${idx}]`
          if (Array.isArray(item)) {
            issues.push(`Nested array found at ${itemPath}`)
          } else if (typeof item === 'object' && item !== null && !(item instanceof Date)) {
            issues.push(...this.findNestedArrays(item, itemPath))
          }
        })
      } else if (typeof obj === 'object' && obj !== null && !(obj instanceof Date)) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            const fieldPath = path ? `${path}.${key}` : key
            if (Array.isArray(value)) {
              value.forEach((item, idx) => {
                const itemPath = `${fieldPath}[${idx}]`
                if (Array.isArray(item)) {
                  issues.push(`Nested array found at ${itemPath}`)
                }
              })
            } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
              issues.push(...this.findNestedArrays(value, fieldPath))
            }
          }
        }
      }

      return issues
    },

    /**
     * Deep clean data to remove any nested arrays
     * Firestore doesn't support arrays within arrays
     */
    deepCleanData(obj, fieldName = '', path = '') {
      const currentPath = path ? `${path}.${fieldName}` : fieldName

      if (Array.isArray(obj)) {
        // Check if this array contains nested arrays or complex objects
        const cleaned = obj.map((item, idx) => {
          if (Array.isArray(item)) {
            console.warn(
              `[JeepneyManagement] Found nested array at ${currentPath}[${idx}], flattening`
            )
            // If item is an array, try to extract values
            return item[0] || item
          }
          if (typeof item === 'object' && item !== null) {
            // Only allow primitive types in arrays for Firestore
            return typeof item === 'string' ? item : String(item)
          }
          return item
        })
        return cleaned
      }

      if (typeof obj === 'object' && obj !== null && !(obj instanceof Date)) {
        const cleaned = {}
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key]
            if (Array.isArray(value)) {
              cleaned[key] = this.deepCleanData(value, key, currentPath)
            } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
              cleaned[key] = this.deepCleanData(value, key, currentPath)
            } else {
              cleaned[key] = value
            }
          }
        }
        return cleaned
      }

      return obj
    },

    /**
     * Normalize jeepney data to ensure Firestore compatibility
     */
    normalizeJeepneyData(data) {
      console.log('[JeepneyManagement] Before normalization:', JSON.stringify(data, null, 2))

      // First pass: deep clean to remove any nested arrays
      data = this.deepCleanData(data)

      // Normalize operatingHours - must be object with open/close
      if (
        !data.operatingHours ||
        typeof data.operatingHours !== 'object' ||
        Array.isArray(data.operatingHours)
      ) {
        data.operatingHours = { open: '', close: '' }
      } else {
        data.operatingHours = {
          open: (data.operatingHours.open || '').toString().trim(),
          close: (data.operatingHours.close || '').toString().trim(),
        }
      }

      // Normalize touristSpotsServiced - must be flat array of strings only
      if (!Array.isArray(data.touristSpotsServiced)) {
        data.touristSpotsServiced = []
      } else {
        data.touristSpotsServiced = data.touristSpotsServiced
          .filter((spot) => {
            if (Array.isArray(spot)) return false
            if (typeof spot === 'string') return spot.trim().length > 0
            return false
          })
          .map((spot) => String(spot).trim())
      }

      // Normalize routeCoordinates - must be flat array of [lng, lat] pairs
      if (!Array.isArray(data.routeCoordinates)) {
        data.routeCoordinates = []
      } else {
        data.routeCoordinates = data.routeCoordinates
          .map((coord, idx) => {
            if (!coord) return null

            // Handle nested arrays
            if (Array.isArray(coord)) {
              if (coord.length === 0) return null
              // If it's triple nested, flatten it
              if (Array.isArray(coord[0])) {
                console.warn(`[JeepneyManagement] Flattening nested coordinate at index ${idx}`)
                return [parseFloat(coord[0][0]), parseFloat(coord[0][1])]
              }
              // Normal [lng, lat]
              if (coord.length === 2) {
                return [parseFloat(coord[0]), parseFloat(coord[1])]
              }
            }

            // Handle objects {lng, lat}
            if (typeof coord === 'object' && !Array.isArray(coord)) {
              if (coord.lng !== undefined && coord.lat !== undefined) {
                return [parseFloat(coord.lng), parseFloat(coord.lat)]
              }
            }

            console.warn(`[JeepneyManagement] Skipping invalid coordinate at index ${idx}:`, coord)
            return null
          })
          .filter((coord) => coord !== null)
      }

      console.log('[JeepneyManagement] After normalization:', {
        operatingHours: data.operatingHours,
        touristSpotsServiced: data.touristSpotsServiced,
        routeCoordinatesLength: data.routeCoordinates.length,
        routeCoordinatesExample: data.routeCoordinates[0],
        allKeys: Object.keys(data),
      })

      return data
    },

    async saveJeepney() {
      // Validate required fields
      if (!this.form.jeepName || !this.form.terminalLocation || !this.form.endPoint) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top',
        })
        return
      }

      // Validate fares
      if (
        this.form.fareRegular === null ||
        this.form.fareStudent === null ||
        this.form.fareSenior === null ||
        this.form.farePWD === null
      ) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all fare values',
          position: 'top',
        })
        return
      }

      this.saving = true
      try {
        // Generate unique ID
        const uniqueId = `JEEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        let imageData = {
          imageUrl: this.form.imageUrl || this.DEFAULT_JEEPNEY_IMAGE,
          imagePublicId: this.form.imagePublicId || '',
        }

        if (this.imageFile) {
          imageData = await this.uploadImage()
        }

        // Convert routeCoordinates from {lat, lng} format to [lng, lat] format for Firestore
        const routeCoordinatesForStorage = (this.form.routeCoordinates || []).map((point) => [
          point.lng,
          point.lat,
        ])

        let jeepneyData = {
          uniqueId: uniqueId,
          jeepName: this.form.jeepName,
          terminalLocation: this.form.terminalLocation,
          terminalLat: this.form.terminalLat,
          terminalLng: this.form.terminalLng,
          fareRegular: parseFloat(this.form.fareRegular),
          fareStudent: parseFloat(this.form.fareStudent),
          fareSenior: parseFloat(this.form.fareSenior),
          farePWD: parseFloat(this.form.farePWD),
          operatingHours: this.form.operatingHours,
          touristSpotsServiced: this.form.touristSpotsServiced,
          routeCoordinates: routeCoordinatesForStorage,
          endPoint: this.form.endPoint,
          imageUrl: imageData.imageUrl,
          imagePublicId: imageData.imagePublicId,
          updatedAt: serverTimestamp(),
        }

        // Normalize data before saving to avoid Firestore nested array errors
        jeepneyData = this.normalizeJeepneyData(jeepneyData)

        // Final validation: check for any remaining nested arrays
        const nestedArrayIssues = this.findNestedArrays(jeepneyData)
        if (nestedArrayIssues.length > 0) {
          console.error(
            '[JeepneyManagement] VALIDATION FAILED - Found nested arrays:',
            nestedArrayIssues
          )
          this.$q.notify({
            type: 'negative',
            message: `Data validation failed: ${nestedArrayIssues[0]}. Please refresh and try again.`,
            position: 'top',
            timeout: 5000,
          })
          this.saving = false
          return
        }

        if (this.editingJeepney) {
          try {
            console.log('[JeepneyManagement] Sending update for jeepney:', this.editingJeepney.id)
            console.log('[JeepneyManagement] Data to update:', jeepneyData)
            await updateDoc(doc(db, 'jeepneys', this.editingJeepney.id), jeepneyData)
            this.$q.notify({
              type: 'positive',
              message: 'Jeepney updated successfully',
              position: 'top',
              icon: 'check_circle',
              timeout: 2000,
            })
          } catch (error) {
            console.error('[JeepneyManagement] Detailed error:', {
              message: error.message,
              code: error.code,
              data: jeepneyData,
              formData: this.form,
            })
            throw error
          }
        } else {
          jeepneyData.createdAt = serverTimestamp()
          try {
            console.log('[JeepneyManagement] Sending create for jeepney:', uniqueId)
            console.log('[JeepneyManagement] Data to create:', jeepneyData)
            await addDoc(collection(db, 'jeepneys'), jeepneyData)
            this.$q.notify({
              type: 'positive',
              message: 'Jeepney created successfully with ID: ' + uniqueId,
              position: 'top',
              icon: 'check_circle',
              timeout: 3000,
            })
          } catch (error) {
            console.error('[JeepneyManagement] Detailed error:', {
              message: error.message,
              code: error.code,
              data: jeepneyData,
              formData: this.form,
            })
            throw error
          }
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadJeepneys()
      } catch (error) {
        console.error('[Jeepneys] Error saving:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save jeepney: ' + error.message,
          position: 'top',
          timeout: 5000,
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(jeepney) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: `Are you sure you want to delete "${jeepney.jeepName}"?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            await deleteDoc(doc(db, 'jeepneys', jeepney.id))
            this.$q.notify({
              type: 'positive',
              message: 'Jeepney deleted successfully',
              position: 'top',
              icon: 'delete',
              timeout: 2000,
            })
            this.loadJeepneys()
          } catch (error) {
            console.error('[Jeepneys] Error deleting:', error)
            this.$q.notify({
              type: 'negative',
              message: 'Failed to delete jeepney: ' + error.message,
              position: 'top',
              timeout: 5000,
            })
          }
        })
    },

    async bulkDelete() {
      if (this.selectedJeepneys.length === 0) return

      this.$q
        .dialog({
          title: 'Confirm Bulk Delete',
          message: `Are you sure you want to delete ${this.selectedJeepneys.length} selected jeepney(s)? This action cannot be undone.`,
          cancel: true,
          persistent: true,
          ok: {
            label: 'Delete All',
            color: 'negative',
            push: true,
          },
        })
        .onOk(async () => {
          const loadingDialog = this.$q.loading.show({
            message: `Deleting ${this.selectedJeepneys.length} jeepney(s)...`,
          })

          try {
            let successCount = 0
            let failCount = 0

            for (const jeepney of this.selectedJeepneys) {
              try {
                await deleteDoc(doc(db, 'jeepneys', jeepney.id))
                successCount++
              } catch (error) {
                console.error('[Jeepneys] Error deleting:', jeepney.jeepName, error)
                failCount++
              }
            }

            this.selectedJeepneys = []
            this.loadJeepneys()

            loadingDialog.hide()

            if (successCount > 0) {
              this.$q.notify({
                type: 'positive',
                message: `Successfully deleted ${successCount} jeepney(s)`,
                position: 'top',
                timeout: 3000,
              })
            }

            if (failCount > 0) {
              this.$q.notify({
                type: 'warning',
                message: `Failed to delete ${failCount} jeepney(s)`,
                position: 'top',
                timeout: 5000,
              })
            }
          } catch (error) {
            console.error('[Jeepneys] Bulk delete error:', error)
            loadingDialog.hide()
            this.$q.notify({
              type: 'negative',
              message: 'Bulk delete failed: ' + error.message,
              position: 'top',
              timeout: 5000,
            })
          }
        })
    },

    async deleteAllJeepneys() {
      const total = this.filteredJeepneys.length
      if (total === 0) return

      this.$q
        .dialog({
          title: '⚠️ DANGER: Delete ALL Jeepneys',
          message: `WARNING: This will permanently delete ALL ${total} jeepney(s) from the database. This action CANNOT be undone and will remove all routes and data. Type "DELETE ALL" to confirm:`,
          cancel: true,
          persistent: true,
          prompt: {
            model: '',
            isValid: (val) => val === 'DELETE ALL',
          },
          ok: {
            label: 'DELETE ALL',
            color: 'negative',
            push: true,
          },
        })
        .onOk(async (confirmText) => {
          if (confirmText !== 'DELETE ALL') return

          const loadingDialog = this.$q.loading.show({
            message: `Deleting ALL ${total} jeepney(s)... Please wait.`,
          })

          try {
            let successCount = 0
            let failCount = 0

            for (const jeepney of this.filteredJeepneys) {
              try {
                await deleteDoc(doc(db, 'jeepneys', jeepney.id))
                successCount++
              } catch (error) {
                console.error('[Jeepneys] Error deleting:', jeepney.jeepName, error)
                failCount++
              }
            }

            this.selectedJeepneys = []
            this.loadJeepneys()

            loadingDialog.hide()

            if (successCount > 0) {
              this.$q.notify({
                type: 'positive',
                message: `Successfully deleted ${successCount} jeepney(s)`,
                position: 'top',
                timeout: 5000,
              })
            }

            if (failCount > 0) {
              this.$q.notify({
                type: 'warning',
                message: `Failed to delete ${failCount} jeepney(s)`,
                position: 'top',
                timeout: 5000,
              })
            }
          } catch (error) {
            console.error('[Jeepneys] Delete all error:', error)
            loadingDialog.hide()
            this.$q.notify({
              type: 'negative',
              message: 'Delete all failed: ' + error.message,
              position: 'top',
              timeout: 5000,
            })
          }
        })
    },

    resetForm() {
      this.form = {
        jeepName: '',
        terminalLocation: '',
        terminalLat: null,
        terminalLng: null,
        fareRegular: null,
        fareStudent: null,
        fareSenior: null,
        farePWD: null,
        operatingHours: {
          open: '',
          close: '',
        },
        touristSpotsServiced: [],
        routeCoordinates: [],
        endPoint: '',
        imageUrl: this.DEFAULT_JEEPNEY_IMAGE,
        imagePublicId: '',
      }
      this.imageFile = null
      this.imagePreview = null
      this.editingJeepney = null

      if (this.map) {
        this.map.remove()
        this.map = null
        this.marker = null
        this.routeLine = null
        this.routeMarkers = []
      }
    },

    /**
     * View route on map
     */
    viewRoute(jeepney) {
      this.selectedJeepneyForRoute = jeepney
      this.showRoutePreviewDialog = true
    },

    /**
     * Open the OSRM compare dialog for this jeepney's stored polyline.
     */
    compareRoute(jeepney) {
      this.selectedJeepneyForCompare = jeepney
      this.showRouteCompareDialog = true
    },

    /**
     * Persist a fresh OSRM-generated polyline back onto the jeepney doc and
     * refresh the local table row so the new path shows immediately.
     */
    async onApplyOsrmRoute({
      jeepneyId,
      jeepneyName,
      routeCoordinates,
      routeDistance,
      routeDuration,
    }) {
      if (!jeepneyId || !routeCoordinates?.length) return
      try {
        const update = {
          routeCoordinates,
          routeDistance: routeDistance ?? null,
          routeDuration: routeDuration ?? null,
          updatedAt: new Date(),
        }
        await updateDoc(doc(db, 'jeepneys', jeepneyId), update)

        const idx = this.jeepneys.findIndex((j) => j.id === jeepneyId)
        if (idx >= 0) {
          this.jeepneys[idx] = { ...this.jeepneys[idx], ...update }
        }

        this.$q.notify({
          type: 'positive',
          message: `Updated route for ${jeepneyName || jeepneyId}`,
          position: 'top',
        })
      } catch (err) {
        console.error('[JeepneyManagement] Failed to apply OSRM route:', err)
        this.$q.notify({
          type: 'negative',
          message: `Could not save route: ${err.message || err}`,
          position: 'top',
        })
      }
    },

    /**
     * Build waypoints from jeepney data for display
     */
    get routeWaypoints() {
      if (!this.selectedJeepneyForRoute) return []

      const waypoints = []
      const data = this.selectedJeepneyForRoute

      // Add terminal
      if (data.terminalLat && data.terminalLng) {
        waypoints.push({
          name: 'Terminal',
          latitude: data.terminalLat,
          longitude: data.terminalLng,
        })
      }

      // Add tourist spots (without coordinates since we don't have them)
      if (data.touristSpotsServiced && data.touristSpotsServiced.length > 0) {
        data.touristSpotsServiced.forEach((spot) => {
          waypoints.push({
            name: spot,
            latitude: data.terminalLat || 16.4023,
            longitude: data.terminalLng || 120.596,
          })
        })
      }

      // Add end point
      if (data.endPoint) {
        waypoints.push({
          name: data.endPoint,
          latitude: data.terminalLat || 16.4023,
          longitude: data.terminalLng || 120.596,
        })
      }

      return waypoints
    },

    /**
     * Format distance for display
     */
    formatDistance(meters) {
      if (!meters) return ''
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`
      }
      return `${Math.round(meters)} m`
    },

    /**
     * Format duration for display
     */
    formatDuration(seconds) {
      if (!seconds) return ''
      const minutes = Math.round(seconds / 60)
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return `${hours}h ${remainingMinutes}m`
      }
      return `${minutes} min`
    },

    onDialogHide() {
      this.resetForm()
    },

    // CSV Import Methods
    downloadCsvTemplate() {
      const headers = [
        'jeep_name',
        'terminal_location',
        'terminal_lat',
        'terminal_lng',
        'fare_regular',
        'fare_student',
        'fare_senior',
        'fare_pwd',
        'end_point',
        'operating_hours_open',
        'operating_hours_close',
        'tourist_spots_serviced',
      ]

      const escapeCsv = (value) => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (/[",\r\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const rows = this.jeepneys.map((j) => {
        const oh = j.operatingHours || {}
        const tourist = Array.isArray(j.touristSpotsServiced)
          ? j.touristSpotsServiced.join(';')
          : j.touristSpotsServiced || ''
        return [
          j.jeepName || '',
          j.terminalLocation || '',
          j.terminalLat ?? '',
          j.terminalLng ?? '',
          j.fareRegular ?? '',
          j.fareStudent ?? '',
          j.fareSenior ?? '',
          j.farePWD ?? '',
          j.endPoint || '',
          oh.open || '',
          oh.close || '',
          tourist,
        ]
          .map(escapeCsv)
          .join(',')
      })

      // Fall back to a sample row if no current data, so the format is still visible
      if (rows.length === 0) {
        rows.push(
          [
            'J-001',
            'Baguio City Market Terminal',
            '16.4109',
            '120.5964',
            '13',
            '10',
            '10.40',
            '10.40',
            'SM City Baguio',
            '06:00',
            '22:00',
            'Burnham Park;Session Road;SM City Baguio',
          ]
            .map(escapeCsv)
            .join(',')
        )
      }

      const csvContent = [headers.join(','), ...rows].join('\n')

      // BOM so Excel reads UTF-8 (ñ, accented chars) correctly
      const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      const today = new Date().toISOString().slice(0, 10)
      const filename =
        this.jeepneys.length > 0
          ? `jeepneys_current_data_${today}.csv`
          : 'jeepney_import_template.csv'

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      this.$q.notify({
        type: 'positive',
        message:
          this.jeepneys.length > 0
            ? `Downloaded ${this.jeepneys.length} jeepney(s) as CSV`
            : 'CSV template downloaded',
        position: 'top',
      })
    },

    onCsvFileSelected(file) {
      this.csvError = ''
      if (file && file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        this.csvError = 'Please select a valid CSV file'
        this.csvFile = null
      }
    },

    parseCsvFile() {
      if (!this.csvFile) return

      this.csvError = ''
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const csvText = e.target.result
          const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '')

          if (lines.length < 2) {
            this.csvError = 'CSV file is empty or invalid'
            return
          }

          const headers = this.parseCsvLine(lines[0])
          const requiredHeaders = [
            'jeep_name',
            'terminal_location',
            'fare_regular',
            'fare_student',
            'fare_senior',
            'fare_pwd',
            'end_point',
          ]

          const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
          if (missingHeaders.length > 0) {
            this.csvError = `Missing required columns: ${missingHeaders.join(', ')}`
            return
          }

          const parsed = []
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i])
            const jeepney = this.mapCsvRow(headers, values, i)
            parsed.push(jeepney)
          }

          this.parsedJeepneys = parsed
          this.importStep = 2

          this.$q.notify({
            type: 'positive',
            message: `Parsed ${parsed.length} jeepney(s)`,
            position: 'top',
          })
        } catch (error) {
          console.error('[CSV] Parse error:', error)
          this.csvError = 'Failed to parse CSV: ' + error.message
        }
      }

      reader.onerror = () => {
        this.csvError = 'Failed to read CSV file'
      }

      reader.readAsText(this.csvFile)
    },

    parseCsvLine(line) {
      const result = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"'
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }

      result.push(current.trim())
      return result
    },

    mapCsvRow(headers, values, rowIndex) {
      // Normalize headers (trim spaces, convert to lowercase)
      const normalizedHeaders = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))

      const getValue = (key) => {
        const index = normalizedHeaders.indexOf(key)
        const value = index !== -1 ? values[index]?.trim() || '' : ''
        console.log(`[CSV] ${key}: "${value}" (index: ${index})`)
        return value
      }

      // Debug: Log headers for troubleshooting
      if (rowIndex === 0) {
        console.log('[CSV] Original Headers:', headers)
        console.log('[CSV] Normalized Headers:', normalizedHeaders)
        console.log('[CSV] First Row Values:', values)
      }

      const operatingHoursOpen = getValue('operating_hours_open')
      const operatingHoursClose = getValue('operating_hours_close')

      console.log(
        '[CSV] Operating Hours - Open:',
        operatingHoursOpen,
        'Close:',
        operatingHoursClose
      )

      const jeepney = {
        index: rowIndex,
        jeepName: getValue('jeep_name'),
        terminalLocation: getValue('terminal_location'),
        terminalLat: parseFloat(getValue('terminal_lat')) || null,
        terminalLng: parseFloat(getValue('terminal_lng')) || null,
        fareRegular: parseFloat(getValue('fare_regular')) || null,
        fareStudent: parseFloat(getValue('fare_student')) || null,
        fareSenior: parseFloat(getValue('fare_senior')) || null,
        farePWD: parseFloat(getValue('fare_pwd')) || null,
        endPoint: getValue('end_point'),
        operatingHours: {
          open: operatingHoursOpen,
          close: operatingHoursClose,
        },
        touristSpotsServiced: [],
        valid: true,
        error: '',
      }

      // Parse tourist spots (semicolon or comma separated)
      const touristSpotsStr = getValue('tourist_spots_serviced')
      if (touristSpotsStr) {
        const separator = touristSpotsStr.includes(';') ? ';' : ','
        jeepney.touristSpotsServiced = touristSpotsStr
          .split(separator)
          .map((s) => s.trim())
          .filter((s) => s !== '')
      }

      // Validate
      if (!jeepney.jeepName) {
        jeepney.valid = false
        jeepney.error = 'Missing jeep name'
      } else if (!jeepney.terminalLocation) {
        jeepney.valid = false
        jeepney.error = 'Missing terminal location'
      } else if (!jeepney.endPoint) {
        jeepney.valid = false
        jeepney.error = 'Missing end point'
      } else if (
        jeepney.fareRegular === null ||
        jeepney.fareStudent === null ||
        jeepney.fareSenior === null ||
        jeepney.farePWD === null
      ) {
        jeepney.valid = false
        jeepney.error = 'Missing fare values'
      }

      return jeepney
    },

    async startImport() {
      this.isImporting = true
      this.importStep = 3
      this.importedCount = 0
      this.importProgress = 0
      this.importLogs = []

      const validJeepneys = this.parsedJeepneys.filter((j) => j.valid)
      const total = validJeepneys.length

      for (let i = 0; i < validJeepneys.length; i++) {
        const jeepney = validJeepneys[i]

        try {
          const uniqueId = `JEEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

          console.log('[CSV Import] Before save:', {
            jeepName: jeepney.jeepName,
            operatingHours: jeepney.operatingHours,
          })

          let jeepneyData = {
            uniqueId: uniqueId,
            jeepName: jeepney.jeepName,
            terminalLocation: jeepney.terminalLocation,
            terminalLat: jeepney.terminalLat,
            terminalLng: jeepney.terminalLng,
            fareRegular: jeepney.fareRegular,
            fareStudent: jeepney.fareStudent,
            fareSenior: jeepney.fareSenior,
            farePWD: jeepney.farePWD,
            operatingHours: {
              open: jeepney.operatingHours.open || '',
              close: jeepney.operatingHours.close || '',
            },
            touristSpotsServiced: jeepney.touristSpotsServiced || [],
            routeCoordinates: [],
            endPoint: jeepney.endPoint,
            isActive: true,
            imageUrl: '',
            imagePublicId: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          // Normalize data before saving to avoid Firestore nested array errors
          jeepneyData = this.normalizeJeepneyData(jeepneyData)

          // Validate before saving
          const nestedArrayIssues = this.findNestedArrays(jeepneyData)
          if (nestedArrayIssues.length > 0) {
            throw new Error(`Validation failed: ${nestedArrayIssues[0]}`)
          }

          console.log('[CSV Import] Saving to Firebase:', jeepneyData.operatingHours)

          await addDoc(collection(db, 'jeepneys'), jeepneyData)

          this.importLogs.push({
            success: true,
            message: `Imported: ${jeepney.jeepName}`,
          })

          this.importedCount++
        } catch (error) {
          console.error('[CSV Import] Error:', error)
          this.importLogs.push({
            success: false,
            message: `Failed to import ${jeepney.jeepName}: ${error.message}`,
          })
        }

        this.importProgress = (i + 1) / total
      }

      this.isImporting = false

      this.$q.notify({
        type: 'positive',
        message: `Import completed: ${this.importedCount}/${total} jeepneys added`,
        position: 'top',
        timeout: 5000,
      })

      this.loadJeepneys()
    },

    closeCsvImportDialog() {
      this.showCsvImportDialog = false
      this.importStep = 1
      this.csvFile = null
      this.csvError = ''
      this.parsedJeepneys = []
      this.importProgress = 0
      this.importedCount = 0
      this.isImporting = false
      this.importLogs = []
    },
  },
}
</script>

<style lang="scss" scoped>
.text-pine-green {
  color: #2d6a4f;
}

.route-preview-card {
  position: relative;
}

.route-preview-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.image-preview-container {
  position: relative;
  display: inline-block;

  .image-preview {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .remove-image-btn {
    position: absolute;
    top: -8px;
    right: -8px;
  }
}

.map-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}
</style>
