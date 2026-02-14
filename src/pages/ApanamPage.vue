<template>
  <q-page class="apanam-page">
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
          <h1 class="hero-title">APANAM - Point to Point Navigation</h1>
          <p class="hero-description">Plan your route between any two points in Baguio City using the jeepney system. We teach you how to navigate, not track vehicles!</p>
        </div>
      </div>
    </section>

    <!-- MAIN FEATURE SECTION (Section 2) -->
    <section class="navigation-section bg-grey-1">
      <div class="container">
        <div class="navigation-wrapper">
          <div class="navigation-content">
            <div class="text-overline text-primary q-mb-sm">Plan Your Route</div>
            
            <div class="row q-col-gutter-lg">
              <div class="col-md-6 col-12">
                <div class="info-section">
                  <h3 class="text-h5 text-weight-bold text-primary q-mb-lg">How APANAM Works</h3>
                  <p class="text-body1 q-mb-md">
                    APANAM helps you navigate Baguio City by showing you which jeepneys to take 
                    and how to get to their terminals. Our system focuses on teaching you the 
                    route rather than tracking vehicles in real-time.
                  </p>
                  
                  <div class="q-mt-lg">
                    <q-list>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="location_on" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Input your starting point and destination</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="directions_bus" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>See available jeepney options</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="help_outline" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Get step-by-step instructions on how to get there</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </div>
              
              <div class="col-md-6 col-12">
                <div class="frosted-glass-card q-pa-lg">
                  <h4 class="text-primary text-weight-bold q-mb-lg">Enter Your Locations</h4>
                  
                  <div class="q-mb-md">
                    <q-select
                      filled
                      v-model="fromLocation"
                      :options="locationOptions"
                      option-label="label"
                      option-value="value"
                      label="Starting Point Location"
                      placeholder="Where are you now?"
                      @update:model-value="onFromLocationChange"
                      class="q-mb-sm"
                    >
                      <template v-slot:prepend>
                        <q-icon name="location_on" color="primary" />
                      </template>
                    </q-select>
                    
                    <q-input
                      v-if="fromLocation && fromLocation.value === 'other'"
                      filled
                      v-model="customFromLocation"
                      label="Enter Custom Location"
                      placeholder="Type your starting location"
                      class="q-mb-sm"
                    />
                    
                    <q-select
                      filled
                      v-model="toLocation"
                      :options="locationOptions"
                      option-label="label"
                      option-value="value"
                      label="Desired End Point Location"
                      placeholder="Where do you want to go?"
                      @update:model-value="onToLocationChange"
                    >
                      <template v-slot:prepend>
                        <q-icon name="location_searching" color="primary" />
                      </template>
                    </q-select>
                    
                    <q-input
                      v-if="toLocation && toLocation.value === 'other'"
                      filled
                      v-model="customToLocation"
                      label="Enter Custom Destination"
                      placeholder="Type your destination"
                      class="q-mb-sm"
                    />
                  </div>
                  
                  <q-btn
                    label="Start Navigation!"
                    color="primary"
                    class="full-width"
                    :disable="!fromLocation || !toLocation"
                    @click="findRoutes"
                    :loading="isLoadingOptions"
                  >
                    <template v-slot:loading>
                      <q-spinner-facebook />
                      Finding routes...
                    </template>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- JEEPNEY OPTIONS SECTION (Section 3) -->
    <section v-if="filteredOptions.length > 0" class="options-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h3 class="text-h4 text-weight-bold text-primary">Available Jeepney Options</h3>
          <p class="text-body1">Choose from the available routes that connect your start and end points</p>
        </div>
        
        <div ref="optionsSection" class="options-grid">
          <q-card
            v-for="option in filteredOptions"
            :key="option.id"
            class="option-card q-ma-sm"
            @click="selectOption(option)"
          >
            <q-card-section>
              <div class="row items-center no-wrap">
                <div class="col">
                  <div class="text-h6 text-primary">{{ option.routeName }}</div>
                  <div class="text-subtitle2">From: {{ option.terminalStart }}</div>
                  <div class="text-subtitle2">To: {{ option.terminalEnd }}</div>
                </div>
                <div class="col-auto">
                  <q-badge color="primary" class="q-mr-sm">
                    ₱{{ option.fare }}
                  </q-badge>
                  <q-badge color="secondary">
                    {{ option.estimatedDuration }} min
                  </q-badge>
                </div>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-actions>
              <q-btn flat color="primary" @click="selectOption(option)">View Details</q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </section>

    <!-- NAVIGATION TUTORIAL SECTION (Section 4) -->
    <section v-if="selectedOption" class="tutorial-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h3 class="text-h4 text-weight-bold text-primary">How to Get There</h3>
          <p class="text-body1">Follow these steps to reach your destination using the {{ selectedOption.routeName }} jeepney</p>
        </div>
        
        <div class="row">
          <div class="col-md-8 col-12 q-mb-lg">
            <div class="navigation-steps q-pa-lg">
              <q-stepper
                v-model="currentStep"
                vertical
                color="primary"
                animated
              >
                <q-step
                  :name="1"
                  title="Go to Starting Point"
                  icon="location_on"
                  :done="currentStep > 1"
                >
                  Go to your starting location: {{ selectedFromLocation.label }}
                  <q-stepper-navigation>
                    <q-btn @click="nextStep" color="primary" label="Continue" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="2"
                  title="Reach Jeepney Terminal"
                  icon="directions_bus"
                  :done="currentStep > 2"
                >
                  Walk to {{ selectedOption.terminalStart }} terminal
                  <q-stepper-navigation>
                    <q-btn @click="nextStep" color="primary" label="Continue" />
                    <q-btn @click="prevStep" flat color="primary" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="3"
                  title="Take {{ selectedOption.routeName }}"
                  icon="local_shipping"
                  :done="currentStep > 3"
                >
                  Take the {{ selectedOption.routeName }} jeepney from {{ selectedOption.terminalStart }} to {{ selectedOption.terminalEnd }}
                  <p class="q-mt-sm">Fare: ₱{{ selectedOption.fare }}</p>
                  <p>Duration: {{ selectedOption.estimatedDuration }} minutes</p>
                  <p class="text-italic">Tip: Look for jeepneys with "{{ selectedOption.routeName }}" signage</p>
                  <q-stepper-navigation>
                    <q-btn @click="nextStep" color="primary" label="Continue" />
                    <q-btn @click="prevStep" flat color="primary" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>

                <q-step
                  :name="4"
                  title="Arrive at Destination"
                  icon="location_city"
                >
                  From {{ selectedOption.terminalEnd }}, walk to your destination: {{ selectedToLocation.label }}
                  <q-stepper-navigation>
                    <q-btn @click="resetSelection" color="primary" label="Start New Route" />
                    <q-btn @click="prevStep" flat color="primary" label="Back" class="q-ml-sm" />
                  </q-stepper-navigation>
                </q-step>
              </q-stepper>
            </div>
          </div>
          <div class="col-md-4 col-12">
            <div class="map-container">
              <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQS SECTION (Section 5) -->
    <section class="faqs-section bg-white q-py-xl">
      <div class="container">
        <FAQSection />
      </div>
    </section>

    <!-- FOOTER SECTION (Section 6) -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'
