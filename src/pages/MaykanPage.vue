<template>
  <q-page class="maykan-page">
    <!-- HERO SECTION -->
    <section class="maykan-hero">
      <div class="hero-card" :style="{ backgroundImage: `url(${heroImageUrl})` }">
        <div class="hero-overlay-grad" />
        <div class="hero-inner animate-fade-in">
          <span class="hero-tag">
            <q-icon name="location_on" size="14px" />
            Baguio Places &amp; Spots
          </span>
          <h1 class="hero-title">
            <em>Maykan</em>
          </h1>
          <p class="hero-description">
            Discover Baguio's gems — from iconic landmarks to hidden spots. Curated tourist
            destinations, cafes, restaurants, parks, and cultural sites with integrated navigation.
          </p>
          <div class="hero-chips">
            <span class="hero-chip"><q-icon name="location_on" size="14px" /> Tourist Spots</span>
            <span class="hero-chip"
              ><q-icon name="restaurant" size="14px" /> Cafes &amp; Restaurants</span
            >
            <span class="hero-chip"><q-icon name="park" size="14px" /> Parks &amp; Nature</span>
            <span class="hero-chip"><q-icon name="museum" size="14px" /> Cultural Sites</span>
          </div>
        </div>
      </div>
    </section>

    <!-- PHOTO CAROUSEL SECTION (Section 3) -->
    <section class="carousel-section">
      <div class="container">
        <div class="section-eyebrow text-center">
          <p class="eyebrow-text">TOP DESTINATIONS</p>
          <h2 class="eyebrow-title">Baguio's most <em>visited</em> places</h2>
          <p class="eyebrow-description">Swipe through the city's must-see spots.</p>
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
                  :src="place.imageUrl || fallbackImage"
                  class="carousel-image"
                  spinner-color="primary"
                >
                  <template v-slot:loading>
                    <div class="absolute-full flex flex-center bg-grey-3">
                      <q-spinner color="primary" size="50px" />
                    </div>
                  </template>
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-2">
                      <img :src="fallbackImage" class="fallback-img" />
                    </div>
                  </template>
                </q-img>
                <div class="slide-overlay">
                  <div class="slide-info">
                    <h3 class="slide-title">{{ place.name }}</h3>
                    <p v-if="place.address" class="slide-area">{{ place.address }}</p>
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
                <q-carousel-control position="bottom-right" :offset="[10, 10]" class="q-gutter-xs">
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
            :class="{ active: slide === index }"
            @click="slide = index"
          >
            <q-img :src="place.imageUrl || fallbackImage" class="indicator-image">
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-2">
                  <img :src="fallbackImage" class="fallback-img" />
                </div>
              </template>
            </q-img>
          </div>
        </div>
      </div>
    </section>

    <!-- "SA BAGUIO" FACEBOOK GROUP BANNER (Section 3) -->
    <section class="community-ribbon-section">
      <div class="container">
        <div class="community-ribbon">
          <div class="ribbon-text">
            <p class="ribbon-eyebrow">COMMUNITY</p>
            <h3 class="ribbon-title">Want more <em>organic</em> content?</h3>
            <p class="ribbon-description">
              Visit Sa Baguio Facebook group for more personal suggestions and experiences.
            </p>
          </div>
          <q-btn
            label="Sa Baguio!"
            unelevated
            class="ribbon-btn"
            icon-right="open_in_new"
            @click="openSaBaguioGroup"
          />
        </div>
      </div>
    </section>

    <!-- PLACES SECTION (Section 4) -->
    <section id="places" class="places-section">
      <div class="container">
        <div class="section-eyebrow text-center">
          <p class="eyebrow-text">EXPLORE PLACES</p>
          <h2 class="eyebrow-title">Discover <em>Baguio's</em> places</h2>
          <p class="eyebrow-description">
            Browse our curated collection of tourist spots, cafes, parks, and more.
          </p>
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
          <p class="text-grey-6">
            {{
              selectedCategory === 'all' ? 'No places available yet' : 'No places in this category'
            }}
          </p>
        </div>

        <div v-else class="places-grid">
          <q-card
            v-for="place in filteredPlaces"
            :key="place.id"
            class="place-card q-ma-sm"
            @click="selectPlace(place)"
          >
            <q-img
              :src="place.imageUrl || fallbackImage"
              spinner-color="primary"
              class="place-image"
            >
              <template v-slot:loading>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-spinner color="primary" size="30px" />
                </div>
              </template>
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-2">
                  <img :src="fallbackImage" class="fallback-img" />
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
                v-for="(cat, idx) in Array.isArray(place.categories)
                  ? place.categories
                  : [place.category].filter(Boolean)"
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
                  <div v-if="place.address" class="text-subtitle2 text-grey-7">
                    <q-icon name="location_on" size="14px" class="q-mr-xs" />
                    {{ place.address }}
                  </div>
                </div>
              </div>

              <p class="text-body2 q-mt-md text-grey-8">
                {{ truncateText(place.description, 80) }}
              </p>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat color="primary" @click.stop="selectPlace(place)" icon="visibility">
                Details
              </q-btn>
              <q-btn flat color="secondary" @click.stop="navigateToPlace(place)" icon="navigation">
                Go There
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </section>

    <!-- PLACE DETAILS MODAL (Section 6) -->
    <q-dialog v-model="showPlaceDetail" transition-show="fade" transition-hide="fade">
      <q-card class="place-detail-card" style="width: 90%; max-width: 900px">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ selectedPlace?.name }}</div>
              <div v-if="selectedPlace?.address" class="text-subtitle2">
                <q-icon name="location_on" size="16px" class="q-mr-xs" />
                {{ selectedPlace?.address }}
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none" v-if="selectedPlace">
          <q-scroll-area style="height: 65vh">
            <q-img
              :src="selectedPlace.imageUrl || fallbackImage"
              spinner-color="primary"
              class="modal-image"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-2">
                  <img :src="fallbackImage" class="fallback-img" />
                </div>
              </template>
            </q-img>

            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-8">
                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">About this Place</h4>
                  <p class="text-body1 q-mb-lg">
                    {{ selectedPlace.description || 'No description available.' }}
                  </p>

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
                        <q-item-label caption>{{
                          formatOperatingHours(selectedPlace.operatingHours)
                        }}</q-item-label>
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
        <div class="section-eyebrow text-center">
          <p class="eyebrow-text">QUESTIONS &amp; ANSWERS</p>
          <h2 class="eyebrow-title"><em>Maykan</em> FAQs</h2>
          <p class="eyebrow-description">Common questions about discovering places in Baguio.</p>
        </div>
        <div class="faqs-grid">
          <div class="faqs-column">
            <q-expansion-item
              v-for="(faq, index) in leftFaqs"
              :key="index"
              :label="faq.question"
              class="faq-item"
              expand-icon="add"
              expanded-icon="remove"
              header-class="faq-header"
            >
              <q-card class="faq-card" flat>
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
              expand-icon="add"
              expanded-icon="remove"
              header-class="faq-header"
            >
              <q-card class="faq-card" flat>
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
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useUserStore } from 'stores/user-store'
import FooterSection from '../components/home/FooterSection.vue'
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
        answer:
          'Click on any place and use the "Get Directions" button to navigate to the location using APANAM navigation.',
      },
      {
        question: 'Can I save places for later?',
        answer:
          'Yes! Click the bookmark icon on any place card to save it. You can view all your saved places from your account page.',
      },
      {
        question: 'How do I share a place?',
        answer:
          'Click on a place to open details, then click the "Share" button to share the place details with others.',
      },
      {
        question: 'What if a place is closed?',
        answer:
          'Place information is regularly updated. We recommend checking the operating hours before visiting.',
      },
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

    // Get top tourist places for carousel (featured first, fall back to tourist-spot category)
    const topTouristPlaces = computed(() => {
      const featured = places.value.filter((p) => p.featured === true)
      if (featured.length > 0) return featured
      const touristSpots = places.value.filter(
        (p) => Array.isArray(p.categories) && p.categories.includes('tourist-spot')
      )
      return touristSpots.length > 0 ? touristSpots : places.value.slice(0, 10)
    })

    const onSlideChange = (newSlide) => {
      slide.value = newSlide
    }

    const filteredPlaces = computed(() => {
      if (selectedCategory.value === 'all') {
        return places.value
      }
      return places.value.filter((place) => {
        // Support both single category (string) and multiple categories (array)
        const placeCategories = Array.isArray(place.categories)
          ? place.categories
          : [place.category].filter(Boolean)
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
        const firebasePlaces = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          // Normalize invalid or placeholder image URLs
          if (
            !data.imageUrl ||
            typeof data.imageUrl !== 'string' ||
            !data.imageUrl.trim() ||
            data.imageUrl.includes('via.placeholder') ||
            data.imageUrl.includes('placeholder')
          ) {
            data.imageUrl = fallbackImage
          }
          return {
            id: doc.id,
            ...data,
          }
        })
        console.log('[MaykanPage] Loaded places from Firebase:', firebasePlaces.length)
        places.value = firebasePlaces
      } catch (error) {
        console.error('[MaykanPage] Error loading places:', error)
        places.value = []
        $q.notify({
          type: 'negative',
          message: 'Failed to load places. Please try again later.',
          position: 'top',
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
          toLat: place.latitude ?? '',
          toLng: place.longitude ?? '',
        },
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
              handler: () => router.push('/login'),
            },
          ],
        })
        return
      }

      const isSaved = savedPlacesIds.value.has(place.id)

      try {
        const savedPlaceRef = doc(db, 'users', userStore.user.uid, 'savedPlaces', place.id)

        if (isSaved) {
          // Unsave place
          await deleteDoc(savedPlaceRef)
          savedPlacesIds.value.delete(place.id)
          $q.notify({
            type: 'info',
            message: 'Place removed from saved',
            position: 'top',
          })
        } else {
          // Save place
          await setDoc(savedPlaceRef, {
            placeId: place.id,
            name: place.name,
            categories: Array.isArray(place.categories) ? place.categories : [],
            description: place.description,
            address: place.address,
            operatingHours: place.operatingHours,
            entranceFee: place.entranceFee,
            phone: place.phone,
            imageUrl: place.imageUrl,
            latitude: place.latitude,
            longitude: place.longitude,
            savedAt: serverTimestamp(),
          })
          savedPlacesIds.value.add(place.id)
          $q.notify({
            type: 'positive',
            message: 'Place saved successfully!',
            position: 'top',
          })
        }
      } catch (error) {
        console.error('[MaykanPage] Error toggling saved place:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to save place',
          position: 'top',
        })
      }
    }

    const loadSavedPlaces = async () => {
      if (!userStore.isAuthenticated) {
        savedPlacesIds.value.clear()
        return
      }

      try {
        const savedPlacesRef = collection(db, 'users', userStore.user.uid, 'savedPlaces')
        const querySnapshot = await getDocs(savedPlacesRef)
        savedPlacesIds.value.clear()
        querySnapshot.docs.forEach((doc) => {
          savedPlacesIds.value.add(doc.id)
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
            { label: 'Messenger', icon: 'chat', value: 'messenger' },
          ],
        },
        cancel: true,
        persistent: true,
      }).onOk(async (data) => {
        const placeUrl = window.location.href.split('?')[0] + '?place=' + selectedPlace.value.id
        const placeText = 'Check out ' + selectedPlace.value.name + ' in Baguio City! ' + placeUrl

        if (data === 'copy') {
          await navigator.clipboard.writeText(placeUrl)
          $q.notify({
            message: 'Link copied to clipboard!',
            color: 'positive',
            position: 'top',
            icon: 'check',
          })
        } else if (data === 'facebook') {
          window.open(
            'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(placeUrl),
            '_blank',
            'width=600,height=400'
          )
        } else if (data === 'twitter') {
          window.open(
            'https://twitter.com/intent/tweet?text=' + encodeURIComponent(placeText),
            '_blank',
            'width=600,height=400'
          )
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
          position: 'top',
        })
        return
      }

      // Here you would typically save the report to Firebase
      console.log('[MaykanPage] Report submitted:', {
        placeId: placeToReport.value?.id,
        placeName: placeToReport.value?.name,
        issue: reportIssueText.value,
        timestamp: new Date(),
      })

      showReportDialog.value = false
      $q.notify({
        type: 'positive',
        message: 'Thank you! Your report has been submitted.',
        position: 'top',
        timeout: 3000,
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
        restaurant: 'Cafes & Restaurants',
        'park-nature': 'Parks & Nature',
        'museum-culture': 'Museums & Culture',
        shopping: 'Shopping',
        'hotel-lodging': 'Hotels & Lodging',
        government: 'Government',
        hospital: 'Hospital',
        school: 'School',
        other: 'Other',
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
        minute: '2-digit',
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
      fallbackImage,
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
      reportIssueText,
    }
  },
})
</script>

