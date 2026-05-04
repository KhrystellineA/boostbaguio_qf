<template>
  <section class="gallery-section" aria-label="Image gallery - Explore Baguio City">
    <div class="container-gallery">
      <!-- Header -->
      <div class="gallery-header">
        <p class="gallery-tag">A LOOK AT BAGUIO</p>
        <h2 class="gallery-title">
          <em>Snapshots</em> of the city
          <br class="hide-mobile" />
          and its culture
        </h2>
        <p class="gallery-description">Explore the beauty of Baguio City and its culture.</p>
      </div>

      <!-- Carousel with mosaic slides -->
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
          height="500px"
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
            <div class="mosaic-grid" :data-count="images.length" role="list">
              <div
                v-for="(image, imgIndex) in images"
                :key="imgIndex"
                :class="['mosaic-cell', `mosaic-cell--${imgIndex}`]"
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

    const imageGroups = computed(() => {
      const groups = []
      // Group into 5 for mosaic look (similar to Travadog)
      for (let i = 0; i < galleryImages.value.length; i += 5) {
        groups.push(galleryImages.value.slice(i, i + 5))
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
$primary-green: #2e5d3e;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;

.gallery-section {
  background: $white;
  padding: 5rem 0;
}

.container-gallery {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Header
.gallery-header {
  text-align: center;
  margin-bottom: 3rem;
}

.gallery-tag {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin-bottom: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.gallery-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.7rem, 3.2vw, 2.3rem);
  font-weight: 600;
  color: $ink;
  margin: 0 0 0.85rem;
  line-height: 1.18;
  letter-spacing: -0.01em;

  em {
    font-style: italic;
    color: $primary-green;
    font-weight: 600;
  }
}

.gallery-description {
  font-size: 0.95rem;
  color: $muted;
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto;
}

// Carousel
.carousel-wrapper {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-carousel {
  border-radius: 0;
  overflow: visible;
  background: transparent;

  :deep(.q-carousel__navigation) {
    bottom: -50px;

    .q-carousel__control .q-btn {
      color: $primary-green;

      &.q-btn--active {
        background: $primary-green;
      }
    }
  }
}

.carousel-slide {
  padding: 0 !important;
  height: 100%;
}

// Mosaic grid — Travadog style
.mosaic-grid {
  display: grid;
  gap: 1rem;
  height: 100%;
  width: 100%;
  padding: 0 0.5rem;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;

  &[data-count='1'] {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  &[data-count='2'] {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }

  &[data-count='3'],
  &[data-count='4'] {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: 1fr 1fr;
  }
}

.mosaic-cell {
  border-radius: 18px;
  overflow: hidden;
  background: $white;
  border: 1px solid $border;
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(20, 36, 26, 0.12);
  }
}

// 5-image mosaic placement
.mosaic-grid[data-count='5'] {
  .mosaic-cell--0 {
    grid-row: 1 / span 1;
    grid-column: 1 / span 2;
  }
  .mosaic-cell--1 {
    grid-row: 1 / span 1;
    grid-column: 3 / span 1;
  }
  .mosaic-cell--2 {
    grid-row: 2 / span 1;
    grid-column: 1 / span 1;
  }
  .mosaic-cell--3 {
    grid-row: 2 / span 1;
    grid-column: 2 / span 1;
  }
  .mosaic-cell--4 {
    grid-row: 2 / span 1;
    grid-column: 3 / span 1;
  }
}

// 4-image
.mosaic-grid[data-count='4'] {
  .mosaic-cell--0 {
    grid-row: 1 / span 2;
    grid-column: 1 / span 2;
  }
  .mosaic-cell--1 {
    grid-row: 1 / span 1;
    grid-column: 3 / span 1;
  }
  .mosaic-cell--2 {
    grid-row: 2 / span 1;
    grid-column: 3 / span 1;
  }
  .mosaic-cell--3 {
    grid-row: 1 / span 2;
    grid-column: 1 / span 1;
    display: none; // collapsed for 3-cell visual
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
  padding: 0 0.5rem;
  z-index: 10;
}

.nav-btn {
  pointer-events: all;
  background: $white;
  color: $primary-green;
  border: 1px solid $border;
  box-shadow: 0 4px 16px rgba(20, 36, 26, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: $white;
    transform: scale(1.08);
    box-shadow: 0 6px 20px rgba(20, 36, 26, 0.16);
  }
}

.nav-prev {
  transform: translateX(-50%);
}

.nav-next {
  transform: translateX(50%);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;

  p {
    color: $muted;
    font-size: 0.95rem;
  }
}

// Responsive
@media (max-width: 1023px) {
  .gallery-section {
    padding: 4rem 0;
  }

  .mosaic-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 0.75rem;
  }

  .mosaic-grid[data-count='5'] {
    .mosaic-cell--0 {
      grid-row: 1 / span 1;
      grid-column: 1 / span 2;
    }
    .mosaic-cell--1 {
      grid-row: 2 / span 1;
      grid-column: 1 / span 1;
    }
    .mosaic-cell--2 {
      grid-row: 2 / span 1;
      grid-column: 2 / span 1;
    }
    .mosaic-cell--3 {
      grid-row: 3 / span 1;
      grid-column: 1 / span 1;
    }
    .mosaic-cell--4 {
      grid-row: 3 / span 1;
      grid-column: 2 / span 1;
    }
  }
}

@media (max-width: 599px) {
  .gallery-section {
    padding: 3rem 0;
  }

  .container-gallery {
    padding: 0 1.25rem;
  }

  .gallery-header {
    margin-bottom: 2rem;
  }

  .hide-mobile {
    display: none;
  }

  .mosaic-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 180px;
    grid-template-rows: none;
  }

  .mosaic-grid[data-count='5'] {
    .mosaic-cell--0,
    .mosaic-cell--1,
    .mosaic-cell--2,
    .mosaic-cell--3,
    .mosaic-cell--4 {
      grid-row: auto;
      grid-column: 1 / -1;
    }
  }

  .nav-arrows {
    padding: 0;
  }

  .nav-prev {
    transform: translateX(-15%);
  }

  .nav-next {
    transform: translateX(15%);
  }
}
</style>
