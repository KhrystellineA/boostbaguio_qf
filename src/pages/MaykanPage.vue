<template>
  <q-page class="maykan-page">
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">MAYKAN</h1>
          <p class="hero-description">
            Discover Baguio's gems! Uncover curated tourist spots with easy commute guides tailored for your Baguio adventure.
          </p>
        </div>
      </div>
    </section>

    <section class="explore-section">
      <div class="container">
        <div class="explore-header text-center">
          <div class="text-overline">Explore</div>
          <h2 class="explore-title">DISCOVER BAGUIO'S HIDDEN GEMS WITH EASE</h2>
          <p class="explore-subtitle">
            Baguio City is filled with breathtaking sights and experiences waiting to be discovered. Our curated list of tourist spots ensures you navigate the city effortlessly while enjoying its rich culture.
          </p>
        </div>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card section-animate"
          >
            <div class="feature-icon-wrapper">
              <q-icon :name="feature.icon" size="64px" class="feature-icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="community-ribbon">
      <div class="container">
        <div class="ribbon-content">
          <div class="ribbon-text">
            <q-icon name="groups" size="32px" class="ribbon-icon" />
            <div>
              <h3 class="ribbon-title">Want more organic content?</h3>
              <p class="ribbon-subtitle">
                Visit Sa Baguio Facebook group to see more personal and unique suggestions and experiences!
              </p>
            </div>
          </div>
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
    </section>

    <section id="places" class="places-section" ref="placesSection">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">EXPLORE BAGUIO'S PLACES</h2>
          <p class="section-description">
            Browse through our curated collection of Baguio's best tourist spots, cafes, parks,
            and more. Click on any place to view details and get directions.
          </p>

          <div class="category-filter">
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
          </div>
        </div>

        <div v-if="loading" class="text-center q-py-xl">
          <q-spinner-hourglass color="primary" size="60px" />
          <p class="q-mt-md text-grey-7">Loading places...</p>
        </div>

        <div v-else-if="filteredPlaces.length === 0" class="no-places-state">
          <q-icon name="place" size="80px" color="grey-5" />
          <h3 class="text-grey-7 q-mt-md">No Places Found</h3>
          <p class="text-grey-6">{{ selectedCategory === 'all' ? 'No places available yet' : 'No places in this category' }}</p>
        </div>

        <div v-else class="places-masonry">
          <div
            v-for="place in filteredPlaces"
            :key="place.id"
            class="place-card card-hover"
            @click="selectPlace(place)"
          >
            <div class="place-image-wrapper">
              <img 
                v-if="place.imageUrl" 
                :src="place.imageUrl" 
                :alt="place.name" 
                class="place-image" 
              />
              <div v-else class="place-placeholder">
                <q-icon name="place" size="48px" color="grey-4" />
              </div>
              <div class="place-category-badge">{{ place.category }}</div>
            </div>

            <div class="place-content">
              <h3 class="place-name">{{ place.name }}</h3>
              <p class="place-short-desc">{{ place.shortDescription || truncateText(place.description, 80) }}</p>

              <div class="place-meta">
                <div class="meta-item" v-if="place.operatingHours">
                  <q-icon name="schedule" size="16px" />
                  <span>{{ place.operatingHours }}</span>
                </div>
                <div class="meta-item" v-if="place.area">
                  <q-icon name="location_on" size="16px" />
                  <span>{{ place.area }}</span>
                </div>
              </div>

              <div class="place-tags" v-if="place.tags && place.tags.length > 0">
                <span v-for="(tag, tagIndex) in place.tags.slice(0, 3)" :key="tagIndex" class="place-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <q-dialog
      v-model="showPlaceDetail"
      transition-show="slide-up"
      transition-hide="slide-down"
      maximized
    >
      <q-card class="place-detail-card">
        <q-card-section class="place-detail-content">
          <q-btn
            flat
            dense
            round
            icon="close"
            color="dark"
            size="lg"
            class="close-btn"
            @click="showPlaceDetail = false"
          />

          <div class="detail-container" v-if="selectedPlace">
            <div class="detail-image-section">
              <div class="detail-image-wrapper">
                <img
                  v-if="selectedPlace.imageUrl"
                  :src="selectedPlace.imageUrl"
                  :alt="selectedPlace.name"
                  class="detail-image"
                />
                <div v-else class="detail-image-placeholder">
                  <q-icon name="place" size="120px" color="grey-4" />
                </div>
              </div>
            </div>

            <div class="detail-info-section">
              <div class="detail-header">
                <div class="category-badge">{{ selectedPlace.category }}</div>
                <h2 class="detail-title">{{ selectedPlace.name }}</h2>
                <p class="detail-description">{{ selectedPlace.description || 'No description available.' }}</p>
              </div>

              <div class="detail-info-card" v-if="selectedPlace.operatingHours">
                <div class="info-card-header">
                  <q-icon name="schedule" size="32px" color="primary" />
                  <h3>Operating Hours</h3>
                </div>
                <div class="info-card-content">
                  <p class="hours-text">{{ selectedPlace.operatingHours }}</p>
                </div>
              </div>

              <div class="detail-info-card">
                <div class="info-card-header">
                  <q-icon name="location_on" size="32px" color="primary" />
                  <h3>Location</h3>
                </div>
                <div class="info-card-content">
                  <p class="address-text">{{ selectedPlace.address }}</p>
                  <p class="landmark-text" v-if="selectedPlace.area">Area: {{ selectedPlace.area }}</p>
                </div>
              </div>

              <div class="detail-info-card" v-if="selectedPlace.entranceFee">
                <div class="info-card-header">
                  <q-icon name="payments" size="32px" color="primary" />
                  <h3>Entrance Fee</h3>
                </div>
                <div class="info-card-content">
                  <p class="fee-text">{{ selectedPlace.entranceFee }}</p>
                </div>
              </div>

              <div class="detail-info-card" v-if="selectedPlace.phone || selectedPlace.website">
                <div class="info-card-header">
                  <q-icon name="phone" size="32px" color="primary" />
                  <h3>Contact</h3>
                </div>
                <div class="info-card-content">
                  <p class="contact-text" v-if="selectedPlace.phone">
                    <q-icon name="phone" size="16px" />
                    {{ selectedPlace.phone }}
                  </p>
                  <p class="contact-text" v-if="selectedPlace.website">
                    <q-icon name="language" size="16px" />
                    <a :href="selectedPlace.website" target="_blank">{{ selectedPlace.website }}</a>
                  </p>
                </div>
              </div>

              <div class="detail-tags" v-if="selectedPlace.tags && selectedPlace.tags.length > 0">
                <span v-for="(tag, idx) in selectedPlace.tags" :key="idx" class="detail-tag">
                  {{ tag }}
                </span>
              </div>

              <div class="detail-actions">
                <q-btn
                  label="Get Directions via APANAM"
                  unelevated
                  color="primary"
                  size="lg"
                  padding="14px 40px"
                  icon="navigation"
                  class="btn-hover-lift full-width"
                  @click="navigateToApanam"
                />

                <div class="secondary-actions">
                  <q-btn
                    label="Share"
                    outline
                    color="primary"
                    size="md"
                    icon="share"
                    class="btn-hover-lift"
                    @click="sharePlace"
                  />
                  <q-btn
                    :label="isSaving ? 'Saving...' : 'Save'"
                    :loading="isSaving"
                    outline
                    color="primary"
                    size="md"
                    icon="bookmark_border"
                    class="btn-hover-lift"
                    @click="savePlace"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <FAQSection />

    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db, auth } from 'src/boot/firebase'
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, where } from 'firebase/firestore'
import { useUserStore } from 'stores/user-store'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default defineComponent({
  name: 'MaykanPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const userStore = useUserStore()
    const placesSection = ref(null)
    const showPlaceDetail = ref(false)
    const selectedPlace = ref(null)
    const selectedCategory = ref('all')
    const places = ref([])
    const loading = ref(true)
    const heroImageUrl = ref(null)
    const isSaving = ref(false)

    const features = [
      {
        icon: 'place',
        title: 'MUST-VISIT ATTRACTIONS IN BAGUIO CITY',
        description: 'From parks to historical sites, explore Baguio\'s best.',
      },
      {
        icon: 'flag',
        title: 'YOUR GUIDE TO BAGUIO\'S TOURIST SPOTS',
        description: 'Follow our commute guides for a hassle-free visit.',
      },
      {
        icon: 'palette',
        title: 'EXPERIENCE THE BEST OF BAGUIO\'S CULTURE',
        description: 'Immerse yourself in local traditions and attractions.',
      },
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
          console.log('[MaykanPage] No hero image found')
        }
      } catch (error) {
        console.error('[MaykanPage] Error fetching hero image:', error)
      }
    }

    const fetchPlaces = async () => {
      loading.value = true
      try {
        const q = query(collection(db, 'places'), orderBy('name', 'asc'))
        const querySnapshot = await getDocs(q)
        places.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('[Maykan] Loaded places:', places.value.length)
      } catch (error) {
        console.error('[Maykan] Error loading places:', error)
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

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const openSaBaguioGroup = () => {
      window.open('https://www.facebook.com/groups/sabaguio', '_blank')
    }

    const filterByCategory = (category) => {
      selectedCategory.value = category
      scrollToSection('places')
    }

    const selectPlace = (place) => {
      selectedPlace.value = place
      showPlaceDetail.value = true
    }

    const navigateToApanam = () => {
      if (!selectedPlace.value) return

      showPlaceDetail.value = false

      const destinationData = {
        name: selectedPlace.value.name,
        address: selectedPlace.value.address,
        area: selectedPlace.value.area,
        coordinates: {
          latitude: selectedPlace.value.latitude,
          longitude: selectedPlace.value.longitude
        }
      }

      try {
        router.push({
          name: 'apanam',
          query: {
            to: selectedPlace.value.name,
            toAddress: selectedPlace.value.address,
            toArea: selectedPlace.value.area,
          },
          state: {
            destination: destinationData,
            fromMAYKAN: true,
          },
        })

        $q.notify({
          message: `Navigating to APANAM with destination: ${selectedPlace.value.name}`,
          color: 'positive',
          icon: 'navigation',
          position: 'top',
        })
      } catch {
        $q.notify({
          message:
            'APANAM feature is coming soon! Your destination will be: ' + selectedPlace.value.name,
          color: 'info',
          icon: 'info',
          position: 'top',
          timeout: 3000,
        })

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('apanam_destination', JSON.stringify(destinationData))
        }
      }
    }

    const sharePlace = () => {
      if (!selectedPlace.value) return

      if (navigator.share) {
        navigator
          .share({
            title: selectedPlace.value.name,
            text: selectedPlace.value.shortDescription || selectedPlace.value.description,
            url: window.location.href,
          })
          .then(() => {
            $q.notify({
              message: 'Place shared successfully!',
              color: 'positive',
              icon: 'share',
              position: 'top',
            })
          })
          .catch((error) => {
            console.log('Error sharing:', error)
          })
      } else {
        navigator.clipboard.writeText(window.location.href)
        $q.notify({
          message: 'Link copied to clipboard!',
          color: 'positive',
          icon: 'content_copy',
          position: 'top',
        })
      }
    }

    const savePlace = async () => {
  if (!selectedPlace.value) return
  
  const currentUser = auth.currentUser
  const userId = currentUser?.uid || userStore.userId || userStore.user?.uid || userStore.id

  console.log('[SavePlace] Debug:', {
    authCurrentUser: currentUser?.uid,
    storeUserId: userStore.userId,
    storeUserUid: userStore.user?.uid,
    storeId: userStore.id,
    finalUserId: userId,
    isPremium: userStore.isPremium
  })

  if (!userId) {
    $q.notify({
      message: 'Please login to save places',
      color: 'warning',
      icon: 'login',
      position: 'top',
      actions: [
        {
          label: 'Login',
          color: 'white',
          handler: () => {
            router.push('/auth')
          }
        }
      ]
    })
    return
  }

  if (!userStore.isPremium) {
    $q.dialog({
      title: 'Premium Feature',
      message: 'Saving places is a premium feature. Upgrade to save unlimited places and routes!',
      persistent: true,
      ok: {
        label: 'Upgrade to Premium',
        color: 'primary'
      },
      cancel: {
        label: 'Maybe Later',
        color: 'grey',
        flat: true
      }
    }).onOk(() => {
      router.push('/account')
    })
    return
  }

  isSaving.value = true

  try {
    const savedPlaceData = {
      placeId: selectedPlace.value.id,
      name: selectedPlace.value.name,
      category: selectedPlace.value.category,
      address: selectedPlace.value.address,
      area: selectedPlace.value.area,
      imageUrl: selectedPlace.value.imageUrl || null,
      description: selectedPlace.value.description,
      shortDescription: selectedPlace.value.shortDescription,
      coordinates: {
        latitude: selectedPlace.value.latitude,
        longitude: selectedPlace.value.longitude
      },
      operatingHours: selectedPlace.value.operatingHours,
      entranceFee: selectedPlace.value.entranceFee,
      phone: selectedPlace.value.phone,
      website: selectedPlace.value.website,
      tags: selectedPlace.value.tags || [],
      savedAt: new Date().toISOString(),
      userId: userId
    }

    console.log('[SavePlace] Attempting to save to:', `users/${userId}/savedPlaces`)

    const savedPlacesRef = collection(db, 'users', userId, 'savedPlaces')
    
    const q = query(savedPlacesRef, where('placeId', '==', selectedPlace.value.id))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      $q.notify({
        message: 'This place is already in your saves!',
        color: 'info',
        icon: 'info',
        position: 'top',
      })
      isSaving.value = false
      return
    }

    await addDoc(savedPlacesRef, savedPlaceData)
    console.log('[SavePlace] Successfully saved to Firestore')

    const savedPlacesData = localStorage.getItem('savedPlaces')
    let savedPlaces = savedPlacesData ? JSON.parse(savedPlacesData) : []
    
    const alreadySavedLocally = savedPlaces.some(p => p.placeId === selectedPlace.value.id)
    if (!alreadySavedLocally) {
      savedPlaces.push(savedPlaceData)
      localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces))
      console.log('[SavePlace] Saved to localStorage')
    }

    $q.notify({
      message: `${selectedPlace.value.name} saved successfully!`,
      color: 'positive',
      icon: 'bookmark',
      position: 'top',
    })
  } catch (error) {
    console.error('[Maykan] Error saving place:', error)
    console.error('[Maykan] Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    $q.notify({
      message: 'Failed to save place. Please try again.',
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  } finally {
    isSaving.value = false
  }
}

    const observeElements = () => {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, options)

      const elements = document.querySelectorAll('.section-animate')
      elements.forEach((el) => observer.observe(el))

      return observer
    }

    let observer

    onMounted(() => {
      fetchHeroImage()
      fetchPlaces()
      setTimeout(() => {
        observer = observeElements()
      }, 100)
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      features,
      categories,
      places,
      filteredPlaces,
      placesSection,
      showPlaceDetail,
      selectedPlace,
      selectedCategory,
      loading,
      heroImageUrl,
      isSaving,
      truncateText,
      scrollToSection,
      openSaBaguioGroup,
      filterByCategory,
      selectPlace,
      navigateToApanam,
      sharePlace,
      savePlace,
    }
  },
})
</script>

