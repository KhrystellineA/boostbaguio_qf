/**
 * Tests for ErrorBoundary Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ErrorBoundary from 'src-components/ErrorBoundary.vue'

// Mock error monitoring
vi.mock('src-utils/errorMonitoring', () => ({
  logErrorToMonitoring: vi.fn(),
}))

// Mock errorHandler
vi.mock('src-utils/errorHandler', () => ({
  formatError: vi.fn((err) => ({
    message: err.message || 'Unknown error',
    code: err.code || 'UNKNOWN',
  })),
}))

// Mock Quasar with stubs
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Notify: {
      create: vi.fn(),
    },
  }
})

describe('ErrorBoundary', () => {
  let router

  beforeEach(() => {
    vi.clearAllMocks()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div/>' } }],
    })
  })

  describe('Rendering', () => {
    it('renders slot content when no error', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div class="child-content">Child Content</div>',
        },
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      expect(wrapper.find('.child-content').exists()).toBe(true)
      expect(wrapper.find('.child-content').text()).toBe('Child Content')
    })

    it('shows error state when error is captured', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          componentName: 'TestComponent',
        },
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      // Initially no error
      expect(wrapper.vm.hasError).toBe(false)

      // Trigger error
      const testError = new Error('Test error')
      wrapper.vm.triggerError(testError)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.hasError).toBe(true)
    })

    it('displays component name in error details', async () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          componentName: 'MyComponent',
        },
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      expect(wrapper.props('componentName')).toBe('MyComponent')
    })
  })

  describe('Props', () => {
    it('uses default component name "Unknown Component"', () => {
      const wrapper = mount(ErrorBoundary, {
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      expect(wrapper.props('componentName')).toBe('Unknown Component')
    })

    it('accepts custom component name', () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          componentName: 'CustomComponent',
        },
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      expect(wrapper.props('componentName')).toBe('CustomComponent')
    })

    it('accepts custom error handler function', async () => {
      const onErrorHandler = vi.fn()
      const wrapper = mount(ErrorBoundary, {
        props: {
          onError: onErrorHandler,
        },
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      const testError = new Error('Test error')
      wrapper.vm.triggerError(testError)
      await wrapper.vm.$nextTick()

      expect(onErrorHandler).toHaveBeenCalledWith(
        testError,
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('logs error to monitoring service', async () => {
      const { logErrorToMonitoring } = await import('src-utils/errorMonitoring')
      const wrapper = mount(ErrorBoundary, {
        props: {
          componentName: 'TestComponent',
        },
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      const testError = new Error('Test error')
      wrapper.vm.triggerError(testError)
      await wrapper.vm.$nextTick()

      expect(logErrorToMonitoring).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'ErrorBoundary:TestComponent',
          error: testError,
          severity: 'high',
        })
      )
    })

    it('emits error event', async () => {
      const wrapper = mount(ErrorBoundary, {
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      const testError = new Error('Test error')
      wrapper.vm.triggerError(testError)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0]).toEqual([
        { error: testError, errorInfo: expect.any(Object) },
      ])
    })

    it('does not propagate error further (returns false)', () => {
      const wrapper = mount(ErrorBoundary, {
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      const testError = new Error('Test')
      const result = wrapper.vm.errorCaptured(testError, {}, 'test-info')

      expect(result).toBe(false)
    })
  })

  describe('Retry Functionality', () => {
    it('resets error state after retry', async () => {
      const wrapper = mount(ErrorBoundary, {
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      wrapper.vm.triggerError(new Error('Test'))
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.hasError).toBe(true)

      await wrapper.vm.handleRetry()

      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.vm.error).toBeNull()
    })
  })

  describe('Reset Functionality', () => {
    it('resets all error state', async () => {
      const wrapper = mount(ErrorBoundary, {
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      wrapper.vm.triggerError(new Error('Test'))
      await wrapper.vm.$nextTick()

      // Set showDetails to true
      wrapper.vm.showDetails = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.vm.showDetails).toBe(true)

      // Reset
      wrapper.vm.reset()

      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.vm.error).toBeNull()
      expect(wrapper.vm.errorInfo).toBeNull()
      expect(wrapper.vm.showDetails).toBe(false)
    })
  })

  describe('Computed Properties', () => {
    it('formats error message correctly', async () => {
      const wrapper = mount(ErrorBoundary, {
        global: {
          plugins: [router],
          stubs: {
            QIcon: true,
            QBtn: true,
            QCard: true,
            QCardSection: true,
            QSeparator: true,
          },
        },
      })

      const testError = { message: 'Test error message' }
      wrapper.vm.triggerError(testError)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.errorMessage).toContain('Test error message')
    })
  })
})
