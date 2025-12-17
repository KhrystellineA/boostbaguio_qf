<template>
  <div class="routes-management">
    <div class="management-header">
      <h4 class="text-pine-green q-my-none">Routes Management</h4>
      <q-btn
        label="Add New Route"
        icon="add"
        style="background: #2d6a4f; color: white"
        unelevated
        @click="showDialog = true"
      />
    </div>

    <q-card class="q-mt-md">
      <q-card-section>
        <q-input
          v-model="searchFilter"
          outlined
          placeholder="Search routes..."
          dense
          class="q-mb-md"
        >
          <template v-slot:prepend>
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

    <!-- Main Form Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 700px; max-width: 900px">
        <q-card-section class="bg-pine-green text-white">
          <div class="text-h6">
            {{ editMode ? 'Edit Route' : 'Add New Route' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveRoute" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="routeForm.routeName"
                  label="Route Name *"
                  outlined
                  :rules="[(val) => !!val || 'Route name is required']"
                  hint="e.g., ROUTE 01, Market to Session Road"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="routeForm.startingPoint"
                  label="Starting Point *"
                  outlined
                  :rules="[(val) => !!val || 'Starting point is required']"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="routeForm.destination"
                  label="Destination *"
                  outlined
                  :rules="[(val) => !!val || 'Destination is required']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="routeForm.terminalLocation"
                  label="Terminal Location *"
                  outlined
                  :rules="[(val) => !!val || 'Terminal location is required']"
                  hint="Full address of the terminal"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model.number="routeForm.regularFare"
                  label="Regular Fare *"
                  type="number"
                  outlined
                  prefix="₱"
                  :rules="[(val) => val >= 0 || 'Must be positive']"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model.number="routeForm.studentFare"
                  label="Student Fare *"
                  type="number"
                  outlined
                  prefix="₱"
                  :rules="[(val) => val >= 0 || 'Must be positive']"
                />
              </div>

              <div class="col-4">
                <q-input
                  v-model.number="routeForm.pwdSeniorFare"
                  label="PWD/Senior Fare *"
                  type="number"
                  outlined
                  prefix="₱"
                  :rules="[(val) => val >= 0 || 'Must be positive']"
                />
              </div>

              <!-- Terminal Coordinates with Map Picker -->
              <div class="col-12">
                <div class="coordinate-section">
                  <div class="text-subtitle2 q-mb-sm">Terminal Coordinates</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.terminalLat"
                        label="Latitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.terminalLng"
                        label="Longitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-2">
                      <q-btn
                        icon="map"
                        color="primary"
                        outline
                        dense
                        @click="openMapPicker('terminal')"
                        style="width: 100%; height: 40px"
                      >
                        <q-tooltip>Pick from map</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Destination Coordinates with Map Picker -->
              <div class="col-12">
                <div class="coordinate-section">
                  <div class="text-subtitle2 q-mb-sm">Destination Coordinates</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.destinationLat"
                        label="Latitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-5">
                      <q-input
                        v-model.number="routeForm.destinationLng"
                        label="Longitude *"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-2">
                      <q-btn
                        icon="map"
                        color="primary"
                        outline
                        dense
                        @click="openMapPicker('destination')"
                        style="width: 100%; height: 40px"
                      >
                        <q-tooltip>Pick from map</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image Upload -->
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">Route Image</div>
                <q-file
                  v-model="routeForm.imageFile"
                  outlined
                  accept="image/*"
                  max-file-size="5242880"
                  @rejected="onImageRejected"
                >
                  <template v-slot:prepend>
                    <q-icon name="image" />
                  </template>
                  <template v-slot:hint> Max file size: 5MB (JPG, PNG, WebP) </template>
                </q-file>

                <div v-if="routeForm.imageUrl || imagePreview" class="q-mt-sm">
                  <q-img
                    :src="imagePreview || routeForm.imageUrl"
                    style="max-width: 200px; border-radius: 8px"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" flat color="grey-7" @click="closeDialog" />
          <q-btn
            label="Save Route"
            unelevated
            style="background: #2d6a4f; color: white"
            @click="saveRoute"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Map Picker Dialog -->
    <q-dialog v-model="showMapPicker" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="map" />
          <div class="text-weight-bold q-ml-sm">
            Select {{ pickerMode === 'terminal' ? 'Terminal' : 'Destination' }} Location
          </div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeMapPicker" />
        </q-bar>

        <q-card-section class="q-pa-none" style="height: calc(100vh - 100px)">
          <div ref="mapPickerContainer" style="height: 100%; width: 100%"></div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <div class="row full-width items-center">
            <div class="col">
              <div class="text-caption text-grey-7">Click on the map to select location</div>
              <div v-if="tempCoords" class="text-body2">
                <strong>Selected:</strong> {{ tempCoords.lat.toFixed(6) }},
                {{ tempCoords.lng.toFixed(6) }}
              </div>
            </div>
            <div class="col-auto">
              <q-btn label="Cancel" flat color="grey-7" @click="closeMapPicker" class="q-mr-sm" />
              <q-btn
                label="Confirm Location"
                unelevated
                color="primary"
                @click="confirmMapSelection"
                :disable="!tempCoords"
              />
            </div>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'RoutesManagement',

  props: {
    openDialog: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['dialog-opened'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const routes = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const showDialog = ref(false)
    const editMode = ref(false)
    const searchFilter = ref('')
    const imagePreview = ref(null)

    const showMapPicker = ref(false)
    const mapPickerContainer = ref(null)
    const pickerMode = ref('terminal')
    const tempCoords = ref(null)
    let mapPickerInstance = null
    let markerInstance = null

    const routeForm = ref({
      id: null,
      routeName: '',
      startingPoint: '',
      destination: '',
      terminalLocation: '',
      regularFare: 0,
      studentFare: 0,
      pwdSeniorFare: 0,
      terminalLat: 16.4109,
      terminalLng: 120.5964,
      destinationLat: 16.4145,
      destinationLng: 120.598,
      imageFile: null,
      imageUrl: null,
      createdAt: null,
    })

    const columns = [
      {
        name: 'imageUrl',
        label: 'Image',
        align: 'left',
        field: 'imageUrl',
      },
      {
        name: 'routeName',
        label: 'Route Name',
        align: 'left',
        field: 'routeName',
        sortable: true,
      },
      {
        name: 'route',
        label: 'Route',
        align: 'left',
        field: (row) => `${row.startingPoint} → ${row.destination}`,
        sortable: true,
      },
      {
        name: 'fare',
        label: 'Regular Fare',
        align: 'center',
        field: 'regularFare',
        format: (val) => `₱${val}`,
        sortable: true,
      },
      {
        name: 'actions',
        label: 'Actions',
        align: 'center',
      },
    ]

    const filteredRoutes = computed(() => {
      if (!searchFilter.value) return routes.value

      const search = searchFilter.value.toLowerCase()
      return routes.value.filter(
        (route) =>
          route.routeName?.toLowerCase().includes(search) ||
          route.startingPoint?.toLowerCase().includes(search) ||
          route.destination?.toLowerCase().includes(search)
      )
    })

    const fetchRoutes = async () => {
      loading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'routes'))
        routes.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('[Routes] Loaded:', routes.value.length)
      } catch (error) {
        console.error('[Routes] Error fetching:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load routes',
          position: 'top',
        })
      } finally {
        loading.value = false
      }
    }

    const uploadImage = async (file) => {
      try {
        const timestamp = Date.now()
        const fileName = `routes/${timestamp}_${file.name}`
        const imageRef = storageRef(storage, fileName)

        await uploadBytes(imageRef, file)
        const downloadURL = await getDownloadURL(imageRef)

        return downloadURL
      } catch (error) {
        console.error('[Routes] Error uploading image:', error)
        throw error
      }
    }

    const deleteImage = async (imageUrl) => {
      if (!imageUrl) return

      try {
        const imageRef = storageRef(storage, imageUrl)
        await deleteObject(imageRef)
      } catch (error) {
        console.error('[Routes] Error deleting image:', error)
      }
    }

    const saveRoute = async () => {
      saving.value = true
      try {
        let imageUrl = routeForm.value.imageUrl

        if (routeForm.value.imageFile) {
          if (editMode.value && routeForm.value.imageUrl) {
            await deleteImage(routeForm.value.imageUrl)
          }
          imageUrl = await uploadImage(routeForm.value.imageFile)
        }

        const routeData = {
          name: routeForm.value.routeName,
          routeName: routeForm.value.routeName,
          code: routeForm.value.routeName.toLowerCase().replace(/\s+/g, '-'),

          origin: routeForm.value.startingPoint,
          startingPoint: routeForm.value.startingPoint,
          destination: routeForm.value.destination,
          terminalLocation: routeForm.value.terminalLocation,
          description: `${routeForm.value.startingPoint} to ${routeForm.value.destination}`,

          fare: routeForm.value.regularFare,
          regularFare: routeForm.value.regularFare,
          studentFare: routeForm.value.studentFare,
          pwdSeniorFare: routeForm.value.pwdSeniorFare,

          originCoordinates: [routeForm.value.terminalLat, routeForm.value.terminalLng],
          terminalCoordinates: [routeForm.value.terminalLat, routeForm.value.terminalLng],
          destinationCoordinates: [routeForm.value.destinationLat, routeForm.value.destinationLng],

          routeCoordinates: [
            {
              lat: routeForm.value.terminalLat,
              lng: routeForm.value.terminalLng,
            },
            {
              lat: routeForm.value.destinationLat,
              lng: routeForm.value.destinationLng,
            },
          ],

          imageUrl: imageUrl,
          updatedAt: new Date().toISOString(),
          createdAt: editMode.value ? routeForm.value.createdAt : new Date().toISOString(),
        }

        if (editMode.value) {
          await updateDoc(doc(db, 'routes', routeForm.value.id), routeData)
          $q.notify({
            type: 'positive',
            message: 'Route updated successfully',
            icon: 'check_circle',
            position: 'top',
          })
        } else {
          await addDoc(collection(db, 'routes'), routeData)
          $q.notify({
            type: 'positive',
            message: 'Route added successfully',
            icon: 'check_circle',
            position: 'top',
          })
        }

        await fetchRoutes()
        closeDialog()
      } catch (error) {
        console.error('[Routes] Error saving:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to save route',
          position: 'top',
        })
      } finally {
        saving.value = false
      }
    }

    const editRoute = (route) => {
      editMode.value = true
      routeForm.value = {
        id: route.id,
        routeName: route.routeName,
        startingPoint: route.startingPoint,
        destination: route.destination,
        terminalLocation: route.terminalLocation,
        regularFare: route.regularFare,
        studentFare: route.studentFare,
        pwdSeniorFare: route.pwdSeniorFare,
        terminalLat: route.terminalCoordinates?.[0] || 16.4109,
        terminalLng: route.terminalCoordinates?.[1] || 120.5964,
        destinationLat: route.destinationCoordinates?.[0] || 16.4145,
        destinationLng: route.destinationCoordinates?.[1] || 120.598,
        imageFile: null,
        imageUrl: route.imageUrl,
        createdAt: route.createdAt,
      }
      showDialog.value = true
    }

    const deleteRoute = async (route) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${route.routeName}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          if (route.imageUrl) {
            await deleteImage(route.imageUrl)
          }

          await deleteDoc(doc(db, 'routes', route.id))

          $q.notify({
            type: 'positive',
            message: 'Route deleted successfully',
            icon: 'check_circle',
            position: 'top',
          })

          await fetchRoutes()
        } catch (error) {
          console.error('[Routes] Error deleting:', error)
          $q.notify({
            type: 'negative',
            message: 'Failed to delete route',
            position: 'top',
          })
        }
      })
    }

    const closeDialog = () => {
      showDialog.value = false
      editMode.value = false
      imagePreview.value = null
      routeForm.value = {
        id: null,
        routeName: '',
        startingPoint: '',
        destination: '',
        terminalLocation: '',
        regularFare: 0,
        studentFare: 0,
        pwdSeniorFare: 0,
        terminalLat: 16.4109,
        terminalLng: 120.5964,
        destinationLat: 16.4145,
        destinationLng: 120.598,
        imageFile: null,
        imageUrl: null,
        createdAt: null,
      }
    }

    const openMapPicker = (mode) => {
      pickerMode.value = mode
      tempCoords.value = null
      showMapPicker.value = true

      nextTick(() => {
        initMapPicker()
      })
    }

    const initMapPicker = () => {
      if (!mapPickerContainer.value) return

      const currentLat =
        pickerMode.value === 'terminal'
          ? routeForm.value.terminalLat
          : routeForm.value.destinationLat
      const currentLng =
        pickerMode.value === 'terminal'
          ? routeForm.value.terminalLng
          : routeForm.value.destinationLng

      if (mapPickerInstance) {
        mapPickerInstance.remove()
      }

      mapPickerInstance = L.map(mapPickerContainer.value).setView([currentLat, currentLng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapPickerInstance)

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="font-size: 32px">📍</div>',
        iconSize: [32, 32],
      })

      markerInstance = L.marker([currentLat, currentLng], { icon: markerIcon }).addTo(
        mapPickerInstance
      )
      tempCoords.value = { lat: currentLat, lng: currentLng }

      mapPickerInstance.on('click', (e) => {
        const { lat, lng } = e.latlng
        tempCoords.value = { lat, lng }

        if (markerInstance) {
          mapPickerInstance.removeLayer(markerInstance)
        }

        markerInstance = L.marker([lat, lng], { icon: markerIcon }).addTo(mapPickerInstance)
      })
    }

    const confirmMapSelection = () => {
      if (!tempCoords.value) return

      if (pickerMode.value === 'terminal') {
        routeForm.value.terminalLat = tempCoords.value.lat
        routeForm.value.terminalLng = tempCoords.value.lng
      } else {
        routeForm.value.destinationLat = tempCoords.value.lat
        routeForm.value.destinationLng = tempCoords.value.lng
      }

      $q.notify({
        type: 'positive',
        message: `${pickerMode.value === 'terminal' ? 'Terminal' : 'Destination'} coordinates set`,
        icon: 'check_circle',
        position: 'top',
      })

      closeMapPicker()
    }

    const closeMapPicker = () => {
      if (mapPickerInstance) {
        mapPickerInstance.remove()
        mapPickerInstance = null
      }
      markerInstance = null
      tempCoords.value = null
      showMapPicker.value = false
    }

    const onImageRejected = () => {
      $q.notify({
        type: 'negative',
        message: 'Image must be less than 5MB',
        position: 'top',
      })
    }

    watch(
      () => routeForm.value.imageFile,
      (newFile) => {
        if (newFile) {
          const reader = new FileReader()
          reader.onload = (e) => {
            imagePreview.value = e.target.result
          }
          reader.readAsDataURL(newFile)
        } else {
          imagePreview.value = null
        }
      }
    )

    watch(
      () => props.openDialog,
      (newVal) => {
        if (newVal) {
          showDialog.value = true
          emit('dialog-opened')
        }
      }
    )

    onMounted(() => {
      fetchRoutes()
    })

    return {
      routes,
      loading,
      saving,
      showDialog,
      editMode,
      searchFilter,
      routeForm,
      columns,
      filteredRoutes,
      imagePreview,
      showMapPicker,
      mapPickerContainer,
      pickerMode,
      tempCoords,
      saveRoute,
      editRoute,
      deleteRoute,
      closeDialog,
      openMapPicker,
      confirmMapSelection,
      closeMapPicker,
      onImageRejected,
    }
  },
}
</script>

<style lang="sass" scoped>
.routes-management
  .management-header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 20px

.text-pine-green
  color: #2d6a4f

.coordinate-section
  background: #f5f5f5
  padding: 12px
  border-radius: 8px

:deep(.custom-marker)
  background: transparent
  border: none
</style>
