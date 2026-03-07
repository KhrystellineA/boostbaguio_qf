<template>
  <q-card class="route-form-dialog">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">{{ editMode ? 'Edit Route' : 'Add New Route' }}</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-card-section>
      <q-form @submit="submitForm" class="q-gutter-md">
        <div class="row q-col-gutter-md">
          <!-- Route Number -->
          <div class="col-12">
            <q-input
              v-model="form.routeNumber"
              label="Route Number *"
              outlined
              :rules="[(val) => !!val || 'Route number is required']"
            />
          </div>

          <!-- Route Name -->
          <div class="col-12">
            <q-input
              v-model="form.name"
              label="Route Name *"
              outlined
              :rules="[(val) => !!val || 'Route name is required']"
            />
          </div>

          <!-- Starting Point -->
          <div class="col-6">
            <q-input
              v-model="form.startingPoint"
              label="Starting Point *"
              outlined
              :rules="[(val) => !!val || 'Starting point is required']"
            />
          </div>

          <!-- Destination -->
          <div class="col-6">
            <q-input
              v-model="form.destination"
              label="Destination *"
              outlined
              :rules="[(val) => !!val || 'Destination is required']"
            />
          </div>

          <!-- Terminal Location -->
          <div class="col-12">
            <q-input
              v-model="form.terminalLocation"
              label="Terminal Location *"
              outlined
              :rules="[(val) => !!val || 'Terminal location is required']"
              hint="Full address of the terminal"
            />
          </div>

          <!-- Fares -->
          <div class="col-4">
            <q-input
              v-model.number="form.regularFare"
              label="Regular Fare *"
              type="number"
              outlined
              prefix="₱"
              :rules="[(val) => val >= 0 || 'Must be positive']"
            />
          </div>

          <div class="col-4">
            <q-input
              v-model.number="form.studentFare"
              label="Student Fare *"
              type="number"
              outlined
              prefix="₱"
              :rules="[(val) => val >= 0 || 'Must be positive']"
            />
          </div>

          <div class="col-4">
            <q-input
              v-model.number="form.pwdSeniorFare"
              label="PWD/Senior Fare *"
              type="number"
              outlined
              prefix="₱"
              :rules="[(val) => val >= 0 || 'Must be positive']"
            />
          </div>

          <!-- Coordinates -->
          <div class="col-6">
            <q-input
              v-model.number="form.terminalLat"
              label="Terminal Latitude *"
              type="number"
              outlined
              dense
              step="0.0001"
              readonly
            />
          </div>

          <div class="col-6">
            <q-input
              v-model.number="form.terminalLng"
              label="Terminal Longitude *"
              type="number"
              outlined
              dense
              step="0.0001"
              readonly
            />
          </div>

          <!-- Image URL -->
          <div class="col-12">
            <q-input
              v-model="form.imageUrl"
              label="Image URL"
              outlined
              hint="Optional route image"
            />
          </div>
        </div>

        <div class="row q-mt-md">
          <q-space />
          <q-btn label="Cancel" color="grey" flat v-close-popup />
          <q-btn
            label="Save Route"
            type="submit"
            color="primary"
            unelevated
            :loading="saving"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'RouteFormDialog',

  props: {
    routeData: {
      type: Object,
      default: null
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },

  emits: ['save', 'close'],

  setup(props, { emit }) {
    const saving = ref(false)

    // Form data
    const form = ref({
      routeNumber: '',
      name: '',
      startingPoint: '',
      destination: '',
      terminalLocation: '',
      regularFare: 0,
      studentFare: 0,
      pwdSeniorFare: 0,
      terminalLat: 0,
      terminalLng: 0,
      imageUrl: ''
    })

    // Watch for route data changes
    watch(
      () => props.routeData,
      (newData) => {
        if (newData) {
          form.value = {
            routeNumber: newData.routeNumber || '',
            name: newData.name || '',
            startingPoint: newData.startingPoint || '',
            destination: newData.destination || '',
            terminalLocation: newData.terminalLocation || '',
            regularFare: newData.regularFare || 0,
            studentFare: newData.studentFare || 0,
            pwdSeniorFare: newData.pwdSeniorFare || 0,
            terminalLat: newData.terminalLat || 0,
            terminalLng: newData.terminalLng || 0,
            imageUrl: newData.imageUrl || ''
          }
        } else {
          resetForm()
        }
      },
      { immediate: true }
    )

    // Reset form
    const resetForm = () => {
      form.value = {
        routeNumber: '',
        name: '',
        startingPoint: '',
        destination: '',
        terminalLocation: '',
        regularFare: 0,
        studentFare: 0,
        pwdSeniorFare: 0,
        terminalLat: 0,
        terminalLng: 0,
        imageUrl: ''
      }
    }

    // Submit form
    const submitForm = () => {
      emit('save', form.value)
    }

    return {
      form,
      saving,
      submitForm,
    }
  },
})
</script>
