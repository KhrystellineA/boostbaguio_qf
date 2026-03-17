/**
 * Composable for OSRM Walking Directions
 * Uses OpenStreetMap Routing Machine for walking route guidance
 */

import { ref } from 'vue'

export function useWalkingDirections() {
  const loading = ref(false)
  const error = ref(null)
  const route = ref(null)

  /**
   * Get walking directions between two points using OSRM
   * @param {[number, number]} start - [lat, lng]
   * @param {[number, number]} end - [lat, lng]
   * @returns {Promise<{distance: number, duration: number, steps: Array, geometry: Array}>}
   */
  const getWalkingDirections = async (start, end) => {
    loading.value = true
    error.value = null

    try {
      // OSRM expects [lng, lat] format
      const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true&annotations=true`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to get walking directions')
      }

      const data = await response.json()

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No walking route found')
      }

      const osrmRoute = data.routes[0]

      // Parse route steps
      const steps = osrmRoute.legs[0].steps.map((step, index) => {
        const instruction = simplifyInstruction(step.maneuver.instruction)
        return {
          stepNumber: index + 1,
          instruction,
          distance: step.distance,
          duration: step.duration,
          direction: getDirection(step.maneuver.bearing_after),
          coordinates: [step.maneuver.location[1], step.maneuver.location[0]], // [lat, lng]
        }
      })

      // Add start and end steps
      steps.unshift({
        stepNumber: 0,
        instruction: 'Start walking',
        distance: 0,
        duration: 0,
        direction: getDirection(osrmRoute.legs[0].steps[0]?.maneuver.bearing_after || 0),
        coordinates: start,
      })

      steps.push({
        stepNumber: steps.length,
        instruction: 'You have arrived at your destination',
        distance: 0,
        duration: 0,
        direction: null,
        coordinates: end,
      })

      route.value = {
        distance: osrmRoute.distance, // meters
        duration: osrmRoute.duration, // seconds
        steps,
        geometry: osrmRoute.geometry?.coordinates?.map((coord) => [coord[1], coord[0]]) || [], // Convert to [lat, lng]
      }

      loading.value = false
      return route.value
    } catch (err) {
      console.error('[WalkingDirections] Error:', err)
      error.value = err.message
      loading.value = false

      // Fallback: simple direct route
      return getSimpleWalkingDirections(start, end)
    }
  }

  /**
   * Simplify OSRM instructions for better UX
   */
  const simplifyInstruction = (instruction) => {
    const replacements = {
      'Head on': 'Continue',
      'Turn right': 'Turn right',
      'Turn left': 'Turn left',
      'Keep right': 'Keep right',
      'Keep left': 'Keep left',
      'Merge right': 'Merge right',
      'Merge left': 'Merge left',
      'Fork': 'At the fork',
      'End of road': 'At the end of the road',
      'Roundabout': 'Take the exit',
      'Continue': 'Continue straight',
    }

    for (const [key, value] of Object.entries(replacements)) {
      if (instruction.includes(key)) {
        return instruction.replace(key, value)
      }
    }

    return instruction
  }

  /**
   * Get cardinal direction from bearing
   */
  const getDirection = (bearing) => {
    if (bearing === null || bearing === undefined) return null

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(bearing / 45) % 8
    return directions[index]
  }

  /**
   * Fallback simple walking directions (direct line)
   */
  const getSimpleWalkingDirections = (start, end) => {
    const distance = calculateDistance(start, end)
    const duration = (distance / 80) * 60 // Assume 80m/min walking speed

    route.value = {
      distance,
      duration,
      steps: [
        {
          stepNumber: 0,
          instruction: 'Start walking',
          distance: 0,
          duration: 0,
          coordinates: start,
        },
        {
          stepNumber: 1,
          instruction: `Walk ${formatDistance(distance)} toward your destination`,
          distance,
          duration,
          coordinates: end,
        },
        {
          stepNumber: 2,
          instruction: 'You have arrived',
          distance: 0,
          duration: 0,
          coordinates: end,
        },
      ],
      geometry: [start, end],
    }

    return route.value
  }

  /**
   * Calculate distance between two coordinates
   */
  const calculateDistance = (coord1, coord2) => {
    const R = 6371e3 // meters
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
   * Format distance for display
   */
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${Math.round(meters)} m`
  }

  /**
   * Format duration for display
   */
  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60)
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes} min`
  }

  /**
   * Clear route
   */
  const clearRoute = () => {
    route.value = null
    error.value = null
  }

  return {
    loading,
    error,
    route,
    getWalkingDirections,
    formatDistance,
    formatDuration,
    clearRoute,
  }
}
