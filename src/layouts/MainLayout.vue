<template>
  <q-layout view="hHh lpR fFf">
    <app-header />

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
import AppHeader from '../components/AppHeader.vue'

export default {
  name: 'MainLayout',

  components: {
    AppHeader,
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

<style lang="sass">
// Global styles
*
  scroll-behavior: smooth

.q-page
  background: white
</style>
