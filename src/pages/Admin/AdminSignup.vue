<template>
  <q-page class="admin-signup-page">
    <div class="main-container">
      <div class="branding-section">
        <div class="brand-container">
          <div class="logo-wrapper">
            <q-icon name="directions_bus" size="120px" color="white" />
          </div>
          <div class="brand-text">
            <h1>BaguioBoost<span class="ph">PH</span></h1>
            <div class="admin-badge">
              <q-icon name="person_add" size="sm" />
              Admin Registration
            </div>
            <div class="tagline">Join the Team • Manage Routes • Build Community</div>
          </div>
        </div>
      </div>

      <q-card class="signup-card">
        <q-card-section>
          <div class="form-header">
            <div class="icon-wrapper">
              <q-icon name="person_add" size="42px" style="background: #2d6a4f; color: white" />
            </div>
            <h3>Create Admin Account</h3>
            <p class="subtitle">Register as Route Manager or Content Admin</p>
          </div>

          <q-form @submit="onSubmit" class="signup-form">
            <q-input
              v-model="formData.name"
              outlined
              label="Full Name"
              class="q-mb-md"
              :rules="[
                v => !!v || 'Name required',
                v => v.length >= 3 || 'Min 3 characters'
              ]"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="person" style="background: #2d6a4f; color: white" />
              </template>
            </q-input>

            <q-input
              v-model="formData.email"
              outlined
              label="Email Address"
              type="email"
              class="q-mb-md"
              :rules="[
                v => !!v || 'Email required',
                v => /.+@.+\..+/.test(v) || 'Invalid email'
              ]"
              autocomplete="username"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="mail" style="background: #2d6a4f; color: white" />
              </template>
            </q-input>

            <q-select
              v-model="formData.role"
              outlined
              label="Admin Role"
              :options="roleOptions"
              option-value="value"
              option-label="label"
              emit-value
              map-options
              class="q-mb-md"
              :rules="[v => !!v || 'Role required']"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="badge" style="background: #2d6a4f; color: white" />
              </template>
            </q-select>

            <q-input
              v-model="formData.password"
              outlined
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              class="q-mb-md"
              :rules="[
                v => !!v || 'Password required',
                v => v.length >= 8 || 'Min 8 characters',
                v => /[A-Z]/.test(v) || 'Need uppercase letter',
                v => /[0-9]/.test(v) || 'Need a number'
              ]"
              autocomplete="new-password"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="lock" style="background: #2d6a4f; color: white" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="formData.confirmPassword"
              outlined
              label="Confirm Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="q-mb-md"
              :rules="[
                v => !!v || 'Confirm password required',
                v => v === formData.password || 'Passwords do not match'
              ]"
              autocomplete="new-password"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="lock_open" style="background: #2d6a4f; color: white" />
              </template>
              <template #append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Create Admin Account"
              unelevated
              no-caps
              class="full-width signup-btn"
              size="lg"
              :loading="loading"
            >
              <template #loading>
                <q-spinner-hourglass color="white" />
              </template>
            </q-btn>
          </q-form>

          <div class="form-footer">
            <q-separator class="q-my-md" />
            <div class="login-link">
              Already have an account?
              <a @click="$router.push('/admin/adminlogin')">Login here</a>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="jeepney-illustration">
      <q-icon name="directions_bus" size="180px" color="white" style="opacity: 0.1" />
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { auth, db } from 'src/boot/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default {
  name: 'BaguioBoostAdminSignup',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      formData: {
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      roleOptions: [
      {
          label: 'Super Admin - Full access to all features',
          value: 'super_admin'
        },
        {
          label: 'Route Manager - Manage jeepney routes',
          value: 'route_manager'
        },
        {
          label: 'Content Admin - Manage places & events',
          value: 'content_admin'
        }
      ]
    }
  },

  methods: {
    async onSubmit() {
  this.loading = true
  
  try {
    const email = this.formData.email.trim().toLowerCase()
    const password = this.formData.password

    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const adminData = {
      uid: user.uid,
      email: email,
      name: this.formData.name.trim(),
      role: this.formData.role,
      isActive: true,
      permissions: this.getDefaultPermissions(this.formData.role),
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      lastLogin: null
    }

    await setDoc(doc(db, 'admins', user.uid), adminData)

    sessionStorage.setItem('adminRole', adminData.role)
    sessionStorage.setItem('adminData', JSON.stringify(adminData))
    sessionStorage.setItem('adminUid', user.uid)

    this.$q.notify({
      type: 'positive',
      message: `Welcome aboard, ${adminData.name}!`,
      icon: 'check_circle',
      position: 'top',
      color: 'pine-green'
    })

    this.$router.push('/admin/dashboard')
    
  } catch (error) {
    console.error('[Admin Signup] Error:', error)
    this.handleError(error)
  } finally {
    this.loading = false
  }
},

    getDefaultPermissions(role) {
      switch (role) {
        case 'super_admin':
          return {
            manageAdmins: true,
            manageRoutes: true,
            managePlaces: true,
            manageEvents: true,
            viewAnalytics: true
          }
        case 'route_manager':
          return {
            manageAdmins: false,
            manageRoutes: true,
            managePlaces: false,
            manageEvents: false,
            viewAnalytics: false
          }
        case 'content_admin':
          return {
            manageAdmins: false,
            manageRoutes: false,
            managePlaces: true,
            manageEvents: true,
            viewAnalytics: false
          }
        default:
          return {}
      }
    },

    handleError(error) {
      let message = 'Signup failed. Please try again.'

      const errorMap = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/weak-password': 'Password is too weak.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled.'
      }

      message = errorMap[error?.code] || error?.message || message

      this.$q.notify({
        type: 'negative',
        message: message,
        icon: 'error',
        position: 'top',
        timeout: 5000
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.admin-signup-page
  background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)
  min-height: 100vh
  display: flex
  align-items: center
  justify-content: center
  padding: 20px
  position: relative
  overflow: hidden

.main-container
  display: flex
  align-items: center
  gap: 100px
  max-width: 1300px
  width: 100%
  z-index: 2

.branding-section
  flex: 1
  display: flex
  flex-direction: column
  gap: 30px

.brand-container
  display: flex
  align-items: center
  gap: 25px

.logo-wrapper
  background: rgba(255, 255, 255, 0.1)
  backdrop-filter: blur(10px)
  border-radius: 20px
  padding: 20px
  border: 2px solid rgba(255, 255, 255, 0.2)

.brand-text
  h1
    font-size: 56px
    font-weight: 700
    color: white
    margin: 0
    letter-spacing: -1px
    line-height: 1
    .ph
      color: #ffd60a
      font-weight: 800

.admin-badge
  display: inline-flex
  align-items: center
  gap: 8px
  background: rgba(255, 255, 255, 0.15)
  backdrop-filter: blur(10px)
  padding: 10px 20px
  border-radius: 25px
  color: white
  font-size: 16px
  font-weight: 600
  margin-top: 12px
  border: 1px solid rgba(255, 255, 255, 0.2)

.tagline
  font-size: 18px
  color: rgba(255, 255, 255, 0.9)
  font-weight: 400
  margin-top: 8px
  letter-spacing: 0.5px

.signup-card
  min-width: 480px
  max-width: 480px
  background: white
  border-radius: 20px
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)
  
  .q-card__section
    padding: 50px

.form-header
  text-align: center
  margin-bottom: 35px
  
  .icon-wrapper
    background: linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)
    width: 80px
    height: 80px
    border-radius: 20px
    display: flex
    align-items: center
    justify-content: center
    margin: 0 auto 20px
    box-shadow: 0 4px 15px rgba(45, 106, 79, 0.2)
  
  h3
    font-size: 28px
    font-weight: 700
    color: #1b4332
    margin: 0 0 5px 0
  
  .subtitle
    font-size: 14px
    color: #6c757d
    margin: 0

