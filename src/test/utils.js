/**
 * Test Utilities
 * Helper functions for testing Vue components
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'
import { createRouter, createMemoryHistory } from 'vue-router'
import { vi } from 'vitest'
import '@testing-library/jest-dom'

/**
 * Create a test app with Quasar, Pinia, and Router
 */
export function createTestApp(component, options = {}) {
  const app = createApp(component)

  // Add Quasar
  app.use(Quasar, {
    config: {
      notify: {},
      loading: {},
    },
    plugins: {},
  })

  // Add Pinia if not disabled
  if (options.pinia !== false) {
    app.use(createPinia())
  }

  // Add Router if provided
  if (options.routes) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: options.routes,
    })
    app.use(router)
    return { app, router, pinia: app._context.provides['__pinia'] }
  }

  return { app, pinia: app._context.provides['__pinia'] }
}

/**
 * Render a component with testing-library
 * Wrapper around @testing-library/vue render with Quasar support
 */
export function renderWithQuasar(component, options = {}) {
  const { render } = require('@testing-library/vue')

  return render(component, {
    global: {
      plugins: [Quasar, createPinia()],
      ...options.global,
    },
    ...options,
  })
}

/**
 * Mock Quasar Notify
 */
export function mockNotify() {
  const notify = {
    create: vi.fn(),
    positive: vi.fn(),
    negative: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }

  return notify
}

/**
 * Mock Quasar Dialog
 */
export function mockDialog() {
  const dialog = {
    create: vi.fn(),
    close: vi.fn(),
  }

  return dialog
}

/**
 * Fire an event on an element
 */
export function fireEvent(element, event, data = {}) {
  const eventType = event.charAt(0).toUpperCase() + event.slice(1)
  const evt = new window[`${eventType}Event`](event, {
    bubbles: true,
    cancelable: true,
    ...data,
  })
  return element.dispatchEvent(evt)
}

/**
 * Wait for an element to be rendered
 */
export async function waitForElement(selector, options = {}) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    if (options.timeout) {
      setTimeout(() => {
        observer.disconnect()
        reject(new Error(`Timeout waiting for ${selector}`))
      }, options.timeout)
    }
  })
}

/**
 * Get all text content from an element
 */
export function getTextContent(element) {
  return element.textContent?.trim() || ''
}

/**
 * Check if element has a class
 */
export function hasClass(element, className) {
  return element.classList.contains(className)
}

/**
 * Find element by text content
 */
export function findByText(container, text) {
  return Array.from(container.querySelectorAll('*')).find((el) => el.textContent?.trim() === text)
}

/**
 * Mock Firebase Auth state
 */
export function mockAuthState(user) {
  const { auth } = require('src/boot/firebase')
  auth.currentUser = user
  return auth
}

/**
 * Create a mock component for testing
 */
export function createMockComponent(template, methods = {}) {
  return {
    template,
    methods,
  }
}
