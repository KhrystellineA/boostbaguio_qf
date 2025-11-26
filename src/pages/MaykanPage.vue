<template>
  <q-page class="gems-page">
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <div class="text-overline text-white q-mb-sm">Explore</div>
          <h1 class="hero-title">DISCOVER BAGUIO'S GEMS</h1>
          <p class="hero-description">
            Uncover curated tourist spots with easy commute guides tailored for your Baguio
            adventure
          </p>

          <div class="hero-actions">
            <q-btn
              label="Get Started"
              unelevated
              color="white"
              text-color="dark"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift q-mr-md"
              @click="scrollToSection('explore')"
            />
            <q-btn
              label="View Routes"
              outline
              color="white"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift"
              @click="viewRoutes"
            />
          </div>
        </div>
      </div>
    </section>

    <section id="explore" class="explore-section" ref="exploreSection">
      <div class="container">
        <div class="section-header text-center">
          <div class="text-overline text-white q-mb-sm">Explore</div>
          <h2 class="section-title">DISCOVER BAGUIO'S HIDDEN GEMS WITH EASE</h2>
          <p class="section-subtitle">
            Baguio City is filled with breathtaking sights and experiences waiting to be discovered.
            Our curated list of tourist spots ensures you navigate the city effortlessly while
            enjoying its rich culture.
          </p>
        </div>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card section-animate card-hover"
          >
            <div class="feature-icon-wrapper">
              <q-icon :name="feature.icon" size="48px" class="feature-icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>

        <div class="action-buttons text-center">
          <q-btn
            label="Learn More"
            unelevated
            color="white"
            text-color="dark"
            padding="12px 32px"
            class="btn-hover-lift q-mr-md"
            @click="learnMore"
          />
          <q-btn
            label="Sign Up"
            outline
            color="white"
            padding="12px 32px"
            class="btn-hover-lift"
            @click="signUp"
          />
        </div>
      </div>
    </section>

    <section class="feedback-section">
      <div class="container">
        <div class="feedback-content">
          <div class="feedback-text">
            <q-icon name="help_outline" size="32px" class="feedback-icon" />
            <div>
              <h3 class="feedback-title">Want more curated content?</h3>
              <p class="feedback-subtitle">
                Help us improve by sharing more personalized and unique suggestions and experiences!
              </p>
            </div>
          </div>
          <q-btn
            label="Go Baguio!"
            unelevated
            color="white"
            text-color="dark"
            padding="10px 28px"
            class="btn-hover-lift"
            @click="submitFeedback"
          />
        </div>
      </div>
    </section>

    <section class="places-section">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">
            DISCOVER BAGUIO'S HIDDEN GEMS AND THE BEST JEEPNEY ROUTES TO GET TO THEM
          </h2>
          <p class="section-description">
            Baguio City is home to amazing hidden spots waiting to be discovered. Navigate the city
            with our best-suggested routes and explore the top destinations. Whether you're visiting
            our scenic parks, savoring local delicacies, or enjoying the city's cool breeze, we've
            got you covered with easy commute guides.
          </p>

          <div class="routes-list">
            <div class="route-item">
              <q-icon name="check_circle" size="20px" color="positive" />
              <span>Take Route 01 from Burnham Park</span>
            </div>
            <div class="route-item">
              <q-icon name="check_circle" size="20px" color="positive" />
              <span>Travel 3 routes up to the Mansion Garden</span>
            </div>
            <div class="route-item">
              <q-icon name="check_circle" size="20px" color="positive" />
              <span>Locate Route 7 for the Famous Mines View Park</span>
            </div>
          </div>
        </div>

        <div class="places-grid">
          <div
            v-for="(place, index) in places"
            :key="index"
            class="place-card section-animate card-hover"
          >
            <div class="place-image-wrapper">
              <img v-if="place.image" :src="place.image" :alt="place.name" class="place-image" />
              <div v-else class="place-placeholder">
                <q-icon name="image" size="48px" color="grey-4" />
              </div>
            </div>

            <div class="place-content">
              <h3 class="place-name">{{ place.name }}</h3>
              <p class="place-description">{{ place.description }}</p>

              <div class="place-tags">
                <span v-for="(tag, tagIndex) in place.tags" :key="tagIndex" class="place-tag">
                  {{ tag }}
                </span>
              </div>

              <a href="#" class="place-link" @click.prevent="viewPlace(place)">
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
            color="dark"
            padding="12px 40px"
            class="btn-hover-lift"
            @click="viewAllPlaces"
          />
        </div>
      </div>
    </section>

    <q-dialog v-model="showPlaceDetail" transition-show="slide-up" transition-hide="slide-down">
      <q-card class="place-detail-dialog">
        <q-card-section class="place-detail-content">
          <div class="detail-header">
            <h2 class="detail-title">{{ selectedPlace?.name || 'PLACE NAME' }}</h2>
            <p class="detail-subtitle">Place name and description</p>
          </div>

          <div class="detail-image-wrapper">
            <img
              v-if="selectedPlace?.image"
              :src="selectedPlace.image"
              :alt="selectedPlace.name"
              class="detail-image"
            />
            <div v-else class="detail-image-placeholder">
              <q-icon name="image" size="120px" color="grey-4" />
            </div>
          </div>

          <div class="detail-info-grid">
            <div class="detail-info-item">
              <div class="detail-info-icon-wrapper">
                <q-icon name="location_on" size="32px" class="detail-info-icon" />
              </div>
              <div class="detail-info-content">
                <h3 class="detail-info-label">ADDRESS</h3>
                <p class="detail-info-value">Landmark-instead</p>
              </div>
            </div>

            <div class="detail-info-item">
              <div class="detail-info-icon-wrapper">
                <q-icon name="schedule" size="32px" class="detail-info-icon" />
              </div>
              <div class="detail-info-content">
                <h3 class="detail-info-label">OPERATING HOURS</h3>
                <p class="detail-info-value">8AM-9PM (SUNDAYS to SATURDAYS)</p>
              </div>
            </div>

            <div class="detail-info-item action-item">
              <q-btn
                label="GO THERE"
                outline
                color="dark"
                size="lg"
                padding="12px 40px"
                class="btn-hover-lift"
                @click="goToPlace"
              />
            </div>
          </div>
        </q-card-section>

        <q-btn
          flat
          dense
          round
          icon="close"
          color="dark"
          class="close-btn"
          @click="showPlaceDetail = false"
        />
      </q-card>
    </q-dialog>

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
  name: 'BaguioGemsPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const exploreSection = ref(null)
    const showPlaceDetail = ref(false)
    const selectedPlace = ref(null)

    const features = [
      {
        icon: 'place',
        title: 'MUST-VISIT ATTRACTIONS IN BAGUIO CITY',
        description: "From parks to historical sites, explore Baguio's best.",
      },
      {
        icon: 'map',
        title: "YOUR GUIDE TO BAGUIO'S TOURIST SPOTS",
        description: 'Follow our commute guides for a hassle-free visit.',
      },
      {
        icon: 'celebration',
        title: "EXPERIENCE THE BEST OF BAGUIO'S CULTURE",
        description: 'Immerse yourself in local traditions and attractions.',
      },
    ]

    const places = [
      {
        name: 'PLACE NAME',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        tags: ['Nature', 'City Lights', 'Fun Spots'],
        image: null,
      },
      {
        name: 'PLACE NAME',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        tags: ['Nature', 'City Lights', 'Fun Spots'],
        image: null,
      },
      {
        name: 'PLACE NAME',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        tags: ['Nature', 'City Lights', 'Fun Spots'],
        image: null,
      },
      {
        name: 'PLACE NAME',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        tags: ['Nature', 'City Lights', 'Fun Spots'],
        image: null,
      },
      {
        name: 'PLACE NAME',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        tags: ['Nature', 'City Lights', 'Fun Spots'],
        image: null,
      },
      {
        name: 'PLACE NAME',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        tags: ['Nature', 'City Lights', 'Fun Spots'],
        image: null,
      },
    ]

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const viewRoutes = () => {
      $q.notify({
        message: 'Opening routes...',
        color: 'primary',
        icon: 'route',
      })
    }

    const learnMore = () => {
      $q.notify({
        message: 'Loading more information...',
        color: 'primary',
        icon: 'info',
      })
    }

    const signUp = () => {
      $q.notify({
        message: 'Opening sign up...',
        color: 'positive',
        icon: 'person_add',
      })
    }

    const submitFeedback = () => {
      $q.notify({
        message: 'Thank you for your interest!',
        color: 'positive',
        icon: 'thumb_up',
      })
    }

    const viewPlace = (place) => {
      selectedPlace.value = place
      showPlaceDetail.value = true
    }

    const goToPlace = () => {
      $q.notify({
        message: 'Opening navigation...',
        color: 'positive',
        icon: 'navigation',
      })
      showPlaceDetail.value = false
    }

    const viewAllPlaces = () => {
      $q.notify({
        message: 'Loading all places...',
        color: 'primary',
        icon: 'explore',
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
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      features,
      places,
      exploreSection,
      showPlaceDetail,
      selectedPlace,
      scrollToSection,
      viewRoutes,
      learnMore,
      signUp,
      submitFeedback,
      viewPlace,
      viewAllPlaces,
      goToPlace,
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
  position: relative;
  min-height: 600px;
  background-image: url('../assets/1.png');
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
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%);
    display: flex;
    align-items: center;
    padding: 0 5%;
  }

  .hero-content {
    max-width: 700px;
    color: white;
    z-index: 1;

    .hero-title {
      font-size: 3.5rem;
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
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.95;
      max-width: 600px;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  }
}

.explore-section {
  background-color: $primary-green;
  padding: 100px 0;
  color: white;

  .section-header {
    margin-bottom: 60px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
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
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.7;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 60px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 40px 30px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);

      .feature-icon-wrapper {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem auto;

        .feature-icon {
          color: white;
        }
      }

      .feature-title {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1.4;
      }

      .feature-description {
        font-size: 0.95rem;
        line-height: 1.6;
        margin: 0;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }

  .action-buttons {
    margin-top: 40px;
  }
}

.feedback-section {
  background-color: $cream-bg;
  padding: 40px 0;

  .feedback-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .feedback-text {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
      }

      .feedback-icon {
        color: $primary-green;
        flex-shrink: 0;
      }

      .feedback-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: $text-dark;
      }

      .feedback-subtitle {
        font-size: 0.95rem;
        color: $text-light;
        margin: 0;
        line-height: 1.5;
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
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: $text-dark;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.3;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }
    }

    .section-description {
      font-size: 1rem;
      line-height: 1.7;
      color: $text-light;
      max-width: 800px;
      margin: 0 auto 2rem auto;
    }

    .routes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 600px;
      margin: 0 auto;

      .route-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.95rem;
        color: $text-dark;

        @media (max-width: 768px) {
          text-align: left;
        }
      }
    }
  }

  .places-grid {
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

    .place-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .place-image-wrapper {
        position: relative;
        width: 100%;
        padding-top: 65%;
        background: $light-gray;
        overflow: hidden;

        .place-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          background: $light-gray;
        }
      }

      .place-content {
        padding: 25px;
        flex: 1;
        display: flex;
        flex-direction: column;

        .place-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: $text-dark;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .place-description {
          font-size: 0.9rem;
          line-height: 1.6;
          color: $text-light;
          margin: 0 0 1.5rem 0;
          flex: 1;
        }

        .place-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;

          .place-tag {
            font-size: 0.75rem;
            font-weight: 600;
            color: $text-dark;
            background: white;
            border: 1px solid #ddd;
            padding: 6px 12px;
            border-radius: 20px;
            text-transform: capitalize;
          }
        }

        .place-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: $text-dark;
          text-decoration: none;
          transition: all 0.3s ease;
          width: fit-content;

          &:hover {
            gap: 0.75rem;
            color: $primary-green;
          }
        }
      }
    }
  }
}

