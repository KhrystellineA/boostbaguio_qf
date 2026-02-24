<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Event Management</h4>
        <p class="text-grey-7 q-mb-none">Manage events and activities</p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Add Event"
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
          placeholder="Search events..."
          dense
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredEvents"
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

          <template #body-cell-featured="props">
            <q-td :props="props">
              <q-icon 
                v-if="props.value" 
                name="star" 
                color="amber" 
                size="24px"
              >
                <q-tooltip>Featured Event</q-tooltip>
              </q-icon>
              <q-icon v-else name="star_border" color="grey-4" size="24px" />
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.value)">
                {{ props.value }}
              </q-badge>
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
                @click="editEvent(props.row)"
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
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section>
          <div class="text-h6 text-pine-green">{{ editingEvent ? 'Edit Event' : 'Add New Event' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            <div class="text-subtitle2 q-mb-sm">Event Image</div>
            
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
              label="Choose Event Image"
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

          <!-- Event Name -->
          <q-input
            v-model="form.title"
            outlined
            label="Event Name *"
            class="q-mb-md"
            :rules="[val => !!val || 'Event name is required']"
          />

          <!-- Event Organizer -->
          <q-input
            v-model="form.organizer"
            outlined
            label="Event Organizer *"
            class="q-mb-md"
            :rules="[val => !!val || 'Event organizer is required']"
          />

          <!-- Event Location -->
          <q-input
            v-model="form.location"
            outlined
            label="Event Location *"
            class="q-mb-md"
            :rules="[val => !!val || 'Event location is required']"
          />

          <!-- Event Date -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.startDate"
                outlined
                type="date"
                label="Start Date *"
                :rules="[
                  val => !!val || 'Start date is required',
                  val => validateStartDate(val) || 'Start date cannot be in the past'
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.endDate"
                outlined
                type="date"
                label="End Date *"
                :rules="[
                  val => !!val || 'End date is required',
                  val => validateEndDate(val) || 'End date must be on or after start date'
                ]"
              />
            </div>
          </div>

          <!-- Event Time -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.startTime"
                outlined
                type="time"
                label="Start Time"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.endTime"
                outlined
                type="time"
                label="End Time"
                :rules="[
                  val => !val || !form.startTime || val >= form.startTime || 'End time must be on or after start time'
                ]"
              />
            </div>
          </div>

          <!-- Description -->
          <q-input
            v-model="form.description"
            outlined
            type="textarea"
            label="Description"
            rows="4"
            class="q-mb-md"
          />

          <!-- Featured Toggle -->
          <q-toggle
            v-model="form.featured"
            label="Featured Event (show on homepage)"
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
            :label="editingEvent ? 'Update' : 'Create'"
            style="background: #2d6a4f; color: white"
            @click="saveEvent"
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

