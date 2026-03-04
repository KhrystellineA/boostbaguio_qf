<template>
  <q-layout view="hHh lpR fFf">
    <!-- Shared Navbar as q-header -->
    <q-header elevated>
      <q-toolbar class="main-toolbar">
        <SharedNavbar />
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Scroll to Top Button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="keyboard_arrow_up"
        color="primary"
        @click="scrollToTop"
        v-show="showScrollTop"
      />
    </q-page-sticky>

    <!-- Global Contact Dialog -->
    <q-dialog v-model="showContactDialog">
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section class="bg-pine-green text-white row items-center q-py-md">
          <div class="text-h6">Contact Us</div>
          <q-space />
          <q-btn round dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <q-form @submit="submitContactForm" class="q-gutter-md">
            <q-input
              v-model="contactForm.name"
              outlined
              label="Your Name *"
              lazy-rules
              :rules="[val => !!val || 'Name is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>

            <q-input
              v-model="contactForm.email"
              outlined
              label="Email Address *"
              lazy-rules
              :rules="[
                val => !!val || 'Email is required',
                val => /.+@.+\..+/.test(val) || 'Email must be valid'
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>

            <q-input
              v-model="contactForm.subject"
              outlined
              label="Subject *"
              lazy-rules
              :rules="[val => !!val || 'Subject is required']"
            >
              <template v-slot:prepend>
                <q-icon name="subject" />
              </template>
            </q-input>

            <q-input
              v-model="contactForm.message"
              outlined
              label="Message *"
              type="textarea"
              rows="5"
              lazy-rules
              :rules="[val => !!val || 'Message is required']"
            >
              <template v-slot:prepend>
                <q-icon name="message" />
              </template>
            </q-input>

            <div class="row q-gutter-sm q-mt-md">
              <q-btn
                label="Cancel"
                color="grey-7"
                flat
                v-close-popup
                class="col"
              />
              <q-btn
                unelevated
                label="Send Message"
                type="submit"
                color="primary"
                :loading="isSubmitting"
                class="col"
                style="background: #2E5D3E; color: white"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import SharedNavbar from '../components/SharedNavbar.vue'

export default {
  name: 'MainLayout',

  components: {
    SharedNavbar,
  },

  setup() {
    const $q = useQuasar()
    const showScrollTop = ref(false)
    const showContactDialog = ref(false)
    const isSubmitting = ref(false)
    const contactForm = ref({
      name: '',
      email: '',
      subject: '',
      message: ''
    })

    const handleScroll = () => {
      showScrollTop.value = window.scrollY > 300
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    const submitContactForm = async () => {
      isSubmitting.value = true
      
      try {
        // TODO: Add your email service integration here
        // For now, we'll just show a success message
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        
        $q.notify({
          type: 'positive',
          message: 'Thank you! Your message has been sent successfully.',
          position: 'top',
          icon: 'check_circle',
          timeout: 3000
        })
        
        // Reset form and close dialog
        contactForm.value = {
          name: '',
          email: '',
          subject: '',
          message: ''
        }
        showContactDialog.value = false
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Failed to send message. Please try again.',
          position: 'top',
          icon: 'error',
          timeout: 3000
        })
      } finally {
        isSubmitting.value = false
      }
    }

    // Listen for contact dialog open events from child components
    const openContactDialog = () => {
      showContactDialog.value = true
    }

    // Expose method globally via window for footer components
    window.openContactDialog = openContactDialog

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      delete window.openContactDialog
    })

    return {
      showScrollTop,
      showContactDialog,
      isSubmitting,
      contactForm,
      scrollToTop,
      submitContactForm,
    }
  },
}
</script>

<style lang="scss">
// Global styles
* {
  scroll-behavior: smooth;
}

// Ensure q-header and q-toolbar use solid white background
.q-header {
  background: #FFFFFF !important;
}

.q-toolbar {
  background: #FFFFFF !important;
}

// q-page-container should not override page backgrounds
.q-page-container {
  background: transparent !important;
}

// Ensure pages have proper backgrounds
.q-page {
  background: transparent !important;
}

// Mobile Touch Optimizations
@media (max-width: 768px) {
  // Ensure all buttons are touch-friendly (minimum 44px)
  .q-btn {
    min-height: 44px !important;
    min-width: 44px !important;
  }

  // Make q-items touch-friendly
  .q-item {
    min-height: 56px !important;
  }

  // Optimize form inputs for touch
  .q-field {
    min-height: 56px !important;
  }

  // Make tabs easier to tap
  .q-tab {
    min-height: 48px !important;
    min-width: 72px !important;
  }

  // Optimize list items
  .q-item__section--avatar {
    min-width: 56px !important;
  }

  // Make cards easier to tap
  .q-card {
    .q-card__section {
      padding: 16px !important;
    }
  }

  // Optimize expansion items
  .q-expansion-item {
    min-height: 56px !important;
    
    .q-item__section--main {
      font-weight: 600;
    }
  }

  // Make fab buttons larger on mobile
  .q-page__fab {
    .q-btn--fab {
      width: 56px !important;
      height: 56px !important;
    }
  }

  // Optimize select dropdowns
  .q-select {
    .q-field__control {
      min-height: 56px !important;
    }
  }

  // Make checkboxes and radios larger
  .q-checkbox, .q-radio {
    min-height: 48px !important;
    min-width: 48px !important;
  }

  // Optimize chip clickable area
  .q-chip {
    min-height: 40px !important;
    padding: 8px 12px !important;
  }
}
</style>
