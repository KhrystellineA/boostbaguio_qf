<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Place Management</h4>
        <p class="text-grey-7 q-mb-none">Manage places and destinations</p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Add Place"
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
          placeholder="Search places..."
          dense
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredPlaces"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template #body-cell-image="props">
            <q-td :props="props">
              <q-avatar v-if="props.value" size="60px" square>
                <img :src="props.value" />
              </q-avatar>
              <q-icon v-else name="image" size="40px" color="grey-4" />
            </q-td>
          </template>

          <template #body-cell-category="props">
            <q-td :props="props">
              <div class="row q-gutter-xs" style="flex-wrap: wrap;">
                <q-badge
                  v-for="cat in (Array.isArray(props.row.categories) ? props.row.categories : [props.row.category])"
                  :key="cat"
                  :color="getCategoryColor(cat)"
                >
                  {{ getCategoryLabel(cat) }}
                </q-badge>
              </div>
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
                @click="editPlace(props.row)"
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

    <q-dialog v-model="showAddDialog" @hide="onDialogHide">
      <q-card style="min-width: 700px; max-width: 800px">
        <q-card-section>
          <div class="text-h6 text-pine-green">{{ editingPlace ? 'Edit Place' : 'Add New Place' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Image Upload Section -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Place Image</div>
            
            <!-- Image Preview -->
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

            <!-- Upload Button -->
            <q-file
              v-model="imageFile"
              outlined
              label="Choose Place Image"
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

          <!-- Place Name -->
          <q-input
            v-model="form.name"
            outlined
            label="Place Name *"
            class="q-mb-md"
            :rules="[val => !!val || 'Place name is required']"
          />

          <!-- Category -->
          <q-select
            v-model="form.categories"
            outlined
            label="Categories *"
            :options="categories"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            multiple
            use-chips
            class="q-mb-md"
            :rules="[val => val && val.length > 0 || 'At least one category is required']"
            hint="Select one or more categories for filtering in Ayan Mo feature"
          />

          <!-- Address/Location -->
          <q-input
            v-model="form.address"
            outlined
            label="Address/Location *"
            class="q-mb-md"
            :rules="[val => !!val || 'Address is required']"
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

          <!-- Map for Pinpoint -->
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Pinpoint on Map</div>
            <div class="map-container" ref="mapContainer" id="place-map" style="height: 300px;"></div>
            <div v-if="form.latitude && form.longitude" class="q-mt-sm text-caption text-grey-7">
              Coordinates: {{ form.latitude.toFixed(6) }}, {{ form.longitude.toFixed(6) }}
            </div>
          </div>

          <!-- Description -->
          <q-input
            v-model="form.description"
            outlined
            type="textarea"
            label="Description *"
            rows="4"
            class="q-mb-md"
            :rules="[val => !!val || 'Description is required']"
          />

          <!-- Operating Hours -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.operatingHours.open"
                outlined
                type="time"
                label="Open Time"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.operatingHours.close"
                outlined
                type="time"
                label="Close Time"
              />
            </div>
          </div>
          <q-input
            v-model="form.operatingHours.days"
            outlined
            label="Operating Days"
            placeholder="e.g., Daily, Mon-Fri, Weekends only"
            class="q-mb-md"
          />

          <!-- Featured Toggle -->
          <q-toggle
            v-model="form.featured"
            label="Featured Place (show on homepage)"
            class="q-mb-md"
          >
            <template v-slot:before>
              <q-icon name="star" color="amber" />
            </template>
          </q-toggle>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="editingPlace ? 'Update' : 'Create'"
            style="background: #2d6a4f; color: white"
            @click="savePlace"
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

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default {
  name: 'PlacesManagement',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      places: [],
      search: '',
      loading: false,
      saving: false,
      showAddDialog: false,
      editingPlace: null,
      imageFile: null,
      imagePreview: null,
      map: null,
      marker: null,
      locationSearch: '',
      searchingLocation: false,
      form: {
        name: '',
        categories: [],
        address: '',
        latitude: null,
        longitude: null,
        description: '',
        operatingHours: {
          open: '',
          close: '',
          days: ''
        },
        imageUrl: '',
        imagePublicId: '',
        featured: false
      },
      categories: [
        { label: 'Tourist Spots', value: 'tourist-spot' },
        { label: 'Cafes & Restaurants', value: 'restaurant' },
        { label: 'Parks & Nature', value: 'park-nature' },
        { label: 'Museums & Culture', value: 'museum-culture' },
        { label: 'Shopping', value: 'shopping' },
        { label: 'Hotels & Lodging', value: 'hotel-lodging' },
        { label: 'Government', value: 'government' },
        { label: 'Hospital', value: 'hospital' },
        { label: 'School', value: 'school' },
        { label: 'Other', value: 'other' }
      ],
      columns: [
        { name: 'image', label: 'Image', field: 'imageUrl', align: 'center' },
        { name: 'featured', label: 'Featured', field: 'featured', align: 'center', sortable: true },
        { name: 'name', label: 'Place Name', field: 'name', align: 'left', sortable: true },
        { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
        { name: 'address', label: 'Address', field: 'address', align: 'left' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ]
    }
  },

  computed: {
    filteredPlaces() {
      if (!this.search) return this.places
      
      const searchLower = this.search.toLowerCase()
      return this.places.filter(place => 
        place.name?.toLowerCase().includes(searchLower) ||
        place.category?.toLowerCase().includes(searchLower) ||
        place.address?.toLowerCase().includes(searchLower) ||
        place.area?.toLowerCase().includes(searchLower)
      )
    }
  },

  mounted() {
    this.loadPlaces()
  },

  methods: {
    async loadPlaces() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'places'))
        this.places = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('[Places] Loaded places:', this.places.length)
      } catch (error) {
        console.error('[Places] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load places',
          position: 'top'
        })
      } finally {
        this.loading = false
      }
    },

    initMap() {
      this.$nextTick(() => {
        if (this.map) {
          this.map.remove()
        }

        // Default center: Baguio City
        const defaultLat = this.form.latitude || 16.4023
        const defaultLng = this.form.longitude || 120.5960

        this.map = L.map('place-map').setView([defaultLat, defaultLng], 15)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(this.map)

        // Add marker if coordinates exist
        if (this.form.latitude && this.form.longitude) {
          this.addMarker(this.form.latitude, this.form.longitude)
        }

        // Click to set location
        this.map.on('click', (e) => {
          this.setLocation(e.latlng.lat, e.latlng.lng)
        })

        // Force map to resize properly
        setTimeout(() => {
          this.map.invalidateSize()
        }, 300)
      })
    },

    addMarker(lat, lng) {
      if (this.marker) {
        this.map.removeLayer(this.marker)
      }

      this.marker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.map)

      // Update coordinates when marker is dragged
      this.marker.on('dragend', (e) => {
        const position = e.target.getLatLng()
        this.setLocation(position.lat, position.lng)
      })

      this.map.setView([lat, lng], 15)
    },

    setLocation(lat, lng) {
      this.form.latitude = lat
      this.form.longitude = lng
      this.addMarker(lat, lng)
    },

    async searchLocation() {
      if (!this.locationSearch.trim()) {
        this.$q.notify({
          type: 'warning',
          message: 'Please enter a location to search',
          position: 'top'
        })
        return
      }

      this.searchingLocation = true
      try {
        // Use Nominatim for geocoding (free, no API key needed)
        const query = encodeURIComponent(this.locationSearch + ', Baguio City, Philippines')
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
        )
        const data = await response.json()

        if (data && data.length > 0) {
          const result = data[0]
          const lat = parseFloat(result.lat)
          const lng = parseFloat(result.lon)
          
          this.setLocation(lat, lng)
          
          this.$q.notify({
            type: 'positive',
            message: 'Location found! Click on the map to adjust if needed.',
            position: 'top'
          })
        } else {
          this.$q.notify({
            type: 'warning',
            message: 'Location not found. Try a different search term.',
            position: 'top'
          })
        }
      } catch (error) {
        console.error('[Places] Error searching location:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to search location',
          position: 'top'
        })
      } finally {
        this.searchingLocation = false
      }
    },

    useCurrentLocation() {
      if (!navigator.geolocation) {
        this.$q.notify({
          type: 'warning',
          message: 'Geolocation is not supported by your browser',
          position: 'top'
        })
        return
      }

      this.$q.notify({
        type: 'info',
        message: 'Getting your current location...',
        position: 'top'
      })

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          this.setLocation(lat, lng)
          
          this.$q.notify({
            type: 'positive',
            message: 'Current location set successfully',
            position: 'top'
          })
        },
        (error) => {
          console.error('[Places] Geolocation error:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to get current location. Please enable location services.',
            position: 'top'
          })
        }
      )
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
      this.form.imagePath = ''
    },

    async uploadImage() {
      if (!this.imageFile) return null

      try {
        const { uploadOptimizedImage } = await import('src/utils/cloudinary')
        
        const uploadResult = await uploadOptimizedImage(
          this.imageFile,
          'baguiboost/places',
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
        console.error('[Places] Error uploading image:', error)
        throw error
      }
    },

    async deleteImage(imagePublicId) {
      if (!imagePublicId) return
      // Note: Cloudinary deletion requires server-side API
      console.log('[Places] Image deletion skipped (requires server-side):', imagePublicId)
    },

    editPlace(place) {
      this.editingPlace = place
      this.form = {
        name: place.name || '',
        categories: Array.isArray(place.categories) ? place.categories : (place.category ? [place.category] : []),
        address: place.address || '',
        latitude: place.latitude || null,
        longitude: place.longitude || null,
        description: place.description || '',
        operatingHours: place.operatingHours || { open: '', close: '', days: '' },
        imageUrl: place.imageUrl || '',
        imagePublicId: place.imagePublicId || '',
        featured: place.featured || false
      }
      this.showAddDialog = true
      this.initMap()
    },

    async savePlace() {
      // Validate required fields
      if (!this.form.name || !this.form.categories || this.form.categories.length === 0 || !this.form.address || !this.form.description) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      // Validate location
      if (!this.form.latitude || !this.form.longitude) {
        this.$q.notify({
          type: 'warning',
          message: 'Please set the location on the map',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        let imageData = {
          imageUrl: this.form.imageUrl || '',
          imagePublicId: this.form.imagePublicId || ''
        }

        // Handle image upload
        if (this.imageFile) {
          if (this.editingPlace?.imagePublicId) {
            // Note: Cloudinary deletion requires server-side API
            console.log('[Places] Old image will remain in Cloudinary:', this.editingPlace.imagePublicId)
          }

          imageData = await this.uploadImage()
        }

        const placeData = {
          name: this.form.name,
          categories: this.form.categories,
          address: this.form.address,
          latitude: this.form.latitude,
          longitude: this.form.longitude,
          description: this.form.description,
          operatingHours: this.form.operatingHours,
          imageUrl: imageData.imageUrl,
          imagePublicId: imageData.imagePublicId,
          featured: this.form.featured || false,
          updatedAt: serverTimestamp()
        }

        if (this.editingPlace) {
          await updateDoc(doc(db, 'places', this.editingPlace.id), placeData)
          this.$q.notify({
            type: 'positive',
            message: 'Place updated successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000
          })
        } else {
          placeData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'places'), placeData)
          this.$q.notify({
            type: 'positive',
            message: 'Place created successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000
          })
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadPlaces()
      } catch (error) {
        console.error('[Places] Error saving:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save place: ' + error.message,
          position: 'top',
          timeout: 5000
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(place) {
      this.$q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${place.name}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          if (place.imagePath) {
            await this.deleteImage(place.imagePath)
          }

          await deleteDoc(doc(db, 'places', place.id))
          
          this.$q.notify({
            type: 'positive',
            message: 'Place deleted successfully',
            position: 'top',
            icon: 'delete'
          })
          this.loadPlaces()
        } catch (error) {
          console.error('[Places] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete place',
            position: 'top'
          })
        }
      })
    },

    getCategoryColor(category) {
      const colors = {
        'tourist-spot': 'green',
        'restaurant': 'orange',
        'park-nature': 'teal',
        'museum-culture': 'purple',
        'shopping': 'pink',
        'hotel-lodging': 'blue',
        'government': 'red',
        'hospital': 'pink',
        'school': 'indigo',
        'other': 'grey'
      }
      return colors[category] || 'grey'
    },

    getCategoryLabel(category) {
      const labels = {
        'tourist-spot': 'Tourist Spots',
        'restaurant': 'Cafes & Restaurants',
        'park-nature': 'Parks & Nature',
        'museum-culture': 'Museums & Culture',
        'shopping': 'Shopping',
        'hotel-lodging': 'Hotels & Lodging',
        'government': 'Government',
        'hospital': 'Hospital',
        'school': 'School',
        'other': 'Other'
      }
      return labels[category] || category
    },

    resetForm() {
      this.form = {
        name: '',
        categories: [],
        address: '',
        latitude: null,
        longitude: null,
        description: '',
        operatingHours: {
          open: '',
          close: '',
          days: ''
        },
        imageUrl: '',
        imagePublicId: '',
        featured: false
      }
      this.imageFile = null
      this.imagePreview = null
      this.editingPlace = null

      if (this.map) {
        this.map.remove()
        this.map = null
      }
      if (this.marker) {
        this.marker = null
      }
    },

    onDialogHide() {
      this.resetForm()
    }
  },

  watch: {
    showAddDialog(val) {
      if (val) {
        this.initMap()
      } else {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text-pine-green
  color: #2d6a4f

.image-preview-container
  position: relative
  width: 100%
  max-width: 400px
  border-radius: 8px
  overflow: hidden
  border: 2px solid #e0e0e0

.image-preview
  width: 100%
  height: 200px
  object-fit: cover
  display: block

.remove-image-btn
  position: absolute
  top: 8px
  right: 8px

.map-container
  width: 100%
  height: 400px
  border-radius: 8px
  overflow: hidden
  border: 2px solid #e0e0e0

.coordinates-display
  display: flex
  align-items: center
  flex-wrap: wrap
</style>