<template>
  <section class="about-section">
    <div class="container-about">
      <!-- Header -->
      <div class="about-header">
        <p class="about-tag">WHY BOOST BAGUIO</p>
        <h2 class="about-title">
          We make sure your <em>commute</em>
          <br class="hide-mobile" />
          is perfectly <em>guided</em>.
        </h2>
        <p class="about-description">
          At Boost Baguio, we are dedicated to enhancing your commuting experience in Baguio City.
          Our app seamlessly connects you to jeepney routes, local attractions, and events, while
          promoting eco-friendly travel.
        </p>
      </div>

      <!-- Icon row -->
      <div class="benefits-row" role="list">
        <div class="benefit" role="listitem">
          <div class="benefit-icon">
            <q-icon name="directions_bus" size="24px" />
          </div>
          <h3 class="benefit-title">Jeepney Routes</h3>
          <p class="benefit-text">
            Real-time routes and step-by-step navigation for every commute.
          </p>
        </div>

        <div class="benefit" role="listitem">
          <div class="benefit-icon">
            <q-icon name="place" size="24px" />
          </div>
          <h3 class="benefit-title">Local Attractions</h3>
          <p class="benefit-text">
            Curated tourist spots, hidden gems, and travel guides at your fingertips.
          </p>
        </div>

        <div class="benefit" role="listitem">
          <div class="benefit-icon">
            <q-icon name="event" size="24px" />
          </div>
          <h3 class="benefit-title">Events</h3>
          <p class="benefit-text">
            Stay up-to-date on local festivals and the city's cultural happenings.
          </p>
        </div>

        <div class="benefit" role="listitem">
          <div class="benefit-icon">
            <q-icon name="eco" size="24px" />
          </div>
          <h3 class="benefit-title">Eco-friendly</h3>
          <p class="benefit-text">We promote sustainable travel for a greener, kinder Baguio.</p>
        </div>
      </div>

      <!-- Mosaic image row -->
      <div class="about-mosaic">
        <div class="mosaic-large">
          <q-img :src="aboutImage || defaultImage" class="mosaic-img" :ratio="16 / 9">
            <template v-slot:loading>
              <div class="absolute-full flex flex-center">
                <q-spinner color="primary" size="40px" />
              </div>
            </template>
          </q-img>
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
  name: 'AboutSection',

  setup() {
    const aboutImage = ref('')
    const defaultImage =
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop'

    const loadAboutImage = async () => {
      try {
        console.log('[AboutSection] Loading image from Firebase...')
        const docRef = doc(db, 'pagePhotos', 'home-about')
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.imageUrl) {
            aboutImage.value = data.imageUrl
            console.log('[AboutSection] Image loaded:', data.imageUrl)
          }
        }
      } catch (error) {
        console.error('[AboutSection] Error loading image:', error)
      }
    }

    onMounted(() => {
      loadAboutImage()
    })

    return {
      aboutImage,
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

.about-section {
  background: $white;
  padding: 5rem 0;
}

.container-about {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.about-header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 3rem;
}

.about-tag {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin-bottom: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.about-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.75rem, 3.4vw, 2.45rem);
  font-weight: 600;
  color: $ink;
  margin: 0 0 1rem;
  line-height: 1.18;
  letter-spacing: -0.01em;

  em {
    font-style: italic;
    font-weight: 600;
    color: $primary-green;
  }
}

.about-description {
  font-size: 0.98rem;
  color: $muted;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

// Benefits row
.benefits-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 3.5rem;
}

.benefit {
  text-align: center;
  padding: 0 0.5rem;
}

.benefit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: $mint-bg;
  color: $primary-green;
  margin-bottom: 0.85rem;
  transition: all 0.3s ease;

  .benefit:hover & {
    background: $primary-green;
    color: $white;
    transform: translateY(-3px);
  }
}

.benefit-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: $ink;
  margin: 0 0 0.4rem;
  letter-spacing: -0.005em;
}

.benefit-text {
  font-size: 0.85rem;
  color: $muted;
  line-height: 1.6;
  margin: 0;
  max-width: 220px;
  margin-left: auto;
  margin-right: auto;
}

// Mosaic
.about-mosaic {
  display: grid;
  gap: 1rem;
  max-width: 1100px;
  margin: 0 auto;
}

.mosaic-large {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(20, 36, 26, 0.1);
}

.mosaic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Responsive
@media (max-width: 1023px) {
  .about-section {
    padding: 4rem 0;
  }

  .benefits-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem 1rem;
  }
}

@media (max-width: 599px) {
  .about-section {
    padding: 3rem 0;
  }

  .container-about {
    padding: 0 1.25rem;
  }

  .hide-mobile {
    display: none;
  }

  .about-header {
    margin-bottom: 2rem;
  }

  .benefits-row {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 0.5rem;
    margin-bottom: 2.5rem;
  }
}
</style>
