<template>
  <q-page class="maykan-page">
    <!-- NAVBAR (Same as MainLayout) -->
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="arrow_back" @click="$router.go(-1)" />

        <q-toolbar-title>
          <div class="flex items-center">
            <img src="~assets/logo.png" alt="Boost Baguio" style="height: 32px; margin-right: 8px;">
            <span class="text-weight-bold">Boost Baguio</span>
          </div>
        </q-toolbar-title>

        <!-- Main Feature Shortcut (APANAM) -->
        <q-btn flat label="APANAM" @click="$router.push('/apanam')" class="q-mr-sm" />

        <!-- Dropdown for All Features -->
        <q-btn-dropdown flat label="Features" class="q-mr-sm">
          <q-list>
            <q-item clickable v-close-popup @click="$router.push('/apanam')">
              <q-item-section>
                <q-item-label>APANAM (P2P Navigation)</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$router.push('/pagnaam')">
              <q-item-section>
                <q-item-label>PAGNAAM (City Jeeps)</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$router.push('/maykan')">
              <q-item-section>
                <q-item-label>MAYKAN (Places)</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$router.push('/aramidem')">
              <q-item-section>
                <q-item-label>ARAMIDEM (Events)</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="$router.push('/ayanmo')">
              <q-item-section>
                <q-item-label>AYAN MO (Near Me)</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Auth Buttons -->
        <q-space />
        <q-btn flat label="Login" @click="$router.push('/auth')" />
        <q-btn flat label="Sign Up" @click="$router.push('/auth')" />
      </q-toolbar>
    </q-header>

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
              <q-chip square color="primary" text-color="white">Tourist Spots</q-chip>
              <q-chip square color="secondary" text-color="white">Cafes & Restaurants</q-chip>
              <q-chip square color="primary" text-color="white">Parks & Nature</q-chip>
              <q-chip square color="secondary" text-color="white">Cultural Sites</q-chip>
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
            />
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-h6 text-primary">{{ place.name }}</div>
                  <div class="text-subtitle2">{{ place.area }}</div>
                </div>
                <q-badge color="secondary" class="text-capitalize">
                  {{ place.category }}
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

    <!-- PLACE DETAILS MODAL (Section 5) -->
    <q-dialog
      v-model="showPlaceDetail"
      full-width
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card v-if="selectedPlace" class="place-detail-card">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ selectedPlace.name }}</div>
              <div class="text-subtitle1">{{ selectedPlace.area }}</div>
            </div>
            <div class="col-auto">
              <q-badge color="white" text-color="primary" class="text-capitalize">
                {{ selectedPlace.category }}
              </q-badge>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row">
            <div class="col-md-8 col-12">
              <q-img
                :src="selectedPlace.imageUrl || '~assets/place-default.jpg'"
                spinner-color="primary"
                class="detail-image"
              />
            </div>
            <div class="col-md-4 col-12 q-pa-lg">
              <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Place Information</h4>
              <q-list>
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
                    <q-item-label caption>{{ selectedPlace.operatingHours }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-if="selectedPlace.entranceFee">
                  <q-item-section avatar>
                    <q-icon name="payments" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Entrance Fee</q-item-label>
                    <q-item-label caption>{{ selectedPlace.entranceFee }}</q-item-label>
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
          </div>
        </q-card-section>

        <q-card-section>
          <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Description</h4>
          <p class="text-body1">{{ selectedPlace.description || 'No description available.' }}</p>
        </q-card-section>

        <q-card-section>
          <h4 class="text-h6 text-weight-bold text-primary q-mb-md">How to Get There</h4>
          <p class="text-body1">
            Use our navigation system to plan your route to {{ selectedPlace.name }}.
          </p>
          <q-btn
            label="Go There"
            color="primary"
            @click="navigateToPlace(selectedPlace)"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn flat label="Share" color="primary" @click="sharePlace" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CONTACT US SECTION (Section 6) -->
    <section class="contact-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Contact Us</h2>
          <p class="text-body1">Have questions or suggestions? Reach out to us!</p>
        </div>

        <div class="contact-overlay">
          <div class="contact-container">
            <button class="close-btn" @click="closeContactModal">×</button>

            <div class="contact-header">
              <h1>CONTACT US</h1>
              <p>We're here to help with your travel inquiries!</p>
            </div>

            <div class="contact-content">
              <div class="contact-info">
                <div class="info-section">
                  <div class="info-icon">
                    <i class="icon-email">✉</i>
                  </div>
                  <div class="info-details">
                    <h3>EMAIL</h3>
                    <a href="mailto:info@boostbaguioph.com">info@boostbaguioph.com</a>
                    <a href="mailto:support@boostbaguioph.com">support@boostbaguioph.com</a>
                  </div>
                </div>

                <div class="info-section">
                  <div class="info-icon">
                    <i class="icon-phone">📞</i>
                  </div>
                  <div class="info-details">
                    <h3>PHONE</h3>
                    <p>Call us anytime!</p>
                    <a href="tel:+639123456789">+63 912 345 6789</a>
                  </div>
                </div>

                <div class="info-section">
                  <div class="info-icon">
                    <i class="icon-location">📍</i>
                  </div>
                  <div class="info-details">
                    <h3>OFFICE</h3>
                    <p>Session Road, Baguio City, PH</p>
                    <a href="#" class="directions-link" @click.prevent="getDirections">
                      Get Directions →
                    </a>
                  </div>
                </div>
              </div>

              <div class="contact-form">
                <form @submit.prevent="handleSubmit" ref="contactForm">
                  <div class="form-group">
                    <label for="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="from_name"
                      v-model="formData.name"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="from_email"
                      v-model="formData.email"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      v-model="formData.message"
                      placeholder="Type your message..."
                      rows="5"
                      required
                    ></textarea>
                  </div>

                  <input type="hidden" name="to_email" value="superadmin@baguioboosters.com" />

                  <div class="form-group checkbox-group">
                    <input type="checkbox" id="terms" v-model="formData.acceptTerms" required />
                    <label for="terms">
                      I accept the <a href="#" @click.prevent="showTerms">Terms</a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    class="submit-btn"
                    :disabled="!formData.acceptTerms || isSubmitting"
                  >
                    {{ isSubmitting ? 'Sending...' : 'Submit' }}
                  </button>
                </form>

                <div v-if="showSuccess" class="success-message">
                  Thank you! Your message has been sent successfully.
                </div>

                <div v-if="showError" class="error-message">
                  {{ errorMessage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQS SECTION (Section 7) -->
    <section class="faqs-section bg-white q-py-xl">
      <div class="container">
        <h3 class="text-h4 text-weight-bold text-primary text-center q-mb-xl">MAYKAN FAQs</h3>
        <q-list>
          <q-expansion-item
            v-for="(faq, index) in faqs"
            :key="index"
            :label="faq.question"
            header-class="text-weight-bold"
          >
            <q-card>
              <q-card-section>
                {{ faq.answer }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
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
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'
import FooterSection from '../components/Home/FooterSection.vue'
import fallbackImage from '../assets/456.png'

export default defineComponent({
  name: 'MaykanPage',
  components: {
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const places = ref([])
    const loading = ref(true)
    const showPlaceDetail = ref(false)
    const selectedPlace = ref(null)
    const selectedCategory = ref('all')
    const heroImageUrl = ref(fallbackImage)
    const isSubmitting = ref(false)
    const showSuccess = ref(false)
    const showError = ref(false)
    const errorMessage = ref('')
    const showContactForm = ref(false)

    const formData = ref({
      name: '',
      email: '',
      message: '',
      acceptTerms: false,
    })

    const faqs = [
      {
        question: 'How do I get directions to a place?',
        answer: 'Click on any place and use the "Go There" button to navigate to the location using APANAM navigation.'
      },
      {
        question: 'Can I save places for later?',
        answer: 'Yes, premium users can save favorite places and create custom itineraries.'
      },
      {
        question: 'How do I share a place?',
        answer: 'Click on a place, then click the "Share" button to share the place details with others.'
      },
      {
        question: 'What if a place is closed?',
        answer: 'Place information is regularly updated. We recommend checking the operating hours before visiting.'
      }
    ]

    const categories = [
      { label: 'All Places', value: 'all' },
      { label: 'Tourist Spots', value: 'Tourist Spots' },
      { label: 'Cafes & Restaurants', value: 'Cafes & Restaurants' },
      { label: 'Parks & Nature', value: 'Parks & Nature' },
      { label: 'Museums & Culture', value: 'Museums & Culture' },
      { label: 'Shopping', value: 'Shopping' },
    ]

    const filteredPlaces = computed(() => {
      if (selectedCategory.value === 'all') {
        return places.value
      }
      return places.value.filter(place => place.category === selectedCategory.value)
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
        places.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('[MaykanPage] Loaded places:', places.value.length)
      } catch (error) {
        console.error('[MaykanPage] Error loading places:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load places',
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
      router.push(`/apanam?start=${encodeURIComponent('Current Location')}&end=${encodeURIComponent(place.name)}`)
      showPlaceDetail.value = false
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

    const closeContactModal = () => {
      showContactForm.value = false
    }

    const handleSubmit = async () => {
      isSubmitting.value = true
      showError.value = false
      showSuccess.value = false

      try {
        // Simulate email sending
        // In a real implementation, you would use EmailJS or your backend API
        console.log('Sending email:', formData.value)
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        showSuccess.value = true
        $q.notify({
          message: 'Thank you! Your message has been sent successfully.',
          color: 'positive',
          position: 'top'
        })

        // Reset form
        formData.value = {
          name: '',
          email: '',
          message: '',
          acceptTerms: false,
        }

        setTimeout(() => {
          showSuccess.value = false
        }, 3000)

      } catch (error) {
        console.error('Email error:', error)
        showError.value = true
        errorMessage.value = 'Failed to send message. Please try again or email us directly at info@boostbaguioph.com'
        
        $q.notify({
          message: 'Failed to send message. Please try again.',
          color: 'negative',
          position: 'top'
        })

        setTimeout(() => {
          showError.value = false
        }, 5000)
      } finally {
        isSubmitting.value = false
      }
    }

    const getDirections = () => {
      const address = 'Session Road, Baguio City, Philippines'
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      window.open(mapsUrl, '_blank')
    }

    const showTerms = () => {
      router.push('/terms')
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchPlaces()
    })

    return {
      places,
      loading,
      showPlaceDetail,
      selectedPlace,
      selectedCategory,
      heroImageUrl,
      isSubmitting,
      showSuccess,
      showError,
      errorMessage,
      showContactForm,
      formData,
      faqs,
      categories,
      filteredPlaces,
      truncateText,
      openSaBaguioGroup,
      filterByCategory,
      selectPlace,
      navigateToPlace,
      sharePlace,
      closeContactModal,
      handleSubmit,
      getDirections,
      showTerms,
    }
  },
})
</script>

<style scoped>
.maykan-page {
  background-color: #F5F5F5;
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

.contact-section {
  background-color: white;
}

/* Contact Form Styles */
.contact-overlay {
  position: relative;
  background: white;
  border-radius: 12px;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #000;
}

.contact-header {
  text-align: center;
  margin-bottom: 40px;
}

.contact-header h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  color: #1a1a1a;
}

.contact-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 50px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section {
  display: flex;
  gap: 15px;
}

.info-icon {
  font-size: 24px;
  color: #333;
  width: 40px;
  flex-shrink: 0;
}

.info-details h3 {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.info-details p {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px 0;
}

.info-details a {
  display: block;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  margin: 3px 0;
  transition: color 0.3s;
}

.info-details a:hover {
  color: #007bff;
}

.directions-link {
  font-weight: 500;
  margin-top: 8px !important;
}

.contact-form {
  position: relative;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group label {
  margin: 0;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.checkbox-group a {
  color: #007bff;
  text-decoration: none;
}

.checkbox-group a:hover {
  text-decoration: underline;
}

.submit-btn {
  background-color: #fff;
  color: #333;
  border: 2px solid #333;
  padding: 12px 40px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
  width: 100%;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333;
  color: white;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message,
.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s;
  z-index: 10;
  max-width: 90%;
  text-align: center;
}

.success-message {
  background: #4caf50;
  color: white;
}

.error-message {
  background: #f44336;
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.faqs-section {
  background-color: white;
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
  
  .contact-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .contact-overlay {
    padding: 30px 20px;
  }
  
  .contact-header h1 {
    font-size: 24px;
  }
  
  .contact-header p {
    font-size: 14px;
  }
  
  .row {
    flex-direction: column;
  }
  
  .col-md-6, .col-md-4, .col-md-8 {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>