<style scoped lang="scss">
// Color Palette — aligned with home page
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$sage: #b8cfa3;
$mint-bg: #e8f0e0;
$soft-green: #e8f5e9;
$mint-cream: #f1f8f4;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;
$brown: #6b5344;

$bento-radius: 18px;
$bento-shadow: 0 6px 18px rgba(20, 36, 26, 0.06);
$bento-shadow-hover: 0 14px 30px rgba(20, 36, 26, 0.12);

.maykan-page {
  background: $white !important;
  min-height: 100vh;
}

/* Section eyebrow — shared header */
.section-eyebrow {
  margin-bottom: 2.25rem;

  &.text-center {
    text-align: center;
  }
}

.eyebrow-text {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin: 0 0 0.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.eyebrow-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.7rem, 3.2vw, 2.3rem);
  font-weight: 600;
  color: $ink;
  margin: 0 0 0.75rem;
  line-height: 1.18;
  letter-spacing: -0.01em;

  em {
    font-style: italic;
    font-weight: 600;
    color: $primary-green;
  }
}

.eyebrow-description {
  font-size: 0.95rem;
  color: $muted;
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto;
}

/* HERO — rounded card */
.maykan-hero {
  width: 100%;
  padding: 1.25rem 1.25rem 2rem;
  background: $white;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: clamp(420px, 58vh, 560px);
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
  background-size: cover;
  background-position: center;
  box-shadow: 0 20px 50px rgba(20, 36, 26, 0.18);
}

