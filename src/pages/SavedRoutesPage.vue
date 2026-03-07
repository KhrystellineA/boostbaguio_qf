<template>
  <q-page class="saved-routes-page bg-grey-1">
    <div class="container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-info">
            <q-icon name="bookmark" color="primary" size="32px" class="q-mr-md" />
            <div>
              <div class="text-h4 text-weight-bold text-primary">Saved Routes</div>
              <div class="text-subtitle1 text-grey-7">
                {{ isOnline ? 'Online' : 'Offline Mode' }} • {{ savedRoutes.length }} routes saved
              </div>
            </div>
          </div>
          <div class="header-actions">
            <q-btn
              flat
              round
              icon="refresh"
              @click="refreshRoutes"
              :loading="loading"
              color="primary"
              size="lg"
            >
              <q-tooltip>Refresh Saved Routes</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Online/Offline Status Banner -->
      <q-banner v-if="!isOnline" class="status-banner bg-warning text-white q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="cloud_off" />
        </template>
        <div class="status-content">
          <div class="text-weight-bold">Offline Mode Active</div>
          <div>Showing cached routes only. Features may be limited.</div>
        </div>
      </q-banner>

      <!-- Empty State -->
      <q-card v-if="savedRoutes.length === 0" flat class="empty-state-card">
        <div class="empty-state-content">
          <q-icon name="bookmark_border" size="80px" color="grey-4" class="q-mb-lg" />
          <div class="text-h5 text-weight-bold q-mb-md">No Saved Routes</div>
          <div class="text-body1 text-grey-7 q-mb-xl">
            Save your favorite routes for quick access and offline use
          </div>
          <q-btn
            color="primary"
            label="Explore Routes"
            icon="explore"
            @click="$router.push('/')"
            size="lg"
            padding="12px 24px"
          />
        </div>
      </q-card>

      <!-- Routes List -->
      <div v-else class="routes-list">
        <div class="routes-grid">
          <q-card v-for="route in savedRoutes" :key="route.id" class="route-card">
            <q-card-section class="route-header">
              <div class="route-title">
                <div class="text-h6 text-weight-bold">{{ route.name }}</div>
                <div class="text-body2 text-grey-7">{{ route.description }}</div>
              </div>
              <q-btn-dropdown flat round dense icon="more_vert" class="action-menu">
                <q-list>
                  <q-item clickable v-close-popup @click="viewRoute(route)">
                    <q-item-section avatar>
                      <q-icon name="visibility" color="primary" />
                    </q-item-section>
                    <q-item-section>View Details</q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="shareRoute(route)">
                    <q-item-section avatar>
                      <q-icon name="share" color="primary" />
                    </q-item-section>
                    <q-item-section>Share</q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable v-close-popup @click="removeRoute(route)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-card-section>

            <q-card-section class="route-stats">
              <div class="stat-item">
                <q-icon name="route" color="primary" size="20px" class="q-mr-sm" />
                <span>{{ route.distance || 'N/A' }}</span>
              </div>
              <div class="stat-item">
                <q-icon name="schedule" color="primary" size="20px" class="q-mr-sm" />
                <span>{{ route.duration || 'N/A' }}</span>
              </div>
              <div v-if="!isOnline" class="stat-item">
                <q-icon name="cloud_off" color="warning" size="20px" class="q-mr-sm" />
                <span>Cached</span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-section class="route-details">
              <div class="detail-item">
                <q-icon name="place" color="primary" size="18px" class="q-mr-sm" />
                <div class="detail-label">From</div>
                <div class="detail-value">{{ route.origin || 'Unknown' }}</div>
              </div>
              <div class="detail-item">
                <q-icon name="place" color="primary" size="18px" class="q-mr-sm" />
                <div class="detail-label">To</div>
                <div class="detail-value">{{ route.destination || 'Unknown' }}</div>
              </div>
              <div v-if="route.cachedAt" class="detail-item">
                <q-icon name="update" color="primary" size="18px" class="q-mr-sm" />
                <div class="detail-label">Saved</div>
                <div class="detail-value">{{ formatDate(route.cachedAt) }}</div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pr-md">
              <q-btn flat color="primary" label="View Route" @click="viewRoute(route)" size="sm" />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Storage Info Card -->
      <q-card v-if="savedRoutes.length > 0" flat class="storage-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold q-mb-md">Storage Usage</div>
          <div v-if="storageInfo">
            <q-linear-progress
              :value="storageInfo.percentageUsed / 100"
              color="primary"
              class="progress-bar q-mb-sm"
              size="24px"
              rounded
            >
              <div class="absolute-full flex flex-center">
                <div class="text-white text-caption text-weight-bold">
                  {{ storageInfo.percentageUsed }}% used
                </div>
              </div>
            </q-linear-progress>
            <div class="storage-details">
              <div class="text-body2">
                {{ storageInfo.usageInMB }} MB of {{ storageInfo.quotaInMB }} MB used
              </div>
              <div class="text-caption text-grey-7">
                {{ Math.round((storageInfo.quotaInMB - storageInfo.usageInMB) * 100) / 100 }} MB
                available
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Clear All Button -->
      <div v-if="savedRoutes.length > 0" class="clear-all-section">
        <q-btn
          outline
          color="negative"
          label="Clear All Saved Routes"
          icon="delete_sweep"
          @click="confirmClearAll"
          size="md"
          padding="12px 24px"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useOfflineMode } from 'src/composables/useOfflineMode'

