/**
 * Route Generation Composable
 *
 * Provides functionality for generating road-following routes using OSRM API
 * and fuzzy-matching place names against the Firestore places collection.
 *
 * @example
 * const { generateRoute, fuzzyMatch, fetchPlaces } = useRouteGeneration()
 * const coordinates = await generateRoute(terminalLat, terminalLng, endPoint, touristSpots)
 */

import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useFirestore } from './useFirebase'

/**
 * Fuzzy match a target name against an array of places
 * Uses case-insensitive partial matching and Levenshtein distance similarity
 *
 * @param {string} targetName - The name to match (e.g., "BenCab Museum")
 * @param {Array} places - Array of place documents from Firestore
 * @returns {Object|null} - Matched place object or null if no match
 */
export function fuzzyMatch(targetName, places) {
  if (!targetName || !places || places.length === 0) {
    return null
  }

  const target = targetName.toLowerCase().trim()

  // 1. First try exact match (case-insensitive)
  const exactMatch = places.find((place) => place.name.toLowerCase().trim() === target)
  if (exactMatch) return exactMatch

  // 2. Then try partial match (target contains place name or vice versa)
  const partialMatch = places.find((place) => {
    const name = place.name.toLowerCase().trim()
    return name.includes(target) || target.includes(name)
  })

  if (partialMatch) return partialMatch

  // 3. Try matching with common word variations and normalization
  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const normalizedTarget = normalize(target)

  const normalizedMatch = places.find((place) => {
    const normalizedName = normalize(place.name)

    // Quick substring check first
    if (normalizedName.includes(normalizedTarget) || normalizedTarget.includes(normalizedName)) {
      return true
    }

    // Split into words and check if all target words are in the place name
    const targetWords = normalizedTarget.split(' ').filter(Boolean)
    const nameWords = normalizedName.split(' ').filter(Boolean)

    // Only apply the "all words match" logic if the target has more than 1 word,
    // to prevent generic words like "Park" from falsely matching the first park.
    // Or if they have the same number of words.
    if (targetWords.length > 1 || targetWords.length === nameWords.length) {
      const allWordsMatch = targetWords.every((word) =>
        nameWords.some(
          (nameWord) => nameWord === word || (word.length > 3 && nameWord.includes(word))
        )
      )
      if (allWordsMatch) return true
    }

    return false
  })

  if (normalizedMatch) return normalizedMatch

  // 4. Fallback to Levenshtein distance similarity
  let bestMatch = null
  let maxSimilarity = 0
  const SIMILARITY_THRESHOLD = 0.8 // 80% similarity

  for (const place of places) {
    const name = place.name.toLowerCase().trim()
    const sim = calculateSimilarity(target, name)
    if (sim > maxSimilarity && sim >= SIMILARITY_THRESHOLD) {
      maxSimilarity = sim
      bestMatch = place
    }
  }

  return bestMatch
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} s1
 * @param {string} s2
 * @returns {number} - Similarity between 0 and 1
 */
function calculateSimilarity(s1, s2) {
  const longer = s1.length < s2.length ? s2 : s1
  const shorter = s1.length < s2.length ? s1 : s2
  const longerLength = longer.length
  if (longerLength === 0) return 1.0

  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
}

/**
 * Calculate Levenshtein edit distance between two strings
 */
function editDistance(s1, s2) {
  const costs = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else {
        if (j > 0) {
          let newValue = costs[j - 1]
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

/**
 * Fetch all places from Firestore collection
 *
 * @returns {Promise<Array>} - Array of place objects with id, name, latitude, longitude, category
 */
const parseLatLngString = (text) => {
  if (!text || typeof text !== 'string') return null
  const parts = text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length !== 2) return null
  const lat = Number(parts[0])
  const lng = Number(parts[1])
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng }
  }
  return null
}

export async function fetchPlaces() {
  const { db } = useFirestore()

  try {
    const placesRef = collection(db, 'places')
    const querySnapshot = await getDocs(placesRef)

    const places = querySnapshot.docs
      .filter((doc) => !doc.data().isDeleted)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

    console.log('[RouteGeneration] Fetched', places.length, 'places from Firestore')
    return places
  } catch (error) {
    console.error('[RouteGeneration] Error fetching places:', error)
    throw new Error('Failed to fetch places from database')
  }
}

/**
 * Build OSRM API URL with waypoints
 *
 * IMPORTANT: OSRM expects coordinates in [longitude, latitude] order
 *
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @returns {string} - OSRM API URL
 */
