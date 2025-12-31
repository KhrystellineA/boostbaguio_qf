<template>
  <div class="analytics-container">
    <div class="row items-center q-mb-md">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Analytics Dashboard</h4>
        <p class="text-grey-7 q-mb-none">Track performance and user behavior</p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          label="Refresh Data"
          icon="refresh"
          no-caps
          @click="loadAnalytics"
          :loading="loading"
        />
      </div>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-auto">
            <div class="text-subtitle2 q-mb-sm">Time Period</div>
            <q-btn-toggle
              v-model="timeRange"
              unelevated
              toggle-color="primary"
              :options="[
                {label: 'Today', value: 'today'},
                {label: '7 Days', value: '7days'},
                {label: '30 Days', value: '30days'},
                {label: 'All Time', value: 'all'},
              ]"
              @update:model-value="loadAnalytics"
            />
          </div>
          
          <div class="col-12 col-md">
            <div class="text-subtitle2 q-mb-sm">Custom Range</div>
            <div class="row q-col-gutter-sm">
              <div class="col">
                <q-input
                  v-model="customDateRange.from"
                  filled
                  dense
                  type="date"
                  label="From"
                />
              </div>
              <div class="col">
                <q-input
                  v-model="customDateRange.to"
                  filled
                  dense
                  type="date"
                  label="To"
                />
              </div>
              <div class="col-auto">
                <q-btn
                  unelevated
                  color="primary"
                  label="Apply"
                  @click="applyCustomRange"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <div v-if="loading" class="text-center q-py-xl">
      <q-spinner color="primary" size="50px" />
      <div class="q-mt-md text-grey-7">Loading analytics...</div>
    </div>

    <div v-else>
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-icon bg-blue-1">
                <q-icon name="people" size="32px" color="blue-8" />
              </div>
              <div class="metric-value">{{ formatNumber(metrics.totalUsers) }}</div>
              <div class="metric-label">Total Users</div>
              <div 
                class="metric-change" 
                :class="metrics.userGrowth >= 0 ? 'positive' : 'negative'"
                v-if="metrics.userGrowth !== null"
              >
                <q-icon :name="metrics.userGrowth >= 0 ? 'trending_up' : 'trending_down'" size="16px" />
                {{ metrics.userGrowth >= 0 ? '+' : '' }}{{ metrics.userGrowth }}% vs last period
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-icon bg-green-1">
                <q-icon name="person_add" size="32px" color="green-8" />
              </div>
              <div class="metric-value">{{ metrics.newUsers }}</div>
              <div class="metric-label">New Signups</div>
              <div class="metric-subtitle">In selected period</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-icon bg-purple-1">
                <q-icon name="workspace_premium" size="32px" color="purple-8" />
              </div>
              <div class="metric-value">{{ metrics.premiumUsers }}</div>
              <div class="metric-label">Premium Users</div>
              <div class="metric-subtitle">{{ metrics.conversionRate }}% conversion rate</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="metric-card">
            <q-card-section>
              <div class="metric-icon bg-orange-1">
                <q-icon name="route" size="32px" color="orange-8" />
              </div>
              <div class="metric-value">{{ metrics.totalRoutes }}</div>
              <div class="metric-label">Total Routes</div>
              <div class="metric-subtitle">Available in system</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green q-mb-md">
                User Signups Over Time
                <q-chip size="sm" color="grey-3" class="q-ml-sm">{{ userGrowthData.length }} days</q-chip>
              </div>
              <div style="height: 300px">
                <canvas ref="userGrowthChart"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green q-mb-md">User Distribution</div>
              <div style="height: 300px" class="flex flex-center">
                <canvas ref="userDistributionChart"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green q-mb-md">Cumulative User Growth</div>
              <div style="height: 250px">
                <canvas ref="cumulativeUsersChart"></canvas>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green q-mb-md">Signup Trends</div>
              <div class="q-pa-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div class="text-subtitle2 text-grey-7">Average signups per day</div>
                    <div class="text-h5 text-pine-green">{{ metrics.avgSignupsPerDay }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Busiest Day</div>
                    <div class="text-subtitle1">{{ metrics.busiestDay }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Peak Signups</div>
                    <div class="text-subtitle1">{{ metrics.peakSignups }} users</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">This Week</div>
                    <div class="text-subtitle1">{{ metrics.thisWeekSignups }} users</div>
                  </div>
                  <div class="col-6">
                    <div class="text-caption text-grey-7">Last Week</div>
                    <div class="text-subtitle1">{{ metrics.lastWeekSignups }} users</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green">Available Routes</div>
            </q-card-section>
            <q-separator />
            <q-list padding v-if="topRoutes.length > 0">
              <q-item v-for="(route, index) in topRoutes" :key="index">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">{{ index + 1 }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ route.name }}</q-item-label>
                  <q-item-label caption>{{ route.description || 'No description' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section v-else>
              <div class="text-center text-grey-6">No routes available</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green">Recent Signups</div>
            </q-card-section>
            <q-separator />
            <q-list padding>
              <q-item v-for="user in recentUsers" :key="user.id">
                <q-item-section avatar>
                  <q-avatar color="blue-8" text-color="white">{{ user.initials }}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.displayName }}</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ user.timeAgo }}</q-item-label>
                  <q-badge v-if="user.isPremium" color="amber-7" label="Premium" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-card>
            <q-card-section>
              <div class="text-h6 text-pine-green q-mb-md">Premium Subscription Status</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <div class="stat-box">
                    <div class="stat-number">{{ metrics.premiumUsers }}</div>
                    <div class="stat-label">Active Premium</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-box">
                    <div class="stat-number">{{ metrics.freeUsers }}</div>
                    <div class="stat-label">Free Users</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-box">
                    <div class="stat-number">{{ metrics.conversionRate }}%</div>
                    <div class="stat-label">Conversion Rate</div>
                  </div>
                </div>
                <div class="col-12 col-md-3">
                  <div class="stat-box">
                    <div class="stat-number">{{ metrics.premiumExpiring }}</div>
                    <div class="stat-label">Expiring Soon</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import { collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'

export default {
  name: 'AnalyticsManagement',

  data() {
    return {
      loading: true,
      timeRange: '30days',
      customDateRange: { from: null, to: null },
      metrics: {
        totalUsers: 0,
        newUsers: 0,
        userGrowth: null,
        premiumUsers: 0,
        freeUsers: 0,
        conversionRate: 0,
        premiumExpiring: 0,
        totalRoutes: 0,
        avgSignupsPerDay: 0,
        busiestDay: '-',
        peakSignups: 0,
        thisWeekSignups: 0,
        lastWeekSignups: 0,
      },
      userGrowthData: [],
      topRoutes: [],
      recentUsers: [],
      charts: {},
      allUsers: [],
    }
  },

  mounted() {
    this.loadAnalytics()
  },

  beforeUnmount() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy()
    })
  },

  methods: {
    async loadAnalytics() {
      this.loading = true
      try {
        await Promise.all([this.loadUserMetrics(), this.loadRouteMetrics()])
        await this.$nextTick()
        this.createCharts()
      } catch (error) {
        console.error('[Analytics] Error:', error)
        this.$q.notify({ type: 'negative', message: 'Failed to load analytics', position: 'top' })
      } finally {
        this.loading = false
      }
    },

    async loadUserMetrics() {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      this.allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtDate: doc.data().createdAt ? new Date(doc.data().createdAt) : null
      }))

      const dateRange = this.getDateRange()
      const filteredUsers = this.allUsers.filter(user => {
        if (!user.createdAtDate) return false
        return user.createdAtDate >= dateRange.start && user.createdAtDate <= dateRange.end
      })

      this.metrics.totalUsers = this.allUsers.length
      this.metrics.newUsers = filteredUsers.length
      this.metrics.premiumUsers = this.allUsers.filter(u => u.isPremium === true).length
      this.metrics.freeUsers = this.metrics.totalUsers - this.metrics.premiumUsers
      this.metrics.conversionRate = this.metrics.totalUsers > 0
        ? ((this.metrics.premiumUsers / this.metrics.totalUsers) * 100).toFixed(1)
        : 0

      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      this.metrics.premiumExpiring = this.allUsers.filter(u => {
        if (!u.isPremium || !u.premiumExpiry) return false
        const expiryDate = new Date(u.premiumExpiry)
        return expiryDate >= now && expiryDate <= sevenDaysFromNow
      }).length

      this.calculateUserGrowth()
      this.buildUserGrowthData()
      this.calculateSignupTrends()

      this.recentUsers = this.allUsers
        .sort((a, b) => (b.createdAtDate || 0) - (a.createdAtDate || 0))
        .slice(0, 5)
        .map(user => ({
          ...user,
          initials: this.getInitials(user.displayName),
          timeAgo: this.getTimeAgo(user.createdAtDate)
        }))
    },

    async loadRouteMetrics() {
      const routesSnapshot = await getDocs(collection(db, 'routes'))
      this.topRoutes = routesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown Route',
          description: doc.data().description
        }))
        .slice(0, 5)
      this.metrics.totalRoutes = routesSnapshot.size
    },

    getDateRange() {
      const end = new Date()
      let start = new Date()

      switch (this.timeRange) {
        case 'today':
          start.setHours(0, 0, 0, 0)
          break
        case '7days':
          start.setDate(start.getDate() - 7)
          break
        case '30days':
          start.setDate(start.getDate() - 30)
          break
        case 'all':
          start = new Date(0)
          break
        case 'custom':
          start = new Date(this.customDateRange.from)
          return { start, end: new Date(this.customDateRange.to) }
      }
      return { start, end }
    },

    calculateUserGrowth() {
      const currentRange = this.getDateRange()
      const currentUsers = this.allUsers.filter(u => 
        u.createdAtDate && u.createdAtDate >= currentRange.start && u.createdAtDate <= currentRange.end
      ).length

      const periodLength = currentRange.end - currentRange.start
      const previousStart = new Date(currentRange.start.getTime() - periodLength)
      const previousEnd = currentRange.start
      const previousUsers = this.allUsers.filter(u =>
        u.createdAtDate && u.createdAtDate >= previousStart && u.createdAtDate < previousEnd
      ).length

      if (previousUsers === 0) {
        this.metrics.userGrowth = currentUsers > 0 ? 100 : 0
      } else {
        this.metrics.userGrowth = (((currentUsers - previousUsers) / previousUsers) * 100).toFixed(1)
      }
    },

    buildUserGrowthData() {
      const dateRange = this.getDateRange()
      const days = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))
      this.userGrowthData = []

      for (let i = 0; i < days; i++) {
        const date = new Date(dateRange.start)
        date.setDate(date.getDate() + i)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)

        const count = this.allUsers.filter(u => 
          u.createdAtDate && u.createdAtDate >= date && u.createdAtDate < nextDate
        ).length

        this.userGrowthData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count
        })
      }
    },

    calculateSignupTrends() {
      if (this.userGrowthData.length === 0) return

      const totalSignups = this.userGrowthData.reduce((sum, day) => sum + day.count, 0)
      this.metrics.avgSignupsPerDay = (totalSignups / this.userGrowthData.length).toFixed(1)

      const busiestDay = this.userGrowthData.reduce((max, day) => 
        day.count > max.count ? day : max, this.userGrowthData[0]
      )
      this.metrics.busiestDay = busiestDay.date
      this.metrics.peakSignups = busiestDay.count

      const now = new Date()
      const thisWeekStart = new Date(now)
      thisWeekStart.setDate(now.getDate() - now.getDay())
      const lastWeekStart = new Date(thisWeekStart)
      lastWeekStart.setDate(lastWeekStart.getDate() - 7)
      const lastWeekEnd = thisWeekStart

      this.metrics.thisWeekSignups = this.allUsers.filter(u =>
        u.createdAtDate && u.createdAtDate >= thisWeekStart
      ).length

      this.metrics.lastWeekSignups = this.allUsers.filter(u =>
        u.createdAtDate && u.createdAtDate >= lastWeekStart && u.createdAtDate < lastWeekEnd
      ).length
    },

    createCharts() {
      this.createUserGrowthChart()
      this.createUserDistributionChart()
      this.createCumulativeUsersChart()
    },

    createUserGrowthChart() {
      const ctx = this.$refs.userGrowthChart
      if (!ctx) return
      if (this.charts.userGrowth) this.charts.userGrowth.destroy()

      this.charts.userGrowth = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.userGrowthData.map(d => d.date),
          datasets: [{
            label: 'New Signups',
            data: this.userGrowthData.map(d => d.count),
            backgroundColor: '#2d6a4f',
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} new signups` } }
          },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      })
    },

    createUserDistributionChart() {
      const ctx = this.$refs.userDistributionChart
      if (!ctx) return
      if (this.charts.userDistribution) this.charts.userDistribution.destroy()

      this.charts.userDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Free Users', 'Premium Users'],
          datasets: [{
            data: [this.metrics.freeUsers, this.metrics.premiumUsers],
            backgroundColor: ['#e0e0e0', '#ffd60a'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || ''
                  const value = context.parsed
                  const total = context.dataset.data.reduce((a, b) => a + b, 0)
                  const percentage = ((value / total) * 100).toFixed(1)
                  return `${label}: ${value} (${percentage}%)`
                }
              }
            }
          }
        }
      })
    },

    createCumulativeUsersChart() {
      const ctx = this.$refs.cumulativeUsersChart
      if (!ctx) return
      if (this.charts.cumulativeUsers) this.charts.cumulativeUsers.destroy()

      let cumulative = 0
      const cumulativeData = this.userGrowthData.map(d => {
        cumulative += d.count
        return cumulative
      })

      this.charts.cumulativeUsers = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.userGrowthData.map(d => d.date),
          datasets: [{
            label: 'Total Users',
            data: cumulativeData,
            borderColor: '#2d6a4f',
            backgroundColor: 'rgba(45, 106, 79, 0.1)',
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      })
    },

    getInitials(name) {
      if (!name) return 'U'
      const parts = name.split(' ')
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return name.substring(0, 2).toUpperCase()
    },

    getTimeAgo(date) {
      if (!date) return 'Unknown'
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'Just now'
    },

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num.toString()
    },

    applyCustomRange() {
      if (this.customDateRange.from && this.customDateRange.to) {
        this.timeRange = 'custom'
        this.loadAnalytics()
      } else {
        this.$q.notify({ type: 'warning', message: 'Please select both dates', position: 'top' })
      }
    },
  }
}
</script>

<style lang="sass" scoped>
.analytics-container
  .metric-card
    transition: all 0.3s ease
    &:hover
      transform: translateY(-4px)
      box-shadow: 0 4px 12px rgba(0,0,0,0.1)

  .metric-icon
    width: 60px
    height: 60px
    border-radius: 12px
    display: flex
    align-items: center
    justify-content: center
    margin-bottom: 12px

  .metric-value
    font-size: 32px
    font-weight: 700
    color: #2d6a4f
    margin-bottom: 4px

  .metric-label
    font-size: 14px
    color: #6c757d
    text-transform: uppercase
    letter-spacing: 0.5px
    margin-bottom: 8px

  .metric-subtitle
    font-size: 12px
    color: #9e9e9e

  .metric-change
    font-size: 12px
    display: flex
    align-items: center
    gap: 4px
    &.positive
      color: #52b788
    &.negative
      color: #e63946

  .stat-box
    text-align: center
    padding: 20px
    background: #f5f5f5
    border-radius: 8px
    .stat-number
      font-size: 28px
      font-weight: 700
      color: #2d6a4f
      margin-bottom: 8px
    .stat-label
      font-size: 12px
      color: #6c757d
      text-transform: uppercase
      letter-spacing: 0.5px

.text-pine-green
  color: #2d6a4f
</style>