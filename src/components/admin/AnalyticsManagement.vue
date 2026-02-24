<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Analytics Dashboard</h4>
        <p class="text-grey-7 q-mb-none">Real-time foot traffic and popularity metrics</p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          label="Refresh"
          icon="refresh"
          no-caps
          @click="loadAllData"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="stat-icon bg-blue-1">
                  <q-icon name="search" size="md" color="blue" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ stats.todaySearches }}</div>
                <div class="stat-label">Searches Today</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="stat-icon bg-green-1">
                  <q-icon name="bookmark" size="md" color="green" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ stats.todaySaves }}</div>
                <div class="stat-label">Saves Today</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="stat-icon bg-orange-1">
                  <q-icon name="directions_walk" size="md" color="orange" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ stats.todayVisits }}</div>
                <div class="stat-label">Visits Today</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="stat-icon bg-purple-1">
                  <q-icon name="people" size="md" color="purple" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ realTimeTraffic.length }}</div>
                <div class="stat-label">Active Users Now</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Real-Time Foot Traffic Map -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 text-primary q-mb-sm">
          <q-icon name="radar" class="q-mr-xs" />
          Real-Time Foot Traffic (Last 30 min)
        </div>
        <div id="traffic-map" style="height: 400px; border-radius: 8px;"></div>
        <div class="text-caption text-grey-7 q-mt-sm">
          Shows user locations in the last 30 minutes. Larger circles = more activity.
        </div>
      </q-card-section>
    </q-card>

    <!-- Most Popular Places -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-sm">
              <q-icon name="trending_up" class="q-mr-xs" />
              Most Visited Places
            </div>
            <q-list separator>
              <q-item v-for="(place, index) in popularByVisits" :key="place.placeId">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" :label="`${index + 1}`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ place.name || 'Loading...' }}</q-item-label>
                  <q-item-label caption>{{ place.count }} visits</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="green">👣 {{ place.count }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-sm">
              <q-icon name="star" class="q-mr-xs" />
              Most Saved Places
            </div>
            <q-list separator>
              <q-item v-for="(place, index) in popularBySaves" :key="place.placeId">
                <q-item-section avatar>
                  <q-avatar color="amber" text-color="white" :label="`${index + 1}`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ place.name || 'Loading...' }}</q-item-label>
                  <q-item-label caption>{{ place.count }} saves</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="amber">⭐ {{ place.count }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-sm">
              <q-icon name="search" class="q-mr-xs" />
              Most Searched Places
            </div>
            <q-list separator>
              <q-item v-for="(place, index) in popularBySearches" :key="place.placeId">
                <q-item-section avatar>
                  <q-avatar color="blue" text-color="white" :label="`${index + 1}`" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ place.name || 'Loading...' }}</q-item-label>
                  <q-item-label caption>{{ place.count }} searches</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="blue">🔍 {{ place.count }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-sm">
              <q-icon name="schedule" class="q-mr-xs" />
              Peak Hours Today
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-4" v-for="hour in peakHours" :key="hour.hour">
                <q-card flat bordered class="text-center q-pa-sm">
                  <div class="text-h6 text-primary">{{ formatHour(hour.hour) }}</div>
                  <q-linear-progress :value="hour.intensity" color="primary" class="q-mt-xs" />
                  <div class="text-caption text-grey-7">{{ hour.count }} users</div>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Popular Times by Day -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 text-primary q-mb-sm">
          <q-icon name="calendar_today" class="q-mr-xs" />
          Popular Times by Day of Week
        </div>
        <q-tabs v-model="selectedDay" class="bg-grey-2 q-mb-md" align="left">
          <q-tab name="0" label="Sunday" />
          <q-tab name="1" label="Monday" />
          <q-tab name="2" label="Tuesday" />
          <q-tab name="3" label="Wednesday" />
          <q-tab name="4" label="Thursday" />
          <q-tab name="5" label="Friday" />
          <q-tab name="6" label="Saturday" />
        </q-tabs>

        <div class="row q-col-gutter-xs">
          <div class="col-12">
            <div class="row q-col-gutter-xs items-end" style="height: 200px;">
              <div class="col" v-for="hour in hours24" :key="hour" style="height: 100%;">
                <div class="column items-center full-height">
                  <q-linear-progress
                    :value="getPopularTimeIntensity(selectedDay, hour)"
                    color="primary"
                    style="height: 100%; width: 100%;"
                    class="rounded-borders"
                  />
                  <div class="text-caption text-grey-7 q-mt-xs">{{ hour }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  getAnalyticsSummary,
  getRealTimeTraffic,
  getPopularPlaces,
  getPopularTimes
} from 'src/utils/analytics'

export default {
  name: 'AnalyticsManagement',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      loading: false,
      stats: {
        totalSearches: 0,
        totalSaves: 0,
        totalVisits: 0,
        todaySearches: 0,
        todaySaves: 0,
        todayVisits: 0
      },
      realTimeTraffic: [],
      popularByVisits: [],
      popularBySaves: [],
      popularBySearches: [],
      peakHours: [],
      popularTimes: {},
      selectedDay: new Date().getDay().toString(),
      hours24: Array.from({ length: 24 }, (_, i) => i),
      trafficMap: null,
      trafficMarkers: []
    }
  },

  mounted() {
    this.loadAllData()
    // Refresh real-time traffic every minute
    this.refreshInterval = setInterval(() => {
      this.loadRealTimeTraffic()
    }, 60000)
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    if (this.trafficMap) {
      this.trafficMap.remove()
    }
  },

  methods: {
    async loadAllData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadStats(),
          this.loadRealTimeTraffic(),
          this.loadPopularPlaces(),
          this.loadPeakHours(),
          this.loadPopularTimes()
        ])
        this.$q.notify({
          type: 'positive',
          message: 'Analytics data refreshed',
          position: 'top',
          timeout: 2000
        })
      } catch (error) {
        console.error('[Analytics] Error loading data:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load analytics data',
          position: 'top'
        })
      } finally {
        this.loading = false
      }
    },

    async loadStats() {
      const summary = await getAnalyticsSummary()
      this.stats = summary
    },

    async loadRealTimeTraffic() {
      this.realTimeTraffic = await getRealTimeTraffic()
      this.renderTrafficMap()
    },

    renderTrafficMap() {
      // Initialize map if not exists
      if (!this.trafficMap) {
        this.trafficMap = L.map('traffic-map').setView([16.4023, 120.5960], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.trafficMap)
      }

      // Clear existing markers
      this.trafficMarkers.forEach(marker => this.trafficMap.removeLayer(marker))
      this.trafficMarkers = []

      // Group traffic by location
      const locationGroups = {}
      this.realTimeTraffic.forEach(point => {
        const key = `${point.lat.toFixed(3)},${point.lng.toFixed(3)}`
        if (!locationGroups[key]) {
          locationGroups[key] = { lat: point.lat, lng: point.lng, count: 0 }
        }
        locationGroups[key].count++
      })

      // Add markers with circle size based on count
      Object.values(locationGroups).forEach(loc => {
        const radius = Math.min(50, 10 + (loc.count * 5))
        const circle = L.circleMarker([loc.lat, loc.lng], {
          radius: radius,
          color: '#FF5722',
          fillColor: '#FF5722',
          fillOpacity: 0.5
        }).addTo(this.trafficMap)

        circle.bindPopup(`
          <b>Active Users</b><br>
          ${loc.count} users in last 30 min<br>
          Lat: ${loc.lat.toFixed(4)}<br>
          Lng: ${loc.lng.toFixed(4)}
        `)

        this.trafficMarkers.push(circle)
      })
    },

    async loadPopularPlaces() {
      const [visits, saves, searches] = await Promise.all([
        getPopularPlaces('visits', 10),
        getPopularPlaces('saves', 10),
        getPopularPlaces('searches', 10)
      ])

      // Get place details
      this.popularByVisits = await this.getPlaceDetails(visits)
      this.popularBySaves = await this.getPlaceDetails(saves)
      this.popularBySearches = await this.getPlaceDetails(searches)
    },

    async getPlaceDetails(placeList) {
      const details = []
      for (const item of placeList) {
        try {
          const placeRef = await getDocs(query(collection(db, 'places'), where('__name__', '==', item.placeId)))
          if (!placeRef.empty) {
            const placeData = placeRef.docs[0].data()
            details.push({
              placeId: item.placeId,
              name: placeData.name || 'Unknown Place',
              count: item.count
            })
          } else {
            details.push({
              placeId: item.placeId,
              name: 'Deleted Place',
              count: item.count
            })
          }
        } catch (error) {
          console.error('[Analytics] Error getting place details:', error)
          details.push({
            placeId: item.placeId,
            name: 'Error Loading',
            count: item.count
          })
        }
      }
      return details
    },

    async loadPeakHours() {
      const traffic = await getRealTimeTraffic()
      const hourCounts = {}

      traffic.forEach(point => {
        const hour = point.timestamp?.getHours()
        if (hour !== undefined) {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1
        }
      })

      const maxCount = Math.max(...Object.values(hourCounts), 1)

      this.peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
          intensity: count / maxCount
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
    },

    async loadPopularTimes() {
      // Get all foot traffic
      const snapshot = await getDocs(collection(db, 'analytics_foot_traffic'))
      const traffic = snapshot.docs.map(doc => doc.data())

      // Group by day and hour
      const popularTimes = {}
      for (let day = 0; day < 7; day++) {
        popularTimes[day] = {}
        for (let hour = 0; hour < 24; hour++) {
          popularTimes[day][hour] = 0
        }
      }

      traffic.forEach(point => {
        if (point.dayOfWeek !== undefined && point.hour !== undefined) {
          popularTimes[point.dayOfWeek][point.hour]++
        }
      })

      this.popularTimes = popularTimes
    },

    getPopularTimeIntensity(day, hour) {
      const dayData = this.popularTimes[day]
      if (!dayData || dayData[hour] === undefined) return 0

      const maxInDay = Math.max(...Object.values(dayData), 1)
      return dayData[hour] / maxInDay
    },

    formatHour(hour) {
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}${period}`
    }
  }
}
</script>

<style lang="scss" scoped>
.text-pine-green {
  color: #2d6a4f;
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2d6a4f;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6c757d;
  }
}

.bg-blue-1 {
  background: rgba(33, 150, 243, 0.1);
}

.bg-green-1 {
  background: rgba(76, 175, 80, 0.1);
}

.bg-orange-1 {
  background: rgba(255, 152, 0, 0.1);
}

.bg-purple-1 {
  background: rgba(156, 39, 176, 0.1);
}

.rounded-borders {
  border-radius: 4px;
}
</style>