export function buildOSRMUrl(waypoints) {
  if (!waypoints || waypoints.length === 0) {
    throw new Error('No waypoints provided for route generation')
  }

  // Convert waypoints to OSRM format: lon,lat;lon,lat;lon,lat
  const coords = waypoints.map((wp) => `${wp.longitude},${wp.latitude}`).join(';')

  // Use OSRM public demo server
  // Parameters:
  // - overview=full: Return full geometry
  // - geometries=geojson: Return GeoJSON format
  // - steps=false: We don't need turn-by-turn steps, just the geometry
  return `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
}

/**
 * Call OpenRouteService API as a fallback when OSRM fails or is rate-limited
 *
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @returns {Promise<Object>} - Object formatted exactly like OSRM response
 */
async function callOpenRouteService(waypoints) {
  const apiKey = import.meta.env.VITE_ORS_API_KEY
  if (!apiKey) {
    throw new Error('OpenRouteService API key not configured')
  }

  // ORS expects [[lon, lat], [lon, lat]] format for POST requests
  const coordinates = waypoints.map((wp) => [wp.longitude, wp.latitude])

  console.log('[RouteGeneration] Falling back to OpenRouteService API')

  const response = await fetch(
    'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json, application/geo+json; charset=utf-8',
        Authorization: apiKey,
      },
      body: JSON.stringify({
        coordinates: coordinates,
        instructions: false, // We don't need turn-by-turn steps
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ORS API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.features || data.features.length === 0) {
    throw new Error('No routes found by ORS')
  }

  const feature = data.features[0]

  // ORS returns GeoJSON with coordinates in [longitude, latitude] order
  // This is the exact same format we need and that OSRM returns
  const routeCoordinates = feature.geometry.coordinates
  const properties = feature.properties

  // ORS summary provides distance and duration
  const distance = properties.segments.reduce((acc, seg) => acc + seg.distance, 0)
  const duration = properties.segments.reduce((acc, seg) => acc + seg.duration, 0)

  console.log('[RouteGeneration] ORS fallback route generated successfully')

  return {
    coordinates: routeCoordinates,
    distance: distance,
    duration: duration,
    waypoints: waypoints.length,
    provider: 'ors',
  }
}

/**
 * Call OSRM API to generate route (with Caching and ORS Fallback)
 *
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @returns {Promise<Object>} - Object with coordinates array and metadata
 */
export async function callOSRM(waypoints) {
  const url = buildOSRMUrl(waypoints)

  // Create a unique cache key based on the coordinate string
  const coordsStr = waypoints.map((wp) => `${wp.longitude},${wp.latitude}`).join(';')
  const cacheKey = `osrm_route_${coordsStr}`

  // 1. Check Local Browser Cache First
  try {
    const cachedRoute = localStorage.getItem(cacheKey)
    if (cachedRoute) {
      console.log('[RouteGeneration] Returning route from local cache (0 API calls)')
      return JSON.parse(cachedRoute)
    }
  } catch (e) {
    console.warn('[RouteGeneration] Failed to read from localStorage:', e)
  }

  // Safe hash for Firestore document ID (slashes/special chars aren't allowed)
  const docId = cacheKey.replace(/[.,;]/g, '_')

  // 2. Check Global Firestore Cache
  try {
    const cacheDocRef = doc(db, 'route_cache', docId)
    const cacheDocSnap = await getDoc(cacheDocRef)

    if (cacheDocSnap.exists()) {
      console.log(
        '[RouteGeneration] Returning route from Firestore global cache (0 OSRM API calls)'
      )
      const cachedData = cacheDocSnap.data()

      // Save back to local browser cache for next time
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cachedData))
      } catch (err) {
        // ignore
        console.debug('Failed to sync Firestore to local cache:', err)
      }

      return cachedData
    }
  } catch (e) {
    console.warn('[RouteGeneration] Failed to read from Firestore cache:', e)
  }

  console.log('[RouteGeneration] Calling OSRM API with', waypoints.length, 'waypoints')
  console.log('[RouteGeneration] OSRM URL:', url)

  try {
    let response = await fetch(url)

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[RouteGeneration] OSRM rate limited (429). Triggering ORS fallback.')
        try {
          const orsResult = await callOpenRouteService(waypoints)

          orsResult.createdAt = new Date().toISOString()

          // Save successful ORS result to caches
          try {
            localStorage.setItem(cacheKey, JSON.stringify(orsResult))
          } catch (err) {
            console.debug(err)
          }
          try {
            await setDoc(doc(db, 'route_cache', docId), orsResult)
          } catch (err) {
            console.debug(err)
          }

          return orsResult
        } catch (orsError) {
          console.error('[RouteGeneration] ORS Fallback also failed:', orsError)
          throw new Error(`OSRM rate limited and ORS fallback failed: ${orsError.message}`)
        }
      }
      throw new Error(`OSRM API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.code !== 'Ok') {
      throw new Error(`OSRM returned error code: ${data.code}`)
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found by OSRM')
    }

    const route = data.routes[0]
    const geometry = route.geometry

    // OSRM returns GeoJSON with coordinates in [longitude, latitude] order
    // This is exactly what we need to store in Firestore
    const coordinates = geometry.coordinates

    console.log('[RouteGeneration] Route generated successfully')
    console.log('[RouteGeneration] Total distance:', route.distance, 'meters')
    console.log('[RouteGeneration] Total duration:', route.duration, 'seconds')
    console.log('[RouteGeneration] Number of coordinate points:', coordinates.length)

    const result = {
      coordinates, // Array of [lng, lat] pairs - ready to save to Firestore
      distance: route.distance,
      duration: route.duration,
      waypoints: waypoints.length,
      createdAt: new Date().toISOString(),
    }

    // 3. Save successful result to Local Browser Cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result))
    } catch (e) {
      console.warn('[RouteGeneration] Failed to write to localStorage (cache full?):', e)
    }

    // 4. Save successful result to Global Firestore Cache
    try {
      const cacheDocRef = doc(db, 'route_cache', docId)
      await setDoc(cacheDocRef, result)
      console.log('[RouteGeneration] Route saved to global Firestore cache')
    } catch (e) {
      console.warn('[RouteGeneration] Failed to write to Firestore cache:', e)
    }

    return result
  } catch (error) {
    console.error('[RouteGeneration] OSRM API error:', error)
    throw error
  }
}

