/**
 * Performance Optimization Utilities
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function - limits execution to once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Virtual scroll calculator
 * @param {Array} items - Full list of items
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @returns {Array} Visible items
 */
export function getVisibleItems(items, startIndex, endIndex) {
  return items.slice(startIndex, endIndex)
}

/**
 * Calculate visible range for virtual scrolling
 * @param {number} scrollTop - Current scroll position
 * @param {number} containerHeight - Container height
 * @param {number} itemHeight - Height of each item
 * @param {number} totalItems - Total number of items
 * @param {number} overscan - Number of items to render above/below viewport
 * @returns {Object} Start and end indices
 */
export function calculateVisibleRange(
  scrollTop,
  containerHeight,
  itemHeight,
  totalItems,
  overscan = 5
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(totalItems, startIndex + visibleCount + overscan * 2)

  return { startIndex, endIndex }
}

/**
 * Request idle callback polyfill
 * @param {Function} callback - Callback to execute when idle
 */
export function requestIdleCallback(callback) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback)
  }
  return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 1)
}

/**
 * Memory-efficient event listener
 * @param {EventTarget} target - Event target
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
export function addPassiveListener(target, event, handler, options = {}) {
  target.addEventListener(event, handler, { passive: true, ...options })
}

/**
 * Remove event listener
 * @param {EventTarget} target - Event target
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 */
export function removeListener(target, event, handler) {
  target.removeEventListener(event, handler)
}
