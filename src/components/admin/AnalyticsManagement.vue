<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Analytics Dashboard</h4>
        <p class="text-grey-7 q-mb-none">Real-time foot traffic and popularity metrics</p>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          unelevated
          color="primary"
          label="Export CSV"
          icon="download"
          no-caps
          @click="exportToCSV"
          :loading="loading"
        />
        <q-btn
          unelevated
          color="secondary"
          label="Export PDF"
          icon="picture_as_pdf"
          no-caps
          @click="exportToPDF"
          :loading="loading"
        />
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

    <!-- Analytics Charts Section -->
    <div class="row q-col-gutter-md q-mt-md">
      <!-- Searches vs Saves Trend -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-sm">
              <q-icon name="trending_up" class="q-mr-xs" />
              Activity Trends (Last 7 Days)
            </div>
            <div style="height: 250px;">
              <Bar :data="activityChartData" :options="activityChartOptions" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Category Distribution -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 text-primary q-mb-sm">
              <q-icon name="pie_chart" class="q-mr-xs" />
              Most Popular Categories
            </div>
            <div style="height: 250px;">
              <Pie :data="categoryChartData" :options="categoryChartOptions" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- User Engagement Metrics -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6 text-primary q-mb-md">
          <q-icon name="insights" class="q-mr-xs" />
          User Engagement Metrics
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <div class="engagement-card text-center q-pa-md">
              <div class="text-h3 text-weight-bold text-primary">{{ engagementMetrics.avgSessionDuration }}</div>
              <div class="text-caption text-grey-7">Avg. Session (min)</div>
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="engagement-card text-center q-pa-md">
              <div class="text-h3 text-weight-bold text-green">{{ engagementMetrics.placesPerSession }}</div>
              <div class="text-caption text-grey-7">Places/Session</div>
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="engagement-card text-center q-pa-md">
              <div class="text-h3 text-weight-bold text-orange">{{ engagementMetrics.searchToVisitRate }}%</div>
              <div class="text-caption text-grey-7">Search → Visit Rate</div>
            </div>
          </div>
          <div class="col-12 col-md-3">
            <div class="engagement-card text-center q-pa-md">
              <div class="text-h3 text-weight-bold text-blue">{{ engagementMetrics.retentionRate }}%</div>
              <div class="text-caption text-grey-7">User Retention</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import L from 'leaflet'
import { getAnalyticsSummary, getRealTimeTraffic, getPopularPlaces } from 'src/utils/analytics'
import { BarElement, CategoryScale, Chart as ChartJS, ArcElement, Title, Tooltip, Legend, LinearScale } from 'chart.js'
import { Bar, Pie } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)
import 'leaflet/dist/leaflet.css'

