<template>
  <q-page class="flex flex-center bg-page">
    <q-card class="login-card q-pa-lg" flat bordered>
      <q-card-section class="text-center q-pb-md">
        <div class="text-h3 text-weight-bold text-primary q-mb-xs">
          Baguio Boost
        </div>
        <div class="text-subtitle1 text-grey-7">
          Premium Jeepney Navigation
        </div>
      </q-card-section>

      <q-tabs
        v-model="tab"
        class="q-mb-md"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        dense
      >
        <q-tab name="login" label="Login" no-caps />
        <q-tab name="signup" label="Sign Up" no-caps />
      </q-tabs>

      <q-separator class="q-mb-md" />

      <q-tab-panels v-model="tab" animated transition-prev="fade" transition-next="fade">
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
            >
              <template v-slot:prepend>
                <q-icon name="mail_outline" />
              </template>
            </q-input>

            <q-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              outlined
              dense
              :rules="[val => !!val || 'Password is required']"
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="q-pt-sm">
              <q-btn
                type="submit"
                label="Login"
                color="primary"
                class="full-width"
                :loading="loading"
                unelevated
                no-caps
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

        <q-tab-panel name="signup" class="q-px-none">
          <q-form @submit="handleSignup" class="q-gutter-md">
            <q-input
              v-model="signupForm.displayName"
              label="Full Name"
              outlined
              dense
              :rules="[val => !!val || 'Name is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person_outline" />
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
            >
              <template v-slot:prepend>
                <q-icon name="mail_outline" />
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
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
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
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" />
              </template>
            </q-input>

            <div class="q-pt-sm">
              <q-btn
                type="submit"
                label="Create Account"
                color="primary"
                class="full-width"
                :loading="loading"
                unelevated
                no-caps
              />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>

      <q-separator class="q-my-md" />
      
      <q-card-section class="q-py-md">
        <div class="text-center">
          <q-icon name="workspace_premium" color="amber-7" size="24px" class="q-mb-xs" />
          <div class="text-body2 text-grey-7">
            Premium features include offline mode & PWA support
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'stores/user-store'

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

const handleLogin = async () => {
  loading.value = true
  
  try {
    sessionStorage.removeItem('adminRole')
    sessionStorage.removeItem('adminData')
    sessionStorage.removeItem('adminUid')
    
    const result = await userStore.signIn(loginForm.value.email, loginForm.value.password)
    
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Welcome back!',
        icon: 'check_circle',
        position: 'top'
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
        position: 'top'
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
.bg-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
}

.cursor-pointer {
  cursor: pointer;
  text-decoration: none;
}

.cursor-pointer:hover {
  text-decoration: underline;
}
</style>