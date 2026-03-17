/**
 * Composable for Jeepney Route Matching
 * Hybrid approach: coordinate-based + terminal-based matching
 */

import { ref } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

// Distance thresholds (in meters)
const NEAR_TERMINAL_THRESHOLD = 500 // 500m from terminal
const NEAR_ROUTE_THRESHOLD = 100 // 100m from route polyline
const TRANSFER_WALK_THRESHOLD = 400 // 400m walking distance for transfers

export function useJeepneyRouteMatching() {
  const loading = ref(false)
  const error = ref(null)
  const jeepneys = ref([])

  /**
   * Load all active jeepneys from Firestore
   */
  const loadJeepneys = async () => {
    loading.value = true
    error.value = null

    try {
      const jeepneysQuery = query(collection(db, 'jeepneys'), where('isActive', '==', true))
      const snapshot = await getDocs(jeepneysQuery)

      jeepneys.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      loading.value = false
      return jeepneys.value
    } catch (err) {
      console.error('[RouteMatching] Error loading jeepneys:', err)
      error.value = err.message
      loading.value = false
      return []
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {[number, number]} coord1 - [lat, lng]
   * @param {[number, number]} coord2 - [lat, lng]
   * @returns {number} Distance in meters
   */
  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (coord1[0] * Math.PI) / 180
    const φ2 = (coord2[0] * Math.PI) / 180
    const Δφ = ((coord2[0] - coord1[0]) * Math.PI) / 180
    const Δλ = ((coord2[1] - coord1[1]) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * Calculate distance from point to line segment
   * @param {[number, number]} point - [lat, lng]
   * @param {[number, number]} lineStart - [lat, lng]
   * @param {[number, number]} lineEnd - [lat, lng]
   * @returns {number} Distance in meters
   */
  const distanceToLineSegment = (point, lineStart, lineEnd) => {
    const R = 6371e3
    const pLat = (point[0] * Math.PI) / 180
    const pLng = (point[1] * Math.PI) / 180
    const sLat = (lineStart[0] * Math.PI) / 180
    const sLng = (lineStart[1] * Math.PI) / 180
    const eLat = (lineEnd[0] * Math.PI) / 180
    const eLng = (lineEnd[1] * Math.PI) / 180

    // Convert to Cartesian (approximation for small distances)
    const px = Math.cos(pLat) * Math.cos(pLng)
    const py = Math.cos(pLat) * Math.sin(pLng)
    const pz = Math.sin(pLat)

    const sx = Math.cos(sLat) * Math.cos(sLng)
    const sy = Math.cos(sLat) * Math.sin(sLng)
    const sz = Math.sin(sLat)

    const ex = Math.cos(eLat) * Math.cos(eLng)
    const ey = Math.cos(eLat) * Math.sin(eLng)
    const ez = Math.sin(eLat)

    // Vector from start to end
    const dx = ex - sx
    const dy = ey - sy
    const dz = ez - sz

    // Vector from start to point
    const px2 = px - sx
    const py2 = py - sy
    const pz2 = pz - sz

    // Project point onto line
    const t = (px2 * dx + py2 * dy + pz2 * dz) / (dx * dx + dy * dy + dz * dz)

    // Clamp to segment
    const tClamped = Math.max(0, Math.min(1, t))

    // Closest point on segment
    const closestX = sx + tClamped * dx
    const closestY = sy + tClamped * dy
    const closestZ = sz + tClamped * dz

    // Distance from point to closest point
    const distX = px - closestX
    const distY = py - closestY
    const distZ = pz - closestZ

    const angularDist = Math.sqrt(distX * distX + distY * distY + distZ * distZ)
    return R * angularDist
  }

  /**
   * Check if a coordinate is near a route polyline
   * @param {[number, number]} coord - [lat, lng]
   * @param {Array<Array<number>>} routeCoordinates - Array of [lng, lat] pairs
   * @param {number} threshold - Distance threshold in meters
   * @returns {{isNear: boolean, minDistance: number, nearestPoint: [number, number]}}
   */
  const isNearRoute = (coord, routeCoordinates, threshold = NEAR_ROUTE_THRESHOLD) => {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return { isNear: false, minDistance: Infinity, nearestPoint: null }
    }

    let minDistance = Infinity
    let nearestPoint = null

    // Convert coord to [lat, lng] format
    const pointCoord = [coord[0], coord[1]]

    // Check distance to each segment of the route
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      // routeCoordinates is in [lng, lat] format, convert to [lat, lng]
      const segmentStart = [routeCoordinates[i][1], routeCoordinates[i][0]]
      const segmentEnd = [routeCoordinates[i + 1][1], routeCoordinates[i + 1][0]]

      const distance = distanceToLineSegment(pointCoord, segmentStart, segmentEnd)

      if (distance < minDistance) {
        minDistance = distance
        nearestPoint = segmentStart
      }
    }

    return {
      isNear: minDistance <= threshold,
      minDistance,
      nearestPoint,
    }
  }

  /**
   * Find jeepneys for single ride (direct route)
   * @param {[number, number]} startCoord - [lat, lng]
   * @param {[number, number]} endCoord - [lat, lng]
   * @returns {Promise<Array>}
   */
  const findSingleRide = async (startCoord, endCoord) => {
    if (jeepneys.value.length === 0) {
      await loadJeepneys()
    }

    const matchingJeepneys = []

    for (const jeepney of jeepneys.value) {
      const routeCoords = jeepney.routeCoordinates || jeepney.routePoints || []
      const terminalCoords = [jeepney.terminalLat, jeepney.terminalLng]

      // Check if start is near terminal OR near route
      const startNearTerminal = calculateDistance(startCoord, terminalCoords) <= NEAR_TERMINAL_THRESHOLD
      const startNearRoute = isNearRoute(startCoord, routeCoords, NEAR_ROUTE_THRESHOLD)

      // Check if end is near route
      const endNearRoute = isNearRoute(endCoord, routeCoords, NEAR_ROUTE_THRESHOLD * 2)

      // Single ride: start near terminal/route AND end near route
      if ((startNearTerminal || startNearRoute.isNear) && endNearRoute.isNear) {
        matchingJeepneys.push({
          ...jeepney,
          rideType: 'single',
          startDistance: startNearTerminal
            ? calculateDistance(startCoord, terminalCoords)
            : startNearRoute.minDistance,
          endDistance: endNearRoute.minDistance,
          walkToTerminal: !startNearTerminal,
          confidence: calculateConfidence(startNearTerminal, startNearRoute, endNearRoute),
        })
      }
    }

    // Sort by confidence score
    matchingJeepneys.sort((a, b) => b.confidence - a.confidence)

    return matchingJeepneys
  }

  /**
   * Find jeepneys for double ride (with transfer)
   * @param {[number, number]} startCoord - [lat, lng]
   * @param {[number, number]} endCoord - [lat, lng]
   * @returns {Promise<Array>}
   */
  const findDoubleRide = async (startCoord, endCoord) => {
    if (jeepneys.value.length === 0) {
      await loadJeepneys()
    }

    const doubleRideOptions = []

    // Find jeepneys that go to destination
    const jeepneysToDest = []
    for (const jeepney of jeepneys.value) {
      const routeCoords = jeepney.routeCoordinates || jeepney.routePoints || []
      const endNearRoute = isNearRoute(endCoord, routeCoords, NEAR_ROUTE_THRESHOLD * 3)

      if (endNearRoute.isNear) {
        jeepneysToDest.push({
          ...jeepney,
          endDistance: endNearRoute.minDistance,
          transferPoint: endNearRoute.nearestPoint,
        })
      }
    }

    // For each jeepney going to destination, find connecting jeepneys from start
    for (const destJeepney of jeepneysToDest) {
      const transferCoord = destJeepney.transferPoint || [
        destJeepney.terminalLat,
        destJeepney.terminalLng,
      ]

      for (const startJeepney of jeepneys.value) {
        if (startJeepney.id === destJeepney.id) continue // Skip same jeepney

        const startRouteCoords = startJeepney.routeCoordinates || startJeepney.routePoints || []
        const startTerminalCoords = [startJeepney.terminalLat, startJeepney.terminalLng]

        // Check if start is near this jeepney's terminal
        const startNearTerminal =
          calculateDistance(startCoord, startTerminalCoords) <= NEAR_TERMINAL_THRESHOLD

        // Check if transfer point is near this jeepney's route
        const transferNearRoute = isNearRoute(transferCoord, startRouteCoords, TRANSFER_WALK_THRESHOLD)

        // Double ride: start near first jeepney AND can transfer to second jeepney
        if (startNearTerminal && transferNearRoute.isNear) {
          const walkDistance = transferNearRoute.minDistance

          doubleRideOptions.push({
            rideType: 'double',
            firstJeepney: {
              ...startJeepney,
              walkToTerminal: !startNearTerminal,
              startDistance: calculateDistance(startCoord, startTerminalCoords),
            },
            secondJeepney: {
              ...destJeepney,
              endDistance: destJeepney.endDistance,
            },
            transferPoint: transferNearRoute.nearestPoint,
            walkToTransfer: walkDistance,
            totalWalkDistance: calculateDistance(startCoord, startTerminalCoords) + walkDistance,
            confidence: 0.8, // Lower confidence for double rides
          })
        }
      }
    }

    // Sort by total walking distance
    doubleRideOptions.sort((a, b) => a.totalWalkDistance - b.totalWalkDistance)

    return doubleRideOptions
  }

  /**
   * Calculate confidence score for route match
   */
  const calculateConfidence = (startNearTerminal, startNearRoute, endNearRoute) => {
    let confidence = 0

    if (startNearTerminal) confidence += 0.5
    else if (startNearRoute.isNear && startNearRoute.minDistance < 50) confidence += 0.3
    else if (startNearRoute.isNear) confidence += 0.2

    if (endNearRoute.isNear && endNearRoute.minDistance < 50) confidence += 0.5
    else if (endNearRoute.isNear) confidence += 0.3

    return confidence
  }

  /**
   * Find all route options (single and double rides)
   * @param {[number, number]} startCoord - [lat, lng]
   * @param {[number, number]} endCoord - [lat, lng]
   * @returns {Promise<{singleRides: Array, doubleRides: Array}>}
   */
  const findAllRoutes = async (startCoord, endCoord) => {
    loading.value = true
    error.value = null

    try {
      const [singleRides, doubleRides] = await Promise.all([
        findSingleRide(startCoord, endCoord),
        findDoubleRide(startCoord, endCoord),
      ])

      loading.value = false

      return {
        singleRides,
        doubleRides,
        hasRoutes: singleRides.length > 0 || doubleRides.length > 0,
      }
    } catch (err) {
      console.error('[RouteMatching] Error finding routes:', err)
      error.value = err.message
      loading.value = false
      return {
        singleRides: [],
        doubleRides: [],
        hasRoutes: false,
      }
    }
  }

  return {
    loading,
    error,
    jeepneys,
    loadJeepneys,
    calculateDistance,
    isNearRoute,
    findSingleRide,
    findDoubleRide,
    findAllRoutes,
  }
}
