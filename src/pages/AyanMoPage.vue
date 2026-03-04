<template>
  <q-page class="ayan-mo-page">
    <q-scroll-observer @scroll="onScroll" />

    <!-- HERO SECTION (Section 1) -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">AYAN MO - Near Me</h1>
          <p class="hero-description">
            With our Near Me feature, you can easily explore nearby attractions and local favorites in Baguio City. 
            Get personalized recommendations based on your location and enjoy a seamless travel experience.
          </p>
        </div>
      </div>
    </section>

    <!-- EXTENDED HERO SECTION (Section 2) -->
    <section class="extended-hero bg-white">
      <div class="container">
        <div class="row items-center">
          <div class="col-md-6 col-12 q-pa-xl">
            <h2 class="text-h4 text-weight-bold text-primary q-mb-lg">Discover Baguio Around You</h2>
            <p class="text-body1 q-mb-md">
              AYAN MO helps you find places near your current location with category filtering. 
              Whether you're looking for tourist spots, cafes, restaurants, parks, or other attractions, 
              our system helps you discover what's nearby.
            </p>
            <p class="text-body1 q-mb-lg">
              Simply enable location services and explore the recommendations based on your current position.
            </p>
            <div class="q-gutter-sm">
              <q-chip square color="primary" text-color="white">Nearby Places</q-chip>
              <q-chip square color="secondary" text-color="white">Category Filter</q-chip>
              <q-chip square color="primary" text-color="white">Location-Based</q-chip>
              <q-chip square color="secondary" text-color="white">Local Favorites</q-chip>
            </div>
          </div>
          <div class="col-md-6 col-12 q-pa-xl">
            <div class="image-placeholder bg-grey-3 q-pa-xl rounded-borders">
              <q-icon name="my_location" size="64px" color="grey-6"/>
              <div class="text-center q-mt-md">Nearby Place Discovery</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AYAN MO SECTION (Section 3) -->
    <section class="ayan-mo-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Find Places Near You</h2>
          <p class="text-body1">Explore nearby places with category filtering and distance sorting</p>
        </div>

        <!-- Map Container - Full Width -->
        <div class="map-wrapper" style="position: relative; width: 100%; height: 700px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Full Map Background -->
          <div id="map" style="width: 100%; height: 100%; background: #e0e0e0;">
            <div class="map-placeholder-text text-center" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
              <q-icon name="map" size="64px" color="grey-6"/>
              <div class="q-mt-md text-h6">Interactive Map</div>
              <div class="text-caption">Shows nearby places based on your location</div>
            </div>
          </div>

          <!-- Floating Bento Box - Right Side -->
          <div class="floating-bento">
            <q-card class="bento-card">
              <q-card-section class="q-pa-md">
                <!-- Search Bar -->
                <div class="search-bar-section q-mb-md">
                  <q-input
                    v-model="searchQuery"
                    outlined
                    dense
                    placeholder="Search for nearby places..."
                    class="search-input"
                    @input="onSearchInput"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>

                <!-- Category Filter -->
                <div class="category-filter-section q-mb-md">
                  <div class="text-subtitle2 text-weight-bold text-primary q-mb-sm">Filter by Category</div>
                  <div class="category-buttons">
                    <q-btn-group spread outline class="full-width">
                      <q-btn
                        v-for="category in categories"
                        :key="category.value"
                        :label="category.label"
                        :unelevated="selectedCategory === category.value"
                        :outline="selectedCategory !== category.value"
                        :color="selectedCategory === category.value ? 'primary' : 'dark'"
                        size="sm"
                        padding="6px 12px"
                        class="category-btn"
                        @click="filterByCategory(category.value)"
                      />
                    </q-btn-group>
                  </div>
                </div>

                <!-- Location Button -->
                <div class="location-control-section">
                  <q-btn
                    label="Use Current Location"
                    color="primary"
                    icon="my_location"
                    class="full-width"
                    unelevated
                    @click="getCurrentLocation"
                    :loading="isLoadingLocation"
                  >
                    <template v-slot:loading>
                      <q-spinner-facebook size="sm" />
                      Detecting...
                    </template>
                  </q-btn>
                </div>
              </q-card-section>

              <!-- Places List Section -->
              <q-separator />
              
              <q-card-section class="q-pa-md places-list-section">
                <div class="row items-center justify-between q-mb-md">
                  <div class="text-subtitle2 text-weight-bold text-primary">Nearby Places</div>
                  <q-badge v-if="userLocation" color="secondary" text-color="white">
                    {{ filteredPlaces.length }} found
                  </q-badge>
                </div>

                <div v-if="isLoadingPlaces" class="text-center q-py-md">
                  <q-spinner-hourglass color="primary" size="32px" />
                  <p class="q-mt-sm text-caption text-grey-7">Finding nearby places...</p>
                </div>

                <div v-else-if="filteredPlaces.length === 0" class="text-center q-py-md">
                  <q-icon name="place" size="40px" color="grey-5" />
                  <p class="q-mt-sm text-caption text-grey-6">
                    {{ userLocation ? 'No places found near your location' : 'Select a location to see nearby places' }}
                  </p>
                </div>

                <q-scroll-area style="height: 300px;" v-else>
                  <div class="places-list">
                    <q-item
                      v-for="place in filteredPlaces"
                      :key="place.id"
                      class="place-list-item cursor-pointer q-mb-sm"
                      @click="selectPlace(place)"
                    >
                      <q-item-section avatar>
                        <q-avatar square>
                          <img :src="place.imageUrl || '~assets/place-default.jpg'" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">{{ place.name }}</q-item-label>
                        <q-item-label caption>
                          <q-badge :color="getCategoryColor(place.categories || [place.category])" class="q-mr-xs">
                            {{ getCategoryLabel(Array.isArray(place.categories) ? place.categories[0] : place.category) }}
                          </q-badge>
                          <span class="q-ml-xs">{{ calculateDistance(place) }} km away</span>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" color="grey-7" />
                      </q-item-section>
                    </q-item>
                  </div>
                </q-scroll-area>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- INFO SECTION (Section 5) -->
    <section v-if="selectedPlace" class="info-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Place Information</h2>
          <p class="text-body1">Details for {{ selectedPlace.name }}</p>
        </div>

        <div class="row">
          <div class="col-md-8 col-12 q-pa-lg">
            <q-card class="info-card">
              <q-card-section>
                <div class="row items-center q-mb-lg">
                  <div class="col">
                    <div class="text-h4 text-weight-bold text-primary">{{ selectedPlace.name }}</div>
                    <div class="text-subtitle1 q-gutter-xs">
                      <q-badge
                        v-for="(cat, idx) in (Array.isArray(selectedPlace.categories) ? selectedPlace.categories : [selectedPlace.category].filter(Boolean))"
                        :key="idx"
                        color="secondary"
                        class="text-capitalize"
                      >
                        {{ getCategoryLabel(cat) }}
                      </q-badge>
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-badge color="primary" text-color="white" class="text-bold">
                      {{ calculateDistance(selectedPlace) }} km away
                    </q-badge>
                  </div>
                </div>

                <div class="info-details">
                  <div class="info-row">
                    <q-icon name="location_on" color="primary" size="sm" class="q-mr-sm" />
                    <span>{{ selectedPlace.address || 'Address not available' }}</span>
                  </div>
                  <div class="info-row" v-if="selectedPlace.operatingHours">
                    <q-icon name="schedule" color="primary" size="sm" class="q-mr-sm" />
                    <span>{{ formatOperatingHours(selectedPlace.operatingHours) }}</span>
                  </div>
                  <div class="info-row" v-if="selectedPlace.phone">
                    <q-icon name="phone" color="primary" size="sm" class="q-mr-sm" />
                    <span>{{ selectedPlace.phone }}</span>
                  </div>
                </div>

                <div class="q-mt-lg">
                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Description</h4>
                  <p class="text-body1">{{ selectedPlace.description || 'No description available.' }}</p>
                </div>

                <div class="q-mt-lg">
                  <q-btn
                    label="Get Directions via APANAM"
                    color="primary"
                    icon="navigation"
                    class="full-width"
                    @click="navigateToPlace(selectedPlace)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-md-4 col-12 q-pa-lg">
            <div class="map-placeholder bg-grey-3 q-pa-xl rounded-borders">
              <q-icon name="map" size="48px" color="grey-6"/>
              <div class="text-center q-mt-md">Route Visualization</div>
              <div class="text-center text-caption q-mt-sm">Shows route from your location to this place</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQS SECTION (Section 6) -->
    <section class="faqs-section">
      <div class="container-faqs">
        <div class="faqs-header">
          <h2 class="faqs-title">AYAN MO FAQs</h2>
          <p class="faqs-description">Common questions about discovering nearby places</p>
        </div>
        <div class="faqs-grid">
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in leftFaqs"
              :key="index"
              :label="faq.question"
              header-class="text-weight-bold"
              class="faq-item"
            >
              <q-card class="bg-transparent">
                <q-card-section>
                  {{ faq.answer }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in rightFaqs"
              :key="index"
              :label="faq.question"
              header-class="text-weight-bold"
              class="faq-item"
            >
              <q-card class="bg-transparent">
                <q-card-section>
                  {{ faq.answer }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER SECTION (Section 7) -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'
import FooterSection from '../components/Home/FooterSection.vue'
import fallbackImage from '../assets/30.png'

export default defineComponent({
  name: 'AyanMoPage',
  components: {
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const places = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const userLocation = ref(null)
    const selectedPlace = ref(null)
    const heroImageUrl = ref(fallbackImage)
    const isLoadingLocation = ref(false)
    const isLoadingPlaces = ref(false)
    const isScrolled = ref(false)
    const mapInstance = ref(null)
    const userMarker = ref(null)

    const categories = [
      { label: 'All Categories', value: 'all' },
      { label: 'Tourist Spots', value: 'tourist-spot' },
      { label: 'Cafes & Restaurants', value: 'restaurant' },
      { label: 'Parks & Nature', value: 'park-nature' },
      { label: 'Museums & Culture', value: 'museum-culture' },
      { label: 'Shopping', value: 'shopping' },
    ]

    const faqs = [
      {
        question: 'How do I use the "Near Me" feature?',
        answer: 'Simply enable location services to find places near your current location. You can filter by category and see distance information for each place.'
      },
      {
        question: 'How accurate is the location detection?',
        answer: 'Location accuracy depends on your device and network connection. For best results, ensure location services are enabled and you have a strong GPS signal.'
      },
      {
        question: 'Can I search for specific places?',
        answer: 'Yes, use the search bar to find specific places by name or category. The search works with your current location context.'
      },
      {
        question: 'How do I get directions to a place?',
        answer: 'Click on any place in the results list, then use the "Get Directions via APANAM" button to navigate to the location.'
      }
    ]

    const leftFaqs = computed(() => faqs.slice(0, 2))
    const rightFaqs = computed(() => faqs.slice(2))

    // Filter places based on search query and category
    const filteredPlaces = computed(() => {
      let result = places.value

      // Filter by category
      if (selectedCategory.value !== 'all') {
        result = result.filter(place => {
          const placeCategories = Array.isArray(place.categories) ? place.categories : [place.category].filter(Boolean)
          return placeCategories.includes(selectedCategory.value)
        })
      }

      // Filter by search query
      if (searchQuery.value && searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(place =>
          place.name.toLowerCase().includes(query) ||
          (Array.isArray(place.categories) ? place.categories : [place.category].filter(Boolean)).some(cat => cat.toLowerCase().includes(query)) ||
          (place.description && place.description.toLowerCase().includes(query))
        )
      }

      // Sort by distance if user location is available
      if (userLocation.value) {
        result.sort((a, b) => {
          const distA = calculateDistanceRaw(a)
          const distB = calculateDistanceRaw(b)
          return distA - distB
        })
      }

      return result
    })

    const fetchHeroImage = async () => {
      try {
        console.log('[AyanMoPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'ayanmo')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[AyanMoPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[AyanMoPage] No hero image found in Firestore, using fallback')
        }
      } catch (error) {
        console.error('[AyanMoPage] Error fetching hero image:', error)
      }
    }

    const fetchPlaces = async () => {
      isLoadingPlaces.value = true
      try {
        console.log('[AyanMoPage] Fetching places from Firebase...')
        const q = query(collection(db, 'places'), orderBy('name', 'asc'))
        const querySnapshot = await getDocs(q)
        places.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('[AyanMoPage] Loaded places:', places.value.length)
      } catch (error) {
        console.error('[AyanMoPage] Error loading places:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load places',
          position: 'top'
        })
      } finally {
        isLoadingPlaces.value = false
      }
    }

    const getCurrentLocation = () => {
      if (!navigator.geolocation) {
        $q.notify({
          message: 'Geolocation is not supported by your browser',
          color: 'negative',
          position: 'top'
        })
        return
      }

      isLoadingLocation.value = true
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          
          // Update map view and add marker
          if (mapInstance.value) {
            // Fly to user's location
            mapInstance.value.flyTo([position.coords.latitude, position.coords.longitude], 15, {
              duration: 1.5
            })
            
            // Remove existing marker if any
            if (userMarker.value) {
              mapInstance.value.removeLayer(userMarker.value)
            }
            
            // Add custom "You are here" marker
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: `
                <div style="
                  position: relative;
                  width: 40px;
                  height: 40px;
                  background: #2196F3;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                  animation: pulse 2s infinite;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 16px;
                    height: 16px;
                    background: white;
                    border-radius: 50%;
                  "></div>
                </div>
                <div style="
                  position: absolute;
                  top: 45px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: bold;
                  white-space: nowrap;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  color: #333;
                ">You are here</div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 2px 10px rgba(33, 150, 243, 0.5); }
                    50% { transform: scale(1.1); box-shadow: 0 2px 20px rgba(33, 150, 243, 0.8); }
                    100% { transform: scale(1); box-shadow: 0 2px 10px rgba(33, 150, 243, 0.5); }
                  }
                </style>
              `,
              iconSize: [40, 55],
              iconAnchor: [20, 55]
            })
            
            userMarker.value = L.marker([position.coords.latitude, position.coords.longitude], { icon: userIcon })
              .addTo(mapInstance.value)
              .bindPopup(`<strong>Your Location</strong><br>Accuracy: ${Math.round(position.coords.accuracy)}m`)
              .openPopup()
          }
          
          $q.notify({
            type: 'positive',
            message: 'Location detected successfully!',
            icon: 'my_location',
            position: 'top'
          })
          isLoadingLocation.value = false
        },
        (error) => {
          console.error('[AyanMoPage] Geolocation error:', error)
          let errorMessage = 'Unable to get your location. '
          
          if (error.code === 1) {
            errorMessage += 'Please allow location access in your browser settings.'
          } else if (error.code === 2) {
            errorMessage += 'Location service is unavailable.'
          } else if (error.code === 3) {
            errorMessage += 'Location request timed out.'
          } else {
            errorMessage += error.message
          }
          
          $q.notify({
            type: 'negative',
            message: errorMessage,
            icon: 'warning',
            position: 'top',
            timeout: 5000
          })
          isLoadingLocation.value = false
        }
      )
    }

    const calculateDistance = (place) => {
      if (!userLocation.value || !place.coordinates) return 'N/A'
      
      const lat1 = userLocation.value.latitude
      const lon1 = userLocation.value.longitude
      const lat2 = place.coordinates.latitude
      const lon2 = place.coordinates.longitude
      
      // Haversine formula for distance calculation
      const R = 6371 // Earth's radius in km
      const dLat = deg2rad(lat2 - lat1)
      const dLon = deg2rad(lon2 - lon1)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const distance = R * c
      
      return distance.toFixed(2)
    }

    const calculateDistanceRaw = (place) => {
      if (!userLocation.value || !place.coordinates) return Infinity
      
      const lat1 = userLocation.value.latitude
      const lon1 = userLocation.value.longitude
      const lat2 = place.coordinates.latitude
      const lon2 = place.coordinates.longitude
      
      const R = 6371
      const dLat = deg2rad(lat2 - lat1)
      const dLon = deg2rad(lon2 - lon1)
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    const deg2rad = (deg) => {
      return deg * (Math.PI/180)
    }

    const truncateText = (text, maxLength) => {
      if (!text) return 'Discover this amazing place in Baguio City.'
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const formatOperatingHours = (operatingHours) => {
      if (!operatingHours) return ''

      // If it's already a formatted string, return as is
      if (typeof operatingHours === 'string') {
        return operatingHours
      }

      // If it's an object with open/close/days
      if (typeof operatingHours === 'object') {
        const { open, close, days } = operatingHours

        if (!open || !close) {
          return days || ''
        }

        // Convert 24-hour to 12-hour format
        const formatTime = (timeStr) => {
          if (!timeStr) return ''
          const [hours, minutes] = timeStr.split(':').map(Number)
          const period = hours >= 12 ? 'PM' : 'AM'
          const displayHours = hours % 12 || 12
          return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`
        }

        const openTime = formatTime(open)
        const closeTime = formatTime(close)

        return `${days || ''} | ${openTime} - ${closeTime}`.trim()
      }

      return ''
    }

    const getCategoryColor = (categories) => {
      const categoryArray = Array.isArray(categories) ? categories : [categories]
      const firstCategory = categoryArray[0] || 'other'
      
      const colors = {
        'tourist-spot': 'green',
        'restaurant': 'orange',
        'park-nature': 'teal',
        'museum-culture': 'purple',
        'shopping': 'pink',
        'hotel-lodging': 'blue',
        'government': 'red',
        'hospital': 'pink',
        'school': 'indigo',
        'other': 'grey'
      }
      return colors[firstCategory] || 'grey'
    }

    const getCategoryLabel = (category) => {
      const labels = {
        'tourist-spot': 'Tourist Spots',
        'restaurant': 'Cafes & Restaurants',
        'park-nature': 'Parks & Nature',
        'museum-culture': 'Museums & Culture',
        'shopping': 'Shopping',
        'hotel-lodging': 'Hotels & Lodging',
        'government': 'Government',
        'hospital': 'Hospital',
        'school': 'School',
        'other': 'Other'
      }
      return labels[category] || category
    }

    const filterByCategory = (category) => {
      selectedCategory.value = category
    }

    const onSearchInput = (val) => {
      // Debounce search to prevent excessive filtering
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        searchQuery.value = val
      }, 300)
    }

    const selectPlace = (place) => {
      selectedPlace.value = place
    }

    const navigateToPlace = (place) => {
      if (!place) return

      // Navigate to APANAM with place as destination
      router.push(`/apanam?start=${encodeURIComponent('Current Location')}&end=${encodeURIComponent(place.name)}`)
    }

    const onScroll = (info) => {
      isScrolled.value = info.position.top > 50
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchPlaces()

      // Initialize map
      if (document.getElementById('map')) {
        // Default to Baguio City center
        const defaultLat = 16.4122
        const defaultLng = 120.5948
        
        mapInstance.value = L.map('map').setView([defaultLat, defaultLng], 13)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.value)
        
        console.log('[AyanMoPage] Map initialized')
      }
      
      // Auto-detect user location on page load (non-intrusive)
      if (navigator.geolocation && !userLocation.value) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation.value = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
            
            // Add marker to map
            if (mapInstance.value) {
              const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div style="
                    position: relative;
                    width: 40px;
                    height: 40px;
                    background: #2196F3;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                  ">
                    <div style="
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      width: 16px;
                      height: 16px;
                      background: white;
                      border-radius: 50%;
                    "></div>
                  </div>
                  <div style="
                    position: absolute;
                    top: 45px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: bold;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    color: #333;
                  ">You are here</div>
                  <style>
                    @keyframes pulse {
                      0% { transform: scale(1); box-shadow: 0 2px 10px rgba(33, 150, 243, 0.5); }
                      50% { transform: scale(1.1); box-shadow: 0 2px 20px rgba(33, 150, 243, 0.8); }
                      100% { transform: scale(1); box-shadow: 0 2px 10px rgba(33, 150, 243, 0.5); }
                    }
                  </style>
                `,
                iconSize: [40, 55],
                iconAnchor: [20, 55]
              })
              
              userMarker.value = L.marker([position.coords.latitude, position.coords.longitude], { icon: userIcon })
                .addTo(mapInstance.value)
            }
            
            console.log('[AyanMoPage] Auto-detected user location')
          },
          () => {
            console.log('[AyanMoPage] Auto-location detection declined or unavailable')
          }
        )
      }
    })

    onUnmounted(() => {
      // Cleanup map if needed
      if (mapInstance.value) {
        mapInstance.value.remove()
      }
    })

    // Watch for user location changes and update map
    watch(userLocation, (newLocation) => {
      if (newLocation && mapInstance.value) {
        console.log('[AyanMoPage] User location updated:', newLocation)
        // Map will be updated by getCurrentLocation when user clicks the button
      }
    })

    // Watch for search query changes
    watch(searchQuery, (newVal) => {
      console.log('[AyanMoPage] Search query changed:', newVal)
    })

    return {
      places,
      loading,
      searchQuery,
      selectedCategory,
      userLocation,
      selectedPlace,
      heroImageUrl,
      isLoadingLocation,
      isLoadingPlaces,
      categories,
      faqs,
      leftFaqs,
      rightFaqs,
      filteredPlaces,
      getCurrentLocation,
      filterByCategory,
      onSearchInput,
      selectPlace,
      navigateToPlace,
      calculateDistance,
      truncateText,
      formatOperatingHours,
      getCategoryLabel,
      getCategoryColor,
      isScrolled,
      onScroll
    }
  },
})
</script>

