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
          <template #body-cell-category="props">
            <q-td :props="props">
              <q-badge :color="getCategoryColor(props.value)">
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

    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 text-pine-green">{{ editingPlace ? 'Edit Place' : 'Add New Place' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.name"
            outlined
            label="Place Name *"
            class="q-mb-md"
          />

          <q-select
            v-model="form.category"
            outlined
            label="Category *"
            :options="categories"
            class="q-mb-md"
          />

          <q-input
            v-model="form.address"
            outlined
            label="Address *"
            class="q-mb-md"
          />

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.latitude"
                outlined
                type="number"
                step="any"
                label="Latitude *"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.longitude"
                outlined
                type="number"
                step="any"
                label="Longitude *"
              />
            </div>
          </div>

          <q-input
            v-model="form.phone"
            outlined
            label="Phone Number"
            class="q-mb-md"
          />

          <q-input
            v-model="form.website"
            outlined
            label="Website"
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
      form: {
        name: '',
        category: '',
        address: '',
        latitude: '',
        longitude: '',
        phone: '',
        website: '',
        description: ''
      },
      categories: [
        'Restaurant',
        'Hotel',
        'Tourist Spot',
        'Shopping',
        'Government',
        'Hospital',
        'School',
        'Park',
        'Museum',
        'Other'
      ],
      columns: [
        { name: 'name', label: 'Place Name', field: 'name', align: 'left', sortable: true },
        { name: 'category', label: 'Category', field: 'category', align: 'left', sortable: true },
        { name: 'address', label: 'Address', field: 'address', align: 'left' },
        { name: 'phone', label: 'Phone', field: 'phone', align: 'left' },
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
        place.address?.toLowerCase().includes(searchLower)
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

    editPlace(place) {
      this.editingPlace = place
      this.form = { ...place }
      this.showAddDialog = true
    },

    async savePlace() {
      if (!this.form.name || !this.form.category || !this.form.address || !this.form.latitude || !this.form.longitude) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        const placeData = {
          name: this.form.name,
          category: this.form.category,
          address: this.form.address,
          latitude: parseFloat(this.form.latitude),
          longitude: parseFloat(this.form.longitude),
          phone: this.form.phone || '',
          website: this.form.website || '',
          description: this.form.description || '',
          updatedAt: serverTimestamp()
        }

        if (this.editingPlace) {
          await updateDoc(doc(db, 'places', this.editingPlace.id), placeData)
          this.$q.notify({
            type: 'positive',
            message: 'Place updated successfully',
            position: 'top'
          })
        } else {
          placeData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'places'), placeData)
          this.$q.notify({
            type: 'positive',
            message: 'Place created successfully',
            position: 'top'
          })
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadPlaces()
      } catch (error) {
        console.error('[Places] Error saving:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save place',
          position: 'top'
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
          await deleteDoc(doc(db, 'places', place.id))
          this.$q.notify({
            type: 'positive',
            message: 'Place deleted successfully',
            position: 'top'
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
        'Restaurant': 'orange',
        'Hotel': 'blue',
        'Tourist Spot': 'green',
        'Shopping': 'purple',
        'Government': 'red',
        'Hospital': 'pink',
        'School': 'indigo',
        'Park': 'teal',
        'Museum': 'amber',
        'Other': 'grey'
      }
      return colors[category] || 'grey'
    },

    resetForm() {
      this.form = {
        name: '',
        category: '',
        address: '',
        latitude: '',
        longitude: '',
        phone: '',
        website: '',
        description: ''
      }
      this.editingPlace = null
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
</style>