const router = useRouter()
const $q = useQuasar()
const { isOnline, getCachedRoutes, removeCachedRoute, clearAllCachedRoutes, getCacheSize } =
  useOfflineMode()

const savedRoutes = ref([])
const loading = ref(false)
const storageInfo = ref(null)

onMounted(async () => {
  await loadRoutes()
  await loadStorageInfo()
})

const loadRoutes = async () => {
  loading.value = true
  try {
    savedRoutes.value = getCachedRoutes()
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to load saved routes',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const loadStorageInfo = async () => {
  storageInfo.value = await getCacheSize()
}

const refreshRoutes = async () => {
  await loadRoutes()
  await loadStorageInfo()

  $q.notify({
    type: 'positive',
    message: 'Routes refreshed',
    position: 'top',
    timeout: 1500,
  })
}

const viewRoute = (route) => {
  router.push(`/route/${route.id}`)
}

const shareRoute = async (route) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: route.name,
        text: route.description,
        url: window.location.origin + `/route/${route.id}`,
      })
    } catch {
      console.log('Share cancelled')
    }
  } else {
    const url = window.location.origin + `/route/${route.id}`
    await navigator.clipboard.writeText(url)

    $q.notify({
      type: 'positive',
      message: 'Route link copied to clipboard',
      position: 'top',
    })
  }
}

const removeRoute = (route) => {
  $q.dialog({
    title: 'Remove Route',
    message: `Remove "${route.name}" from saved routes?`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'Remove',
      color: 'negative',
    },
  }).onOk(() => {
    const success = removeCachedRoute(route.id)

    if (success) {
      savedRoutes.value = savedRoutes.value.filter((r) => r.id !== route.id)

      $q.notify({
        type: 'positive',
        message: 'Route removed',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to remove route',
        position: 'top',
      })
    }
  })
}

const confirmClearAll = () => {
  $q.dialog({
    title: 'Clear All Routes',
    message: 'This will remove all saved routes. Continue?',
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Clear All',
    },
  }).onOk(() => {
    const success = clearAllCachedRoutes()

    if (success) {
      savedRoutes.value = []

      $q.notify({
        type: 'positive',
        message: 'All routes cleared',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to clear routes',
        position: 'top',
      })
    }
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString()
}
</script>

<style scoped>
.saved-routes-page {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(45, 93, 62, 0.1);
}

.header-info {
  display: flex;
  align-items: center;
}

.status-banner {
  border-radius: 12px;
  margin-bottom: 2rem;
}

.status-content {
  flex: 1;
}

.empty-state-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(45, 93, 62, 0.1);
  margin: 2rem 0;
}

.empty-state-content {
  text-align: center;
  padding: 4rem 2rem;
}

.routes-list {
  margin: 2rem 0;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.route-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(45, 93, 62, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.route-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 0.5rem;
}

.route-title {
  flex: 1;
}

.route-stats {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1.5rem 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.route-details {
  padding-top: 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.detail-label {
  font-weight: 600;
  color: #555;
  min-width: 50px;
}

.detail-value {
  color: #333;
}

.storage-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(45, 93, 62, 0.1);
  margin: 2rem 0;
}

.progress-bar {
  border-radius: 12px;
}

.storage-details {
  margin-top: 1rem;
}

.clear-all-section {
  text-align: center;
  margin: 2rem 0;
}

.text-primary {
  color: #2e5d3e !important;
}

.bg-primary {
  background-color: #2e5d3e !important;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-info {
    justify-content: center;
  }

  .routes-grid {
    grid-template-columns: 1fr;
  }

  .route-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .route-stats {
    justify-content: center;
    flex-wrap: wrap;
  }

  .container {
    padding: 0 0.5rem;
  }

  .saved-routes-page {
    padding: 1rem;
  }
}
</style>
