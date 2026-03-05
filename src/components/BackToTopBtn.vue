<template>
  <transition name="fade">
    <q-btn
      v-show="show"
      fab
      icon="keyboard_arrow_up"
      color="primary"
      class="back-to-top-btn"
      :style="btnStyle"
      @click="scrollToTop"
      aria-label="Back to top"
    >
      <q-tooltip>Back to top</q-tooltip>
    </q-btn>
  </transition>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { scroll } from 'quasar'

export default {
  name: 'BackToTopBtn',

  props: {
    // Show button after scrolling this many pixels
    threshold: {
      type: Number,
      default: 300
    },
    // Button position
    position: {
      type: String,
      default: 'bottom-right',
      validator: (val) => ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(val)
    },
    // Offset from edge
    offset: {
      type: Number,
      default: 24
    },
    // Scroll target selector (defaults to window)
    scrollTarget: {
      type: String,
      default: null
    }
  },

  setup(props) {
    const show = ref(false)
    const scrollElement = ref(null)

    const btnStyle = computed(() => {
      const styles = {
        position: 'fixed',
        zIndex: 9999,
        transition: 'all 0.3s ease'
      }

      const offset = `${props.offset}px`

      switch (props.position) {
        case 'bottom-right':
          styles.bottom = offset
          styles.right = offset
          break
        case 'bottom-left':
          styles.bottom = offset
          styles.left = offset
          break
        case 'top-right':
          styles.top = offset
          styles.right = offset
          break
        case 'top-left':
          styles.top = offset
          styles.left = offset
          break
      }

      return styles
    })

    const handleScroll = () => {
      const scrollTop = scrollElement.value
        ? scrollElement.value.scrollTop
        : window.scrollY || window.pageYOffset

      show.value = scrollTop > props.threshold
    }

    const scrollToTop = () => {
      if (scrollElement.value) {
        scroll.setScrollPosition(scrollElement.value, 0, 600)
      } else {
        scroll.setScrollPosition(window.document.documentElement, 0, 600)
      }

      // Announce to screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = 'Scrolled to top'
      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }

    onMounted(() => {
      if (props.scrollTarget) {
        scrollElement.value = document.querySelector(props.scrollTarget)
      }

      const target = scrollElement.value || window

      target.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Check initial state
    })

    onUnmounted(() => {
      const target = scrollElement.value || window
      target.removeEventListener('scroll', handleScroll)
    })

    return {
      show,
      btnStyle,
      scrollToTop
    }
  }
}
</script>

<style lang="sass" scoped>
.back-to-top-btn
  width: 56px
  height: 56px
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

  &:hover
    transform: translateY(-4px)
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2)

  &:active
    transform: translateY(-2px)

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.3s ease, transform 0.3s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
  transform: scale(0.8)
</style>
