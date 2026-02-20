<template>
  <q-page class="aramidem-page bg-grey-1">
    <!-- HERO SECTION -->
    <section class="hero-section" :style="{ backgroundImage: `url(${heroImageUrl})` }">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">ARAMIDEM - Events</h1>
          <p class="hero-description">Discover upcoming events in Baguio City with transportation details and navigation instructions.</p>
        </div>
      </div>
    </section>

    <!-- FEATURED EVENTS SECTION -->
    <section class="featured-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">
            <q-icon name="star" color="amber" size="32px" class="q-mr-sm" />
            Top Events
          </h2>
          <p class="text-body1 text-grey-7">Don't miss these featured events happening this month</p>
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-hourglass color="primary" size="60px" />
          <p class="q-mt-md text-grey-7">Loading featured events...</p>
        </div>

        <div v-else-if="featuredEvents.length === 0" class="text-center q-pa-xl">
          <q-icon name="event_busy" size="80px" color="grey-5" />
          <p class="text-h6 text-grey-7 q-mt-md">No featured events at the moment</p>
          <p class="text-body2 text-grey-6">Check back soon for exciting events!</p>
        </div>

        <div v-else class="featured-grid">
          <q-card
            v-for="event in featuredEvents"
            :key="event.id"
            class="featured-card cursor-pointer"
            @click="viewEventDetails(event)"
          >
            <q-img
              :src="event.imageUrl || '~assets/event-default.jpg'"
              spinner-color="primary"
              class="featured-image"
            >
              <q-badge color="amber" text-color="white" class="featured-badge">
                <q-icon name="star" size="xs" class="q-mr-xs" /> Featured
              </q-badge>
            </q-img>
            <q-card-section>
              <div class="text-h5 text-weight-bold text-primary q-mb-sm">{{ event.name }}</div>
              <div class="row items-center q-mb-sm">
                <q-icon name="event" color="primary" size="sm" class="q-mr-sm" />
                <span>{{ formatDate(event.startDate) }}</span>
              </div>
              <div class="row items-center">
                <q-icon name="schedule" color="secondary" size="sm" class="q-mr-sm" />
                <span>{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
              </div>
              <div class="row items-center q-mt-sm">
                <q-icon name="location_on" color="grey-7" size="sm" class="q-mr-sm" />
                <span class="text-grey-7">{{ event.location }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- CALENDAR & EVENTS SECTION -->
    <section class="calendar-section bg-grey-1 q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">Event Calendar 2026</h2>
          <p class="text-body1 text-grey-7">Click on highlighted dates to view events</p>
        </div>

        <div class="row q-col-gutter-lg">
          <!-- Calendar -->
          <div class="col-12 col-md-5">
            <q-card class="calendar-card">
              <q-card-section class="bg-primary text-white">
                <div class="row items-center justify-between">
                  <q-btn flat dense round icon="chevron_left" color="white" @click="previousMonth" />
                  <div class="text-h5 text-weight-bold">
                    {{ currentMonthName }} {{ currentYear }}
                  </div>
                  <q-btn flat dense round icon="chevron_right" color="white" @click="nextMonth" />
                </div>
              </q-card-section>

              <q-card-section class="q-pa-md">
                <!-- Year Selector -->
                <div class="text-center q-mb-md">
                  <q-select
                    v-model="selectedYear"
                    :options="yearOptions"
                    outlined
                    dense
                    class="year-selector"
                    label="Select Year"
                  />
                </div>

                <!-- Calendar Grid -->
                <div class="calendar-grid">
                  <div class="calendar-header">
                    <div v-for="day in weekDays" :key="day" class="calendar-day-header">
                      {{ day }}
                    </div>
                  </div>
                  <div class="calendar-days">
                    <div
                      v-for="(day, index) in calendarDays"
                      :key="index"
                      class="calendar-day"
                      :class="{
                        'empty-day': day.isEmpty,
                        'has-event': day.hasEvents,
                        'selected-day': isSelectedDay(day),
                        'today': isToday(day)
                      }"
                      @click="selectDay(day)"
                    >
                      <div class="day-number">{{ day.date }}</div>
                      <div v-if="day.hasEvents" class="event-dots">
                        <div class="event-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Events List -->
          <div class="col-12 col-md-7">
            <q-card class="events-list-card">
              <q-card-section class="bg-secondary text-white">
                <div class="row items-center">
                  <q-icon name="event" size="28px" class="q-mr-sm" />
                  <div class="text-h5 text-weight-bold">
                    {{ selectedDate ? formatDateFull(selectedDate) : 'Select a Date' }}
                  </div>
                </div>
              </q-card-section>

              <q-card-section class="q-pa-md">
                <div v-if="!selectedDate" class="text-center q-pa-xl text-grey-7">
                  <q-icon name="event_available" size="60px" color="grey-5" />
                  <p class="q-mt-md">Click on a highlighted date to view events</p>
                </div>

                <div v-else-if="eventsForSelectedDate.length === 0" class="text-center q-pa-xl text-grey-7">
                  <q-icon name="event_busy" size="60px" color="grey-5" />
                  <p class="q-mt-md">No events scheduled for this day</p>
                </div>

                <div v-else class="events-list">
                  <q-card
                    v-for="event in eventsForSelectedDate"
                    :key="event.id"
                    class="event-item cursor-pointer q-mb-md"
                    @click="viewEventDetails(event)"
                  >
                    <q-card-section horizontal>
                      <q-card-section class="col-4 bg-primary text-white text-center">
                        <div class="text-h3 text-weight-bold">{{ getDay(event.startDate) }}</div>
                        <div class="text-subtitle2">{{ getMonth(event.startDate) }}</div>
                      </q-card-section>
                      <q-card-section class="col-8">
                        <div class="text-h6 text-weight-bold text-primary">{{ event.name }}</div>
                        <div class="text-caption text-grey-7 q-mb-xs">{{ event.location }}</div>
                        <div class="row items-center q-mb-xs">
                          <q-icon name="schedule" color="primary" size="xs" class="q-mr-sm" />
                          <span class="text-caption">{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
                        </div>
                        <q-btn
                          label="View Details"
                          color="primary"
                          size="sm"
                          unelevated
                          @click.stop="viewEventDetails(event)"
                        />
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- ALL EVENTS SECTION -->
    <section class="all-events-section bg-white q-py-xl">
      <div class="container">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold text-primary">All Events</h2>
          <p class="text-body1 text-grey-7">Complete list of upcoming events in Baguio City</p>
        </div>

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner-hourglass color="primary" size="60px" />
          <p class="q-mt-md text-grey-7">Loading all events...</p>
        </div>

        <div v-else-if="events.length === 0" class="text-center q-pa-xl">
          <q-icon name="event_busy" size="80px" color="grey-5" />
          <p class="text-h6 text-grey-7 q-mt-md">No events available</p>
        </div>

        <div v-else class="events-grid">
          <q-card
            v-for="event in events"
            :key="event.id"
            class="event-card cursor-pointer"
            @click="viewEventDetails(event)"
          >
            <q-img
              :src="event.imageUrl || '~assets/event-default.jpg'"
              spinner-color="primary"
              class="event-image"
            />
            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-h6 text-weight-bold text-primary">{{ event.name }}</div>
                <q-badge v-if="event.featured" color="amber" text-color="white">
                  <q-icon name="star" size="xs" />
                </q-badge>
              </div>
              <div class="text-caption text-grey-7 q-mb-sm">{{ event.description }}</div>
              <div class="row items-center q-mb-xs">
                <q-icon name="event" color="primary" size="xs" class="q-mr-sm" />
                <span class="text-caption">{{ formatDate(event.startDate) }}</span>
              </div>
              <div class="row items-center q-mb-xs">
                <q-icon name="schedule" color="secondary" size="xs" class="q-mr-sm" />
                <span class="text-caption">{{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}</span>
              </div>
              <div class="row items-center">
                <q-icon name="location_on" color="grey-7" size="xs" class="q-mr-sm" />
                <span class="text-caption text-grey-7">{{ event.location }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- EVENT DETAILS DIALOG -->
    <q-dialog v-model="showEventDialog" maximized>
      <q-card class="event-details-dialog">
        <q-card-section class="bg-primary text-white">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-weight-bold">{{ selectedEvent?.name }}</div>
              <div class="text-subtitle2">{{ formatDate(selectedEvent?.startDate) }}</div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none" v-if="selectedEvent">
          <q-scroll-area style="height: calc(100vh - 80px)">
            <q-img
              :src="selectedEvent.imageUrl || '~assets/event-default.jpg'"
              spinner-color="primary"
              class="event-detail-image"
            />

            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-8">
                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">About This Event</h4>
                  <p class="text-body1 q-mb-lg">{{ selectedEvent.description || 'No description available.' }}</p>

                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Event Details</h4>
                  <q-list bordered separator>
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
                    <q-item v-if="selectedEvent.organizer">
                      <q-item-section avatar>
                        <q-icon name="person" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Organizer</q-item-label>
                        <q-item-label caption>{{ selectedEvent.organizer }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item v-if="selectedEvent.contactEmail || selectedEvent.contactPhone">
                      <q-item-section avatar>
                        <q-icon name="contact_phone" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Contact</q-item-label>
                        <q-item-label caption>
                          <div v-if="selectedEvent.contactEmail">{{ selectedEvent.contactEmail }}</div>
                          <div v-if="selectedEvent.contactPhone">{{ selectedEvent.contactPhone }}</div>
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <div class="col-12 col-md-4">
                  <h4 class="text-h6 text-weight-bold text-primary q-mb-md">Get Directions</h4>
                  <q-card flat bordered class="q-mb-lg">
                    <q-card-section>
                      <p class="text-body2 q-mb-md">
                        Use our APANAM navigation to get directions to this event location.
                      </p>
                      <q-btn
                        label="Go There"
                        color="primary"
                        icon="navigation"
                        class="full-width"
                        unelevated
                        @click="navigateToEvent(selectedEvent.location)"
                      />
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered>
                    <q-card-section>
                      <h5 class="text-subtitle1 text-weight-bold q-mb-sm">Share Event</h5>
                      <q-btn
                        label="Share"
                        color="secondary"
                        icon="share"
                        class="full-width"
                        outline
                        @click="shareEvent(selectedEvent)"
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

    <!-- FOOTER -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import FooterSection from '../components/Home/FooterSection.vue'
import bakeryImage from '../assets/bakery.png'

export default defineComponent({
  name: 'AramidemPage',
  components: {
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
    const selectedDate = ref(null)
    
    // Calendar state
    const currentDate = ref(new Date(2026, 0, 1)) // Start with January 2026
    const selectedYear = ref(2026)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const yearOptions = [2026, 2027, 2028]

    // Hardcoded Panagbenga 2026 Events (Sample Data)
    const sampleEvents = [
      {
        id: '1',
        name: "Panagbenga Grand Opening Day Parade",
        location: "Panagbenga Park to Melvin Jones Football Grounds",
        startDate: new Date(2026, 1, 1, 8, 0), // Feb 1, 2026, 8:00 AM
        endDate: new Date(2026, 1, 1, 12, 0), // Feb 1, 2026, 12:00 PM
        description: "The official start of the 30th Panagbenga Festival featuring elementary school drum and lyre corps and festive street dancing along Session Road. Theme: 'Blooming Without End' - celebrating the Pearl Anniversary.",
        imageUrl: "",
        featured: true,
        organizer: "BFFFI / Baguio City Government",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '2',
        name: "Panagbenga Market Encounter & Panagbengascapes",
        location: "Juan Luna Drive and Rose Garden, Burnham Park",
        startDate: new Date(2026, 1, 1, 9, 0), // Feb 1, 2026, 9:00 AM
        endDate: new Date(2026, 2, 8, 21, 0), // Mar 8, 2026, 9:00 PM
        description: "A month-long landscaping exhibition and trade fair featuring floral designs, local handicrafts, and food stalls.",
        imageUrl: "",
        featured: true,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '3',
        name: "Cup of Joe: Stardust Philippine Tour 2026",
        location: "University of Baguio Gym",
        startDate: new Date(2026, 1, 6, 19, 0), // Feb 6, 2026, 7:00 PM
        endDate: new Date(2026, 1, 6, 23, 0), // Feb 6, 2026, 11:00 PM
        description: "A special concert by the popular Baguio-based OPM band Cup of Joe as part of the Panagbenga Festival's musical highlights.",
        imageUrl: "",
        featured: true,
        organizer: "Ovation Productions",
        contactEmail: "info@ovationproductions.com",
        contactPhone: "+63 917 123 4567"
      },
      {
        id: '4',
        name: "Floral Fiesta: Bouquet & Dish Garden Competition",
        location: "Melvin Jones Football Grounds",
        startDate: new Date(2026, 1, 7, 9, 0), // Feb 7, 2026, 9:00 AM
        endDate: new Date(2026, 1, 7, 17, 0), // Feb 7, 2026, 5:00 PM
        description: "A school-based competition showcasing the floral arrangement skills of students from various schools in Baguio City.",
        imageUrl: "",
        featured: false,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '5',
        name: "PMA Alumni Homecoming",
        location: "Fort Del Pilar, Baguio City",
        startDate: new Date(2026, 1, 13, 8, 0), // Feb 13, 2026, 8:00 AM
        endDate: new Date(2026, 1, 15, 20, 0), // Feb 15, 2026, 8:00 PM
        description: "An annual tradition where thousands of PMA alumni gather for a weekend of camaraderie and celebration.",
        imageUrl: "",
        featured: false,
        organizer: "Philippine Military Academy (PMA)",
        contactEmail: "alumni@pma.edu.ph",
        contactPhone: "+63 74 442 2031"
      },
      {
        id: '6',
        name: "Handog ng Panagbenga sa Pamilya Baguio",
        location: "Melvin Jones Football Grounds",
        startDate: new Date(2026, 1, 14, 8, 0), // Feb 14, 2026, 8:00 AM
        endDate: new Date(2026, 1, 14, 18, 0), // Feb 14, 2026, 6:00 PM
        description: "A family-oriented Valentine's Day celebration featuring the 'Colours in Bloom' painting competition and the 11th Annual Panagbenga Kite Flying Challenge.",
        imageUrl: "",
        featured: false,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '7',
        name: "Rhythm of the Highlands",
        location: "Melvin Jones Football Grounds",
        startDate: new Date(2026, 1, 15, 15, 0), // Feb 15, 2026, 3:00 PM
        endDate: new Date(2026, 1, 15, 21, 0), // Feb 15, 2026, 9:00 PM
        description: "A dedicated showcase of traditional Cordilleran culture, music, and ethnic dances by indigenous cultural communities.",
        imageUrl: "",
        featured: false,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '8',
        name: "Baguio Spring Festival (Chinese New Year Parade)",
        location: "Session Road to Melvin Jones",
        startDate: new Date(2026, 1, 18, 10, 0), // Feb 18, 2026, 10:00 AM
        endDate: new Date(2026, 1, 18, 14, 0), // Feb 18, 2026, 2:00 PM
        description: "A colorful parade celebrating the Lunar New Year, featuring dragon dances and traditional Chinese-Filipino celebrations.",
        imageUrl: "",
        featured: false,
        organizer: "Baguio Filipino-Chinese Community",
        contactEmail: "info@baguiochinese.org",
        contactPhone: "+63 74 442 3456"
      },
      {
        id: '9',
        name: "Panagbenga Grand Street Dance Parade",
        location: "Panagbenga Park → Session Road → Harrison Road → Melvin Jones",
        startDate: new Date(2026, 1, 28, 8, 0), // Feb 28, 2026, 8:00 AM
        endDate: new Date(2026, 1, 28, 16, 0), // Feb 28, 2026, 4:00 PM
        description: "THE MAIN HIGHLIGHT! A massive parade of dancers in vibrant, flower-inspired costumes performing to the rhythmic Panagbenga hymn.",
        imageUrl: "",
        featured: true,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '10',
        name: "Panagbenga Grand Floral Float Parade",
        location: "Panagbenga Park to Melvin Jones Football Grounds",
        startDate: new Date(2026, 2, 1, 8, 0), // Mar 1, 2026, 8:00 AM
        endDate: new Date(2026, 2, 1, 17, 0), // Mar 1, 2026, 5:00 PM
        description: "The festival's MOST FAMOUS event! Giant floats made entirely of fresh flowers parade through the city streets.",
        imageUrl: "",
        featured: true,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '11',
        name: "Session Road in Bloom",
        location: "Session Road (Entire length closed to traffic)",
        startDate: new Date(2026, 2, 2, 9, 0), // Mar 2, 2026, 9:00 AM
        endDate: new Date(2026, 2, 8, 22, 0), // Mar 8, 2026, 10:00 PM
        description: "Baguio's main thoroughfare transforms into a pedestrian mall with sidewalk cafés, floral installations, and local merchant stalls.",
        imageUrl: "",
        featured: true,
        organizer: "BFFFI / Baguio City Government",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      },
      {
        id: '12',
        name: "Panagbenga Awarding and Closing Ceremonies",
        location: "Melvin Jones Football Grounds",
        startDate: new Date(2026, 2, 8, 16, 0), // Mar 8, 2026, 4:00 PM
        endDate: new Date(2026, 2, 8, 22, 0), // Mar 8, 2026, 10:00 PM
        description: "The official wrap-up featuring the PMA Silent Drill Exhibition, Little Miss Panagbenga pageant, and the 'Flowers in the Sky' Grand Fireworks Display.",
        imageUrl: "",
        featured: true,
        organizer: "BFFFI",
        contactEmail: "info@panagbenga.org",
        contactPhone: "+63 74 442 2772"
      }
    ]

    // Fetch hero image
    const fetchHeroImage = async () => {
      try {
        const docRef = doc(db, 'pagePhotos', 'aramidem')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().imageUrl) {
          heroImageUrl.value = docSnap.data().imageUrl
        }
      } catch (error) {
        console.error('[AramidemPage] Error fetching hero image:', error)
      }
    }

    // Use hardcoded sample events (no Firebase needed)
    const loadEvents = () => {
      events.value = sampleEvents
      loading.value = false
      console.log('[AramidemPage] Loaded', events.value.length, 'sample events')
    }

    // Get featured events
    const featuredEvents = computed(() => {
      return events.value.filter(e => e.featured).slice(0, 3)
    })

    // Get events for selected date
    const eventsForSelectedDate = computed(() => {
      if (!selectedDate.value) return []
      
      // Normalize selected date to start of day
      const selectedDateObj = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), selectedDate.value.getDate())
      
      // Filter events that fall on the selected date (considering start AND end dates)
      return events.value.filter(event => {
        const eventStart = new Date(event.startDate)
        const eventEnd = new Date(event.endDate)
        
        // Normalize event dates
        const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
        const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
        
        // Check if selected date is within event date range
        return selectedDateObj >= eventStartDay && selectedDateObj <= eventEndDay
      })
    })

    // Calendar computed properties
    const currentMonthName = computed(() => {
      return currentDate.value.toLocaleString('default', { month: 'long' })
    })

    const currentYear = computed(() => {
      return currentDate.value.getFullYear()
    })

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startingDay = firstDay.getDay()
      const totalDays = lastDay.getDate()

      const days = []

      // Add empty days for previous month
      for (let i = 0; i < startingDay; i++) {
        days.push({ isEmpty: true })
      }

      // Add days for current month
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day)
        // Normalize to start of day for comparison (avoid timezone issues)
        const checkDate = new Date(year, month, day, 0, 0, 0, 0)
        
        // Check if any event falls on this date (considering start AND end dates)
        const hasEvents = events.value.some(event => {
          const eventStart = new Date(event.startDate)
          const eventEnd = new Date(event.endDate)
          
          // Normalize event dates to start of day
          const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate())
          const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate())
          
          // Check if current day is within event date range
          return checkDate >= eventStartDay && checkDate <= eventEndDay
        })

        days.push({
          date: day,
          hasEvents,
          isEmpty: false,
          fullDate: date
        })
      }

      return days
    })

    // Watch for year changes
    watch(selectedYear, (newYear) => {
      currentDate.value = new Date(newYear, currentDate.value.getMonth(), 1)
    })

    // Methods
    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
    }

    const selectDay = (day) => {
      if (day.isEmpty) return
      selectedDate.value = day.fullDate
    }

    const isSelectedDay = (day) => {
      if (!selectedDate.value || day.isEmpty) return false
      return day.fullDate.toDateString() === selectedDate.value.toDateString()
    }

    const isToday = (day) => {
      if (day.isEmpty) return false
      const today = new Date()
      return day.fullDate.toDateString() === today.toDateString()
    }

    const viewEventDetails = (event) => {
      selectedEvent.value = event
      showEventDialog.value = true
    }

    const navigateToEvent = (location) => {
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
        navigator.clipboard.writeText(window.location.href)
        $q.notify({
          message: 'Event link copied to clipboard!',
          color: 'positive',
          position: 'top'
        })
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateFull = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
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

    onMounted(async () => {
      await fetchHeroImage()
      loadEvents() // Load hardcoded sample events
    })

    return {
      events,
      loading,
      showEventDialog,
      selectedEvent,
      heroImageUrl,
      selectedDate,
      featuredEvents,
      eventsForSelectedDate,
      currentDate,
      selectedYear,
      yearOptions,
      weekDays,
      currentMonthName,
      currentYear,
      calendarDays,
      previousMonth,
      nextMonth,
      selectDay,
      isSelectedDay,
      isToday,
      viewEventDetails,
      navigateToEvent,
      shareEvent,
      formatDate,
      formatDateFull,
      formatTime,
      getDay,
      getMonth
    }
  },
})
</script>

