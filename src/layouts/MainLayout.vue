<template>
  <q-layout view="hHh lpR fFf">
    <!-- Shared Navbar as q-header -->
    <q-header elevated>
      <q-toolbar class="main-toolbar">
        <SharedNavbar />
      </q-toolbar>
    </q-header>

    <!-- Page Content - MUST use q-page-container in Quasar v2 -->
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
  </q-layout>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import SharedNavbar from '../components/SharedNavbar.vue'

export default {
  name: 'MainLayout',

  components: {
    SharedNavbar,
  },

  setup() {
    const showScrollTop = ref(false)

    const handleScroll = () => {
      showScrollTop.value = window.scrollY > 300
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      showScrollTop,
      scrollToTop,
    }
  },
}
</script>

<style lang="scss">
// Global styles
* {
  scroll-behavior: smooth;
}

// Force q-header and q-toolbar to be transparent so our navbar shows
.q-header {
  background: transparent !important;
  box-shadow: none !important;
}

.q-toolbar {
  background: transparent !important;
}

// q-page-container should not override page backgrounds
.q-page-container {
  background: transparent !important;
}

// Ensure pages have proper backgrounds
.q-page {
  background: transparent !important;
}
</style>
