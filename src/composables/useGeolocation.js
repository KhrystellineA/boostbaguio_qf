/**
 * Composable for Geolocation
 * Uses browser's navigator.geolocation API to detect user's current location
 */

import { ref } from 'vue'

export function useGeolocation() {
  const loading = ref(false)
  const error = ref(null)
  const location = ref(null)

  /**
   * Get user's current location using browser geolocation API
   * @returns {Promise<{lat: number, lng: number, accuracy: number}>}
   */
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation is not supported by your browser'
        error.value = errorMsg
        reject(new Error(errorMsg))
        return
      }

      loading.value = true
      error.value = null

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          location.value = coords
          loading.value = false
          resolve(coords)
        },
        (err) => {
          loading.value = false
          let errorMsg = 'Unable to retrieve your location'

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable location access in your browser settings.'
              break
            case err.POSITION_UNAVAILABLE:
              errorMsg = 'Location information is unavailable.'
              break
            case err.TIMEOUT:
              errorMsg = 'Location request timed out.'
              break
            default:
              errorMsg = err.message || errorMsg
          }

          error.value = errorMsg
          reject(new Error(errorMsg))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  /**
   * Watch user's location continuously
   * @param {Function} callback - Function to call with location updates
   * @returns {Function} - Function to stop watching
   */
  const watchLocation = (callback) => {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by your browser'
      return () => {}
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        location.value = coords
        callback(coords)
      },
      (err) => {
        error.value = err.message || 'Error watching location'
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    // Return function to stop watching
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  /**
   * Clear location data
   */
  const clearLocation = () => {
    location.value = null
    error.value = null
  }

  return {
    loading,
    error,
    location,
    getCurrentLocation,
    watchLocation,
    clearLocation,
  }
}