<style lang="scss" scoped>
$pine-green: #2d5016;
$pine-green-light: #4a7c2c;
$pine-green-dark: #1a3309;
$mountain-blue: #4a7ba7;
$sunset-orange: #e67e22;
$cream-white: #f8f6f0;
$warm-beige: #e8e0d5;
$earth-brown: #8b6f47;
$text-dark: #2c3e50;
$text-medium: #546e7a;
$text-light: #78909c;

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

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.section-animate {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-hover-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(45, 80, 22, 0.3);
  }
}

.card-hover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  position: relative;
  min-height: 500px;
  background: linear-gradient(135deg, $pine-green-dark 0%, $pine-green 50%, $pine-green-light 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
    z-index: 0;
  }

  .hero-overlay {
    position: relative;
    width: 100%;
    padding: 80px 5%;
    z-index: 1;
  }

  .hero-content {
    max-width: 700px;
    color: white;

    .hero-title {
      font-size: 5rem;
      font-weight: 900;
      line-height: 1;
      margin: 0 0 1.5rem 0;
      letter-spacing: 3px;
      text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 3rem;
      }
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 0;
      opacity: 0.95;
      text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
      max-width: 600px;
    }
  }
}

.explore-section {
  background: linear-gradient(135deg, $pine-green-dark 0%, $pine-green 100%);
  padding: 80px 0 100px 0;
  color: white;

  .explore-header {
    margin-bottom: 60px;

    .text-overline {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 600;
      font-size: 1rem;
      letter-spacing: 2px;
      margin-bottom: 1rem;
    }

    .explore-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: white;
      letter-spacing: 1px;
      line-height: 1.2;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }
    }

    .explore-subtitle {
      font-size: 1.05rem;
      line-height: 1.8;
      max-width: 900px;
      margin: 0 auto;
      opacity: 0.95;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 50px;
    margin-top: 60px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }

    .feature-card {
      text-align: center;
      padding: 0 20px;

      .feature-icon-wrapper {
        margin-bottom: 1.5rem;

        .feature-icon {
          color: white;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }
      }

      .feature-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: white;
        letter-spacing: 0.5px;
        line-height: 1.3;
        text-transform: uppercase;
      }

      .feature-description {
        font-size: 0.95rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

.community-ribbon {
  background: $cream-white;
  padding: 35px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .ribbon-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .ribbon-text {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;

      @media (max-width: 768px) {
        flex-direction: column;
      }

      .ribbon-icon {
        color: $pine-green;
        flex-shrink: 0;
        background: rgba(45, 80, 22, 0.1);
        padding: 12px;
        border-radius: 50%;
      }

      .ribbon-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: $text-dark;
      }

      .ribbon-subtitle {
        font-size: 0.95rem;
        color: $text-medium;
        margin: 0;
      }
    }

    .q-btn {
      background: white !important;
      color: $text-dark !important;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      border: 2px solid $pine-green;

      &:hover {
        background: $pine-green !important;
        color: white !important;
      }
    }
  }
}

