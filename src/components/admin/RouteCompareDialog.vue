<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    maximized
  >
    <q-card class="column no-wrap route-compare-card">
      <!-- Floating close button — always visible regardless of header layout -->
      <q-btn
        round
        dense
        unelevated
        icon="close"
        color="negative"
        text-color="white"
        class="route-compare-close"
        aria-label="Close"
        v-close-popup
      >
        <q-tooltip>Close</q-tooltip>
      </q-btn>

      <q-card-section
        class="text-white row items-center q-pb-sm col-auto"
        style="background: #2d6a4f"
      >
        <div class="text-h6">
          <q-icon name="compare_arrows" class="q-mr-sm" />
          {{ hasStoredRoute ? 'Route Compare' : 'Generate Route' }} —
          {{ jeepney?.jeepName || jeepney?.routeName || '?' }}
        </div>
        <q-space />
      </q-card-section>

      <q-card-section class="row q-col-gutter-md col">
        <div class="col-12 col-md-9" style="min-height: 70vh">
          <div
            ref="mapEl"
            style="width: 100%; height: 100%; min-height: 70vh; border-radius: 12px"
          ></div>
        </div>

        <div class="col-12 col-md-3">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold q-mb-md">What you're seeing</div>
              <div v-if="hasStoredRoute" class="legend-row">
                <span class="legend-swatch" style="background: #1976d2"></span>
                <span>Stored polyline (Firestore)</span>
              </div>
              <div class="legend-row">
                <span class="legend-swatch dashed" style="border-color: #c10015"></span>
                <span>
                  {{
                    hasStoredRoute
                      ? 'Fresh OSRM driving route through the same waypoints'
                      : "OSRM driving route generated from this jeepney's waypoints"
                  }}
                </span>
              </div>

              <q-separator class="q-my-md" />

              <div v-if="loading" class="text-grey-7 text-caption">
                <q-spinner-dots color="primary" /> Querying OSRM…
              </div>
              <div v-else-if="error" class="text-negative text-caption q-mb-md">
                <q-icon name="error" /> {{ error }}
              </div>
              <div v-else>
                <div v-if="hasStoredRoute">
                  <div class="text-caption text-grey-7">Stored length</div>
                  <div class="text-body2 q-mb-sm">{{ formatKm(storedLengthM) }}</div>
                </div>
                <div v-else class="text-caption text-grey-7 q-mb-sm">
                  This jeepney has no stored route yet — apply the generated OSRM route below to
                  save one.
                </div>

                <div class="text-caption text-grey-7">OSRM length</div>
                <div class="text-body2 q-mb-sm">{{ formatKm(osrmLengthM) }}</div>

                <div v-if="hasStoredRoute">
                  <div class="text-caption text-grey-7">Drift</div>
                  <div class="text-body2" :class="driftClass">
                    {{ driftDisplay }}
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="row items-center justify-between q-mb-sm">
                  <div class="text-caption text-grey-7">Waypoints fed to OSRM</div>
                  <q-btn
                    v-if="settingWaypointIndex !== null"
                    size="xs"
                    color="negative"
                    label="Cancel Picking"
                    @click="settingWaypointIndex = null"
                  />
                </div>

                <div
                  v-if="settingWaypointIndex !== null"
                  class="bg-amber-1 q-pa-sm rounded-borders q-mb-sm text-caption text-amber-9 border-amber"
                >
                  <q-icon name="touch_app" /> Click on the map to set location for
                  <strong>{{ waypoints[settingWaypointIndex]?.name }}</strong>
                </div>

                <q-list dense class="q-mt-xs">
                  <q-item
                    v-for="(w, i) in waypoints"
                    :key="i"
                    class="q-px-none waypoint-item"
                    :class="{ 'bg-blue-1': settingWaypointIndex === i }"
                  >
                    <q-item-section avatar>
                      <q-badge :color="w.latitude ? 'primary' : 'grey-7'">{{ i + 1 }}</q-badge>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-body2" :class="{ 'text-negative': !w.latitude }">
                        {{ w.name }}
                        <q-icon v-if="!w.latitude" name="warning" color="negative" size="14px">
                          <q-tooltip>Location not found</q-tooltip>
                        </q-icon>
                      </q-item-label>
                      <q-item-label caption v-if="w.latitude">
                        {{ w.latitude.toFixed(5) }}, {{ w.longitude.toFixed(5) }}
                      </q-item-label>
                      <q-item-label caption v-else class="text-negative">
                        Click "Set" to pick on map
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        dense
                        :icon="settingWaypointIndex === i ? 'gps_fixed' : 'add_location'"
                        :color="settingWaypointIndex === i ? 'primary' : 'grey-7'"
                        size="sm"
                        @click="startSettingWaypoint(i)"
                      >
                        <q-tooltip>{{ w.latitude ? 'Change location' : 'Set location' }}</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>

                <div v-if="hasUnresolvedWaypoints" class="q-mt-md">
                  <q-banner dense class="bg-warning text-white rounded-borders" style="font-size: 11px">
                    <q-icon name="warning" /> Some waypoints are missing locations. OSRM will skip them.
                  </q-banner>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-grey-2 q-px-lg q-py-md col-auto">
        <q-btn
          flat
          :label="hasStoredRoute ? 'Keep current route' : 'Cancel'"
          color="grey-8"
          v-close-popup
        />
        <q-btn
          unelevated
          :label="hasStoredRoute ? 'Apply OSRM route' : 'Generate route'"
          :icon="hasStoredRoute ? 'check' : 'add_road'"
          color="negative"
          :disable="!canApply"
          :loading="applying"
          @click="applyOsrm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchPlaces, fuzzyMatch } from 'src/composables/useRouteGeneration'
