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
              <div v-else-if="error" class="text-negative text-caption">{{ error }}</div>
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

                <div class="text-caption text-grey-7">Waypoints fed to OSRM</div>
                <q-list dense class="q-mt-xs">
                  <q-item v-for="(w, i) in waypoints" :key="i" class="q-px-none">
                    <q-item-section avatar>
                      <q-badge color="primary">{{ i + 1 }}</q-badge>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-body2">{{ w.name }}</q-item-label>
                      <q-item-label caption>
                        {{ w.latitude.toFixed(5) }}, {{ w.longitude.toFixed(5) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
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
    // Cache the last OSRM result so the Apply button doesn't re-query.
    let lastOsrmRoute = null
    let map = null

    const canApply = ref(false)
    const hasStoredRoute = computed(() => {
      const arr = props.jeepney?.routeCoordinates || props.jeepney?.routePoints
      return Array.isArray(arr) && arr.length > 0
    })

    const applyOsrm = async () => {
      if (!lastOsrmRoute || !props.jeepney) return
      applying.value = true
      try {
        // Firestore rejects nested arrays, so polylines are persisted as an
        // array of { lng, lat } objects (same shape coordsForStorage uses in
        // ApanamPage.vue / useRouteGeneration). normalizeRouteCoords handles
        // reading either shape on the consumer side.
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
        })
        emit('update:modelValue', false)
      } finally {
        applying.value = false
      }
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

    /** Convert any stored polyline shape ([lng,lat] | [lat,lng] | {lat,lng}) to [lat,lng]. */
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

    const driftDisplay = ref('—')
    const driftClass = ref('text-grey-7')

    const buildWaypoints = async (jeep) => {
      const out = []
      if (jeep.terminalLat && jeep.terminalLng) {
        out.push({
          name: jeep.terminalLocation || 'Terminal',
          latitude: jeep.terminalLat,
          longitude: jeep.terminalLng,
        })
      }
      // Resolve tourist spots to coords via the curated places collection.
      const places = await fetchPlaces().catch(() => [])
      for (const spotName of jeep.touristSpotsServiced || []) {
        const place = fuzzyMatch(spotName, places)
        if (place && place.latitude && place.longitude) {
          out.push({ name: spotName, latitude: place.latitude, longitude: place.longitude })
        }
      }
      // End point — match by name if possible.
      if (jeep.endPoint) {
        const place = fuzzyMatch(jeep.endPoint, places)
        if (place && place.latitude && place.longitude) {
          out.push({ name: jeep.endPoint, latitude: place.latitude, longitude: place.longitude })
        } else if (jeep.routeCoordinates?.length) {
          const last = toLatLng(jeep.routeCoordinates).at(-1)
          if (last) {
            out.push({ name: jeep.endPoint, latitude: last[0], longitude: last[1] })
          }
        }
      }
      return out
    }

    const fetchOsrm = async (wps) => {
      if (!wps || wps.length < 2) return null
      const coords = wps.map((w) => `${w.longitude},${w.latitude}`).join(';')
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`)
      const data = await res.json()
      if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('OSRM returned no route')
      return data.routes[0] // { distance, geometry: { coordinates: [[lng,lat], ...] } }
    }

    const drawAll = async () => {
      if (!props.jeepney || !mapEl.value) return
      loading.value = true
      error.value = null
      lastOsrmRoute = null
      canApply.value = false

      // Tear down previous map cleanly so re-opens don't leak layers.
      if (map) {
        map.remove()
        map = null
      }

      map = L.map(mapEl.value, { zoomControl: true })
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map)

      const stored = toLatLng(props.jeepney.routeCoordinates || props.jeepney.routePoints)
      storedLengthM.value = polylineLength(stored)

      const allBounds = []
      if (stored.length >= 2) {
        L.polyline(stored, { color: '#1976D2', weight: 5, opacity: 0.9 }).addTo(map)
        stored.forEach((c) => allBounds.push(c))
      }

      try {
        waypoints.value = await buildWaypoints(props.jeepney)
        if (waypoints.value.length >= 2) {
          const osrm = await fetchOsrm(waypoints.value)
          lastOsrmRoute = osrm
          canApply.value = true
          osrmLengthM.value = osrm.distance
          const osrmLatLngs = osrm.geometry.coordinates.map(([lng, lat]) => [lat, lng])
          L.polyline(osrmLatLngs, {
            color: '#C10015',
            weight: 4,
            opacity: 0.9,
            dashArray: '10, 8',
          }).addTo(map)
          osrmLatLngs.forEach((c) => allBounds.push(c))

          if (storedLengthM.value > 0) {
            const drift = (storedLengthM.value - osrmLengthM.value) / osrmLengthM.value
            const pct = Math.round(drift * 100)
            driftDisplay.value = `${pct >= 0 ? '+' : ''}${pct}% (${formatKm(
              Math.abs(storedLengthM.value - osrmLengthM.value)
            )} difference)`
            driftClass.value =
              Math.abs(pct) >= 25
                ? 'text-negative text-weight-bold'
                : Math.abs(pct) >= 10
                  ? 'text-warning'
                  : 'text-positive'
          }
        } else {
          error.value = 'Not enough resolvable waypoints for an OSRM comparison.'
        }

        // Markers: terminal (green) and end (red)
        waypoints.value.forEach((w, i) => {
          const isStart = i === 0
          const isEnd = i === waypoints.value.length - 1
          const color = isStart ? '#21BA45' : isEnd ? '#C10015' : '#9C27B0'
          L.marker([w.latitude, w.longitude], {
            icon: L.divIcon({
              className: 'route-compare-marker',
              html: `<div style="background:${color};width:14px;height:14px;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            }),
          })
            .addTo(map)
            .bindPopup(`<b>${i + 1}. ${w.name}</b>`)
          allBounds.push([w.latitude, w.longitude])
        })

        if (allBounds.length >= 2) {
          map.fitBounds(allBounds, { padding: [40, 40] })
        }
      } catch (err) {
        error.value = err.message || 'OSRM comparison failed'
      } finally {
        loading.value = false
        // Force a redraw once the dialog finishes its enter transition.
        setTimeout(() => map?.invalidateSize(), 250)
      }
    }

    watch(
      () => [props.modelValue, props.jeepney?.id],
      async ([open]) => {
        if (!open) return
        await nextTick()
        drawAll()
      }
    )

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
</style>
