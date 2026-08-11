<template>
  <div class="premium-management">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold text-pine-green q-mb-none">Premium Requests</div>
      <q-space />
      <q-btn
        flat
        color="primary"
        icon="refresh"
        label="Refresh"
        @click="loadRequests"
        :loading="loading"
      />
    </div>

    <q-card class="my-card">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="pending" label="Pending" />
        <q-tab name="approved" label="Approved" />
        <q-tab name="rejected" label="Rejected" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="pending">
          <q-table
            :rows="pendingRequests"
            :columns="columns"
            row-key="id"
            :loading="loading"
            flat
            bordered
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  color="positive"
                  icon="check_circle"
                  @click="approveRequest(props.row)"
                >
                  <q-tooltip>Approve</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  color="negative"
                  icon="cancel"
                  @click="rejectRequest(props.row)"
                >
                  <q-tooltip>Reject</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="visibility"
                  @click="viewReceipt(props.row)"
                >
                  <q-tooltip>View Receipt</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template #body-cell-planMonths="props">
              <q-td :props="props"> {{ props.value }} Month(s) </q-td>
            </template>
            <template #body-cell-createdAt="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="approved">
          <q-table
            :rows="approvedRequests"
            :columns="historyColumns"
            row-key="id"
            :loading="loading"
            flat
            bordered
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body-cell-planMonths="props">
              <q-td :props="props"> {{ props.value }} Month(s) </q-td>
            </template>
            <template #body-cell-createdAt="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="visibility"
                  @click="viewReceipt(props.row)"
                >
                  <q-tooltip>View Receipt</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="rejected">
          <q-table
            :rows="rejectedRequests"
            :columns="historyColumns"
            row-key="id"
            :loading="loading"
            flat
            bordered
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
          >
            <template #body-cell-planMonths="props">
              <q-td :props="props"> {{ props.value }} Month(s) </q-td>
            </template>
            <template #body-cell-createdAt="props">
              <q-td :props="props">
                {{ formatDate(props.value) }}
              </q-td>
            </template>
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="visibility"
                  @click="viewReceipt(props.row)"
                >
                  <q-tooltip>View Receipt</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Receipt Viewer Dialog -->
    <q-dialog v-model="receiptDialog">
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Payment Receipt</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md text-center">
          <div v-if="selectedRequest">
            <p><strong>Name:</strong> {{ selectedRequest.name }}</p>
            <p><strong>Email:</strong> {{ selectedRequest.email }}</p>
            <p><strong>Ref Number:</strong> {{ selectedRequest.referenceNumber }}</p>
            <p><strong>Plan:</strong> {{ selectedRequest.planMonths }} Month(s)</p>

            <q-img
              v-if="selectedRequest.receiptUrl"
              :src="selectedRequest.receiptUrl"
              spinner-color="primary"
              style="max-height: 400px; width: auto"
              fit="contain"
            />
            <div v-else class="text-grey q-mt-md">
              <q-icon name="image_not_supported" size="48px" />
              <p>No receipt image provided</p>
            </div>
          </div>
        </q-card-section>

        <q-card-actions
          align="right"
          class="q-pa-md bg-grey-2"
          v-if="selectedRequest && selectedRequest.status === 'pending'"
        >
          <q-btn flat label="Reject" color="negative" @click="rejectRequest(selectedRequest)" />
          <q-btn
            unelevated
            label="Approve"
            color="positive"
            @click="approveRequest(selectedRequest)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

