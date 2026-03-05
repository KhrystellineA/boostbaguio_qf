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
import { scroll } from 'quasar'

export default {
  name: 'BackToTopBtn',

  props: {
    threshold: {
      type: Number,
      default: 300
    },
    position: {
      type: String,
      default: 'bottom-right',
      validator: (val) => ['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(val)
    },
    offset: {
      type: Number,
      default: 24
    },
    scrollTarget: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      show: false,
      scrollElement: null
    }
  },

  computed: {
    btnStyle() {
      const styles = {
        position: 'fixed',
        zIndex: 9999,
        transition: 'all 0.3s ease'
      }

      const offset = `${this.offset}px`

      switch (this.position) {
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
    }
  },

  mounted() {
    if (this.scrollTarget) {
      this.scrollElement = document.querySelector(this.scrollTarget)
    }

    const target = this.scrollElement || window
    target.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll()
  },

  beforeUnmount() {
    const target = this.scrollElement || window
    target.removeEventListener('scroll', this.handleScroll)
  },

  methods: {
    handleScroll() {
      const scrollTop = this.scrollElement
        ? this.scrollElement.scrollTop
        : window.scrollY || window.pageYOffset

      this.show = scrollTop > this.threshold
    },

    scrollToTop() {
      if (this.scrollElement) {
        scroll.setScrollPosition(this.scrollElement, 0, 600)
      } else {
        scroll.setScrollPosition(window.document.documentElement, 0, 600)
      }

      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.className = 'sr-only'
      announcement.textContent = 'Scrolled to top'
      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
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
