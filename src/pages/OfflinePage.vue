<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-md">
      <q-icon 
        name="cloud_off" 
        size="100px" 
        color="grey-5" 
        class="q-mb-md"
      />
      
      <div class="text-h4 text-weight-bold q-mb-sm">
        You're Offline
      </div>
      
      <div class="text-body1 text-grey-7 q-mb-md">
        No internet connection detected
      </div>

      <div v-if="userStore.isPremium" class="q-mb-lg">
        <q-icon name="check_circle" color="positive" class="q-mr-sm" />
        <span class="text-body2">Premium offline mode active</span>
      </div>

      <div v-else class="q-mb-lg bg-amber-1 q-pa-md rounded-borders">
        <q-icon name="info" color="amber" class="q-mr-sm" />
        <span class="text-body2">Upgrade to Premium for full offline access</span>
      </div>

      <div class="q-gutter-sm">
        <q-btn
          color="primary"
          label="Retry Connection"
          icon="refresh"
          @click="retryConnection"
          :loading="retrying"
        />
        
        <q-btn
          v-if="userStore.isPremium"
          flat
          color="primary"
          label="View Cached Routes"
          @click="$router.push('/saved-routes')"
        />
      </div>

      <!-- Cached Routes Preview (for premium users) -->
      <div v-if="userStore.isPremium && cachedRoutes.length > 0" class="q-mt-lg">
        <div class="text-subtitle2 text-weight-medium q-mb-sm">
          Available Offline Routes
        </div>
        <q-list bordered separator class="rounded-borders">
          <q-item 
            v-for="route in cachedRoutes" 
            :key="route.id"
            clickable
            @click="viewRoute(route)"
          >
            <q-item-section>
              <q-item-label>{{ route.name }}</q-item-label>
              <q-item-label caption>{{ route.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" />
            </q-item-section>
          </q-item>
        </q-list>
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
    await fetch('/ping', { method: 'HEAD' })
    
    $q.notify({
      type: 'positive',
      message: 'Connection restored!',
      position: 'top'
    })
    
    router.push('/')
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Still offline. Please try again.',
      position: 'top'
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
  } catch  {
    console.log('Error loading cached routes:')
  }
}

const viewRoute = (route) => {
  router.push(`/route/${route.id}`)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>