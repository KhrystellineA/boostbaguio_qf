/**
 * Boost Baguio - Pull to Refresh Composable
 *
 * Provides pull-to-refresh functionality for mobile:
 * - Touch-based pull detection
 * - Visual feedback during pull
 * - Refresh callback
 * - Threshold-based trigger
 */

import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Pull to refresh composable
 * @param {Function} onRefresh - Callback function when refresh is triggered
 * @param {Object} options - Configuration options
 * @returns {Object} Pull state and methods
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 100, // Distance to trigger refresh
    maxPull = 150, // Maximum pull distance
    resistance = 0.5, // Resistance factor (0-1)
  } = options

  const isPulling = ref(false)
  const pullDistance = ref(0)
  const isRefreshing = ref(false)
  const startY = ref(0)
  const currentY = ref(0)

  let touchContainer = null

  const handleTouchStart = (event) => {
    // Only trigger on mobile devices
    if (window.innerWidth > 768) return

    // Only trigger when at top of page
    if (window.scrollY > 10) return

    startY.value = event.touches[0].clientY
    isPulling.value = true
  }

  const handleTouchMove = (event) => {
    if (!isPulling.value) return

    currentY.value = event.touches[0].clientY
    const diff = currentY.value - startY.value

    // Only pull down, not up
    if (diff > 0) {
      event.preventDefault()
      // Apply resistance for natural feel
      pullDistance.value = Math.min(diff * resistance, maxPull)
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.value) return

    isPulling.value = false

    // Check if threshold was reached
    if (pullDistance.value >= threshold && !isRefreshing.value) {
      await triggerRefresh()
    }

    // Reset pull distance
    pullDistance.value = 0
  }

  const triggerRefresh = async () => {
    isRefreshing.value = true

    try {
      await onRefresh()
    } catch (error) {
      console.error('[PullToRefresh] Error:', error)
    } finally {
      isRefreshing.value = false
      pullDistance.value = 0
    }
  }

  const refresh = async () => {
    await triggerRefresh()
  }

  onMounted(() => {
    touchContainer = document.querySelector('[data-pull-refresh]') || document.body

    touchContainer.addEventListener('touchstart', handleTouchStart, { passive: true })
    touchContainer.addEventListener('touchmove', handleTouchMove, { passive: false })
    touchContainer.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    if (touchContainer) {
      touchContainer.removeEventListener('touchstart', handleTouchStart)
      touchContainer.removeEventListener('touchmove', handleTouchMove)
      touchContainer.removeEventListener('touchend', handleTouchEnd)
    }
  })

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    refresh,
    maxPull,
  }
}

export default {
  usePullToRefresh,
}
