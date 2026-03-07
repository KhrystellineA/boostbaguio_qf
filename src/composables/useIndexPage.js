/**
 * Composable for IndexPage location and navigation logic
 */

import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBaguioPlaces } from 'src/composables/useBaguioPlaces'

export function useIndexPage() {
  const $q = useQuasar()
  const { getBaguioLocations } = useBaguioPlaces()

  // Location state
  const fromLocationText = ref('')
  const fromLocation = ref(null)
  const toLocation = ref(null)
  const fromLocationOptions = ref([])
  const toLocationOptions = ref([])
  const fromAutoDetect = ref(false)
  const heroImage = ref('')

  // Default locations
  const defaultFromLocations = [
    { label: 'Baguio City Market', value: 'market' },
    { label: 'Session Road', value: 'session-road' },
    { label: 'SM City Baguio', value: 'sm-city' },
    { label: 'Baguio Airport', value: 'airport' },
  ]

  // Load hero image
  const loadHeroImage = async () => {
    try {
      // Add your image loading logic here
      heroImage.value = '' // Set default or loaded image
    } catch (error) {
      console.error('[IndexPage] Error loading hero image:', error)
    }
  }

  // Search from location
  const searchFromLocation = async () => {
    if (!fromLocationText.value) {
      $q.notify({
        type: 'warning',
        message: 'Please enter a starting location',
        position: 'top',
      })
      return
    }

    try {
      const locations = getBaguioLocations()
      fromLocationOptions.value = locations
        .filter(loc => 
          loc.label.toLowerCase().includes(fromLocationText.value.toLowerCase())
        )
      
      if (fromLocationOptions.value.length === 0) {
        fromLocationOptions.value = [{
          label: `Use "${fromLocationText.value}" as starting point`,
          value: fromLocationText.value
        }]
      }
    } catch (error) {
      console.error('[IndexPage] Error searching location:', error)
    }
  }

  // Detect current location
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      $q.notify({
        type: 'negative',
        message: 'Geolocation is not supported by your browser',
        position: 'top',
      })
      return
    }

    fromAutoDetect.value = true
    fromLocationText.value = 'Detecting your location...'

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fromLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Current Location'
        }
        fromLocationText.value = 'Your current location'
        
        $q.notify({
          type: 'positive',
          message: 'Location detected successfully!',
          position: 'top',
        })
      },
      (error) => {
        console.error('[IndexPage] Location detection error:', error)
        fromAutoDetect.value = false
        fromLocationText.value = ''
        
        $q.notify({
          type: 'warning',
          message: 'Unable to detect location. Please enter manually.',
          position: 'top',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Disable auto-detect
  const disableFromAutoDetect = () => {
    fromAutoDetect.value = false
    fromLocationText.value = ''
    fromLocation.value = null
  }

  // Start navigation
  const startNavigation = () => {
    if (!fromLocation.value && !fromLocationText.value) {
      $q.notify({
        type: 'warning',
        message: 'Please select a starting location',
        position: 'top',
      })
      return
    }

    if (!toLocation.value) {
      $q.notify({
        type: 'warning',
        message: 'Please select a destination',
        position: 'top',
      })
      return
    }

    // Navigate to Apanam page with route params
    // This will be handled by the router
    console.log('[IndexPage] Starting navigation:', {
      from: fromLocation.value || fromLocationText.value,
      to: toLocation.value
    })
  }

  // Scroll to features section
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('#features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Load initial data
  onMounted(() => {
    loadHeroImage()
    fromLocationOptions.value = defaultFromLocations
  })

  return {
    // State
    fromLocationText,
    fromLocation,
    toLocation,
    fromLocationOptions,
    toLocationOptions,
    fromAutoDetect,
    heroImage,
    
    // Methods
    searchFromLocation,
    detectCurrentLocation,
    disableFromAutoDetect,
    startNavigation,
    scrollToFeatures,
  }
}
