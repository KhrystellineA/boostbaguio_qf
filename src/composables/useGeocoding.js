/**
 * Composable for geocoding using OpenStreetMap Nominatim API
 * Provides forward geocoding (text → coords) and reverse geocoding (coords → text)
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'
const BAGUIO_BOUNDS = '120.55,16.37,120.65,16.47' // viewbox for Baguio area

/**
 * Search for locations by text query
 * @param {string} query - Search text
 * @param {boolean} [baguioOnly=true] - Restrict to Baguio area
 * @returns {Promise<Array<{label: string, lat: number, lng: number}>>}
 */
async function searchLocations(query, baguioOnly = true) {
  const searchQuery = baguioOnly
    ? `${query}, Baguio City, Philippines`
    : query

  const params = new URLSearchParams({
    format: 'json',
    q: searchQuery,
    limit: '5',
    addressdetails: '1',
  })

  if (baguioOnly) {
    params.set('viewbox', BAGUIO_BOUNDS)
    params.set('bounded', '1')
  }

  const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'Accept-Language': 'en' },
  })

  if (!response.ok) return []

  const data = await response.json()
  return data.map((item) => ({
    label: item.display_name.split(',').slice(0, 3).join(',').trim(),
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    fullAddress: item.display_name,
  }))
}

/**
 * Reverse geocode coordinates to an address
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{label: string, fullAddress: string}>}
 */
async function reverseGeocode(lat, lng) {
  const params = new URLSearchParams({
    format: 'json',
    lat: lat.toString(),
    lon: lng.toString(),
    addressdetails: '1',
  })

  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { 'Accept-Language': 'en' },
  })

  if (!response.ok) {
    return { label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, fullAddress: '' }
  }

  const data = await response.json()
  const addr = data.address || {}
  const shortLabel = [addr.road, addr.suburb || addr.neighbourhood, addr.city || addr.town]
    .filter(Boolean)
    .join(', ')

  return {
    label: shortLabel || data.display_name?.split(',').slice(0, 3).join(',').trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    fullAddress: data.display_name || '',
  }
}

/**
 * Vue composable wrapper
 */
export function useGeocoding() {
  return {
    searchLocations,
    reverseGeocode,
  }
}