.signup-form
  .q-field
    :deep(.q-field__control)
      border-radius: 12px
      height: 56px
    
    :deep(.q-field__label)
      font-size: 15px
      font-weight: 500
    
    :deep(.q-field__native)
      padding: 16px

.signup-btn
  background: linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)
  color: white
  font-weight: 600
  font-size: 16px
  height: 56px
  border-radius: 12px
  margin-top: 10px
  transition: all 0.3s ease
  
  &:hover
    transform: translateY(-2px)
    box-shadow: 0 6px 20px rgba(45, 106, 79, 0.4)

.form-footer
  .login-link
    text-align: center
    font-size: 14px
    color: #6c757d
    
    a
      color: #2d6a4f
      font-weight: 600
      cursor: pointer
      text-decoration: none
      
      &:hover
        text-decoration: underline

.jeepney-illustration
  position: absolute
  bottom: -50px
  right: -50px
  z-index: 1
  pointer-events: none

@media (max-width: 1024px)
  .main-container
    flex-direction: column
    gap: 50px
    
  .branding-section
    align-items: center
    text-align: center
    
  .brand-container
    flex-direction: column

@media (max-width: 600px)
  .admin-signup-page
    padding: 15px
    
  .brand-text h1
    font-size: 42px
    
  .signup-card
    min-width: 100%
    max-width: 100%
    
    .q-card__section
      padding: 35px 25px
      
  .jeepney-illustration
    display: none
</style>