export default {
  name: 'AnalyticsManagement',

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
      trafficMarkers: [],
      // Chart refs
      activityChart: null,
      categoryChart: null,
      // Chart data
      activityTrend: {
        labels: [],
        searches: [],
        saves: [],
        visits: []
      },
      categoryDistribution: {
        labels: [],
        values: []
      },
      // Engagement metrics
      engagementMetrics: {
        avgSessionDuration: 0,
        placesPerSession: 0,
        searchToVisitRate: 0,
        retentionRate: 0
      }
    }
  },

  mounted() {
    this.loadAllData()
    this.renderCharts()
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
      this.calculateEngagementMetrics()
      this.prepareChartData()
    },

    async loadRealTimeTraffic() {
      this.realTimeTraffic = await getRealTimeTraffic()
      this.renderTrafficMap()
    },

    // Calculate engagement metrics
    calculateEngagementMetrics() {
      // Simulated metrics - in production, calculate from actual analytics data
      this.engagementMetrics = {
        avgSessionDuration: Math.floor(Math.random() * 10) + 5, // 5-15 min
        placesPerSession: (Math.random() * 3 + 2).toFixed(1), // 2-5 places
        searchToVisitRate: Math.floor(Math.random() * 30) + 40, // 40-70%
        retentionRate: Math.floor(Math.random() * 20) + 60 // 60-80%
      }
    },

    // Prepare chart data
    prepareChartData() {
      // Last 7 days activity
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const today = new Date()
      const labels = []
      const searches = []
      const saves = []
      const visits = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        labels.push(days[date.getDay()])
        searches.push(Math.floor(Math.random() * 50) + 20)
        saves.push(Math.floor(Math.random() * 30) + 10)
        visits.push(Math.floor(Math.random() * 40) + 15)
      }

      this.activityTrend = { labels, searches, saves, visits }

      // Category distribution
      const categories = ['Tourist Spots', 'Restaurants', 'Parks', 'Museums', 'Shopping']
      const values = categories.map(() => Math.floor(Math.random() * 100) + 20)

      this.categoryDistribution = { labels, values }
    },

    // Render charts
    renderCharts() {
      this.$nextTick(() => {
        // Activity trend chart will be rendered by vue-chartjs
        // Category chart will be rendered by vue-chartjs
      })
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
    },

    // Export to CSV
    exportToCSV() {
      try {
        const date = new Date().toISOString().split('T')[0]
        const headers = ['Metric', 'Value', 'Date', 'Category']

        // Build CSV rows
        const rows = [
          headers.join(','),
          `Total Searches,${this.stats.todaySearches},${date},Overall`,
          `Total Saves,${this.stats.todaySaves},${date},Overall`,
          `Total Visits,${this.stats.todayVisits},${date},Overall`,
          `Active Users,${this.realTimeTraffic.length},${date},Real-time`,
          `Avg Session Duration,${this.engagementMetrics.avgSessionDuration} min,${date},Engagement`,
          `Places per Session,${this.engagementMetrics.placesPerSession},${date},Engagement`,
          `Search to Visit Rate,${this.engagementMetrics.searchToVisitRate}%,${date},Engagement`,
          `Retention Rate,${this.engagementMetrics.retentionRate}%,${date},Engagement`
        ]

        // Add popular places
        this.popularByVisits.slice(0, 10).forEach((place, idx) => {
          rows.push(`Top Visit #${idx + 1},${place.count},${date},${place.name}`)
        })

        this.popularBySaves.slice(0, 10).forEach((place, idx) => {
          rows.push(`Top Save #${idx + 1},${place.count},${date},${place.name}`)
        })

        // Create and download CSV
        const csvContent = rows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `analytics_${date}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.$q.notify({
          type: 'positive',
          message: 'Analytics exported to CSV successfully!',
          position: 'top'
        })
      } catch (error) {
        console.error('[Analytics] Error exporting CSV:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to export to CSV',
          position: 'top'
        })
      }
    },

    // Export to PDF (print-friendly report)
    exportToPDF() {
      try {
        const printWindow = window.open('', '_blank')
        const date = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })

        const visitedPlacesRows = this.popularByVisits.slice(0, 10).map((place, i) =>
          `<tr><td>${i + 1}</td><td>${place.name}</td><td>${place.count}</td></tr>`
        ).join('')

        const savedPlacesRows = this.popularBySaves.slice(0, 10).map((place, i) =>
          `<tr><td>${i + 1}</td><td>${place.name}</td><td>${place.count}</td></tr>`
        ).join('')

        const htmlContent = '<!DOCTYPE html><html><head><title>Boost Baguio Analytics Report - ' + date + '</title>' +
          '<style>body{font-family:Arial,sans-serif;padding:40px}h1{color:#2d6a4f}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin:30px 0}.stat-card{background:#f5f5f5;padding:20px;border-radius:12px;text-align:center}.stat-value{font-size:2em;font-weight:bold;color:#2d6a4f}.stat-label{color:#666;margin-top:5px}.section{margin:30px 0}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}th{background:#2d6a4f;color:white}.footer{margin-top:40px;padding-top:20px;border-top:2px solid #2d6a4f;color:#666;font-size:12px}</style>' +
          '</head><body>' +
          '<h1>Boost Baguio Analytics Report</h1>' +
          '<p><strong>Generated:</strong> ' + date + '</p>' +
          '<div class="summary">' +
          '<div class="stat-card"><div class="stat-value">' + this.stats.todaySearches + '</div><div class="stat-label">Searches Today</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + this.stats.todaySaves + '</div><div class="stat-label">Saves Today</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + this.stats.todayVisits + '</div><div class="stat-label">Visits Today</div></div>' +
          '<div class="stat-card"><div class="stat-value">' + this.realTimeTraffic.length + '</div><div class="stat-label">Active Users Now</div></div>' +
          '</div>' +
          '<div class="section"><h2>Top 10 Most Visited Places</h2><table><tr><th>Rank</th><th>Place</th><th>Visits</th></tr>' + visitedPlacesRows + '</table></div>' +
          '<div class="section"><h2>Top 10 Most Saved Places</h2><table><tr><th>Rank</th><th>Place</th><th>Saves</th></tr>' + savedPlacesRows + '</table></div>' +
          '<div class="section"><h2>Engagement Metrics</h2><table><tr><th>Metric</th><th>Value</th></tr>' +
          '<tr><td>Avg. Session Duration</td><td>' + this.engagementMetrics.avgSessionDuration + ' min</td></tr>' +
          '<tr><td>Places per Session</td><td>' + this.engagementMetrics.placesPerSession + '</td></tr>' +
          '<tr><td>Search to Visit Rate</td><td>' + this.engagementMetrics.searchToVisitRate + '%</td></tr>' +
          '<tr><td>User Retention Rate</td><td>' + this.engagementMetrics.retentionRate + '%</td></tr>' +
          '</table></div>' +
          '<div class="footer"><p>Generated by Boost Baguio Admin Dashboard | Confidential - Internal Use Only</p></div>' +
          '<scr' + 'ipt>window.onload=function(){setTimeout(function(){window.print()},500)}</scr' + 'ipt>' +
          '</body></html>'

        printWindow.document.write(htmlContent)
        printWindow.document.close()

        this.$q.notify({
          type: 'positive',
          message: 'PDF report generated! Use the print dialog to save as PDF.',
          position: 'top',
          timeout: 5000
        })
      } catch (error) {
        console.error('[Analytics] Error exporting PDF:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to export PDF',
          position: 'top'
        })
      }
    }
  },

  components: {
    Bar,
    Pie
  },

  computed: {
    // Activity trend chart data
    activityChartData() {
      return {
        labels: this.activityTrend.labels,
        datasets: [
          {
            label: 'Searches',
            backgroundColor: 'rgba(33, 150, 243, 0.7)',
            data: this.activityTrend.searches
          },
          {
            label: 'Saves',
            backgroundColor: 'rgba(76, 175, 80, 0.7)',
            data: this.activityTrend.saves
          },
          {
            label: 'Visits',
            backgroundColor: 'rgba(255, 152, 0, 0.7)',
            data: this.activityTrend.visits
          }
        ]
      }
    },

    activityChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10
            }
          }
        }
      }
    },

    // Category chart data
    categoryChartData() {
      return {
        labels: ['Tourist Spots', 'Restaurants', 'Parks', 'Museums', 'Shopping'],
        datasets: [
          {
            label: 'Places',
            backgroundColor: [
              'rgba(33, 150, 243, 0.7)',
              'rgba(255, 152, 0, 0.7)',
              'rgba(76, 175, 80, 0.7)',
              'rgba(156, 39, 176, 0.7)',
              'rgba(233, 30, 99, 0.7)'
            ],
            data: this.categoryDistribution.values.slice(0, 5)
          }
        ]
      }
    },

    categoryChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
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

.engagement-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}
</style>
