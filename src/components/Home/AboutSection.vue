<template>
  <section class="about-section">
    <div class="container-about">
      <div class="about-grid">
        <!-- Left Content -->
        <div class="about-content">
          <div class="about-icon">
            <q-icon name="eco" size="48px" />
          </div>
          <h2 class="about-title">ABOUT US</h2>
          <p class="about-description">
            At Boost Baguio, we are dedicated to enhancing your commuting experience in Baguio City.
            Our app seamlessly connects you to jeepney routes, local attractions, and events, while
            promoting eco-friendly travel.
          </p>
        </div>

        <!-- Right Image - NOW DYNAMIC -->
        <div class="about-image">
          <q-img 
            :src="aboutImage || defaultImage" 
            class="about-img" 
            :ratio="4 / 3"
          >
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
    const defaultImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop'

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
// Color Palette Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$brown: #6B5344;
$white: #FFFFFF;

.about-section {
  background: $light-green;
  padding: 6rem 0;
  position: relative;
}

.container-about {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}

// Left Content
.about-content {
  display: flex;
  flex-direction: column;
}

.about-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  color: $white;
  background: rgba($white, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($white, 0.3);
    transform: scale(1.05);
  }
}

.about-title {
  font-size: 2rem;
  font-weight: 800;
  color: $white;
  margin-bottom: 1.5rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.about-description {
  font-size: 1.05rem;
  color: rgba($white, 0.95);
  line-height: 1.8;
  max-width: 550px;
  font-weight: 300;
}

// Right Image
.about-image {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba($white, 0.2);
  transition: transform 0.4s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.about-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Responsive
@media (max-width: 1023px) {
  .about-section {
    padding: 5rem 0;
  }

  .container-about {
    padding: 0 2rem;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .about-title {
    font-size: 1.75rem;
  }

  .about-description {
    max-width: 100%;
  }
}

@media (max-width: 599px) {
  .about-section {
    padding: 4rem 0;
  }

  .container-about {
    padding: 0 1.5rem;
  }

  .about-grid {
    gap: 2.5rem;
  }

  .about-title {
    font-size: 1.5rem;
  }

  .about-description {
    font-size: 0.95rem;
  }

  .about-icon {
    width: 56px;
    height: 56px;
  }
}
</style>