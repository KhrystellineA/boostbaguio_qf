<template>
  <q-page class="aramidem-page">
    <section class="hero-section">
      <div class="hero-image-wrapper">
        <img src="../assets/bakery.png" alt="Baguio Events" class="hero-image" />
      </div>
      <div class="hero-content-wrapper">
        <div class="hero-content animate-fade-in">
          <h1 class="hero-title">DISCOVER EXCITING EVENTS IN BAGUIO CITY</h1>
          <p class="hero-description">
            Stay updated on the latest festivals and concerts happening in Baguio. Our platform
            ensures you are well-informed (connect here to make your stay memorable and enjoyable!)
          </p>

          <div class="hero-actions">
            <q-btn
              label="Explore"
              unelevated
              color="dark"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift q-mr-md"
              @click="scrollToSection('events')"
            />
            <q-btn
              label="Learn More"
              outline
              color="dark"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift"
              @click="learnMore"
            />
          </div>
        </div>
      </div>
    </section>

    <section id="events" class="events-section" ref="eventsSection">
      <div class="container">
        <div class="section-header text-center">
          <div class="text-overline text-white q-mb-sm">ARAMIDEM</div>
          <h2 class="section-title">TOP EVENTS OF THE MONTH</h2>
          <p class="section-subtitle">
            Discover Baguio's vibrant events and cultural celebrations.
          </p>
        </div>

        <div class="events-grid">
          <div
            v-for="(event, index) in events"
            :key="index"
            class="event-card section-animate card-hover"
          >
            <div class="event-image-wrapper">
              <img v-if="event.image" :src="event.image" :alt="event.title" class="event-image" />
              <div v-else class="event-placeholder">
                <q-icon name="event" size="60px" color="grey-5" />
              </div>
              <div class="event-date-badge">
                <div class="date-day">{{ event.day }}</div>
                <div class="date-month">{{ event.month }}</div>
              </div>
            </div>

            <div class="event-content">
              <div class="event-category">{{ event.category }}</div>
              <h3 class="event-title">{{ event.title }}</h3>
              <p class="event-description">{{ event.description }}</p>
              <a href="#" class="event-link" @click.prevent="viewEvent(event)">
                View more
                <q-icon name="arrow_forward" size="16px" />
              </a>
            </div>
          </div>
        </div>

        <div class="text-center q-mt-xl">
          <q-btn
            label="View All"
            unelevated
            color="white"
            text-color="dark"
            padding="12px 40px"
            class="btn-hover-lift"
            @click="viewAllEvents"
          />
        </div>
      </div>
    </section>

    <section class="calendar-section">
      <div class="container">
        <div class="calendar-grid">
          <div class="calendar-column">
            <div class="calendar-wrapper">
              <div class="calendar-header">
                <h3 class="calendar-month">February</h3>
              </div>
              <div class="calendar-body">
                <div class="calendar-weekdays">
                  <div class="weekday">Su</div>
                  <div class="weekday">Mo</div>
                  <div class="weekday">Tu</div>
                  <div class="weekday">We</div>
                  <div class="weekday">Th</div>
                  <div class="weekday">Fr</div>
                  <div class="weekday">Sa</div>
                </div>
                <div class="calendar-days">
                  <div
                    v-for="day in calendarDays"
                    :key="day.id"
                    :class="[
                      'calendar-day',
                      { 'has-event': day.hasEvent, inactive: !day.currentMonth },
                    ]"
                  >
                    <span class="day-number">{{ day.number }}</span>
                    <div v-if="day.hasEvent" class="event-indicator"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="themed-cards-column">
            <div
              v-for="(theme, index) in themedEvents"
              :key="index"
              class="themed-card section-animate"
            >
              <div class="themed-card-header">
                <h4 class="themed-card-title">JEEPNEY THEMES</h4>
                <q-btn
                  flat
                  dense
                  round
                  icon="close"
                  color="grey-7"
                  size="sm"
                  @click="closeTheme(theme)"
                />
              </div>
              <div class="themed-card-content">
                <p class="themed-card-text">Short desc: Recipe content</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <FAQSection />

    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default defineComponent({
  name: 'AramidemPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const eventsSection = ref(null)

    const events = [
      {
        day: '08',
        month: 'FEBRUARY',
        category: 'Event/Festival',
        title: 'PANAGBENGA SPRING/FLOWER FEST OF BAGUIO',
        description:
          "Baguio City's month-long festival showcasing the region's unique flora and vibrant culture of the Igorots(local people) in the Philippines.",
        image: null,
      },
      {
        day: '16',
        month: 'MARCH',
        category: 'Fair',
        title: 'MARKET FLOWER PARADE',
        description: 'A showcase for food safety and floral arrangements at the Public Market.',
        image: null,
      },
      {
        day: '11',
        month: 'APRIL',
        category: 'Event/Festival',
        title: 'ADIVAY FESTIVAL',
        description:
          "Nueva Vizcaya's unity-based festival showcasing their historical culture through vibrant street dancing.",
        image: null,
      },
    ]

    const generateCalendarDays = () => {
      const days = []
      let id = 1

      for (let i = 0; i < 3; i++) {
        days.push({
          id: id++,
          number: 29 + i,
          currentMonth: false,
          hasEvent: false,
        })
      }

      for (let i = 1; i <= 29; i++) {
        const hasEvent = [8, 14, 16, 21, 28].includes(i)
        days.push({
          id: id++,
          number: i,
          currentMonth: true,
          hasEvent: hasEvent,
        })
      }

      for (let i = 1; i <= 7; i++) {
        days.push({
          id: id++,
          number: i,
          currentMonth: false,
          hasEvent: false,
        })
      }

      return days
    }

    const calendarDays = ref(generateCalendarDays())

    const themedEvents = ref([
      { id: 1, title: 'JEEPNEY THEMES', description: 'Short desc: Recipe content' },
      { id: 2, title: 'JEEPNEY THEMES', description: 'Short desc: Recipe content' },
      { id: 3, title: 'JEEPNEY THEMES', description: 'Short desc: Recipe content' },
      { id: 4, title: 'JEEPNEY THEMES', description: 'Short desc: Recipe content' },
      { id: 5, title: 'JEEPNEY THEMES', description: 'Short desc: Recipe content' },
    ])

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const learnMore = () => {
      $q.notify({
        message: 'Loading more information...',
        color: 'primary',
        icon: 'info',
      })
    }

    const viewEvent = (event) => {
      $q.notify({
        message: `Opening ${event.title}...`,
        color: 'primary',
        icon: 'event',
      })
    }

    const viewAllEvents = () => {
      $q.notify({
        message: 'Loading all events...',
        color: 'primary',
        icon: 'calendar_month',
      })
    }

    const closeTheme = (theme) => {
      themedEvents.value = themedEvents.value.filter((t) => t.id !== theme.id)
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
      events,
      calendarDays,
      themedEvents,
      eventsSection,
      scrollToSection,
      learnMore,
      viewEvent,
      viewAllEvents,
      closeTheme,
    }
  },
})
</script>

