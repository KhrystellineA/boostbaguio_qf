<template>
  <q-page class="maykan-page">
    <!-- HERO SECTION (Section 1) -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">MAYKAN - Places</h1>
          <p class="hero-description">
            Discover Baguio's gems! Uncover curated tourist spots with easy commute guides tailored for your Baguio adventure.
          </p>
        </div>
      </div>
    </section>

    <!-- EXTENDED HERO SECTION (Section 2) -->
    <section class="extended-hero bg-white">
      <div class="container">
        <div class="row items-center">
          <div class="col-md-6 col-12 q-pa-xl">
            <h2 class="text-h4 text-weight-bold text-primary q-mb-lg">Baguio's Hidden Gems</h2>
            <p class="text-body1 q-mb-md">
              Baguio City is filled with breathtaking sights and experiences waiting to be discovered.
              Our curated list of tourist spots ensures you navigate the city effortlessly while enjoying its rich culture.
            </p>
            <p class="text-body1 q-mb-lg">
              From iconic landmarks to hidden gems, MAYKAN provides comprehensive information about
              places to visit in Baguio City with integrated navigation instructions.
            </p>
            <div class="q-gutter-sm">
              <q-chip square color="primary" text-color="white" icon="location_on">Tourist Spots</q-chip>
              <q-chip square color="secondary" text-color="white" icon="restaurant">Cafes & Restaurants</q-chip>
              <q-chip square color="primary" text-color="white" icon="park">Parks & Nature</q-chip>
              <q-chip square color="secondary" text-color="white" icon="museum">Cultural Sites</q-chip>
            </div>
          </div>
          <div class="col-md-6 col-12 q-pa-xl">
            <div class="image-placeholder bg-grey-3 q-pa-xl rounded-borders">
              <q-icon name="location_on" size="64px" color="grey-6"/>
              <div class="text-center q-mt-md">Place Discovery</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PHOTO CAROUSEL SECTION (Section 3) -->
    <section class="carousel-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-lg">
          <h2 class="text-h4 text-weight-bold text-primary">Top 30 Tourist Destinations</h2>
          <p class="text-body2 text-grey-7">Swipe through Baguio's most visited places</p>
        </div>

        <div class="carousel-container">
          <q-carousel
            v-model="slide"
            transition-prev="slide-right"
            transition-next="slide-left"
            swipeable
            animated
            control-color="primary"
            height="450px"
            class="rounded-borders shadow-2"
            arrows
            infinite
            @update:model-value="onSlideChange"
          >
            <q-carousel-slide
              v-for="(place, index) in topTouristPlaces"
              :key="index"
              :name="index"
              class="carousel-slide"
            >
              <div class="slide-content">
                <q-img
                  :src="place.imageUrl || '~assets/place-default.jpg'"
                  class="carousel-image"
                  spinner-color="primary"
                >
                  <template v-slot:loading>
                    <div class="absolute-full flex flex-center bg-grey-3">
                      <q-spinner color="primary" size="50px" />
                    </div>
                  </template>
                </q-img>
                <div class="slide-overlay">
                  <div class="slide-info">
                    <h3 class="slide-title">{{ place.name }}</h3>
                    <p class="slide-area">{{ place.area }}</p>
                    <div class="slide-tags">
                      <q-badge v-for="(tag, idx) in place.tags" :key="idx" color="white" text-color="primary" class="q-mr-xs q-mb-xs">
                        {{ tag }}
                      </q-badge>
                    </div>
                    <div class="slide-actions">
                      <q-btn
                        label="Set as Destination"
                        color="primary"
                        unelevated
                        icon="navigation"
                        @click="navigateToPlace(place)"
                        class="q-mr-sm"
                      />
                      <q-btn
                        label="View Details"
                        color="white"
                        outline
                        @click="selectPlace(place)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-carousel-slide>

            <template v-slot:control>
              <div class="custom-controls">
                <q-carousel-control
                  position="bottom-right"
                  :offset="[10, 10]"
                  class="q-gutter-xs"
                >
                  <q-btn
                    round
                    dense
                    flat
                    color="white"
                    icon="arrow_left"
                    @click="slide = slide > 0 ? slide - 1 : topTouristPlaces.length - 1"
                  />
                  <q-btn
                    round
                    dense
                    flat
                    color="white"
                    icon="arrow_right"
                    @click="slide = slide < topTouristPlaces.length - 1 ? slide + 1 : 0"
                  />
                </q-carousel-control>
              </div>
            </template>
          </q-carousel>
        </div>

        <!-- Carousel Indicators with Thumbnails -->
        <div class="carousel-indicators q-mt-md">
          <div
            v-for="(place, index) in topTouristPlaces"
            :key="index"
            class="indicator-item"
            :class="{ 'active': slide === index }"
            @click="slide = index"
          >
            <q-img :src="place.imageUrl || '~assets/place-default.jpg'" class="indicator-image" />
          </div>
        </div>
      </div>
    </section>

    <!-- "SA BAGUIO" FACEBOOK GROUP BANNER (Section 3) -->
    <section class="community-ribbon bg-secondary text-white">
      <div class="container">
        <div class="row items-center justify-between">
          <div class="col-md-8 col-12 q-pa-md">
            <div class="text-h6 text-weight-bold">Want more organic content?</div>
            <p class="text-body2">
              Visit Sa Baguio Facebook group to see more personal and unique suggestions and experiences!
            </p>
          </div>
          <div class="col-md-4 col-12 q-pa-md text-right">
            <q-btn
              label="Sa Baguio!"
              unelevated
              color="white"
              text-color="dark"
              padding="10px 28px"
              class="btn-hover-lift"
              icon-right="open_in_new"
              @click="openSaBaguioGroup"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- PLACES SECTION (Section 4) -->
    <section id="places" class="places-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Discover Baguio's Places</h2>
          <p class="text-body1">Browse our curated collection of tourist spots, cafes, parks, and more</p>
        </div>

        <div class="category-filter-section q-mb-xl">
          <div class="row justify-center">
            <q-btn-group spread>
              <q-btn
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :unelevated="selectedCategory === category.value"
                :outline="selectedCategory !== category.value"
                :color="selectedCategory === category.value ? 'primary' : 'dark'"
                size="md"
                padding="8px 24px"
                class="category-btn"
                @click="filterByCategory(category.value)"
              />
            </q-btn-group>
          </div>
        </div>

        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner-hourglass color="primary" size="60px" />
          <p class="q-mt-md text-grey-7">Loading places...</p>
        </div>

        <div v-else-if="filteredPlaces.length === 0" class="text-center q-py-xl">
          <q-icon name="place" size="80px" color="grey-5" />
          <h3 class="text-grey-7 q-mt-md">No Places Found</h3>
          <p class="text-grey-6">{{ selectedCategory === 'all' ? 'No places available yet' : 'No places in this category' }}</p>
        </div>

        <div v-else class="places-grid">
          <q-card
            v-for="place in filteredPlaces"
            :key="place.id"
            class="place-card q-ma-sm"
            @click="selectPlace(place)"
          >
            <q-img
              :src="place.imageUrl || '~assets/place-default.jpg'"
              spinner-color="primary"
              class="place-image"
            >
              <template v-slot:loading>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-spinner color="primary" size="30px" />
                </div>
              </template>
              
              <!-- Save Button Overlay -->
              <div class="save-btn-overlay">
                <q-btn
                  round
                  dense
                  flat
                  :icon="isPlaceSaved(place) ? 'bookmark' : 'bookmark_border'"
                  :color="isPlaceSaved(place) ? 'positive' : 'white'"
                  size="md"
                  @click.stop="toggleSavePlace(place)"
                  class="save-place-btn"
                />
              </div>
            </q-img>
            
            <!-- Category Badge -->
            <div class="category-badge">
              <q-badge
                v-for="(cat, idx) in (Array.isArray(place.categories) ? place.categories : [place.category].filter(Boolean))"
                :key="idx"
                color="secondary"
                class="text-capitalize q-mr-xs"
              >
                {{ getCategoryLabel(cat) }}
              </q-badge>
            </div>

            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div>
                  <div class="text-h6 text-primary text-weight-bold">{{ place.name }}</div>
                  <div class="text-subtitle2 text-grey-7">
                    <q-icon name="location_on" size="14px" class="q-mr-xs" />
                    {{ place.area }}
                  </div>
                </div>
              </div>
              
              <!-- Tags -->
              <div class="tags-container q-mb-sm" v-if="place.tags && place.tags.length">
                <q-badge
                  v-for="(tag, idx) in place.tags.slice(0, 3)"
                  :key="idx"
                  color="primary"
                  text-color="white"
                  class="q-mr-xs q-mb-xs tag-badge"
                  outline
                >
                  {{ tag }}
                </q-badge>
                <q-badge
                  v-if="place.tags.length > 3"
                  color="grey-7"
                  text-color="white"
                  class="q-mb-xs tag-badge"
                >
                  +{{ place.tags.length - 3 }}
                </q-badge>
              </div>

              <p class="text-body2 q-mt-md text-grey-8">
                {{ truncateText(place.description, 80) }}
              </p>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn 
                flat 
                color="primary" 
                @click.stop="selectPlace(place)"
                icon="visibility"
              >
                Details
              </q-btn>
              <q-btn 
                flat 
                color="secondary" 
                @click.stop="navigateToPlace(place)"
                icon="navigation"
              >
                Go There
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </section>

    <!-- PLACE DETAILS MODAL (Section 6) -->
    <q-dialog
      v-model="showPlaceDetail"
      full-width
      full-height
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card v-if="selectedPlace" class="place-detail-card">
        <!-- Header with Image -->
        <div class="modal-header">
          <q-img
            :src="selectedPlace.imageUrl || '~assets/place-default.jpg'"
            spinner-color="primary"
            class="modal-image"
          />
          <q-btn
            round
            flat
            dense
            icon="close"
            color="white"
            v-close-popup
            class="close-btn"
          />
        </div>

        <q-card-section class="modal-content">
          <!-- Title Section -->
          <div class="title-section q-mb-lg">
            <div class="row items-start justify-between">
              <div class="col">
                <h2 class="text-h4 text-weight-bold text-primary q-mb-xs">{{ selectedPlace.name }}</h2>
                <div class="text-subtitle1 text-grey-7 q-mb-sm">
                  <q-icon name="location_on" color="primary" size="18px" class="q-mr-xs" />
                  {{ selectedPlace.area }}
                </div>
              </div>
              <div class="row q-gutter-xs items-center">
                <q-badge
                  v-for="(cat, idx) in (Array.isArray(selectedPlace.categories) ? selectedPlace.categories : [selectedPlace.category].filter(Boolean))"
                  :key="idx"
                  color="secondary"
                  class="text-capitalize q-pa-md"
                >
                  {{ getCategoryLabel(cat) }}
                </q-badge>
              </div>
            </div>

            <!-- Tags -->
            <div class="tags-container q-mt-md" v-if="selectedPlace.tags && selectedPlace.tags.length">
              <q-badge
                v-for="(tag, idx) in selectedPlace.tags"
                :key="idx"
                color="primary"
                text-color="white"
                class="q-mr-sm q-mb-sm tag-badge-full"
              >
                {{ tag }}
              </q-badge>
            </div>
          </div>

          <q-separator class="q-mb-lg" />

          <!-- Info Grid -->
          <div class="info-grid q-mb-lg">
            <div class="info-card" v-if="selectedPlace.address">
              <div class="info-icon">
                <q-icon name="location_on" color="primary" size="24px" />
              </div>
              <div class="info-content">
                <div class="info-label text-weight-bold">Address</div>
                <div class="info-value text-body2">{{ selectedPlace.address }}</div>
              </div>
            </div>

            <div class="info-card" v-if="selectedPlace.operatingHours">
              <div class="info-icon">
                <q-icon name="schedule" color="primary" size="24px" />
              </div>
              <div class="info-content">
                <div class="info-label text-weight-bold">Operating Hours</div>
                <div class="info-value text-body2">{{ formatOperatingHours(selectedPlace.operatingHours) }}</div>
              </div>
            </div>

            <div class="info-card" v-if="selectedPlace.entranceFee">
              <div class="info-icon">
                <q-icon name="payments" color="primary" size="24px" />
              </div>
              <div class="info-content">
                <div class="info-label text-weight-bold">Entrance Fee</div>
                <div class="info-value text-body2">{{ selectedPlace.entranceFee }}</div>
              </div>
            </div>

            <div class="info-card" v-if="selectedPlace.phone">
              <div class="info-icon">
                <q-icon name="phone" color="primary" size="24px" />
              </div>
              <div class="info-content">
                <div class="info-label text-weight-bold">Contact</div>
                <div class="info-value text-body2">{{ selectedPlace.phone }}</div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="description-section q-mb-lg">
            <h4 class="text-h6 text-weight-bold text-primary q-mb-md">
              <q-icon name="info" color="primary" class="q-mr-sm" />
              About this Place
            </h4>
            <p class="text-body1 text-grey-8">{{ selectedPlace.description || 'No description available.' }}</p>
          </div>

          <!-- How to Get There -->
          <div class="navigation-section bg-blue-1 q-pa-lg rounded-borders">
            <h4 class="text-h6 text-weight-bold text-primary q-mb-md">
              <q-icon name="directions_bus" color="primary" class="q-mr-sm" />
              How to Get There
            </h4>
            <p class="text-body1 q-mb-md">
              Use our <strong>APANAM</strong> navigation system to get step-by-step jeepney directions to {{ selectedPlace.name }}.
            </p>
            <div class="q-gutter-sm">
              <q-btn
                label="Get Directions"
                color="primary"
                unelevated
                icon="navigation"
                @click="navigateToPlace(selectedPlace)"
              />
              <q-btn
                :label="isPlaceSaved(selectedPlace) ? 'Saved' : 'Save Place'"
                :color="isPlaceSaved(selectedPlace) ? 'positive' : 'white'"
                :outline="!isPlaceSaved(selectedPlace)"
                :icon="isPlaceSaved(selectedPlace) ? 'bookmark' : 'bookmark_border'"
                @click="toggleSavePlace(selectedPlace)"
              />
              <q-btn
                label="Share"
                color="white"
                outline
                icon="share"
                @click="sharePlace"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-md" v-if="selectedPlace.updatedAt">
              <q-icon name="update" size="xs" class="q-mr-xs" />
              Last updated: {{ formatDate(selectedPlace.updatedAt) }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- FAQS SECTION (Section 7) -->
    <section class="faqs-section">
      <div class="container-faqs">
        <div class="faqs-header">
          <h2 class="faqs-title">MAYKAN FAQs</h2>
          <p class="faqs-description">Common questions about discovering places in Baguio</p>
        </div>
        <div class="faqs-grid">
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in leftFaqs"
              :key="index"
              :label="faq.question"
              class="faq-item"
              dark
              expand-icon="add"
              expanded-icon="close"
              header-class="faq-header"
            >
              <q-card dark class="faq-card">
                <q-card-section class="faq-answer">
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
              class="faq-item"
              dark
              expand-icon="add"
              expanded-icon="close"
              header-class="faq-header"
            >
              <q-card dark class="faq-card">
                <q-card-section class="faq-answer">
                  {{ faq.answer }}
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER SECTION (Section 8) -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { useUserStore } from 'stores/user-store'
import FooterSection from '../components/Home/FooterSection.vue'
import { defaultBaguioPlaces } from 'src/composables/useBaguioPlaces'
import fallbackImage from '../assets/456.png'

export default defineComponent({
  name: 'MaykanPage',
  components: {
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const userStore = useUserStore()
    const places = ref([])
    const loading = ref(true)
    const showPlaceDetail = ref(false)
    const selectedPlace = ref(null)
    const selectedCategory = ref('all')
    const heroImageUrl = ref(fallbackImage)
    const savedPlacesIds = ref(new Set())

    // Carousel state
    const slide = ref(0)

    const faqs = [
      {
        question: 'How do I get directions to a place?',
        answer: 'Click on any place and use the "Get Directions" button to navigate to the location using APANAM navigation.'
      },
      {
        question: 'Can I save places for later?',
        answer: 'Yes! Click the bookmark icon on any place card to save it. You can view all your saved places from your account page.'
      },
      {
        question: 'How do I share a place?',
        answer: 'Click on a place to open details, then click the "Share" button to share the place details with others.'
      },
      {
        question: 'What if a place is closed?',
        answer: 'Place information is regularly updated. We recommend checking the operating hours before visiting.'
      }
    ]

    const leftFaqs = computed(() => faqs.slice(0, 2))
    const rightFaqs = computed(() => faqs.slice(2))

    const categories = [
      { label: 'All Places', value: 'all' },
      { label: 'Tourist Spots', value: 'tourist-spot' },
      { label: 'Cafes & Restaurants', value: 'restaurant' },
      { label: 'Parks & Nature', value: 'park-nature' },
      { label: 'Museums & Culture', value: 'museum-culture' },
      { label: 'Shopping', value: 'shopping' },
    ]

    // Get top tourist places for carousel (filter by category or popularity)
    const topTouristPlaces = computed(() => {
      const touristSpots = places.value.filter(p => p.category === 'Tourist Spots')
      return touristSpots.length > 0 ? touristSpots : places.value.slice(0, 10)
    })

    const onSlideChange = (newSlide) => {
      slide.value = newSlide
    }

    const filteredPlaces = computed(() => {
      if (selectedCategory.value === 'all') {
        return places.value
      }
      return places.value.filter(place => {
        // Support both single category (string) and multiple categories (array)
        const placeCategories = Array.isArray(place.categories) ? place.categories : [place.category].filter(Boolean)
        return placeCategories.includes(selectedCategory.value)
      })
    })

    const fetchHeroImage = async () => {
      try {
        console.log('[MaykanPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'maykan')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[MaykanPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[MaykanPage] No hero image found in Firestore, using fallback')
        }
      } catch (error) {
        console.error('[MaykanPage] Error fetching hero image:', error)
      }
    }

    const fetchPlaces = async () => {
      loading.value = true
      try {
        console.log('[MaykanPage] Fetching places from Firebase...')
        const q = query(collection(db, 'places'), orderBy('name', 'asc'))
        const querySnapshot = await getDocs(q)
        const firebasePlaces = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('[MaykanPage] Loaded places from Firebase:', firebasePlaces.length)
        
        // Always use default data (30 tourist spots) - merge with Firebase if needed
        if (firebasePlaces.length > 0 && firebasePlaces.length < 30) {
          console.log('[MaykanPage] Firebase has fewer than 30 places, using default 30 tourist spots')
          places.value = defaultBaguioPlaces
        } else if (firebasePlaces.length >= 30) {
          console.log('[MaykanPage] Using Firebase places')
          places.value = firebasePlaces
        } else {
          console.log('[MaykanPage] No Firebase places, using default data')
          places.value = defaultBaguioPlaces
        }
        
        console.log('[MaykanPage] Total places to display:', places.value.length)
      } catch (error) {
        console.error('[MaykanPage] Error loading places:', error)
        // Fallback to default data on error
        console.log('[MaykanPage] Using default places data')
        places.value = defaultBaguioPlaces
        $q.notify({
          type: 'info',
          message: 'Showing default Baguio places',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }

    const truncateText = (text, maxLength) => {
      if (!text) return 'Discover this amazing place in Baguio City.'
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const openSaBaguioGroup = () => {
      window.open('https://www.facebook.com/groups/sabaguio', '_blank')
    }

    const filterByCategory = (category) => {
      selectedCategory.value = category
    }

    const selectPlace = (place) => {
      selectedPlace.value = place
      showPlaceDetail.value = true
    }

    const navigateToPlace = (place) => {
      // Navigate to APANAM with place as destination
      router.push({
        path: '/apanam',
        query: {
          toName: place.name,
          toLat: place.coords ? place.coords[0] : '',
          toLng: place.coords ? place.coords[1] : '',
        }
      })
      showPlaceDetail.value = false
    }

    const toggleSavePlace = async (place) => {
      if (!userStore.isAuthenticated) {
        $q.notify({
          type: 'info',
          message: 'Please login to save places',
          position: 'top',
          actions: [
            {
              label: 'Login',
              color: 'white',
              handler: () => router.push('/login')
            }
          ]
        })
        return
      }

      const isSaved = savedPlacesIds.value.has(place.id)
      
      try {
        const savedPlaceRef = doc(db, 'savedPlaces', `${userStore.user.uid}_${place.id}`)
        
        if (isSaved) {
          // Unsave place
          await deleteDoc(savedPlaceRef)
          savedPlacesIds.value.delete(place.id)
          $q.notify({
            type: 'info',
            message: 'Place removed from saved',
            position: 'top'
          })
        } else {
          // Save place
          await setDoc(savedPlaceRef, {
            userId: userStore.user.uid,
            placeId: place.id,
            name: place.name,
            area: place.area,
            categories: Array.isArray(place.categories) ? place.categories : [place.category].filter(Boolean),
            tags: place.tags || [],
            description: place.description,
            address: place.address,
            operatingHours: place.operatingHours,
            entranceFee: place.entranceFee,
            phone: place.phone,
            imageUrl: place.imageUrl,
            coords: place.coords,
            savedAt: serverTimestamp()
          })
          savedPlacesIds.value.add(place.id)
          $q.notify({
            type: 'positive',
            message: 'Place saved successfully!',
            position: 'top'
          })
        }
      } catch (error) {
        console.error('[MaykanPage] Error toggling saved place:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to save place',
          position: 'top'
        })
      }
    }

    const loadSavedPlaces = async () => {
      if (!userStore.isAuthenticated) {
        savedPlacesIds.value.clear()
        return
      }

      try {
        const q = query(
          collection(db, 'savedPlaces'),
          orderBy('savedAt', 'desc')
        )
        const querySnapshot = await getDocs(q)
        querySnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.userId === userStore.user.uid) {
            savedPlacesIds.value.add(data.placeId)
          }
        })
        console.log('[MaykanPage] Loaded saved places:', savedPlacesIds.value.size)
      } catch (error) {
        console.error('[MaykanPage] Error loading saved places:', error)
      }
    }

    const isPlaceSaved = (place) => {
      return savedPlacesIds.value.has(place.id)
    }

    const sharePlace = () => {
      if (!selectedPlace.value) return

      // Show share options dialog
      $q.dialog({
        title: 'Share ' + selectedPlace.value.name,
        message: 'Choose how you want to share this place:',
        options: {
          type: 'list',
          options: [
            { label: 'Copy Link', icon: 'content_copy', value: 'copy' },
            { label: 'Facebook', icon: 'facebook', value: 'facebook' },
            { label: 'Twitter', icon: 'rss_feed', value: 'twitter' },
            { label: 'Messenger', icon: 'chat', value: 'messenger' }
          ]
        },
        cancel: true,
        persistent: true
      }).onOk(async (data) => {
        const placeUrl = window.location.href.split('?')[0] + '?place=' + selectedPlace.value.id
        const placeText = 'Check out ' + selectedPlace.value.name + ' in Baguio City! ' + placeUrl

        if (data === 'copy') {
          await navigator.clipboard.writeText(placeUrl)
          $q.notify({
            message: 'Link copied to clipboard!',
            color: 'positive',
            position: 'top',
            icon: 'check'
          })
        } else if (data === 'facebook') {
          window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(placeUrl), '_blank', 'width=600,height=400')
        } else if (data === 'twitter') {
          window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(placeText), '_blank', 'width=600,height=400')
        } else if (data === 'messenger') {
          window.open('fb-messenger://share?link=' + encodeURIComponent(placeUrl), '_blank')
        }
      })
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

    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchPlaces()
      await loadSavedPlaces()
    })

    return {
      places,
      loading,
      showPlaceDetail,
      selectedPlace,
      selectedCategory,
      heroImageUrl,
      faqs,
      leftFaqs,
      rightFaqs,
      categories,
      filteredPlaces,
      topTouristPlaces,
      slide,
      truncateText,
      formatOperatingHours,
      getCategoryLabel,
      formatDate,
      openSaBaguioGroup,
      filterByCategory,
      selectPlace,
      navigateToPlace,
      sharePlace,
      onSlideChange,
      toggleSavePlace,
      isPlaceSaved,
      userStore,
    }
  },
})
</script>