/**
 * Main route generation function
 *
 * Takes a jeepney document and generates a road-following route by:
 * 1. Fetching all places from Firestore
 * 2. Fuzzy-matching the end point and tourist spots to get coordinates
 * 3. Building waypoints: terminal → tourist spots → end point
 * 4. Calling OSRM to generate the route
 *
 * @param {Object} jeepneyData - Jeepney document data
 * @param {number} jeepneyData.terminalLat - Terminal latitude
 * @param {number} jeepneyData.terminalLng - Terminal longitude
 * @param {string} jeepneyData.endPoint - End point name (to be matched)
 * @param {Array<string>} jeepneyData.touristSpotsServiced - Array of tourist spot names
 * @returns {Promise<Object>} - Route generation result with coordinates and metadata
 */
export async function generateRoute(jeepneyData) {
  const {
    terminalLat,
    terminalLng,
    endPoint,
    endPointLat,
    endPointLng,
    touristSpotsServiced = [],
  } = jeepneyData

  // Validate required fields
  if (!terminalLat || !terminalLng) {
    throw new Error('Terminal coordinates are required')
  }

  if (!endPoint) {
    throw new Error('End point is required')
  }

  console.log('[RouteGeneration] Starting route generation...')
  console.log('[RouteGeneration] Terminal:', { lat: terminalLat, lng: terminalLng })
  console.log('[RouteGeneration] End Point:', endPoint)
  console.log('[RouteGeneration] Tourist Spots:', touristSpotsServiced)

  // Step 1: Fetch all places from Firestore
  const places = await fetchPlaces()

  if (places.length === 0) {
    throw new Error('No places found in database. Please add places to the "places" collection.')
  }

  // Step 2: Build waypoints array
  const waypoints = []

  // Add terminal as starting point
  waypoints.push({
    name: 'Terminal',
    latitude: terminalLat,
    longitude: terminalLng,
  })

  // Add tourist spots (fuzzy-matched)
  const matchedSpots = []
  const unmatchedSpots = []

  for (const spotName of touristSpotsServiced) {
    const matched = fuzzyMatch(spotName, places)
    if (matched) {
      waypoints.push({
        name: matched.name,
        latitude: matched.latitude,
        longitude: matched.longitude,
      })
      matchedSpots.push(matched.name)
    } else {
      unmatchedSpots.push(spotName)
    }
  }

  if (unmatchedSpots.length > 0) {
    console.warn('[RouteGeneration] Could not match these tourist spots:', unmatchedSpots)
  }

  // Add end point (fuzzy-matched or explicit coordinates)
  let endPointMatched = null

  if (endPointLat != null && endPointLng != null) {
    endPointMatched = {
      name: endPoint,
      latitude: endPointLat,
      longitude: endPointLng,
    }
  } else {
    endPointMatched = fuzzyMatch(endPoint, places)

    if (!endPointMatched) {
      const parsed = parseLatLngString(endPoint)
      if (parsed) {
        endPointMatched = {
          name: endPoint,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        }
      }
    }
  }

  if (!endPointMatched) {
    throw new Error(
      `Could not find coordinates for end point "${endPoint}". ` +
        `Please add this location to the "places" collection or use coordinates in the form of "lat,lng".`
    )
  }

  waypoints.push({
    name: endPointMatched.name,
    latitude: endPointMatched.latitude,
    longitude: endPointMatched.longitude,
  })

  console.log('[RouteGeneration] Waypoints built:', waypoints)
  console.log('[RouteGeneration] Matched spots:', matchedSpots)
  console.log('[RouteGeneration] Unmatched spots:', unmatchedSpots)

  // Step 3: Call OSRM to generate route
  const routeResult = await callOSRM(waypoints)

  return {
    coordinates: routeResult.coordinates,
    distance: routeResult.distance,
    duration: routeResult.duration,
    waypointsCount: routeResult.waypoints,
    matchedSpots,
    unmatchedSpots,
    waypoints: waypoints.map((wp) => ({
      name: wp.name,
      latitude: wp.latitude,
      longitude: wp.longitude,
    })),
  }
}

/**
 * Composable function to use route generation features
 *
 * @returns {Object} - Route generation utilities
 */
export function useRouteGeneration() {
  return {
    generateRoute,
    fuzzyMatch,
    fetchPlaces,
    buildOSRMUrl,
    callOSRM,
  }
}

export default useRouteGeneration
// --rabbit --K
