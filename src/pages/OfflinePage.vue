<template>
  <q-page class="offline-page flex flex-center">
    <div class="offline-container">
      <div class="offline-content text-center">
        <div class="icon-container q-mb-xl">
          <q-icon name="cloud_off" size="120px" color="grey-6" />
        </div>

        <div class="text-h3 text-weight-bold text-primary q-mb-sm">You're Offline</div>

        <div class="text-body1 text-grey-7 q-mb-xl">No internet connection detected</div>

        <!-- Status Indicators -->
        <div class="status-section q-mb-xl">
          <div v-if="userStore.isPremium" class="status-card positive">
            <q-icon name="check_circle" color="positive" size="24px" class="q-mr-sm" />
            <span class="text-weight-bold">Premium Offline Mode Active</span>
          </div>
          <div v-else class="status-card warning">
            <q-icon name="info" color="warning" size="24px" class="q-mr-sm" />
            <span class="text-weight-bold">Limited Offline Access</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons q-mb-xl">
          <q-btn
            color="primary"
            label="Retry Connection"
            icon="refresh"
            @click="retryConnection"
            :loading="retrying"
            size="lg"
            padding="12px 24px"
            class="q-mr-md"
          />

          <q-btn
            v-if="userStore.isPremium"
            color="secondary"
            label="View Offline Content"
            icon="offline_pin"
            @click="viewOfflineContent"
            size="lg"
            padding="12px 24px"
          />
        </div>

        <!-- Premium Upgrade Prompt -->
        <div v-if="!userStore.isPremium" class="upgrade-prompt q-mb-xl">
          <div class="upgrade-card">
            <div class="text-h6 text-weight-bold q-mb-sm">Upgrade to Premium</div>
            <p class="text-body2 q-mb-md">
              Unlock full offline access, premium routes, and exclusive features
            </p>
            <q-btn
              color="primary"
              label="Upgrade Now"
              @click="upgradeToPremium"
              size="md"
              padding="8px 20px"
            />
          </div>
        </div>

        <!-- Cached Routes Preview (for premium users) -->
        <div v-if="userStore.isPremium && cachedRoutes.length > 0" class="cached-section">
          <div class="text-h6 text-weight-bold text-primary q-mb-md">Available Offline Routes</div>
          <q-list bordered separator class="rounded-borders route-list">
            <q-item
              v-for="route in cachedRoutes"
              :key="route.id"
              clickable
              @click="viewRoute(route)"
              class="route-item"
            >
              <q-item-section avatar>
                <q-icon name="route" color="primary" size="24px" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ route.name }}</q-item-label>
                <q-item-label caption>{{ route.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Offline Tips -->
        <div class="tips-section q-mt-xl">
          <div class="text-h6 text-weight-bold q-mb-md">Offline Tips</div>
          <div class="tips-grid">
            <div class="tip-card">
              <q-icon name="download" color="primary" size="24px" class="q-mb-sm" />
              <div class="text-body2">Download routes before going offline</div>
            </div>
            <div class="tip-card">
              <q-icon name="map" color="primary" size="24px" class="q-mb-sm" />
              <div class="text-body2">Check saved locations for offline access</div>
            </div>
            <div class="tip-card">
              <q-icon name="settings" color="primary" size="24px" class="q-mb-sm" />
              <div class="text-body2">Enable auto-sync for seamless experience</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { useQuasar } from 'quasar'

const router = useRouter()
const userStore = useUserStore()
const $q = useQuasar()

const retrying = ref(false)
const cachedRoutes = ref([])

onMounted(async () => {
  if (userStore.isPremium) {
    await loadCachedRoutes()
  }
})

const retryConnection = async () => {
  retrying.value = true

  try {
    // Simulate connection check
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (navigator.onLine) {
      $q.notify({
        type: 'positive',
        message: 'Connection restored!',
        position: 'top',
        timeout: 1500,
      })

      router.push('/')
    } else {
      throw new Error('Still offline')
    }
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Still offline. Please check your connection.',
      position: 'top',
    })
  } finally {
    retrying.value = false
  }
}

const loadCachedRoutes = async () => {
  try {
    const cached = localStorage.getItem('cachedRoutes')
    if (cached) {
      cachedRoutes.value = JSON.parse(cached)
    }
  } catch (error) {
    console.error('Error loading cached routes:', error)
  }
}

const viewRoute = (route) => {
  router.push(`/route/${route.id}`)
}

const viewOfflineContent = () => {
  router.push('/saved-routes')
}

const upgradeToPremium = () => {
  router.push('/account')
}
</script>

<style scoped>
.offline-page {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  min-height: 100vh;
}

.offline-container {
  width: 100%;
  max-width: 600px;
  padding: 2rem;
}

.offline-content {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(45, 93, 62, 0.1);
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  background: rgba(45, 93, 62, 0.05);
  border-radius: 50%;
  margin: 0 auto;
}

.status-section {
  display: flex;
  justify-content: center;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
}

.status-card.positive {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-card.warning {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.upgrade-prompt {
  padding: 1.5rem;
  background: linear-gradient(135deg, #8d6e63 0%, #a1887f 100%);
  color: white;
  border-radius: 12px;
  margin: 0 auto;
  max-width: 400px;
}

.upgrade-card {
  text-align: center;
}

.route-list {
  border-radius: 12px;
  overflow: hidden;
}

.route-item {
  border-radius: 8px;
  margin: 0.5rem;
  transition: all 0.3s ease;
}

.route-item:hover {
  background: rgba(45, 93, 62, 0.05);
  transform: translateY(-2px);
}

.tips-section {
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 12px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.text-primary {
  color: #2e5d3e !important;
}

.text-secondary {
  color: #8d6e63 !important;
}

.bg-primary {
  background-color: #2e5d3e !important;
}

.bg-secondary {
  background-color: #8d6e63 !important;
}

.rounded-borders {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .offline-container {
    padding: 1rem;
  }

  .offline-content {
    padding: 1.5rem;
  }

  .icon-container {
    width: 120px;
    height: 120px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .q-btn {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>