.hero-overlay-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 36, 26, 0.45) 0%,
    rgba(20, 36, 26, 0.2) 50%,
    rgba(20, 36, 26, 0.65) 100%
  );
  z-index: 1;
}

.hero-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 5%;
  color: $white;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: $white;
  backdrop-filter: blur(8px);
  margin-bottom: 1.25rem;
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 700;
  color: $white;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
  line-height: 1.05;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);

  em {
    font-style: italic;
    color: $sage;
    font-weight: 700;
  }
}

.hero-description {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba($white, 0.94);
  margin: 0 auto 1.75rem;
  max-width: 600px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);
}

.hero-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: $primary-green;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .q-icon {
    color: $primary-green;
  }
}

/* Carousel Section */
.carousel-section {
  background: $white;
  padding: 4rem 0;
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
  background: linear-gradient(to top, rgba($ink, 0.92) 0%, rgba($ink, 0.6) 60%, transparent 100%);
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
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.slide-area {
  font-size: 0.95rem;
  opacity: 0.92;
  margin-bottom: 1rem;
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
    border-radius: 999px;
    font-weight: 600;
    text-transform: none;
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
  opacity: 0.55;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    opacity: 0.85;
    transform: translateY(-2px);
  }
}

.indicator-item.active {
  opacity: 1;
  border-color: $primary-green;
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba($primary-green, 0.25);
}

