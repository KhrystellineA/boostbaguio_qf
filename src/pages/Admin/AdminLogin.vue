<template>
  <q-page class="admin-login-page">
    <div class="main-container">
      <!-- Branding Section -->
      <div class="branding-section">
        <div class="brand-container">
          <div class="logo-wrapper">
            <q-icon name="directions_bus" size="120px" color="white" />
          </div>
          <div class="brand-text">
            <h1>Boost<span class="text-accent">Baguio</span></h1>
            <div class="admin-badge">
              <q-icon name="shield" size="sm" />
              Admin Control Panel
            </div>
            <div class="tagline">Manage Routes • Places • Events</div>
          </div>
        </div>

        <div class="info-cards">
          <div class="info-card">
            <q-icon name="route" size="md" />
            <span>Route Management</span>
          </div>
          <div class="info-card">
            <q-icon name="place" size="md" />
            <span>Place Directory</span>
          </div>
          <div class="info-card">
            <q-icon name="event" size="md" />
            <span>Event Calendar</span>
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <q-card class="login-card">
        <q-card-section>
          <div class="form-header">
            <div class="icon-wrapper">
              <q-icon name="admin_panel_settings" size="42px" color="white" class="icon-bg" />
            </div>
            <h3>Admin Login</h3>
            <p class="subtitle">Route Managers & Content Admins</p>
          </div>

          <q-form @submit="onSubmit" class="login-form">
            <q-input
              v-model="email"
              outlined
              label="Admin Email"
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
                <q-icon name="mail" color="white" class="icon-bg" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              outlined
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              class="q-mb-md"
              :rules="[
                v => !!v || 'Password required',
                v => v.length >= 6 || 'Min 6 characters'
              ]"
              autocomplete="current-password"
              bg-color="grey-1"
            >
              <template #prepend>
                <q-icon name="lock" color="white" class="icon-bg" />
              </template>
              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer toggle-password"
                  color="grey-6"
                  @click="togglePasswordVisibility"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              label="Access Admin Panel"
              unelevated
              no-caps
              class="full-width login-btn"
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
            <div class="footer-links">
              <div class="signup-link">
                Don't have an account?
                <a @click="$router.push('/admin/signup')">Sign up here</a>
              </div>
              <div class="footer-text">
                <q-icon name="info" size="xs" color="grey-6" />
                <span>For admin access issues, contact system administrator</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Decorative Elements -->
    <div class="decoration-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="jeepney-icon">🚌</div>
    </div>
  </q-page>
</template>

<script>
import { useQuasar } from 'quasar'
import { auth, db } from 'src/boot/firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export default {
  name: 'BoostBaguioAdminLogin',

  setup() {
    const $q = useQuasar()
    return { $q }
  },

  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false
    }
  },

  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },

    async onSubmit() {
      this.loading = true
      
      try {
        const email = this.email.trim().toLowerCase()
        const password = this.password

        const { user } = await signInWithEmailAndPassword(auth, email, password)

        const adminData = await this.getAdminData(user.uid, user.email)

        if (!adminData) {
          await signOut(auth)
          throw this.createError(
            'auth/not-admin',
            'No admin profile found. Please contact the system administrator.'
          )
        }

        const validRoles = ['super_admin', 'routes_admin', 'places_admin', 'events_admin']
        if (!validRoles.includes(adminData.role)) {
          await signOut(auth)
          throw this.createError(
            'auth/invalid-role',
            `Invalid role: "${adminData.role}". Admin access denied.`
          )
        }

        if (adminData.isActive === false) {
          await signOut(auth)
          throw this.createError(
            'auth/account-disabled',
            'Your admin account has been deactivated. Contact your administrator.'
          )
        }

        sessionStorage.setItem('adminRole', adminData.role)
        sessionStorage.setItem('adminData', JSON.stringify(adminData))
        sessionStorage.setItem('adminUid', user.uid)

        // Log admin login
        const { logAdminLogin } = await import('src/utils/activityLogger')
        await logAdminLogin({
          uid: user.uid,
          name: adminData.name,
          email: adminData.email,
          role: adminData.role
        })

        this.$q.notify({
          type: 'positive',
          message: `Welcome back, ${adminData.name || 'Admin'}!`,
          icon: 'check_circle',
          position: 'top',
          color: 'positive'
        })

        // Redirect to specific dashboard section based on role
        if (adminData.role === 'super_admin') {
          this.$router.push('/admin/dashboard')
        } else if (adminData.role === 'places_admin') {
          this.$router.push('/admin/dashboard#places')
        } else if (adminData.role === 'routes_admin') {
          this.$router.push('/admin/dashboard#routes')
        } else if (adminData.role === 'events_admin') {
          this.$router.push('/admin/dashboard#events')
        } else {
          this.$router.push('/admin/dashboard')
        }

      } catch (error) {
        console.error('[Admin Login] Error:', error)
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },

    async getAdminData(uid, email) {
      try {
        const uidRef = doc(db, 'admins', uid)
        const uidSnap = await getDoc(uidRef)

        if (uidSnap.exists()) {
          return uidSnap.data()
        }

        const q = query(
          collection(db, 'admins'),
          where('email', '==', email)
        )
        const querySnap = await getDocs(q)

        if (!querySnap.empty) {
          return querySnap.docs[0].data()
        }

        return null
      } catch (error) {
        console.error('[Admin Login] Error fetching admin data:', error)
        throw error
      }
    },

    handleError(error) {
      let message = 'Login failed. Please try again.'

      const errorMap = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/invalid-credential': 'Invalid credentials. Check your email and password.',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
        'auth/not-admin': error.message,
        'auth/invalid-role': error.message,
        'auth/account-disabled': error.message
      }

      message = errorMap[error?.code] || error?.message || message

      this.$q.notify({
        type: 'negative',
        message: message,
        icon: 'error',
        position: 'top',
        timeout: 5000
      })
    },

    createError(code, message) {
      const error = new Error(message)
      error.code = code
      return error
    }
  }
}
</script>

