<template>
  <div>
    <div class="row q-mb-md items-center">
      <div class="col">
        <h4 class="q-my-none text-pine-green">Admin Management</h4>
        <p class="text-grey-7 q-mb-none">Manage admin users and permissions</p>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          style="background: #2d6a4f; color: white"
          label="Add Admin"
          icon="add"
          no-caps
          @click="showAddDialog = true"
        />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-input
          v-model="search"
          outlined
          placeholder="Search admins..."
          dense
          class="q-mb-md"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-table
          :rows="filteredAdmins"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          bordered
        >
          <template #body-cell-role="props">
            <q-td :props="props">
              <q-badge :color="getRoleColor(props.value)">
                {{ getRoleLabel(props.value) }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-isActive="props">
            <q-td :props="props">
              <q-badge :color="props.value ? 'positive' : 'negative'">
                {{ props.value ? 'Active' : 'Inactive' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                round
                icon="edit"
                style="background: #2d6a4f; color: white"
                @click="editAdmin(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.uid !== currentAdminUid"
                flat
                dense
                round
                :icon="props.row.isActive ? 'block' : 'check_circle'"
                :color="props.row.isActive ? 'warning' : 'positive'"
                @click="toggleAdminStatus(props.row)"
              >
                <q-tooltip>{{ props.row.isActive ? 'Deactivate' : 'Activate' }}</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.uid !== currentAdminUid"
                flat
                dense
                round
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showAddDialog">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6 text-pine-green">{{ editingAdmin ? 'Edit Admin' : 'Add New Admin' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="form.name"
            outlined
            label="Full Name *"
            class="q-mb-md"
            :rules="[
              val => required(val, 'Full name').valid || required(val, 'Full name').message,
              val => minLength(val, 2, 'Full name').valid || minLength(val, 2, 'Full name').message,
              val => maxLength(val, 100, 'Full name').valid || maxLength(val, 100, 'Full name').message
            ]"
          />

          <q-input
            v-model="form.email"
            outlined
            type="email"
            label="Email *"
            :disable="!!editingAdmin"
            class="q-mb-md"
            :rules="[
              val => required(val, 'Email').valid || required(val, 'Email').message,
              val => email(val).valid || email(val).message
            ]"
          />

          <q-input
            v-if="!editingAdmin"
            v-model="form.password"
            outlined
            type="password"
            label="Password *"
            class="q-mb-md"
            :rules="[
              val => required(val, 'Password').valid || required(val, 'Password').message,
              val => minLength(val, 6, 'Password').valid || minLength(val, 6, 'Password').message,
              val => maxLength(val, 128, 'Password').valid || maxLength(val, 128, 'Password').message
            ]"
            hint="Password must be at least 6 characters"
          />

          <q-select
            v-model="form.role"
            outlined
            label="Role *"
            :options="roleOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            class="q-mb-md"
            :rules="[val => required(val, 'Role').valid || required(val, 'Role').message]"
          />

          <q-toggle
            v-model="form.isActive"
            label="Active Status"
            style="background: #2d6a4f; color: white"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="editingAdmin ? 'Update' : 'Create'"
            style="background: #2d6a4f; color: white"
            @click="saveAdmin"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { db, auth } from 'src/boot/firebase'
import { collection, getDocs, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'
/* eslint-disable no-unused-vars */
import { required, email, minLength, maxLength } from 'src/utils/validation'
/* eslint-enable no-unused-vars */

export default {
  name: 'AdminsManagement',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      admins: [],
      search: '',
      loading: false,
      saving: false,
      showAddDialog: false,
      editingAdmin: null,
      currentAdminUid: sessionStorage.getItem('adminUid'),
      form: {
        name: '',
        email: '',
        password: '',
        role: 'routes_admin',
        isActive: true
      },
      roleOptions: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Routes Administrator', value: 'routes_admin' },
        { label: 'Places Administrator', value: 'places_admin' },
        { label: 'Events Administrator', value: 'events_admin' }
      ],
      columns: [
        { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
        { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
        { name: 'role', label: 'Role', field: 'role', align: 'left' },
        { name: 'isActive', label: 'Status', field: 'isActive', align: 'left' },
        { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
      ]
    }
  },

  computed: {
    filteredAdmins() {
      if (!this.search) return this.admins
      
      const searchLower = this.search.toLowerCase()
      return this.admins.filter(admin => 
        admin.name?.toLowerCase().includes(searchLower) ||
        admin.email?.toLowerCase().includes(searchLower) ||
        this.getRoleLabel(admin.role)?.toLowerCase().includes(searchLower)
      )
    }
  },

  mounted() {
    this.loadAdmins()
  },

  methods: {
    async loadAdmins() {
      this.loading = true
      try {
        console.log('[Admins] Loading admins from Firestore...')
        const querySnapshot = await getDocs(collection(db, 'admins'))
        console.log('[Admins] Found', querySnapshot.size, 'documents')
        
        this.admins = querySnapshot.docs.map(doc => {
          const data = doc.data()
          console.log('[Admins] Document:', doc.id, data)
          return {
            id: doc.id,
            uid: doc.id,
            ...data
          }
        })
        
        console.log('[Admins] Loaded admins:', this.admins)
      } catch (error) {
        console.error('[Admins] Error loading:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load admins',
          position: 'top'
        })
      } finally {
        this.loading = false
      }
    },

    editAdmin(admin) {
      this.editingAdmin = admin
      this.form = {
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
        isActive: admin.isActive
      }
      this.showAddDialog = true
    },

    async saveAdmin() {
      if (!this.form.name || !this.form.email || !this.form.role) {
        this.$q.notify({
          type: 'warning',
          message: 'Please fill in all required fields',
          position: 'top'
        })
        return
      }

      if (!this.editingAdmin && !this.form.password) {
        this.$q.notify({
          type: 'warning',
          message: 'Password is required for new admins',
          position: 'top'
        })
        return
      }

      this.saving = true
      try {
        if (this.editingAdmin) {
          const adminData = {
            name: this.form.name,
            role: this.form.role,
            isActive: this.form.isActive,
            permissions: this.getDefaultPermissions(this.form.role)
          }

          await updateDoc(doc(db, 'admins', this.editingAdmin.uid), adminData)
          this.$q.notify({
            type: 'positive',
            message: 'Admin updated successfully',
            position: 'top'
          })
        } else {
          const { user } = await createUserWithEmailAndPassword(
            auth,
            this.form.email,
            this.form.password
          )

          const adminData = {
            uid: user.uid,
            email: this.form.email,
            name: this.form.name,
            role: this.form.role,
            isActive: this.form.isActive,
            permissions: this.getDefaultPermissions(this.form.role),
            createdAt: new Date().toISOString(),
            createdBy: this.currentAdminUid
          }

          await setDoc(doc(db, 'admins', user.uid), adminData)
          this.$q.notify({
            type: 'positive',
            message: 'Admin created successfully',
            position: 'top'
          })
        }

        this.showAddDialog = false
        this.resetForm()
        this.loadAdmins()
      } catch (error) {
        console.error('[Admins] Error saving:', error)
        let message = 'Failed to save admin'
        
        if (error.code === 'auth/email-already-in-use') {
          message = 'Email is already in use'
        } else if (error.code === 'auth/weak-password') {
          message = 'Password is too weak'
        }

        this.$q.notify({
          type: 'negative',
          message: message,
          position: 'top'
        })
      } finally {
        this.saving = false
      }
    },

    async toggleAdminStatus(admin) {
      try {
        await updateDoc(doc(db, 'admins', admin.uid), {
          isActive: !admin.isActive
        })
        
        this.$q.notify({
          type: 'positive',
          message: `Admin ${!admin.isActive ? 'activated' : 'deactivated'} successfully`,
          position: 'top'
        })
        
        this.loadAdmins()
      } catch (error) {
        console.error('[Admins] Error toggling status:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update admin status',
          position: 'top'
        })
      }
    },

    confirmDelete(admin) {
      this.$q.dialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete admin "${admin.name}"? This action cannot be undone.`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await deleteDoc(doc(db, 'admins', admin.uid))
          this.$q.notify({
            type: 'positive',
            message: 'Admin deleted successfully',
            position: 'top'
          })
          this.loadAdmins()
        } catch (error) {
          console.error('[Admins] Error deleting:', error)
          this.$q.notify({
            type: 'negative',
            message: 'Failed to delete admin',
            position: 'top'
          })
        }
      })
    },

    getDefaultPermissions(role) {
      switch (role) {
        case 'super_admin':
          return ['super_admin:all']
        case 'routes_admin':
          return ['routes:read', 'routes:write', 'routes:delete', 'routes:update', 'jeepneyOptions:all', 'analytics:read']
        case 'places_admin':
          return ['places:read', 'places:write', 'places:delete', 'places:update', 'analytics:read']
        case 'events_admin':
          return ['events:read', 'events:write', 'events:delete', 'events:update', 'analytics:read']
        default:
          return []
      }
    },

    getRoleLabel(role) {
      const labels = {
        super_admin: 'Super Admin',
        routes_admin: 'Routes Administrator',
        places_admin: 'Places Administrator',
        events_admin: 'Events Administrator'
      }
      return labels[role] || role
    },

    getRoleColor(role) {
      const colors = {
        super_admin: 'red',
        routes_admin: 'blue',
        places_admin: 'green',
        events_admin: 'orange'
      }
      return colors[role] || 'grey'
    },

    resetForm() {
      this.form = {
        name: '',
        email: '',
        password: '',
        role: 'route_manager',
        isActive: true
      }
      this.editingEvent = null
    }
  },

  watch: {
    showAddDialog(val) {
      if (!val) {
        this.resetForm()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text-pine-green
  color: #2d6a4f
</style>