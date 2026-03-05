/**
 * Boost Baguio - Accessibility Utilities
 *
 * Provides:
 * - Screen reader announcements
 * - Keyboard navigation helpers
 * - Focus management
 * - ARIA utilities
 */

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} [priority='polite'] - Priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(message, priority = 'polite') {
  if (!message) return

  // Remove existing announcements
  const existing = document.getElementById('sr-announcement')
  if (existing) {
    existing.remove()
  }

  // Create announcement element
  const announcement = document.createElement('div')
  announcement.id = 'sr-announcement'
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement (screen readers typically take 5-10 seconds)
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.remove()
    }
  }, 10000)
}

/**
 * Manage focus - move focus to an element
 * @param {string|Element} target - Element or selector to focus
 * @param {Object} options - Focus options
 */
export function focusElement(target, options = {}) {
  const { delay = 0, preventScroll = false } = options

  setTimeout(() => {
    const element = typeof target === 'string' 
      ? document.querySelector(target) 
      : target

    if (element) {
      // Make element focusable if not already
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1')
      }

      element.focus({ preventScroll })

      // Announce to screen readers if element has aria-label or text content
      const label = element.getAttribute('aria-label') || 
                    element.getAttribute('aria-labelledby') ||
                    element.textContent?.trim()
      
      if (label) {
        announceToScreenReader(`${label} focused`)
      }
    }
  }, delay)
}

/**
 * Trap focus within an element (for modals/dialogs)
 * @param {Element} container - Container element to trap focus within
 * @returns {Function} Cleanup function to remove trap
 */
export function trapFocus(container) {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    'details',
    'summary'
  ].join(', ')

  const focusableElements = container.querySelectorAll(focusableSelectors)
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function handleKeyDown(event) {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        event.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        event.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  // Focus first element
  if (firstFocusable) {
    firstFocusable.focus()
  }

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Restore focus to previously focused element
 * @param {Element} previouslyFocused - Element to restore focus to
 */
export function restoreFocus(previouslyFocused) {
  if (previouslyFocused && previouslyFocused.focus) {
    previouslyFocused.focus()
  }
}

/**
 * Get all focusable elements within a container
 * @param {Element} container - Container element
 * @returns {Array<Element>}
 */
export function getFocusableElements(container) {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    'details',
    'summary'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

/**
 * Handle keyboard navigation in a list
 * @param {Event} event - Keyboard event
 * @param {Object} options - Navigation options
 */
export function handleListNavigation(event, options) {
  const { items, currentIndex, onSelect, onClose } = options
  const { key } = event

  let newIndex = currentIndex

  switch (key) {
    case 'ArrowDown':
      event.preventDefault()
      newIndex = Math.min(currentIndex + 1, items.length - 1)
      break

    case 'ArrowUp':
      event.preventDefault()
      newIndex = Math.max(currentIndex - 1, 0)
      break

    case 'Home':
      event.preventDefault()
      newIndex = 0
      break

    case 'End':
      event.preventDefault()
      newIndex = items.length - 1
      break

    case 'Enter':
    case ' ':
      event.preventDefault()
      if (onSelect && currentIndex >= 0) {
        onSelect(currentIndex)
      }
      return

    case 'Escape':
      if (onClose) {
        event.preventDefault()
        onClose()
      }
      return

    default:
      return
  }

  if (newIndex !== currentIndex && items[newIndex]) {
    // Focus the new item
    const element = items[newIndex]
    if (element.focus) {
      element.focus()
    }
  }
}

/**
 * Create accessible button props
 * @param {Object} options - Button options
 * @returns {Object} ARIA props
 */
export function getAccessibleButtonProps(options = {}) {
  const { label, loading, disabled, pressed } = options

  return {
    'aria-label': label,
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    'aria-pressed': pressed,
    role: 'button',
    tabindex: (disabled || loading) ? '-1' : '0'
  }
}

/**
 * Create accessible input props
 * @param {Object} options - Input options
 * @returns {Object} ARIA props
 */
export function getAccessibleInputProps(options = {}) {
  const { label, error, required, describedBy } = options

  return {
    'aria-label': label,
    'aria-invalid': !!error,
    'aria-required': required,
    'aria-describedby': describedBy,
    role: 'textbox'
  }
}

/**
 * Announce form errors to screen readers
 * @param {Array<Object>} errors - Array of error objects { field, message }
 */
export function announceFormErrors(errors) {
  if (!errors || errors.length === 0) return

  const messages = errors.map(e => `${e.field}: ${e.message}`)
  announceToScreenReader(
    `Form has ${errors.length} error${errors.length > 1 ? 's' : ''}. ${messages.join('. ')}`,
    'assertive'
  )
}

/**
 * Announce action result to screen readers
 * @param {string} action - Action performed
 * @param {boolean} success - Whether action was successful
 * @param {string} [details] - Additional details
 */
export function announceActionResult(action, success, details = '') {
  const status = success ? 'successfully' : 'failed to'
  const message = details 
    ? `${action} ${status}. ${details}`
    : `${action} ${status}`

  announceToScreenReader(message, success ? 'polite' : 'assertive')
}

/**
 * Check if reduced motion is preferred
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if high contrast is preferred
 * @returns {boolean}
 */
export function prefersHighContrast() {
  return window.matchMedia('(prefers-contrast: more)').matches
}

/**
 * Skip link helper - creates accessible skip link
 * @param {string} targetId - ID of target element to skip to
 * @returns {string} HTML for skip link
 */
export function createSkipLink(targetId = 'main-content') {
  return `
    <a href="#${targetId}" class="skip-link" aria-label="Skip to main content">
      Skip to main content
    </a>
  `
}

/**
 * Initialize skip link functionality
 */
export function initSkipLink() {
  const skipLink = document.querySelector('.skip-link')
  if (!skipLink) return

  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    const targetId = skipLink.getAttribute('href').replace('#', '')
    const target = document.getElementById(targetId)
    
    if (target) {
      target.setAttribute('tabindex', '-1')
      target.focus()
      announceToScreenReader('Skipped to main content')
    }
  })
}

export default {
  announceToScreenReader,
  focusElement,
  trapFocus,
  restoreFocus,
  getFocusableElements,
  handleListNavigation,
  getAccessibleButtonProps,
  getAccessibleInputProps,
  announceFormErrors,
  announceActionResult,
  prefersReducedMotion,
  prefersHighContrast,
  createSkipLink,
  initSkipLink
}
