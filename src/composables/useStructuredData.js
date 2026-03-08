/**
 * Composable for managing JSON-LD structured data
 * Improves SEO by providing search engines with structured information
 */

const BASE_URL = 'https://boost-baguio.web.app'

export function useStructuredData() {
  /**
   * Inject structured data into the page head
   */
  const injectStructuredData = (data, id = 'structured-data') => {
    // Remove existing data with same ID
    removeStructuredData(id)

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  /**
   * Remove structured data from the page
   */
  const removeStructuredData = (id = 'structured-data') => {
    const existing = document.getElementById(id)
    if (existing) {
      existing.remove()
    }
  }

  /**
   * Get Organization structured data
   */
  const getOrganizationData = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Boost Baguio',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'Premium jeepney navigation app for Baguio City. Navigate with APANAM, discover tourist spots with MAYKAN, browse events with ARAMIDEM, and find nearby places with AYAN MO.',
    sameAs: [
      'https://www.facebook.com/boostbaguio',
      'https://twitter.com/boostbaguio',
      'https://www.instagram.com/boostbaguio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@boostbaguio.com',
      areaServed: 'PH',
      availableLanguage: ['English', 'Filipino'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Baguio City',
      addressRegion: 'Benguet',
      addressCountry: 'PH',
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
    description:
      'Premium jeepney navigation app for Baguio City. Navigate with APANAM, discover tourist spots with MAYKAN, browse events with ARAMIDEM, and find nearby places with AYAN MO.',
    applicationCategory: 'NavigationApplication',
    operatingSystem: 'Web, iOS, Android',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PHP',
    },
    featureList:
      'Jeepney Route Navigation, Tourist Spots Directory, Events Calendar, Nearby Places Search, Offline Mode',
    screenshot: `${BASE_URL}/screenshots/home.png`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  })

  /**
   * Get WebSite structured data
   */
  const getWebSiteData = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Boost Baguio',
    url: BASE_URL,
    description: 'Your premium city navigation app for Baguio City',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/apanam?from={from}&to={to}`,
      'query-input': 'required name=search_string',
    },
  })

  /**
   * Get TouristAttraction structured data for a place
   */
  const getTouristAttractionData = (place) => ({
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: place.name,
    description: place.description,
    image: place.images?.[0] || place.image || `${BASE_URL}/og-image.png`,
    url: place.url || BASE_URL,
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
    isAccessibleForFree: true,
    openingHoursSpecification: place.openingHours
      ? {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: place.openingHours.days,
          opens: place.openingHours.open,
          closes: place.openingHours.close,
        }
      : undefined,
  })

  /**
   * Get Event structured data
   */
  const getEventData = (event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    image: event.images?.[0] || event.image || `${BASE_URL}/og-image.png`,
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
    offers: event.price
      ? {
          '@type': 'Offer',
          price: event.price,
          priceCurrency: 'PHP',
          availability: event.availability || 'https://schema.org/InStock',
        }
      : {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'PHP',
        },
  })

  /**
   * Get BusRoute structured data for jeepney routes
   */
  const getBusRouteData = (route) => ({
    '@context': 'https://schema.org',
    '@type': 'BusRoute',
    name: route.name,
    description: route.description,
    routeColor: route.color || '2E5D3E',
    startsAt: {
      '@type': 'BusStop',
      name: route.terminal,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Baguio City',
        addressRegion: 'Benguet',
        addressCountry: 'PH',
      },
    },
    endsAt: {
      '@type': 'BusStop',
      name: route.destination,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Baguio City',
        addressRegion: 'Benguet',
        addressCountry: 'PH',
      },
    },
    provider: {
      '@type': 'Organization',
      name: 'Baguio City Jeepney Operators',
    },
  })

  /**
   * Get FAQPage structured data
   */
  const getFAQPageData = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  })

  /**
   * Get BreadcrumbList structured data
   */
  const getBreadcrumbData = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url || BASE_URL + item.path,
    })),
  })

  return {
    injectStructuredData,
    removeStructuredData,
    getOrganizationData,
    getWebApplicationData,
    getWebSiteData,
    getTouristAttractionData,
    getEventData,
    getBusRouteData,
    getFAQPageData,
    getBreadcrumbData,
  }
}
