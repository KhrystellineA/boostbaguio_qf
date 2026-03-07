<template>
  <div class="save-for-offline">
    <q-btn
      :color="buttonColor"
      :outline="!isSaved"
      :label="buttonLabel"
      :icon="buttonIcon"
      no-caps
      size="sm"
      @click="toggleSave"
      :loading="isLoading"
      :aria-label="ariaLabel"
      :aria-pressed="isSaved"
    >
      <q-tooltip>{{ tooltipText }}</q-tooltip>
    </q-btn>

    <!-- Offline save dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Save for Offline</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-body2 q-mb-md">
            Save this {{ itemType }} to view later without an internet connection.
          </div>

          <q-list bordered separator>
            <q-item>
              <q-item-section avatar>
                <q-icon name="storage" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Storage Used</q-item-label>
                <q-item-label caption>{{ estimatedSize }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="access_time" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Expires</q-item-label>
                <q-item-label caption>7 days from save date</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="info" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>What's Included</q-item-label>
                <q-item-label caption>{{ includedContent }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-if="!isOnline" class="bg-warning text-white q-mt-md" rounded>
            <template v-slot:avatar>
              <q-icon name="wifi_off" color="white" />
            </template>
            You are currently offline. This will be saved when connection is restored.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            :label="isSaved ? 'Remove' : 'Save'"
            :color="isSaved ? 'negative' : 'primary'"
            unelevated
            @click="confirmToggle"
            :loading="isLoading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import {
  isSavedForOffline,
  saveItemForOffline,
  removeSavedOfflineItem,
} from 'src/utils/offlineCache'
import { getOnlineStatus, onOnlineStatusChange } from 'src/utils/offline'

export default {
  name: 'SaveForOfflineBtn',

  props: {
    itemType: {
      type: String,
      required: true,
      validator: (val) => ['place', 'event', 'jeepney', 'route'].includes(val),
    },
    itemId: {
      type: String,
      required: true,
    },
    itemData: {
      type: Object,
      required: true,
    },
    itemName: {
      type: String,
      default: '',
    },
  },

  emits: ['saved', 'removed'],

  setup(props, { emit }) {
    const isSaved = ref(false)
    const isLoading = ref(false)
    const showDialog = ref(false)
    const isOnline = ref(getOnlineStatus())

    const buttonColor = computed(() => {
      return isSaved.value ? 'positive' : 'primary'
    })

    const buttonIcon = computed(() => {
      return isSaved.value ? 'download_done' : 'download'
    })

    const buttonLabel = computed(() => {
      return isSaved.value ? 'Saved' : 'Save Offline'
    })

    const tooltipText = computed(() => {
      if (isSaved.value) {
        return `${props.itemName || props.itemType} saved for offline viewing`
      }
      return `Save ${props.itemName || props.itemType} to view without internet`
    })

    const ariaLabel = computed(() => {
      return isSaved.value
        ? `Remove ${props.itemName || props.itemType} from offline saves`
        : `Save ${props.itemName || props.itemType} for offline viewing`
    })

    const estimatedSize = computed(() => {
      // Estimate based on item type
      const sizes = {
        place: '~500 KB',
        event: '~300 KB',
        jeepney: '~200 KB',
        route: '~150 KB',
      }
      return sizes[props.itemType] || '~250 KB'
    })

    const includedContent = computed(() => {
      const content = {
        place: 'Name, description, location, images, and details',
        event: 'Event details, dates, location, and images',
        jeepney: 'Route information, fares, and schedule',
        route: 'Route path, stops, and schedule',
      }
      return content[props.itemType] || 'Item details and content'
    })

    const checkSavedStatus = () => {
      isSaved.value = isSavedForOffline(props.itemType, props.itemId)
    }

    const toggleSave = () => {
      showDialog.value = true
    }

    const confirmToggle = async () => {
      isLoading.value = true

      try {
        if (isSaved.value) {
          // Remove from offline saves
          removeSavedOfflineItem(props.itemType, props.itemId)
          isSaved.value = false
          emit('removed', { type: props.itemType, id: props.itemId })
        } else {
          // Save for offline
          saveItemForOffline(props.itemType, props.itemId, {
            ...props.itemData,
            name: props.itemName,
          })
          isSaved.value = true
          emit('saved', { type: props.itemType, id: props.itemId })
        }
      } catch (error) {
        console.error('[SaveOffline] Error:', error)
      } finally {
        isLoading.value = false
        showDialog.value = false
      }
    }

    onMounted(() => {
      checkSavedStatus()

      // Listen for online status changes
      const cleanup = onOnlineStatusChange((status) => {
        isOnline.value = status.isOnline
      })

      return cleanup
    })

    return {
      isSaved,
      isLoading,
      showDialog,
      isOnline,
      buttonColor,
      buttonIcon,
      buttonLabel,
      tooltipText,
      ariaLabel,
      estimatedSize,
      includedContent,
      toggleSave,
      confirmToggle,
    }
  },
}
</script>

<style lang="sass" scoped>
.save-for-offline
  display: inline-block
</style>