import fallbackImage from '../assets/2.png'

export default defineComponent({
  name: 'ApanamPage',
  components: {
    FAQSection,
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const optionsSection = ref(null)
    const fromLocation = ref(null)
    const toLocation = ref(null)
    const customFromLocation = ref('')
    const customToLocation = ref('')
    const isLoadingOptions = ref(false)
    const allJeepneyOptions = ref([])
    const filteredOptions = ref([])
    const selectedOption = ref(null)
    const currentStep = ref(1)
    const heroImageUrl = ref(fallbackImage)
    const map = ref(null)

    // Location options
    const locationOptions = [
      { label: 'SM Baguio', value: 'sm', coords: [16.4122, 120.5948] },
      { label: 'Burnham Park', value: 'burnham', coords: [16.4178, 120.6012] },
      { label: 'Session Road', value: 'session', coords: [16.4145, 120.5972] },
      { label: 'University of Baguio', value: 'ub', coords: [16.4111, 120.6005] },
      { label: 'Saint Louis University', value: 'slu', coords: [16.4133, 120.5967] },
      { label: 'Good Shepherd Convent', value: 'good-shepherd', coords: [16.4196, 120.604] },
      { label: 'Tam-awan Village', value: 'tam-awan', coords: [16.4231, 120.5889] },
      { label: 'Lourdes Grotto', value: 'lourdes-grotto', coords: [16.4253, 120.5972] },
      { label: 'PMA (Philippine Military Academy)', value: 'pma', coords: [16.3928, 120.5962] },
      { label: 'Other', value: 'other' },
    ]

    const selectedFromLocation = ref(null)
    const selectedToLocation = ref(null)

    const fetchHeroImage = async () => {
      try {
        console.log('[ApanamPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'apanam')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[ApanamPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[ApanamPage] No hero image found in Firestore, using fallback')
        }
      } catch (error) {
        console.error('[ApanamPage] Error fetching hero image:', error)
      }
    }

    const fetchJeepneyOptions = async () => {
      isLoadingOptions.value = true
      try {
        console.log('[ApanamPage] Fetching jeepney options from Firebase...')
        const optionsQuery = query(collection(db, 'jeepneyOptions'), where('isActive', '==', true))
        const querySnapshot = await getDocs(optionsQuery)
        allJeepneyOptions.value = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        console.log('[ApanamPage] Loaded jeepney options:', allJeepneyOptions.value.length)
      } catch (error) {
        console.error('[ApanamPage] Error fetching jeepney options:', error)
        console.log('[ApanamPage] Using fallback default options')
        allJeepneyOptions.value = getDefaultJeepneyOptions()
        $q.notify({
          message: 'Using default jeepney routes',
          color: 'info',
          icon: 'info',
          position: 'top',
        })
      } finally {
        isLoadingOptions.value = false
      }
    }

    const getDefaultJeepneyOptions = () => {
      return [
        {
          id: 'route-1',
          routeName: 'Route 1',
          terminalStart: 'SM Baguio Terminal',
          terminalEnd: 'Burnham Park Terminal',
          fare: 15,
          estimatedDuration: 25,
          isActive: true,
        },
        {
          id: 'route-2',
          routeName: 'Route 2',
          terminalStart: 'Session Road Terminal',
          terminalEnd: 'Lakeside Terminal',
          fare: 20,
          estimatedDuration: 30,
          isActive: true,
        },
        {
          id: 'route-3',
          routeName: 'Route 3',
          terminalStart: 'Market Market Terminal',
          terminalEnd: 'Mines View Terminal',
          fare: 18,
          estimatedDuration: 28,
          isActive: true,
        },
      ]
    }

    const findRoutes = () => {
      if (!fromLocation.value || !toLocation.value) {
        $q.notify({
          message: 'Please select both starting and ending locations',
          color: 'warning',
          icon: 'warning',
          position: 'top',
        })
        return
      }

      // Filter options based on selected locations
      filteredOptions.value = allJeepneyOptions.value.filter(option => {
        const fromMatch = selectedFromLocation.value?.coords && 
          (Math.abs(option.startCoords[0] - selectedFromLocation.value.coords[0]) < 0.01 &&
           Math.abs(option.startCoords[1] - selectedFromLocation.value.coords[1]) < 0.01)
        
        const toMatch = selectedToLocation.value?.coords &&
          (Math.abs(option.endCoords[0] - selectedToLocation.value.coords[0]) < 0.01 &&
           Math.abs(option.endCoords[1] - selectedToLocation.value.coords[1]) < 0.01)
        
        return fromMatch && toMatch
      })

      if (filteredOptions.value.length === 0) {
        $q.notify({
          message: 'No routes found for the selected locations. Try different locations.',
          color: 'info',
          icon: 'info',
          position: 'top',
        })
      }

      // Scroll to options section
      if (optionsSection.value) {
        optionsSection.value.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const selectOption = (option) => {
      selectedOption.value = option
      currentStep.value = 1
      
      // Initialize map
      setTimeout(() => {
        if (document.getElementById('map')) {
          if (map.value) {
            map.value.remove()
          }
          map.value = L.map('map').setView([16.4122, 120.5948], 13)
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map.value)
          
          // Add markers for start and end locations
          if (selectedFromLocation.value?.coords) {
            L.marker(selectedFromLocation.value.coords).addTo(map.value)
              .bindPopup(selectedFromLocation.value.label)
          }
          
          if (selectedToLocation.value?.coords) {
            L.marker(selectedToLocation.value.coords).addTo(map.value)
              .bindPopup(selectedToLocation.value.label)
          }
        }
      }, 100)
    }

    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value++
      }
    }

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--
      }
    }

    const resetSelection = () => {
      selectedOption.value = null
      currentStep.value = 1
      filteredOptions.value = []
      fromLocation.value = null
      toLocation.value = null
      customFromLocation.value = ''
      customToLocation.value = ''
      selectedFromLocation.value = null
      selectedToLocation.value = null
      
      if (map.value) {
        map.value.remove()
        map.value = null
      }
    }

    const onFromLocationChange = (val) => {
      if (val) {
        selectedFromLocation.value = val
      }
    }

    const onToLocationChange = (val) => {
      if (val) {
        selectedToLocation.value = val
      }
    }

    // Watch for changes in custom location inputs
    watch(customFromLocation, (newVal) => {
      if (fromLocation.value && fromLocation.value.value === 'other') {
        selectedFromLocation.value = { label: newVal, value: 'other', coords: null }
      }
    })

    watch(customToLocation, (newVal) => {
      if (toLocation.value && toLocation.value.value === 'other') {
        selectedToLocation.value = { label: newVal, value: 'other', coords: null }
      }
    })

    onMounted(async () => {
      await fetchHeroImage()
      await fetchJeepneyOptions()
      
      // Initialize map if there's a selected option
      if (selectedOption.value && document.getElementById('map')) {
        map.value = L.map('map').setView([16.4122, 120.5948], 13)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map.value)
      }
    })

    onUnmounted(() => {
      if (map.value) {
        map.value.remove()
      }
    })

    return {
      fromLocation,
      toLocation,
      customFromLocation,
      customToLocation,
      isLoadingOptions,
      allJeepneyOptions,
      filteredOptions,
      selectedOption,
      currentStep,
      heroImageUrl,
      locationOptions,
      optionsSection,
      selectedFromLocation,
      selectedToLocation,
      findRoutes,
      selectOption,
      nextStep,
      prevStep,
      resetSelection,
      onFromLocationChange,
      onToLocationChange,
    }
  },
})
</script>

<style scoped>
.apanam-page {
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

.navigation-section {
  padding: 3rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.frosted-glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  height: 100%;
}

.options-section {
  background-color: #F5F5F5;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.option-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #2E5D3E;
}

.option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.navigation-steps {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tutorial-section {
  background-color: #F5F5F5;
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

.map-container {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>