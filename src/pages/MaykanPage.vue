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
            <div class="hero-category-pills">
              <q-chip class="category-pill" color="primary" text-color="white" icon="location_on">Tourist Spots</q-chip>
              <q-chip class="category-pill" color="orange" text-color="white" icon="restaurant">Cafes & Restaurants</q-chip>
              <q-chip class="category-pill" color="green-8" text-color="white" icon="park">Parks & Nature</q-chip>
              <q-chip class="category-pill" color="purple" text-color="white" icon="museum">Museums & Culture</q-chip>
              <q-chip class="category-pill" color="blue-8" text-color="white" icon="shopping_bag">Shopping</q-chip>
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
          <h2 class="carousel-title text-primary">Top 30 Tourist Destinations</h2>
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
                  :src="getPlaceImage(place)"
                  class="carousel-image"
                  :ratio="16/9"
                />
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
            <q-img :src="getPlaceImage(place)" class="indicator-image" />
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
          <h2 class="section-title text-primary">Discover Baguio's Places</h2>
          <p class="text-body1">Browse our curated collection of tourist spots, cafes, parks, and more</p>
        </div>

        <div class="category-filter-section q-mb-xl">
          <div class="row justify-center no-wrap scrollable-categories">
            <q-btn
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :unelevated="selectedCategory === category.value"
              :outline="selectedCategory !== category.value"
              :color="selectedCategory === category.value ? category.color : 'grey-7'"
              :text-color="selectedCategory === category.value ? 'white' : 'grey-7'"
              size="md"
              padding="12px 28px"
              class="category-btn pill-btn"
              @click="filterByCategory(category.value)"
            />
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
              :src="getPlaceImage(place)"
              class="place-image"
              :ratio="16/9"
            >

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
                :color="getCategoryColor(cat)"
                :data-category="cat"
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
      transition-show="scale"
      transition-hide="scale"
      class="place-detail-dialog"
    >
      <q-card v-if="selectedPlace" class="place-detail-card">
        <!-- Header with Image -->
        <div class="modal-header">
          <q-img
            :src="getPlaceImage(selectedPlace)"
            class="modal-image"
            :ratio="16/9"
          />
          <q-btn
            round
            flat
            icon="close"
            color="white"
            v-close-popup
            class="close-btn"
            size="md"
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
                :color="isPlaceSaved(selectedPlace) ? 'positive' : 'dark'"
                :outline="!isPlaceSaved(selectedPlace)"
                :text-color="isPlaceSaved(selectedPlace) ? 'white' : 'dark'"
                :icon="isPlaceSaved(selectedPlace) ? 'bookmark' : 'bookmark_border'"
                @click="toggleSavePlace(selectedPlace)"
              />
              <q-btn
                label="Share"
                color="dark"
                outline
                text-color="dark"
                icon="share"
                @click="sharePlace"
              />
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