<style lang="sass" scoped>
.admin-login-page
  background: linear-gradient(135deg, #2E5D3E 0%, #4A7D5D 100%)
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
    
    .text-accent
      color: #FFD60A !important
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

.info-cards
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 15px
  max-width: 600px

.info-card
  background: rgba(255, 255, 255, 0.1)
  backdrop-filter: blur(10px)
  border-radius: 12px
  padding: 20px
  display: flex
  flex-direction: column
  align-items: center
  gap: 10px
  border: 1px solid rgba(255, 255, 255, 0.15)
  transition: all 0.3s ease
  
  .q-icon
    color: white
    
  span
    color: white
    font-size: 13px
    font-weight: 500
    text-align: center
  
  &:hover
    background: rgba(255, 255, 255, 0.15)
    transform: translateY(-2px)

.login-card
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

.login-form
  .q-field
    :deep(.q-field__control)
      border-radius: 12px
      height: 56px
    
    :deep(.q-field__label)
      font-size: 15px
      font-weight: 500
    
    :deep(.q-field__native)
      padding: 16px

.login-btn
  background: linear-gradient(135deg, #2E5D3E 0%, #4A7D5D 100%)
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
  .footer-links
    display: flex
    flex-direction: column
    gap: 10px

  .signup-link
    text-align: center
    font-size: 14px
    color: #6c757d
    
    a
      color: #2E5D3E
      font-weight: 600
      cursor: pointer
      text-decoration: none
      
      &:hover
        text-decoration: underline

  .footer-text
    display: flex
    align-items: center
    justify-content: center
    gap: 8px
    font-size: 12px
    color: #6c757d
    padding: 0 10px
    line-height: 1.4

.icon-bg
  background: #2E5D3E
  border-radius: 50%
  padding: 8px

.toggle-password
  padding: 8px
  margin-right: 8px
  transition: all 0.2s ease

  &:hover
    color: #2E5D3E !important
    transform: scale(1.1)

  &:active
    transform: scale(0.95)

// Decorative Elements
.decoration-elements
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: 100%
  pointer-events: none
  overflow: hidden
  z-index: 1

.circle
  position: absolute
  border-radius: 50%
  background: rgba(255, 255, 255, 0.05)
  filter: blur(1px)

.circle-1
  width: 200px
  height: 200px
  top: -50px
  left: -50px

.circle-2
  width: 150px
  height: 150px
  bottom: -30px
  right: -30px

.circle-3
  width: 100px
  height: 100px
  top: 40%
  right: 10%

.jeepney-icon
  position: absolute
  top: 20%
  left: 15%
  font-size: 2.5rem
  opacity: 0.05
  transform: rotate(-15deg)
  animation: float 6s ease-in-out infinite

@keyframes float
  0%
    transform: rotate(-15deg) translateY(0px)
  50%
    transform: rotate(-15deg) translateY(-10px)
  100%
    transform: rotate(-15deg) translateY(0px)

@media (max-width: 1024px)
  .main-container
    flex-direction: column
    gap: 50px
    
  .branding-section
    align-items: center
    text-align: center
    
  .brand-container
    flex-direction: column
    
  .info-cards
    grid-template-columns: repeat(3, 1fr)
    width: 100%

@media (max-width: 600px)
  .admin-login-page
    padding: 15px
    
  .brand-text h1
    font-size: 42px
    
  .info-cards
    grid-template-columns: 1fr
    max-width: 300px
    
  .login-card
    min-width: 100%
    max-width: 100%
    
    .q-card__section
      padding: 35px 25px
      
  .decoration-elements
    display: none
</style>