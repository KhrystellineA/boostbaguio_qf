<template>
  <section class="gallery-section">
    <div class="container-gallery">
      <!-- Header -->
      <div class="gallery-header">
        <h2 class="gallery-title">IMAGE GALLERY</h2>
        <p class="gallery-description">Explore the beauty of Baguio City and its culture.</p>
      </div>

      <!-- Carousel -->
      <div class="carousel-wrapper">
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
                <q-img :src="image.src" :alt="image.alt" class="gallery-image" fit="cover" />
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
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'GallerySection',
  setup() {
    const slide = ref(0)

    const imageGroups = [
      [
        {
          src: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=400&h=400&fit=crop',
          alt: 'Baguio Cathedral',
        },
        {
          src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          alt: 'Mountain View',
        },
        {
          src: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=400&fit=crop',
          alt: 'Colorful Jeepney',
        },
        {
          src: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&h=400&fit=crop',
          alt: 'Sunset View',
        },
      ],
      [
        {
          src: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400&h=400&fit=crop',
          alt: 'Nature',
        },
        {
          src: 'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=400&h=400&fit=crop',
          alt: 'Street View',
        },
        {
          src: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop',
          alt: 'City Life',
        },
        {
          src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=400&fit=crop',
          alt: 'Architecture',
        },
      ],
    ]

    const previousSlide = () => {
      if (slide.value > 0) {
        slide.value--
      } else {
        slide.value = imageGroups.length - 1
      }
    }

    const nextSlide = () => {
      if (slide.value < imageGroups.length - 1) {
        slide.value++
      } else {
        slide.value = 0
      }
    }

    return {
      slide,
      imageGroups,
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
