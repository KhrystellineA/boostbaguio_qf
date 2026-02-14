<template>
  <q-page class="aramidem-page">
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
          <h1 class="hero-title">ARAMIDEM - Events</h1>
          <p class="hero-description">Discover upcoming events in Baguio City with transportation details and navigation instructions.</p>
        </div>
      </div>
    </section>

    <!-- EXTENDED HERO SECTION (Section 2) -->
    <section class="extended-hero bg-white">
      <div class="container">
        <div class="row items-center">
          <div class="col-md-6 col-12 q-pa-xl">
            <h2 class="text-h4 text-weight-bold text-primary q-mb-lg">Baguio's Event Scene</h2>
            <p class="text-body1 q-mb-md">
              Baguio City hosts numerous festivals, concerts, exhibitions, and community events throughout the year. 
              From the famous Panagbenga Festival to local art exhibitions, our ARAMIDEM feature keeps you informed 
              about what's happening in the city.
            </p>
            <p class="text-body1 q-mb-lg">
              We provide essential event information along with transportation details to help you navigate to events seamlessly.
            </p>
            <div class="q-gutter-sm">
              <q-chip square color="primary" text-color="white">Festivals</q-chip>
              <q-chip square color="secondary" text-color="white">Concerts</q-chip>
              <q-chip square color="primary" text-color="white">Exhibitions</q-chip>
              <q-chip square color="secondary" text-color="white">Community Events</q-chip>
            </div>
          </div>
          <div class="col-md-6 col-12 q-pa-xl">
            <div class="image-placeholder bg-grey-3 q-pa-xl rounded-borders">
              <q-icon name="event" size="64px" color="grey-6"/>
              <div class="text-center q-mt-md">Event Highlights</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EVENT HIGHLIGHTS SECTION (Section 3) -->
    <section class="highlights-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Top Events of the Month</h2>
          <p class="text-body1">Featured events and sponsored listings</p>
        </div>

        <div class="highlights-grid">
          <q-card
            v-for="event in featuredEvents"
            :key="event.id"
            class="highlight-card q-ma-sm"
            @click="viewEventDetails(event)"
          >
            <q-img
              :src="event.imageUrl || '~assets/event-default.jpg'"
              spinner-color="primary"
              class="highlight-image"
            />
            <q-card-section>
              <div class="text-h6 text-primary">{{ event.name }}</div>
              <div class="text-subtitle2">{{ formatDate(event.startDate) }}</div>
              <div class="row items-center q-mt-md">
                <q-icon name="location_on" color="primary" size="xs" class="q-mr-sm" />
                <span>{{ event.location }}</span>
              </div>
              <div class="row items-center q-mt-sm">
                <q-icon name="event_available" color="secondary" size="xs" class="q-mr-sm" />
                <span>{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- MONTHLY EVENTS SECTION (Section 4) -->
    <section class="monthly-section bg-white q-py-xl">
      <div class="container">
        <div class="row">
          <div class="col-md-4 col-12 q-pa-lg">
            <div class="calendar-section">
              <q-calendar
                v-model:selected="selectedDate"
                view="month"
                :locale="locale"
                :events="eventDates"
                :event-start="eventStart"
                :event-end="eventEnd"
                class="calendar"
                @click:date="onDateClick"
              />
            </div>
          </div>
          <div class="col-md-8 col-12 q-pa-lg">
            <div class="events-stack">
              <q-card
                v-for="event in eventsForSelectedDate"
                :key="event.id"
                class="event-card q-mb-md"
                @click="viewEventDetails(event)"
              >
                <q-card-section horizontal>
                  <q-card-section class="col-2 bg-primary text-white">
                    <div class="text-h4 text-weight-bold">{{ getDay(event.startDate) }}</div>
                    <div class="text-subtitle1">{{ getMonth(event.startDate) }}</div>
                  </q-card-section>
                  <q-card-section class="col-10">
                    <div class="text-h6 text-primary">{{ event.name }}</div>
                    <div class="text-subtitle2">{{ event.location }}</div>
                    <div class="row items-center q-mt-sm">
                      <q-icon name="schedule" color="primary" size="xs" class="q-mr-sm" />
                      <span>{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
                    </div>
                    <q-btn
                      label="View Details"
                      color="primary"
                      size="sm"
                      class="q-mt-sm"
                      @click.stop="viewEventDetails(event)"
                    />
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- EVENT DETAILS SECTIONS (Section 5-6) -->
    <q-dialog v-model="showEventDialog" full-width>
      <q-card v-if="selectedEvent" class="event-details-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ selectedEvent.name }}</div>
              <div class="text-subtitle1">{{ formatDate(selectedEvent.startDate) }}</div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round dense v-close-popup />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-img
            :src="selectedEvent.imageUrl || '~assets/event-default.jpg'"
            spinner-color="primary"
            class="event-teaser-image"
          />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-md-8 col-12">
              <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Event Description</h4>
              <p class="text-body1">{{ selectedEvent.description }}</p>
            </div>
            <div class="col-md-4 col-12">
              <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Event Schedule</h4>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="event" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Date</q-item-label>
                    <q-item-label caption>{{ formatDate(selectedEvent.startDate) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="schedule" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Time</q-item-label>
                    <q-item-label caption>{{ formatTime(selectedEvent.startDate) }} - {{ formatTime(selectedEvent.endDate) }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="location_on" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">Location</q-item-label>
                    <q-item-label caption>{{ selectedEvent.location }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <h4 class="text-h6 text-weight-bold text-primary q-mb-md">How to Get There</h4>
          <div class="row q-col-gutter-lg">
            <div class="col-md-8 col-12">
              <p class="text-body1">
                Use our navigation system to plan your route to {{ selectedEvent.location }}.
              </p>
              <q-btn
                label="Go There"
                color="primary"
                @click="navigateToEvent(selectedEvent.location)"
              />
            </div>
            <div class="col-md-4 col-12">
              <div class="map-placeholder bg-grey-3 q-pa-xl rounded-borders">
                <q-icon name="map" size="48px" color="grey-6"/>
                <div class="text-center q-mt-md">Route Map</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn flat label="Share" color="primary" @click="shareEvent(selectedEvent)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- FAQS SECTION (Section 7) -->
    <section class="faqs-section bg-white q-py-xl">
      <div class="container">
        <h3 class="text-h4 text-weight-bold text-primary text-center q-mb-xl">ARAMIDEM FAQs</h3>
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
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'
import bakeryImage from '../assets/bakery.png'

export default defineComponent({
  name: 'AramidemPage',
  components: {
    FAQSection,
    FooterSection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const events = ref([])
    const loading = ref(true)
    const showEventDialog = ref(false)
    const selectedEvent = ref(null)
    const heroImageUrl = ref(bakeryImage)
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const locale = { days: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_') }

    const faqs = [
      {
        question: 'How do I get directions to an event?',
        answer: 'Click on any event and use the "Go There" button to navigate to the event location using APANAM navigation.'
      },
      {
        question: 'Can I save events for later?',
        answer: 'Yes, premium users can save favorite events and receive reminders before the event date.'
      },
      {
        question: 'How do I share an event?',
        answer: 'Click on an event, then click the "Share" button to share the event details with others.'
      },
      {
        question: 'What if an event is cancelled?',
        answer: 'Event organizers will update the status in our system. We recommend checking the event details closer to the date.'
      }
    ]

    // Filter featured events (top 3)
    const featuredEvents = computed(() => {
      return events.value.slice(0, 3)
    })

    // Get event dates for calendar
    const eventDates = computed(() => {
      return events.value.map(event => new Date(event.startDate).toISOString().split('T')[0])
    })

    // Get events for selected date
    const eventsForSelectedDate = computed(() => {
      if (!selectedDate.value) return []
      return events.value.filter(event => 
        new Date(event.startDate).toISOString().split('T')[0] === selectedDate.value
      )
    })

    const fetchHeroImage = async () => {
      try {
        console.log('[AramidemPage] Fetching hero image from Firestore...')
        const docRef = doc(db, 'pagePhotos', 'aramidem')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
          console.log('[AramidemPage] Hero image loaded:', heroImageUrl.value)
        } else {
          console.log('[AramidemPage] No hero image found in Firestore, using fallback')
        }
      } catch (error) {
        console.error('[AramidemPage] Error fetching hero image:', error)
      }
    }

    const fetchEvents = async () => {
      loading.value = true
      try {
        console.log('[AramidemPage] Fetching events from Firebase...')
        const q = query(collection(db, 'events'), orderBy('startDate', 'asc'))
        const querySnapshot = await getDocs(q)
        events.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('[AramidemPage] Loaded events:', events.value.length)
      } catch (error) {
        console.error('[AramidemPage] Error loading events:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to load events',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }

    const viewEventDetails = (event) => {
      selectedEvent.value = event
      showEventDialog.value = true
    }

    const navigateToEvent = (location) => {
      // Navigate to APANAM with event location as destination
      router.push(`/apanam?start=${encodeURIComponent('Current Location')}&end=${encodeURIComponent(location)}`)
      showEventDialog.value = false
    }

    const shareEvent = (event) => {
      if (navigator.share) {
        navigator.share({
          title: event.name,
          text: `Check out this event in Baguio: ${event.name}`,
          url: window.location.href
        }).catch(console.error)
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href)
        $q.notify({
          message: 'Event link copied to clipboard!',
          color: 'positive',
          position: 'top'
        })
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const getDay = (dateStr) => {
      if (!dateStr) return '00'
      const date = new Date(dateStr)
      return date.getDate().toString().padStart(2, '0')
    }

    const getMonth = (dateStr) => {
      if (!dateStr) return 'JAN'
      const date = new Date(dateStr)
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      return months[date.getMonth()]
    }

    const onDateClick = (date) => {
      selectedDate.value = date.date
    }

    onMounted(async () => {
      await fetchHeroImage()
      await fetchEvents()
    })

    return {
      events,
      loading,
      showEventDialog,
      selectedEvent,
      heroImageUrl,
      selectedDate,
      locale,
      faqs,
      featuredEvents,
      eventDates,
      eventsForSelectedDate,
      viewEventDetails,
      navigateToEvent,
      shareEvent,
      formatDate,
      formatTime,
      getDay,
      getMonth,
      onDateClick,
    }
  },
})
</script>

<style scoped>
.aramidem-page {
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

.highlights-section {
  background-color: #F5F5F5;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.highlight-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #2E5D3E;
}

.highlight-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.highlight-image {
  height: 200px;
  object-fit: cover;
}

.monthly-section {
  background-color: white;
}

.calendar-section {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.events-stack {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.event-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #8D6E63;
}

.event-card:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.event-details-dialog {
  max-width: 90vw;
  max-height: 90vh;
}

.event-teaser-image {
  height: 300px;
  object-fit: cover;
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

.map-placeholder {
  height: 200px;
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
  
  .highlights-grid {
    grid-template-columns: 1fr;
  }
  
  .row {
    flex-direction: column;
  }
  
  .col-md-4, .col-md-8 {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>