export default {
  name: 'EventsManagement',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      events: [],
      search: '',
      loading: false,
      saving: false,
      showAddDialog: false,
      editingEvent: null,
      imageFile: null,
      imagePreview: null,
      form: {
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        organizer: '',
        description: '',
        imageUrl: '',
        imagePublicId: '',
        featured: false
      },
      statusOptions: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      columns: [
        { name: 'image', label: 'Image', field: 'imageUrl', align: 'center' },
        { name: 'featured', label: 'Featured', field: 'featured', align: 'center', sortable: true },
        { name: 'title', label: 'Event Name', field: 'title', align: 'left', sortable: true },
        { name: 'organizer', label: 'Organizer', field: 'organizer', align: 'left' },
        { name: 'location', label: 'Location', field: 'location', align: 'left' },
        { name: 'startDate', label: 'Start Date', field: 'startDate', align: 'left', sortable: true },
        { name: 'endDate', label: 'End Date', field: 'endDate', align: 'left' },
        { name: 'status', label: 'Status', field: 'status', align: 'left' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ]
    }
  },

  computed: {
    filteredEvents() {
      if (!this.search) return this.events
      
      const searchLower = this.search.toLowerCase()
      return this.events.filter(event => 
        event.title?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.organizer?.toLowerCase().includes(searchLower)
      )
    }
  },

  mounted() {
    this.loadEvents()
  },

  methods: {
    // Validate start date is not in the past
    validateStartDate(dateStr) {
      if (!dateStr) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(dateStr)
      return selectedDate >= today
    },

    // Validate end date is on or after start date
    validateEndDate(dateStr) {
      if (!dateStr || !this.form.startDate) return false
      const startDate = new Date(this.form.startDate)
      const endDate = new Date(dateStr)
      return endDate >= startDate
    },

    // Auto-calculate event status based on dates
    calculateStatus(startDate, endDate, startTime, endTime) {
      const now = new Date()
      const start = new Date(startDate)
      const end = new Date(endDate)

      // Add time if provided
      if (startTime) {
        const [hours, minutes] = startTime.split(':')
        start.setHours(parseInt(hours), parseInt(minutes))
      }
      if (endTime && endDate === startDate) {
        const [hours, minutes] = endTime.split(':')
        end.setHours(parseInt(hours), parseInt(minutes))
      }

      if (now < start) {
        return 'Upcoming'
      } else if (now >= start && now <= end) {
        return 'Ongoing'
      } else {
        return 'Completed'
      }
    },

    async loadEvents() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'events'))
        this.events = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('[Events] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load events',
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

    resetForm() {
      this.form = {
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        organizer: '',
        description: '',
        imageUrl: '',
        imagePublicId: '',
        featured: false
      }
      this.imageFile = null
      this.imagePreview = null
      this.editingEvent = null
    },

    async uploadImage() {
      if (!this.imageFile) return null

      try {
        const { uploadOptimizedImage } = await import('src/utils/cloudinary')
        
        const uploadResult = await uploadOptimizedImage(
          this.imageFile,
          'baguiboost/events',
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
        console.error('[Events] Error uploading image:', error)
        throw error
      }
    },

    async deleteImage(imagePublicId) {
      if (!imagePublicId) return
      // Note: Cloudinary deletion requires server-side API
      // Image will remain in Cloudinary but won't be referenced
      console.log('[Events] Image deletion skipped (requires server-side):', imagePublicId)
    },

    editEvent(event) {
      this.editingEvent = event
      this.form = { ...event }
      this.showAddDialog = true
    },

    async saveEvent() {
      // Validate required fields
      if (!this.form.title || !this.form.organizer || !this.form.location || !this.form.startDate || !this.form.endDate) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      // Validate dates
      if (!this.validateStartDate(this.form.startDate)) {
        this.$q.notify({
          type: 'negative',
          message: 'Start date cannot be in the past',
          position: 'top'
        })
        return
      }

      if (!this.validateEndDate(this.form.endDate)) {
        this.$q.notify({
          type: 'negative',
          message: 'End date must be on or after start date',
          position: 'top'
        })
        return
      }

      // Validate times
      if (this.form.startTime && this.form.endTime && this.form.endTime < this.form.startTime) {
        this.$q.notify({
          type: 'negative',
          message: 'End time must be on or after start time',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        // Auto-calculate status based on dates and times
        const status = this.calculateStatus(
          this.form.startDate,
          this.form.endDate,
          this.form.startTime,
          this.form.endTime
        )

        let imageData = {
          imageUrl: this.form.imageUrl || '',
          imagePublicId: this.form.imagePublicId || ''
        }

        if (this.imageFile) {
          // Delete old image if editing
          if (this.editingEvent?.imagePublicId) {
            // Note: Cloudinary deletion requires server-side API
            console.log('[Events] Old image will remain in Cloudinary:', this.editingEvent.imagePublicId)
          }

          const eventId = this.editingEvent?.id || `temp_${Date.now()}`
          imageData = await this.uploadImage(eventId)
        }

        const eventData = {
          title: this.form.title,
          organizer: this.form.organizer,
          location: this.form.location,
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          startTime: this.form.startTime || '',
          endTime: this.form.endTime || '',
          status: status, // Auto-calculated
          description: this.form.description || '',
          imageUrl: imageData.imageUrl,
          imagePublicId: imageData.imagePublicId,
          featured: this.form.featured || false,
          updatedAt: serverTimestamp()
        }

        if (this.editingEvent) {
          await updateDoc(doc(db, 'events', this.editingEvent.id), eventData)
          this.$q.notify({
            type: 'positive',
            message: 'Event updated successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000
          })
        } else {
          eventData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'events'), eventData)
          this.$q.notify({
            type: 'positive',
            message: 'Event created successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000
          })
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadEvents()
      } catch (error) {
        console.error('[Events] Error saving:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save event: ' + error.message,
          position: 'top',
          timeout: 5000
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(event) {
      this.$q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${event.title}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          if (event.imagePublicId) {
            await this.deleteImage(event.imagePublicId)
          }

          await deleteDoc(doc(db, 'events', event.id))

          this.$q.notify({
            type: 'positive',
            message: 'Event deleted successfully',
            position: 'top',
            icon: 'delete',
            timeout: 2000
          })
          this.loadEvents()
        } catch (error) {
          console.error('[Events] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete event: ' + error.message,
            position: 'top',
            timeout: 5000
          })
        }
      })
    },

    getStatusColor(status) {
      const colors = {
        'Upcoming': 'blue',
        'Ongoing': 'green',
        'Completed': 'grey',
        'Cancelled': 'red'
      }
      return colors[status] || 'grey'
    },

    onDialogHide() {
      this.resetForm()
    }
  },

  watch: {
    showAddDialog(val) {
      if (!val) {
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
</style>