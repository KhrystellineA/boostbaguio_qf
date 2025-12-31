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

          <q-input
            v-model="form.title"
            outlined
            label="Event Title *"
            class="q-mb-md"
          />

          <q-input
            v-model="form.location"
            outlined
            label="Location *"
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.startDate"
                outlined
                type="date"
                label="Start Date *"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.endDate"
                outlined
                type="date"
                label="End Date *"
              />
            </div>
          </div>

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
              />
            </div>
          </div>

          <q-select
            v-model="form.status"
            outlined
            label="Status *"
            :options="statusOptions"
            class="q-mb-md"
          />

          <q-input
            v-model="form.organizer"
            outlined
            label="Organizer"
            class="q-mb-md"
          />

          <q-input
            v-model="form.contactEmail"
            outlined
            type="email"
            label="Contact Email"
            class="q-mb-md"
          />

          <q-input
            v-model="form.contactPhone"
            outlined
            label="Contact Phone"
            class="q-mb-md"
          />

          <q-input
            v-model="form.description"
            outlined
            type="textarea"
            label="Description"
            rows="3"
          />
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
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
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
        status: 'Upcoming',
        organizer: '',
        contactEmail: '',
        contactPhone: '',
        description: '',
        imageUrl: '',
        imagePath: '' 
      },
      statusOptions: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      columns: [
        { name: 'image', label: 'Image', field: 'imageUrl', align: 'center' },
        { name: 'title', label: 'Event Title', field: 'title', align: 'left', sortable: true },
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
      this.form.imagePath = ''
    },

    async uploadImage(eventId) {
      if (!this.imageFile) return null

      try {
        const storage = getStorage()
        const timestamp = Date.now()
        const fileName = `${eventId}_${timestamp}_${this.imageFile.name}`
        const storageRef = ref(storage, `events/${fileName}`)

        await uploadBytes(storageRef, this.imageFile)
        
        const downloadURL = await getDownloadURL(storageRef)
        
        return {
          imageUrl: downloadURL,
          imagePath: `events/${fileName}`
        }
      } catch (error) {
        console.error('[Events] Error uploading image:', error)
        throw error
      }
    },

    async deleteImage(imagePath) {
      if (!imagePath) return

      try {
        const storage = getStorage()
        const imageRef = ref(storage, imagePath)
        await deleteObject(imageRef)
      } catch (error) {
        console.error('[Events] Error deleting image:', error)
      }
    },

    editEvent(event) {
      this.editingEvent = event
      this.form = { ...event }
      this.showAddDialog = true
    },

    async saveEvent() {
      if (!this.form.title || !this.form.location || !this.form.startDate || !this.form.endDate || !this.form.status) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        let imageData = {
          imageUrl: this.form.imageUrl || '',
          imagePath: this.form.imagePath || ''
        }

        if (this.imageFile) {
          if (this.editingEvent?.imagePath) {
            await this.deleteImage(this.editingEvent.imagePath)
          }

          const eventId = this.editingEvent?.id || `temp_${Date.now()}`
          imageData = await this.uploadImage(eventId)
        }

        const eventData = {
          title: this.form.title,
          location: this.form.location,
          startDate: this.form.startDate,
          endDate: this.form.endDate,
          startTime: this.form.startTime || '',
          endTime: this.form.endTime || '',
          status: this.form.status,
          organizer: this.form.organizer || '',
          contactEmail: this.form.contactEmail || '',
          contactPhone: this.form.contactPhone || '',
          description: this.form.description || '',
          imageUrl: imageData.imageUrl,
          imagePath: imageData.imagePath,
          updatedAt: serverTimestamp()
        }

        if (this.editingEvent) {
          await updateDoc(doc(db, 'events', this.editingEvent.id), eventData)
          this.$q.notify({
            type: 'positive',
            message: 'Event updated successfully',
            position: 'top',
            icon: 'check_circle'
          })
        } else {
          eventData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'events'), eventData)
          this.$q.notify({
            type: 'positive',
            message: 'Event created successfully',
            position: 'top',
            icon: 'check_circle'
          })
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadEvents()
      } catch (error) {
        console.error('[Events] Error saving:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save event',
          position: 'top'
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
          if (event.imagePath) {
            await this.deleteImage(event.imagePath)
          }

          await deleteDoc(doc(db, 'events', event.id))
          
          this.$q.notify({
            type: 'positive',
            message: 'Event deleted successfully',
            position: 'top',
            icon: 'delete'
          })
          this.loadEvents()
        } catch (error) {
          console.error('[Events] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete event',
            position: 'top'
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

    resetForm() {
      this.form = {
        title: '',
        location: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        status: 'Upcoming',
        organizer: '',
        contactEmail: '',
        contactPhone: '',
        description: '',
        imageUrl: '',
        imagePath: ''
      }
      this.imageFile = null
      this.imagePreview = null
      this.editingEvent = null
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