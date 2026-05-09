<!--
  Admin module: events / festivals / concerts (the `events` Firestore
  collection).
  - Searchable table + multi-select bulk delete.
  - Add/edit dialog with image upload, date pickers, organizer info.
  - CSV bulk import.
  - Per-row "Request to feature" button (amber sparkle icon) for non-super
    admins, mirroring PlacesManagement.
  Mounted from: AdminDashboard when activeMenu === 'events'.
-->
<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Event Management</h4>
        <p class="text-grey-7 q-mb-none">Manage events and activities</p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          v-if="selectedEvents.length > 0"
          color="negative"
          :label="`Delete Selected (${selectedEvents.length})`"
          icon="delete"
          no-caps
          @click="bulkDelete"
        />
        <q-btn
          v-if="filteredEvents.length > 0"
          color="negative"
          outline
          :label="`Delete All (${filteredEvents.length})`"
          icon="delete_sweep"
          no-caps
          @click="deleteAllEvents"
        />
        <q-btn
          outline
          style="border-color: #2d6a4f; color: #2d6a4f"
          label="Download CSV Template"
          icon="download"
          no-caps
          @click="downloadCsvTemplate"
          aria-label="Download CSV template for events"
        />
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Import CSV"
          icon="upload_file"
          no-caps
          @click="showCsvImportDialog = true"
          aria-label="Import events from CSV"
        />
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
        <q-input v-model="search" outlined placeholder="Search events..." dense class="q-mb-md">
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
          v-model:selected="selectedEvents"
          selection="multiple"
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
              <q-icon v-if="props.value" name="star" color="amber" size="24px">
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
                v-if="!isSuperAdmin && !props.row.featured"
                flat
                dense
                round
                icon="auto_awesome"
                color="amber-9"
                class="q-ml-xs"
                :loading="featureRequestPendingId === props.row.id"
                @click="requestFeature(props.row)"
              >
                <q-tooltip>Request to feature</q-tooltip>
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
          <div class="text-h6 text-pine-green">
            {{ editingEvent ? 'Edit Event' : 'Add New Event' }}
          </div>
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
              <template #hint> Max 5MB (JPG, PNG, WebP) </template>
            </q-file>
          </div>

          <q-separator class="q-my-md" />

          <!-- Event Name -->
          <q-input
            v-model="form.title"
            outlined
            label="Event Name *"
            class="q-mb-md"
            :rules="[
              (val) => required(val, 'Event name').valid || required(val, 'Event name').message,
              (val) =>
                minLength(val, 3, 'Event name').valid || minLength(val, 3, 'Event name').message,
              (val) =>
                maxLength(val, 200, 'Event name').valid ||
                maxLength(val, 200, 'Event name').message,
            ]"
          />

          <!-- Event Organizer -->
          <q-input
            v-model="form.organizer"
            outlined
            label="Event Organizer *"
            class="q-mb-md"
            :rules="[
              (val) =>
                required(val, 'Event organizer').valid || required(val, 'Event organizer').message,
              (val) =>
                minLength(val, 2, 'Event organizer').valid ||
                minLength(val, 2, 'Event organizer').message,
              (val) =>
                maxLength(val, 100, 'Event organizer').valid ||
                maxLength(val, 100, 'Event organizer').message,
            ]"
          />

          <!-- Event Location -->
          <q-input
            v-model="form.location"
            outlined
            label="Event Location *"
            class="q-mb-md"
            :rules="[
              (val) =>
                required(val, 'Event location').valid || required(val, 'Event location').message,
              (val) =>
                minLength(val, 5, 'Event location').valid ||
                minLength(val, 5, 'Event location').message,
              (val) =>
                maxLength(val, 200, 'Event location').valid ||
                maxLength(val, 200, 'Event location').message,
            ]"
          />

          <!-- Event Date -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.startDate"
                outlined
                type="date"
                label="Start Date *"
                :min="todayDate"
                :rules="[
                  (val) => required(val, 'Start date').valid || required(val, 'Start date').message,
                  (val) => notInPast(val).valid || notInPast(val).message,
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.endDate"
                outlined
                type="date"
                label="End Date *"
                :min="form.startDate || todayDate"
                :rules="[
                  (val) => required(val, 'End date').valid || required(val, 'End date').message,
                  (val) =>
                    dateOnOrAfter(val, this.form.startDate).valid ||
                    dateOnOrAfter(val, this.form.startDate).message,
                ]"
              />
            </div>
          </div>

          <!-- Event Time -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input v-model="form.startTime" outlined type="time" label="Start Time" />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.endTime"
                outlined
                type="time"
                label="End Time"
                :rules="[
                  (val) =>
                    !val ||
                    !form.startTime ||
                    val >= form.startTime ||
                    'End time must be on or after start time',
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

    <!-- CSV Import Dialog -->
    <q-dialog v-model="showCsvImportDialog" persistent>
      <q-card style="min-width: 800px; max-width: 1000px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="upload_file" class="q-mr-sm" />
            Import Events from CSV
          </div>
        </q-card-section>

        <q-card-section>
          <!-- Step 1: File Upload -->
          <div v-if="importStep === 1">
            <div class="text-body2 q-mb-md">
              Upload a CSV file containing event data. Make sure to follow the template format.
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
                title, organizer, location, start_date, end_date<br /><br />
                <strong>Optional columns:</strong><br />
                start_time, end_time, description, image_url, featured<br /><br />
                <strong>Notes:</strong><br />
                • <code>start_date</code> and <code>end_date</code> use the format
                <code>YYYY-MM-DD</code> (e.g. 2026-12-25)<br />
                • <code>start_time</code> and <code>end_time</code> use 24-hour format
                <code>HH:MM</code> (e.g. 14:30)<br />
                • <code>featured</code> accepts true/false (default: false)<br />
                • Event status is auto-calculated from the dates and is not imported
              </div>
            </q-banner>
          </div>

          <!-- Step 2: Preview Data -->
          <div v-if="importStep === 2">
            <div class="text-body2 q-mb-md">
              Preview of {{ parsedEvents.length }} event(s) to be imported:
            </div>

            <q-table
              :rows="parsedEvents"
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
            <div class="text-body2 q-mb-md text-center">Importing events... Please wait.</div>

            <q-linear-progress :value="importProgress" color="primary" class="q-mb-md" />

            <div class="text-center">
              <q-badge color="primary" class="q-pa-sm">
                {{ importedCount }} / {{ parsedEvents.length }} imported
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
/* eslint-disable no-unused-vars */
import {
  required,
  minLength,
  maxLength,
  notInPast,
  dateOnOrAfter,
  email,
} from 'src/utils/validation'
/* eslint-enable no-unused-vars */
import { submitFeatureRequest } from 'src/composables/useFeatureRequests'

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
      selectedEvents: [],
      featureRequestPendingId: '',
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
        featured: false,
      },
      statusOptions: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      columns: [
        { name: 'image', label: 'Image', field: 'imageUrl', align: 'center' },
        { name: 'featured', label: 'Featured', field: 'featured', align: 'center', sortable: true },
        { name: 'title', label: 'Event Name', field: 'title', align: 'left', sortable: true },
        { name: 'organizer', label: 'Organizer', field: 'organizer', align: 'left' },
        { name: 'location', label: 'Location', field: 'location', align: 'left' },
        {
          name: 'startDate',
          label: 'Start Date',
          field: 'startDate',
          align: 'left',
          sortable: true,
        },
        { name: 'endDate', label: 'End Date', field: 'endDate', align: 'left' },
        { name: 'status', label: 'Status', field: 'status', align: 'left' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
      ],

      // CSV Import
      showCsvImportDialog: false,
      importStep: 1,
      csvFile: null,
      csvError: '',
      parsedEvents: [],
      importProgress: 0,
      importedCount: 0,
      isImporting: false,
      importLogs: [],
      previewColumns: [
        { name: 'title', label: 'Event Name', field: 'title', align: 'left', sortable: true },
        { name: 'organizer', label: 'Organizer', field: 'organizer', align: 'left' },
        { name: 'location', label: 'Location', field: 'location', align: 'left' },
        { name: 'startDate', label: 'Start', field: 'startDate', align: 'center' },
        { name: 'endDate', label: 'End', field: 'endDate', align: 'center' },
        { name: 'valid', label: 'Status', field: 'valid', align: 'center' },
        { name: 'error', label: 'Error', field: 'error', align: 'left' },
      ],
    }
  },

  computed: {
    todayDate() {
      // Returns today's date in YYYY-MM-DD format for the date picker min attribute
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    filteredEvents() {
      if (!this.search) return this.events

      const searchLower = this.search.toLowerCase()
      return this.events.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower) ||
          event.organizer?.toLowerCase().includes(searchLower)
      )
    },
    validCount() {
      return this.parsedEvents.filter((e) => e.valid).length
    },
    invalidCount() {
      return this.parsedEvents.filter((e) => !e.valid).length
    },
    isSuperAdmin() {
      try {
        const cached = JSON.parse(sessionStorage.getItem('adminData') || '{}')
        return cached.role === 'super_admin'
      } catch {
        return false
      }
    },
    currentAdmin() {
      try {
        return JSON.parse(sessionStorage.getItem('adminData') || '{}')
      } catch {
        return {}
      }
    },
  },

  mounted() {
    this.loadEvents()
  },

  methods: {
    /** Submit a "please feature this event" request to super-admin notifications. */
    async requestFeature(event) {
      if (!event?.id) return
      this.featureRequestPendingId = event.id
      try {
        await submitFeatureRequest({
          targetType: 'event',
          targetId: event.id,
          targetName: event.title || '',
          requestedByName: this.currentAdmin.name,
          requestedByRole: this.currentAdmin.role,
        })
        this.$q.notify({
          type: 'positive',
          message: `Sent! Super admin will review "${event.title}".`,
          position: 'top',
        })
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.message || 'Could not submit request',
          position: 'top',
        })
      } finally {
        this.featureRequestPendingId = ''
      }
    },

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
        this.events = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      } catch (error) {
        console.error('[Events] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load events',
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
        featured: false,
      }
      this.imageFile = null
      this.imagePreview = null
      this.editingEvent = null
    },

    async uploadImage() {
      if (!this.imageFile) return null

      try {
        const { uploadOptimizedImage } = await import('src/utils/cloudinary')

        const uploadResult = await uploadOptimizedImage(this.imageFile, 'baguiboost/events', {
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
      if (
        !this.form.title ||
        !this.form.organizer ||
        !this.form.location ||
        !this.form.startDate ||
        !this.form.endDate
      ) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top',
        })
        return
      }

      // Validate dates
      if (!this.validateStartDate(this.form.startDate)) {
        this.$q.notify({
          type: 'negative',
          message: 'Start date cannot be in the past',
          position: 'top',
        })
        return
      }

      if (!this.validateEndDate(this.form.endDate)) {
        this.$q.notify({
          type: 'negative',
          message: 'End date must be on or after start date',
          position: 'top',
        })
        return
      }

      // Validate times
      if (this.form.startTime && this.form.endTime && this.form.endTime < this.form.startTime) {
        this.$q.notify({
          type: 'negative',
          message: 'End time must be on or after start time',
          position: 'top',
        })
        return
      }

      this.saving = true
      try {
        const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
        const adminUid = sessionStorage.getItem('adminUid')
        const { logCreate, logUpdate } = await import('src/utils/activityLogger')

        // Auto-calculate status based on dates and times
        const status = this.calculateStatus(
          this.form.startDate,
          this.form.endDate,
          this.form.startTime,
          this.form.endTime
        )

        let imageData = {
          imageUrl: this.form.imageUrl || '',
          imagePublicId: this.form.imagePublicId || '',
        }

        if (this.imageFile) {
          // Delete old image if editing
          if (this.editingEvent?.imagePublicId) {
            // Note: Cloudinary deletion requires server-side API
            console.log(
              '[Events] Old image will remain in Cloudinary:',
              this.editingEvent.imagePublicId
            )
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
          updatedAt: serverTimestamp(),
        }

        if (this.editingEvent) {
          await updateDoc(doc(db, 'events', this.editingEvent.id), eventData)

          // Log activity
          await logUpdate(
            { uid: adminUid, ...adminData },
            'events',
            this.form.title,
            this.editingEvent.id
          )

          this.$q.notify({
            type: 'positive',
            message: 'Event updated successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000,
          })
        } else {
          eventData.createdAt = serverTimestamp()
          const docRef = await addDoc(collection(db, 'events'), eventData)

          // Log activity
          await logCreate({ uid: adminUid, ...adminData }, 'events', this.form.title, docRef.id)

          this.$q.notify({
            type: 'positive',
            message: 'Event created successfully',
            position: 'top',
            icon: 'check_circle',
            timeout: 2000,
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
          timeout: 5000,
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(event) {
      this.$q
        .dialog({
          title: 'Confirm Delete',
          message: `Are you sure you want to delete "${event.title}"?`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          try {
            const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
            const adminUid = sessionStorage.getItem('adminUid')
            const { logDelete } = await import('src/utils/activityLogger')

            if (event.imagePublicId) {
              await this.deleteImage(event.imagePublicId)
            }

            await deleteDoc(doc(db, 'events', event.id))

            // Log activity
            await logDelete({ uid: adminUid, ...adminData }, 'events', event.title, event.id)

            this.$q.notify({
              type: 'positive',
              message: 'Event deleted successfully',
              position: 'top',
              icon: 'delete',
              timeout: 2000,
            })
            this.loadEvents()
          } catch (error) {
            console.error('[Events] Error deleting:', error)
            this.$q.notify({
              type: 'negative',
              message: 'Failed to delete event: ' + error.message,
              position: 'top',
              timeout: 5000,
            })
          }
        })
    },

    async bulkDelete() {
      if (this.selectedEvents.length === 0) {
        this.$q.notify({
          type: 'warning',
          message: 'Please select events to delete',
          position: 'top',
        })
        return
      }

      this.$q
        .dialog({
          title: 'Confirm Bulk Delete',
          message: `Are you sure you want to delete ${this.selectedEvents.length} event(s)? This action cannot be undone.`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          this.loading = true
          try {
            const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
            const adminUid = sessionStorage.getItem('adminUid')
            const { logBulkDelete } = await import('src/utils/activityLogger')

            const deletePromises = this.selectedEvents.map((event) =>
              deleteDoc(doc(db, 'events', event.id))
            )
            await Promise.all(deletePromises)

            // Log activity
            await logBulkDelete(
              { uid: adminUid, ...adminData },
              'events',
              this.selectedEvents.length,
              this.selectedEvents.map((e) => e.id)
            )

            this.$q.notify({
              type: 'positive',
              message: `${this.selectedEvents.length} event(s) deleted successfully`,
              position: 'top',
              icon: 'delete',
            })

            this.selectedEvents = []
            this.loadEvents()
          } catch (error) {
            console.error('[Events] Error bulk deleting:', error)
            this.$q.notify({
              type: 'negative',
              message: 'Failed to delete events',
              position: 'top',
            })
          } finally {
            this.loading = false
          }
        })
    },

    async deleteAllEvents() {
      if (this.filteredEvents.length === 0) {
        this.$q.notify({
          type: 'warning',
          message: 'No events to delete',
          position: 'top',
        })
        return
      }

      this.$q
        .dialog({
          title: 'Confirm Delete All',
          message: `Are you sure you want to delete ALL ${this.filteredEvents.length} event(s)? This action cannot be undone.`,
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          this.loading = true
          try {
            const deletePromises = this.filteredEvents.map((event) =>
              deleteDoc(doc(db, 'events', event.id))
            )
            await Promise.all(deletePromises)

            this.$q.notify({
              type: 'positive',
              message: `${this.filteredEvents.length} event(s) deleted successfully`,
              position: 'top',
              icon: 'delete',
            })

            this.selectedEvents = []
            this.loadEvents()
          } catch (error) {
            console.error('[Events] Error deleting all:', error)
            this.$q.notify({
              type: 'negative',
              message: 'Failed to delete events',
              position: 'top',
            })
          } finally {
            this.loading = false
          }
        })
    },

    getStatusColor(status) {
      const colors = {
        Upcoming: 'blue',
        Ongoing: 'green',
        Completed: 'grey',
        Cancelled: 'red',
      }
      return colors[status] || 'grey'
    },

    onDialogHide() {
      this.resetForm()
    },

    // CSV Import / Export
    downloadCsvTemplate() {
      const headers = [
        'title',
        'organizer',
        'location',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'description',
        'image_url',
        'featured',
      ]

      const escapeCsv = (value) => {
        if (value === null || value === undefined) return ''
        const str = String(value)
        if (/[",\r\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const rows = this.events.map((e) =>
        [
          e.title || '',
          e.organizer || '',
          e.location || '',
          e.startDate || '',
          e.endDate || '',
          e.startTime || '',
          e.endTime || '',
          e.description || '',
          e.imageUrl || '',
          e.featured ? 'true' : 'false',
        ]
          .map(escapeCsv)
          .join(',')
      )

      // Fall back to a sample row if no current data, so the format is still visible
      if (rows.length === 0) {
        rows.push(
          [
            'Panagbenga Festival',
            'Baguio City Tourism Office',
            'Session Road, Baguio City',
            '2026-02-01',
            '2026-02-28',
            '08:00',
            '20:00',
            'Annual flower festival celebrating the blooming season in Baguio.',
            '',
            'true',
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
        this.events.length > 0 ? `events_current_data_${today}.csv` : 'events_import_template.csv'

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
          this.events.length > 0
            ? `Downloaded ${this.events.length} event(s) as CSV`
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
          const csvText = e.target.result.replace(/^\uFEFF/, '')
          const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '')

          if (lines.length < 2) {
            this.csvError = 'CSV file is empty or invalid'
            return
          }

          const headers = this.parseCsvLine(lines[0])
          const requiredHeaders = ['title', 'organizer', 'location', 'start_date', 'end_date']

          const normalizedHeaders = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
          const missingHeaders = requiredHeaders.filter((h) => !normalizedHeaders.includes(h))
          if (missingHeaders.length > 0) {
            this.csvError = `Missing required columns: ${missingHeaders.join(', ')}`
            return
          }

          const parsed = []
          for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i])
            parsed.push(this.mapCsvRow(headers, values, i))
          }

          this.parsedEvents = parsed
          this.importStep = 2

          this.$q.notify({
            type: 'positive',
            message: `Parsed ${parsed.length} event(s)`,
            position: 'top',
          })
        } catch (error) {
          console.error('[Events CSV] Parse error:', error)
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
      const normalizedHeaders = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))

      const getValue = (key) => {
        const index = normalizedHeaders.indexOf(key)
        return index !== -1 ? values[index]?.trim() || '' : ''
      }

      const isValidDate = (str) =>
        /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime())
      const isValidTime = (str) => str === '' || /^\d{2}:\d{2}$/.test(str)

      const featuredStr = getValue('featured').toLowerCase()
      const featured = featuredStr === 'true' || featuredStr === '1' || featuredStr === 'yes'

      const event = {
        index: rowIndex,
        title: getValue('title'),
        organizer: getValue('organizer'),
        location: getValue('location'),
        startDate: getValue('start_date'),
        endDate: getValue('end_date'),
        startTime: getValue('start_time'),
        endTime: getValue('end_time'),
        description: getValue('description'),
        imageUrl: getValue('image_url'),
        featured,
        valid: true,
        error: '',
      }

      if (!event.title) {
        event.valid = false
        event.error = 'Missing title'
      } else if (!event.organizer) {
        event.valid = false
        event.error = 'Missing organizer'
      } else if (!event.location) {
        event.valid = false
        event.error = 'Missing location'
      } else if (!event.startDate || !isValidDate(event.startDate)) {
        event.valid = false
        event.error = 'Invalid start_date (use YYYY-MM-DD)'
      } else if (!event.endDate || !isValidDate(event.endDate)) {
        event.valid = false
        event.error = 'Invalid end_date (use YYYY-MM-DD)'
      } else if (new Date(event.endDate) < new Date(event.startDate)) {
        event.valid = false
        event.error = 'end_date must be on or after start_date'
      } else if (!isValidTime(event.startTime)) {
        event.valid = false
        event.error = 'Invalid start_time (use HH:MM)'
      } else if (!isValidTime(event.endTime)) {
        event.valid = false
        event.error = 'Invalid end_time (use HH:MM)'
      } else if (
        event.startTime &&
        event.endTime &&
        event.startDate === event.endDate &&
        event.endTime < event.startTime
      ) {
        event.valid = false
        event.error = 'end_time must be on or after start_time'
      }

      return event
    },

    async startImport() {
      this.isImporting = true
      this.importStep = 3
      this.importedCount = 0
      this.importProgress = 0
      this.importLogs = []

      const validEvents = this.parsedEvents.filter((e) => e.valid)
      const total = validEvents.length

      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
      const adminUid = sessionStorage.getItem('adminUid')
      const { logCreate } = await import('src/utils/activityLogger')

      for (let i = 0; i < validEvents.length; i++) {
        const event = validEvents[i]

        try {
          const status = this.calculateStatus(
            event.startDate,
            event.endDate,
            event.startTime,
            event.endTime
          )

          const eventData = {
            title: event.title,
            organizer: event.organizer,
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            description: event.description || '',
            imageUrl: event.imageUrl || '',
            imagePublicId: '',
            featured: event.featured || false,
            status,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          const docRef = await addDoc(collection(db, 'events'), eventData)

          try {
            await logCreate({ uid: adminUid, ...adminData }, 'events', event.title, docRef.id)
          } catch (logErr) {
            console.warn('[Events CSV Import] Activity log failed:', logErr.message)
          }

          this.importLogs.push({
            success: true,
            message: `Imported: ${event.title}`,
          })

          this.importedCount++
        } catch (error) {
          console.error('[Events CSV Import] Error:', error)
          this.importLogs.push({
            success: false,
            message: `Failed to import ${event.title}: ${error.message}`,
          })
        }

        this.importProgress = (i + 1) / total
      }

      this.isImporting = false

      this.$q.notify({
        type: 'positive',
        message: `Import completed: ${this.importedCount}/${total} events added`,
        position: 'top',
        timeout: 5000,
      })

      this.loadEvents()
    },

    closeCsvImportDialog() {
      this.showCsvImportDialog = false
      this.importStep = 1
      this.csvFile = null
      this.csvError = ''
      this.parsedEvents = []
      this.importProgress = 0
      this.importedCount = 0
      this.isImporting = false
      this.importLogs = []
    },
  },

  watch: {
    showAddDialog(val) {
      if (!val) {
        this.resetForm()
      }
    },
  },
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
