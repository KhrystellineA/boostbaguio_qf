<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Jeepney Management</h4>
        <p class="text-grey-7 q-mb-none">Manage jeepney routes and information</p>
      </div>
      <div class="col-auto">
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
        <q-input
          v-model="search"
          outlined
          placeholder="Search jeepneys..."
          dense
          class="q-mb-md"
        >
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
        >
          <template #body-cell-imageUrl="props">
            <q-td :props="props">
              <q-avatar v-if="props.value" size="60px" square>
                <img :src="props.value" />
              </q-avatar>
              <q-icon v-else name="directions_bus" size="40px" color="grey-4" />
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
          <div class="text-h6 text-pine-green">{{ editingJeepney ? 'Edit Jeepney' : 'Add New Jeepney' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Image Upload -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Jeepney Image</div>
            <div v-if="imagePreview || form.imageUrl" class="image-preview-container q-mb-sm">
              <img :src="imagePreview || form.imageUrl" class="image-preview" />
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
              <template #hint>
                Max 5MB (JPG, PNG, WebP)
              </template>
            </q-file>
          </div>

          <q-separator class="q-my-md" />

          <!-- 1. Jeep Name -->
          <q-input
            v-model="form.jeepName"
            outlined
            label="Jeepney Name *"
            class="q-mb-md"
            :rules="[val => !!val || 'Jeepney name is required']"
            hint="e.g., J-001, Market-SM Jeep"
          />

          <!-- 2. Terminal Location -->
          <q-input
            v-model="form.terminalLocation"
            outlined
            label="Terminal Location *"
            class="q-mb-md"
            :rules="[val => !!val || 'Terminal location is required']"
          >
            <template #append>
              <q-btn
                flat
                dense
                icon="my_location"
                color="primary"
                @click="useCurrentLocation"
              >
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
                  val => val !== undefined && val !== null || 'Required',
                  val => val >= 0 || 'Must be 0 or higher'
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
                  val => val !== undefined && val !== null || 'Required',
                  val => val >= 0 || 'Must be 0 or higher'
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
                  val => val !== undefined && val !== null || 'Required',
                  val => val >= 0 || 'Must be 0 or higher'
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
                  val => val !== undefined && val !== null || 'Required',
                  val => val >= 0 || 'Must be 0 or higher'
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
          <div class="map-container q-mb-md" ref="mapContainer" id="jeepney-map" style="height: 300px;"></div>
          <div v-if="form.routePoints && form.routePoints.length > 0" class="q-mb-md">
            <q-chip
              v-for="(point, index) in form.routePoints"
              :key="index"
              removable
              @remove="removeRoutePoint(index)"
              color="primary"
              text-color="white"
              size="sm"
            >
              Point {{ index + 1 }}: {{ point.lat.toFixed(4) }}, {{ point.lng.toFixed(4) }}
            </q-chip>
            <div class="text-caption text-grey-7">Click on map to add route points. Click chip to remove.</div>
          </div>

          <!-- 8. End Point -->
          <q-input
            v-model="form.endPoint"
            outlined
            label="End Point *"
            class="q-mb-md"
            :rules="[val => !!val || 'End point is required']"
            hint="Final destination of this route"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="editingJeepney ? 'Update' : 'Create'"
            style="background: #2d6a4f; color: white"
            @click="saveJeepney"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'JeepneyManagement',

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
      editingJeepney: null,
      imageFile: null,
      imagePreview: null,
      map: null,
      marker: null,
      routeLine: null,
      routeMarkers: [],
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
          close: ''
        },
        touristSpotsServiced: [],
        routePoints: [],
        endPoint: '',
        imageUrl: '',
        imagePublicId: ''
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
        'Mirador House'
      ],
      columns: [
        { name: 'image', label: 'Image', field: 'imageUrl', align: 'center' },
        { name: 'jeepName', label: 'Jeepney Name', field: 'jeepName', align: 'left', sortable: true },
        { name: 'terminalLocation', label: 'Terminal', field: 'terminalLocation', align: 'left' },
        { name: 'endPoint', label: 'End Point', field: 'endPoint', align: 'left' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ]
    }
  },

  computed: {
    filteredJeepneys() {
      if (!this.search) return this.jeepneys

      const searchLower = this.search.toLowerCase()
      return this.jeepneys.filter(jeepney =>
        jeepney.jeepName?.toLowerCase().includes(searchLower) ||
        jeepney.terminalLocation?.toLowerCase().includes(searchLower) ||
        jeepney.endPoint?.toLowerCase().includes(searchLower)
      )
    }
  },

  mounted() {
    this.loadJeepneys()
  },

  watch: {
    showAddDialog(val) {
      if (val) {
        this.$nextTick(() => {
          this.initMap()
        })
      }
    }
  },

  methods: {
    async loadJeepneys() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'jeepneys'))
        this.jeepneys = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('[Jeepneys] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load jeepneys',
          position: 'top'
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
        position: 'top'
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
        
        const uploadResult = await uploadOptimizedImage(
          this.imageFile,
          'baguiboost/jeepneys',
          {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            format: 'image/webp'
          }
        )

        return {
          imageUrl: uploadResult.url,
          imagePublicId: uploadResult.publicId
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
              position: 'top'
            })
          },
          (error) => {
            this.$q.notify({
              type: 'negative',
              message: 'Unable to get location: ' + error.message,
              position: 'top'
            })
          }
        )
      } else {
        this.$q.notify({
          type: 'negative',
          message: 'Geolocation is not supported by this browser',
          position: 'top'
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
      this.map = L.map('jeepney-map').setView([16.4023, 120.5960], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map)

      // Add click handler to add route points
      this.map.on('click', (e) => {
        if (!this.form.routePoints) {
          this.form.routePoints = []
        }
        this.form.routePoints.push({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
        this.updateRouteLine()
      })

      // Invalidate size after map is fully loaded
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
        }
      }, 100)
    },

    updateRouteLine() {
      if (!this.map || !this.form.routePoints || this.form.routePoints.length === 0) return

      // Remove existing layers
      if (this.routeLine) {
        this.map.removeLayer(this.routeLine)
      }
      if (this.routeMarkers) {
        this.routeMarkers.forEach(marker => this.map.removeLayer(marker))
      }
      this.routeMarkers = []

      // Draw polyline
      const latlngs = this.form.routePoints.map(point => [point.lat, point.lng])
      this.routeLine = L.polyline(latlngs, { 
        color: 'red', 
        weight: 4,
        opacity: 0.8
      }).addTo(this.map)

      // Add markers for each point
      this.form.routePoints.forEach((point, index) => {
        const marker = L.marker([point.lat, point.lng])
          .addTo(this.map)
          .bindPopup(`<b>Route Point ${index + 1}</b><br>Click chip below to remove`)
        this.routeMarkers.push(marker)
      })

      // Fit map to show all points
      this.map.fitBounds(L.latLngBounds(latlngs))
    },

    removeRoutePoint(index) {
      if (this.form.routePoints) {
        this.form.routePoints.splice(index, 1)
        this.updateRouteLine()
      }
    },

    editJeepney(jeepney) {
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
        operatingHours: jeepney.operatingHours || { open: '', close: '' },
        touristSpotsServiced: jeepney.touristSpotsServiced || [],
        routePoints: jeepney.routePoints || [],
        endPoint: jeepney.endPoint || '',
        imageUrl: jeepney.imageUrl || '',
        imagePublicId: jeepney.imagePublicId || ''
      }
      this.showAddDialog = true
      
      // Initialize map after dialog is shown
      this.$nextTick(() => {
        this.initMap()
        if (this.form.routePoints && this.form.routePoints.length > 0) {
          this.updateRouteLine()
        }
      })
    },

    async saveJeepney() {
      // Validate required fields
      if (!this.form.jeepName || !this.form.terminalLocation || !this.form.endPoint) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      // Validate fares
      if (this.form.fareRegular === null || this.form.fareStudent === null || 
          this.form.fareSenior === null || this.form.farePWD === null) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all fare values',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        // Generate unique ID
        const uniqueId = `JEEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        let imageData = {
          imageUrl: this.form.imageUrl || '',
          imagePublicId: this.form.imagePublicId || ''
        }

        if (this.imageFile) {
          imageData = await this.uploadImage()
        }

        const jeepneyData = {
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
          routePoints: this.form.routePoints,
          endPoint: this.form.endPoint,
          imageUrl: imageData.imageUrl,
          imagePublicId: imageData.imagePublicId,
          updatedAt: serverTimestamp()
        }

        if (this.editingJeepney) {
          await updateDoc(doc(db, 'jeepneys', this.editingJeepney.id), jeepneyData)
          this.$q.notify({
            type: 'positive',
            message: 'Jeepney updated successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000
          })
        } else {
          jeepneyData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'jeepneys'), jeepneyData)
          this.$q.notify({
            type: 'positive',
            message: 'Jeepney created successfully with ID: ' + uniqueId,
            position: 'top',
            icon: 'check_circle',
            timeout: 3000
          })
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
          timeout: 5000
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(jeepney) {
      this.$q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${jeepney.jeepName}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await deleteDoc(doc(db, 'jeepneys', jeepney.id))
          this.$q.notify({
            type: 'positive',
            message: 'Jeepney deleted successfully',
            position: 'top',
            icon: 'delete',
            timeout: 2000
          })
          this.loadJeepneys()
        } catch (error) {
          console.error('[Jeepneys] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete jeepney: ' + error.message,
            position: 'top',
            timeout: 5000
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
          close: ''
        },
        touristSpotsServiced: [],
        routePoints: [],
        endPoint: '',
        imageUrl: '',
        imagePublicId: ''
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

    onDialogHide() {
      this.resetForm()
    }
  }
}
</script>

<style lang="scss" scoped>
.text-pine-green {
  color: #2d6a4f;
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