// Get image URL for a place (tries main image, then fallback)
const getPlaceImage = (place) => {
  return place.imageUrl || place.fallbackImage || fallbackImage
}

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
      { label: 'All Places', value: 'all', color: 'dark' },
      { label: 'Tourist Spots', value: 'Tourist Spots', color: 'primary' },
      { label: 'Cafes & Restaurants', value: 'Cafes & Restaurants', color: 'orange' },
      { label: 'Parks & Nature', value: 'Parks & Nature', color: 'green-8' },
      { label: 'Museums & Culture', value: 'Museums & Culture', color: 'purple' },
      { label: 'Shopping', value: 'Shopping', color: 'blue-8' },
    ]

    // Get top tourist places for carousel (returns all places)
    const topTouristPlaces = computed(() => {
      return places.value
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
        console.log('[MaykanPage] ALWAYS using default data with guaranteed images')
        // ALWAYS use default data with proper images - never use Firebase places
        places.value = defaultBaguioPlaces
        console.log('[MaykanPage] Total places to display:', places.value.length)
      } catch (error) {
        console.error('[MaykanPage] Error loading places:', error)
        // Fallback to default data on error
        console.log('[MaykanPage] Using default places data')
        places.value = defaultBaguioPlaces
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

      if (navigator.share) {
        navigator.share({
          title: selectedPlace.value.name,
          text: `Check out this place in Baguio: ${selectedPlace.value.name}`,
          url: window.location.href
        }).catch(console.error)
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href)
        $q.notify({
          message: 'Place link copied to clipboard!',
          color: 'positive',
          position: 'top'
        })
      }
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
        'Tourist Spots': 'Tourist Spots',
        'Cafes & Restaurants': 'Cafes & Restaurants',
        'Parks & Nature': 'Parks & Nature',
        'Museums & Culture': 'Museums & Culture',
        'Shopping': 'Shopping',
        'Hotels & Lodging': 'Hotels & Lodging',
        'Government': 'Government',
        'Hospital': 'Hospital',
        'School': 'School',
        'Other': 'Other'
      }
      return labels[category] || category
    }

    const getCategoryColor = (category) => {
      const colors = {
        'Tourist Spots': 'primary',
        'Cafes & Restaurants': 'orange',
        'Parks & Nature': 'green-8',
        'Museums & Culture': 'purple',
        'Shopping': 'blue-8'
      }
      return colors[category] || 'grey-7'
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
      getPlaceImage,
      truncateText,
      formatOperatingHours,
      getCategoryLabel,
      getCategoryColor,
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;600;700&display=swap');

/* ===================== BASE PAGE ===================== */
.maykan-page {
  background-color: #FAFAFA !important;
}

/* All h2 titles use Bebas Neue */
.maykan-page h2 {
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.1;
}

/* ===================== HERO SECTION ===================== */
.hero-section {
  height: 60vh;
  min-height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  max-width: 900px;
  padding: 3rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 400;
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  margin-bottom: 1.25rem;
  color: #FFFFFF;
  text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.1em;
  line-height: 1.1;
}

.hero-description {
  font-size: 1.35rem;
  margin: 0;
  line-height: 1.7;
  color: #F0F0F0;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
}

/* ===================== EXTENDED HERO ===================== */
.extended-hero {
  padding: 5rem 0;
}

.hero-category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 1.5rem;
}

.hero-category-pills .category-pill {
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.08em;
  padding: 10px 20px;
  border-radius: 50px;
  height: auto;
  min-height: 40px;
  transition: all 0.3s ease;
}

.hero-category-pills .category-pill:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.hero-category-pills .category-pill .q-icon {
  font-size: 1.1rem;
}

/* ===================== CAROUSEL SECTION ===================== */
.carousel-section {
  background: #FFFFFF;
  padding: 4rem 0;
}

.carousel-title {
  font-size: 2.5rem;
  font-weight: 400;
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  letter-spacing: 0.08em;
  line-height: 1.1;
  margin-bottom: 0.75rem;
}

.carousel-container {
  max-width: 1100px;
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.75) 50%, transparent 100%);
  padding: 100px 28px 28px;
  display: flex;
  align-items: flex-end;
}

.slide-info {
  color: #FFFFFF;
  width: 100%;
}

.slide-title {
  font-size: 2rem;
  font-weight: 400;
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  margin-bottom: 0.5rem;
  color: #FFFFFF;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.08em;
  line-height: 1.15;
}

.slide-area {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: 0.875rem;
  display: flex;
  align-items: center;
  color: #F5F5F5;
}

