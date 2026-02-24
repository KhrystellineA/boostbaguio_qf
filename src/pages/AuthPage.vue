<template>
  <q-page class="auth-page">
    <!-- Background Elements -->
    <div class="auth-background">
      <div class="gradient-overlay"></div>
      <div class="pattern-dots"></div>
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>

    <div class="auth-container">
      <!-- Auth Card -->
      <q-card class="auth-card">
        <q-card-section class="auth-header">
          <div class="icon-bento">
            <q-icon name="account_circle" size="40px" color="white" />
          </div>
          <h2 class="auth-title">{{ isLogin ? 'Welcome Back!' : 'Create Account' }}</h2>
          <p class="auth-subtitle">{{ isLogin ? 'Sign in to continue your journey' : 'Join us and explore Baguio' }}</p>
        </q-card-section>

        <q-separator />

        <!-- Tab Navigation -->
        <q-tabs
          v-model="activeTab"
          class="auth-tabs"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          dense
        >
          <q-tab name="login" label="Login" />
          <q-tab name="signup" label="Sign Up" />
        </q-tabs>

        <q-card-section class="auth-form-section">
          <!-- Login Form -->
          <q-form v-if="isLogin" @submit="handleLogin" class="auth-form">
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
                <div class="input-icon-bento">
                  <q-icon name="mail" size="18px" />
                </div>
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
                <div class="input-icon-bento">
                  <q-icon name="lock" size="18px" />
                </div>
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

            <div class="form-actions">
              <q-checkbox v-model="rememberMe" label="Remember me" color="primary" />
            </div>

            <q-btn
              type="submit"
              label="Sign In"
              color="primary"
              class="auth-btn full-width"
              :loading="loading"
              unelevated
              no-caps
              size="lg"
            >
              <template #loading>
                <q-spinner-dots color="white" size="24px" />
              </template>
            </q-btn>

            <div class="divider-text">
              <span>OR</span>
            </div>

            <q-btn
              flat
              label="Continue as Guest"
              class="guest-btn full-width"
              @click="$router.push('/')"
              no-caps
            />
          </q-form>

          <!-- Signup Form -->
          <q-form v-else @submit="handleSignup" class="auth-form">
            <q-input
              v-model="signupForm.displayName"
              label="Full Name"
              outlined
              dense
              :rules="[val => !!val || 'Name is required']"
              class="auth-input"
            >
              <template v-slot:prepend>
                <div class="input-icon-bento">
                  <q-icon name="person" size="18px" />
                </div>
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
                <div class="input-icon-bento">
                  <q-icon name="mail" size="18px" />
                </div>
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
                val => val.length >= 6 || 'Min 6 characters'
              ]"
              class="auth-input"
            >
              <template v-slot:prepend>
                <div class="input-icon-bento">
                  <q-icon name="lock" size="18px" />
                </div>
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
                val => !!val || 'Required',
                val => val === signupForm.password || 'Passwords must match'
              ]"
              class="auth-input"
            >
              <template v-slot:prepend>
                <div class="input-icon-bento">
                  <q-icon name="lock" size="18px" />
                </div>
              </template>
            </q-input>

            <div class="terms-text">
              By signing up, you agree to our
              <a href="#" class="text-primary">Terms of Service</a> and
              <a href="#" class="text-primary">Privacy Policy</a>
            </div>

            <q-btn
              type="submit"
              label="Create Account"
              color="primary"
              class="auth-btn full-width"
              :loading="loading"
              unelevated
              no-caps
              size="lg"
            >
              <template #loading>
                <q-spinner-dots color="white" size="24px" />
              </template>
            </q-btn>
          </q-form>
        </q-card-section>

        <!-- Admin Link -->
        <q-card-section class="admin-link-section">
          <q-separator />
          <div class="admin-link">
            <span>Admin access?</span>
            <a @click="$router.push('/admin/adminlogin')" class="text-primary cursor-pointer">
              Login here
            </a>
          </div>
        </q-card-section>
      </q-card>

      <!-- Features -->
      <div class="features-section">
        <div class="feature-bento">
          <div class="feature-item">
            <div class="feature-icon-bento">
              <q-icon name="route" size="20px" color="white" />
            </div>
            <span>Point-to-Point Navigation</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon-bento">
              <q-icon name="directions_bus" size="20px" color="white" />
            </div>
            <span>Jeepney Routes</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon-bento">
              <q-icon name="place" size="20px" color="white" />
            </div>
            <span>Discover Places</span>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user-store'
import { auth, db } from 'src/boot/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

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

const isLogin = computed(() => activeTab.value === 'login')

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

<style lang="scss" scoped>
// Color Variables
$primary: #2E5D3E;
$primary-light: #4A7D5D;
$primary-dark: #1B4332;
$accent: #FFD60A;
$bg-light: #F8F9FA;
$text-dark: #2D3436;
$text-muted: #636E72;
$border-color: #E0E0E0;

.auth-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