.indicator-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-controls {
  background: transparent;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Community ribbon — clean, mint-green card */
.community-ribbon-section {
  background: $white;
  padding: 1rem 0 3rem;
}

.community-ribbon {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: $mint-bg;
  border: 1px solid rgba($primary-green, 0.18);
  border-radius: 22px;
  padding: 2rem 2.25rem;
  max-width: 1100px;
  margin: 0 auto;
}

.ribbon-text {
  flex: 1 1 320px;
}

.ribbon-eyebrow {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin: 0 0 0.4rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ribbon-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: $ink;
  margin: 0 0 0.4rem;
  letter-spacing: -0.005em;
  line-height: 1.25;

  em {
    font-style: italic;
    color: $primary-green;
    font-weight: 600;
  }
}

.ribbon-description {
  font-size: 0.92rem;
  color: $muted;
  margin: 0;
  line-height: 1.55;
}

.ribbon-btn {
  background: $primary-green !important;
  color: $white !important;
  font-weight: 600;
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  text-transform: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: $dark-green !important;
    transform: translateY(-2px);
  }
}

.places-section {
  padding: 4rem 0;
  background: $white;
}

/* Places grid */
.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.place-card {
  background: $white;
  border-radius: $bento-radius;
  border: 1px solid $border;
  box-shadow: $bento-shadow;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $bento-shadow-hover;
    border-color: rgba($primary-green, 0.3);
  }

  :deep(.q-img) {
    height: 220px;
    position: relative;
  }

  :deep(.q-card__section) {
    padding: 1.25rem;
  }

  :deep(.text-h6) {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.15rem !important;
    font-weight: 600 !important;
    color: $ink !important;
    letter-spacing: -0.005em;
  }
}

