<template>
  <section class="gallery-section" aria-label="Image gallery - Explore Baguio City">
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
          role="region"
          aria-label="Photo gallery carousel"
          aria-live="polite"
        >
          <q-carousel-slide
            v-for="(images, index) in imageGroups"
            :key="index"
            :name="index"
            class="carousel-slide"
            :aria-label="`Gallery slide ${index + 1} of ${imageGroups.length}`"
          >
            <div class="images-grid" role="list">
              <div
                v-for="(image, imgIndex) in images"
                :key="imgIndex"
                class="gallery-image-wrapper"
                role="listitem"
              >
                <q-img
                  :src="image.imageUrl"
                  :alt="`Baguio City gallery image ${imgIndex + 1}`"
                  class="gallery-image"
                  fit="cover"
                >
                  <template v-slot:loading>
                    <div class="absolute-full flex flex-center">
                      <q-spinner color="primary" size="30px" aria-label="Loading gallery image" />
                    </div>
                  </template>
                </q-img>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>

        <!-- Navigation Arrows -->
        <div class="nav-arrows" aria-label="Gallery navigation">
          <q-btn
            flat
            round
            icon="chevron_left"
            class="nav-btn nav-prev"
            @click="previousSlide"
            aria-label="Go to previous slide"
          />
          <q-btn
            flat
            round
            icon="chevron_right"
            class="nav-btn nav-next"
            @click="nextSlide"
            aria-label="Go to next slide"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="loading-state" role="status" aria-live="polite">
        <q-spinner color="primary" size="50px" aria-label="Loading gallery" />
        <p>Loading gallery...</p>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state" role="status">
        <q-icon name="photo_library" size="80px" color="grey-5" aria-hidden="true" />
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
// Color Palette Variables
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$light-green: #9ec98f;
$brown: #6b5344;
$white: #ffffff;

.gallery-section {
  background: $white;
  padding: 6rem 0;
}

.container-gallery {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

// Header
.gallery-header {
  text-align: center;
  margin-bottom: 4rem;
}

.gallery-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: $primary-green;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.gallery-description {
  font-size: 1.05rem;
  color: $brown;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
}

// Carousel
.carousel-wrapper {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-carousel {
  border-radius: 20px;
  overflow: visible;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba($primary-green, 0.1);
  background: $white;

  :deep(.q-carousel__navigation) {
    bottom: -50px;

    .q-carousel__control {
      .q-btn {
        color: $primary-green;

        &.q-btn--active {
          background: $primary-green;
        }
      }
    }
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
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
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
  background: $white;
  color: $primary-green;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: $white;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
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
