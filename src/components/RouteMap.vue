<template>
  <div class="route-map-container">
    <!-- Map Container -->
    <div
      ref="mapContainer"
      class="route-map"
      :style="{ height: computedHeight }"
      :class="{ loading: loading, 'has-error': error }"
    >
      <!-- Loading State -->
      <div v-if="loading" class="map-overlay loading-overlay">
        <q-spinner-dots color="primary" size="48px" />
        <div class="loading-text">Loading map...</div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="map-overlay error-overlay">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="error-text">{{ error }}</div>
        <q-btn
          v-if="routePoints && routePoints.length > 0"
          label="Retry"
          color="primary"
          unelevated
          size="sm"
          class="q-mt-sm"
          @click="initializeMap"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="
          showEmptyState &&
          !loading &&
          !error &&
          ((!routePoints && !routeCoordinates) ||
            (routePoints?.length === 0 && routeCoordinates?.length === 0))
        "
        class="map-overlay empty-overlay"
      >
        <q-icon name="map" size="48px" color="grey-5" />
        <div class="empty-text">No route data available</div>
        <div v-if="showGenerateButton" class="q-mt-sm">
          <q-btn
            label="Generate Route"
            color="primary"
            unelevated
            size="sm"
            icon="route"
            @click="$emit('generate-route')"
          />
        </div>
      </div>
    </div>

    <!-- Map Controls -->
    <div v-if="showControls && !loading && !error" class="map-controls">
      <q-btn round dense icon="add" color="primary" class="map-control-btn" @click="zoomIn">
        <q-tooltip>Zoom In</q-tooltip>
      </q-btn>
      <q-btn round dense icon="remove" color="primary" class="map-control-btn" @click="zoomOut">
        <q-tooltip>Zoom Out</q-tooltip>
      </q-btn>
      <q-btn
        round
        dense
        icon="my_location"
        color="primary"
        class="map-control-btn"
        @click="fitToRoute"
      >
        <q-tooltip>Fit to Route</q-tooltip>
      </q-btn>
      <q-btn
        v-if="waypoints && waypoints.length > 0"
        round
        dense
        icon="place"
        color="secondary"
        class="map-control-btn"
        @click="toggleWaypoints"
      >
        <q-tooltip>{{ showWaypoints ? 'Hide' : 'Show' }} Waypoints</q-tooltip>
      </q-btn>
    </div>

    <!-- Waypoints Info Panel -->
    <div v-if="showWaypointsInfo && waypoints && waypoints.length > 0" class="waypoints-info">
      <div class="waypoints-header">
        <q-icon name="place" color="primary" />
        <span class="text-weight-bold">Route Stops ({{ waypoints.length }})</span>
      </div>
      <q-list dense>
        <q-item v-for="(wp, index) in waypoints" :key="index">
          <q-item-section avatar>
            <q-badge
              :color="index === 0 ? 'green' : index === waypoints.length - 1 ? 'red' : 'primary'"
            >
              {{ index + 1 }}
            </q-badge>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ wp.name || `Point ${index + 1}` }}</q-item-label>
            <q-item-label caption>
              {{ wp.latitude.toFixed(6) }}, {{ wp.longitude.toFixed(6) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Route Stats -->
    <div v-if="showStats && (distance || duration)" class="route-stats">
      <div v-if="distance" class="stat-item">
        <q-icon name="straighten" size="16px" />
        <span>{{ formatDistance(distance) }}</span>
      </div>
      <div v-if="duration" class="stat-item">
        <q-icon name="schedule" size="16px" />
        <span>{{ formatDuration(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default defineComponent({
  name: 'RouteMap',

  props: {
    /**
     * Route points as array of [longitude, latitude] pairs
     * This is the format stored in Firestore and returned by OSRM
     * Example: [[120.5934, 16.4136], [120.5940, 16.4140], ...]
     */
    routePoints: {
      type: Array,
      default: null,
    },

    /**
     * Alternative prop name for route coordinates (for backwards compatibility)
     * Same format as routePoints: array of [longitude, latitude] pairs
     * Example: [[120.5934, 16.4136], [120.5940, 16.4140], ...]
     */
    routeCoordinates: {
      type: Array,
      default: null,
    },

    /**
     * Waypoints (stops) along the route
     * Example: [{ name: 'Terminal', latitude: 16.4136, longitude: 120.5934 }]
     */
    waypoints: {
      type: Array,
      default: null,
    },

    /**
     * Map height (e.g., '300px', '400px', '100%')
     */
    height: {
      type: String,
      default: '300px',
    },

    /**
     * Initial map center [lat, lng] if no route points
     */
    center: {
      type: Array,
      default: () => [16.4023, 120.596], // Default to Baguio City
    },

    /**
     * Initial zoom level
     */
    zoom: {
      type: Number,
      default: 13,
    },

    /**
     * Show map controls (zoom, fit, waypoints toggle)
     */
    showControls: {
      type: Boolean,
      default: true,
    },

    /**
     * Show waypoints info panel
     */
    showWaypointsInfo: {
      type: Boolean,
      default: false,
    },

    /**
     * Show route statistics (distance, duration)
     */
    showStats: {
      type: Boolean,
      default: false,
    },

    /**
     * Distance in meters
     */
    distance: {
      type: Number,
      default: 0,
    },

    /**
     * Duration in seconds
     */
    duration: {
      type: Number,
      default: 0,
    },

    /**
     * Show generate button when no route exists
     */
    showGenerateButton: {
      type: Boolean,
      default: false,
    },

    /**
     * Show empty state overlay when no route points
     * Set to false to show map even without route data
     */
    showEmptyState: {
      type: Boolean,
      default: true,
    },

    /**
     * Polyline color
     */
    lineColor: {
      type: String,
      default: '#FF6B35',
    },

    /**
     * Polyline weight (thickness)
     */
    lineWeight: {
      type: Number,
      default: 5,
    },

    /**
     * Polyline opacity
     */
    lineOpacity: {
      type: Number,
      default: 0.8,
    },
  },

  emits: ['generate-route', 'map-ready', 'route-clicked'],

  setup(props, { emit }) {
    const mapContainer = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const showWaypoints = ref(true)

    let map = null
    let routeLayer = null
    let waypointsLayer = null
    let markers = []

    // Compute height with fallback
    const computedHeight = computed(() => {
      return props.height || '300px'
    })

    /**
     * Initialize Leaflet map
     */
    const initializeMap = async () => {
      if (!mapContainer.value) {
        console.error('[RouteMap] Map container element not found')
        error.value = 'Map container not found'
        loading.value = false
        return
      }

      console.log('[RouteMap] Initializing map...')
      console.log('[RouteMap] Container element:', mapContainer.value)
      console.log(
        '[RouteMap] Container dimensions:',
        mapContainer.value.offsetWidth,
        'x',
        mapContainer.value.offsetHeight
      )

      loading.value = true
      error.value = null

      try {
        // Check if L is available
        if (typeof L === 'undefined') {
          throw new Error('Leaflet (L) is not defined. Make sure leaflet is imported.')
        }

        // Destroy existing map if any
        if (map) {
          map.remove()
          map = null
          console.log('[RouteMap] Previous map removed')
        }

        // Clear existing layers
        routeLayer = null
        waypointsLayer = null
        markers = []

        // Create new map instance
        map = L.map(mapContainer.value, {
          zoomControl: false,
          attributionControl: true,
        })

        console.log('[RouteMap] Map instance created:', map)

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        console.log('[RouteMap] Tile layer added')

        // Add route if points are provided (support both routePoints and routeCoordinates)
        const routeData = props.routePoints || props.routeCoordinates
        if (routeData && routeData.length > 0) {
          console.log('[RouteMap] Drawing route with', routeData.length, 'points')
          drawRoute(routeData)
          // Don't set initial view - let drawRoute fit to bounds
        } else {
          console.log('[RouteMap] No route data provided, setting initial view')
          // Set initial view only if no route
          map.setView(props.center, props.zoom)
        }

        // Add waypoints markers
        if (props.waypoints && props.waypoints.length > 0 && showWaypoints.value) {
          addWaypointsMarkers(props.waypoints)
        }

        loading.value = false
        emit('map-ready', { map })

        console.log('[RouteMap] Map initialized successfully')

        // Invalidate map size after a delay to handle dialog rendering
        // This is crucial for maps inside dialogs
        setTimeout(() => {
          if (map) {
            map.invalidateSize()
            console.log('[RouteMap] Map size invalidated')
            // Re-fit to route after invalidating size
            if (routeLayer) {
              fitToRoute()
              console.log('[RouteMap] Re-fitted to route after invalidateSize')
            }
          }
        }, 100)

        // Additional invalidate for dialog rendering
        setTimeout(() => {
          if (map && routeLayer) {
            map.invalidateSize()
            fitToRoute()
            console.log('[RouteMap] Second invalidateSize and fitToRoute')
          }
        }, 200)
      } catch (err) {
        console.error('[RouteMap] Error initializing map:', err)
        error.value = 'Failed to load map: ' + err.message
        loading.value = false
      }
    }

    /**
     * Draw route polyline on map
     *
     * IMPORTANT: routePoints is in [lng, lat] order (GeoJSON/OSRM format)
     * Leaflet expects [lat, lng] order for LatLng objects
     * Also supports {lat, lng} object format
     */
    const drawRoute = (points) => {
      if (!map || !points || points.length === 0) {
        console.log('[RouteMap] drawRoute: No map, points, or points length is 0')
        return
      }

      console.log('[RouteMap] drawRoute: Drawing', points.length, 'points')
      console.log('[RouteMap] drawRoute: First point format:', points[0])

      // Convert from [lng, lat] or {lat, lng} to [lat, lng] for Leaflet
      const latLngs = points
        .map((coord) => {
          let lat, lng

          if (Array.isArray(coord)) {
            // Format: [lng, lat]
            lng = coord[0]
            lat = coord[1]
          } else if (coord.lat !== undefined && coord.lng !== undefined) {
            // Format: {lat, lng}
            lat = coord.lat
            lng = coord.lng
          } else {
            console.warn('[RouteMap] Unknown coordinate format:', coord)
            return null
          }

          return [lat, lng]
        })
        .filter((p) => p !== null)

      if (latLngs.length === 0) {
        console.error('[RouteMap] drawRoute: No valid coordinates after conversion')
        return
      }

      console.log(
        '[RouteMap] drawRoute: First point:',
        latLngs[0],
        'Last point:',
        latLngs[latLngs.length - 1]
      )

      // Create dashed polyline for the route
      routeLayer = L.polyline(latLngs, {
        color: props.lineColor,
        weight: props.lineWeight,
        opacity: props.lineOpacity,
        dashArray: '10, 10', // Dashed line: 10px dash, 10px gap
        smoothFactor: 1,
      }).addTo(map)

      console.log('[RouteMap] drawRoute: Polyline created, bounds:', routeLayer.getBounds())

      // Add start marker (green)
      const startPoint = latLngs[0]
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #22c55e;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })

      const startMarker = L.marker(startPoint, { icon: startIcon }).addTo(map)
      startMarker.bindPopup('<b>🚏 Start</b><br>Terminal')
      markers.push(startMarker)

      // Add end marker (red)
      const endPoint = latLngs[latLngs.length - 1]
      const endIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: #ef4444;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      })

      const endMarker = L.marker(endPoint, { icon: endIcon }).addTo(map)
      endMarker.bindPopup('<b>🏁 End</b><br>Destination')
      markers.push(endMarker)

      // Add click event to polyline
      routeLayer.on('click', (e) => {
        emit('route-clicked', {
          latlng: e.latlng,
          originalEvent: e.originalEvent,
        })
      })

      // Fit map to route bounds
      console.log('[RouteMap] drawRoute: Calling fitToRoute()')
      // Use setTimeout to ensure map container is fully rendered
      setTimeout(() => {
        fitToRoute()
      }, 50)
    }

    /**
     * Add markers for waypoints (intermediate stops only, not start/end)
     */
    const addWaypointsMarkers = (waypointsList) => {
      if (!map || !waypointsList || waypointsList.length === 0) return

      waypointsList.forEach((wp, index) => {
        // Skip first and last waypoints (start/end markers are added in drawRoute)
        if (index === 0 || index === waypointsList.length - 1) {
          return
        }

        // Create custom marker icon for intermediate stops
        const icon = L.divIcon({
          className: 'custom-waypoint-marker',
          html: `
            <div style="
              background-color: #3b82f6;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

        // Add marker
        const marker = L.marker([wp.latitude, wp.longitude], { icon }).addTo(map)

        // Add popup
        marker.bindPopup(`
          <div style="min-width: 150px">
            <strong>📍 ${wp.name || `Stop ${index}`}</strong><br>
            <small>${wp.latitude.toFixed(6)}, ${wp.longitude.toFixed(6)}</small>
          </div>
        `)

        markers.push(marker)
      })

      if (markers.length > 0) {
        waypointsLayer = L.layerGroup(markers)
      }
    }

    /**
     * Fit map bounds to show entire route
     */
    const fitToRoute = () => {
      if (!map) {
        console.log('[RouteMap] fitToRoute: No map instance')
        return
      }

      if (routeLayer) {
        const bounds = routeLayer.getBounds()
        console.log('[RouteMap] fitToRoute: Fitting to bounds:', bounds)
        console.log('[RouteMap] fitToRoute: Bounds center:', bounds.getCenter(), 'Bounds span:', {
          lat: bounds.getNorth() - bounds.getSouth(),
          lng: bounds.getEast() - bounds.getWest(),
        })

        // Fit with padding and allow zooming out enough to see entire route
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15, // Allow zooming out further
          minZoom: 10, // Don't zoom out too far
        })

        console.log(
          '[RouteMap] fitToRoute: Map center after fit:',
          map.getCenter(),
          'Zoom:',
          map.getZoom()
        )
      } else if (props.waypoints && props.waypoints.length > 0) {
        // Fit to waypoints if no route
        const bounds = props.waypoints.map((wp) => [wp.latitude, wp.longitude])
        console.log('[RouteMap] fitToRoute: No route layer, fitting to waypoints:', bounds)
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
        })
      } else {
        console.log('[RouteMap] fitToRoute: No route layer or waypoints')
      }
    }

    /**
     * Zoom in
     */
    const zoomIn = () => {
      if (map) {
        map.zoomIn()
      }
    }

    /**
     * Zoom out
     */
    const zoomOut = () => {
      if (map) {
        map.zoomOut()
      }
    }

    /**
     * Toggle waypoints visibility
     */
    const toggleWaypoints = () => {
      showWaypoints.value = !showWaypoints.value

      if (showWaypoints.value && props.waypoints && props.waypoints.length > 0) {
        addWaypointsMarkers(props.waypoints)
        if (waypointsLayer) {
          waypointsLayer.addTo(map)
        }
      } else {
        if (waypointsLayer) {
          map.removeLayer(waypointsLayer)
        }
        markers = []
      }
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
     * Update route when routePoints or routeCoordinates prop changes
     */
    watch(
      () => [props.routePoints, props.routeCoordinates],
      ([newPoints, newCoords]) => {
        const routeData = newPoints || newCoords
        if (map && routeData && routeData.length > 0) {
          // Remove existing route
          if (routeLayer) {
            map.removeLayer(routeLayer)
          }

          // Draw new route
          drawRoute(routeData)
        }
      },
      { deep: true }
    )

    /**
     * Update waypoints when prop changes
     */
    watch(
      () => props.waypoints,
      (newWaypoints) => {
        if (map && showWaypoints.value && newWaypoints && newWaypoints.length > 0) {
          // Remove existing markers
          if (waypointsLayer) {
            map.removeLayer(waypointsLayer)
          }
          markers = []

          // Add new markers
          addWaypointsMarkers(newWaypoints)
        }
      },
      { deep: true }
    )

    // Initialize map on mount
    onMounted(() => {
      initializeMap()
    })

    // Cleanup on unmount
    onUnmounted(() => {
      if (map) {
        map.remove()
        map = null
      }
    })

    return {
      mapContainer,
      loading,
      error,
      showWaypoints,
      computedHeight,
      initializeMap,
      zoomIn,
      zoomOut,
      fitToRoute,
      toggleWaypoints,
      formatDistance,
      formatDuration,
    }
  },
})
</script>

<style lang="scss" scoped>
.route-map-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.route-map {
  width: 100%;
  height: 100%;
  z-index: 1;

  &.loading,
  &.has-error {
    min-height: 200px;
  }
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  z-index: 1000;
}

.loading-text,
.error-text,
.empty-text {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.error-text {
  color: #d32f2f;
  text-align: center;
  padding: 0 20px;
}

.empty-text {
  color: #999;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1000;
}

.map-control-btn {
  width: 36px;
  height: 36px;
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background: #f5f5f5;
  }
}

.waypoints-info {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  min-width: 200px;
}

.waypoints-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.route-stats {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  gap: 16px;
  z-index: 1000;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}
</style>

<style>
/* Global styles for custom markers */
.custom-marker .leaflet-marker-icon,
.custom-waypoint-marker .leaflet-marker-icon {
  background: transparent;
  border: none;
}

/* Ensure marker containers don't have default styles */
.custom-marker,
.custom-waypoint-marker {
  background: transparent !important;
  border: none !important;
}
</style>
