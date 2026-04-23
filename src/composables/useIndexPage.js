/**
 * Composable for IndexPage location and navigation logic
 */

import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useGeocoding } from './useGeocoding'

export function useIndexPage() {
  const $q = useQuasar()
  const router = useRouter()
  const { searchLocations, reverseGeocode } = useGeocoding()

  const fromLocationText = ref('')
  const fromLocation = ref(null)
  const toLocation = ref(null)
  const fromLocationOptions = ref([])
  const toLocationOptions = ref([])
  const fromAutoDetect = ref(false)
  const heroImage = ref('')
  const geoLoading = ref(false)

  const destinationOptions = [
    { label: 'SM City Baguio', value: 'sm-baguio', coords: [16.4088516, 120.5972273] },
    { label: 'Burnham Park', value: 'burnham-park', coords: [16.40954, 120.594808] },
    { label: 'Session Road', value: 'session-road', coords: [16.4091098, 120.597576] },
    { label: 'Baguio Cathedral', value: 'baguio-cathedral', coords: [16.412766, 120.598469] },
    { label: 'Baguio City Market', value: 'baguio-market', coords: [16.4149596, 120.5929984] },
    { label: 'Camp John Hay', value: 'camp-john-hay', coords: [16.397029, 120.608785] },
    { label: 'Mines View Park', value: 'mines-view', coords: [16.4240885, 120.6212975] },
    { label: 'Wright Park', value: 'wright-park', coords: [16.4156996, 120.6123524] },
    { label: 'The Mansion', value: 'the-mansion', coords: [16.4123678, 120.6188978] },
    { label: "Teacher's Camp", value: 'teachers-camp', coords: [16.4130217, 120.6072952] },
    { label: 'Botanical Garden', value: 'botanical-garden', coords: [16.4176, 120.597] },
    { label: 'Baguio Convention Center', value: 'convention-center', coords: [16.409, 120.594] },
    { label: 'Baguio General Hospital', value: 'bgh', coords: [16.4068, 120.5995] },
    { label: 'University of Baguio', value: 'ub', coords: [16.4111, 120.6005] },
    { label: 'Saint Louis University', value: 'slu', coords: [16.4133, 120.5967] },
    { label: 'Good Shepherd Convent', value: 'good-shepherd', coords: [16.4196, 120.604] },
    { label: 'Tam-awan Village', value: 'tam-awan', coords: [16.4231, 120.5889] },
    { label: 'Lourdes Grotto', value: 'lourdes-grotto', coords: [16.4253, 120.5972] },
    { label: 'PMA (Philippine Military Academy)', value: 'pma', coords: [16.3928, 120.5962] },
    { label: 'BenCab Museum', value: 'bencab-museum', coords: [16.3989, 120.5756] },
    { label: 'Strawberry Farm', value: 'strawberry-farm', coords: [16.3989, 120.5989] },
    { label: 'Igorot Stone Kingdom', value: 'igorot-stone-kingdom', coords: [16.4589, 120.5889] },
    { label: 'Baguio National Museum', value: 'national-museum', coords: [16.4156, 120.5989] },
    { label: 'Mirador Park', value: 'mirador-park', coords: [16.4267, 120.5956] },
    { label: 'Baguio Craft Brewery', value: 'craft-brewery', coords: [16.4056, 120.5989] },
    { label: 'Café by the Ruins', value: 'cafe-ruins', coords: [16.4145, 120.6012] },
    { label: 'Volcano Island Coffee', value: 'volcano-coffee', coords: [16.4145, 120.5972] },
    { label: 'Pinecone House', value: 'pinecone-house', coords: [16.4123, 120.5967] },
    { label: 'Baguio Country Club', value: 'country-club', coords: [16.4089, 120.6123] },
    { label: 'La Trinidad Fish Market', value: 'fish-market', coords: [16.3989, 120.5956] },
    { label: 'Baguio Sunset Point', value: 'sunset-point', coords: [16.4189, 120.5856] },
    { label: 'Baguio Heritage Park', value: 'heritage-park', coords: [16.4112, 120.5945] },
    { label: 'Baguio Arts Village', value: 'arts-village', coords: [16.4245, 120.5878] },
  ]

  const loadHeroImage = async () => {
    try {
      const docRef = doc(db, 'pagePhotos', 'home')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.imageUrl) heroImage.value = data.imageUrl
      }
    } catch (error) {
      console.error('[IndexPage] Error loading hero image:', error)
    }
  }

  const searchFromLocation = async () => {
    if (!fromLocationText.value.trim()) {
      $q.notify({
        type: 'warning',
        message: 'Please enter a starting location',
        position: 'top',
      })
      return
    }

    const searchQuery = fromLocationText.value.trim()
    try {
      const results = await searchLocations(searchQuery, true)
      if (results && results.length > 0) {
        const bestMatch = results[0]
        fromLocation.value = {
          label: bestMatch.label,
          value: 'geocoded-location',
          coords: [bestMatch.lat, bestMatch.lng],
        }
        fromLocationText.value = bestMatch.label
        $q.notify({
          type: 'positive',
          message: `Location found: ${bestMatch.label}`,
          position: 'top',
          timeout: 2000,
        })
      } else {
        fromLocation.value = {
          label: searchQuery,
          value: 'text-location',
          coords: null,
        }
        $q.notify({
          type: 'info',
          message: 'Location not found. Using text as-is.',
          position: 'top',
        })
      }
    } catch {
      fromLocation.value = {
        label: searchQuery,
        value: 'text-location',
        coords: null,
      }
    }
  }

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
    fromLocationText.value = 'Detecting your address...'
    geoLoading.value = true

    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
            })
          },
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      })

      const addressResult = await reverseGeocode(coords.lat, coords.lng)
      const readableLocation = addressResult.label || 'Your Current Location'
      fromLocation.value = {
        lat: coords.lat,
        lng: coords.lng,
        label: readableLocation,
        coords: [coords.lat, coords.lng],
      }
      fromLocationText.value = readableLocation

      $q.notify({
        type: 'positive',
        message: `Location detected: ${readableLocation}`,
        position: 'top',
        timeout: 3000,
      })
    } catch (err) {
      console.error('[IndexPage] Location detection error:', err)
      fromAutoDetect.value = false
      fromLocationText.value = ''
      fromLocation.value = null
      $q.notify({
        type: 'warning',
        message: 'Unable to detect location. Please enter manually.',
        position: 'top',
      })
    } finally {
      geoLoading.value = false
    }
  }

  const disableFromAutoDetect = () => {
    fromAutoDetect.value = false
    fromLocationText.value = ''
    fromLocation.value = null
  }

  const startNavigation = async () => {
    if (!toLocation.value) {
      $q.notify({
        type: 'warning',
        message: 'Please select a destination',
        position: 'top',
      })
      return
    }

    if (
      !fromLocation.value?.coords &&
      !fromLocation.value?.lat &&
      fromLocationText.value &&
      !fromAutoDetect.value
    ) {
      await searchFromLocation()
    }

    if (geoLoading.value && fromAutoDetect.value) {
      $q.notify({
        type: 'warning',
        message: 'Waiting for GPS detection to complete...',
        position: 'top',
      })
      return
    }

    const toLabel = toLocation.value.label || toLocation.value
    const toCoords = toLocation.value.coords || null

    const queryParams = { toName: toLabel }
    if (toCoords) {
      queryParams.toLat = toCoords[0].toString()
      queryParams.toLng = toCoords[1].toString()
    }

    if (fromLocation.value?.coords) {
      queryParams.fromName = fromLocation.value.label || 'Current Location'
      queryParams.fromLat = fromLocation.value.coords[0].toString()
      queryParams.fromLng = fromLocation.value.coords[1].toString()
    } else if (fromLocation.value?.lat && fromLocation.value?.lng) {
      queryParams.fromName = fromLocation.value.label || 'Current Location'
      queryParams.fromLat = fromLocation.value.lat.toString()
      queryParams.fromLng = fromLocation.value.lng.toString()
    } else if (fromLocationText.value) {
      queryParams.fromName = fromLocationText.value
    }

    router.push({ path: '/apanam', query: queryParams })
  }

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('#features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  onMounted(() => {
    loadHeroImage()
    toLocationOptions.value = destinationOptions
    fromLocationOptions.value = destinationOptions
  })

  return {
    fromLocationText,
    fromLocation,
    toLocation,
    fromLocationOptions,
    toLocationOptions,
    fromAutoDetect,
    geoLoading,
    heroImage,

    searchFromLocation,
    detectCurrentLocation,
    disableFromAutoDetect,
    startNavigation,
    scrollToFeatures,
  }
}
