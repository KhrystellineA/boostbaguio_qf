<template>
  <div class="routes-management">
    <div class="management-header">
      <h4 class="text-pine-green q-my-none">Routes Management</h4>
      <q-btn
        label="Add New Route"
        icon="add"
        style="background: #4EA96D; color: white"
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
          <template v-slot:action>
            <q-btn
              flat
              color="white"
              label="Review Conflicts"
              @click="showConflictDialog = true"
            />
          </template>
        </q-banner>

        <!-- Search Filter -->
        <q-input
          v-model="searchFilter"
          outlined
          placeholder="Search by route name, starting point, or destination..."
          dense
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn
              v-if="searchFilter"
              flat
              dense
              icon="clear"
              @click="searchFilter = ''"
            />
          </template>
        </q-input>

        <!-- Routes Table -->
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

    <!-- Add/Edit Route Dialog -->
    <q-dialog v-model="showDialog" maximized @hide="resetForm">
      <route-form-dialog
        :route-data="selectedRoute"
        :edit-mode="!!selectedRoute"
        @save="saveRoute"
        @close="showDialog = false"
      />
    </q-dialog>

    <!-- Conflict Review Dialog -->
    <q-dialog v-model="showConflictDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Route Conflicts</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list separator>
            <q-item v-for="(conflict, index) in detectedConflicts" :key="index">
              <q-item-section avatar>
                <q-icon name="warning" color="warning" />
              </q-item-section>
              <q-item-section>{{ conflict.message }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import RouteFormDialog from './RouteFormDialog.vue'

export default defineComponent({
  name: 'RoutesManagement',

  components: {
    RouteFormDialog,
  },

  setup() {
    const $q = useQuasar()

    // State
    const loading = ref(false)
    const showDialog = ref(false)
    const showConflictDialog = ref(false)
    const searchFilter = ref('')
    const selectedRoute = ref(null)
    const routes = ref([])
    const detectedConflicts = ref([])

    // Table columns
    const columns = [
      {
        name: 'routeNumber',
        required: true,
        label: 'Route #',
        align: 'left',
        field: 'routeNumber',
        sortable: true,
      },
      {
        name: 'name',
        required: true,
        label: 'Route Name',
        align: 'left',
        field: 'name',
        sortable: true,
      },
      {
        name: 'startingPoint',
        label: 'Starting Point',
        align: 'left',
        field: 'startingPoint',
        sortable: true,
      },
      {
        name: 'destination',
        label: 'Destination',
        align: 'left',
        field: 'destination',
        sortable: true,
      },
      {
        name: 'image',
        label: 'Image',
        align: 'center',
        field: 'imageUrl',
      },
      {
        name: 'actions',
        label: 'Actions',
        align: 'center',
      },
    ]

    // Filtered routes
    const filteredRoutes = computed(() => {
      if (!searchFilter.value) return routes.value

      const filter = searchFilter.value.toLowerCase()
      return routes.value.filter(
        (route) =>
          route.name?.toLowerCase().includes(filter) ||
          route.startingPoint?.toLowerCase().includes(filter) ||
          route.destination?.toLowerCase().includes(filter) ||
          route.routeNumber?.toLowerCase().includes(filter)
      )
    })

    // Load routes
    const loadRoutes = async () => {
      loading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'routes'))
        routes.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        detectConflicts()
      } catch (error) {
        console.error('[RoutesManagement] Error loading routes:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load routes',
          position: 'top',
        })
      } finally {
        loading.value = false
      }
    }

    // Detect conflicts
    const detectConflicts = () => {
      const conflicts = []
      const seen = new Map()

      routes.value.forEach((route) => {
        const key = `${route.startingPoint}-${route.destination}`
        if (seen.has(key)) {
          conflicts.push({
            message: `Duplicate route: ${route.startingPoint} to ${route.destination}`,
            route,
          })
        } else {
          seen.set(key, true)
        }
      })

      detectedConflicts.value = conflicts
    }

    // Edit route
    const editRoute = (route) => {
      selectedRoute.value = { ...route }
      showDialog.value = true
    }

    // Save route
    const saveRoute = async (routeData) => {
      try {
        if (selectedRoute.value) {
          // Update existing
          await updateDoc(doc(db, 'routes', selectedRoute.value.id), routeData)
          $q.notify({
            type: 'positive',
            message: 'Route updated successfully',
            position: 'top',
          })
        } else {
          // Create new
          await addDoc(collection(db, 'routes'), routeData)
          $q.notify({
            type: 'positive',
            message: 'Route created successfully',
            position: 'top',
          })
        }

        showDialog.value = false
        await loadRoutes()
      } catch (error) {
        console.error('[RoutesManagement] Error saving route:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to save route',
          position: 'top',
        })
      }
    }

    // Delete route
    const deleteRoute = async (route) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete route "${route.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await deleteDoc(doc(db, 'routes', route.id))
          $q.notify({
            type: 'positive',
            message: 'Route deleted successfully',
            position: 'top',
          })
          await loadRoutes()
        } catch (error) {
          console.error('[RoutesManagement] Error deleting route:', error)
          $q.notify({
            type: 'negative',
            message: 'Failed to delete route',
            position: 'top',
          })
        }
      })
    }

    // Reset form
    const resetForm = () => {
      selectedRoute.value = null
    }

    // Load on mount
    onMounted(() => {
      loadRoutes()
    })

    return {
      // State
      loading,
      showDialog,
      showConflictDialog,
      searchFilter,
      selectedRoute,
      detectedConflicts,

      // Computed
      filteredRoutes,
      columns,

      // Methods
      editRoute,
      saveRoute,
      deleteRoute,
      resetForm,
    }
  },
})
</script>

<style lang="scss" scoped>
.routes-management {
  .management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .bg-warning {
    background: #FF9800 !important;
  }
}
</style>
