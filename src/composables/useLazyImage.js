/**
 * Boost Baguio - Lazy Load Image Composable
 *
 * Provides lazy loading functionality for images:
 * - Intersection Observer based loading
 * - Placeholder support
 * - Loading states
 * - Error handling
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Lazy load image composable
 * @param {string} src - Image source URL
 * @param {Object} options - Lazy load options
 * @param {string} [options.placeholder] - Placeholder image while loading
 * @param {number} [options.rootMargin='50px'] - Margin around the root
 * @param {number} [options.threshold=0.1] - Intersection threshold
 * @returns {Object} Image state and methods
 */
export function useLazyImage(src, options = {}) {
  const {
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWE5ZWE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
    rootMargin = '50px',
    threshold = 0.1
  } = options

  const imageSrc = ref(placeholder)
  const isLoaded = ref(false)
  const isError = ref(false)
  const isInView = ref(false)
  let observer = null

  const loadImage = () => {
    if (!src) {
      isError.value = true
      return
    }

    const img = new Image()
    img.src = src

    img.onload = () => {
      imageSrc.value = src
      isLoaded.value = true
      isError.value = false
    }

    img.onerror = () => {
      isError.value = true
      isLoaded.value = true
    }
  }

  const handleIntersection = (entries) => {
    const entry = entries[0]
    isInView.value = entry.isIntersecting

    if (entry.isIntersecting && !isLoaded.value && !isError.value) {
      loadImage()
      // Stop observing once loaded
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }
  }

  onMounted(() => {
    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersection, {
        rootMargin,
        threshold
      })

      // Create a dummy element to observe
      const dummyElement = document.createElement('div')
      observer.observe(dummyElement)

      // Cleanup
      onUnmounted(() => {
        if (observer) {
          observer.disconnect()
          observer = null
        }
      })

      // Load immediately if already in view
      loadImage()
    } else {
      // Fallback for browsers without Intersection Observer
      loadImage()
    }
  })

  return {
    imageSrc,
    isLoaded,
    isError,
    isInView,
    reload: loadImage
  }
}

/**
 * Lazy image component props
 */
export const lazyImageProps = {
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: undefined
  },
  fit: {
    type: String,
    default: 'cover',
    validator: (value) => ['cover', 'contain', 'fill', 'none', 'scale-down'].includes(value)
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  width: {
    type: [String, Number],
    default: '100%'
  }
}

export default {
  useLazyImage,
  lazyImageProps
}
