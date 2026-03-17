/**
 * Composable for Geocoding using OpenStreetMap Nominatim API
 * Free geocoding service for searching locations in Baguio City
 */

import { ref } from 'vue'

// Baguio City bounds for filtering results
const BAGUIO_BOUNDS = {
  north: 16.48,
  south: 16.38,
  east: 120.65,
  west: 120.55,
}

export function useGeocoding() {
  const loading = ref(false)
  const error = ref(null)
  const results = ref([])

  /**
   * Search for locations using Nominatim API
   * @param {string} query - Search query
   * @param {boolean} baguioOnly - Filter to Baguio City only
   * @returns {Promise<Array<{lat: number, lon: number, display_name: string, type: string}>>}
   */
  const searchLocations = async (query, baguioOnly = true) => {
    if (!query || query.trim().length < 2) {
      results.value = []
      return []
    }

    loading.value = true
    error.value = null

    try {
      // Add Baguio context to query for better results
      const searchQuery = baguioOnly ? `${query} Baguio City Philippines` : query

      const url = new URL('https://nominatim.openstreetmap.org/search')
      url.searchParams.append('q', searchQuery)
      url.searchParams.append('format', 'json')
      url.searchParams.append('limit', '10')
      url.searchParams.append('addressdetails', '1')
      url.searchParams.append('extratags', '1')

      const response = await fetch(url.toString(), {
        headers: {
          'Accept-Language': 'en',
        },
      })

      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }

      const data = await response.json()

      // Filter results to Baguio City area
      let filteredResults = data.filter((place) => {
        const lat = parseFloat(place.lat)
        const lon = parseFloat(place.lon)

        // Check if within Baguio bounds
        const inBaguio =
          lat >= BAGUIO_BOUNDS.south &&
          lat <= BAGUIO_BOUNDS.north &&
          lon >= BAGUIO_BOUNDS.west &&
          lon <= BAGUIO_BOUNDS.east

        // Also check address components for Baguio
        const isBaguioAddress =
          place.address?.city === 'Baguio City' ||
          place.address?.town === 'Baguio City' ||
          place.address?.state?.includes('Baguio') ||
          place.address?.county === 'Baguio City'

        return baguioOnly ? (inBaguio || isBaguioAddress) : true
      })

      // Format results
      results.value = filteredResults.map((place) => ({
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        label: place.display_name.split(',')[0], // First part of address
        fullAddress: place.display_name,
        type: place.type || 'place',
        importance: place.importance || 0,
        osmId: place.osm_id,
      }))

      // Sort by importance
      results.value.sort((a, b) => b.importance - a.importance)

      loading.value = false
      return results.value
    } catch (err) {
      console.error('[Geocoding] Error:', err)
      error.value = err.message
      loading.value = false
      results.value = []
      return []
    }
  }

  /**
   * Get place details from OSM ID
   * @param {number} osmId - OpenStreetMap ID
   * @returns {Promise<Object>}
   */
  const getPlaceDetails = async (osmId) => {
    try {
      const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=N${osmId}&format=json&addressdetails=1`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch place details')
      }

      const data = await response.json()
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          label: data[0].display_name.split(',')[0],
          fullAddress: data[0].display_name,
        }
      }
      return null
    } catch (err) {
      console.error('[Geocoding] Error fetching details:', err)
      return null
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<{lat: number, lng: number, label: string, address: string}>}
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()

      return {
        lat,
        lng,
        label: data.display_name?.split(',')[0] || 'Unknown location',
        address: data.display_name || '',
      }
    } catch (err) {
      console.error('[Geocoding] Reverse geocoding error:', err)
      return {
        lat,
        lng,
        label: 'Unknown location',
        address: '',
      }
    }
  }

  /**
   * Clear search results
   */
  const clearResults = () => {
    results.value = []
    error.value = null
  }

  return {
    loading,
    error,
    results,
    searchLocations,
    getPlaceDetails,
    reverseGeocode,
    clearResults,
  }
}
