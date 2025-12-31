<template>
  <q-page class="ayan-mo-page">
    <!-- Hero Section - UPDATED: Dynamic background -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">AYAN MO</h1>
          <p class="hero-description">
           With our Near Me feature. you can easily explore nearby attractions and local favorites in Baguio City. Get personalized recommendations based on your locations and enjoy a seamless travel experience.
          </p>
          <div class="search-bar-wrapper">
            <q-input
              v-model="searchQuery"
              filled
              placeholder="Search cafes, restaurants, tourist spots..."
              bg-color="white"
              class="search-input"
              clearable
              @focus="showSearchDropdown = true"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            
            <!-- Search Results Dropdown -->
            <div 
              v-if="showSearchDropdown && searchQuery && filteredPlaces.length > 0" 
              class="search-dropdown"
            >
              <div class="search-results-header">
                <span>{{ filteredPlaces.length }} places found</span>
                <q-btn 
                  flat 
                  dense 
                  icon="close" 
                  size="sm" 
                  @click="closeSearchDropdown"
                />
              </div>
              <div class="search-results-list">
                <div
                  v-for="(place, index) in filteredPlaces.slice(0, 8)"
                  :key="index"
                  class="search-result-item"
                  @click="selectPlaceFromSearch(place)"
                >
                  <q-icon 
                    :name="getCategoryIcon(place.category)" 
                    size="28px" 
                    color="primary"
                    class="result-icon"
                  />
                  <div class="result-info">
                    <div class="result-name">{{ place.name }}</div>
                    <div class="result-meta">
                      <span class="result-category">{{ place.category }}</span>
                      <span v-if="userLocation" class="result-distance">
                        {{ calculateDistance(userLocation.lat, userLocation.lng, place.coords[0], place.coords[1]).toFixed(2) }} km
                      </span>
                    </div>
                  </div>
                  <q-icon name="arrow_forward" size="20px" color="grey-6" />
                </div>
              </div>
              <div v-if="filteredPlaces.length > 8" class="search-results-footer">
                <q-btn 
                  flat 
                  label="View all results below" 
                  size="sm" 
                  @click="scrollToPlaces"
                />
              </div>
            </div>
            
            <!-- No results message -->
            <div 
              v-if="showSearchDropdown && searchQuery && filteredPlaces.length === 0" 
              class="search-dropdown no-results"
            >
              <q-icon name="search_off" size="48px" color="grey-5" />
              <p>No places found for "{{ searchQuery }}"</p>
              <q-btn 
                flat 
                label="Clear search" 
                size="sm" 
                @click="searchQuery = ''"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="discovery-section">
      <div class="container">
        <div class="discovery-wrapper">
          <div class="discovery-content">
            <h2 class="discovery-title">DISCOVER PLACES AROUND YOU EFFORTLESSLY</h2>
            <p class="discovery-description">
              Explore the best spots in Baguio City with our geolocation feature. Get
              personalized recommendations based on your current location and enjoy a
              seamless experience finding what matters to you.
            </p>

            <div class="features-list">
              <div class="feature-item">
                <q-icon name="explore" size="24px" color="primary" />
                <span>Nearby Picks: A curated escape in 1Km city</span>
              </div>
              <div class="feature-item">
                <q-icon name="route" size="24px" color="primary" />
                <span>Seamless Route: Map-based or jeepney-assisted treks</span>
              </div>
              <div class="feature-item">
                <q-icon name="directions_walk" size="24px" color="primary" />
                <span>Walkable Finds: Perfect for discovery strolls and remarkable vibing</span>
              </div>
            </div>

            <q-btn
              label="Explore"
              unelevated
              color="white"
              text-color="black"
              size="lg"
              padding="10px 32px"
              class="btn-hover-lift explore-btn"
              @click="scrollToPlaces"
            />
          </div>

          <!-- UPDATED: Dynamic discovery image -->
          <div class="discovery-image">
            <div class="image-placeholder" :style="discoveryImageUrl ? { backgroundImage: `url(${discoveryImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
              <q-icon v-if="!discoveryImageUrl" name="place" size="120px" color="grey-5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="places-section">
      <div class="container-fluid">
        <div class="places-wrapper">
          <div class="map-column">
            <div class="map-container" ref="mapContainer"></div>
            
            <div class="map-controls">
              <div class="radius-selector">
                <q-btn-dropdown
                  :label="`${selectedRadius}m`"
                  color="white"
                  text-color="primary"
                  size="sm"
                  dropdown-icon="tune"
                  class="radius-btn"
                >
                  <q-list>
                    <q-item
                      v-for="radius in radiusOptions"
                      :key="radius.value"
                      clickable
                      v-close-popup
                      @click="changeRadius(radius.value)"
                      :active="selectedRadius === radius.value"
                    >
                      <q-item-section>
                        <q-item-label>{{ radius.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
              
              <q-btn
                icon="my_location"
                round
                color="primary"
                size="md"
                class="locate-btn"
                :loading="isLoadingLocation"
                @click="getUserLocation"
              >
                <q-tooltip>Find my location</q-tooltip>
              </q-btn>
            </div>
          </div>

          <div class="places-column">
            <div class="places-header">
              <h2 class="places-title">NEARBY PLACES</h2>
              <div class="filter-tabs">
                <q-btn
                  v-for="category in categories"
                  :key="category.value"
                  :label="category.label"
                  :outline="selectedCategory !== category.value"
                  :unelevated="selectedCategory === category.value"
                  color="primary"
                  size="sm"
                  class="filter-btn"
                  :loading="category.value === selectedCategory && isLoadingPlaces"
                  @click="filterByCategory(category.value)"
                />
              </div>
            </div>

            <div class="places-list" v-if="filteredPlaces.length > 0">
              <div
                v-for="(place, index) in filteredPlaces"
                :key="index"
                class="place-card"
                :class="{ 'selected-place': selectedPlace?.name === place.name }"
                @click="selectPlace(place)"
              >
                <div class="place-image">
                  <q-icon :name="getCategoryIcon(place.category)" size="40px" color="primary" />
                </div>
                
                <div class="place-info">
                  <h3 class="place-name">{{ place.name }}</h3>
                  <p class="place-category">{{ place.category }}</p>
                  <p class="place-address" v-if="place.address">{{ place.address }}</p>
                  
                  <div class="place-meta">
                    <span class="distance" v-if="userLocation">
                      <q-icon name="directions_walk" size="16px" />
                      {{ calculateDistance(userLocation.lat, userLocation.lng, place.coords[0], place.coords[1]).toFixed(2) }} km
                    </span>
                  </div>

                  <div class="place-actions">
                    <q-btn
                      label="Navigate (Jeep)"
                      icon="directions_bus"
                      outline
                      color="primary"
                      size="sm"
                      class="action-btn"
                      @click.stop="navigateViaJeep(place)"
                    />
                    <q-btn
                      label="Walk"
                      icon="directions_walk"
                      outline
                      color="primary"
                      size="sm"
                      class="action-btn"
                      @click.stop="navigateWalking(place)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="isLoadingPlaces" class="no-places">
              <q-spinner color="primary" size="60px" />
              <p>Loading places...</p>
            </div>

            <div v-else class="no-places">
              <q-icon name="explore_off" size="80px" color="grey-5" />
              <p>No places found. Try a different search term or change category.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="insights-section">
      <div class="container">
        <div class="section-header text-center">
          <div class="text-overline">INSIGHTS</div>
          <h2 class="section-title">COMMUNITY INSIGHTS AWAIT</h2>
          <p class="section-subtitle">
            Discover what locals love about these Baguio hotspots.
          </p>
        </div>

        <div class="insights-grid">
          <div class="insight-card">
            <div class="card-icon">
              <q-icon name="favorite" size="48px" color="primary" />
            </div>
            <h3 class="card-title">LOCAL FAVORITES</h3>
            <p class="card-description">
              Read firsthand reviews from the "Be Baguio" Facebook group for the best
              experiences.
            </p>
            <div class="card-actions">
              <q-btn label="Explore" outline color="primary" size="sm" @click="exploreFavorites" />
              <q-btn label="View" flat color="primary" size="sm" icon-right="arrow_forward" />
            </div>
          </div>

          <div class="insight-card">
            <div class="card-icon">
              <q-icon name="photo_camera" size="48px" color="primary" />
            </div>
            <h3 class="card-title">SNAP PHOTO OF LOCAL GEMS</h3>
            <p class="card-description">
              Get inspired by community photos from nearby places. Capture your own stories
              of Baguio.
            </p>
            <div class="card-actions">
              <q-btn label="Read" outline color="primary" size="sm" @click="readPhotos" />
            </div>
          </div>

          <div class="insight-card">
            <div class="card-icon">
              <q-icon name="forum" size="48px" color="primary" />
            </div>
            <h3 class="card-title">JOIN THE CONVERSATION</h3>
            <p class="card-description">
              Share your experiences and connect with fellow explorers. Every story adds
              value to the community.
            </p>
            <div class="card-actions">
              <q-btn label="Contribute" outline color="primary" size="sm" @click="contribute" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="faqs-section">
      <div class="container">
        <div class="faqs-wrapper">
          <div class="faqs-header">
            <h2 class="faqs-title">FAQS</h2>
            <p class="faqs-subtitle">
              Explore the guide to unlock the magic of Ayan Mo. Below are the
              answers to guide you with your journey:
            </p>
            <q-btn label="Explore" outline color="white" size="md" class="explore-btn" />
          </div>

          <div class="faqs-list">
            <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
              <div class="faq-header" @click="toggleFaq(index)">
                <h3 class="faq-question">{{ faq.question }}</h3>
                <q-icon
                  :name="faq.isOpen ? 'close' : 'add'"
                  size="24px"
                  color="white"
                  class="faq-icon"
                />
              </div>
              <q-slide-transition>
                <div v-show="faq.isOpen" class="faq-answer">
                  <p>{{ faq.answer }}</p>
                </div>
              </q-slide-transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import FooterSection from '../components/Home/FooterSection.vue'
import heroFallback from '../assets/30.png'

export default defineComponent({
  name: 'AyanMoPage',
  components: {
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const mapContainer = ref(null)
    let map = null
    let userMarker = null
    let radiusCircle = null
    const markers = []
    let selectedMarker = null

    const searchQuery = ref('')
    const showSearchDropdown = ref(false)
    const isLoadingLocation = ref(false)
    const isLoadingPlaces = ref(false)
    const userLocation = ref(null)
    const selectedPlace = ref(null)
    const selectedCategory = ref('all')
    const selectedRadius = ref(500)
    const places = ref([])
    const heroImageUrl = ref(heroFallback)
    const discoveryImageUrl = ref(null)

    const radiusOptions = [
      { label: '500m', value: 500 },
      { label: '1km', value: 1000 },
      { label: '2km', value: 2000 },
    ]

    const categories = [
      { label: 'All', value: 'all' },
      { label: 'Cafes', value: 'cafe', osmTag: 'cafe' },
      { label: 'Restaurants', value: 'restaurant', osmTag: 'restaurant' },
      { label: 'Fast Food', value: 'fastfood', osmTag: 'fast_food' },
      { label: 'Hotels', value: 'accommodation', osmTag: 'hotel' },
      { label: 'Tourist Spots', value: 'tourist', osmTag: 'tourism' },
      { label: 'Shopping', value: 'shopping', osmTag: 'mall' },
    ]

    const faqs = ref([
      {
        question: 'What is "Ayan Mo?"',
        answer: 'Ayan Mo (Tagalog word for "There you go!") is a feature used for wanderers to support nearby attractions and popular trails. It helps you discover hidden gems within your vicinity, making it easier to explore Baguio City.',
        isOpen: false,
      },
      {
        question: 'How do I use it?',
        answer: 'Using Ayan Mo is simple! Click on the "Near Me" button to find nearby places, or use the map view to explore different areas. You can filter by category and navigate to any location using the provided buttons.',
        isOpen: false,
      },
      {
        question: 'Can I give feedback?',
        answer: 'Absolutely! We encourage you to suggest opportunities or suggest improvements to our team. Your feedback is invaluable in refining the "Ayan Mo" feature. Submit your feedback via our contact form or click the suggestions button on any feature you want to improve.',
        isOpen: false,
      },
      {
        question: 'Is it open itinerary?',
        answer: 'Yes, "Ayan Mo" features an emergency-style/open itinerary experience to cover. As travelers may differ in trip approaches and plans, spaces for intervention, "Ayan Mo" helps you flexibly explore at your own pace without rigid planning.',
        isOpen: false,
      },
      {
        question: 'What if I get lost?',
        answer: 'If you feel yourself lost, you still get provides clear step-by-step navigation to guide you precisely to your destination. Simply enter your starting and destination points and we\'ll help you get back on track with our jeepney navigation or walking directions.',
        isOpen: false,
      },
    ])

    const fetchHeroImage = async () => {
      try {
        console.log('[AyanMoPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'ayanmo')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[AyanMoPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[AyanMoPage] No hero image found, using fallback')
        }
      } catch (error) {
        console.error('[AyanMoPage] Error fetching hero image:', error)
      }
    }

    const fetchDiscoveryImage = async () => {
      try {
        console.log('[AyanMoPage] Fetching discovery image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'ayanmo-discovery')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists() && docSnap.data().imageUrl) {
          discoveryImageUrl.value = docSnap.data().imageUrl
          console.log('[AyanMoPage] Discovery image loaded:', discoveryImageUrl.value)
        } else {
          console.log('[AyanMoPage] No discovery image found')
        }
      } catch (error) {
        console.error('[AyanMoPage] Error fetching discovery image:', error)
      }
    }

    watch(searchQuery, (newVal) => {
      if (!newVal) {
        showSearchDropdown.value = false
      }
    })

    const filteredPlaces = computed(() => {
      let result = places.value

      if (searchQuery.value && searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        result = result.filter(
          (place) =>
            place.name.toLowerCase().includes(query) ||
            place.category.toLowerCase().includes(query) ||
            (place.address && place.address.toLowerCase().includes(query))
        )
      }

      if (userLocation.value) {
        result = [...result].sort((a, b) => {
          const distA = calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            a.coords[0],
            a.coords[1]
          )
          const distB = calculateDistance(
            userLocation.value.lat,
            userLocation.value.lng,
            b.coords[0],
            b.coords[1]
          )
          return distA - distB
        })
      }

      return result
    })

    const closeSearchDropdown = () => {
      showSearchDropdown.value = false
    }

    const selectPlaceFromSearch = (place) => {
      selectPlace(place)
      closeSearchDropdown()
      scrollToPlaces()
    }

    const fetchPlacesFromOSM = async (category = 'all') => {
      if (!userLocation.value) {
        loadFallbackPlaces(category)
        return
      }

      isLoadingPlaces.value = true
      
      try {
        const centerLat = userLocation.value.lat
        const centerLng = userLocation.value.lng
        const radiusInMeters = selectedRadius.value

        let overpassQuery = ''
        
        if (category === 'all') {
          overpassQuery = `
            [out:json][timeout:25];
            (
              node(around:${radiusInMeters},${centerLat},${centerLng})["amenity"~"cafe|restaurant|fast_food|bar|pub"]["name"];
              node(around:${radiusInMeters},${centerLat},${centerLng})["tourism"~"hotel|hostel|guest_house|attraction|museum"]["name"];
              node(around:${radiusInMeters},${centerLat},${centerLng})["shop"~"mall|supermarket|department_store"]["name"];
            );
            out body;
          `
        } else {
          const categoryConfig = categories.find(c => c.value === category)
          if (!categoryConfig || !categoryConfig.osmTag) return
          
          if (category === 'tourist') {
            overpassQuery = `
              [out:json][timeout:25];
              (
                node(around:${radiusInMeters},${centerLat},${centerLng})["tourism"]["name"];
              );
              out body;
            `
          } else if (category === 'shopping') {
            overpassQuery = `
              [out:json][timeout:25];
              (
                node(around:${radiusInMeters},${centerLat},${centerLng})["shop"~"mall|supermarket|department_store"]["name"];
              );
              out body;
            `
          } else {
            overpassQuery = `
              [out:json][timeout:25];
              (
                node(around:${radiusInMeters},${centerLat},${centerLng})["amenity"="${categoryConfig.osmTag}"]["name"];
              );
              out body;
            `
          }
        }

        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: overpassQuery,
        })

        if (!response.ok) {
          throw new Error('API request failed')
        }

        const data = await response.json()
        
        const fetchedPlaces = data.elements.map(element => {
          const tags = element.tags || {}
          let placeCategory = 'other'
          
          if (tags.amenity === 'cafe') placeCategory = 'cafe'
          else if (tags.amenity === 'restaurant') placeCategory = 'restaurant'
          else if (tags.amenity === 'fast_food') placeCategory = 'fastfood'
          else if (tags.tourism) placeCategory = 'tourist'
          else if (tags.tourism === 'hotel' || tags.tourism === 'hostel' || tags.tourism === 'guest_house') placeCategory = 'accommodation'
          else if (tags.shop) placeCategory = 'shopping'

          return {
            id: element.id,
            name: tags.name || 'Unnamed Place',
            category: placeCategory,
            address: formatAddress(tags),
            coords: [element.lat, element.lon],
            phone: tags.phone || null,
            website: tags.website || null,
            openingHours: tags.opening_hours || null,
          }
        })

        places.value = fetchedPlaces
        
        setTimeout(() => {
          updateMapMarkers()
          updateRadiusCircle()
        }, 100)
        
        $q.notify({
          message: `Found ${fetchedPlaces.length} places within ${selectedRadius.value}m`,
          color: 'positive',
          icon: 'done',
          timeout: 2000,
        })
        
      } catch (error) {
        console.error('Error fetching places:', error)
        loadFallbackPlaces(category)
        $q.notify({
          message: 'Loaded sample places (API temporarily unavailable)',
          color: 'warning',
          icon: 'warning',
          timeout: 3000,
        })
      } finally {
        isLoadingPlaces.value = false
      }
    }

    const loadFallbackPlaces = (category) => {
      const fallbackData = [
        { name: 'SM City Baguio', category: 'shopping', address: 'Luneta Hill, Baguio City', coords: [16.4089, 120.5972] },
        { name: 'Cafe by the Ruins', category: 'cafe', address: 'Chuntug St, Baguio City', coords: [16.4119, 120.5955] },
        { name: 'Good Taste', category: 'restaurant', address: 'Session Road, Baguio City', coords: [16.4100, 120.5975] },
        { name: 'Burnham Park', category: 'tourist', address: 'Jose Abad Santos Dr, Baguio City', coords: [16.4095, 120.5948] },
        { name: 'The Manor', category: 'accommodation', address: 'Camp John Hay, Baguio City', coords: [16.3992, 120.6101] },
        { name: 'Baguio Cathedral', category: 'tourist', address: 'Cathedral Loop, Baguio City', coords: [16.4128, 120.5985] },
        { name: 'Vizco\'s', category: 'cafe', address: 'Session Road, Baguio City', coords: [16.4108, 120.5970] },
        { name: 'Hill Station', category: 'restaurant', address: 'Casa Vallejo, Baguio City', coords: [16.4113, 120.5971] },
      ]

      if (category === 'all') {
        places.value = fallbackData
      } else {
        places.value = fallbackData.filter(p => p.category === category)
      }

      setTimeout(() => {
        updateMapMarkers()
      }, 100)
    }

    const formatAddress = (tags) => {
      const parts = []
      if (tags['addr:street']) parts.push(tags['addr:street'])
      if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
      if (tags['addr:city']) parts.push(tags['addr:city'])
      
      if (parts.length > 0) return parts.join(', ')
      if (tags.address) return tags.address
      return 'Baguio City'
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    }

    const getCategoryIcon = (category) => {
      const icons = {
        cafe: 'local_cafe',
        restaurant: 'restaurant',
        fastfood: 'fastfood',
        tourist: 'place',
        accommodation: 'hotel',
        shopping: 'shopping_cart',
        other: 'place'
      }
      return icons[category] || 'place'
    }

    const initMap = () => {
      if (!mapContainer.value) return

      const baguioCoords = [16.411, 120.593]
      map = L.map(mapContainer.value).setView(baguioCoords, 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      updateMapMarkers()
    }

    const updateMapMarkers = () => {
      if (!map) return

      markers.forEach((marker) => map.removeLayer(marker))
      markers.length = 0
      selectedMarker = null

      filteredPlaces.value.forEach((place) => {
        const isSelected = selectedPlace.value?.name === place.name
        
        const icon = L.divIcon({
          className: 'place-marker',
          html: `<div class="marker-icon ${place.category} ${isSelected ? 'selected' : ''}">
                   <i class="material-icons">${getCategoryIcon(place.category)}</i>
                 </div>`,
          iconSize: isSelected ? [50, 50] : [40, 40],
        })

        const marker = L.marker(place.coords, { icon })
          .addTo(map)
          .bindPopup(
            `<div class="map-popup">
               <h3>${place.name}</h3>
               <p class="category">${place.category}</p>
               <p class="address">${place.address}</p>
             </div>`
          )

        marker.on('click', () => {
          selectPlace(place)
        })

        markers.push(marker)

        if (isSelected) {
          selectedMarker = marker
        }
      })

      if (markers.length > 0 && !userLocation.value) {
        const group = L.featureGroup(markers)
        map.fitBounds(group.getBounds().pad(0.1))
      }
    }

    const updateRadiusCircle = () => {
      if (!map || !userLocation.value) return

      if (radiusCircle) {
        map.removeLayer(radiusCircle)
      }

      radiusCircle = L.circle([userLocation.value.lat, userLocation.value.lng], {
        radius: selectedRadius.value,
        color: '#4a5f4e',
        fillColor: '#4a5f4e',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(map)
    }

    const updateUserMarker = (lat, lng) => {
      if (map) {
        if (userMarker) {
          map.removeLayer(userMarker)
        }

        const userIcon = L.divIcon({
          className: 'user-location-marker',
          html: `<div class="user-pin">
                   <div class="pulse"></div>
                   <div class="pin-label">You are here</div>
                 </div>`,
          iconSize: [30, 30],
        })

        userMarker = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<strong>Your Current Location</strong><br>Click "Navigate" on any place to get directions')
          .openPopup()
      }
    }

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        $q.notify({
          message: 'Geolocation is not supported by your browser',
          color: 'negative',
          icon: 'error',
        })
        return
      }

      isLoadingLocation.value = true

      navigator.geolocation.getCurrentPosition(
        (position) => {
          isLoadingLocation.value = false
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude

          userLocation.value = { lat: userLat, lng: userLng }
          updateUserMarker(userLat, userLng)
          map.setView([userLat, userLng], 15)
          updateRadiusCircle()
          fetchPlacesFromOSM(selectedCategory.value)

          $q.notify({
            message: `Location found! Showing places within ${selectedRadius.value}m`,
            color: 'positive',
            icon: 'location_on',
          })
        },
        (error) => {
          isLoadingLocation.value = false
          
          let errorMessage = 'Unable to get your location. '
          if (error.code === 1) {
            errorMessage += 'Please enable location access in your browser settings.'
          } else if (error.code === 2) {
            errorMessage += 'Location information is unavailable.'
          } else if (error.code === 3) {
            errorMessage += 'Location request timed out.'
          }
          
          $q.notify({
            message: errorMessage,
            color: 'negative',
            icon: 'error',
            timeout: 5000,
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }

    const changeRadius = (newRadius) => {
      selectedRadius.value = newRadius
      
      if (userLocation.value) {
        updateRadiusCircle()
        fetchPlacesFromOSM(selectedCategory.value)
        
        $q.notify({
          message: `Radius changed to ${newRadius}m`,
          color: 'info',
          icon: 'tune',
        })
      } else {
        $q.notify({
          message: 'Please enable location first',
          color: 'warning',
          icon: 'warning',
        })
      }
    }

    const selectPlace = (place) => {
      selectedPlace.value = place

      if (map) {
        map.setView(place.coords, 16)
        updateMapMarkers()
        if (selectedMarker) {
          selectedMarker.openPopup()
        }
      }

      setTimeout(() => {
        const placeCards = document.querySelectorAll('.place-card')
        const selectedCard = Array.from(placeCards).find(
          (card) => card.querySelector('.place-name').textContent === place.name
        )
        if (selectedCard) {
          selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    }

    const navigateViaJeep = (place) => {
      const query = {
        toName: place.name,
        toLat: place.coords[0],
        toLng: place.coords[1],
        toAddress: place.address,
      }

      if (userLocation.value) {
        query.fromLat = userLocation.value.lat
        query.fromLng = userLocation.value.lng
        query.fromName = 'Current Location'
      }

      $q.notify({
        message: `Redirecting to navigation for ${place.name}...`,
        color: 'primary',
        icon: 'directions_bus',
        timeout: 1500,
      })

      setTimeout(() => {
        router.push({
          path: '/apanam',
          query: query,
        })
      }, 500)
    }

    const navigateWalking = (place) => {
      if (!userLocation.value) {
        $q.notify({
          message: 'Please enable location to get walking directions',
          color: 'warning',
          icon: 'warning',
        })
        getUserLocation()
        return
      }

      const distance = calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        place.coords[0],
        place.coords[1]
      )

      if (distance > 2) {
        $q.dialog({
          title: 'Long Distance',
          message: `${place.name} is ${distance.toFixed(2)} km away. This is quite far to walk. Would you like to take a jeepney instead?`,
          cancel: {
            label: 'Cancel',
            color: 'grey',
            flat: true,
          },
          ok: {
            label: 'Take Jeepney',
            color: 'primary',
          },
          persistent: false,
        }).onOk(() => {
          navigateViaJeep(place)
        })
      } else {
        const query = {
          toName: place.name,
          toLat: place.coords[0],
          toLng: place.coords[1],
          toAddress: place.address,
          fromLat: userLocation.value.lat,
          fromLng: userLocation.value.lng,
          fromName: 'Current Location',
          mode: 'walking',
        }

        $q.notify({
          message: `Getting walking directions to ${place.name} (${distance.toFixed(2)} km)`,
          color: 'positive',
          icon: 'directions_walk',
          timeout: 1500,
        })

        setTimeout(() => {
          router.push({
            path: '/apanam',
            query: query,
          })
        }, 500)
      }
    }

    const filterByCategory = (category) => {
      selectedCategory.value = category
      fetchPlacesFromOSM(category)
    }

    const scrollToPlaces = () => {
      const element = document.querySelector('.places-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      closeSearchDropdown()
    }

    const toggleFaq = (index) => {
      faqs.value[index].isOpen = !faqs.value[index].isOpen
    }

    const exploreFavorites = () => {
      $q.notify({
        message: 'Loading local favorites...',
        color: 'primary',
        icon: 'favorite',
      })
    }

    const readPhotos = () => {
      $q.notify({
        message: 'Opening photo gallery...',
        color: 'primary',
        icon: 'photo_camera',
      })
    }

    const contribute = () => {
      $q.notify({
        message: 'Thank you for wanting to contribute!',
        color: 'primary',
        icon: 'forum',
      })
    }

    onMounted(() => {
      fetchHeroImage()
      fetchDiscoveryImage()
      
      setTimeout(async () => {
        initMap()
        loadFallbackPlaces('all')
      }, 300)

      document.addEventListener('click', (e) => {
        const searchWrapper = document.querySelector('.search-bar-wrapper')
        if (searchWrapper && !searchWrapper.contains(e.target)) {
          showSearchDropdown.value = false
        }
      })
    })

    onBeforeUnmount(() => {
      if (map) {
        map.remove()
        map = null
      }
    })

    return {
      searchQuery,
      showSearchDropdown,
      isLoadingLocation,
      isLoadingPlaces,
      userLocation,
      selectedPlace,
      selectedCategory,
      selectedRadius,
      categories,
      radiusOptions,
      filteredPlaces,
      faqs,
      mapContainer,
      heroImageUrl,
      discoveryImageUrl,
      calculateDistance,
      getCategoryIcon,
      getUserLocation,
      selectPlace,
      selectPlaceFromSearch,
      navigateViaJeep,
      navigateWalking,
      filterByCategory,
      scrollToPlaces,
      toggleFaq,
      exploreFavorites,
      readPhotos,
      contribute,
      changeRadius,
      closeSearchDropdown,
    }
  },
})
</script>

<style lang="scss" scoped>
$primary-green: #4a5f4e;
$dark-green: #3a4f3e;
$light-gray: #f5f5f5;
$cream-bg: #e8ebe3;
$text-dark: #333;
$text-light: #666;
$brown-bg: #5d4e37;

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7), 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(231, 76, 60, 0), 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0), 0 2px 8px rgba(0, 0, 0, 0.3);
    transform: scale(1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.btn-hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.container-fluid {
  width: 100%;
  padding: 0;
}

.hero-section {
  position: relative;
  min-height: 500px;
  background-size: cover;     
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  overflow: visible;

  @media (max-width: 768px) {
    min-height: 400px;
  }

  .hero-overlay {
    position: relative;
    width: 100%;
    padding: 80px 5%;
    z-index: 1;

    @media (max-width: 768px) {
      padding: 60px 5%;
    }
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    color: white;

    .hero-title {
      font-size: 3.5rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 1.5rem 0;
      letter-spacing: 2px;

      @media (max-width: 768px) {
        font-size: 2.2rem;
      }
    }

    .hero-description {
      font-size: 1.15rem;
      line-height: 1.7;
      margin: 0 0 2rem 0;
      opacity: 0.95;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }

    .search-bar-wrapper {
      max-width: 600px;
      margin: 0 auto;
      position: relative;

      .search-input {
        :deep(.q-field__control) {
          border-radius: 50px;
          min-height: 56px;
          background: white;
        }

        :deep(.q-field__native) {
          font-size: 1rem;
          padding-left: 10px;
        }
      }

      .search-dropdown {
        position: absolute;
        top: 65px;
        left: 0;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        max-height: 500px;
        overflow: hidden;
        z-index: 9999;

        &.no-results {
          padding: 40px 20px;
          text-align: center;

          p {
            color: $text-light;
            margin: 15px 0;
          }
        }

        .search-results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #e0e0e0;
          font-size: 0.9rem;
          font-weight: 600;
          color: $text-dark;
        }

        .search-results-list {
          max-height: 400px;
          overflow-y: auto;

          .search-result-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            cursor: pointer;
            transition: background 0.2s ease;
            border-bottom: 1px solid #f0f0f0;

            &:hover {
              background: #f8f8f8;
            }

            &:last-child {
              border-bottom: none;
            }

            .result-icon {
              flex-shrink: 0;
            }

            .result-info {
              flex: 1;

              .result-name {
                font-size: 1rem;
                font-weight: 600;
                color: $text-dark;
                margin-bottom: 4px;
              }

              .result-meta {
                display: flex;
                gap: 10px;
                align-items: center;

                .result-category {
                  font-size: 0.8rem;
                  color: $primary-green;
                  text-transform: uppercase;
                  font-weight: 600;
                }

                .result-distance {
                  font-size: 0.8rem;
                  color: $text-light;
                }
              }
            }
          }
        }

        .search-results-footer {
          padding: 12px 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
        }
      }
    }
  }
}

.discovery-section {
  background: $cream-bg;
  padding: 100px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }

  .discovery-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .discovery-content {
    .discovery-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: $text-dark;
      line-height: 1.2;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .discovery-description {
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      color: $text-light;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 2rem;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.95rem;
        color: $text-dark;

        .q-icon {
          flex-shrink: 0;
        }
      }
    }
  }

  .discovery-image {
    display: flex;
    justify-content: center;
    align-items: center;

    .image-placeholder {
      width: 100%;
      max-width: 500px;
      aspect-ratio: 4/3;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  }
}

.places-section {
  background: white;
  padding: 0;

  .places-wrapper {
    display: grid;
    grid-template-columns: 60fr 40fr;
    min-height: 700px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  .map-column {
    position: relative;
    background: $light-gray;

    .map-container {
      width: 100%;
      height: 100%;
      min-height: 700px;

      @media (max-width: 960px) {
        min-height: 500px;
      }

      :deep(.leaflet-container) {
        width: 100%;
        height: 100%;
      }

      :deep(.place-marker) {
        .marker-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 2px solid $primary-green;
          transition: all 0.3s ease;

          &.selected {
            width: 50px;
            height: 50px;
            border-width: 3px;
            animation: bounce 0.6s ease;
            box-shadow: 0 4px 16px rgba(74, 95, 78, 0.5);

            i {
              font-size: 26px;
            }
          }

          &.cafe {
            border-color: #8b4513;
          }
          &.restaurant {
            border-color: #ff6b35;
          }
          &.fastfood {
            border-color: #e74c3c;
          }
          &.tourist {
            border-color: #4a90e2;
          }
          &.accommodation {
            border-color: #9b59b6;
          }
          &.shopping {
            border-color: #27ae60;
          }

          i {
            font-size: 20px;
            color: $primary-green;
            transition: font-size 0.3s ease;
          }
        }
      }

      :deep(.map-popup) {
        min-width: 200px;

        h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: $text-dark;
        }

        .category {
          font-size: 0.85rem;
          color: $primary-green;
          text-transform: uppercase;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .address {
          font-size: 0.85rem;
          color: $text-light;
          margin: 0 0 0.5rem 0;
        }
      }

      :deep(.user-location-marker) {
        .user-pin {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pulse {
          width: 24px;
          height: 24px;
          background: #e74c3c;
          border: 4px solid white;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7), 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }

        .pin-label {
          position: absolute;
          top: 30px;
          background: #e74c3c;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      }
    }

    .map-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .radius-selector {
        .radius-btn {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      }

      .locate-btn {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }

  .places-column {
    background: $light-gray;
    overflow-y: auto;
    max-height: 700px;

    @media (max-width: 960px) {
      max-height: none;
    }

    .places-header {
      background: white;
      padding: 30px;
      border-bottom: 1px solid #e0e0e0;
      position: sticky;
      top: 0;
      z-index: 10;

      @media (max-width: 768px) {
        padding: 20px;
      }

      .places-title {
        font-size: 1.8rem;
        font-weight: 800;
        margin: 0 0 1.5rem 0;
        color: $text-dark;

        @media (max-width: 768px) {
          font-size: 1.5rem;
        }
      }

      .filter-tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .filter-btn {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 600;
        }
      }
    }

    .places-list {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;

      @media (max-width: 768px) {
        padding: 15px;
      }

      .place-card {
        background: white;
        border-radius: 12px;
        padding: 20px;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 20px;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        &.selected-place {
          border-color: $primary-green;
          box-shadow: 0 4px 12px rgba(74, 95, 78, 0.2);
        }

        .place-image {
          width: 60px;
          height: 60px;
          background: $cream-bg;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .place-info {
          .place-name {
            font-size: 1.1rem;
            font-weight: 700;
            margin: 0 0 0.3rem 0;
            color: $text-dark;
          }

          .place-category {
            font-size: 0.8rem;
            color: $primary-green;
            text-transform: uppercase;
            font-weight: 600;
            margin: 0 0 0.3rem 0;
          }

          .place-address {
            font-size: 0.85rem;
            color: $text-light;
            margin: 0 0 0.8rem 0;
          }

          .place-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 1rem;

            .distance {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 0.85rem;
              color: $text-light;
            }
          }

          .place-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;

            .action-btn {
              font-size: 0.75rem;
              text-transform: uppercase;
            }
          }
        }
      }
    }

    .no-places {
      padding: 80px 20px;
      text-align: center;

      p {
        font-size: 1rem;
        color: $text-light;
        margin-top: 1rem;
      }
    }
  }
}

.insights-section {
  background: $cream-bg;
  padding: 100px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }

  .section-header {
    margin-bottom: 60px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0.5rem 0 1rem 0;
      color: $text-dark;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: $text-light;
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .insight-card {
      background: white;
      border-radius: 12px;
      padding: 40px 30px;
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }

      .card-icon {
        margin-bottom: 1.5rem;
      }

      .card-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: $text-dark;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .card-description {
        font-size: 0.95rem;
        line-height: 1.6;
        color: $text-light;
        margin: 0 0 1.5rem 0;
      }

      .card-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}

.faqs-section {
  background: $brown-bg;
  padding: 100px 0;
  color: white;

  @media (max-width: 768px) {
    padding: 60px 0;
  }

  .faqs-wrapper {
    display: grid;
    grid-template-columns: 35fr 65fr;
    gap: 60px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .faqs-header {
    .faqs-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1rem 0;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .faqs-subtitle {
      font-size: 1rem;
      line-height: 1.7;
      margin: 0 0 2rem 0;
      opacity: 0.9;
    }

    .explore-btn {
      border-width: 2px;
      border-radius: 999px; 
    }
    .explore-btn .q-btn__wrapper::before {
  border: 1px solid #222;      
  border-radius: 999px;
}
  
.explore-btn .q-btn__content {
  font-weight: 500;
  font-size: 14px;
}
  }

  .faqs-list {
    display: flex;
    flex-direction: column;
    gap: 1px;

    .faq-item {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;

      .faq-header {
        padding: 20px 25px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: background 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .faq-question {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          flex: 1;
          padding-right: 20px;
        }

        .faq-icon {
          flex-shrink: 0;
        }
      }

      .faq-answer {
        padding: 0 25px 20px 25px;

        p {
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>