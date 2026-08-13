<template>
  <div class="feedback-management">
    <div class="header-actions row justify-between items-center q-mb-md">
      <div class="text-h6">Feedback & Support</div>
      <q-btn
        color="primary"
        icon="refresh"
        label="Refresh"
        outline
        @click="loadFeedback"
        :loading="loading"
      />
    </div>

    <q-card class="table-card">
      <q-table
        :rows="feedbackList"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        class="feedback-table"
        flat
      >
        <!-- Status Column -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.status === 'unread' ? 'negative' : 'positive'"
              text-color="white"
              dense
              size="sm"
            >
              {{ props.row.status.toUpperCase() }}
            </q-chip>
          </q-td>
        </template>

        <!-- Premium Column -->
        <template v-slot:body-cell-premium="props">
          <q-td :props="props" class="text-center">
            <q-icon v-if="props.row.isPremium" name="workspace_premium" color="amber-8" size="24px">
              <q-tooltip>Premium User</q-tooltip>
            </q-icon>
          </q-td>
        </template>

        <!-- Date Column -->
        <template v-slot:body-cell-date="props">
          <q-td :props="props">
            {{ formatDate(props.row.createdAt) }}
          </q-td>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              round
              color="primary"
              icon="visibility"
              size="sm"
              @click="viewFeedback(props.row)"
            >
              <q-tooltip>View Message</q-tooltip>
            </q-btn>
            <q-btn
              v-if="props.row.status === 'unread'"
              flat
              round
              color="positive"
              icon="check_circle"
              size="sm"
              @click="markResolved(props.row)"
            >
              <q-tooltip>Mark Resolved</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- View Dialog -->
    <q-dialog v-model="viewDialog">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">
            <q-icon
              v-if="selectedFeedback?.isPremium"
              name="workspace_premium"
              color="amber-4"
              class="q-mr-sm"
            />
            Message Details
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md" v-if="selectedFeedback">
          <div class="row q-mb-sm">
            <div class="col-4 text-weight-bold">From:</div>
            <div class="col-8">{{ selectedFeedback.name }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-4 text-weight-bold">Email:</div>
            <div class="col-8">
              <a :href="'mailto:' + selectedFeedback.email" class="text-primary">{{
                selectedFeedback.email
              }}</a>
            </div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-4 text-weight-bold">Type:</div>
            <div class="col-8">{{ selectedFeedback.type }}</div>
          </div>
          <div class="row q-mb-sm">
            <div class="col-4 text-weight-bold">Date:</div>
            <div class="col-8">{{ formatDate(selectedFeedback.createdAt) }}</div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-weight-bold q-mb-sm">Message:</div>
          <div
            class="message-box bg-grey-2 q-pa-md rounded-borders text-body2"
            style="white-space: pre-wrap"
          >
            {{ selectedFeedback.message }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-2" v-if="selectedFeedback">
          <q-btn
            v-if="selectedFeedback.status === 'unread'"
            label="Mark as Resolved"
            color="positive"
            @click="markResolvedAndClose(selectedFeedback)"
          />
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useQuasar, date } from 'quasar'

export default {
  name: 'FeedbackManagement',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const feedbackList = ref([])
    const viewDialog = ref(false)
    const selectedFeedback = ref(null)

    const pagination = ref({
      sortBy: 'createdAt',
      descending: true,
      rowsPerPage: 15,
    })

    const columns = [
      { name: 'premium', label: 'Priority', field: 'isPremium', align: 'center', sortable: true },
      { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
      { name: 'type', label: 'Type', field: 'type', align: 'left', sortable: true },
      { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
      { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
      { name: 'date', label: 'Date Submitted', field: 'createdAt', align: 'left', sortable: true },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
    ]

    const loadFeedback = async () => {
      loading.value = true
      try {
        const snap = await getDocs(collection(db, 'contactMessages'))
        const results = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Sort: Premium users first, then by date descending
        results.sort((a, b) => {
          if (a.isPremium && !b.isPremium) return -1
          if (!a.isPremium && b.isPremium) return 1

          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
          return timeB - timeA
        })

        feedbackList.value = results
      } catch (error) {
        console.error('Error loading feedback:', error)
        $q.notify({ type: 'negative', message: 'Failed to load feedback' })
      } finally {
        loading.value = false
      }
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown'
      const jsDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.formatDate(jsDate, 'MMM D, YYYY h:mm A')
    }

    const viewFeedback = (row) => {
      selectedFeedback.value = row
      viewDialog.value = true
    }

    const markResolved = async (row) => {
      try {
        await updateDoc(doc(db, 'contactMessages', row.id), { status: 'resolved' })

        $q.notify({ type: 'positive', message: 'Marked as resolved' })

        // Update local state without full reload
        const index = feedbackList.value.findIndex((f) => f.id === row.id)
        if (index !== -1) {
          feedbackList.value[index].status = 'resolved'
        }
      } catch (error) {
        console.error('Error resolving:', error)
        $q.notify({ type: 'negative', message: 'Failed to update status' })
      }
    }

    const markResolvedAndClose = async (row) => {
      await markResolved(row)
      viewDialog.value = false
    }

    const confirmDelete = (row) => {
      $q.dialog({
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this message? This cannot be undone.',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await deleteDoc(doc(db, 'contactMessages', row.id))
          $q.notify({ type: 'positive', message: 'Message deleted' })
          feedbackList.value = feedbackList.value.filter((f) => f.id !== row.id)
        } catch (error) {
          console.error('Error deleting:', error)
          $q.notify({ type: 'negative', message: 'Failed to delete message' })
        }
      })
    }

    onMounted(() => {
      loadFeedback()
    })

    return {
      loading,
      feedbackList,
      columns,
      pagination,
      viewDialog,
      selectedFeedback,
      loadFeedback,
      formatDate,
      viewFeedback,
      markResolved,
      markResolvedAndClose,
      confirmDelete,
    }
  },
}
</script>

<style lang="scss" scoped>
.table-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feedback-table {
  :deep(.q-table__top) {
    background: #f8f9fa;
  }
}

.message-box {
  border: 1px solid #e0e0e0;
  min-height: 100px;
}
</style>
