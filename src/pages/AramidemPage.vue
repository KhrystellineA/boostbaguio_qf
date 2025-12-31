<template>
  <q-page class="aramidem-page">
    <section class="hero-image-header" :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${heroImageUrl})` }">
      <div class="hero-overlay-content">
        <h1 class="brand-name">ARAMIDEM</h1>
        <p class="brand-tagline">Check out what's happening in Baguio City!</p>
      </div>
    </section>

    <section class="hero-info-bar">
      <div class="container info-flex-container">
        <div class="info-left-col">
          <h2 class="main-headline">DISCOVER EXCITING EVENTS IN BAGUIO CITY</h2>
        </div>
        <div class="info-right-col">
          <p class="sub-text">
            Stay updated on the latest festivals and events in happening in Baguio. 
            Our platform provides you with essential info to make your event experience seamless.
          </p>
          <q-btn 
            label="Explore" 
            unelevated 
            class="explore-pill-btn" 
            @click="scrollToSection('events')" 
          />
        </div>
      </div>
    </section>

    <section id="events" class="events-section">
      <div class="container">
        <div class="section-header text-center">
          <div class="text-overline">ARAMIDEM</div>
          <h2 class="section-title">TOP EVENTS OF THE MONTH</h2>
        </div>

        <div v-if="loading" class="row justify-center q-pa-xl">
          <div class="text-center">
            <q-spinner-hourglass color="white" size="50px" />
            <p class="text-white q-mt-md">Loading events...</p>
          </div>
        </div>

        <div v-else-if="topEvents.length === 0" class="no-events-state">
          <q-icon name="event_busy" size="80px" color="white" />
          <h3 class="text-white q-mt-md">No Events This Month</h3>
          <p class="text-white" style="opacity: 0.8">Check back soon for new events!</p>
        </div>

        <div v-else class="events-grid">
          <div 
            v-for="event in topEvents" 
            :key="event.id" 
            class="event-card"
            @click="viewEventDetails(event)"
          >
            <div class="event-image-wrapper">
              <img 
                v-if="event.imageUrl" 
                :src="event.imageUrl" 
                :alt="event.title"
                class="event-image" 
              />
              <div v-else class="event-placeholder">
                <q-icon name="event" size="64px" color="grey-4" />
              </div>
              
              <div class="event-date-badge">
                <div class="date-day">{{ getDay(event.startDate) }}</div>
                <div class="date-month">{{ getMonth(event.startDate) }}</div>
              </div>

              <div class="event-status-badge" :class="`status-${event.status.toLowerCase()}`">
                {{ event.status }}
              </div>
            </div>

            <div class="event-content">
              <h3 class="event-title">{{ event.title }}</h3>
              
              <p class="event-description">
                {{ truncateText(event.description, 100) }}
              </p>

              <a href="#" class="event-link" @click.prevent="viewEventDetails(event)">
                Learn more →
              </a>
            </div>
          </div>
        </div>

        <div v-if="!loading && topEvents.length > 0" class="text-center q-mt-xl">
          <q-btn
            label="View All"
            unelevated
            color="white"
            text-color="primary"
            padding="10px 35px"
            class="view-all-btn"
            @click="scrollToSection('calendar')"
          />
        </div>
      </div>
    </section>

    <section id="calendar" class="calendar-section">
      <div class="container">
        <div class="calendar-grid">
          <div class="calendar-widget">
            <div class="calendar-header">
              <h3>{{ currentMonth }}</h3>
              <div class="month-nav">
                <q-btn flat dense icon="chevron_left" @click="previousMonth" />
                <q-btn flat dense icon="chevron_right" @click="nextMonth" />
              </div>
            </div>
            <div class="calendar-body">
              <div class="calendar-days">
                <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day" class="day-header">
                  {{ day }}
                </div>
              </div>
              <div class="calendar-dates">
                <div 
                  v-for="(date, index) in calendarDates" 
                  :key="index"
                  class="calendar-date"
                  :class="{ 
                    'has-event': hasEvent(date),
                    'today': isToday(date),
                    'other-month': !isCurrentMonth(date)
                  }"
                  @click="selectDate(date)"
                >
                  {{ date ? date.getDate() : '' }}
                </div>
              </div>
            </div>
          </div>

          <div class="events-list">
            <div v-if="selectedDateEvents.length === 0" class="no-events-message">
              <p>No events scheduled for this month</p>
            </div>
            <div 
              v-for="event in selectedDateEvents" 
              :key="event.id"
              class="event-list-item"
            >
              <div 
                class="events-list-header"
                @click="toggleEventExpand(event.id)"
              >
                <h3>{{ event.title }}</h3>
                <q-icon 
                  :name="expandedEvents.includes(event.id) ? 'expand_less' : 'expand_more'" 
                  size="24px" 
                />
              </div>
              <p class="event-list-date">{{ event.location }}</p>
              
              <div v-if="expandedEvents.includes(event.id)" class="event-list-details">
                <p class="event-list-description">{{ event.description }}</p>
                <div class="event-list-meta">
                  <div class="meta-row">
                    <q-icon name="event" size="16px" />
                    <span>{{ formatDateRange(event.startDate, event.endDate) }}</span>
                  </div>
                  <div class="meta-row" v-if="event.startTime">
                    <q-icon name="access_time" size="16px" />
                    <span>{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</span>
                  </div>
                </div>
                <q-btn
                  label="View Details"
                  outline
                  color="primary"
                  size="sm"
                  class="q-mt-sm"
                  @click="viewEventDetails(event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-event-section">
      <div class="container">
        <div v-if="featuredEvent" class="featured-grid">
          <div class="featured-content">
            <div class="featured-overline">EVENTS</div>
            <h2 class="featured-title">{{ featuredEvent.title.toUpperCase() }}</h2>
            <p class="featured-description">
              {{ featuredEvent.description || 'Join us for this amazing event in Baguio City!' }}
            </p>
            
            <div class="featured-details">
              <div class="detail-item">
                <h4>EVENT DATES</h4>
                <p>{{ formatDateRange(featuredEvent.startDate, featuredEvent.endDate) }}{{ featuredEvent.startTime ? ` - ${formatTime(featuredEvent.startTime)}` : '' }}</p>
              </div>
              
              <div class="detail-item" v-if="featuredEvent.organizer">
                <h4>ORGANIZED BY</h4>
                <p>{{ featuredEvent.organizer }}</p>
              </div>

              <div class="detail-item">
                <h4>LOCATION</h4>
                <p>{{ featuredEvent.location }}</p>
              </div>
            </div>

            <q-btn
              label="View Event Details"
              unelevated
              color="white"
              text-color="primary"
              size="lg"
              padding="12px 35px"
              class="q-mt-lg"
              @click="viewEventDetails(featuredEvent)"
            />
          </div>

          <div class="featured-image">
            <div v-if="featuredEvent.imageUrl" class="image-wrapper">
              <img :src="featuredEvent.imageUrl" :alt="featuredEvent.title" class="featured-img" />
            </div>
            <div v-else class="image-placeholder">
              <q-icon name="image" size="80px" color="grey-4" />
            </div>
          </div>
        </div>

        <div v-else class="featured-grid">
          <div class="featured-content">
            <div class="featured-overline">EVENTS</div>
            <h2 class="featured-title">STAY TUNED FOR UPCOMING EVENTS!</h2>
            <p class="featured-description">
              Check back soon for exciting events happening in Baguio City.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="schedule-section">
      <div class="container">
        <div class="schedule-header">
          <h2 class="schedule-title">SCHEDULE</h2>
          <p class="schedule-subtitle">Join us for an exciting lineup of events happening this weekend in Baguio City!</p>
        </div>

        <div class="schedule-filters">
          <q-btn 
            v-for="filter in scheduleFilters" 
            :key="filter"
            :label="filter"
            :unelevated="selectedFilter === filter"
            :outline="selectedFilter !== filter"
            class="filter-btn"
            @click="selectedFilter = filter"
          />
        </div>

        <div class="schedule-list">
          <div v-if="scheduleItems.length === 0" class="no-schedule-message">
            <p>No upcoming events scheduled</p>
          </div>
          <div 
            v-for="event in scheduleItems" 
            :key="event.id"
            class="schedule-item"
          >
            <div class="schedule-time">
              <div class="time-display">{{ event.startTime ? event.startTime.split(':')[0] : '--' }}</div>
              <div class="time-period">{{ event.startTime ? (parseInt(event.startTime.split(':')[0]) >= 12 ? 'pm' : 'am') : '--' }}</div>
            </div>

            <div class="schedule-icon">
              <div class="icon-wrapper">
                <q-icon name="event" size="24px" />
              </div>
            </div>

            <div class="schedule-details">
              <h3 class="schedule-event-title">{{ event.title }}</h3>
              <p class="schedule-event-location">
                <q-icon name="place" size="16px" />
                {{ event.location }}
              </p>
            </div>

            <div class="schedule-action">
              <q-btn 
                flat
                dense
                round
                icon="place"
                size="sm"
                @click="getDirections(event.location)"
              >
                <q-tooltip>View on Map</q-tooltip>
              </q-btn>
              <q-btn 
                label="Explore" 
                outline 
                color="primary"
                size="sm"
                class="explore-btn"
                @click="exploreEvent(event)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <q-dialog v-model="showEventDialog" maximized transition-show="slide-up">
      <q-card class="event-detail-card">
        <q-bar class="bg-primary text-white">
          <q-space />
          <q-btn dense flat icon="close" @click="showEventDialog = false">
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section class="event-detail-hero" v-if="selectedEvent">
          <div class="event-detail-image-wrapper">
            <img 
              v-if="selectedEvent.imageUrl" 
              :src="selectedEvent.imageUrl" 
              :alt="selectedEvent.title"
              class="event-detail-image"
            />
            <div v-else class="event-detail-placeholder">
              <q-icon name="event" size="120px" color="grey-4" />
            </div>
          </div>
          
          <div class="event-detail-overlay">
            <div class="container">
              <q-badge 
                :color="getStatusColor(selectedEvent.status)" 
                class="q-mb-md"
                style="font-size: 0.85rem; padding: 8px 16px"
              >
                {{ selectedEvent.status }}
              </q-badge>
              <h2 class="event-detail-title">{{ selectedEvent.title }}</h2>
              <div class="event-detail-meta">
                <div class="meta-item">
                  <q-icon name="place" size="20px" />
                  <span>{{ selectedEvent.location }}</span>
                </div>
                <div class="meta-item">
                  <q-icon name="event" size="20px" />
                  <span>{{ formatDateRange(selectedEvent.startDate, selectedEvent.endDate) }}</span>
                </div>
                <div class="meta-item" v-if="selectedEvent.startTime">
                  <q-icon name="access_time" size="20px" />
                  <span>{{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="event-detail-body" v-if="selectedEvent">
          <div class="container">
            <div class="detail-grid">
              <div class="detail-main">
                <h3 class="detail-section-title">About This Event</h3>
                <p class="event-full-description">{{ selectedEvent.description || 'No description available.' }}</p>

                <div v-if="selectedEvent.organizer" class="q-mt-lg">
                  <h3 class="detail-section-title">Organizer</h3>
                  <div class="organizer-card">
                    <q-icon name="business" size="32px" color="primary" />
                    <div class="organizer-info">
                      <div class="organizer-name">{{ selectedEvent.organizer }}</div>
                      <div class="organizer-contacts">
                        <div v-if="selectedEvent.contactEmail" class="contact-item">
                          <q-icon name="email" size="16px" />
                          <a :href="`mailto:${selectedEvent.contactEmail}`">{{ selectedEvent.contactEmail }}</a>
                        </div>
                        <div v-if="selectedEvent.contactPhone" class="contact-item">
                          <q-icon name="phone" size="16px" />
                          <a :href="`tel:${selectedEvent.contactPhone}`">{{ selectedEvent.contactPhone }}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="detail-sidebar">
                <q-card flat bordered class="info-card">
                  <q-card-section>
                    <div class="info-card-title">Event Information</div>
                    
                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="calendar_today" size="18px" />
                        Start Date
                      </div>
                      <div class="info-value">{{ formatFullDate(selectedEvent.startDate) }}</div>
                    </div>

                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="event" size="18px" />
                        End Date
                      </div>
                      <div class="info-value">{{ formatFullDate(selectedEvent.endDate) }}</div>
                    </div>

                    <div class="info-item" v-if="selectedEvent.startTime">
                      <div class="info-label">
                        <q-icon name="access_time" size="18px" />
                        Time
                      </div>
                      <div class="info-value">
                        {{ formatTime(selectedEvent.startTime) }} - {{ formatTime(selectedEvent.endTime) }}
                      </div>
                    </div>

                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="place" size="18px" />
                        Location
                      </div>
                      <div class="info-value">{{ selectedEvent.location }}</div>
                    </div>

                    <q-separator class="q-my-md" />

                    <q-btn
                      unelevated
                      color="primary"
                      icon="directions"
                      label="Get Directions"
                      class="full-width q-mb-sm"
                      @click="getDirections(selectedEvent.location)"
                    />

                    <q-btn
                      outline
                      color="primary"
                      icon="share"
                      label="Share Event"
                      class="full-width"
                      @click="shareEvent(selectedEvent)"
                    />
                  </q-card-section>
                </q-card>
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
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'
import bakeryImage from '../assets/bakery.png'

export default defineComponent({
  name: 'AramidemPage',
  components: { FAQSection, FooterSection },

  setup() {
    const $q = useQuasar()
    const events = ref([])
    const loading = ref(true)
    const showEventDialog = ref(false)
    const selectedEvent = ref(null)
    const heroImageUrl = ref(bakeryImage)
    const currentDate = ref(new Date())
    const selectedFilter = ref('All Events')
    const expandedEvents = ref([])
    const randomSeed = ref(Math.random())
    
    const scheduleFilters = ['All Events', 'Today', 'This Week']

    const topEvents = computed(() => {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const today = now.toISOString().split('T')[0]
      
      return events.value
        .filter(event => {
          const eventDate = new Date(event.startDate)
          return (
            (event.status === 'Ongoing' || event.status === 'Upcoming') &&
            event.endDate >= today &&
            eventDate.getMonth() === currentMonth &&
            eventDate.getFullYear() === currentYear
          )
        })
        .slice(0, 3)
    })

    const selectedDateEvents = computed(() => {
      const month = currentDate.value.getMonth()
      const year = currentDate.value.getFullYear()
      
      return events.value.filter(event => {
        const eventDate = new Date(event.startDate)
        return (
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year &&
          event.status !== 'Cancelled'
        )
      }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    })

    const scheduleItems = computed(() => {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      let filtered = events.value.filter(event => {
        const eventDate = new Date(event.startDate)
        return event.status !== 'Cancelled' && eventDate >= today
      })

      if (selectedFilter.value === 'Today') {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate)
          return eventDate >= today && eventDate < tomorrow
        })
      } else if (selectedFilter.value === 'This Week') {
        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.startDate)
          return eventDate >= today && eventDate < weekEnd
        })
      }

      return filtered
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 10)
    })

    const featuredEvent = computed(() => {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      const upcomingEvents = events.value.filter(event => {
        return (
          (event.status === 'Upcoming' || event.status === 'Ongoing') &&
          event.endDate >= today
        )
      })

      if (upcomingEvents.length === 0) {
        return null
      }
      
      const randomIndex = Math.floor(Math.random() * upcomingEvents.length)
      return upcomingEvents[randomIndex]
    })

    const currentMonth = computed(() => {
      return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })

    const calendarDates = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const prevLastDay = new Date(year, month, 0)
      
      const dates = []
      const firstDayOfWeek = firstDay.getDay()
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        dates.push(new Date(year, month - 1, prevLastDay.getDate() - i))
      }
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        dates.push(new Date(year, month, i))
      }
      
      const remainingDays = 42 - dates.length
      for (let i = 1; i <= remainingDays; i++) {
        dates.push(new Date(year, month + 1, i))
      }
      
      return dates
    })

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

    const fetchEvents = async () => {
      loading.value = true
      try {
        const q = query(
          collection(db, 'events'),
          orderBy('startDate', 'asc')
        )
        const querySnapshot = await getDocs(q)
        events.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('[Aramidem] Error loading events:', error)
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

    const getDay = (dateStr) => {
      if (!dateStr) return '00'
      const date = new Date(dateStr)
      return date.getDate().toString().padStart(2, '0')
    }

    const getMonth = (dateStr) => {
      if (!dateStr) return 'JAN'
      const date = new Date(dateStr)
      return date.toLocaleString('default', { month: 'short' }).toUpperCase()
    }

    const formatTime = (timeStr) => {
      if (!timeStr) return ''
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }

    const formatFullDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateRange = (startDate, endDate) => {
      if (!startDate || !endDate) return ''
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (startDate === endDate) {
        return start.toLocaleDateString('en-US', { 
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    const truncateText = (text, maxLength) => {
      if (!text) return 'No description available.'
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const getStatusColor = (status) => {
      const colors = {
        'Upcoming': 'blue',
        'Ongoing': 'green',
        'Completed': 'grey',
        'Cancelled': 'red'
      }
      return colors[status] || 'grey'
    }

    const scrollToSection = (id) => {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const getDirections = (location) => {
      const encodedLocation = encodeURIComponent(location)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank')
    }

    const shareEvent = (event) => {
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        }).catch(() => {
          copyToClipboard()
        })
      } else {
        copyToClipboard()
      }
    }

    const copyToClipboard = () => {
      navigator.clipboard.writeText(window.location.href)
      $q.notify({
        type: 'positive',
        message: 'Link copied to clipboard!',
        position: 'top',
        icon: 'content_copy'
      })
    }

    const previousMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      )
    }

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      )
    }

    const isCurrentMonth = (date) => {
      if (!date) return false
      return date.getMonth() === currentDate.value.getMonth()
    }

    const isToday = (date) => {
      if (!date) return false
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const hasEvent = (date) => {
      if (!date) return false
      return events.value.some(event => {
        const eventDate = new Date(event.startDate)
        return eventDate.toDateString() === date.toDateString()
      })
    }

    const selectDate = (date) => {
      console.log('Selected date:', date)
    }

    const toggleEventExpand = (eventId) => {
      const index = expandedEvents.value.indexOf(eventId)
      if (index > -1) {
        expandedEvents.value.splice(index, 1)
      } else {
        expandedEvents.value.push(eventId)
      }
    }

    const exploreEvent = (event) => {
      viewEventDetails(event)
    }

    onMounted(() => {
      randomSeed.value = Math.random()
      fetchHeroImage()
      fetchEvents()
    })

    return { 
      events,
      topEvents,
      selectedDateEvents,
      featuredEvent,
      loading,
      showEventDialog,
      selectedEvent,
      heroImageUrl,
      currentMonth,
      calendarDates,
      scheduleFilters,
      selectedFilter,
      scheduleItems,
      expandedEvents,
      getDay,
      getMonth,
      formatTime,
      formatFullDate,
      formatDateRange,
      truncateText,
      getStatusColor,
      scrollToSection,
      viewEventDetails,
      getDirections,
      shareEvent,
      previousMonth,
      nextMonth,
      isCurrentMonth,
      isToday,
      hasEvent,
      selectDate,
      toggleEventExpand,
      exploreEvent
    }
  }
})
</script>

<style lang="scss" scoped>
$primary-green: #2d6a4f;
$dark-green: #1b4332;
$light-bg: #f5f5f0;

.hero-image-header {
  height: 450px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;

  .hero-overlay-content {
    z-index: 2;
  }

  .brand-name {
    color: white;
    font-size: 4rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: 4px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .brand-tagline {
    color: white;
    font-size: 1.3rem;
    opacity: 0.95;
    margin-top: 10px;
    font-weight: 500;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.hero-info-bar {
  background: white;
  padding: 80px 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .info-flex-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }

  .main-headline {
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1.2;
    color: #1a1a1a;
    margin: 0;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .sub-text {
    font-size: 1.05rem;
    color: #666;
    line-height: 1.7;
    margin-bottom: 25px;
  }

  .explore-pill-btn {
    background: $primary-green;
    color: white;
    border-radius: 30px;
    padding: 10px 35px;
    font-weight: 600;
    text-transform: none;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:hover {
      background: $dark-green;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(45, 106, 79, 0.3);
    }
  }
}

.events-section {
  background-color: $primary-green;
  padding: 80px 0 100px 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    margin-bottom: 60px;

    .text-overline {
      color: rgba(255,255,255,0.8);
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
  }
  
  .section-title {
    color: white;
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: 1px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
}

.no-events-state {
  text-align: center;
  padding: 80px 20px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.event-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  }

  .event-image-wrapper {
    height: 220px;
    position: relative;
    background: #f0f0f0;
    
    .event-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .event-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
    }
    
    .event-date-badge {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(10px);
      color: white;
      padding: 12px 14px;
      border-radius: 10px;
      text-align: center;
      min-width: 65px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);

      .date-day {
        font-size: 1.6rem;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 2px;
      }
      .date-month {
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    .event-status-badge {
      position: absolute;
      top: 15px;
      left: 15px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.status-upcoming {
        background: rgba(33, 150, 243, 0.9);
        color: white;
      }
      &.status-ongoing {
        background: rgba(76, 175, 80, 0.9);
        color: white;
      }
      &.status-completed {
        background: rgba(158, 158, 158, 0.9);
        color: white;
      }
    }
  }

  .event-content {
    padding: 25px;
    
    .event-title {
      font-size: 1.2rem;
      font-weight: 800;
      margin: 0 0 12px 0;
      line-height: 1.3;
      color: #1a1a1a;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .event-description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 15px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .event-link {
      color: $primary-green;
      font-weight: 700;
      text-decoration: none;
      font-size: 0.9rem;
      transition: gap 0.3s ease;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.view-all-btn {
  border-radius: 30px;
  font-weight: 600;
  text-transform: none;
}

.calendar-section {
  background: white;
  padding: 80px 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 40px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  .calendar-widget {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0;
      }

      .month-nav {
        display: flex;
        gap: 5px;
      }
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
      margin-bottom: 10px;

      .day-header {
        text-align: center;
        font-weight: 600;
        font-size: 0.85rem;
        color: #666;
      }
    }

    .calendar-dates {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;

      .calendar-date {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;

        &.other-month {
          color: #ccc;
        }

        &.today {
          background: $primary-green;
          color: white;
          font-weight: 700;
        }

        &.has-event {
          background: lighten($primary-green, 40%);
        }

        &:hover {
          background: lighten($primary-green, 35%);
        }
      }
    }
  }

  .events-list {
    .no-events-message {
      padding: 40px 20px;
      text-align: center;
      color: #999;
      font-size: 0.95rem;
    }

    .event-list-item {
      margin-bottom: 10px;
    }

    .events-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-bottom: 2px solid #e0e0e0;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: #f8f8f8;
      }

      h3 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0;
      }
    }

    .event-list-date {
      font-size: 0.85rem;
      color: #666;
      margin: 5px 0 0 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .event-list-details {
      padding: 15px 0;
      border-bottom: 1px solid #f0f0f0;

      .event-list-description {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.6;
        margin-bottom: 10px;
      }

      .event-list-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 10px;

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #666;
        }
      }
    }
  }
}

.featured-event-section {
  background: $primary-green;
  padding: 80px 0;
  color: white;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: 1fr 500px;
    gap: 60px;
    align-items: center;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .featured-overline {
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 2px;
    margin-bottom: 15px;
    opacity: 0.9;
  }

  .featured-title {
    font-size: 2.5rem;
    font-weight: 900;
    line-height: 1.2;
    margin: 0 0 20px 0;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .featured-description {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 30px;
    opacity: 0.95;
  }

  .featured-details {
    .detail-item {
      margin-bottom: 25px;

      h4 {
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 1px;
        margin: 0 0 8px 0;
        opacity: 0.8;
      }

      p {
        font-size: 1rem;
        margin: 0;
        line-height: 1.6;
      }
    }
  }

  .featured-image {
    .image-wrapper {
      width: 100%;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;

      @media (max-width: 1024px) {
        height: 300px;
      }

      .featured-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .image-placeholder {
      width: 100%;
      height: 400px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      @media (max-width: 1024px) {
        height: 300px;
      }
    }
  }
}

.schedule-section {
  background: $light-bg;
  padding: 80px 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .schedule-header {
    text-align: center;
    margin-bottom: 40px;

    .schedule-title {
      font-size: 2.5rem;
      font-weight: 900;
      margin: 0 0 15px 0;
      color: #1a1a1a;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .schedule-subtitle {
      font-size: 1.05rem;
      color: #666;
      margin: 0;
    }
  }

  .schedule-filters {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 40px;
    flex-wrap: wrap;

    .filter-btn {
      border-radius: 25px;
      padding: 8px 24px;
      text-transform: none;
      font-weight: 600;
    }
  }

  .schedule-list {
    .no-schedule-message {
      padding: 60px 20px;
      text-align: center;
      color: #999;
      font-size: 1rem;
      background: white;
      border-radius: 12px;
    }

    .schedule-item {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 15px;
      display: grid;
      grid-template-columns: 100px 60px 1fr auto;
      gap: 20px;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .schedule-time {
        display: flex;
        align-items: baseline;
        gap: 5px;

        .time-display {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .time-period {
          font-size: 0.9rem;
          color: #666;
        }
      }

      .schedule-icon {
        .icon-wrapper {
          width: 50px;
          height: 50px;
          background: lighten($primary-green, 40%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $primary-green;
        }
      }

      .schedule-details {
        .schedule-event-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }

        .schedule-event-location {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }

      .schedule-action {
        display: flex;
        align-items: center;
        gap: 10px;

        @media (max-width: 768px) {
          justify-content: flex-start;
        }

        .explore-btn {
          border-radius: 20px;
          text-transform: none;
          font-weight: 600;
        }
      }
    }
  }
}

.event-detail-card {
  background: white;

  .event-detail-hero {
    position: relative;
    padding: 0;

    .event-detail-image-wrapper {
      height: 400px;
      position: relative;
      background: #f0f0f0;

      @media (max-width: 768px) {
        height: 300px;
      }

      .event-detail-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .event-detail-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      }
    }

    .event-detail-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
      padding: 60px 0 40px 0;

      .event-detail-title {
        color: white;
        font-size: 2.5rem;
        font-weight: 900;
        margin: 0 0 20px 0;
        line-height: 1.2;

        @media (max-width: 768px) {
          font-size: 1.8rem;
        }
      }

      .event-detail-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 25px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 1rem;
          font-weight: 500;
        }
      }
    }
  }

  .event-detail-body {
    padding: 60px 0;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 40px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    .detail-section-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0 0 20px 0;
      color: #1a1a1a;
    }

    .event-full-description {
      font-size: 1.05rem;
      line-height: 1.8;
      color: #444;
      white-space: pre-wrap;
    }

    .organizer-card {
      display: flex;
      gap: 15px;
      padding: 20px;
      background: #f8f8f8;
      border-radius: 12px;

      .organizer-info {
        flex: 1;

        .organizer-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
        }

        .organizer-contacts {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: #666;

            a {
              color: $primary-green;
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }
    }

    .info-card {
      position: sticky;
      top: 20px;

      .info-card-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 20px;
        color: #1a1a1a;
      }

      .info-item {
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #888;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
        }
      }
    }
  }
}
</style>