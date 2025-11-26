<template>
  <q-page class="landing-page">
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <div class="text-overline text-white q-mb-sm">Navigate</div>
          <h1 class="hero-title">EXPLORE JEEPNEY ROUTES</h1>
          <p class="hero-description">
            Discover Baguio's jeepney routes with real-time updates and seamless navigation at your
            fingertips.
          </p>

          <div class="route-search-box">
            <q-input
              v-model="searchQuery"
              filled
              dark
              placeholder="Search for routes, destinations..."
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-btn label="Search" color="primary" unelevated @click="handleSearch" />
              </template>
            </q-input>
          </div>

          <div class="hero-actions">
            <q-btn
              label="Learn More"
              unelevated
              color="white"
              text-color="dark"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift q-mr-md"
              @click="scrollToSection('features')"
            />
            <q-btn
              label="Sign Up"
              outline
              color="white"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift"
            />
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section" ref="featuresSection">
      <div class="container">
        <div class="features-wrapper">
          <div class="features-content">
            <h2 class="features-title section-animate">
              EXPLORE BAGUIO'S JEEPNEY ROUTES WITH OUR INTERACTIVE MAPPING FEATURE
            </h2>
            <p class="features-description section-animate">
              Navigate Baguio City effortlessly with our interactive map. Access real-time schedules
              and fares for a seamless commuting experience.
            </p>

            <div class="feature-cards">
              <div class="feature-card section-animate">
                <q-icon name="route" size="32px" class="feature-icon" />
                <div class="feature-text">
                  <h3 class="feature-card-title">ROUTE DETAILS</h3>
                  <p class="feature-card-description">
                    Find accurate jeepney routes and up-to-date fare information at your fingertips.
                  </p>
                </div>
              </div>

              <div class="feature-card section-animate">
                <q-icon name="person" size="32px" class="feature-icon" />
                <div class="feature-text">
                  <h3 class="feature-card-title">USER-FRIENDLY</h3>
                  <p class="feature-card-description">
                    Designed for easy navigation ensuring a smooth travel experience in Baguio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="features-image-col">
            <div class="features-image-wrapper section-animate">
              <img src="../assets/img1.png" alt="Jeepneys on street" class="features-image" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="jeepneys-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title section-animate">BAGUIO'S JEEPNEYS!</h2>
          <p class="section-subtitle section-animate">
            Curious about Baguio's Jeepneys? No worries. Check them out and learn more about them
            here!
          </p>
        </div>

        <div class="jeepneys-grid">
          <div class="jeepney-cards-wrapper">
            <div
              v-for="(jeepney, index) in displayedJeepneys"
              :key="index"
              class="jeepney-card section-animate card-hover"
              @click="selectJeepney(jeepney)"
            >
              <div class="jeepney-image-wrapper">
                <img
                  v-if="jeepney.image"
                  :src="jeepney.image"
                  :alt="jeepney.name"
                  class="jeepney-image"
                />
                <div v-else class="jeepney-placeholder">
                  <q-icon name="directions_bus" size="48px" color="grey-5" />
                </div>
              </div>
              <div class="jeepney-info">
                <h3 class="jeepney-name">{{ jeepney.name }}</h3>
                <p class="jeepney-route">{{ jeepney.route }}</p>
              </div>
            </div>
          </div>

          <div class="text-center q-mt-lg">
            <q-btn
              label="See More"
              outline
              color="dark"
              padding="10px 32px"
              class="btn-hover-lift"
              @click="loadMoreJeepneys"
            />
          </div>
        </div>

        <div v-if="selectedJeepney" class="jeepney-detail-section section-animate">
          <div class="jeepney-detail-wrapper">
            <div class="jeepney-detail-image-col">
              <div class="jeepney-detail-image-wrapper">
                <img
                  v-if="selectedJeepney.image"
                  :src="selectedJeepney.image"
                  :alt="selectedJeepney.name"
                  class="jeepney-detail-image"
                />
                <div v-else class="jeepney-detail-placeholder">
                  <q-icon name="directions_bus" size="120px" color="grey-5" />
                </div>
              </div>
            </div>

            <div class="jeepney-detail-content-col">
              <div class="jeepney-detail-content">
                <div class="text-overline text-primary q-mb-sm">Discover</div>
                <h2 class="jeepney-detail-title">{{ selectedJeepney.name }}</h2>
                <p class="jeepney-detail-description">
                  Passes through:<br />
                  <strong>Starting point:</strong> {{ selectedJeepney.startingPoint }}<br />
                  <strong>Destination:</strong> {{ selectedJeepney.destination }}
                </p>

                <div class="jeepney-detail-info">
                  <div class="info-item">
                    <h3 class="info-label">TERMINAL LOCATION:</h3>
                    <p class="info-value">{{ selectedJeepney.terminalLocation }}</p>
                  </div>

                  <div class="info-item">
                    <h3 class="info-label">FARE:</h3>
                    <p class="info-value">
                      REGULAR: ₱{{ selectedJeepney.regularFare }}<br />
                      STUDENT: ₱{{ selectedJeepney.studentFare }}<br />
                      PWD/SENIOR: ₱{{ selectedJeepney.pwdSeniorFare }}
                    </p>
                  </div>
                </div>

                <q-btn
                  label="GO THERE"
                  color="dark"
                  unelevated
                  padding="12px 32px"
                  class="btn-hover-lift q-mt-md"
                  @click="navigateToJeepney(selectedJeepney)"
                />
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
  name: 'LandingPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const searchQuery = ref('')
    const email = ref('')
    const selectedJeepney = ref(null)

    const jeepneys = [
      {
        name: 'ROUTE 01',
        route: 'City Hall - Session Road',
        image: null,
        startingPoint: 'City Hall Terminal',
        destination: 'Session Road',
        terminalLocation: 'City Hall Terminal, Harrison Road',
        regularFare: '13.00',
        studentFare: '10.00',
        pwdSeniorFare: '10.00',
      },
      {
        name: 'ROUTE 02',
        route: 'Market - BCM',
        image: null,
        startingPoint: 'Baguio Public Market',
        destination: 'Baguio Center Mall',
        terminalLocation: 'Public Market Terminal',
        regularFare: '13.00',
        studentFare: '10.00',
        pwdSeniorFare: '10.00',
      },
      {
        name: 'ROUTE 03',
        route: 'PMA - Session Road',
        image: null,
        startingPoint: 'Philippine Military Academy',
        destination: 'Session Road',
        terminalLocation: 'PMA Gate',
        regularFare: '15.00',
        studentFare: '12.00',
        pwdSeniorFare: '12.00',
      },
      {
        name: 'ROUTE 04',
        route: 'Camp John Hay - Market',
        image: null,
        startingPoint: 'Camp John Hay',
        destination: 'Public Market',
        terminalLocation: 'Camp John Hay Main Gate',
        regularFare: '15.00',
        studentFare: '12.00',
        pwdSeniorFare: '12.00',
      },
      {
        name: 'ROUTE 05',
        route: 'SM Baguio - Session Road',
        image: null,
        startingPoint: 'SM City Baguio',
        destination: 'Session Road',
        terminalLocation: 'SM Baguio Terminal',
        regularFare: '13.00',
        studentFare: '10.00',
        pwdSeniorFare: '10.00',
      },
      {
        name: 'ROUTE 06',
        route: 'Burnham Park - Market',
        image: null,
        startingPoint: 'Burnham Park',
        destination: 'Public Market',
        terminalLocation: 'Burnham Park Main Entrance',
        regularFare: '13.00',
        studentFare: '10.00',
        pwdSeniorFare: '10.00',
      },
      {
        name: 'ROUTE 07',
        route: "Teacher's Camp - Session Road",
        image: null,
        startingPoint: "Teacher's Camp",
        destination: 'Session Road',
        terminalLocation: "Teacher's Camp Gate",
        regularFare: '15.00',
        studentFare: '12.00',
        pwdSeniorFare: '12.00',
      },
      {
        name: 'ROUTE 08',
        route: 'Mines View - Market',
        image: null,
        startingPoint: 'Mines View Park',
        destination: 'Public Market',
        terminalLocation: 'Mines View Terminal',
        regularFare: '15.00',
        studentFare: '12.00',
        pwdSeniorFare: '12.00',
      },
    ]

    const displayedJeepneys = ref(jeepneys.slice(0, 8))

    const featuresSection = ref(null)

    const handleSearch = () => {
      if (searchQuery.value) {
        $q.notify({
          message: `Searching for: ${searchQuery.value}`,
          color: 'primary',
          icon: 'search',
        })
      }
    }

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const selectJeepney = (jeepney) => {
      selectedJeepney.value = jeepney
      setTimeout(() => {
        const detailSection = document.querySelector('.jeepney-detail-section')
        if (detailSection) {
          detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }

    const loadMoreJeepneys = () => {
      $q.notify({
        message: 'Loading more jeepneys...',
        color: 'primary',
        icon: 'directions_bus',
      })
    }

    const navigateToJeepney = (jeepney) => {
      $q.notify({
        message: `Navigating to ${jeepney.name}...`,
        color: 'positive',
        icon: 'navigation',
      })
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

      if (jeepneys.length > 0) {
        selectedJeepney.value = jeepneys[0]
      }
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      searchQuery,
      email,
      displayedJeepneys,
      selectedJeepney,
      featuresSection,
      handleSearch,
      scrollToSection,
      selectJeepney,
      loadMoreJeepneys,
      navigateToJeepney,
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

.section-header {
  margin-bottom: 60px;

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
    color: $text-dark;
    text-transform: uppercase;
    letter-spacing: 1px;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .section-subtitle {
    font-size: 1.2rem;
    color: $text-light;
    max-width: 600px;
    margin: 0 auto;
  }
}

.hero-section {
  position: relative;
  min-height: 700px;
  background-image: url('../assets/44.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
    display: flex;
    align-items: center;
    padding: 0 5%;
  }

  .hero-content {
    max-width: 700px;
    color: white;
    z-index: 1;

    .hero-title {
      font-size: 4rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 1.5rem 0;
      letter-spacing: 2px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }

    .hero-description {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .route-search-box {
      margin-bottom: 2rem;
      max-width: 600px;

      .search-input {
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(10px);
        border-radius: 8px;
      }
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
}

.features-section {
  background-color: $primary-green;
  padding: 80px 0;
  color: white;

  .features-wrapper {
    display: grid;
    grid-template-columns: 45fr 55fr;
    gap: 60px;
    align-items: center;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .features-content {
    .features-title {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.4;
      margin: 0 0 1.5rem 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      @media (max-width: 768px) {
        font-size: 1.3rem;
      }
    }

    .features-description {
      font-size: 0.95rem;
      line-height: 1.7;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .feature-cards {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .feature-card {
        display: flex;
        gap: 1rem;
        align-items: flex-start;

        .feature-icon {
          flex-shrink: 0;
          color: white;
          margin-top: 2px;
        }

        .feature-text {
          .feature-card-title {
            font-size: 0.9rem;
            font-weight: 700;
            margin: 0 0 0.4rem 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .feature-card-description {
            font-size: 0.85rem;
            line-height: 1.6;
            margin: 0;
            opacity: 0.85;
          }
        }
      }
    }
  }

  .features-image-col {
    display: flex;
    align-items: center;
    justify-content: center;

    .features-image-wrapper {
      width: 100%;
      max-width: 550px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);

      .features-image {
        width: 100%;
        height: auto;
        display: block;
      }
    }
  }
}

.jeepneys-section {
  padding: 100px 0;
  background: white;

  .jeepneys-grid {
    margin-bottom: 80px;

    .jeepney-cards-wrapper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      @media (max-width: 1024px) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .jeepney-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;

      .jeepney-image-wrapper {
        width: 100%;
        padding-top: 75%;
        position: relative;
        background: $light-gray;

        .jeepney-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .jeepney-placeholder {
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
      }

      .jeepney-info {
        padding: 1.5rem;
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .jeepney-name {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: $text-dark;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .jeepney-route {
          font-size: 0.9rem;
          color: $text-light;
          margin: 0;
        }
      }
    }
  }

  .jeepney-detail-section {
    background: $light-green;
    padding: 60px;
    border-radius: 16px;
    margin-top: 60px;

    @media (max-width: 768px) {
      padding: 30px 20px;
    }

    .jeepney-detail-wrapper {
      display: grid;
      grid-template-columns: 5fr 7fr;
      gap: 40px;
      align-items: center;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
        gap: 30px;
      }
    }

    .jeepney-detail-image-col {
      width: 100%;
    }

    .jeepney-detail-image-wrapper {
      width: 100%;
      padding-top: 100%;
      position: relative;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      overflow: hidden;

      .jeepney-detail-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .jeepney-detail-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .jeepney-detail-content {
      .jeepney-detail-title {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0 0 1rem 0;
        color: $text-dark;
        text-transform: uppercase;
        letter-spacing: 1px;

        @media (max-width: 768px) {
          font-size: 2rem;
        }
      }

      .jeepney-detail-description {
        font-size: 1rem;
        line-height: 1.8;
        color: $text-dark;
        margin-bottom: 2rem;
      }

      .jeepney-detail-info {
        display: flex;
        gap: 3rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;

        .info-item {
          .info-label {
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            color: $text-dark;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .info-value {
            font-size: 0.95rem;
            line-height: 1.6;
            color: $text-dark;
            margin: 0;
          }
        }
      }
    }
  }
}
</style>
