/**
 * Geographic Utility Functions
 */

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
export const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

/**
 * Calculate the distance between two geographical coordinates using the Haversine formula.
 *
 * @param {Array<number>} coords1 - First coordinate as [lat, lng]
 * @param {Array<number>} coords2 - Second coordinate as [lat, lng]
 * @returns {number} Distance in meters (if R=6371e3) or kilometers (if R=6371).
 *                   This function returns meters to standardize across the codebase.
 */
export const calculateDistance = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2) return Infinity

  const R = 6371e3 // Earth's radius in meters
  const dLat = deg2rad(coords2[0] - coords1[0])
  const dLon = deg2rad(coords2[1] - coords1[1])
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1[0])) *
      Math.cos(deg2rad(coords2[0])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default {
  calculateDistance,
  deg2rad,
}
