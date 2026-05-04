<template>
  <section class="features-section" aria-label="Features section - Explore Boost Baguio features">
    <div class="container-features">
      <!-- Header -->
      <div class="section-header">
        <p class="section-tag">EXPLORE BAGUIO</p>
        <div class="header-row">
          <h2 class="section-title">
            Discover Baguio's <em>best</em>
            <br class="hide-mobile" />
            with our features
          </h2>
        </div>
        <p class="section-description">
          Navigate Baguio effortlessly with our innovative features designed for commuters and
          tourists alike. From real-time jeepney routes to curated local spots, we've got you
          covered.
        </p>
      </div>

      <!-- Top image card row -->
      <div class="image-cards-grid">
        <!-- APANAM -->
        <article class="image-card">
          <div class="image-card-media">
            <q-img
              :src="featureImage || defaultImage"
              :ratio="4 / 3"
              alt="P2P Navigation"
              class="image-card-img"
            >
              <template v-slot:loading>
                <div class="absolute-full flex flex-center">
                  <q-spinner color="primary" size="30px" />
                </div>
              </template>
            </q-img>
          </div>
          <div class="image-card-body">
            <h3 class="image-card-title">P2P Navigation (Apanam)</h3>
            <p class="image-card-text">
              Get step-by-step directions for jeepney routes tailored to your start and end points.
            </p>
          </div>
        </article>

        <!-- PAGNAAM -->
        <article class="image-card">
          <div class="image-card-media image-card-media--mint">
            <q-icon name="alt_route" class="card-illust" />
          </div>
          <div class="image-card-body">
            <h3 class="image-card-title">City Jeeps (Pagnaam)</h3>
            <p class="image-card-text">
              Access an interactive map with routes, schedules, fares, and real-time updates from
              fellow commuters. Navigate Baguio's jeepney system with confidence and ease.
            </p>
          </div>
        </article>

        <!-- MAYKAN -->
        <article class="image-card">
          <div class="image-card-media image-card-media--sage">
            <q-icon name="place" class="card-illust" />
          </div>
          <div class="image-card-body">
            <h3 class="image-card-title">Places (Maykan)</h3>
            <p class="image-card-text">
              Explore Baguio's top destinations! From hidden gems to popular tourist spots, Maykan
              helps you discover and learn about the city's best attractions with detailed
              information and travel guides.
            </p>
          </div>
        </article>
      </div>

      <!-- Bottom row -->
      <div class="image-cards-grid image-cards-grid--two">
        <!-- AYAN MO -->
        <article class="image-card">
          <div class="image-card-media image-card-media--mint">
            <q-icon name="near_me" class="card-illust" />
          </div>
          <div class="image-card-body">
            <h3 class="image-card-title">Nearby Places (Ayan Mo)</h3>
            <p class="image-card-text">
              Discover what's around you! Find nearby tourist spots, restaurants, and attractions
              based on your current location with real-time distance and travel information.
            </p>
          </div>
        </article>

        <!-- ARAMIDEM -->
        <article class="image-card">
          <div class="image-card-media image-card-media--sage">
            <q-icon name="apartment" class="card-illust" />
          </div>
          <div class="image-card-body">
            <h3 class="image-card-title">Events (Aramidem)</h3>
            <p class="image-card-text">
              Stay updated on local festivals and concerts, complete with post-event transportation
              tips.
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'FeaturesSection',

  setup() {
    const featureImage = ref('')
    const defaultImage =
      'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=600&h=800&fit=crop'

    const loadFeatureImage = async () => {
      try {
        console.log('[FeaturesSection] Loading image from Firebase...')
        const docRef = doc(db, 'pagePhotos', 'home-features')
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.imageUrl) {
            featureImage.value = data.imageUrl
            console.log('[FeaturesSection] Image loaded:', data.imageUrl)
          }
        }
      } catch (error) {
        console.error('[FeaturesSection] Error loading image:', error)
      }
    }

    onMounted(() => {
      loadFeatureImage()
    })

    return {
      featureImage,
      defaultImage,
    }
  },
}
</script>

<style lang="scss" scoped>
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$sage: #b8cfa3;
$mint-bg: #e8f0e0;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;

.features-section {
  background: $white;
  padding: 5rem 0 4rem;
  position: relative;
}

.container-features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Header
.section-header {
  text-align: left;
  margin-bottom: 2.5rem;
  max-width: 760px;
}

.section-tag {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin-bottom: 0.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.7rem, 3.2vw, 2.3rem);
  font-weight: 600;
  color: $ink;
  margin: 0;
  line-height: 1.18;
  letter-spacing: -0.01em;

  em {
    font-style: italic;
    font-weight: 600;
    color: $primary-green;
  }
}

.section-description {
  font-size: 0.95rem;
  color: $muted;
  line-height: 1.7;
  max-width: 640px;
  font-weight: 400;
  margin: 0;
}

// Image card grid
.image-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.25rem;

  &--two {
    grid-template-columns: repeat(2, 1fr);
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 0;
  }
}

.image-card {
  display: flex;
  flex-direction: column;
  background: transparent;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.image-card-media {
  position: relative;
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: $mint-bg;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;

  &--mint {
    background: $mint-bg;
  }

  &--sage {
    background: lighten($sage, 5%);
  }
}

.image-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-illust {
  font-size: 78px;
  color: $primary-green;
  opacity: 0.92;
}

.image-card-body {
  padding: 1.1rem 0.25rem 0;
}

.image-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: $ink;
  margin: 0 0 0.45rem;
  letter-spacing: -0.005em;
  line-height: 1.3;
}

.image-card-text {
  font-size: 0.9rem;
  color: $muted;
  line-height: 1.65;
  margin: 0;
}

// Responsive
@media (max-width: 1023px) {
  .features-section {
    padding: 4rem 0 3rem;
  }

  .image-cards-grid {
    grid-template-columns: repeat(2, 1fr);

    &--two {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 599px) {
  .features-section {
    padding: 3rem 0;
  }

  .container-features {
    padding: 0 1.25rem;
  }

  .hide-mobile {
    display: none;
  }

  .image-cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;

    &--two {
      grid-template-columns: 1fr;
    }
  }

  .card-illust {
    font-size: 60px;
  }
}
</style>