.places-section {
  background: white;
  padding: 100px 0;

  .section-header {
    margin-bottom: 60px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: $text-dark;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .section-description {
      font-size: 1.1rem;
      line-height: 1.7;
      color: $text-medium;
      max-width: 800px;
      margin: 0 auto 2.5rem auto;
    }

    .category-filter {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;

      .category-btn {
        border-radius: 25px;
        text-transform: none;
        font-weight: 600;
        transition: all 0.3s ease;

        &:not(.q-btn--unelevated) {
          border: 2px solid $pine-green;
        }
      }
    }
  }

  .no-places-state {
    text-align: center;
    padding: 80px 20px;
  }

  .places-masonry {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .place-card {
      background: white;
      border: 2px solid $warm-beige;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

      .place-image-wrapper {
        position: relative;
        width: 100%;
        padding-top: 75%;
        background: linear-gradient(135deg, $warm-beige 0%, $cream-white 100%);
        overflow: hidden;

        .place-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        &:hover .place-image {
          transform: scale(1.1);
        }

        .place-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .place-category-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 0.8rem;
          font-weight: 700;
          color: $pine-green;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          letter-spacing: 0.5px;
        }
      }

      .place-content {
        padding: 25px;

        .place-name {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 0.75rem 0;
          color: $text-dark;
          line-height: 1.3;
        }

        .place-short-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          color: $text-medium;
          margin: 0 0 1rem 0;
        }

        .place-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid $warm-beige;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: $text-medium;

            .q-icon {
              color: $pine-green;
            }
          }
        }

        .place-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;

          .place-tag {
            font-size: 0.75rem;
            font-weight: 600;
            color: $pine-green;
            background: rgba(45, 80, 22, 0.08);
            padding: 5px 12px;
            border-radius: 15px;
            border: 1px solid rgba(45, 80, 22, 0.15);
          }
        }
      }
    }
  }
}

