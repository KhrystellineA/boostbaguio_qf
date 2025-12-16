<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Route Management</h4>
        <p class="text-grey-7 q-mb-none">Manage jeepney routes for BaguioBoost</p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Add Route"
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
          placeholder="Search routes..."
          dense
          class="q-mb-md"
        >
          <template #prepend>
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
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                style="background: #2d6a4f; color: white"
                @click="editRoute(props.row)"
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
          <div class="text-h6 text-pine-green">{{ editingRoute ? 'Edit Route' : 'Add New Route' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.name"
            outlined
            label="Route Name *"
            class="q-mb-md"
          />

          <q-input
            v-model="form.code"
            outlined
            label="Route Code *"
            class="q-mb-md"
          />

          <q-input
            v-model="form.origin"
            outlined
            label="Origin *"
            class="q-mb-md"
          />

          <q-input
            v-model="form.destination"
            outlined
            label="Destination *"
            class="q-mb-md"
          />

          <q-input
            v-model="form.fare"
            outlined
            type="number"
            label="Fare (₱) *"
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
            :label="editingRoute ? 'Update' : 'Create'"
            style="background: #2d6a4f; color: white"
            @click="saveRoute"
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
  name: 'RoutesManagement',

  props: {
    openDialog: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      routes: [],
      search: '',
      loading: false,
      saving: false,
      showAddDialog: false,
      editingRoute: null,
      form: {
        name: '',
        code: '',
        origin: '',
        destination: '',
        fare: '',
        description: ''
      },
      columns: [
        { name: 'code', label: 'Code', field: 'code', align: 'left', sortable: true },
        { name: 'name', label: 'Route Name', field: 'name', align: 'left', sortable: true },
        { name: 'origin', label: 'Origin', field: 'origin', align: 'left' },
        { name: 'destination', label: 'Destination', field: 'destination', align: 'left' },
        { name: 'fare', label: 'Fare', field: 'fare', align: 'left', format: val => `₱${val}` },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ]
    }
  },

  computed: {
    filteredRoutes() {
      if (!this.search) return this.routes
      
      const searchLower = this.search.toLowerCase()
      return this.routes.filter(route => 
        route.name?.toLowerCase().includes(searchLower) ||
        route.code?.toLowerCase().includes(searchLower) ||
        route.origin?.toLowerCase().includes(searchLower) ||
        route.destination?.toLowerCase().includes(searchLower)
      )
    }
  },

  mounted() {
    this.loadRoutes()
  },

  methods: {
    async loadRoutes() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'routes'))
        this.routes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('[Routes] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load routes',
          position: 'top'
        })
      } finally {
        this.loading = false
      }
    },

    editRoute(route) {
      this.editingRoute = route
      this.form = { ...route }
      this.showAddDialog = true
    },

    async saveRoute() {
      if (!this.form.name || !this.form.code || !this.form.origin || !this.form.destination || !this.form.fare) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        const routeData = {
          name: this.form.name,
          code: this.form.code,
          origin: this.form.origin,
          destination: this.form.destination,
          fare: parseFloat(this.form.fare),
          description: this.form.description,
          updatedAt: serverTimestamp()
        }

        if (this.editingRoute) {
          await updateDoc(doc(db, 'routes', this.editingRoute.id), routeData)
          this.$q.notify({
            type: 'positive',
            message: 'Route updated successfully',
            position: 'top'
          })
        } else {
          routeData.createdAt = serverTimestamp()
          await addDoc(collection(db, 'routes'), routeData)
          this.$q.notify({
            type: 'positive',
            message: 'Route created successfully',
            position: 'top'
          })
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadRoutes()
      } catch (error) {
        console.error('[Routes] Error saving:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to save route',
          position: 'top'
        })
      } finally {
        this.saving = false
      }
    },

    confirmDelete(route) {
      this.$q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete route "${route.name}"?`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await deleteDoc(doc(db, 'routes', route.id))
          this.$q.notify({
            type: 'positive',
            message: 'Route deleted successfully',
            position: 'top'
          })
          this.loadRoutes()
        } catch (error) {
          console.error('[Routes] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete route',
            position: 'top'
          })
        }
      })
    },

    resetForm() {
      this.form = {
        name: '',
        code: '',
        origin: '',
        destination: '',
        fare: '',
        description: ''
      }
      this.editingRoute = null
    },

    openAddDialog() {
      this.showAddDialog = true
    }
  },

  watch: {
    showAddDialog(val) {
      if (!val) {
        this.resetForm()
      }
    },
    
    openDialog(val) {
      if (val) {
        this.showAddDialog = true
        this.$emit('dialog-opened')
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text-pine-green
  color: #2d6a4f
</style>