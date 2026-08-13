<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 350px; max-width: 500px; border-radius: 12px">
      <q-card-section class="row items-center bg-primary text-white">
        <div class="text-h6">Contact Support</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div class="text-body2 text-grey-8 q-mb-md">
          Found a bug, missing a route, or have a suggestion? Let us know below!
        </div>

        <q-form @submit.prevent="submitFeedback" class="q-gutter-md">
          <q-input
            v-model="form.name"
            label="Name *"
            outlined
            dense
            :rules="[(val) => !!val || 'Name is required']"
            :readonly="isAuthenticated"
          />

          <q-input
            v-model="form.email"
            label="Email *"
            type="email"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Email is required',
              (val) => /.+@.+\..+/.test(val) || 'Invalid email format',
            ]"
            :readonly="isAuthenticated"
          />

          <q-select
            v-model="form.type"
            :options="typeOptions"
            label="Type of Request *"
            outlined
            dense
            :rules="[(val) => !!val || 'Please select a type']"
          />

          <q-input
            v-model="form.message"
            label="Message *"
            type="textarea"
            outlined
            dense
            autogrow
            :rules="[
              (val) => !!val || 'Message is required',
              (val) => val.length <= 2000 || 'Message too long (max 2000 chars)',
            ]"
          />

          <div class="row justify-end q-mt-lg">
            <q-btn label="Cancel" flat color="grey" v-close-popup :disable="loading" />
            <q-btn
              label="Submit"
              type="submit"
              color="primary"
              :loading="loading"
              class="q-ml-sm"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useQuasar } from 'quasar'

export default {
  name: 'FeedbackDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const userStore = useUserStore()
    const loading = ref(false)

    const typeOptions = [
      'Bug Report',
      'Missing Route',
      'Missing Place',
      'Feature Suggestion',
      'General Inquiry',
    ]

    const form = ref({
      name: '',
      email: '',
      type: null,
      message: '',
    })

    const isAuthenticated = computed(() => userStore.isAuthenticated)

    const prefillData = () => {
      if (userStore.isAuthenticated) {
        form.value.name = userStore.userName || ''
        form.value.email = userStore.userEmail || ''
      }
    }

    watch(
      () => props.modelValue,
      (isOpen) => {
        if (isOpen) {
          prefillData()
          form.value.type = null
          form.value.message = ''
        }
      }
    )

    onMounted(() => {
      prefillData()
    })

    const submitFeedback = async () => {
      loading.value = true

      try {
        await addDoc(collection(db, 'contactMessages'), {
          name: form.value.name,
          email: form.value.email,
          type: form.value.type,
          message: form.value.message,
          isPremium: userStore.isPremium || false,
          status: 'unread',
          createdAt: serverTimestamp(),
        })

        $q.notify({
          type: 'positive',
          message: 'Thank you! Your message has been sent.',
        })

        emit('update:modelValue', false)

        // Reset form
        if (!isAuthenticated.value) {
          form.value.name = ''
          form.value.email = ''
        }
        form.value.type = null
        form.value.message = ''
      } catch (error) {
        console.error('Error submitting feedback:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to send message. Please try again later.',
        })
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      typeOptions,
      loading,
      isAuthenticated,
      submitFeedback,
    }
  },
}
</script>
