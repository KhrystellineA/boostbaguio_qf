<template>
  <div class="jeepney-options-management">
    <div class="management-header">
      <h4 class="text-pine-green q-my-none">Jeepney Navigation Options</h4>
      <q-btn
        label="Add New Option"
        icon="add"
        style="background: #2d6a4f; color: white"
        unelevated
        @click="openAddDialog"
      />
    </div>

    <q-card class="q-mt-md">
      <q-card-section>
        <q-input
          v-model="searchFilter"
          outlined
          placeholder="Search jeepney options..."
          dense
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredOptions"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="edit" color="primary" @click="editOption(props.row)">
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="deleteOption(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Form Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 800px; max-width: 1000px">
        <q-card-section class="bg-pine-green text-white">
          <div class="text-h6">
            {{ editMode ? 'Edit Jeepney Option' : 'Add New Jeepney Option' }}
          </div>
        </q-card-section>

        <q-card-section style="max-height: 70vh" class="scroll">
          <q-form @submit.prevent="saveOption" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <!-- Basic Info -->
              <div class="col-12">
                <div class="text-h6 text-primary q-mb-md">Basic Information</div>
              </div>

              <div class="col-6">
                <q-input
                  v-model="optionForm.name"
                  label="Jeepney Name *"
                  outlined
                  :rules="[(val) => !!val || 'Name is required']"
                  hint="e.g., MARIA BASA, TIPTOP, NAVY BASE"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="optionForm.route"
                  label="Route Description *"
                  outlined
                  :rules="[(val) => !!val || 'Route is required']"
                  hint="e.g., Maria Basa to Session Road"
                />
              </div>

              <!-- Terminal Information -->
              <div class="col-12">
                <div class="text-h6 text-primary q-mb-md q-mt-md">Terminal Information</div>
              </div>

              <div class="col-12">
                <q-input
                  v-model="optionForm.terminalAddress"
                  label="Terminal Address *"
                  outlined
                  type="textarea"
                  rows="2"
                  :rules="[(val) => !!val || 'Terminal address is required']"
                  hint="Full address with landmarks"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="optionForm.terminalInstructions"
                  label="How to Get to Terminal *"
                  outlined
                  type="textarea"
                  rows="3"
                  :rules="[(val) => !!val || 'Instructions are required']"
                  hint="Step-by-step directions to reach the terminal"
                />
              </div>

              <!-- Terminal Coordinates -->
              <div class="col-12">
                <div class="coordinate-section">
                  <div class="text-subtitle2 q-mb-sm">Terminal Coordinates *</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-5">
                      <q-input
                        v-model.number="optionForm.terminalLat"
                        label="Latitude"
                        type="number"
                        outlined
                        dense
                        step="0.0001"
                        readonly
                      />
                    </div>
                    <div class="col-5">
                      <q-input
                        v-model.number="optionForm.terminalLng"
                        label="Longitude"
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
                        @click="openMapPicker"
                        style="width: 100%; height: 40px"
                      >
                        <q-tooltip>Pick from map</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Ride Information -->
              <div class="col-12">
                <div class="text-h6 text-primary q-mb-md q-mt-md">Ride Information</div>
              </div>

              <div class="col-12">
                <q-input
                  v-model="optionForm.whatToSay"
                  label="What to Tell the Driver *"
                  outlined
                  :rules="[(val) => !!val || 'Required']"
                  hint="The phrase passengers should say when boarding"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="optionForm.fare"
                  label="Fare Information *"
                  outlined
                  :rules="[(val) => !!val || 'Fare is required']"
                  hint="e.g., ₱13.00 (Regular), ₱10.00 (Student/PWD/Senior)"
                />
              </div>

              <div class="col-6">
                <q-input
                  v-model="optionForm.rideTime"
                  label="Estimated Ride Time *"
                  outlined
                  :rules="[(val) => !!val || 'Ride time is required']"
                  hint="e.g., 10-15 minutes"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="optionForm.additionalInfo"
                  label="Additional Information"
                  outlined
                  type="textarea"
                  rows="2"
                  hint="Optional: Additional tips or important notes"
                />
              </div>

              <!-- Coverage Areas -->
              <div class="col-12">
                <div class="text-h6 text-primary q-mb-md q-mt-md">Coverage Areas</div>
              </div>

              <div class="col-12">
                <q-select
                  v-model="optionForm.coveredAreas"
                  :options="baguioAreas"
                  label="Areas Covered by this Jeepney *"
                  outlined
                  multiple
                  use-chips
                  hint="Select all areas this jeepney can reach"
                  :rules="[(val) => (val && val.length > 0) || 'Select at least one area']"
                />
              </div>

              <!-- Status -->
              <div class="col-12">
                <div class="text-h6 text-primary q-mb-md q-mt-md">Status</div>
              </div>

              <div class="col-6">
                <q-toggle
                  v-model="optionForm.isActive"
                  label="Active (Show in app)"
                  color="positive"
                />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancel" flat color="grey-7" @click="closeDialog" />
          <q-btn
            label="Save Option"
            unelevated
            style="background: #2d6a4f; color: white"
            @click="saveOption"
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
          <div class="text-weight-bold q-ml-sm">Select Terminal Location</div>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'JeepneyOptionsManagement',

  props: {
    openDialog: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['dialog-opened'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const options = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const showDialog = ref(false)
    const editMode = ref(false)
    const searchFilter = ref('')

    // Map picker state
    const showMapPicker = ref(false)
    const mapPickerContainer = ref(null)
    const tempCoords = ref(null)
    let mapPickerInstance = null
    let markerInstance = null

    const baguioAreas = [
      'SM City Baguio',
      'Burnham Park',
      'Session Road',
      'Baguio Cathedral',
      'Baguio City Market',
      'Camp John Hay',
      'Mines View Park',
      'Wright Park',
      'The Mansion',
      "Teacher's Camp",
      'Botanical Garden',
      'Baguio Convention Center',
      'Baguio General Hospital',
      'University of Baguio',
      'Saint Louis University',
      'Good Shepherd Convent',
      'Tam-awan Village',
      'Lourdes Grotto',
      'PMA (Philippine Military Academy)',
      'Maria Basa',
      'Tiptop',
      'Navy Base',
      'Loakan',
      'KIAS',
      'Spring Hills',
    ]

    const optionForm = ref({
      id: null,
      name: '',
      route: '',
      terminalLat: 16.4109,
      terminalLng: 120.5964,
      terminalAddress: '',
      terminalInstructions: '',
      whatToSay: '',
      fare: '',
      rideTime: '',
      additionalInfo: '',
      coveredAreas: [],
      isActive: true,
      createdAt: null,
    })

    const columns = [
      {
        name: 'name',
        label: 'Jeepney Name',
        align: 'left',
        field: 'name',
        sortable: true,
      },
      {
        name: 'route',
        label: 'Route',
        align: 'left',
        field: 'route',
        sortable: true,
      },
      {
        name: 'coveredAreas',
        label: 'Areas Covered',
        align: 'left',
        field: 'coveredAreas',
        format: (val) => val?.join(', ') || 'N/A',
      },
      {
        name: 'isActive',
        label: 'Status',
        align: 'center',
        field: 'isActive',
        format: (val) => (val ? 'Active' : 'Inactive'),
      },
      {
        name: 'actions',
        label: 'Actions',
        align: 'center',
      },
    ]

    const filteredOptions = computed(() => {
      if (!searchFilter.value) return options.value

      const search = searchFilter.value.toLowerCase()
      return options.value.filter(
        (option) =>
          option.name?.toLowerCase().includes(search) ||
          option.route?.toLowerCase().includes(search) ||
          option.coveredAreas?.some((area) => area.toLowerCase().includes(search))
      )
    })

    const fetchOptions = async () => {
      loading.value = true
      try {
        const querySnapshot = await getDocs(collection(db, 'jeepneyOptions'))
        options.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('[JeepneyOptions] Loaded:', options.value.length)
      } catch (error) {
        console.error('[JeepneyOptions] Error fetching:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load jeepney options',
          position: 'top',
        })
      } finally {
        loading.value = false
      }
    }

    const saveOption = async () => {
      saving.value = true
      try {
        const optionData = {
          name: optionForm.value.name,
          route: optionForm.value.route,
          terminalCoords: [optionForm.value.terminalLat, optionForm.value.terminalLng],
          terminalAddress: optionForm.value.terminalAddress,
          terminalInstructions: optionForm.value.terminalInstructions,
          whatToSay: optionForm.value.whatToSay,
          fare: optionForm.value.fare,
          rideTime: optionForm.value.rideTime,
          additionalInfo: optionForm.value.additionalInfo || '',
          coveredAreas: optionForm.value.coveredAreas || [],
          isActive: optionForm.value.isActive,
          updatedAt: new Date().toISOString(),
          createdAt: editMode.value ? optionForm.value.createdAt : new Date().toISOString(),
        }

        if (editMode.value) {
          await updateDoc(doc(db, 'jeepneyOptions', optionForm.value.id), optionData)
          $q.notify({
            type: 'positive',
            message: 'Jeepney option updated successfully',
            icon: 'check_circle',
            position: 'top',
          })
        } else {
          await addDoc(collection(db, 'jeepneyOptions'), optionData)
          $q.notify({
            type: 'positive',
            message: 'Jeepney option added successfully',
            icon: 'check_circle',
            position: 'top',
          })
        }

        await fetchOptions()
        closeDialog()
      } catch (error) {
        console.error('[JeepneyOptions] Error saving:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to save jeepney option',
          position: 'top',
        })
      } finally {
        saving.value = false
      }
    }

    const openAddDialog = () => {
      editMode.value = false
      optionForm.value = {
        id: null,
        name: '',
        route: '',
        terminalLat: 16.4109,
        terminalLng: 120.5964,
        terminalAddress: '',
        terminalInstructions: '',
        whatToSay: '',
        fare: '',
        rideTime: '',
        additionalInfo: '',
        coveredAreas: [],
        isActive: true,
        createdAt: null,
      }
      showDialog.value = true
    }

    const editOption = (option) => {
      editMode.value = true
      optionForm.value = {
        id: option.id,
        name: option.name,
        route: option.route,
        terminalLat: option.terminalCoords?.[0] || 16.4109,
        terminalLng: option.terminalCoords?.[1] || 120.5964,
        terminalAddress: option.terminalAddress,
        terminalInstructions: option.terminalInstructions,
        whatToSay: option.whatToSay,
        fare: option.fare,
        rideTime: option.rideTime,
        additionalInfo: option.additionalInfo || '',
        coveredAreas: option.coveredAreas || [],
        isActive: option.isActive !== false,
        createdAt: option.createdAt,
      }
      showDialog.value = true
    }

    const deleteOption = async (option) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete "${option.name}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await deleteDoc(doc(db, 'jeepneyOptions', option.id))

          $q.notify({
            type: 'positive',
            message: 'Jeepney option deleted successfully',
            icon: 'check_circle',
            position: 'top',
          })

          await fetchOptions()
        } catch (error) {
          console.error('[JeepneyOptions] Error deleting:', error)
          $q.notify({
            type: 'negative',
            message: 'Failed to delete jeepney option',
            position: 'top',
          })
        }
      })
    }

    const closeDialog = () => {
      showDialog.value = false
      editMode.value = false
      optionForm.value = {
        id: null,
        name: '',
        route: '',
        terminalLat: 16.4109,
        terminalLng: 120.5964,
        terminalAddress: '',
        terminalInstructions: '',
        whatToSay: '',
        fare: '',
        rideTime: '',
        additionalInfo: '',
        coveredAreas: [],
        isActive: true,
        createdAt: null,
      }
    }

    const openMapPicker = () => {
      tempCoords.value = null
      showMapPicker.value = true

      nextTick(() => {
        initMapPicker()
      })
    }

    const initMapPicker = () => {
      if (!mapPickerContainer.value) return

      const currentLat = optionForm.value.terminalLat
      const currentLng = optionForm.value.terminalLng

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
        html: '<div style="font-size: 32px">🚍</div>',
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

      optionForm.value.terminalLat = tempCoords.value.lat
      optionForm.value.terminalLng = tempCoords.value.lng

      $q.notify({
        type: 'positive',
        message: 'Terminal coordinates set',
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

    onMounted(() => {
      fetchOptions()
    })

    watch(
      () => props.openDialog,
      (newVal) => {
        if (newVal) {
          openAddDialog()
          emit('dialog-opened')
        }
      }
    )

    return {
      options,
      loading,
      saving,
      showDialog,
      editMode,
      searchFilter,
      optionForm,
      columns,
      filteredOptions,
      baguioAreas,
      showMapPicker,
      mapPickerContainer,
      tempCoords,
      saveOption,
      openAddDialog,
      editOption,
      deleteOption,
      closeDialog,
      openMapPicker,
      confirmMapSelection,
      closeMapPicker,
    }
  },
}
</script>

<style lang="sass" scoped>
.jeepney-options-management
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
