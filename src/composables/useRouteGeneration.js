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

import { collection, getDocs } from 'firebase/firestore'
import { useFirestore } from './useFirebase'

/**
 * Fuzzy match a target name against an array of places
 * Uses case-insensitive partial matching
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

  // First try exact match (case-insensitive)
  const exactMatch = places.find((place) => place.name.toLowerCase().trim() === target)
  if (exactMatch) return exactMatch

  // Then try partial match (target contains place name or vice versa)
  const partialMatch = places.find((place) => {
    const name = place.name.toLowerCase().trim()
    return name.includes(target) || target.includes(name)
  })

  if (partialMatch) return partialMatch

  // Try matching with common word variations
  const normalizedTarget = target.replace(/\s+/g, ' ').replace(/[^a-z0-9\s]/g, '')

  const normalizedMatch = places.find((place) => {
    const normalizedName = place.name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s]/g, '')
    return normalizedName.includes(normalizedTarget) || normalizedTarget.includes(normalizedName)
  })

  return normalizedMatch || null
}

/**
 * Fetch all places from Firestore collection
 *
 * @returns {Promise<Array>} - Array of place objects with id, name, latitude, longitude, category
 */
export async function fetchPlaces() {
  const { db } = useFirestore()

  try {
    const placesRef = collection(db, 'places')
    const querySnapshot = await getDocs(placesRef)

    const places = querySnapshot.docs.map((doc) => ({
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
 * Call OSRM API to generate route
 *
 * @param {Array} waypoints - Array of {latitude, longitude} objects
 * @returns {Promise<Object>} - Object with coordinates array and metadata
 */
export async function callOSRM(waypoints) {
  const url = buildOSRMUrl(waypoints)

  console.log('[RouteGeneration] Calling OSRM API with', waypoints.length, 'waypoints')
  console.log('[RouteGeneration] OSRM URL:', url)

  try {
    const response = await fetch(url)

    if (!response.ok) {
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

    return {
      coordinates, // Array of [lng, lat] pairs - ready to save to Firestore
      distance: route.distance,
      duration: route.duration,
      waypoints: waypoints.length,
    }
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
  const { terminalLat, terminalLng, endPoint, touristSpotsServiced = [] } = jeepneyData

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

  // Add end point (fuzzy-matched)
  const endPointMatched = fuzzyMatch(endPoint, places)

  if (!endPointMatched) {
    throw new Error(
      `Could not find coordinates for end point "${endPoint}". ` +
        `Please add this location to the "places" collection.`
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
