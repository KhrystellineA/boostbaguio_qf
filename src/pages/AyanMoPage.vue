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

    <!-- AYAN MO FEATURE SECTION (Section 3) -->
    <section class="feature-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Find Places Near You</h2>
          <p class="text-body1">Explore nearby places with category filtering and distance sorting</p>
        </div>

        <div class="feature-content">
          <div class="row">
            <div class="col-md-6 col-12 q-pa-lg">
              <div class="map-container">
                <div id="map" style="height: 400px; width: 100%; border-radius: 8px; background: #e0e0e0;">
                  <div class="map-placeholder-text text-center">
                    <q-icon name="map" size="48px" color="grey-6"/>
                    <div class="q-mt-md">Interactive Map</div>
                    <div class="text-caption">Shows nearby places based on your location</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6 col-12 q-pa-lg">
              <div class="controls-section">
                <div class="search-bar-section q-mb-xl">
                  <q-input
                    v-model="searchQuery"
                    filled
                    placeholder="Search for nearby places..."
                    class="search-input"
                    @input="onSearchInput"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>

                <div class="category-filter-section q-mb-xl">
                  <div class="text-h6 text-weight-bold text-primary q-mb-md">Filter by Category</div>
                  <div class="category-buttons">
                    <q-btn-group spread>
                      <q-btn
                        v-for="category in categories"
                        :key="category.value"
                        :label="category.label"
                        :unelevated="selectedCategory === category.value"
                        :outline="selectedCategory !== category.value"
                        :color="selectedCategory === category.value ? 'primary' : 'dark'"
                        size="md"
                        padding="8px 16px"
                        class="category-btn"
                        @click="filterByCategory(category.value)"
                      />
                    </q-btn-group>
                  </div>
                </div>

                <div class="location-control-section q-mb-xl">
                  <q-btn
                    label="Use Current Location"
                    color="primary"
                    icon="my_location"
                    class="full-width"
                    @click="getCurrentLocation"
                    :loading="isLoadingLocation"
                  >
                    <template v-slot:loading>
                      <q-spinner-facebook />
                      Detecting...
                    </template>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RESULTS SECTION (Section 4) -->
    <section class="results-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Nearby Places</h2>
          <p class="text-body1" v-if="userLocation">
            Showing results near your location ({{ userLocation.latitude.toFixed(4) }}, {{ userLocation.longitude.toFixed(4) }})
          </p>
          <p class="text-body1" v-else>Select a location to see nearby places</p>
        </div>

        <div v-if="isLoadingPlaces" class="text-center q-py-xl">
          <q-spinner-hourglass color="primary" size="60px" />
          <p class="q-mt-md text-grey-7">Finding nearby places...</p>
        </div>

        <div v-else-if="filteredPlaces.length === 0" class="text-center q-py-xl">
          <q-icon name="place" size="80px" color="grey-5" />
          <h3 class="text-grey-7 q-mt-md">No Places Found</h3>
          <p class="text-grey-6">
            {{ userLocation ? 'No places found near your current location' : 'Please select a location to find nearby places' }}
          </p>
        </div>

        <div v-else class="places-grid">
          <q-card
            v-for="place in filteredPlaces"
            :key="place.id"
            class="bento-card q-ma-sm"
            @click="selectPlace(place)"
          >
            <q-img
              :src="place.imageUrl || '~assets/place-default.jpg'"
              spinner-color="primary"
              class="place-image"
            />
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6 text-primary">{{ place.name }}</div>
                  <div class="text-subtitle2">{{ place.category }}</div>
                </div>
                <q-badge color="secondary" class="text-capitalize">
                  {{ calculateDistance(place) }} km
                </q-badge>
              </div>
              <p class="text-body2 q-mt-md">
                {{ truncateText(place.description, 80) }}
              </p>
            </q-card-section>
            <q-card-actions>
              <q-btn flat color="primary" @click.stop="selectPlace(place)">View Details</q-btn>
            </q-card-actions>
          </q-card>
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
                    <div class="text-subtitle1">{{ selectedPlace.category }}</div>
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
                    <span>{{ selectedPlace.operatingHours }}</span>
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

    const categories = [
      { label: 'All Categories', value: 'all' },
      { label: 'Tourist Spots', value: 'Tourist Spots' },
      { label: 'Cafes & Restaurants', value: 'Cafes & Restaurants' },
      { label: 'Parks & Nature', value: 'Parks & Nature' },
      { label: 'Shopping', value: 'Shopping' },
      { label: 'Entertainment', value: 'Entertainment' },
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
        result = result.filter(place => place.category === selectedCategory.value)
      }

      // Filter by search query
      if (searchQuery.value && searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(place =>
          place.name.toLowerCase().includes(query) ||
          place.category.toLowerCase().includes(query) ||
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
          $q.notify({
            message: 'Location detected successfully!',
            color: 'positive',
            position: 'top'
          })
          isLoadingLocation.value = false
        },
        (error) => {
          console.error('[AyanMoPage] Geolocation error:', error)
          $q.notify({
            message: `Error getting location: ${error.message}`,
            color: 'negative',
            position: 'top'
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
      
      // Initialize map if there's a container
      if (document.getElementById('map')) {
        const map = L.map('map').setView([16.4122, 120.5948], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map)
      }
    })

    onUnmounted(() => {
      // Cleanup if needed
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

.feature-section {
  background-color: #F5F5F5;
}

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
}
</style>