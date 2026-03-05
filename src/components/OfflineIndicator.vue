<template>
  <transition name="slide-down">
    <div v-if="showIndicator" class="offline-indicator" :class="statusClass" role="status" aria-live="polite">
      <div class="offline-indicator__content">
        <q-icon :name="statusIcon" size="sm" class="offline-indicator__icon" />
        <div class="offline-indicator__text">
          <div class="offline-indicator__title">{{ statusTitle }}</div>
          <div v-if="statusSubtitle" class="offline-indicator__subtitle">{{ statusSubtitle }}</div>
        </div>
        <div class="offline-indicator__actions">
          <q-btn
            v-if="showRetry"
            flat
            dense
            round
            icon="refresh"
            color="white"
            @click="handleRetry"
            :loading="isRetrying"
            aria-label="Retry connection"
          >
            <q-tooltip>Retry</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="close"
            color="white"
            @click="dismissIndicator"
            aria-label="Dismiss"
          >
            <q-tooltip>Dismiss</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Progress bar for syncing -->
      <div v-if="isSyncing" class="offline-indicator__progress">
        <q-linear-progress :value="syncProgress" color="white" />
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  getOnlineStatus,
  getConnectionQuality,
  onOnlineStatusChange,
  getQueueLength,
  processOfflineQueue
} from 'src/utils/offline'

export default {
  name: 'OfflineIndicator',

  props: {
    position: {
      type: String,
      default: 'top',
      validator: (val) => ['top', 'bottom'].includes(val)
    },
    autoDismiss: {
      type: Boolean,
      default: false
    },
    autoDismissDelay: {
      type: Number,
      default: 5000
    }
  },

  emits: ['retry', 'dismiss'],

  setup(props, { emit }) {
    const isOnline = ref(getOnlineStatus())
    const connectionQuality = ref(getConnectionQuality())
    const showIndicator = ref(!getOnlineStatus())
    const isRetrying = ref(false)
    const isSyncing = ref(false)
    const syncProgress = ref(0)
    const queueLength = ref(getQueueLength())

    const statusClass = computed(() => {
      if (!isOnline.value) return 'offline-indicator--offline'
      if (connectionQuality.value === 'slow') return 'offline-indicator--slow'
      if (queueLength.value > 0) return 'offline-indicator--sync'
      return 'offline-indicator--online'
    })

    const statusIcon = computed(() => {
      if (!isOnline.value) return 'wifi_off'
      if (connectionQuality.value === 'slow') return 'signal_cellular_connected_no_internet_0_bar'
      if (queueLength.value > 0) return 'sync'
      return 'wifi'
    })

    const statusTitle = computed(() => {
      if (!isOnline.value) return 'You are offline'
      if (connectionQuality.value === 'slow') return 'Weak connection'
      if (queueLength.value > 0) return `Syncing ${queueLength.value} item(s)...`
      return 'You are online'
    })

    const statusSubtitle = computed(() => {
      if (!isOnline.value) return 'Some features may be unavailable'
      if (connectionQuality.value === 'slow') return 'Content may load slowly'
      return null
    })

    const showRetry = computed(() => !isOnline.value)

    const handleRetry = async () => {
      isRetrying.value = true

      emit('retry')

      // Simulate retry attempt
      setTimeout(() => {
        isRetrying.value = false
        isOnline.value = navigator.onLine
        connectionQuality.value = getConnectionQuality()
      }, 2000)
    }

    const dismissIndicator = () => {
      showIndicator.value = false
      emit('dismiss')
    }

    const handleSync = async () => {
      if (!isOnline.value) return

      isSyncing.value = true
      syncProgress.value = 0

      await processOfflineQueue(async () => {
        syncProgress.value += 1 / queueLength.value
        // Process action
      })

      isSyncing.value = false
      syncProgress.value = 0
      queueLength.value = getQueueLength()

      // Auto dismiss after sync complete
      if (props.autoDismiss) {
        setTimeout(() => {
          showIndicator.value = false
        }, props.autoDismissDelay)
      }
    }

    const updateStatus = (status) => {
      isOnline.value = status.isOnline
      connectionQuality.value = status.connectionQuality
      queueLength.value = getQueueLength()

      // Show indicator when offline or slow connection
      if (!status.isOnline || status.connectionQuality === 'slow') {
        showIndicator.value = true
      } else if (queueLength.value > 0) {
        showIndicator.value = true
        handleSync()
      } else if (props.autoDismiss) {
        setTimeout(() => {
          showIndicator.value = false
        }, props.autoDismissDelay)
      }
    }

    onMounted(() => {
      const cleanup = onOnlineStatusChange(updateStatus)

      // Initial check
      updateStatus({
        isOnline: getOnlineStatus(),
        connectionQuality: getConnectionQuality()
      })

      // Periodic queue check
      const queueCheckInterval = setInterval(() => {
        const newQueueLength = getQueueLength()
        if (newQueueLength !== queueLength.value) {
          queueLength.value = newQueueLength
          if (newQueueLength > 0 && isOnline.value) {
            showIndicator.value = true
            handleSync()
          }
        }
      }, 5000)

      onUnmounted(() => {
        cleanup()
        clearInterval(queueCheckInterval)
      })
    })

    return {
      showIndicator,
      isOnline,
      connectionQuality,
      isRetrying,
      isSyncing,
      syncProgress,
      statusClass,
      statusIcon,
      statusTitle,
      statusSubtitle,
      showRetry,
      handleRetry,
      dismissIndicator
    }
  }
}
</script>

<style lang="sass" scoped>
.offline-indicator
  position: fixed
  left: 0
  right: 0
  z-index: 10000
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)

  &--offline
    background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%)
    color: white

  &--slow
    background: linear-gradient(135deg, #f57c00 0%, #e65100 100%)
    color: white

  &--sync
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%)
    color: white

  &--online
    background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)
    color: white

.offline-indicator__content
  display: flex
  align-items: center
  padding: 12px 16px
  gap: 12px

.offline-indicator__icon
  flex-shrink: 0

.offline-indicator__text
  flex: 1
  min-width: 0

.offline-indicator__title
  font-weight: 600
  font-size: 14px
  line-height: 1.2

.offline-indicator__subtitle
  font-size: 12px
  opacity: 0.9
  margin-top: 2px

.offline-indicator__actions
  display: flex
  gap: 4px
  flex-shrink: 0

.offline-indicator__progress
  height: 3px
  overflow: hidden

  .q-linear-progress
    height: 100%

// Position variants
.slide-down-enter-active,
.slide-down-leave-active
  transition: transform 0.3s ease, opacity 0.3s ease

.slide-down-enter-from,
.slide-down-leave-to
  transform: translateY(-100%)
  opacity: 0

// Top position (default)
.offline-indicator
  top: 0

// Dark mode support
.body--dark .offline-indicator
  &--offline
    background: linear-gradient(135deg, #ef5350 0%, #c62828 100%)

  &--slow
    background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%)

  &--sync
    background: linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)

  &--online
    background: linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)

// Mobile responsiveness
@media (max-width: 599px)
  .offline-indicator__content
    padding: 10px 12px
    font-size: 13px

  .offline-indicator__title
    font-size: 13px

  .offline-indicator__subtitle
    font-size: 11px
</style>
