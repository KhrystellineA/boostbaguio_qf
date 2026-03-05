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
    <q-dialog v-model="showPlaceDetail" transition-show="fade" transition-hide="fade">
      <q-card class="place-detail-card" style="width: 90%; max-width: 900px;">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ selectedPlace?.name }}</div>
              <div class="text-subtitle2">
                <q-icon name="location_on" size="16px" class="q-mr-xs" />
                {{ selectedPlace?.area }}
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none" v-if="selectedPlace">
          <q-scroll-area style="height: 65vh">
            <q-img
              :src="selectedPlace.imageUrl || '~assets/place-default.jpg'"
              spinner-color="primary"
              class="modal-image"
            />

            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-8">
                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">About this Place</h4>
                  <p class="text-body1 q-mb-lg">{{ selectedPlace.description || 'No description available.' }}</p>

                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Place Details</h4>
                  <q-list bordered separator>
                    <q-item v-if="selectedPlace.address">
                      <q-item-section avatar>
                        <q-icon name="location_on" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Address</q-item-label>
                        <q-item-label caption>{{ selectedPlace.address }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="selectedPlace.operatingHours">
                      <q-item-section avatar>
                        <q-icon name="schedule" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Operating Hours</q-item-label>
                        <q-item-label caption>{{ formatOperatingHours(selectedPlace.operatingHours) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="selectedPlace.phone">
                      <q-item-section avatar>
                        <q-icon name="phone" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Contact</q-item-label>
                        <q-item-label caption>{{ selectedPlace.phone }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="col-12 col-md-4">
                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Actions</h4>
                  
                  <q-card flat bordered class="q-mb-lg">
                    <q-card-section>
                      <p class="text-body2 q-mb-md">
                        Use our APANAM navigation to get directions to {{ selectedPlace.name }}.
                      </p>
                      <q-btn
                        label="Get Directions"
                        color="primary"
                        unelevated
                        icon="navigation"
                        class="full-width"
                        @click="navigateToPlace(selectedPlace)"
                      />
                      <q-btn
                        :label="isPlaceSaved(selectedPlace) ? 'Saved' : 'Save Place'"
                        :color="isPlaceSaved(selectedPlace) ? 'positive' : 'secondary'"
                        :icon="isPlaceSaved(selectedPlace) ? 'bookmark' : 'bookmark_border'"
                        class="full-width q-mt-md"
                        unelevated
                        @click="toggleSavePlace(selectedPlace)"
                      />
                      <q-btn
                        label="Share"
                        color="secondary"
                        unelevated
                        icon="share"
                        class="full-width q-mt-md"
                        @click="sharePlace"
                      />
                      <q-btn
                        label="Report Issue"
                        color="negative"
                        unelevated
                        icon="report_problem"
                        class="full-width q-mt-md"
                        @click="reportIssue(selectedPlace)"
                      />
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Report Issue Dialog -->
    <q-dialog v-model="showReportDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">Report Issue</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-body2 text-grey-7 q-mb-md">
            Reporting: <strong>{{ placeToReport?.name }}</strong>
          </div>
          <q-input
            v-model="reportIssueText"
            outlined
            type="textarea"
            label="Describe the issue *"
            placeholder="Please describe what's wrong with this place (e.g., incorrect information, closed permanently, inappropriate content, etc.)"
            autogrow
            :rows="4"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn
            label="Submit Report"
            color="negative"
            unelevated
            @click="submitReport"
            :disable="!reportIssueText.trim()"
          />
        </q-card-actions>
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
    const showReportDialog = ref(false)
    const placeToReport = ref(null)
    const reportIssueText = ref('')

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

    const reportIssue = (place) => {
      placeToReport.value = place
      reportIssueText.value = ''
      showReportDialog.value = true
    }

    const submitReport = () => {
      if (!reportIssueText.value.trim()) {
        $q.notify({
          type: 'warning',
          message: 'Please describe the issue',
          position: 'top'
        })
        return
      }

      // Here you would typically save the report to Firebase
      console.log('[MaykanPage] Report submitted:', {
        placeId: placeToReport.value?.id,
        placeName: placeToReport.value?.name,
        issue: reportIssueText.value,
        timestamp: new Date()
      })

      showReportDialog.value = false
      $q.notify({
        type: 'positive',
        message: 'Thank you! Your report has been submitted.',
        position: 'top',
        timeout: 3000
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
      reportIssue,
      submitReport,
      showReportDialog,
      placeToReport,
      reportIssueText
    }
  },
})
</script>

<style scoped lang="scss">
// Color Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$soft-green: #E8F5E9;
$mint-cream: #F1F8F4;
$blush-pink: #FCE4EC;
$white: #FFFFFF;
$brown: #6B5344;
$glass-bg: rgba(255, 255, 255, 0.85);
$glass-border: rgba(255, 255, 255, 0.3);
$bento-radius: 20px;

.maykan-page {
  background: linear-gradient(180deg, $mint-cream 0%, $white 100%) !important;
  min-height: 100vh;
}

.hero-section {
  height: 40vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 $bento-radius $bento-radius;
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
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-description {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.95;
  line-height: 1.6;
}

/* Carousel Section Styles */
.carousel-section {
  background: $glass-bg;
  backdrop-filter: blur(20px);
  padding: 3rem 0;
}

.carousel-container {
  max-width: 1100px;
  margin: 0 auto;
}

.carousel-slide {
  position: relative;
  overflow: hidden;
  border-radius: $bento-radius;
}

.slide-content {
  position: relative;
  height: 100%;
  width: 100%;
  border-radius: $bento-radius;
  overflow: hidden;
}

.carousel-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
  border-radius: $bento-radius;
}

.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba($dark-green, 0.95) 0%, rgba($dark-green, 0.7) 50%, transparent 100%);
  padding: 80px 24px 24px;
  display: flex;
  align-items: flex-end;
  border-radius: 0 0 $bento-radius $bento-radius;
}

.slide-info {
  color: white;
  width: 100%;
}

.slide-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.slide-area {
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.slide-tags {
  margin-bottom: 1rem;
}

.slide-actions {
  display: flex;
  gap: 10px;
  
  :deep(.q-btn) {
    border-radius: 12px;
    font-weight: 600;
  }
}

.carousel-indicators {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 12px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.indicator-item {
  width: 80px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    opacity: 0.85;
    transform: scale(1.08);
    box-shadow: 0 4px 16px rgba($primary-green, 0.2);
  }
}

.indicator-item.active {
  opacity: 1;
  border-color: $primary-green;
  transform: scale(1.12);
  box-shadow: 0 4px 16px rgba($primary-green, 0.3);
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
  padding: 4rem 0;
  background: $glass-bg;
  backdrop-filter: blur(20px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.community-ribbon {
  padding: 2.5rem 0;
  background: linear-gradient(135deg, $brown 0%, darken($brown, 8%) 100%);
  border-radius: $bento-radius;
  margin: 2rem auto;
  max-width: 1100px;
  box-shadow: 0 8px 24px rgba($brown, 0.2);
}

.places-section {
  padding: 4rem 0;
  background: transparent;
}

// Bento Grid for Places
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 10px;
}

.place-card {
  background: $glass-bg;
  backdrop-filter: blur(20px);
  border-radius: $bento-radius;
  border: 1px solid $glass-border;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba($primary-green, 0.15);
    border-color: rgba($primary-green, 0.3);
  }
  
  :deep(.q-img) {
    height: 220px;
    position: relative;
  }
  
  :deep(.q-card__section) {
    padding: 20px;
  }
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.15);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.category-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  
  :deep(.q-badge) {
    border-radius: 12px;
    padding: 6px 12px;
    font-weight: 600;
    backdrop-filter: blur(8px);
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-badge {
  font-size: 0.72rem;
  padding: 4px 10px;
  border-radius: 16px;
  font-weight: 500;
}

/* Modal Styles */
.place-detail-card {
  border-radius: $bento-radius;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border: 1px solid $glass-border;
}

.modal-image {
  height: 300px;
  width: 100%;
  object-fit: cover;
}

// FAQ Section with Glassmorphism
$faqs-bg: $brown;

.faqs-section {
  background: linear-gradient(135deg, $faqs-bg 0%, darken($faqs-bg, 10%) 100%);
  padding: 5rem 0;
  color: $white;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }
}

.container-faqs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  position: relative;
  z-index: 1;
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
  text-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
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
  gap: 24px;
  margin-bottom: 4rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-item {
  background: rgba($white, 0.1);
  border: 1px solid rgba($white, 0.2);
  border-radius: $bento-radius;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;

  &:hover {
    background: rgba($white, 0.15);
    border-color: rgba($white, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  :deep(.q-item) {
    padding: 18px 24px;
    min-height: 70px;
  }

  :deep(.q-item__label) {
    font-size: 0.95rem;
    font-weight: 700;
    color: $white;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.4;
  }

  :deep(.q-icon) {
    color: $light-green;
    font-size: 22px;
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-icon) {
    transform: scale(1.15) rotate(90deg);
  }
  
  :deep(.q-expansion-item__content) {
    padding: 0;
  }
}

.faq-card {
  background: transparent;
  box-shadow: none;
}

.faq-answer {
  padding: 0 24px 24px;
  font-size: 0.95rem;
  color: rgba($white, 0.9);
  line-height: 1.8;
}

.bg-primary {
  background: linear-gradient(135deg, $primary-green 0%, $dark-green 100%) !important;
}

.text-primary {
  color: $primary-green !important;
}

.bg-secondary {
  background-color: $brown !important;
}

.text-secondary {
  color: $brown !important;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

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

.image-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: linear-gradient(135deg, $soft-green 0%, $mint-cream 100%);
  border-radius: $bento-radius;
  border: 1px solid $glass-border;
}

.category-btn {
  border-radius: 25px !important;
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  padding: 10px 20px !important;
  
  &:not(.q-btn--unelevated) {
    border: 2px solid $primary-green;
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
    gap: 16px;
    padding: 0 12px;
  }

  .place-card {
    min-height: auto;
  }

  .place-image {
    height: 200px;
  }

  /* Touch-friendly buttons */
  :deep(.q-btn) {
    min-height: 44px !important;
    min-width: 44px !important;
  }

  .carousel-section {
    padding: 2rem 0;
  }

  .carousel-image {
    height: 320px;
  }

  .slide-title {
    font-size: 1.35rem;
  }

  .slide-actions {
    flex-direction: column;
    gap: 10px;
    
    :deep(.q-btn) {
      width: 100%;
      min-height: 48px !important;
    }
  }

  .carousel-indicators {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .indicator-item {
    min-width: 70px;
  }

  .modal-header {
    height: 250px;
  }

  .modal-content {
    height: calc(100vh - 320px);
  }

  .modal-image {
    height: 240px;
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
    min-width: 130px;
  }
  
  .faqs-grid {
    grid-template-columns: 1fr;
  }
  
  .container-faqs {
    padding: 0 20px;
  }
}
</style>