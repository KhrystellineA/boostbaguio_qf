<template>
  <q-page class="auth-page flex flex-center">
    <div class="auth-container">
      <div class="auth-card">
        <!-- Brand Header -->
        <div class="brand-header text-center q-pb-lg">
          <div class="logo-container q-mb-md">
            <img src="~assets/logo.png" alt="Boost Baguio Logo" class="logo">
          </div>
          <div class="text-h3 text-weight-bold text-primary q-mb-sm">
            Boost Baguio
          </div>
          <div class="text-subtitle1 text-grey-7">
            Premium Jeepney Navigation
          </div>
        </div>

        <!-- Tab Navigation -->
        <q-tabs
          v-model="tab"
          class="auth-tabs q-mb-md"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          dense
        >
          <q-tab name="login" label="Login" no-caps />
          <q-tab name="signup" label="Sign Up" no-caps />
        </q-tabs>

        <q-separator class="q-mb-md" />

        <!-- Tab Panels -->
        <q-tab-panels v-model="tab" animated transition-prev="fade" transition-next="fade">
          <!-- Login Panel -->
          <q-tab-panel name="login" class="q-px-none">
            <q-form @submit="handleLogin" class="q-gutter-md">
              <q-input
                v-model="loginForm.email"
                type="email"
                label="Email Address"
                outlined
                dense
                :rules="[
                  val => !!val || 'Email is required',
                  val => /.+@.+\..+/.test(val) || 'Invalid email'
                ]"
                class="auth-input"
              >
                <template v-slot:prepend>
                  <q-icon name="mail_outline" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                outlined
                dense
                :rules="[val => !!val || 'Password is required']"
                class="auth-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                    color="grey-6"
                  />
                </template>
              </q-input>

              <div class="q-pt-sm">
                <q-btn
                  type="submit"
                  label="Login"
                  color="primary"
                  class="full-width auth-btn"
                  :loading="loading"
                  unelevated
                  no-caps
                  size="lg"
                />
              </div>
            </q-form>
            
            <div class="text-center q-mt-md">
              <q-separator class="q-mb-sm" />
              <div class="text-caption text-grey-7">
                Admin? <a @click="$router.push('/admin/adminlogin')" class="text-primary cursor-pointer">Login here</a>
              </div>
            </div>
          </q-tab-panel>

          <!-- Sign Up Panel -->
          <q-tab-panel name="signup" class="q-px-none">
            <q-form @submit="handleSignup" class="q-gutter-md">
              <q-input
                v-model="signupForm.displayName"
                label="Full Name"
                outlined
                dense
                :rules="[val => !!val || 'Name is required']"
                class="auth-input"
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="signupForm.email"
                type="email"
                label="Email Address"
                outlined
                dense
                :rules="[
                  val => !!val || 'Email is required',
                  val => /.+@.+\..+/.test(val) || 'Invalid email'
                ]"
                class="auth-input"
              >
                <template v-slot:prepend>
                  <q-icon name="mail_outline" color="primary" />
                </template>
              </q-input>

              <q-input
                v-model="signupForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                outlined
                dense
                :rules="[
                  val => !!val || 'Password is required',
                  val => val.length >= 6 || 'Password must be at least 6 characters'
                ]"
                class="auth-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="primary" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                    color="grey-6"
                  />
                </template>
              </q-input>

              <q-input
                v-model="signupForm.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Confirm Password"
                outlined
                dense
                :rules="[
                  val => !!val || 'Please confirm password',
                  val => val === signupForm.password || 'Passwords do not match'
                ]"
                class="auth-input"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="primary" />
                </template>
              </q-input>

              <div class="q-pt-sm">
                <q-btn
                  type="submit"
                  label="Create Account"
                  color="primary"
                  class="full-width auth-btn"
                  :loading="loading"
                  unelevated
                  no-caps
                  size="lg"
                />
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator class="q-my-md" />
        
        <!-- Premium Features -->
        <q-card-section class="q-py-md">
          <div class="premium-features text-center">
            <q-icon name="workspace_premium" color="amber-7" size="24px" class="q-mb-xs" />
            <div class="text-body2 text-grey-7">
              Premium features include offline mode & PWA support
            </div>
          </div>
        </q-card-section>
      </div>

      <!-- Decorative Elements -->
      <div class="decorative-elements">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
        <div class="jeepney-icon">🚌</div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user-store'
import { auth, db } from 'src/boot/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()

