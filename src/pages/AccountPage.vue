<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- User Info Card -->
        <q-card class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="text-h5">
              <q-icon name="person" size="28px" class="q-mr-sm" />
              {{ userStore.userName }}
            </div>
            <div class="text-caption">{{ userStore.userEmail }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row items-center q-gutter-sm">
              <q-icon 
                :name="userStore.isPremium ? 'workspace_premium' : 'lock'"
                :color="userStore.isPremium ? 'amber' : 'grey'"
                size="24px"
              />
              <div>
                <div class="text-subtitle1 text-weight-medium">
                  {{ userStore.isPremium ? 'Premium Account' : 'Free Account' }}
                </div>
                <div v-if="userStore.isPremium && userStore.premiumExpiry" class="text-caption text-grey-7">
                  Valid until {{ formatDate(userStore.premiumExpiry) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Premium Features Card -->
        <q-card v-if="userStore.isPremium" class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Premium Features</div>
            
            <q-list>
              <!-- Offline Mode -->
              <q-item>
                <q-item-section avatar>
                  <q-icon 
                    :name="isOnline ? 'cloud_done' : 'cloud_off'"
                    :color="isOnline ? 'positive' : 'warning'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Offline Mode</q-item-label>
                  <q-item-label caption>
                    {{ isOnline ? 'Online - Data synced' : 'Offline - Using cached data' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle
                    v-model="offlineModeEnabled"
                    color="primary"
                    @update:model-value="toggleOfflineMode"
                  />
                </q-item-section>
              </q-item>

              <!-- PWA Install -->
              <q-item v-if="!isPWAInstalled">
                <q-item-section avatar>
                  <q-icon name="get_app" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Install PWA</q-item-label>
                  <q-item-label caption>
                    Install Baguio Boost on your device
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="Install"
                    @click="installPWA"
                  />
                </q-item-section>
              </q-item>

              <!-- Saved Routes -->
              <q-item>
                <q-item-section avatar>
                  <q-icon name="bookmark" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Saved Routes</q-item-label>
                  <q-item-label caption>
                    Access saved routes offline
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="View"
                    @click="$router.push('/saved-routes')"
                  />
                </q-item-section>
              </q-item>

              <!-- Cache Management -->
              <q-item>
                <q-item-section avatar>
                  <q-icon name="storage" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Offline Data</q-item-label>
                  <q-item-label caption>
                    {{ cacheSize }} cached
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    color="negative"
                    label="Clear"
                    @click="clearCache"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Upgrade to Premium Card (for free users) -->
        <q-card v-else class="q-mb-md">
          <q-card-section class="bg-amber-1">
            <div class="text-h6 q-mb-sm">
              <q-icon name="star" color="amber" size="24px" />
              Upgrade to Premium
            </div>
            <div class="text-body2 q-mb-md">
              Unlock offline mode, PWA support, and more features!
            </div>

            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Full offline navigation</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>PWA installation</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Save unlimited routes</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Priority support</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-btn
              color="primary"
              label="Upgrade Now"
              class="full-width q-mt-md"
              @click="showUpgradeDialog = true"
            />
          </q-card-section>
        </q-card>

        <!-- Logout Button -->
        <q-card>
          <q-card-section>
            <q-btn
              color="negative"
              label="Logout"
              icon="logout"
              class="full-width"
              @click="handleLogout"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Upgrade Dialog -->
    <q-dialog v-model="showUpgradeDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Choose Your Plan</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list>
            <q-item 
              clickable
              v-ripple
              @click="activatePremium(1)"
            >
              <q-item-section>
                <q-item-label>1 Month - ₱99</q-item-label>
                <q-item-label caption>Billed monthly</q-item-label>
              </q-item-section>
            </q-item>

            <q-item 
              clickable
              v-ripple
              @click="activatePremium(6)"
            >
              <q-item-section>
                <q-item-label>6 Months - ₱499</q-item-label>
                <q-item-label caption>Save 15%</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="positive" label="Popular" />
              </q-item-section>
            </q-item>

            <q-item 
              clickable
              v-ripple
              @click="activatePremium(12)"
            >
              <q-item-section>
                <q-item-label>1 Year - ₱899</q-item-label>
                <q-item-label caption>Save 25%</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="amber" label="Best Value" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
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

const showUpgradeDialog = ref(false)
const offlineModeEnabled = ref(false)
const isOnline = ref(navigator.onLine)
const cacheSize = ref('0 MB')
const isPWAInstalled = ref(false)
let deferredPrompt = null

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isPWAInstalled.value = true
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })

  getCacheSize()
})

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleLogout = async () => {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await userStore.logout()
    router.push('/auth')
  })
}

const activatePremium = async (months) => {
  await userStore.activatePremium(months)
  showUpgradeDialog.value = false
}

const toggleOfflineMode = async (value) => {
  if (value) {
    $q.notify({
      type: 'positive',
      message: 'Offline mode enabled',
      caption: 'Routes and data will be cached'
    })
  } else {
    $q.notify({
      type: 'info',
      message: 'Offline mode disabled'
    })
  }
}

const installPWA = async () => {
  if (!deferredPrompt) {
    $q.notify({
      type: 'warning',
      message: 'PWA installation not available',
      caption: 'Try accessing from a mobile browser'
    })
    return
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    $q.notify({
      type: 'positive',
      message: 'App installed successfully!'
    })
    isPWAInstalled.value = true
  }
  
  deferredPrompt = null
}

const getCacheSize = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const usageInMB = (estimate.usage / (1024 * 1024)).toFixed(2)
    cacheSize.value = `${usageInMB} MB`
  }
}

const clearCache = async () => {
  $q.dialog({
    title: 'Clear Offline Data',
    message: 'This will remove all cached routes and data. Continue?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      
      $q.notify({
        type: 'positive',
        message: 'Cache cleared successfully'
      })
      
      getCacheSize()
    }
  })
}
</script>