.place-image {
  height: 220px;
  object-fit: cover;
  position: relative;
}

.fallback-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    border-radius: 999px;
    padding: 5px 12px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.92) !important;
    color: $primary-green !important;
    border: 1px solid rgba($primary-green, 0.18);
    font-size: 0.72rem;
    letter-spacing: 0.02em;
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
  box-shadow: 0 16px 48px rgba(20, 36, 26, 0.18);
  border: 1px solid $border;
  background: $white;
}

.modal-image {
  height: 300px;
  width: 100%;
  object-fit: cover;
}

/* FAQ Section — light, matches home */
.faqs-section {
  background: $white;
  padding: 5rem 0;
  color: $ink;
  border-top: 1px solid $border;
}

.container-faqs {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background: $white;
  border: 1px solid $border;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: rgba($primary-green, 0.35);
    box-shadow: 0 6px 18px rgba(20, 36, 26, 0.06);
  }

  :deep(.q-item) {
    padding: 0.95rem 1.25rem;
    min-height: auto;
    border-radius: 14px;
  }

  :deep(.q-item__label) {
    font-size: 0.92rem;
    font-weight: 600;
    color: $ink;
    text-transform: none;
    letter-spacing: -0.005em;
    line-height: 1.4;
  }

  :deep(.q-icon) {
    color: $primary-green;
    font-size: 18px;
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
  padding: 0 1.25rem 1.1rem;
  font-size: 0.88rem;
  color: $muted;
  line-height: 1.65;
}

/* Color overrides for Quasar utilities scoped to this page */
.bg-primary {
  background: $primary-green !important;
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
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-filter-section {
  margin-bottom: 2.5rem;
}

.category-btn {
  border-radius: 999px !important;
  text-transform: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  padding: 9px 20px !important;
  margin: 4px;

  &:not(.q-btn--unelevated) {
    border: 1px solid $border;
    color: $ink !important;
  }

  &.q-btn--unelevated {
    background: $primary-green !important;
    color: $white !important;
  }
}

@media (max-width: 1023px) {
  .carousel-section,
  .places-section {
    padding: 3rem 0;
  }

  .faqs-section {
    padding: 4rem 0;
  }

  .faqs-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .maykan-hero {
    padding: 0.75rem 0.75rem 1.5rem;
  }

  .hero-card {
    height: clamp(420px, 60vh, 560px);
    border-radius: 20px;
  }

  .hero-title {
    font-size: 2.4rem;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-chip {
    font-size: 0.72rem;
    padding: 6px 12px;
  }

  .container,
  .container-faqs {
    padding: 0 1.25rem;
  }

  .community-ribbon {
    padding: 1.5rem;
    border-radius: 18px;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .ribbon-btn {
    width: 100%;
    justify-content: center;
  }

  .places-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .place-image {
    height: 200px;
  }

  /* Touch-friendly buttons */
  :deep(.q-btn) {
    min-height: 44px !important;
    min-width: 44px !important;
  }

  .carousel-image {
    height: 320px;
  }

  .slide-title {
    font-size: 1.4rem;
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

  .modal-image {
    height: 240px;
  }

  .row {
    flex-direction: column;
  }

  .col-md-6,
  .col-md-8,
  .col-md-4 {
    width: 100%;
  }

  .category-btn {
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .hero-card {
    height: clamp(380px, 60vh, 500px);
    border-radius: 18px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 0.9rem;
  }
}
</style>