const tab = ref('login')
const loading = ref(false)
const showPassword = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const signupForm = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const checkIfAdmin = async (user) => {
  try {
    const uidRef = doc(db, 'admins', user.uid)
    const uidSnap = await getDoc(uidRef)

    if (uidSnap.exists()) {
      return uidSnap.data()
    }

    const q = query(
      collection(db, 'admins'),
      where('email', '==', user.email)
    )
    const querySnap = await getDocs(q)

    if (!querySnap.empty) {
      return querySnap.docs[0].data()
    }

    return null
  } catch (error) {
    console.error('[AuthPage] Error checking admin status:', error)
    return null
  }
}

const handleLogin = async () => {
  loading.value = true

  try {
    sessionStorage.removeItem('adminRole')
    sessionStorage.removeItem('adminData')
    sessionStorage.removeItem('adminUid')

    const result = await userStore.signIn(loginForm.value.email, loginForm.value.password)

    if (result.success) {
      const adminData = await checkIfAdmin(auth.currentUser)

      if (adminData) {
        const validRoles = ['super_admin', 'route_manager', 'content_admin', 'routes_admin', 'places_admin', 'events_admin']
        if (validRoles.includes(adminData.role) && adminData.isActive !== false) {
          sessionStorage.setItem('adminRole', adminData.role)
          sessionStorage.setItem('adminData', JSON.stringify(adminData))
          sessionStorage.setItem('adminUid', auth.currentUser.uid)

          $q.notify({
            type: 'positive',
            message: `Welcome back, Admin ${adminData.name || auth.currentUser.email}!`,
            icon: 'check_circle',
            position: 'top',
            timeout: 1500
          })

          // All admins go to admin dashboard
          router.push('/admin/dashboard')
          return
        }
      }

      $q.notify({
        type: 'positive',
        message: 'Welcome back!',
        icon: 'check_circle',
        position: 'top',
        timeout: 1500
      })
      router.push('/')
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Login failed',
        icon: 'error',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('[AuthPage] Login error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Login failed. Please try again.',
      icon: 'error',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const handleSignup = async () => {
  loading.value = true
  
  try {
    sessionStorage.removeItem('adminRole')
    sessionStorage.removeItem('adminData')
    sessionStorage.removeItem('adminUid')
    
    const result = await userStore.signUp(
      signupForm.value.email,
      signupForm.value.password,
      signupForm.value.displayName
    )

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Account created successfully!',
        icon: 'check_circle',
        position: 'top',
        timeout: 1500
      })
      router.push('/')
    } else {
      $q.notify({
        type: 'negative',
        message: result.message || 'Signup failed',
        icon: 'error',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('[AuthPage] Signup error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Signup failed. Please try again.',
      icon: 'error',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.auth-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(45, 93, 62, 0.1);
}

.brand-header {
  margin-bottom: 1.5rem;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo {
  height: 80px;
  object-fit: contain;
}

.auth-tabs {
  background: #f8f9fa;
  border-radius: 50px;
  padding: 2px;
}

.auth-input {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.auth-input ::v-deep(.q-field__control) {
  border-radius: 12px !important;
}

.auth-btn {
  border-radius: 12px;
  padding: 14px 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(45, 93, 62, 0.2);
}

.auth-btn:hover {
  box-shadow: 0 6px 16px rgba(45, 93, 62, 0.3);
}

.cursor-pointer {
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s;
}

.cursor-pointer:hover {
  text-decoration: underline;
  color: #4A7D5D !important;
}

.premium-features {
  padding: 1rem 0;
}

/* Decorative Elements */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(45, 93, 62, 0.1) 0%, rgba(141, 110, 99, 0.1) 100%);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  right: -30px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 40%;
  right: 10%;
}

.jeepney-icon {
  position: absolute;
  top: 20%;
  left: 15%;
  font-size: 2.5rem;
  opacity: 0.1;
  transform: rotate(-15deg);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: rotate(-15deg) translateY(0px); }
  50% { transform: rotate(-15deg) translateY(-10px); }
  100% { transform: rotate(-15deg) translateY(0px); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
  
  .logo {
    height: 60px;
  }
  
  .text-h3 {
    font-size: 1.5rem;
  }
  
  .circle-1 {
    width: 150px;
    height: 150px;
  }
  
  .circle-2 {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.25rem;
  }
  
  .auth-btn {
    padding: 12px 20px;
  }
  
  .text-h3 {
    font-size: 1.3rem;
  }
}
</style>