.place-detail-dialog {
  max-width: 800px;
  width: 100%;
  background: #e8ebe3;
  border-radius: 16px;
  position: relative;

  @media (max-width: 768px) {
    max-width: 95vw;
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.9);

    &:hover {
      background: rgba(255, 255, 255, 1);
    }
  }

  .place-detail-content {
    padding: 60px 40px 40px 40px;

    @media (max-width: 768px) {
      padding: 60px 20px 30px 20px;
    }

    .detail-header {
      text-align: center;
      margin-bottom: 40px;

      .detail-title {
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

      .detail-subtitle {
        font-size: 1rem;
        color: $text-light;
        margin: 0;
      }
    }

    .detail-image-wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto 40px auto;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      background: white;

      .detail-image {
        width: 100%;
        height: auto;
        display: block;
        aspect-ratio: 4/5;
        object-fit: cover;
      }

      .detail-image-placeholder {
        width: 100%;
        aspect-ratio: 4/5;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $light-gray;
      }
    }

    .detail-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 40px;
      align-items: center;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .detail-info-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;

        @media (max-width: 768px) {
          justify-content: center;
          text-align: center;
        }

        &.action-item {
          display: flex;
          justify-content: flex-end;

          @media (max-width: 768px) {
            justify-content: center;
          }
        }

        .detail-info-icon-wrapper {
          flex-shrink: 0;

          .detail-info-icon {
            color: $text-dark;
          }
        }

        .detail-info-content {
          .detail-info-label {
            font-size: 0.85rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
            color: $text-dark;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .detail-info-value {
            font-size: 0.95rem;
            color: $text-dark;
            margin: 0;
            line-height: 1.5;
          }
        }
      }
    }
  }
}
</style>