<style scoped>
.ayan-mo-page {
  background-color: #F5F5F5 !important;
}

/* Navbar Animation */
.transition-all {
  transition: all 0.3s ease;
}

.floating-nav {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  color: #212121 !important;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  width: calc(100% - 32px);
  left: 16px;
  right: 16px;
  border-radius: 16px;
  margin-top: 16px;
}

.hero-section {
  height: 40vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.hero-description {
  font-size: 1.2rem;
  margin: 0;
}

.extended-hero {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.ayan-mo-section {
  background-color: #F5F5F5;
}

/* Map Wrapper with Floating Bento */
.map-wrapper {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.map-wrapper #map {
  width: 100%;
  height: 100%;
}

/* Floating Bento Box */
.floating-bento {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 380px;
  max-height: calc(100% - 40px);
  z-index: 1000;
}

.bento-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.category-btn {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  border-radius: 8px !important;
}

.places-list-section {
  background: rgba(255, 255, 255, 0.9);
}

.place-list-item {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.place-list-item:hover {
  background-color: rgba(46, 93, 62, 0.08);
  transform: translateX(4px);
}

/* Old styles kept for compatibility */

.controls-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.map-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.map-placeholder-text {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.results-section {
  background-color: white;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Bento Card Style */
.bento-card {
  background: white;
  border-radius: 16px;
  border-left: 6px solid #4EA96D;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.bento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.place-image {
  height: 200px;
  object-fit: cover;
}

.info-section {
  background-color: #F5F5F5;
}

.info-card {
  border-left: 4px solid #8D6E63;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.faqs-section {
  background: #6B5344;
  padding: 6rem 0;
  color: white;
}

.container-faqs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.faqs-header {
  text-align: center;
  margin-bottom: 4rem;
}

.faqs-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.faqs-description {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  transition: all 0.3s;
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.bg-primary {
  background-color: #4EA96D !important;
}

.text-primary {
  color: #4EA96D !important;
}

.bg-secondary {
  background-color: #8D6E63 !important;
}

.text-secondary {
  color: #8D6E63 !important;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.image-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.category-btn {
  border-radius: 25px;
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;

  &:not(.q-btn--unelevated) {
    border: 2px solid #4EA96D;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .places-grid {
    grid-template-columns: 1fr;
  }

  .row {
    flex-direction: column;
  }

  .col-md-6, .col-md-8, .col-md-4 {
    width: 100%;
    margin-bottom: 1rem;
  }

  /* Mobile: Floating bento becomes bottom sheet */
  .floating-bento {
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: 16px 16px 0 0;
  }

  .bento-card {
    border-radius: 16px 16px 0 0;
    max-height: 50vh;
  }

  .map-wrapper {
    height: 100vh;
    border-radius: 0;
  }
}
</style>