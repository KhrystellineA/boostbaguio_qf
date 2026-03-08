<template>
  <section class="features-section" aria-label="Features section - Explore Boost Baguio features">
    <div class="container-features">
      <!-- Header -->
      <div class="section-header">
        <p class="section-tag">Explore</p>
        <h2 class="section-title">DISCOVER BAGUIO'S BEST WITH OUR FEATURES</h2>
        <p class="section-description">
          Navigate Baguio effortlessly with our innovative features designed for commuters and
          tourists alike. From real-time jeepney routes to curated local spots, we've got you
          covered.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="features-grid" role="list">
        <!-- Left Column -->
        <div class="features-column left-column" role="listitem">
          <!-- Feature 1: P2P Navigation -->
          <div class="feature-item" role="listitem">
            <div class="feature-icon" aria-hidden="true">
              <q-icon name="map" size="42px" />
            </div>
            <h3 class="feature-title">P2P NAVIGATION (APANAM)</h3>
            <p class="feature-description">
              Get step-by-step directions for jeepney routes tailored to your start and end points.
            </p>
          </div>

          <!-- Feature 2: Places -->
          <div class="feature-item" role="listitem">
            <div class="feature-icon" aria-hidden="true">
              <q-icon name="place" size="42px" />
            </div>
            <h3 class="feature-title">PLACES (MAYKAN)</h3>
            <p class="feature-description">
              Explore Baguio's top destinations! From hidden gems to popular tourist spots, Maykan
              helps you discover and learn about the city's best attractions with detailed
              information and travel guides.
            </p>
          </div>
        </div>

        <!-- Center Image - NOW DYNAMIC -->
        <div class="center-image">
          <q-img
            :src="featureImage || defaultImage"
            class="tower-image"
            :ratio="3 / 4"
            alt="Featured image showcasing Baguio City attractions"
          >
            <template v-slot:loading>
              <div class="absolute-full flex flex-center">
                <q-spinner color="primary" size="40px" aria-label="Loading feature image" />
              </div>
            </template>
          </q-img>
        </div>

        <!-- Right Column -->
        <div class="features-column right-column" role="listitem">
          <!-- Feature 3: AYAN MO -->
          <div class="feature-item" role="listitem">
            <div class="feature-icon" aria-hidden="true">
              <q-icon name="near_me" size="42px" />
            </div>
            <h3 class="feature-title">NEARBY PLACES (AYAN MO)</h3>
            <p class="feature-description">
              Discover what's around you! Find nearby tourist spots, restaurants, and attractions
              based on your current location with real-time distance and travel information.
            </p>
          </div>

          <!-- Feature 4: Events -->
          <div class="feature-item" role="listitem">
            <div class="feature-icon" aria-hidden="true">
              <q-icon name="apartment" size="42px" />
            </div>
            <h3 class="feature-title">EVENTS (ARAMIDEM)</h3>
            <p class="feature-description">
              Stay updated on local festivals and concerts, complete with post-event transportation
              tips.
            </p>
          </div>
        </div>
      </div>

      <!-- City Jeeps (Pagnaam) - Full Width Below Image -->
      <div class="pagnaam-feature" role="listitem">
        <div class="feature-item full-width">
          <div class="feature-icon" aria-hidden="true">
            <q-icon name="alt_route" size="42px" />
          </div>
          <div class="feature-content">
            <h3 class="feature-title">CITY JEEPS (PAGNAAM)</h3>
            <p class="feature-description">
              Access an interactive map with routes, schedules, fares, and real-time updates from
              fellow commuters. Navigate Baguio's jeepney system with confidence and ease.
            </p>
          </div>
        </div>
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
// Color Palette Variables
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$brown: #6b5344;
$white: #ffffff;

.features-section {
  background: $white;
  padding: 6rem 0;
  position: relative;
}

.container-features {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// Header
.section-header {
  text-align: center;
  margin-bottom: 5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.section-tag {
  font-size: 0.875rem;
  font-weight: 600;
  color: $primary-green;
  margin-bottom: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: $dark-green;
  margin-bottom: 1.25rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.section-description {
  font-size: 1.05rem;
  color: $brown;
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
  font-weight: 300;
}

// Features Grid
.features-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 5rem;
  align-items: center;
  margin-bottom: 3rem;
}

.features-column {
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.left-column {
  align-items: flex-end;
  text-align: right;
}

.right-column {
  align-items: flex-start;
  text-align: left;
}

// Feature Item
.feature-item {
  max-width: 320px;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 1.25rem;
  color: $white;
  background: $primary-green;
  border-radius: 16px;
  transition: all 0.3s ease;

  .q-icon {
    font-size: 38px;
  }

  &:hover {
    background: $dark-green;
    transform: scale(1.05);
  }
}

.left-column .feature-icon {
  margin-left: auto;
}

.right-column .feature-icon {
  margin-right: auto;
}

.feature-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: $dark-green;
  margin-bottom: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.feature-description {
  font-size: 0.95rem;
  color: $brown;
  line-height: 1.7;
  font-weight: 300;
}

// Center Image
.center-image {
  width: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  transition: transform 0.4s ease;

  &:hover {
    transform: scale(1.02);
  }
}

// City Jeeps (Pagnaam) - Full Width Feature
.pagnaam-feature {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
}

.feature-item.full-width {
  max-width: 700px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .feature-icon {
    margin: 0 auto;
  }

  .feature-content {
    width: 100%;
  }

  .feature-title {
    margin-bottom: 0.75rem;
  }

  .feature-description {
    max-width: 600px;
    margin: 0 auto;
  }
}

.tower-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Responsive
@media (max-width: 1023px) {
  .features-section {
    padding: 5rem 0;
  }

  .container-features {
    padding: 0 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .features-column {
    align-items: center;
    text-align: center;
  }

  .left-column,
  .right-column {
    text-align: center;
  }

  .feature-icon {
    margin: 0 auto 1rem;
  }

  .feature-item {
    max-width: 100%;
  }

  .center-image {
    order: -1;
    margin: 0 auto;
    width: 100%;
    max-width: 400px;
  }

  .pagnaam-feature {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
  }

  .feature-item.full-width {
    max-width: 100%;
  }

  .section-title {
    font-size: 1.875rem;
  }
}

@media (max-width: 599px) {
  .features-section {
    padding: 4rem 0;
  }

  .container-features {
    padding: 0 1.5rem;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-description {
    font-size: 0.95rem;
  }

  .features-grid {
    gap: 2.5rem;
  }

  .features-column {
    gap: 2.5rem;
  }

  .center-image {
    width: 100%;
    max-width: 300px;
  }

  .pagnaam-feature {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .feature-item {
    max-width: 100%;
  }

  .feature-icon {
    width: 64px;
    height: 64px;

    .q-icon {
      font-size: 32px;
    }
  }
}
</style>