export default {
  name: 'PremiumManagement',

  setup() {
    const $q = useQuasar()
    const loading = ref(false)
    const tab = ref('pending')
    const requests = ref([])
    const receiptDialog = ref(false)
    const selectedRequest = ref(null)

    const columns = [
      { name: 'name', label: 'User Name', field: 'name', align: 'left', sortable: true },
      { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
      { name: 'planMonths', label: 'Plan', field: 'planMonths', align: 'center', sortable: true },
      { name: 'referenceNumber', label: 'Ref Number', field: 'referenceNumber', align: 'left' },
      {
        name: 'createdAt',
        label: 'Submitted Date',
        field: 'createdAt',
        align: 'left',
        sortable: true,
      },
      { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
    ]

    const historyColumns = [
      { name: 'name', label: 'User Name', field: 'name', align: 'left', sortable: true },
      { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
      { name: 'planMonths', label: 'Plan', field: 'planMonths', align: 'center', sortable: true },
      {
        name: 'createdAt',
        label: 'Submitted Date',
        field: 'createdAt',
        align: 'left',
        sortable: true,
      },
      { name: 'actions', label: 'View', field: 'actions', align: 'center' },
    ]

    const pendingRequests = computed(() => requests.value.filter((r) => r.status === 'pending'))
    const approvedRequests = computed(() => requests.value.filter((r) => r.status === 'approved'))
    const rejectedRequests = computed(() => requests.value.filter((r) => r.status === 'rejected'))

    const formatDate = (ts) => {
      if (!ts) return 'N/A'
      const date = ts.toDate ? ts.toDate() : new Date(ts)
      return date.toLocaleString()
    }

    const loadRequests = async () => {
      loading.value = true
      try {
        const q = query(collection(db, 'premium_requests'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        requests.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      } catch (err) {
        console.error('Error loading premium requests:', err)
        $q.notify({ type: 'negative', message: 'Failed to load requests' })
      } finally {
        loading.value = false
      }
    }

    const viewReceipt = (req) => {
      selectedRequest.value = req
      receiptDialog.value = true
    }

    const approveRequest = async (req) => {
      $q.dialog({
        title: 'Confirm Approval',
        message: `Approve premium access for ${req.email}?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          $q.loading.show()

          // 1. Mark request as approved
          await updateDoc(doc(db, 'premium_requests', req.id), {
            status: 'approved',
            updatedAt: serverTimestamp(),
          })

          // 2. Update user's document in /users collection
          const expiryDate = new Date()
          expiryDate.setMonth(expiryDate.getMonth() + (req.planMonths || 1))

          await updateDoc(doc(db, 'users', req.uid), {
            isPremium: true,
            premiumExpiry: expiryDate.toISOString(),
            updatedAt: serverTimestamp(),
          })

          $q.notify({ type: 'positive', message: 'User approved for premium' })
          receiptDialog.value = false
          await loadRequests()
        } catch (err) {
          console.error('Error approving request:', err)
          $q.notify({ type: 'negative', message: 'Failed to approve request' })
        } finally {
          $q.loading.hide()
        }
      })
    }

    const rejectRequest = async (req) => {
      $q.dialog({
        title: 'Reject Request',
        message: 'Reason for rejection (optional):',
        prompt: {
          model: '',
          type: 'text',
        },
        cancel: true,
        persistent: true,
      }).onOk(async (reason) => {
        try {
          $q.loading.show()

          await updateDoc(doc(db, 'premium_requests', req.id), {
            status: 'rejected',
            rejectReason: reason,
            updatedAt: serverTimestamp(),
          })

          $q.notify({ type: 'info', message: 'Request rejected' })
          receiptDialog.value = false
          await loadRequests()
        } catch (err) {
          console.error('Error rejecting request:', err)
          $q.notify({ type: 'negative', message: 'Failed to reject request' })
        } finally {
          $q.loading.hide()
        }
      })
    }

    onMounted(() => {
      loadRequests()
    })

    return {
      loading,
      tab,
      columns,
      historyColumns,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      receiptDialog,
      selectedRequest,
      formatDate,
      loadRequests,
      viewReceipt,
      approveRequest,
      rejectRequest,
    }
  },
}
</script>

<style scoped>
.text-pine-green {
  color: #2d6a4f;
}
</style>
<!-- --rabbit --K -->