<style lang="scss" scoped>
$primary-green: #4a5f4e;
$dark-green: #3a4f3e;
$light-gray: #f5f5f5;
$light-green: #e8f5e0;
$text-dark: #333;
$text-light: #666;
$cream-bg: #f8f6f0;
$yellow-accent: #f5d547;

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
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
}

.card-hover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;
  background: $cream-bg;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }

  .hero-image-wrapper {
    position: relative;
    overflow: hidden;
    min-height: 500px;

    @media (max-width: 960px) {
      min-height: 300px;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .hero-content-wrapper {
    display: flex;
    align-items: center;
    padding: 60px 80px;
    background: $cream-bg;

    @media (max-width: 1200px) {
      padding: 40px 60px;
    }

    @media (max-width: 768px) {
      padding: 40px 30px;
    }
  }

  .hero-content {
    max-width: 500px;

    .hero-title {
      font-size: 2.2rem;
      font-weight: 900;
      line-height: 1.2;
      margin: 0 0 1.5rem 0;
      color: $text-dark;
      text-transform: uppercase;
      letter-spacing: 1px;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }
    }

    .hero-description {
      font-size: 1rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      color: $text-light;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
}

.events-section {
  background-color: $primary-green;
  padding: 100px 0;
  color: white;

  .section-header {
    margin-bottom: 60px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1rem 0;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1px;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.9);
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .events-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    margin-bottom: 40px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .event-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .event-image-wrapper {
        position: relative;
        width: 100%;
        padding-top: 60%;
        background: $light-gray;
        overflow: hidden;

        .event-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .event-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: $light-gray;
        }

        .event-date-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          text-align: center;
          min-width: 70px;

          .date-day {
            font-size: 1.8rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 2px;
          }

          .date-month {
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        }
      }

      .event-content {
        padding: 30px;
        flex: 1;
        display: flex;
        flex-direction: column;

        .event-category {
          font-size: 0.75rem;
          font-weight: 600;
          color: $text-light;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .event-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: $text-dark;
          margin: 0 0 1rem 0;
          line-height: 1.3;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .event-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: $text-light;
          margin: 0 0 1.5rem 0;
          flex: 1;
        }

        .event-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: $text-dark;
          text-decoration: none;
          transition: all 0.3s ease;

          &:hover {
            gap: 0.75rem;
            color: $primary-green;
          }
        }
      }
    }
  }
}

.calendar-section {
  background: white;
  padding: 80px 0;

  .calendar-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .calendar-column {
    .calendar-wrapper {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .calendar-header {
      margin-bottom: 30px;

      .calendar-month {
        font-size: 1.5rem;
        font-weight: 700;
        color: $text-dark;
        margin: 0;
      }
    }

    .calendar-body {
      .calendar-weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        margin-bottom: 15px;

        .weekday {
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: $text-light;
          padding: 8px 0;
        }
      }

      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          padding: 8px;

          &:hover {
            background: $light-gray;
          }

          &.inactive {
            .day-number {
              color: #ccc;
            }
          }

          &.has-event {
            background: $primary-green;

            .day-number {
              color: white;
              font-weight: 700;
            }

            &:hover {
              background: $dark-green;
            }
          }

          .day-number {
            font-size: 0.95rem;
            color: $text-dark;
          }

          .event-indicator {
            position: absolute;
            bottom: 4px;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
          }
        }
      }
    }
  }

  .themed-cards-column {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .themed-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      .themed-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .themed-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: $text-dark;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .themed-card-content {
        .themed-card-text {
          font-size: 0.9rem;
          color: $text-light;
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>