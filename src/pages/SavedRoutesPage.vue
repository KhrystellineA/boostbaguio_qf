<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Header -->
        <div class="row items-center q-mb-md">
          <div class="col">
            <div class="text-h5 text-weight-bold">
              <q-icon name="bookmark" color="primary" size="28px" class="q-mr-sm" />
              Saved Routes
            </div>
            <div class="text-caption text-grey-7">
              {{ isOnline ? 'Online' : 'Offline Mode' }} • {{ savedRoutes.length }} routes cached
            </div>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              round
              icon="refresh"
              @click="refreshRoutes"
              :loading="loading"
            >
              <q-tooltip>Refresh</q-tooltip>
            </q-btn>
          </div>
        </div>

        <!-- Online/Offline Status Banner -->
        <q-banner
          v-if="!isOnline"
          class="bg-warning text-white q-mb-md"
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="cloud_off" />
          </template>
          You're offline. Showing cached routes only.
        </q-banner>

        <!-- No routes message -->
        <q-card v-if="savedRoutes.length === 0" flat bordered class="text-center q-pa-xl">
          <q-icon name="bookmark_border" size="64px" color="grey-5" class="q-mb-md" />
          <div class="text-h6 text-grey-7 q-mb-sm">No Saved Routes</div>
          <div class="text-body2 text-grey-6 q-mb-md">
            Save your favorite routes for offline access
          </div>
          <q-btn
            color="primary"
            label="Find Routes"
            @click="$router.push('/')"
          />
        </q-card>

        <!-- Routes List -->
        <div v-else class="q-gutter-md">
          <q-card
            v-for="route in savedRoutes"
            :key="route.id"
            class="route-card"
            bordered
          >
            <q-card-section>
              <div class="row items-start">
                <div class="col">
                  <div class="text-h6 text-weight-medium q-mb-xs">
                    {{ route.name }}
                  </div>
                  <div class="text-body2 text-grey-7 q-mb-sm">
                    {{ route.description }}
                  </div>
                  <div class="row q-gutter-xs">
                    <q-chip
                      dense
                      icon="route"
                      color="primary"
                      text-color="white"
                      size="sm"
                    >
                      {{ route.distance || 'N/A' }}
                    </q-chip>
                    <q-chip
                      dense
                      icon="schedule"
                      color="secondary"
                      text-color="white"
                      size="sm"
                    >
                      {{ route.duration || 'N/A' }}
                    </q-chip>
                    <q-chip
                      v-if="!isOnline"
                      dense
                      icon="cloud_off"
                      color="warning"
                      text-color="white"
                      size="sm"
                    >
                      Cached
                    </q-chip>
                  </div>
                </div>
                <div class="col-auto">
                  <q-btn-dropdown
                    flat
                    round
                    dense
                    icon="more_vert"
                  >
                    <q-list>
                      <q-item
                        clickable
                        v-close-popup
                        @click="viewRoute(route)"
                      >
                        <q-item-section avatar>
                          <q-icon name="visibility" />
                        </q-item-section>
                        <q-item-section>View Route</q-item-section>
                      </q-item>

                      <q-item
                        clickable
                        v-close-popup
                        @click="shareRoute(route)"
                      >
                        <q-item-section avatar>
                          <q-icon name="share" />
                        </q-item-section>
                        <q-item-section>Share</q-item-section>
                      </q-item>

                      <q-separator />

                      <q-item
                        clickable
                        v-close-popup
                        @click="removeRoute(route)"
                      >
                        <q-item-section avatar>
                          <q-icon name="delete" color="negative" />
                        </q-item-section>
                        <q-item-section>Remove</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>
            </q-card-section>

            <!-- Route Details -->
            <q-separator />
            
            <q-card-section class="q-pt-sm">
              <div class="text-caption text-grey-7">
                <div class="q-mb-xs">
                  <q-icon name="place" size="16px" />
                  From: {{ route.origin || 'Unknown' }}
                </div>
                <div class="q-mb-xs">
                  <q-icon name="place" size="16px" />
                  To: {{ route.destination || 'Unknown' }}
                </div>
                <div v-if="route.cachedAt">
                  <q-icon name="update" size="16px" />
                  Cached: {{ formatDate(route.cachedAt) }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Clear All Button -->
        <div v-if="savedRoutes.length > 0" class="q-mt-lg text-center">
          <q-btn
            flat
            color="negative"
            label="Clear All Cached Routes"
            icon="delete_sweep"
            @click="confirmClearAll"
          />
        </div>

        <!-- Storage Info -->
        <q-card flat bordered class="q-mt-lg">
          <q-card-section>
            <div class="text-subtitle2 text-weight-medium q-mb-sm">
              Storage Usage
            </div>
            <div v-if="storageInfo">
              <q-linear-progress
                :value="storageInfo.percentageUsed / 100"
                color="primary"
                class="q-mb-sm"
                size="20px"
              >
                <div class="absolute-full flex flex-center">
                  <div class="text-white text-caption">
                    {{ storageInfo.percentageUsed }}% used
                  </div>
                </div>
              </q-linear-progress>
              <div class="text-caption text-grey-7">
                {{ storageInfo.usageInMB }} MB of {{ storageInfo.quotaInMB }} MB used
              </div>
            </div>
          </q-card-section>
        </q-card>
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
const {
  isOnline,
  getCachedRoutes,
  removeCachedRoute,
  clearAllCachedRoutes,
  getCacheSize
} = useOfflineMode()

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
      position: 'top'
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
    position: 'top'
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
        url: window.location.origin + `/route/${route.id}`
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
      position: 'top'
    })
  }
}

const removeRoute = (route) => {
  $q.dialog({
    title: 'Remove Route',
    message: `Remove "${route.name}" from saved routes?`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const success = removeCachedRoute(route.id)
    
    if (success) {
      savedRoutes.value = savedRoutes.value.filter(r => r.id !== route.id)
      
      $q.notify({
        type: 'positive',
        message: 'Route removed',
        position: 'top'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to remove route',
        position: 'top'
      })
    }
  })
}

const confirmClearAll = () => {
  $q.dialog({
    title: 'Clear All Routes',
    message: 'This will remove all cached routes. Continue?',
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Clear All'
    }
  }).onOk(() => {
    const success = clearAllCachedRoutes()
    
    if (success) {
      savedRoutes.value = []
      
      $q.notify({
        type: 'positive',
        message: 'All routes cleared',
        position: 'top'
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to clear routes',
        position: 'top'
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
.route-card {
  transition: transform 0.2s;
}

.route-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>