import { useGeocoding } from 'src/composables/useGeocoding'

export default defineComponent({
  name: 'RouteCompareDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    jeepney: { type: Object, default: null },
  },
  emits: ['update:modelValue', 'apply'],
  setup(props, { emit }) {
    const mapEl = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const storedLengthM = ref(0)
    const osrmLengthM = ref(0)
    const waypoints = ref([])
    const applying = ref(false)
    const settingWaypointIndex = ref(null)
    // Cache the last OSRM result so the Apply button doesn't re-query.
    let lastOsrmRoute = null
    let map = null
    let osrmLayer = null
    let storedLayer = null
    let waypointMarkers = []

    const canApply = ref(false)
    const hasStoredRoute = computed(() => {
      const arr = props.jeepney?.routeCoordinates || props.jeepney?.routePoints
      return Array.isArray(arr) && arr.length > 0
    })

    const hasUnresolvedWaypoints = computed(() => {
      return waypoints.value.some(w => !w.latitude)
    })

    const applyOsrm = async () => {
      if (!lastOsrmRoute || !props.jeepney) return
      applying.value = true
      try {
        const routeCoordinates = lastOsrmRoute.geometry.coordinates.map(([lng, lat]) => ({
          lng,
          lat,
        }))
        emit('apply', {
          jeepneyId: props.jeepney.id,
          jeepneyName: props.jeepney.jeepName || props.jeepney.routeName,
          routeCoordinates,
          routeDistance: lastOsrmRoute.distance,
          routeDuration: lastOsrmRoute.duration,
          waypoints: waypoints.value.map(w => ({
             name: w.name,
             lat: w.latitude,
             lng: w.longitude
          }))
        })
        emit('update:modelValue', false)
      } finally {
        applying.value = false
      }
    }

    const startSettingWaypoint = (index) => {
      settingWaypointIndex.value = index
    }

    const handleMapClick = async (e) => {
      if (settingWaypointIndex.value === null) return

      const idx = settingWaypointIndex.value
      waypoints.value[idx].latitude = e.latlng.lat
      waypoints.value[idx].longitude = e.latlng.lng
      
      settingWaypointIndex.value = null
      
      // Re-trigger OSRM and redraw
      await updateOsrmAndMap()
    }

    const haversine = ([lat1, lng1], [lat2, lng2]) => {
      const R = 6371000
      const toRad = (d) => (d * Math.PI) / 180
      const dLat = toRad(lat2 - lat1)
      const dLng = toRad(lng2 - lng1)
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
      return 2 * R * Math.asin(Math.sqrt(a))
    }

    const polylineLength = (latLngs) => {
      let total = 0
      for (let i = 1; i < latLngs.length; i++) total += haversine(latLngs[i - 1], latLngs[i])
      return total
    }

    const toLatLng = (coords) => {
      if (!Array.isArray(coords)) return []
      return coords
        .map((c) => {
          if (Array.isArray(c) && c.length === 2) {
            const [a, b] = c
            if (a > 100 && b < 30) return [b, a]
            return [a, b]
          }
          if (c && typeof c === 'object' && c.lat != null && c.lng != null) return [c.lat, c.lng]
          return null
        })
        .filter(Boolean)
    }

    const formatKm = (m) => (m ? `${(m / 1000).toFixed(2)} km` : '—')

    const parseLatLngString = (text) => {
      if (!text || typeof text !== 'string') return null
      const parts = text.split(',').map(p => p.trim()).filter(Boolean)
      if (parts.length !== 2) return null
      const lat = Number(parts[0])
      const lng = Number(parts[1])
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
      return null
    }

    const driftDisplay = ref('—')
    const driftClass = ref('text-grey-7')

    const buildWaypoints = async (jeep) => {
      const out = []
      
      // Start with terminal
      out.push({
        name: jeep.terminalLocation || 'Terminal',
        latitude: jeep.terminalLat || null,
        longitude: jeep.terminalLng || null,
      })
      
      const places = await fetchPlaces().catch(() => [])
      const resolved = jeep.resolvedWaypoints || []

      for (const spotName of jeep.touristSpotsServiced || []) {
        // 1. Try to find in resolvedWaypoints first (manual overrides)
        const previouslyResolved = resolved.find(r => r.name === spotName)
        if (previouslyResolved && previouslyResolved.lat) {
          out.push({ name: spotName, latitude: previouslyResolved.lat, longitude: previouslyResolved.lng })
          continue
        }

        // 2. Fall back to fuzzy matching against places
        const place = fuzzyMatch(spotName, places)
        if (place && place.latitude && place.longitude) {
          out.push({ name: spotName, latitude: place.latitude, longitude: place.longitude })
        } else {
          out.push({ name: spotName, latitude: null, longitude: null })
        }
      }
      
      if (jeep.endPoint) {
        let addedEndPoint = false

        // 1. Try resolvedWaypoints for end point
        const previouslyResolved = resolved.find(r => r.name === jeep.endPoint)
        if (previouslyResolved && previouslyResolved.lat) {
          out.push({ name: jeep.endPoint, latitude: previouslyResolved.lat, longitude: previouslyResolved.lng })
          addedEndPoint = true
        }

        if (!addedEndPoint) {
          const place = fuzzyMatch(jeep.endPoint, places)
          if (place && place.latitude && place.longitude) {
            out.push({ name: jeep.endPoint, latitude: place.latitude, longitude: place.longitude })
            addedEndPoint = true
          }
        }

        if (!addedEndPoint) {
          const coordinateCandidate = parseLatLngString(jeep.endPoint)
          if (coordinateCandidate) {
            out.push({
              name: jeep.endPoint,
              latitude: coordinateCandidate.lat,
              longitude: coordinateCandidate.lng,
            })
            addedEndPoint = true
          }
        }

        if (!addedEndPoint && jeep.routeCoordinates?.length) {
          const last = toLatLng(jeep.routeCoordinates).at(-1)
          if (last) {
            out.push({ name: jeep.endPoint, latitude: last[0], longitude: last[1] })
            addedEndPoint = true
          }
        }

        if (!addedEndPoint) {
          try {
            const { searchLocations } = useGeocoding()
            const results = await searchLocations(jeep.endPoint, true)
            const geoMatch = results?.[0]
            if (geoMatch && geoMatch.lat != null && geoMatch.lng != null) {
              out.push({ name: jeep.endPoint, latitude: geoMatch.lat, longitude: geoMatch.lng })
              addedEndPoint = true
            }
          } catch (err) {
            console.warn('[RouteCompareDialog] End point geocoding fallback failed:', err)
          }
        }
        
        if (!addedEndPoint) {
          out.push({ name: jeep.endPoint, latitude: null, longitude: null })
        }
      }
      return out
    }

    const fetchOsrm = async (wps) => {
      const resolved = wps.filter(w => w.latitude && w.longitude)
      if (resolved.length < 2) return null
      
      const coords = resolved.map((w) => `${w.longitude},${w.latitude}`).join(';')
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`)
      const data = await res.json()
      if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('OSRM returned no route')
      return data.routes[0]
    }

    const updateOsrmAndMap = async () => {
      if (!map) return
      loading.value = true
      error.value = null
      
      if (osrmLayer) map.removeLayer(osrmLayer)
      waypointMarkers.forEach(m => map.removeLayer(m))
      waypointMarkers = []

      const allBounds = []
      const stored = toLatLng(props.jeepney.routeCoordinates || props.jeepney.routePoints)
      if (stored.length >= 2) {
         if (storedLayer) map.removeLayer(storedLayer)
         storedLayer = L.polyline(stored, { color: '#1976D2', weight: 5, opacity: 0.9 }).addTo(map)
         stored.forEach((c) => allBounds.push(c))
      }

      try {
        const osrm = await fetchOsrm(waypoints.value)
        if (osrm) {
          lastOsrmRoute = osrm
          canApply.value = true
          osrmLengthM.value = osrm.distance
          const osrmLatLngs = osrm.geometry.coordinates.map(([lng, lat]) => [lat, lng])
          osrmLayer = L.polyline(osrmLatLngs, {
            color: '#C10015',
            weight: 4,
            opacity: 0.9,
            dashArray: '10, 8',
          }).addTo(map)
          osrmLatLngs.forEach((c) => allBounds.push(c))

          if (storedLengthM.value > 0) {
            const drift = (storedLengthM.value - osrmLengthM.value) / osrmLengthM.value
            const pct = Math.round(drift * 100)
            driftDisplay.value = `${pct >= 0 ? '+' : ''}${pct}% (${formatKm(Math.abs(storedLengthM.value - osrmLengthM.value))} difference)`
            driftClass.value = Math.abs(pct) >= 25 ? 'text-negative text-weight-bold' : Math.abs(pct) >= 10 ? 'text-warning' : 'text-positive'
          }
        } else {
          lastOsrmRoute = null
          canApply.value = false
          osrmLengthM.value = 0
          driftDisplay.value = '—'
          if (waypoints.value.filter(w => w.latitude).length < 2) {
             error.value = 'Not enough resolvable waypoints for an OSRM comparison.'
          }
        }

        waypoints.value.forEach((w, i) => {
          if (!w.latitude) return
          const isStart = i === 0
          const isEnd = i === waypoints.value.length - 1
          const color = isStart ? '#21BA45' : isEnd ? '#C10015' : '#9C27B0'
          const m = L.marker([w.latitude, w.longitude], {
            icon: L.divIcon({
              className: 'route-compare-marker',
              html: `<div style="background:${color};width:14px;height:14px;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            }),
          })
            .addTo(map)
            .bindPopup(`<b>${i + 1}. ${w.name}</b>`)
          waypointMarkers.push(m)
          allBounds.push([w.latitude, w.longitude])
        })

        if (allBounds.length >= 2) map.fitBounds(allBounds, { padding: [40, 40] })
      } catch (err) {
        error.value = err.message || 'OSRM comparison failed'
      } finally {
        loading.value = false
      }
    }

    const drawAll = async () => {
      if (!props.jeepney || !mapEl.value) return
      loading.value = true
      error.value = null
      lastOsrmRoute = null
      canApply.value = false
      settingWaypointIndex.value = null

      if (map) {
        map.remove()
        map = null
      }

      map = L.map(mapEl.value, { zoomControl: true })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      map.on('click', handleMapClick)

      const stored = toLatLng(props.jeepney.routeCoordinates || props.jeepney.routePoints)
      storedLengthM.value = polylineLength(stored)

      try {
        waypoints.value = await buildWaypoints(props.jeepney)
        await updateOsrmAndMap()
      } catch (err) {
        error.value = err.message || 'Initialization failed'
        loading.value = false
      } finally {
        setTimeout(() => map?.invalidateSize(), 250)
      }
    }

    watch(() => [props.modelValue, props.jeepney?.id], async ([open]) => {
      if (!open) return
      await nextTick()
      drawAll()
    })

    return {
      mapEl,
      loading,
      error,
      storedLengthM,
      osrmLengthM,
      waypoints,
      formatKm,
      driftDisplay,
      driftClass,
      applying,
      canApply,
      applyOsrm,
      hasStoredRoute,
      settingWaypointIndex,
      startSettingWaypoint,
      hasUnresolvedWaypoints,
    }
  },
})
</script>

<style scoped lang="scss">
.route-compare-card {
  position: relative;
}

.route-compare-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.legend-swatch {
  display: inline-block;
  width: 28px;
  height: 4px;
  border-radius: 2px;

  &.dashed {
    background: transparent;
    border-bottom: 3px dashed;
  }
}

.waypoint-item {
  border-radius: 4px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}

.border-amber {
  border: 1px solid #ffc107;
}
</style>
