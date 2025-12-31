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
              <!-- Saved Items - ONLY FOR PREMIUM -->
              <q-item>
                <q-item-section avatar>
                  <q-icon name="bookmark" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>My Saves</q-item-label>
                  <q-item-label caption>
                    {{ savedItemsCount }} saved item(s)
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    label="View"
                    @click="openSavedItems"
                  />
                </q-item-section>
              </q-item>

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
              Unlock offline mode, PWA support, saved places & routes, and more!
            </div>

            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">Save unlimited places & routes</q-item-label>
                  <q-item-label caption>Bookmark your favorite spots and routes for quick access</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Full offline navigation</q-item-label>
                  <q-item-label caption>Access routes and places without internet</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>PWA installation</q-item-label>
                  <q-item-label caption>Install as a native app on your device</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Priority support</q-item-label>
                  <q-item-label caption>Get help faster when you need it</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-btn
              color="primary"
              label="Upgrade Now"
              icon="workspace_premium"
              class="full-width q-mt-md"
              size="lg"
              unelevated
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

    <!-- Saved Items List Dialog (First Modal) -->
    <q-dialog v-model="showSavedItems" maximized>
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="bookmark" />
          <div class="text-weight-bold q-ml-sm">My Saved Items</div>
          <q-space />
          <q-btn dense flat icon="close" @click="showSavedItems = false" />
        </q-bar>

        <q-card-section>
          <!-- Filter Tabs -->
          <q-tabs
            v-model="savedItemsTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="all" label="All" :badge="savedItemsCount" />
            <q-tab name="places" label="Places" :badge="savedPlaces.length" />
            <q-tab name="routes" label="Routes" :badge="savedRoutes.length" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="savedItemsTab" animated>
            <!-- All Items -->
            <q-tab-panel name="all">
              <div v-if="loadingSavedItems" class="text-center q-pa-xl">
                <q-spinner-hourglass color="primary" size="60px" />
                <p class="q-mt-md text-grey-7">Loading your saved items...</p>
              </div>

              <div v-else-if="savedItemsCount === 0" class="text-center q-pa-xl">
                <q-icon name="bookmark_border" size="80px" color="grey-5" />
                <div class="text-h6 text-grey-7 q-mt-md">No Saved Items</div>
                <p class="text-grey-6">Start exploring and save your favorite places and routes!</p>
              </div>

              <div v-else>
                <!-- Saved Places -->
                <div v-if="savedPlaces.length > 0" class="q-mb-lg">
                  <div class="text-h6 q-mb-md">
                    <q-icon name="place" color="primary" class="q-mr-sm" />
                    Places ({{ savedPlaces.length }})
                  </div>
                  <q-list bordered separator>
                    <q-item
                      v-for="place in savedPlaces"
                      :key="place.id"
                      clickable
                      v-ripple
                      @click="viewPlace(place)"
                    >
                      <q-item-section avatar>
                        <q-avatar square>
                          <img v-if="place.imageUrl" :src="place.imageUrl" />
                          <q-icon v-else name="place" size="32px" color="grey-5" />
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label>{{ place.name }}</q-item-label>
                        <q-item-label caption>{{ place.category }}</q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          dense
                          round
                          icon="delete"
                          color="negative"
                          @click.stop="removeSavedItem('place', place.id)"
                        >
                          <q-tooltip>Remove</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Saved Routes -->
                <div v-if="savedRoutes.length > 0">
                  <div class="text-h6 q-mb-md">
                    <q-icon name="route" color="primary" class="q-mr-sm" />
                    Routes ({{ savedRoutes.length }})
                  </div>
                  <q-list bordered separator>
                    <q-item
                      v-for="route in savedRoutes"
                      :key="route.id"
                      clickable
                      v-ripple
                      @click="viewRoute(route)"
                    >
                      <q-item-section avatar>
                        <q-icon name="directions" size="32px" color="primary" />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label>{{ route.from }} → {{ route.to }}</q-item-label>
                        <q-item-label caption>Saved on {{ formatDate(route.savedAt) }}</q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          dense
                          round
                          icon="delete"
                          color="negative"
                          @click.stop="removeSavedItem('route', route.id)"
                        >
                          <q-tooltip>Remove</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-tab-panel>

            <!-- Places Only -->
            <q-tab-panel name="places">
              <div v-if="loadingSavedItems" class="text-center q-pa-xl">
                <q-spinner-hourglass color="primary" size="60px" />
                <p class="q-mt-md text-grey-7">Loading places...</p>
              </div>

              <div v-else-if="savedPlaces.length === 0" class="text-center q-pa-xl">
                <q-icon name="place" size="80px" color="grey-5" />
                <div class="text-h6 text-grey-7 q-mt-md">No Saved Places</div>
                <p class="text-grey-6">Explore MAYKAN to discover and save places!</p>
              </div>

              <q-list v-else bordered separator>
                <q-item
                  v-for="place in savedPlaces"
                  :key="place.id"
                  clickable
                  v-ripple
                  @click="viewPlace(place)"
                >
                  <q-item-section avatar>
                    <q-avatar square>
                      <img v-if="place.imageUrl" :src="place.imageUrl" />
                      <q-icon v-else name="place" size="32px" color="grey-5" />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ place.name }}</q-item-label>
                    <q-item-label caption>{{ place.category }} • {{ place.area }}</q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="navigation"
                        color="primary"
                        @click.stop="navigateToPlace(place)"
                      >
                        <q-tooltip>Get Directions</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        @click.stop="removeSavedItem('place', place.id)"
                      >
                        <q-tooltip>Remove</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>

            <!-- Routes Only -->
            <q-tab-panel name="routes">
              <div v-if="loadingSavedItems" class="text-center q-pa-xl">
                <q-spinner-hourglass color="primary" size="60px" />
                <p class="q-mt-md text-grey-7">Loading routes...</p>
              </div>

              <div v-else-if="savedRoutes.length === 0" class="text-center q-pa-xl">
                <q-icon name="route" size="80px" color="grey-5" />
                <div class="text-h6 text-grey-7 q-mt-md">No Saved Routes</div>
                <p class="text-grey-6">Use APANAM to find routes and save them for quick access!</p>
              </div>

              <q-list v-else bordered separator>
                <q-item
                  v-for="route in savedRoutes"
                  :key="route.id"
                  clickable
                  v-ripple
                  @click="viewRoute(route)"
                >
                  <q-item-section avatar>
                    <q-icon name="directions" size="32px" color="primary" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ route.from }} → {{ route.to }}</q-item-label>
                    <q-item-label caption>
                      {{ route.routeName || 'Direct Route' }} • Saved on {{ formatDate(route.savedAt) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-xs">
                      <q-btn
                        flat
                        dense
                        round
                        icon="navigation"
                        color="primary"
                        @click.stop="useRoute(route)"
                      >
                        <q-tooltip>Use Route</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="delete"
                        color="negative"
                        @click.stop="removeSavedItem('route', route.id)"
                      >
                        <q-tooltip>Remove</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dynamic Details Modal (Second Modal) -->
    <q-dialog v-model="showDetailsModal">
      <q-card style="width: 100%; max-width: 800px; max-height: 90vh">
        <q-bar class="bg-primary text-white">
          <q-icon :name="selectedItemType === 'place' ? 'place' : 'directions'" />
          <div class="text-weight-bold q-ml-sm">
            {{ selectedItemType === 'place' ? selectedItem?.name : `${selectedItem?.from} → ${selectedItem?.to}` }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <!-- PLACE DETAILS -->
        <q-card-section class="q-pa-none" v-if="selectedItemType === 'place' && selectedItem">
          <q-scroll-area style="height: calc(90vh - 50px)">
            <!-- Place Image -->
            <div style="height: 250px; overflow: hidden;">
              <img 
                v-if="selectedItem.imageUrl" 
                :src="selectedItem.imageUrl" 
                style="width: 100%; height: 100%; object-fit: cover;"
              />
              <div v-else style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
                <q-icon name="place" size="80px" color="grey-5" />
              </div>
            </div>

            <!-- Place Info -->
            <div class="q-pa-lg">
              <q-chip :label="selectedItem.category" color="primary" text-color="white" class="q-mb-md" />
              
              <h4 class="text-h5 text-weight-bold q-mt-none q-mb-md">{{ selectedItem.name }}</h4>
              <p class="text-body1 q-mb-lg">{{ selectedItem.description }}</p>

              <!-- Operating Hours -->
              <q-card flat bordered class="q-mb-md" v-if="selectedItem.operatingHours">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="schedule" size="24px" color="primary" class="q-mr-sm" />
                    <span class="text-weight-bold">Operating Hours</span>
                  </div>
                  <div class="text-body2">{{ selectedItem.operatingHours }}</div>
                </q-card-section>
              </q-card>

              <!-- Location -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="location_on" size="24px" color="primary" class="q-mr-sm" />
                    <span class="text-weight-bold">Location</span>
                  </div>
                  <div class="text-body2">{{ selectedItem.address }}</div>
                  <div class="text-caption text-grey-7 q-mt-xs" v-if="selectedItem.area">Area: {{ selectedItem.area }}</div>
                </q-card-section>
              </q-card>

              <!-- Entrance Fee -->
              <q-card flat bordered class="q-mb-md" v-if="selectedItem.entranceFee">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="payments" size="24px" color="primary" class="q-mr-sm" />
                    <span class="text-weight-bold">Entrance Fee</span>
                  </div>
                  <div class="text-body2">{{ selectedItem.entranceFee }}</div>
                </q-card-section>
              </q-card>

              <!-- Contact -->
              <q-card flat bordered class="q-mb-md" v-if="selectedItem.phone || selectedItem.website">
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="phone" size="24px" color="primary" class="q-mr-sm" />
                    <span class="text-weight-bold">Contact</span>
                  </div>
                  <div class="text-body2 q-mb-xs" v-if="selectedItem.phone">
                    <q-icon name="phone" size="16px" /> {{ selectedItem.phone }}
                  </div>
                  <div class="text-body2" v-if="selectedItem.website">
                    <q-icon name="language" size="16px" />
                    <a :href="selectedItem.website" target="_blank" class="text-primary">Visit Website</a>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Tags -->
              <div class="q-mb-lg" v-if="selectedItem.tags && selectedItem.tags.length > 0">
                <div class="text-weight-bold q-mb-sm">Tags</div>
                <q-chip
                  v-for="(tag, idx) in selectedItem.tags"
                  :key="idx"
                  :label="tag"
                  color="primary"
                  outline
                  size="sm"
                  class="q-mr-sm q-mb-sm"
                />
              </div>

              <!-- Saved Date -->
              <div class="text-caption text-grey-7 q-mb-md">
                <q-icon name="bookmark" size="16px" /> Saved on {{ formatDate(selectedItem.savedAt) }}
              </div>

              <!-- Action Button -->
              <q-btn
                label="Get Directions via APANAM"
                color="primary"
                unelevated
                icon="navigation"
                class="full-width"
                @click="navigateToPlaceFromModal"
              />
            </div>
          </q-scroll-area>
        </q-card-section>

        <!-- ROUTE DETAILS -->
        <q-card-section v-if="selectedItemType === 'route' && selectedItem">
          <q-scroll-area style="height: calc(90vh - 100px)">
            <div class="text-h5 q-mb-md">{{ selectedItem.from }} → {{ selectedItem.to }}</div>
            <div class="text-subtitle1 text-grey-7 q-mb-lg">{{ selectedItem.routeName || 'Direct Route' }}</div>

            <!-- Starting Point -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="place" size="24px" color="primary" class="q-mr-sm" />
                  <span class="text-weight-bold">Starting Point</span>
                </div>
                <div class="text-body1">{{ selectedItem.from }}</div>
                <div class="text-caption text-grey-7" v-if="selectedItem.fromAddress">{{ selectedItem.fromAddress }}</div>
              </q-card-section>
            </q-card>

            <!-- Destination -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="flag" size="24px" color="primary" class="q-mr-sm" />
                  <span class="text-weight-bold">Destination</span>
                </div>
                <div class="text-body1">{{ selectedItem.to }}</div>
                <div class="text-caption text-grey-7" v-if="selectedItem.toAddress">{{ selectedItem.toAddress }}</div>
              </q-card-section>
            </q-card>

            <!-- Fare -->
            <q-card flat bordered class="q-mb-md" v-if="selectedItem.fare">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="payments" size="24px" color="primary" class="q-mr-sm" />
                  <span class="text-weight-bold">Estimated Fare</span>
                </div>
                <div class="text-body1">{{ selectedItem.fare }}</div>
              </q-card-section>
            </q-card>

            <!-- Route Info -->
            <q-card flat bordered class="q-mb-lg" v-if="selectedItem.distance || selectedItem.duration">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="info" size="24px" color="primary" class="q-mr-sm" />
                  <span class="text-weight-bold">Route Information</span>
                </div>
                <div class="text-body2" v-if="selectedItem.distance">
                  <strong>Distance:</strong> {{ selectedItem.distance }}
                </div>
                <div class="text-body2" v-if="selectedItem.duration">
                  <strong>Duration:</strong> {{ selectedItem.duration }}
                </div>
              </q-card-section>
            </q-card>

            <!-- Saved Date -->
            <div class="text-caption text-grey-7 q-mb-md">
              <q-icon name="bookmark" size="16px" /> Saved on {{ formatDate(selectedItem.savedAt) }}
            </div>

            <!-- Action Button -->
            <q-btn
              label="Use This Route in APANAM"
              color="primary"
              unelevated
              icon="directions"
              class="full-width"
              @click="navigateToRouteFromModal"
            />
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'stores/user-store'
import { useQuasar } from 'quasar'
import { db, auth } from 'src/boot/firebase' 
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

const router = useRouter()
const userStore = useUserStore()
const $q = useQuasar()

const showUpgradeDialog = ref(false)
const showSavedItems = ref(false)
const savedItemsTab = ref('all')
const offlineModeEnabled = ref(false)
const isOnline = ref(navigator.onLine)
const cacheSize = ref('0 MB')
const isPWAInstalled = ref(false)
const loadingSavedItems = ref(false)
let deferredPrompt = null

const savedPlaces = ref([])
const savedRoutes = ref([])

const showDetailsModal = ref(false)
const selectedItem = ref(null)
const selectedItemType = ref(null) 

const savedItemsCount = computed(() => {
  return savedPlaces.value.length + savedRoutes.value.length
})

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
  loadSavedItems()
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

const loadSavedItems = async () => {
  const currentUser = auth.currentUser
  const userId = currentUser?.uid || userStore.userId || userStore.user?.uid || userStore.id

  console.log('[Account] Debug:', {
    authCurrentUser: currentUser?.uid,
    storeUserId: userStore.userId,
    storeUserUid: userStore.user?.uid,
    storeId: userStore.id,
    finalUserId: userId
  })

  if (!userId) {
    console.log('[Account] No user logged in')
    return
  }

  loadingSavedItems.value = true

  try {
    console.log('[Account] Loading saved items for user:', userId)

    const savedPlacesRef = collection(db, 'users', userId, 'savedPlaces')
    const placesQuery = query(savedPlacesRef, orderBy('savedAt', 'desc'))
    const placesSnapshot = await getDocs(placesQuery)
    
    savedPlaces.value = placesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    const savedRoutesRef = collection(db, 'users', userId, 'savedRoutes')
    const routesQuery = query(savedRoutesRef, orderBy('savedAt', 'desc'))
    const routesSnapshot = await getDocs(routesQuery)
    
    savedRoutes.value = routesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces.value))
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes.value))

    console.log('[Account] ✅ Loaded saved items:', {
      places: savedPlaces.value.length,
      routes: savedRoutes.value.length
    })
  } catch (error) {
    console.error('[Account] Error loading saved items:', error)
    console.error('[Account] Error details:', {
      code: error.code,
      message: error.message
    })
    
    const savedPlacesData = localStorage.getItem('savedPlaces')
    const savedRoutesData = localStorage.getItem('savedRoutes')

    if (savedPlacesData) {
      savedPlaces.value = JSON.parse(savedPlacesData)
    }

    if (savedRoutesData) {
      savedRoutes.value = JSON.parse(savedRoutesData)
    }

    $q.notify({
      type: 'warning',
      message: 'Loading from offline storage',
      position: 'top'
    })
  } finally {
    loadingSavedItems.value = false
  }
}