.place-detail-card {
  background: white;
  height: 100%;
  overflow-y: auto;

  .close-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
      background: $cream-white;
    }
  }

  .place-detail-content {
    padding: 0;
    background: white;
    height: 100%;

    .detail-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 0;
      height: calc(100vh - 100px);

      @media (max-width: 1023px) {
        flex-direction: column;
        height: auto;
      }

      .detail-image-section {
        flex: 0 0 45%;
        position: sticky;
        top: 0;
        height: 100%;
        overflow: hidden;
        background: #fff;

        @media (max-width: 1023px) {
          position: relative;
          height: 400px;
          flex: none;
        }

        .detail-image-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          .detail-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
          }

          .detail-image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, $warm-beige 0%, $cream-white 100%);
          }
        }
      }

      .detail-info-section {
        flex: 1;
        overflow-y: auto;
        padding: 40px 60px;
        background: $cream-white;

        @media (max-width: 1023px) {
          padding: 30px 20px;
        }
        .detail-header {
          margin-bottom: 30px;

          .category-badge {
            display: inline-block;
            background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
            color: white;
            padding: 8px 18px;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(45, 80, 22, 0.2);
          }

          .detail-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 1rem 0;
            color: $text-dark;
            line-height: 1.2;

            @media (max-width: 768px) {
              font-size: 2rem;
            }
          }

          .detail-description {
            font-size: 1rem;
            line-height: 1.7;
            color: $text-medium;
            margin: 0;
          }
        }

        .detail-info-card {
          background: white;
          border: 2px solid $warm-beige;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

          .info-card-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid $warm-beige;

            .q-icon {
              color: $pine-green;
            }

            h3 {
              font-size: 1.1rem;
              font-weight: 700;
              margin: 0;
              color: $text-dark;
              letter-spacing: 0.3px;
            }
          }

          .info-card-content {
            p {
              margin: 0 0 8px 0;
              line-height: 1.6;
              color: $text-dark;

              &:last-child {
                margin-bottom: 0;
              }
            }

            .hours-text,
            .address-text,
            .fee-text,
            .contact-text {
              font-size: 0.95rem;
              font-weight: 500;

              a {
                color: $pine-green;
                text-decoration: none;

                &:hover {
                  text-decoration: underline;
                }
              }
            }

            .landmark-text {
              font-size: 0.85rem;
              color: $text-medium;
              font-style: italic;
            }
          }
        }

        .detail-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 30px;

          .detail-tag {
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
            padding: 8px 16px;
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(45, 80, 22, 0.2);
          }
        }

        .detail-actions {
          .full-width {
            width: 100%;
            margin-bottom: 15px;
            font-weight: 700;
            font-size: 1rem;
            padding: 16px 40px;
            background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
            letter-spacing: 0.5px;
          }

          .secondary-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;

            .q-btn {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
</style>