// Background Design
.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;

  .gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary-light, 0.08) 100%);
  }

  .pattern-dots {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: radial-gradient(circle, rgba($primary, 0.1) 1px, transparent 1px);
    background-size: 30px 30px;
    background-position: 0 0;
    opacity: 0.5;
  }

  .floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .shape {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba($primary, 0.08) 0%, rgba($primary-light, 0.1) 100%);
      animation: float 20s infinite ease-in-out;

      &.shape-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        right: -100px;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 200px;
        height: 200px;
        bottom: -50px;
        left: -50px;
        animation-delay: 5s;
      }

      &.shape-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        left: 10%;
        animation-delay: 10s;
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, 20px) rotate(5deg); }
  50% { transform: translate(-10px, 30px) rotate(-5deg); }
  75% { transform: translate(15px, -15px) rotate(3deg); }
}

// Main Container
.auth-container {
  position: relative;
  z-index: 2;
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

// Auth Card
.auth-card {
  border-radius: 24px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  background: white;
  border: 1px solid rgba($primary, 0.08);

  .auth-header {
    padding: 2rem 2rem 1rem;
    text-align: center;

    .icon-bento {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      box-shadow: 0 6px 20px rgba($primary, 0.2);
    }

    .auth-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: $text-dark;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.5px;
    }

    .auth-subtitle {
      font-size: 0.95rem;
      color: $text-muted;
      margin: 0;
      font-weight: 400;
    }
  }

  .auth-tabs {
    background: rgba($primary, 0.04);
    margin: 0 2rem;
    border-radius: 14px;
    padding: 4px;

    :deep(.q-tab) {
      border-radius: 10px;
      padding: 12px 16px;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: none;
      min-height: 44px;

      &.q-tab--active {
        background: white;
        box-shadow: 0 2px 8px rgba($primary, 0.15);
      }
    }
  }

  .auth-form-section {
    padding: 1.5rem 2rem;
  }
}

// Form Styles
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .auth-input {
    border-radius: 14px;

    :deep(.q-field__control) {
      border-radius: 14px !important;
      background: $bg-light;
      transition: all 0.3s ease;

      &:hover {
        background: darken($bg-light, 2%);
      }
    }

    :deep(.q-field__label) {
      font-size: 0.9rem;
      font-weight: 500;
      color: $text-muted;
    }
  }

  .input-icon-bento {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    box-shadow: 0 2px 8px rgba($primary, 0.15);
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
  }

  .auth-btn {
    border-radius: 14px;
    padding: 14px 24px;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.3px;
    text-transform: none;
    box-shadow: 0 4px 16px rgba($primary, 0.25);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($primary, 0.35);
    }
  }

  .guest-btn {
    border-radius: 14px;
    padding: 12px 24px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: none;
    color: $text-muted;
  }

  .divider-text {
    position: relative;
    text-align: center;
    margin: 0.5rem 0;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: $border-color;
    }

    span {
      position: relative;
      background: white;
      padding: 0 1rem;
      font-size: 0.8rem;
      color: $text-muted;
      font-weight: 500;
    }
  }

  .terms-text {
    font-size: 0.8rem;
    color: $text-muted;
    text-align: center;
    line-height: 1.5;
    margin: 0.5rem 0;

    a {
      color: $primary;
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// Admin Link Section
.admin-link-section {
  padding: 1rem 2rem;
  background: rgba($primary, 0.02);

  .admin-link {
    text-align: center;
    font-size: 0.9rem;
    color: $text-muted;

    span {
      margin-right: 0.5rem;
    }

    a {
      color: $primary;
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// Features Section
.features-section {
  margin-top: 1rem;

  .features-bento {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(255, 255, 255, 0.9);
    padding: 0.75rem 1.25rem;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    }

    span {
      font-size: 0.85rem;
      font-weight: 600;
      color: $text-dark;
    }
  }

  .feature-icon-bento {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba($primary, 0.2);
  }
}

// Cursor Pointer
.cursor-pointer {
  cursor: pointer;
}

// Responsive Design
@media (max-width: 768px) {
  .auth-container {
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  .auth-card {
    .auth-header {
      padding: 1.5rem 1.5rem 1rem;

      .icon-bento {
        width: 64px;
        height: 64px;
      }

      .auth-title {
        font-size: 1.5rem;
      }
    }

    .auth-tabs {
      margin: 0 1.5rem;
    }

    .auth-form-section {
      padding: 1.5rem 1.5rem;
    }

    .admin-link-section {
      padding: 1rem 1.5rem;
    }
  }

  .features-section {
    .feature-item {
      padding: 0.6rem 1rem;

      span {
        font-size: 0.8rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 1rem 0.75rem;
  }

  .auth-card {
    .auth-header {
      padding: 1.25rem 1.25rem 0.75rem;

      .icon-bento {
        width: 56px;
        height: 56px;
      }

      .auth-title {
        font-size: 1.25rem;
      }

      .auth-subtitle {
        font-size: 0.85rem;
      }
    }

    .auth-tabs {
      margin: 0 1.25rem;

      :deep(.q-tab) {
        padding: 10px 12px;
        font-size: 0.85rem;
      }
    }

    .auth-form-section {
      padding: 1.25rem 1.25rem;
    }

    .admin-link-section {
      padding: 0.75rem 1.25rem;
    }
  }

  .features-section {
    .feature-bento {
      flex-direction: column;
      align-items: center;
    }

    .feature-item {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