const openSavedItems = () => {
  showSavedItems.value = true
  loadSavedItems() 
}

const viewPlace = (place) => {
  console.log('[Account] Opening place details:', place.name)
  selectedItem.value = place
  selectedItemType.value = 'place'
  showDetailsModal.value = true
}

const viewRoute = (route) => {
  console.log('[Account] Opening route details:', route.from, '→', route.to)
  selectedItem.value = route
  selectedItemType.value = 'route'
  showDetailsModal.value = true
}

const navigateToPlace = (place) => {
  showSavedItems.value = false
  router.push({
    path: '/apanam',
    query: {
      to: place.name,
      toAddress: place.address
    }
  })
}

const useRoute = (route) => {
  showSavedItems.value = false
  router.push({
    path: '/apanam',
    query: {
      from: route.from,
      to: route.to
    }
  })
}

const navigateToPlaceFromModal = () => {
  if (!selectedItem.value) return
  
  showDetailsModal.value = false
  showSavedItems.value = false
  
  router.push({
    path: '/apanam',
    query: {
      to: selectedItem.value.name,
      toAddress: selectedItem.value.address
    }
  })
}

const navigateToRouteFromModal = () => {
  if (!selectedItem.value) return
  
  showDetailsModal.value = false
  showSavedItems.value = false
  
  router.push({
    path: '/apanam',
    query: {
      from: selectedItem.value.from,
      to: selectedItem.value.to
    }
  })
}

const removeSavedItem = async (type, id) => {
  const currentUser = auth.currentUser
  const userId = currentUser?.uid || userStore.userId || userStore.user?.uid || userStore.id

  if (!userId) {
    $q.notify({
      type: 'negative',
      message: 'User not authenticated',
      position: 'top'
    })
    return
  }

  $q.dialog({
    title: 'Remove Item',
    message: `Are you sure you want to remove this ${type}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      if (type === 'place') {
        await deleteDoc(doc(db, 'users', userId, 'savedPlaces', id))
        savedPlaces.value = savedPlaces.value.filter(p => p.id !== id)
        localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces.value))
      } else if (type === 'route') {
        await deleteDoc(doc(db, 'users', userId, 'savedRoutes', id))
        savedRoutes.value = savedRoutes.value.filter(r => r.id !== id)
        localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes.value))
      }

      $q.notify({
        type: 'positive',
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`,
        icon: 'delete',
        position: 'top'
      })
    } catch (error) {
      console.error('[Account] Error removing item:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to remove item',
        position: 'top'
      })
    }
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