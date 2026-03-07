<template>
  <div
    ref="containerRef"
    class="lazy-image-container"
    :style="containerStyle"
  >
    <!-- Placeholder/Loading State -->
    <div v-if="!loaded" class="lazy-image-placeholder">
      <q-spinner-dots v-if="loading" color="primary" size="32px" />
      <q-icon v-else-if="error" name="broken_image" size="48px" color="grey-5" />
    </div>

    <!-- Actual Image -->
    <img
      v-show="loaded && !error"
      ref="imgRef"
      :src="displaySrc"
      :alt="alt"
      :srcset="srcset"
      :sizes="sizes"
      :class="['lazy-image', imageClass]"
      :style="imageStyle"
      @load="onImageLoad"
      @error="onImageError"
    />

    <!-- Fallback Image -->
    <img
      v-if="error && fallbackSrc"
      :src="fallbackSrc"
      :alt="alt"
      :class="['lazy-image', imageClass]"
      :style="imageStyle"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { getOptimizedImageUrl, getSrcSet } from 'src/utils/cloudinary'

export default defineComponent({
  name: 'LazyImage',

  props: {
    /** Image source (URL or Cloudinary public ID) */
    src: {
      type: String,
      required: true
    },
    /** Alt text for accessibility */
    alt: {
      type: String,
      default: ''
    },
    /** Container width */
    width: {
      type: [Number, String],
      default: '100%'
    },
    /** Container height */
    height: {
      type: [Number, String],
      default: 'auto'
    },
    /** Aspect ratio (e.g., '16/9', '4/3', '1/1') */
    aspectRatio: {
      type: String,
      default: null
    },
    /** Object fit mode */
    fit: {
      type: String,
      default: 'cover',
      validator: v => ['cover', 'contain', 'fill', 'none', 'scale-down'].includes(v)
    },
    /** Image quality (1-100) */
    quality: {
      type: Number,
      default: 85
    },
    /** Enable responsive srcset */
    responsive: {
      type: Boolean,
      default: true
    },
    /** Fallback image URL */
    fallbackSrc: {
      type: String,
      default: null
    },
    /** Additional CSS class for image */
    imageClass: {
      type: String,
      default: ''
    },
    /** Additional CSS style for image */
    imageStyle: {
      type: [String, Object],
      default: null
    },
    /** Additional CSS style for container */
    containerStyle: {
      type: [String, Object],
      default: null
    },
    /** Sizes attribute for responsive images */
    sizes: {
      type: String,
      default: '(max-width: 600px) 480px, (max-width: 1200px) 1200px, 1920px'
    },
    /** Preload image immediately */
    preload: {
      type: Boolean,
      default: false
    }
  },

  emits: ['load', 'error'],

  setup(props, { emit }) {
    const containerRef = ref(null)
    const imgRef = ref(null)
    const loaded = ref(false)
    const loading = ref(false)
    const error = ref(false)
    let observer = null

    // Compute optimized image URL
    const displaySrc = computed(() => {
      if (!props.src) return props.fallbackSrc

      // If it's already an optimized URL or external URL, return as-is
      if (props.src.includes('res.cloudinary.com') || props.src.startsWith('http')) {
        return props.src
      }

      // Optimize with Cloudinary
      return getOptimizedImageUrl(props.src, {
        quality: props.quality
      })
    })

    // Compute srcset for responsive images
    const srcset = computed(() => {
      if (!props.responsive || !props.src) return null

      if (props.src.includes('res.cloudinary.com') || props.src.startsWith('http')) {
        return null
      }

      return getSrcSet(props.src)
    })

    // Handle image load
    const onImageLoad = () => {
      loaded.value = true
      loading.value = false
      emit('load', { src: props.src })
    }

    // Handle image error
    const onImageError = () => {
      error.value = true
      loading.value = false
      emit('error', { src: props.src })
    }

    // Setup Intersection Observer for lazy loading
    const setupObserver = () => {
      if (props.preload || !containerRef.value) {
        loadImage()
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadImage()
            observer.disconnect()
          }
        },
        {
          rootMargin: '50px',
          threshold: 0.01
        }
      )

      observer.observe(containerRef.value)
    }

    // Load the image
    const loadImage = () => {
      if (loaded.value || loading.value) return

      loading.value = true

      if (imgRef.value) {
        imgRef.value.src = displaySrc.value
      }
    }

    onMounted(() => {
      setupObserver()
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      containerRef,
      imgRef,
      loaded,
      loading,
      error,
      displaySrc,
      srcset,
      onImageLoad,
      onImageError
    }
  }
})
</script>

<style lang="scss" scoped>
.lazy-image-container {
  position: relative;
  width: v-bind(width);
  height: v-bind(height);
  overflow: hidden;
  background: #f5f5f5;

  @if v-bind(aspectRatio) {
    aspect-ratio: v-bind(aspectRatio);
  }
}

.lazy-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: v-bind(fit);
  object-position: center;
  transition: opacity 0.3s ease;
}
</style>
