<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Activity Logs</h4>
        <p class="text-grey-7 q-mb-none">Track all admin actions and system events</p>
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
          label="Refresh"
          icon="refresh"
          no-caps
          @click="loadActivityLogs"
          :loading="loading"
        />
        <q-btn
          outline
          color="negative"
          label="Clear Old Logs"
          icon="delete_sweep"
          no-caps
          @click="clearOldLogs"
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
                  <q-icon name="today" size="md" color="blue" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ stats.today }}</div>
                <div class="stat-label">Today's Actions</div>
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
                  <q-icon name="check_circle" size="md" color="green" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ stats.thisWeek }}</div>
                <div class="stat-label">This Week</div>
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
                  <q-icon name="folder" size="md" color="orange" />
                </div>
              </div>
              <div class="col text-right">
                <div class="stat-value">{{ stats.byResource.places }}</div>
                <div class="stat-label">Place Actions</div>
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
                <div class="stat-value">{{ stats.byResource.admins }}</div>
                <div class="stat-label">Admin Actions</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input
              v-model="filters.search"
              outlined
              placeholder="Search logs..."
              dense
              @update:model-value="filterLogs"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filters.actionType"
              outlined
              label="Action Type"
              :options="actionTypeOptions"
              dense
              clearable
              @update:model-value="filterLogs"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filters.resource"
              outlined
              label="Resource"
              :options="resourceOptions"
              dense
              clearable
              @update:model-value="filterLogs"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-select
              v-model="filters.admin"
              outlined
              label="Admin"
              :options="adminOptions"
              dense
              clearable
              @update:model-value="filterLogs"
            />
          </div>
          <div class="col-12 col-md-3">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="filters.dateFrom"
                  outlined
                  label="From"
                  type="date"
                  dense
                  @update:model-value="filterLogs"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="filters.dateTo"
                  outlined
                  label="To"
                  type="date"
                  dense
                  @update:model-value="filterLogs"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Activity Logs Table -->
    <q-card>
      <q-card-section>
        <q-table
          :rows="filteredLogs"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
          :rows-per-page-options="[25, 50, 100]"
        >
          <template #body-cell-action="props">
            <q-td :props="props">
              <q-badge :color="getActionColor(props.value)">
                <q-icon :name="getActionIcon(props.value)" size="xs" class="q-mr-xs" />
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-resource="props">
            <q-td :props="props">
              <q-badge outline :color="getResourceColor(props.value)">
                <q-icon :name="getResourceIcon(props.value)" size="xs" class="q-mr-xs" />
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-timestamp="props">
            <q-td :props="props">
              <div class="text-weight-bold">{{ formatTimestamp(props.value) }}</div>
              <div class="text-caption text-grey-7">{{ formatRelativeTime(props.value) }}</div>
            </q-td>
          </template>

          <template #body-cell-admin="props">
            <q-td :props="props">
              <div class="row items-center">
                <q-avatar size="sm" color="primary" text-color="white" class="q-mr-sm">
                  {{ getAdminInitials(props.value) }}
                </q-avatar>
                <div>
                  <div class="text-weight-bold">{{ props.value?.name || 'Unknown' }}</div>
                  <div class="text-caption text-grey-7">{{ props.value?.role || '' }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template #body-cell-details="props">
            <q-td :props="props">
              <div class="text-body2">{{ props.value || '-' }}</div>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="info"
                color="primary"
                @click="viewLogDetails(props.row)"
              >
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Log Details Dialog -->
    <q-dialog v-model="showDetailsDialog">
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="info" class="q-mr-sm" />
            Activity Log Details
          </div>
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item>
              <q-item-section avatar>
                <q-icon name="schedule" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">Timestamp</q-item-label>
                <q-item-label class="text-weight-bold">{{ selectedLog?.timestamp?.toDate()?.toLocaleString() }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="person" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">Admin</q-item-label>
                <q-item-label class="text-weight-bold">{{ selectedLog?.admin?.name }} ({{ selectedLog?.admin?.role }})</q-item-label>
                <q-item-label caption>{{ selectedLog?.admin?.email }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="settings_input_component" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">Action</q-item-label>
                <q-item-label>
                  <q-badge :color="getActionColor(selectedLog?.action)">
                    {{ selectedLog?.action }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="folder" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">Resource</q-item-label>
                <q-item-label>
                  <q-badge outline :color="getResourceColor(selectedLog?.resource)">
                    {{ selectedLog?.resource }}
                  </q-badge>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon name="subject" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">Description</q-item-label>
                <q-item-label>{{ selectedLog?.description }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedLog?.metadata">
              <q-item-section avatar>
                <q-icon name="data_object" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">Metadata</q-item-label>
                <q-item-label>
                  <pre class="metadata-pre">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="selectedLog?.ipAddress">
              <q-item-section avatar>
                <q-icon name="public" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-caption text-grey-7">IP Address</q-item-label>
                <q-item-label>{{ selectedLog.ipAddress }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { db } from 'src/boot/firebase'
import { collection, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'

export default {
  name: 'ActivityLogsManagement',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      logs: [],
      loading: false,
      showDetailsDialog: false,
      selectedLog: null,
      filters: {
        search: '',
        actionType: null,
        resource: null,
        admin: null,
        dateFrom: null,
        dateTo: null
      },
      adminList: [],
      actionTypeOptions: ['create', 'update', 'delete', 'bulk_delete', 'login', 'logout', 'export', 'import'],
      resourceOptions: ['places', 'events', 'jeepneys', 'routes', 'admins', 'photos', 'users'],
      columns: [
        {
          name: 'timestamp',
          label: 'Timestamp',
          field: 'timestamp',
          align: 'left',
          sortable: true
        },
        {
          name: 'admin',
          label: 'Admin',
          field: 'admin',
          align: 'left',
          sortable: true
        },
        {
          name: 'action',
          label: 'Action',
          field: 'action',
          align: 'center',
          sortable: true
        },
        {
          name: 'resource',
          label: 'Resource',
          field: 'resource',
          align: 'center',
          sortable: true
        },
        {
          name: 'details',
          label: 'Details',
          field: 'description',
          align: 'left'
        },
        {
          name: 'actions',
          label: 'Actions',
          field: 'actions',
          align: 'center'
        }
      ],
      stats: {
        today: 0,
        thisWeek: 0,
        byResource: {
          places: 0,
          events: 0,
          jeepneys: 0,
          admins: 0
        }
      }
    }
  },

  computed: {
    filteredLogs() {
      let result = this.logs

      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase()
        result = result.filter(log =>
          log.description?.toLowerCase().includes(search) ||
          log.admin?.name?.toLowerCase().includes(search) ||
          log.resource?.toLowerCase().includes(search)
        )
      }

      // Action type filter
      if (this.filters.actionType) {
        result = result.filter(log => log.action === this.filters.actionType)
      }

      // Resource filter
      if (this.filters.resource) {
        result = result.filter(log => log.resource === this.filters.resource)
      }

      // Admin filter
      if (this.filters.admin) {
        result = result.filter(log => log.admin?.name === this.filters.admin)
      }

      // Date range filter
      if (this.filters.dateFrom) {
        const fromDate = new Date(this.filters.dateFrom)
        result = result.filter(log => {
          const logDate = log.timestamp?.toDate()
          return logDate && logDate >= fromDate
        })
      }

      if (this.filters.dateTo) {
        const toDate = new Date(this.filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        result = result.filter(log => {
          const logDate = log.timestamp?.toDate()
          return logDate && logDate <= toDate
        })
      }

      return result
    },

    adminOptions() {
      return this.adminList.map(admin => admin.name)
    }
  },

  mounted() {
    this.loadActivityLogs()
  },

  methods: {
    async loadActivityLogs() {
      this.loading = true
      try {
        const q = query(
          collection(db, 'activity_logs'),
          orderBy('timestamp', 'desc'),
          limit(500)
        )

        const snapshot = await getDocs(q)
        this.logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        this.calculateStats()
        this.extractAdminList()

        this.$q.notify({
          type: 'positive',
          message: 'Activity logs loaded',
          position: 'top',
          timeout: 2000
        })
      } catch (error) {
        console.error('[Activity Logs] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load activity logs',
          position: 'top'
        })
      } finally {
        this.loading = false
      }
    },

    calculateStats() {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      this.stats.today = 0
      this.stats.thisWeek = 0
      this.stats.byResource = {
        places: 0,
        events: 0,
        jeepneys: 0,
        admins: 0
      }

      this.logs.forEach(log => {
        const logDate = log.timestamp?.toDate()
        if (!logDate) return

        const logDateStr = logDate.toISOString().split('T')[0]

        if (logDateStr === today) {
          this.stats.today++
        }

        if (logDate >= weekAgo) {
          this.stats.thisWeek++
        }

        if (this.stats.byResource[log.resource] !== undefined) {
          this.stats.byResource[log.resource]++
        }
      })
    },

    extractAdminList() {
      const adminMap = new Map()
      this.logs.forEach(log => {
        if (log.admin?.name && !adminMap.has(log.admin.name)) {
          adminMap.set(log.admin.name, log.admin)
        }
      })
      this.adminList = Array.from(adminMap.values())
    },

    filterLogs() {
      // Filters are applied via computed property
    },

    viewLogDetails(log) {
      this.selectedLog = log
      this.showDetailsDialog = true
    },

    getActionColor(action) {
      const colors = {
        create: 'green',
        update: 'blue',
        delete: 'red',
        bulk_delete: 'red',
        login: 'purple',
        logout: 'grey',
        export: 'teal',
        import: 'orange'
      }
      return colors[action] || 'grey'
    },

    getActionIcon(action) {
      const icons = {
        create: 'add_circle',
        update: 'edit',
        delete: 'delete',
        bulk_delete: 'delete_sweep',
        login: 'login',
        logout: 'logout',
        export: 'download',
        import: 'upload_file'
      }
      return icons[action] || 'info'
    },

    getResourceColor(resource) {
      const colors = {
        places: 'green',
        events: 'orange',
        jeepneys: 'blue',
        routes: 'indigo',
        admins: 'purple',
        photos: 'pink',
        users: 'teal'
      }
      return colors[resource] || 'grey'
    },

    getResourceIcon(resource) {
      const icons = {
        places: 'place',
        events: 'event',
        jeepneys: 'directions_bus',
        routes: 'route',
        admins: 'admin_panel_settings',
        photos: 'photo_library',
        users: 'people'
      }
      return icons[resource] || 'folder'
    },

    getAdminInitials(name) {
      if (!name) return '?'
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate()
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatRelativeTime(timestamp) {
      if (!timestamp) return ''
      const date = timestamp.toDate()
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    },

    async exportToCSV() {
      try {
        const date = new Date().toISOString().split('T')[0]
        const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Resource', 'Description', 'IP Address']

        const rows = [headers.join(',')]

        this.filteredLogs.forEach(log => {
          const row = [
            log.timestamp?.toDate()?.toLocaleString() || '',
            log.admin?.name || '',
            log.admin?.email || '',
            log.action || '',
            log.resource || '',
            `"${(log.description || '').replace(/"/g, '""')}"`,
            log.ipAddress || ''
          ]
          rows.push(row.join(','))
        })

        const csvContent = rows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `activity_logs_${date}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        this.$q.notify({
          type: 'positive',
          message: 'Activity logs exported to CSV successfully!',
          position: 'top'
        })
      } catch (error) {
        console.error('[Activity Logs] Error exporting CSV:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to export to CSV',
          position: 'top'
        })
      }
    },

    async clearOldLogs() {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      this.$q.dialog({
        title: 'Clear Old Logs',
        message: `Delete all activity logs older than 30 days? This action cannot be undone.`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        this.loading = true
        try {
          const q = query(collection(db, 'activity_logs'))
          const snapshot = await getDocs(q)

          let deletedCount = 0
          const deletePromises = []

          snapshot.docs.forEach(doc => {
            const data = doc.data()
            const logDate = data.timestamp?.toDate()
            if (logDate && logDate < thirtyDaysAgo) {
              deletePromises.push(deleteDoc(doc(db, 'activity_logs', doc.id)))
              deletedCount++
            }
          })

          if (deletePromises.length > 0) {
            await Promise.all(deletePromises)
            this.$q.notify({
              type: 'positive',
              message: `Cleared ${deletedCount} old activity logs`,
              position: 'top'
            })
            this.loadActivityLogs()
          } else {
            this.$q.notify({
              type: 'info',
              message: 'No logs older than 30 days found',
              position: 'top'
            })
          }
        } catch (error) {
          console.error('[Activity Logs] Error clearing old logs:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to clear old logs',
            position: 'top'
          })
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.text-pine-green
  color: #2d6a4f

.stat-card
  border-radius: 12px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
  transition: all 0.3s ease
  height: 100%

  &:hover
    transform: translateY(-4px)
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12)

.stat-icon
  width: 60px
  height: 60px
  border-radius: 12px
  display: flex
  align-items: center
  justify-content: center

.stat-value
  font-size: 32px
  font-weight: 700
  color: #2d6a4f

.stat-label
  font-size: 14px
  color: #6c757d
  text-transform: uppercase
  letter-spacing: 0.5px

.metadata-pre
  background: #f5f5f5
  padding: 12px
  border-radius: 8px
  font-size: 12px
  font-family: 'Courier New', monospace
  white-space: pre-wrap
  word-wrap: break-word
  max-height: 200px
  overflow-y: auto
  margin: 0
</style>
