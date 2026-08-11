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
    <div class="row q-mb-md items-center q-col-gutter-y-sm">
      <div class="col-12 col-sm">
        <h4 class="q-my-none text-pine-green">Jeepney Management</h4>
        <p class="text-grey-7 q-mb-none">Manage jeepney routes and information</p>
      </div>
      <div class="col-12 col-sm-auto q-gutter-sm">
        <template v-if="viewMode === 'active'">
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
        </template>
        <template v-if="viewMode === 'deleted'">
          <q-btn
            v-if="selectedJeepneys.length > 0"
            color="positive"
            :label="`Restore Selected (${selectedJeepneys.length})`"
            icon="restore"
            no-caps
            @click="bulkRestore"
          />
          <q-btn
            v-if="filteredJeepneys.length > 0"
            color="positive"
            outline
            :label="`Restore All (${filteredJeepneys.length})`"
            icon="restore_page"
            no-caps
            @click="restoreAllJeepneys"
          />
        </template>
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
        <q-btn-group outline class="q-mb-md bg-white">
          <q-btn
            :color="viewMode === 'active' ? 'primary' : 'white'"
            :text-color="viewMode === 'active' ? 'white' : 'primary'"
            label="Active"
            @click="viewMode = 'active'"
            no-caps
          />
          <q-btn
            :color="viewMode === 'deleted' ? 'negative' : 'white'"
            :text-color="viewMode === 'deleted' ? 'white' : 'negative'"
            label="Recently Deleted"
            @click="viewMode = 'deleted'"
            no-caps
          />
        </q-btn-group>
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
              <template v-if="viewMode === 'active'">
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
                  class="q-ml-xs"
                >
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </template>
              <template v-else>
                <q-btn
                  flat
                  dense
                  round
                  icon="restore"
                  color="positive"
                  @click="restoreJeepney(props.row)"
                >
                  <q-tooltip>Restore</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete_forever"
                  color="negative"
                  @click="confirmPermanentDelete(props.row)"
                  class="q-ml-xs"
                >
                  <q-tooltip>Permanently Delete</q-tooltip>
                </q-btn>
              </template>
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
          <div class="q-mb-md">
            <q-input
              ref="terminalInput"
              v-model="form.terminalLocation"
              outlined
              label="Terminal Location *"
              class="q-mb-xs"
              :rules="[(val) => !!val || 'Terminal location is required']"
              @input="onTerminalInput"
              @keyup.enter="searchTerminalLocation"
              @focus="disableTerminalAutoDetect"
            >
              <template #prepend>
                <q-btn
                  flat
                  dense
                  round
                  :icon="terminalAutoDetect ? 'gps_fixed' : 'gps_not_fixed'"
                  :color="terminalAutoDetect ? 'positive' : 'primary'"
                  @click="useCurrentLocation"
                >
                  <q-tooltip>Detect current location</q-tooltip>
                </q-btn>
              </template>
              <template #append>
                <q-btn
                  flat
                  dense
                  icon="clear"
                  color="grey"
                  size="sm"
                  v-if="form.terminalLocation"
                  @click="clearTerminalLocation"
                />
                <q-btn
                  flat
                  dense
                  icon="search"
                  color="primary"
                  size="sm"
                  @click="searchTerminalLocation"
                >
                  <q-tooltip>Search Baguio locations</q-tooltip>
                </q-btn>
              </template>
            </q-input>

            <q-menu
              v-if="terminalResults && terminalResults.length > 0"
              v-model="showTerminalMenu"
              :anchor="'bottom left'"
              :self="'top left'"
              :fit="true"
            >
              <q-list style="min-width: 300px">
                <q-item
                  v-for="(res, idx) in terminalResults"
                  :key="idx"
                  clickable
                  @click="selectTerminal(res)"
                >
                  <q-item-section>
                    <q-item-label>{{ res.label }}</q-item-label>
                    <q-item-label caption class="text-grey-6">{{ res.fullAddress }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>

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
            @filter="filterTouristSpots"
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
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2">Route Taken (Pin on Map)</div>
            <q-btn
              v-if="form.routeCoordinates && form.routeCoordinates.length > 0"
              outline
              color="negative"
              size="sm"
              icon="clear_all"
              label="Clear Route"
              @click="clearRoute"
            />
          </div>
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
          <div class="q-mb-md">
            <q-input
              ref="endPointInput"
              v-model="form.endPoint"
              outlined
              label="End Point *"
              class="q-mb-xs"
              :rules="[(val) => !!val || 'End point is required']"
              hint="Final destination of this route"
              @input="onEndPointInput"
              @keyup.enter="searchEndPointLocation"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  icon="clear"
                  color="grey"
                  size="sm"
                  v-if="form.endPoint"
                  @click="clearEndPoint"
                />
                <q-btn
                  flat
                  dense
                  icon="search"
                  color="primary"
                  size="sm"
                  @click="searchEndPointLocation"
                >
                  <q-tooltip>Search Baguio locations</q-tooltip>
                </q-btn>
              </template>
            </q-input>

            <q-menu
              v-if="endPointResults && endPointResults.length > 0"
              v-model="showEndPointMenu"
              :anchor="'bottom left'"
              :self="'top left'"
              :fit="true"
            >
              <q-list style="min-width: 300px">
                <q-item
                  v-for="(res, idx) in endPointResults"
                  :key="idx"
                  clickable
                  @click="selectEndPoint(res)"
                >
                  <q-item-section>
                    <q-item-label>{{ res.label }}</q-item-label>
                    <q-item-label caption class="text-grey-6">{{ res.fullAddress }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
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
import { db, auth } from 'src/boot/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { useGeocoding } from 'src/composables/useGeocoding'
import { useGeolocation } from 'src/composables/useGeolocation'
import { fetchPlaces, fuzzyMatch, callOSRM } from 'src/composables/useRouteGeneration'
import { getErrorMessage, isOnline } from 'src/utils/errorService'
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

  data() {
    return {
      jeepneys: [],
      search: '',
      viewMode: 'active',
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
      terminalAutoDetect: false,
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
      touristSpotsOptions: [],
      allPlaces: [], // Store all places for search and select
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
      // Autocomplete/search results for terminals and endpoints
      terminalResults: [],
      endPointResults: [],
      showTerminalMenu: false,
      showEndPointMenu: false,
      terminalSearchTimer: null,
      endPointSearchTimer: null,
    }
  },

  computed: {
    filteredJeepneys() {
      const baseJeepneys = this.jeepneys.filter((j) =>
        this.viewMode === 'active' ? !j.isDeleted : j.isDeleted
      )

      if (!this.search) return baseJeepneys

      const searchLower = this.search.toLowerCase()
      return baseJeepneys.filter(
        (jeepney) =>
          jeepney.jeepName?.toLowerCase().includes(searchLower) ||
          jeepney.terminalLocation?.toLowerCase().includes(searchLower) ||
          jeepney.endPoint?.toLowerCase().includes(searchLower)
      )
    },

    validCount() {
      return this.parsedJeepneys.filter((j) => j.valid).length
    },

    invalidCount() {
      return this.parsedJeepneys.filter((j) => !j.valid).length
    },

    routeWaypoints() {
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
  },

  mounted() {
    this.loadJeepneys()
    this.loadPlaces()
  },

  watch: {
    'form.terminalLat'(newLat) {
      this.updateStartingPinpoint(newLat, this.form.terminalLng)
    },
    'form.terminalLng'(newLng) {
      this.updateStartingPinpoint(this.form.terminalLat, newLng)
    },
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
    updateStartingPinpoint(lat, lng) {
      if (lat === null || lat === undefined || lng === null || lng === undefined || !this.map)
        return

      if (!this.form.routeCoordinates) {
        this.form.routeCoordinates = []
      }

      const newPoint = { lat: parseFloat(lat), lng: parseFloat(lng) }

      if (this.form.routeCoordinates.length > 0) {
        this.form.routeCoordinates[0] = newPoint
      } else {
        this.form.routeCoordinates.push(newPoint)
      }

      this.updateRouteLine(false)
    },

    clearEndPoint() {
      this.form.endPoint = ''
      this.showEndPointMenu = false
      this.endPointResults = []
    },

    async loadPlaces() {
      try {
        const querySnapshot = await getDocs(collection(db, 'places'))
        this.allPlaces = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // Default options are all place names
        this.touristSpotsOptions = this.allPlaces.map((p) => p.name).sort()
      } catch (error) {
        console.error('[Jeepneys] Error loading places:', error)
      }
    },

    filterTouristSpots(val, update) {
      if (val === '') {
        update(() => {
          this.touristSpotsOptions = this.allPlaces.map((p) => p.name).sort()
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.touristSpotsOptions = this.allPlaces
          .map((p) => p.name)
          .filter((v) => v.toLowerCase().indexOf(needle) > -1)
          .sort()
      })
    },

    async loadJeepneys() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(
          query(collection(db, 'jeepneys'), orderBy('jeepName', 'asc'))
        )
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
      const { getCurrentLocation } = useGeolocation()
      const { reverseGeocode } = useGeocoding()

      this.terminalAutoDetect = true
      this.$q.loading.show({ message: 'Detecting your current location...' })

      getCurrentLocation()
        .then(async (coords) => {
          this.form.terminalLat = coords.lat
          this.form.terminalLng = coords.lng

          try {
            const place = await reverseGeocode(coords.lat, coords.lng)
            this.form.terminalLocation = place?.label || 'Current location'
          } catch (err) {
            console.warn('[Jeepneys] Reverse geocode failed:', err)
            this.form.terminalLocation = 'Current location'
          }
        })
        .catch((error) => {
          console.warn('[Jeepneys] Location detection failed:', error)
          this.terminalAutoDetect = false
          this.$q.notify({
            type: 'negative',
            message: 'Unable to get location: ' + (error.message || 'Please try again'),
            position: 'top',
          })
        })
        .finally(() => {
          try {
            this.$q.loading.hide()
          } catch (e) {
            console.warn('[Jeepneys] Could not hide loading:', e)
          }
        })
    },

    disableTerminalAutoDetect() {
      if (this.terminalAutoDetect) {
        this.terminalAutoDetect = false
      }
    },

    clearTerminalLocation() {
      this.terminalAutoDetect = false
      this.form.terminalLocation = ''
      this.form.terminalLat = null
      this.form.terminalLng = null
      this.terminalResults = []
      this.showTerminalMenu = false
    },

    async searchTerminalLocation() {
      if (!this.form.terminalLocation || !this.form.terminalLocation.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter a terminal location',
          position: 'top',
        })
        return
      }

      const query = this.form.terminalLocation.trim()
      try {
        const { searchLocations } = useGeocoding()
        const results = await searchLocations(query, true)
        if (results && results.length > 0) {
          const bestMatch = results[0]
          this.selectTerminal(bestMatch)
          this.$q.notify({
            type: 'positive',
            message: `Terminal set to ${bestMatch.label}`,
            position: 'top',
            timeout: 2000,
          })
        } else {
          this.$q.notify({
            type: 'info',
            message: 'No Baguio match found. Using typed location.',
            position: 'top',
          })
        }
      } catch (err) {
        console.warn('[Jeepneys] Terminal search failed:', err)
        this.$q.notify({
          type: 'negative',
          message: 'Unable to search location. Please try again.',
          position: 'top',
        })
      }
    },

    // Autocomplete: handle input and search for terminal location
    onTerminalInput(val) {
      this.disableTerminalAutoDetect()
      clearTimeout(this.terminalSearchTimer)
      if (!val || val.trim().length < 3) {
        this.terminalResults = []
        this.showTerminalMenu = false
        return
      }
      this.terminalSearchTimer = setTimeout(() => this.searchTerminalLocations(val), 300)
    },

    async searchTerminalLocations(query) {
      const { searchLocations } = useGeocoding()
      try {
        const results = await searchLocations(query, true)
        this.terminalResults = results || []
        // Only open the menu when there are results to show.
        if (this.terminalResults && this.terminalResults.length > 0) {
          this.showTerminalMenu = true
        } else {
          this.showTerminalMenu = false
          this.$q.notify({ type: 'info', message: 'No Baguio matches found', position: 'top' })
        }
      } catch (err) {
        console.warn('[Jeepneys] Terminal search failed:', err)
        this.terminalResults = []
        this.showTerminalMenu = false
      }
    },

    selectTerminal(res) {
      if (!res) return
      this.form.terminalLocation = res.label || res.fullAddress || ''
      this.form.terminalLat = res.lat || null
      this.form.terminalLng = res.lng || null
      this.showTerminalMenu = false
      this.terminalResults = []
      if (this.map && this.form.terminalLat && this.form.terminalLng) {
        this.map.setView([this.form.terminalLat, this.form.terminalLng], 15)
      }
    },

    async searchEndPointLocation() {
      if (!this.form.endPoint || !this.form.endPoint.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter an end point',
          position: 'top',
        })
        return
      }

      const query = this.form.endPoint.trim()
      try {
        const { searchLocations } = useGeocoding()
        const results = await searchLocations(query, true)
        if (results && results.length > 0) {
          const bestMatch = results[0]
          this.selectEndPoint(bestMatch)
          this.$q.notify({
            type: 'positive',
            message: `End point set to ${bestMatch.label}`,
            position: 'top',
            timeout: 2000,
          })
        } else {
          this.$q.notify({
            type: 'info',
            message: 'No Baguio match found. Using typed end point.',
            position: 'top',
          })
        }
      } catch (err) {
        console.warn('[Jeepneys] End point search failed:', err)
        this.$q.notify({
          type: 'negative',
          message: 'Unable to search end point. Please try again.',
          position: 'top',
        })
      }
    },

    onEndPointInput(val) {
      clearTimeout(this.endPointSearchTimer)
      if (!val || val.trim().length < 3) {
        this.endPointResults = []
        this.showEndPointMenu = false
        return
      }
      this.endPointSearchTimer = setTimeout(() => this.searchEndPointLocations(val), 300)
    },

    async searchEndPointLocations(query) {
      const { searchLocations } = useGeocoding()
      try {
        const results = await searchLocations(query, true)
        this.endPointResults = results || []
        // Only open the menu when there are results to show.
        if (this.endPointResults && this.endPointResults.length > 0) {
          this.showEndPointMenu = true
        } else {
          this.showEndPointMenu = false
          this.$q.notify({ type: 'info', message: 'No Baguio matches found', position: 'top' })
        }
      } catch (err) {
        console.warn('[Jeepneys] End point search failed:', err)
        this.endPointResults = []
        this.showEndPointMenu = false
      }
    },

    selectEndPoint(res) {
      if (!res) return
      this.form.endPoint = res.label || res.fullAddress || ''
      this.showEndPointMenu = false
      this.endPointResults = []
      if (this.map && res.lat && res.lng) {
        this.map.setView([res.lat, res.lng], 15)
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
        const newPoint = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }
        // If we have at least a start and end point, insert the new point just before the end point
        if (this.form.routeCoordinates.length >= 2) {
          this.form.routeCoordinates.splice(this.form.routeCoordinates.length - 1, 0, newPoint)
        } else {
          this.form.routeCoordinates.push(newPoint)
        }
        this.updateRouteLine(false)
      })

      // Invalidate size after map is fully loaded
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
          // After invalidating size, redraw route if points exist. Use a slightly
          // longer delay to ensure the dialog/container is visible.
          setTimeout(() => {
            if (this.form.routeCoordinates && this.form.routeCoordinates.length > 0) {
              this.updateRouteLine(true)
            }
          }, 250)
        }
      }, 100)
    },

    updateRouteLine(fit = false) {
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
        interactive: false,
      }).addTo(this.map)

      // Add markers for each point so they are visible
      this.form.routeCoordinates.forEach((point, index) => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 5,
          fillColor: '#ffffff',
          color: '#d32f2f',
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(this.map)
        marker.bindTooltip(`Point ${index + 1}`)
        this.routeMarkers.push(marker)
      })

      // Fit map to show all points only if requested (e.g., initial load)
      if (fit) {
        this.map.fitBounds(L.latLngBounds(latlngs))
      }
    },

    removeRoutePoint(index) {
      if (this.form.routeCoordinates) {
        this.form.routeCoordinates.splice(index, 1)
        this.updateRouteLine(false)
      }
    },

    clearRoute() {
      if (this.form.routeCoordinates && this.form.routeCoordinates.length >= 2) {
        const start = this.form.routeCoordinates[0]
        const end = this.form.routeCoordinates[this.form.routeCoordinates.length - 1]
        this.form.routeCoordinates = [start, end]
        this.updateRouteLine(false)
      } else if (this.form.routeCoordinates) {
        this.form.routeCoordinates = []
        this.updateRouteLine(false)
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
            this.updateRouteLine(true)
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
        // Flatten nested arrays but safely traverse objects inside arrays
        const cleaned = obj
          .map((item, idx) => {
            if (Array.isArray(item)) {
              console.warn(
                `[JeepneyManagement] Found nested array at ${currentPath}[${idx}], taking first element or keeping as is if empty`
              )
              return item.length > 0 ? item[0] : null
            }
            if (typeof item === 'object' && item !== null) {
              // It's an object inside an array (e.g. {lat, lng}). Clean it recursively.
              return this.deepCleanData(item, String(idx), currentPath)
            }
            return item
          })
          .filter((item) => item !== null)
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

      // Normalize routeCoordinates - MUST be a flat array of {lng, lat} objects!
      // Firestore REJECTS nested arrays like [[lng, lat]]
      if (!Array.isArray(data.routeCoordinates)) {
        data.routeCoordinates = []
      } else {
        data.routeCoordinates = data.routeCoordinates
          .map((coord, idx) => {
            if (!coord) return null

            // Handle if it somehow stayed a nested array [lng, lat]
            if (Array.isArray(coord)) {
              if (coord.length >= 2) {
                return { lng: parseFloat(coord[0]), lat: parseFloat(coord[1]) }
              }
              return null
            }

            // Handle objects {lng, lat}
            if (typeof coord === 'object' && !Array.isArray(coord)) {
              if (coord.lng !== undefined && coord.lat !== undefined) {
                return { lng: parseFloat(coord.lng), lat: parseFloat(coord.lat) }
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

        // Store routeCoordinates as an array of {lat, lng} objects to avoid Firestore nested array errors
        const routeCoordinatesForStorage = (this.form.routeCoordinates || []).map((point) => ({
          lat: parseFloat(point.lat),
          lng: parseFloat(point.lng),
        }))

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

    async confirmDelete(jeepney) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: `Are you sure you want to delete "${jeepney.jeepName}"? It will be moved to Recently Deleted.`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            if (!isOnline()) {
              throw new Error('You appear to be offline. Please check your internet connection.')
            }

            const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
            const adminUid = sessionStorage.getItem('adminUid')
            const { logDelete } = await import('src/utils/activityLogger')

            // Soft delete
            await updateDoc(doc(db, 'jeepneys', jeepney.id), {
              isDeleted: true,
              deletedAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })

            await logDelete(
              { uid: adminUid, ...adminData },
              'jeepneys',
              jeepney.jeepName,
              jeepney.id
            )

            this.$q.notify({
              type: 'positive',
              message: 'Jeepney moved to Recently Deleted',
              position: 'top',
              icon: 'delete',
            })
            this.loadJeepneys()
          } catch (error) {
            console.error('[Jeepneys] Error deleting:', error)
            const message = getErrorMessage(error, 'Failed to delete jeepney. Please try again.')
            this.$q.notify({
              type: 'negative',
              message: message,
              position: 'top',
              timeout: 5000,
            })
          }
        })
    },

    async restoreJeepney(jeepney) {
      try {
        await updateDoc(doc(db, 'jeepneys', jeepney.id), {
          isDeleted: false,
          updatedAt: serverTimestamp(),
        })
        this.$q.notify({
          type: 'positive',
          message: `Restored "${jeepney.jeepName}"`,
          position: 'top',
        })
        this.loadJeepneys()
      } catch (error) {
        console.error('[Jeepneys] Error restoring:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to restore jeepney',
          position: 'top',
        })
      }
    },

    async confirmPermanentDelete(jeepney) {
      this.$q
        .dialog({
          title: 'Confirm Permanent Delete',
          message: `Are you sure you want to permanently delete "${jeepney.jeepName}"? This cannot be undone.`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            if (jeepney.imagePublicId) {
              await this.deleteImage(jeepney.imagePublicId)
            }
            await deleteDoc(doc(db, 'jeepneys', jeepney.id))
            this.$q.notify({
              type: 'positive',
              message: 'Jeepney permanently deleted',
              position: 'top',
            })
            this.loadJeepneys()
          } catch (error) {
            console.error('[Jeepneys] Error permanently deleting:', error)
            this.$q.notify({
              type: 'negative',
              message: 'Failed to permanently delete',
              position: 'top',
            })
          }
        })
    },

    async bulkDelete() {
      if (this.selectedJeepneys.length === 0) return

      this.$q
        .dialog({
          title: 'Confirm Bulk Action',
          message: `Are you sure you want to ${this.viewMode === 'deleted' ? 'permanently delete' : 'delete'} ${this.selectedJeepneys.length} selected jeepney(s)?`,
          cancel: true,
          persistent: true,
          ok: {
            label: this.viewMode === 'deleted' ? 'Permanently Delete' : 'Delete',
            color: 'negative',
            push: true,
          },
        })
        .onOk(async () => {
          const loadingDialog = this.$q.loading.show({
            message: `Processing ${this.selectedJeepneys.length} jeepney(s)...`,
          })

          try {
            const deletePromises = this.selectedJeepneys.map((jeepney) => {
              if (this.viewMode === 'deleted') {
                return deleteDoc(doc(db, 'jeepneys', jeepney.id))
              } else {
                return updateDoc(doc(db, 'jeepneys', jeepney.id), {
                  isDeleted: true,
                  deletedAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                })
              }
            })
            await Promise.all(deletePromises)

            this.selectedJeepneys = []
            await this.loadJeepneys()

            try {
              if (loadingDialog && loadingDialog.hide) loadingDialog.hide()
            } catch {
              console.warn('[Jeepneys] loadingDialog.hide() failed')
            }
            try {
              this.$q.loading.hide()
            } catch {
              /* ignore */
            }

            this.$q.notify({
              type: 'positive',
              message: `Successfully processed jeepney(s)`,
              position: 'top',
              timeout: 3000,
            })
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
            await this.loadJeepneys()

            try {
              if (loadingDialog && loadingDialog.hide) loadingDialog.hide()
            } catch {
              console.warn('[Jeepneys] loadingDialog.hide() failed')
            }
            try {
              this.$q.loading.hide()
            } catch {
              /* ignore */
            }

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
      waypoints,
    }) {
      if (!jeepneyId || !routeCoordinates?.length) return
      try {
        console.debug(
          '[JeepneyManagement] onApplyOsrmRoute currentUser:',
          auth.currentUser && auth.currentUser.uid
        )
        const update = {
          routeCoordinates,
          routeDistance: routeDistance ?? null,
          routeDuration: routeDuration ?? null,
          updatedAt: serverTimestamp(),
        }

        // If waypoints were provided (possibly with manual corrections), save them
        if (waypoints && waypoints.length > 0) {
          update.resolvedWaypoints = waypoints
          // Also update terminal coords if it's the first waypoint
          if (waypoints[0].name.toLowerCase().includes('terminal')) {
            update.terminalLat = waypoints[0].lat
            update.terminalLng = waypoints[0].lng
          }
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
        // Improved error message for permission issues
        const isPermError =
          err &&
          (err.code === 'permission-denied' ||
            (err.message &&
              err.message.toLowerCase().includes('missing or insufficient permissions')))
        if (isPermError) {
          const uid = auth && auth.currentUser ? auth.currentUser.uid : 'UNKNOWN'
          this.$q.notify({
            type: 'negative',
            message:
              `Could not save route: missing permissions. Your UID: ${uid}. ` +
              'Grant `routes_admin` (or `routes:write`) to this UID in Firestore `admins/{uid}` to allow saving routes.',
            position: 'top',
            timeout: 10000,
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: `Could not save route: ${err.message || err}`,
            position: 'top',
          })
        }
      }
    },

    /**
     * Build waypoints from jeepney data for display
     */

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

      // Normalize time strings to `HH:mm` (zero-pad single-digit hours)
      const normalizeTime = (t) => {
        if (!t) return ''
        const m = t.trim().match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,3}))?$/)
        if (!m) return ''
        const hh = m[1].padStart(2, '0')
        const mm = m[2].padStart(2, '0')
        return `${hh}:${mm}`
      }

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
          open: normalizeTime(operatingHoursOpen),
          close: normalizeTime(operatingHoursClose),
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

      // Pre-load places for fuzzy matching
      const places = await fetchPlaces().catch(() => [])
      const { searchLocations } = useGeocoding()

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

          // Generate Route Logic
          if (jeepney.terminalLat && jeepney.terminalLng) {
            this.importLogs.push({
              success: true,
              message: `Generating route for ${jeepney.jeepName}...`,
            })

            const terminal = {
              name: 'Terminal',
              latitude: jeepney.terminalLat,
              longitude: jeepney.terminalLng,
            }
            const intermediates = []

            for (const spotName of jeepney.touristSpotsServiced || []) {
              const place = fuzzyMatch(spotName, places)
              if (place && place.latitude && place.longitude) {
                intermediates.push({
                  name: place.name,
                  latitude: place.latitude,
                  longitude: place.longitude,
                })
              }
            }

            let endPointWaypoint = null
            if (jeepney.endPoint) {
              const endPlace = fuzzyMatch(jeepney.endPoint, places)
              if (endPlace && endPlace.latitude && endPlace.longitude) {
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
                  }
                } catch {
                  // Fallback without endpoint
                }
              }
            }

            const waypoints = [terminal, ...intermediates]
            if (endPointWaypoint) waypoints.push(endPointWaypoint)

            if (waypoints.length >= 2) {
              try {
                // Rate limit respect (OSRM public server allows ~1 request/sec)
                await new Promise((resolve) => setTimeout(resolve, 1100))

                const result = await callOSRM(waypoints)
                if (result && result.coordinates) {
                  jeepneyData.routeCoordinates = result.coordinates.map(([lng, lat]) => ({
                    lng,
                    lat,
                  }))
                  jeepneyData.routeDistance = result.distance
                  jeepneyData.routeDuration = result.duration

                  // Save resolved waypoints so they persist as corrected
                  jeepneyData.resolvedWaypoints = waypoints.map((w) => ({
                    name: w.name,
                    lat: w.latitude,
                    lng: w.longitude,
                  }))
                }
              } catch (osrmError) {
                console.warn(`[CSV Import] OSRM failed for ${jeepney.jeepName}:`, osrmError)
                this.importLogs.push({
                  success: false,
                  message: `OSRM failed for ${jeepney.jeepName}, route saved without polyline.`,
                })
              }
            }
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
            message: `Imported successfully: ${jeepney.jeepName}`,
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
        message: `Import completed: ${this.importedCount}/${total} jeepneys added with generated routes`,
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
<!-- --rabbit --K -->