<style scoped lang="scss">
.maykan-page {
  background-color: #F5F5F5 !important;
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

/* Carousel Section Styles */
.carousel-section {
  background: white;
}

.carousel-container {
  max-width: 1000px;
  margin: 0 auto;
}

.carousel-slide {
  position: relative;
  overflow: hidden;
}

.slide-content {
  position: relative;
  height: 100%;
  width: 100%;
}

.carousel-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%);
  padding: 60px 24px 24px;
  display: flex;
  align-items: flex-end;
}

.slide-info {
  color: white;
  width: 100%;
}

.slide-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

.slide-area {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.slide-tags {
  margin-bottom: 1rem;
}

.slide-actions {
  display: flex;
  gap: 8px;
}

.carousel-indicators {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.indicator-item {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.indicator-item:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.indicator-item.active {
  opacity: 1;
  border-color: #2E5D3E;
  transform: scale(1.1);
}

.indicator-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-controls {
  background: transparent;
}

.extended-hero {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.community-ribbon {
  padding: 2rem 0;
}

.places-section {
  background-color: #F5F5F5;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.place-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #2E5D3E;
}

.place-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.place-image {
  height: 200px;
  object-fit: cover;
}

.detail-image {
  height: 400px;
  object-fit: cover;
}

// Color Palette Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$brown: #6B5344;
$white: #FFFFFF;

.faqs-section {
  background: $brown;
  padding: 6rem 0;
  color: $white;
  position: relative;
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
  color: $white;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
}

.faqs-description {
  font-size: 1.05rem;
  color: rgba($white, 0.9);
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem;
  margin-bottom: 4rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-item {
  background: rgba($white, 0.1);
  border: 1px solid rgba($white, 0.2);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba($white, 0.15);
    border-color: rgba($white, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  :deep(.q-item) {
    padding: 1.25rem 1.5rem;
  }

  :deep(.q-item__label) {
    font-size: 0.9rem;
    font-weight: 700;
    color: $white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :deep(.q-icon) {
    color: $light-green;
    font-size: 20px;
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-icon) {
    transform: scale(1.1);
  }
}

.faq-card {
  background: transparent;
  box-shadow: none;
}

.faq-answer {
  padding: 0 1.5rem 1.5rem;
  font-size: 0.95rem;
  color: rgba($white, 0.85);
  line-height: 1.7;
}

.bg-primary {
  background-color: #2E5D3E !important;
}

.text-primary {
  color: #2E5D3E !important;
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

/* Place Card Styles */
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.place-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #2E5D3E;
  border-radius: 12px;
  overflow: hidden;
}

.place-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.place-image {
  height: 220px;
  object-fit: cover;
  position: relative;
}

.save-btn-overlay {
  position: absolute;
  top: 12px;
  right: 50px;
  z-index: 10;
}

.save-place-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
}

.category-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
}

.tag-badge {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 16px;
}

.tag-badge-full {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

/* Modal Styles */
.place-detail-card {
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.modal-header {
  position: relative;
  height: 350px;
}

.modal-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.modal-content {
  max-width: 1000px;
  margin: 0 auto;
  overflow-y: auto;
  max-height: calc(100vh - 350px);
}

.title-section {
  padding: 24px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #F5F5F5;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: #E8F5E9;
  transform: translateY(-2px);
}

.info-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}

.info-value {
  color: #333;
  line-height: 1.5;
}

.description-section {
  padding: 16px 0;
}

.navigation-section {
  border-radius: 12px;
  border-left: 4px solid #2E5D3E;
}

.bg-blue-1 {
  background-color: #E3F2FD !important;
}

.rounded-borders {
  border-radius: 8px !important;
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
    gap: 1rem;
    padding: 0 1rem;
  }

  .place-card {
    min-height: 280px;
  }

  .place-image {
    height: 180px;
  }

  /* Touch-friendly buttons */
  .q-btn {
    min-height: 44px !important;
    min-width: 44px !important;
  }

  .carousel-section {
    padding: 1rem 0;
  }

  .carousel-image {
    height: 300px;
  }

  .slide-title {
    font-size: 1.25rem;
  }

  .slide-actions {
    flex-direction: column;
    gap: 8px;
  }

  .slide-actions .q-btn {
    width: 100%;
    min-height: 48px !important;
  }

  .carousel-indicators {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .indicator-item {
    min-width: 60px;
  }

  .modal-header {
    height: 250px;
  }

  .modal-content {
    max-height: calc(100vh - 250px);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .row {
    flex-direction: column;
  }

  .col-md-6, .col-md-8, .col-md-4 {
    width: 100%;
  }

  /* Category buttons - scrollable on mobile */
  .category-btn {
    min-width: 120px;
  }
}
</style>