<style scoped>
.aramidem-page {
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Featured Events */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.featured-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.featured-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.featured-image {
  height: 220px;
  position: relative;
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
}

/* Calendar */
.calendar-card {
  border-radius: 16px;
  overflow: hidden;
}

.year-selector {
  width: 150px;
}

.calendar-grid {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f5f5f5;
}

.calendar-day-header {
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: #666;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 60px;
  padding: 8px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  transition: background 0.2s;
  position: relative;
}

.calendar-day:not(.empty-day):hover {
  background: #f0f7f4;
}

.calendar-day.empty-day {
  background: #fafafa;
  cursor: default;
}

.calendar-day.has-event {
  background: #e8f5e9;
}

.calendar-day.selected-day {
  background: #4EA96D;
  color: white;
}

.calendar-day.today {
  border: 2px solid #4EA96D;
}

.day-number {
  font-weight: 500;
  font-size: 14px;
}

.event-dots {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4EA96D;
}

.selected-day .event-dot {
  background: white;
}

/* Events List */
.events-list-card {
  border-radius: 16px;
  overflow: hidden;
}

.event-item {
  border-radius: 12px;
  border-left: 4px solid #4EA96D;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* All Events Grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.event-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.event-image {
  height: 180px;
}

/* Event Details Dialog */
.event-details-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.event-detail-image {
  height: 350px;
}

.bg-primary {
  background-color: #4EA96D !important;
}

.bg-secondary {
  background-color: #8D6E63 !important;
}

.text-primary {
  color: #4EA96D !important;
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

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .featured-grid {
    grid-template-columns: 1fr;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style>
