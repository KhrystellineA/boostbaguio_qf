<template>
  <q-page class="flex flex-center bg-page">
    <q-card class="login-card q-pa-lg" flat bordered>
      <!-- Logo/Header -->
      <q-card-section class="text-center q-pb-md">
        <div class="text-h3 text-weight-bold text-primary q-mb-xs">
          Baguio Boost
        </div>
        <div class="text-subtitle1 text-grey-7">
          Premium Jeepney Navigation
        </div>
      </q-card-section>

      <!-- Tabs for Login/Signup -->
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
        </q-tab-panel>

        <!-- Signup Panel -->
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

      <!-- Premium Features Info -->
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
import { useUserStore } from 'stores/user-store'

const router = useRouter()
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
  const result = await userStore.signIn(loginForm.value.email, loginForm.value.password)
  loading.value = false

  if (result.success) {
    router.push('/')
  }
}

const handleSignup = async () => {
  loading.value = true
  const result = await userStore.signUp(
    signupForm.value.email,
    signupForm.value.password,
    signupForm.value.displayName
  )
  loading.value = false

  if (result.success) {
    router.push('/')
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
</style>