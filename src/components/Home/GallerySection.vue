<template>
  <section class="gallery-section">
    <div class="container-gallery">
      <!-- Header -->
      <div class="gallery-header">
        <h2 class="gallery-title">IMAGE GALLERY</h2>
        <p class="gallery-description">Explore the beauty of Baguio City and its culture.</p>
      </div>

      <!-- Carousel -->
      <div v-if="galleryImages.length > 0" class="carousel-wrapper">
        <q-carousel
          v-model="slide"
          transition-prev="slide-right"
          transition-next="slide-left"
          swipeable
          animated
          control-color="primary"
          navigation
          padding
          arrows
          height="400px"
          class="gallery-carousel"
        >
          <q-carousel-slide
            v-for="(images, index) in imageGroups"
            :key="index"
            :name="index"
            class="carousel-slide"
          >
            <div class="images-grid">
              <div
                v-for="(image, imgIndex) in images"
                :key="imgIndex"
                class="gallery-image-wrapper"
              >
                <q-img :src="image.imageUrl" :alt="`Gallery ${imgIndex + 1}`" class="gallery-image" fit="cover">
                  <template v-slot:loading>
                    <div class="absolute-full flex flex-center">
                      <q-spinner color="primary" size="30px" />
                    </div>
                  </template>
                </q-img>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>

        <!-- Navigation Arrows -->
        <div class="nav-arrows">
          <q-btn flat round icon="chevron_left" class="nav-btn nav-prev" @click="previousSlide" />
          <q-btn flat round icon="chevron_right" class="nav-btn nav-next" @click="nextSlide" />
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state">
        <q-spinner color="primary" size="50px" />
        <p>Loading gallery...</p>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="photo_library" size="80px" color="grey-5" />
        <p class="empty-text">No gallery images available yet</p>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default {
  name: 'GallerySection',
  
  setup() {
    const slide = ref(0)
    const galleryImages = ref([])
    const loading = ref(true)

    // Split images into groups of 4 for carousel slides
    const imageGroups = computed(() => {
      const groups = []
      for (let i = 0; i < galleryImages.value.length; i += 4) {
        groups.push(galleryImages.value.slice(i, i + 4))
      }
      return groups
    })

    const loadGalleryImages = async () => {
      try {
        console.log('[GallerySection] Loading images from Firebase...')
        const docRef = doc(db, 'pagePhotos', 'home-gallery')
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.images && Array.isArray(data.images)) {
            galleryImages.value = data.images
            console.log('[GallerySection] Loaded', data.images.length, 'images')
          }
        }
      } catch (error) {
        console.error('[GallerySection] Error loading images:', error)
      } finally {
        loading.value = false
      }
    }

    const previousSlide = () => {
      if (slide.value > 0) {
        slide.value--
      } else {
        slide.value = imageGroups.value.length - 1
      }
    }

    const nextSlide = () => {
      if (slide.value < imageGroups.value.length - 1) {
        slide.value++
      } else {
        slide.value = 0
      }
    }

    onMounted(() => {
      loadGalleryImages()
    })

    return {
      slide,
      galleryImages,
      imageGroups,
      loading,
      previousSlide,
      nextSlide,
    }
  },
}
</script>

<style lang="scss" scoped>
.gallery-section {
  background: #f5f5f5;
  padding: 5rem 0;
}

.container-gallery {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Header
.gallery-header {
  text-align: center;
  margin-bottom: 3rem;
}

.gallery-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.gallery-description {
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.6;
}

// Carousel
.carousel-wrapper {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-carousel {
  border-radius: 12px;
  overflow: visible;

  :deep(.q-carousel__navigation) {
    bottom: -40px;
  }

  :deep(.q-carousel__navigation-icon) {
    font-size: 10px;
  }
}

.carousel-slide {
  padding: 0 !important;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  height: 100%;
  padding: 0 1rem;
}

.gallery-image-wrapper {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Navigation Arrows
.nav-arrows {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  padding: 0 1rem;
  z-index: 10;
}

.nav-btn {
  pointer-events: all;
  background: white;
  color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #f5f5f5;
  }
}

.nav-prev {
  transform: translateX(-50%);
}

.nav-next {
  transform: translateX(50%);
}

// Loading State
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;

  p {
    color: #666;
    font-size: 0.95rem;
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;

  .empty-text {
    color: #666;
    font-size: 0.95rem;
    margin-top: 1rem;
  }
}

// Responsive
@media (max-width: 1023px) {
  .gallery-section {
    padding: 4rem 0;
  }

  .images-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .gallery-carousel {
    height: auto;
  }

  .gallery-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 599px) {
  .gallery-section {
    padding: 3rem 0;
  }

  .gallery-header {
    margin-bottom: 2rem;
  }

  .gallery-title {
    font-size: 1.5rem;
  }

  .images-grid {
    grid-template-columns: 1fr;
    padding: 0 0.5rem;
  }

  .nav-arrows {
    padding: 0;
  }

  .nav-prev {
    transform: translateX(-20%);
  }

  .nav-next {
    transform: translateX(20%);
  }
}
</style>