.slide-tags {
  margin-bottom: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slide-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Carousel Indicators */
.carousel-indicators {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 16px 0;
  justify-content: center;
  flex-wrap: wrap;
  scrollbar-width: thin;
  scrollbar-color: #2E5D3E #E8E8E8;
}

.carousel-indicators::-webkit-scrollbar {
  height: 8px;
}

.carousel-indicators::-webkit-scrollbar-track {
  background: #E8E8E8;
  border-radius: 4px;
}

.carousel-indicators::-webkit-scrollbar-thumb {
  background: #2E5D3E;
  border-radius: 4px;
}

.indicator-item {
  width: 100px;
  height: 75px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.65;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  flex-shrink: 0;
}

.indicator-item:hover {
  opacity: 0.9;
  transform: scale(1.08);
}

.indicator-item.active {
  opacity: 1;
  border-color: #2E5D3E;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(46, 93, 62, 0.4);
}

.indicator-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-controls {
  background: transparent;
}

/* ===================== CONTAINER ===================== */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ===================== COMMUNITY RIBBON ===================== */
.community-ribbon {
  padding: 3rem 0;
  background: linear-gradient(135deg, #8D6E63 0%, #6D4C41 100%);
}

/* ===================== PLACES SECTION ===================== */
.places-section {
  background-color: #FAFAFA;
  padding: 4rem 0;
}

.section-title {
  font-size: 3rem;
  font-weight: 400;
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  letter-spacing: 0.08em;
  line-height: 1.1;
  margin-bottom: 1rem;
}

/* ===================== PLACES GRID ===================== */
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
  margin-top: 2.5rem;
}

.place-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 5px solid #2E5D3E;
  border-radius: 14px;
  overflow: hidden;
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.place-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.place-image {
  height: 240px;
  object-fit: cover;
  position: relative;
}

.save-btn-overlay {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
}

.save-place-btn {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.save-place-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.18);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.category-badge {
  position: absolute;
  bottom: 14px;
  left: 14px;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 18px;
}

.tag-badge-full {
  padding: 8px 14px;
  border-radius: 22px;
  font-size: 0.85rem;
}

/* ===================== MODAL ===================== */
.place-detail-dialog .q-dialog__inner {
  padding: 2rem;
}

.place-detail-card {
  border-radius: 24px;
  overflow: hidden;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.modal-header {
  position: relative;
  height: 280px;
}

.modal-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.75);
  transform: scale(1.1);
}

.modal-content {
  max-width: 100%;
  padding: 1.75rem;
  overflow-y: auto;
  max-height: calc(90vh - 280px);
}

.title-section {
  padding: 0;
  margin-bottom: 1.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 1.75rem;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #F8F9FA;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.info-card:hover {
  background: #E8F5E9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  color: #333;
  line-height: 1.5;
  font-size: 0.9rem;
}

.description-section {
  padding: 0;
  margin-bottom: 1.75rem;
}

