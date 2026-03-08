import { watch } from 'vue'
import { useRoute } from 'vue-router'

const BASE_URL = 'https://boost-baguio.web.app'
const DEFAULT_TITLE = 'Boost Baguio - Your Premium City Navigation App'
const DEFAULT_DESCRIPTION =
  'Navigate Baguio City with ease using APANAM jeepney routes, MAYKAN tourist spots, ARAMIDEM events calendar, and AYAN MO nearby places.'
const DEFAULT_IMAGE = '/og-image.png'

/**
 * Composable for managing meta tags dynamically
 * Updates page title, meta description, Open Graph, and Twitter Card tags
 */
export function useMetaTags() {
  const route = useRoute()

  /**
   * Update all meta tags based on route or custom values
   * @param {Object} options - Optional overrides for meta tags
   */
  const updateMetaTags = (options = {}) => {
    const {
      title = route.meta?.title || DEFAULT_TITLE,
      description = route.meta?.description || DEFAULT_DESCRIPTION,
      image = DEFAULT_IMAGE,
      url = BASE_URL + route.path,
      type = 'website',
    } = options

    // Update document title
    document.title = title

    // Update meta description
    updateMetaTag('name', 'description', description)

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:image', image)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:type', type)
    updateMetaTag('property', 'og:site_name', 'Boost Baguio')

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', title)
    updateMetaTag('name', 'twitter:description', description)
    updateMetaTag('name', 'twitter:image', image)

    // Update canonical URL
    updateCanonicalLink(url)
  }

  /**
   * Helper to update or create a meta tag
   */
  const updateMetaTag = (attributeType, attributeName, content) => {
    let tag = document.querySelector(`meta[${attributeType}="${attributeName}"]`)

    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attributeType, attributeName)
      document.head.appendChild(tag)
    }

    tag.setAttribute('content', content)
  }

  /**
   * Update or create canonical link
   */
  const updateCanonicalLink = (href) => {
    let link = document.querySelector('link[rel="canonical"]')

    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }

    link.setAttribute('href', href)
  }

  /**
   * Watch for route changes and update meta tags automatically
   */
  const initRouteWatcher = () => {
    watch(
      () => route.path,
      () => {
        updateMetaTags()
      },
      { immediate: true }
    )
  }

  return {
    updateMetaTags,
    initRouteWatcher,
  }
}

/**
 * Structured data helper for JSON-LD
 */
export function useStructuredData() {
  /**
   * Add or update JSON-LD structured data
   * @param {Object} data - Structured data object
   */
  const updateStructuredData = (data) => {
    let script = document.querySelector('script[type="application/ld+json"]')

    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }

    script.textContent = JSON.stringify(data)
  }

  /**
   * Get Organization structured data
   */
  const getOrganizationData = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Boost Baguio',
    url: BASE_URL,
    logo: BASE_URL + '/logo.png',
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      'https://www.facebook.com/boostbaguio',
      'https://twitter.com/boostbaguio',
      'https://www.instagram.com/boostbaguio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@boostbaguio.com',
    },
  })

  /**
   * Get WebApplication structured data
   */
  const getWebApplicationData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Boost Baguio',
    url: BASE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'NavigationApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PHP',
    },
    featureList:
      'Jeepney Route Navigation, Tourist Spots Directory, Events Calendar, Nearby Places Search',
  })

  /**
   * Get Place/TouristAttraction structured data
   */
  const getPlaceData = (place) => ({
    '@context': 'https://schema.org',
    '@type': place.type || 'TouristAttraction',
    name: place.name,
    description: place.description,
    image: place.images?.[0] || place.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Baguio City',
      addressRegion: 'Benguet',
      addressCountry: 'PH',
    },
    geo: place.location
      ? {
          '@type': 'GeoCoordinates',
          latitude: place.location.lat,
          longitude: place.location.lng,
        }
      : undefined,
    url: place.url || BASE_URL + '/maykan',
  })

  /**
   * Get Event structured data
   */
  const getEventData = (event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    image: event.images?.[0] || event.image,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: event.status || 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.attendanceMode || 'https://schema.org/OfflineAttendance',
    location: {
      '@type': 'Place',
      name: event.location?.name || 'Baguio City',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Baguio City',
        addressRegion: 'Benguet',
        addressCountry: 'PH',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Boost Baguio',
      url: BASE_URL,
    },
  })

  return {
    updateStructuredData,
    getOrganizationData,
    getWebApplicationData,
    getPlaceData,
    getEventData,
  }
}