.navigation-section {
  border-radius: 12px;
  border-left: 4px solid #2E5D3E;
  padding: 18px;
  background: linear-gradient(135deg, #F0F9F4 0%, #E8F5E9 100%);
}

.bg-blue-1 {
  background-color: #E3F2FD !important;
}

.rounded-borders {
  border-radius: 10px !important;
}

/* ===================== CATEGORY FILTER ===================== */
.category-filter-section {
  margin-top: 1.5rem;
}

.scrollable-categories {
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: #2E5D3E #E8E8E8;
}

.scrollable-categories::-webkit-scrollbar {
  height: 6px;
}

.scrollable-categories::-webkit-scrollbar-track {
  background: #E8E8E8;
  border-radius: 3px;
}

.scrollable-categories::-webkit-scrollbar-thumb {
  background: #2E5D3E;
  border-radius: 3px;
}

.category-btn {
  min-width: auto;
  flex-shrink: 0;
  margin: 0 6px;
  transition: all 0.3s ease;
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  border-radius: 50px !important;
}

.pill-btn {
  border-radius: 50px !important;
  padding: 12px 28px !important;
  min-height: 44px;
}

.category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* ===================== FAQs SECTION ===================== */
.faqs-section {
  background: linear-gradient(135deg, #6B5344 0%, #4A3830 100%);
  padding: 5rem 0;
  color: white;
}

.container-faqs {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.faqs-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.faqs-title {
  font-size: 2.75rem;
  font-weight: 400;
  font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  color: #FFFFFF;
  margin-bottom: 1.25rem;
  letter-spacing: 0.1em;
  line-height: 1.1;
}

.faqs-description {
  font-size: 1.15rem;
  color: #F0F0F0;
  line-height: 1.7;
  max-width: 650px;
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
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 14px;
  transition: all 0.3s;
}

.faq-item:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* ===================== RESPONSIVE: TABLET ===================== */
@media (max-width: 1024px) {
  .hero-section {
    height: 50vh;
  }

  .hero-title {
    font-size: 2.75rem;
  }

  .hero-description {
    font-size: 1.2rem;
  }

  .places-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.75rem;
  }
}

/* ===================== RESPONSIVE: MOBILE ===================== */
@media (max-width: 768px) {
  .hero-section {
    height: 45vh;
    min-height: 300px;
  }

  .hero-content {
    padding: 2rem;
  }

  .hero-title {
    font-size: 2.25rem;
  }

  .hero-description {
    font-size: 1.05rem;
  }

  .extended-hero {
    padding: 3rem 0;
  }

  .carousel-section {
    padding: 2.5rem 0;
  }

  .carousel-image {
    min-height: 380px;
  }

  .slide-title {
    font-size: 1.65rem;
    font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
    letter-spacing: 0.06em;
  }

  .slide-area {
    font-size: 0.95rem;
  }

  .slide-actions {
    flex-direction: column;
    gap: 10px;
  }

  .slide-actions .q-btn {
    width: 100%;
    min-height: 50px !important;
  }

  .carousel-indicators {
    justify-content: flex-start;
    overflow-x: auto;
    padding: 12px 0;
  }

  .indicator-item {
    min-width: 80px;
    width: 80px;
    height: 60px;
  }

  .places-section {
    padding: 2.5rem 0;
  }

  .section-title {
    font-size: 2.25rem;
  }

  .carousel-title {
    font-size: 2rem;
  }

  .places-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0;
  }

  .place-card {
    min-height: 300px;
  }

  .place-image {
    height: 220px;
  }

  .category-filter-section {
    overflow-x: auto;
    padding: 0.75rem 0;
  }

  .category-btn {
    min-width: 140px;
    white-space: nowrap;
  }

  .modal-header {
    height: 220px;
  }

  .modal-content {
    padding: 1.25rem;
    max-height: calc(85vh - 220px);
  }

  .place-detail-dialog .q-dialog__inner {
    padding: 1rem;
  }

  .place-detail-card {
    max-width: 95vw;
    max-height: 85vh;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .faqs-section {
    padding: 3.5rem 0;
  }

  .faqs-title {
    font-size: 1.85rem;
    font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  }

  .faqs-description {
    font-size: 1.05rem;
  }

  .faqs-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .row {
    flex-direction: column;
  }

  .col-md-6, .col-md-8, .col-md-4 {
    width: 100%;
    padding: 1.25rem !important;
  }

  /* Touch-friendly buttons */
  .q-btn {
    min-height: 48px !important;
    min-width: 48px !important;
  }
}

/* ===================== RESPONSIVE: SMALL MOBILE ===================== */
@media (max-width: 480px) {
  .hero-section {
    height: 40vh;
    min-height: 260px;
  }

  .hero-title {
    font-size: 1.85rem;
    font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
    letter-spacing: 0.08em;
    line-height: 1.1;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .extended-hero {
    padding: 2.25rem 0;
  }

  .carousel-section {
    padding: 2rem 0;
  }

  .carousel-title {
    font-size: 1.75rem;
  }

  .carousel-image {
    min-height: 320px;
  }

  .slide-title {
    font-size: 1.4rem;
    font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  }

  .places-grid {
    gap: 1.25rem;
  }

  .place-image {
    height: 200px;
  }

  .modal-header {
    height: 240px;
  }

  .modal-content {
    padding: 1.25rem;
    max-height: calc(100vh - 240px);
  }

  .faqs-title {
    font-size: 1.5rem;
    font-family: 'Bebas Neue', 'Oswald', 'Anton', sans-serif;
  }

  .container {
    padding: 0 16px;
  }

  .container-faqs {
    padding: 0 16px;
  }
}
</style>