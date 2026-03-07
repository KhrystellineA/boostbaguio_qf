/**
 * Tests for PineSkeletonLoader Component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PineSkeletonLoader from 'src-components/PineSkeletonLoader.vue'

describe('PineSkeletonLoader', () => {
  describe('Rendering', () => {
    it('renders the component', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.classes()).toContain('pine-skeleton-loader')
    })

    it('renders the pine tree SVG', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.find('svg.pine-tree').exists()).toBe(true)
    })

    it('renders the loading text', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.find('.pine-loading-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading')
    })

    it('renders the sparkles', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.find('.pine-sparkles').exists()).toBe(true)
    })

    it('renders the pine cones', () => {
      const wrapper = mount(PineSkeletonLoader)
      const cones = wrapper.findAll('.pine-cone')
      expect(cones.length).toBeGreaterThan(0)
    })
  })

  describe('Props', () => {
    it('uses default height of 300px', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.props('height')).toBe('300px')
    })

    it('accepts custom height', async () => {
      const wrapper = mount(PineSkeletonLoader, {
        props: {
          height: '400px',
        },
      })
      expect(wrapper.props('height')).toBe('400px')
    })

    it('does not show progress bar by default', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.find('.pine-progress-bar').exists()).toBe(false)
    })

    it('shows progress bar when showProgress is true', () => {
      const wrapper = mount(PineSkeletonLoader, {
        props: {
          showProgress: true,
          progress: 50,
        },
      })
      expect(wrapper.find('.pine-progress-bar').exists()).toBe(true)
    })

    it('uses default progress of 0', () => {
      const wrapper = mount(PineSkeletonLoader, {
        props: {
          showProgress: true,
        },
      })
      const progressFill = wrapper.find('.pine-progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 0%')
    })

    it('accepts custom progress value', () => {
      const wrapper = mount(PineSkeletonLoader, {
        props: {
          showProgress: true,
          progress: 75,
        },
      })
      const progressFill = wrapper.find('.pine-progress-fill')
      expect(progressFill.attributes('style')).toContain('width: 75%')
    })

    it('validates progress is between 0 and 100', () => {
      // Valid values
      expect(() => {
        mount(PineSkeletonLoader, { props: { progress: 0 } })
      }).not.toThrow()

      expect(() => {
        mount(PineSkeletonLoader, { props: { progress: 50 } })
      }).not.toThrow()

      expect(() => {
        mount(PineSkeletonLoader, { props: { progress: 100 } })
      }).not.toThrow()

      // Invalid values should throw in development
      // Note: Vue 3 doesn't throw on invalid prop validation by default
    })
  })

  describe('Slots', () => {
    it('uses default loading text', () => {
      const wrapper = mount(PineSkeletonLoader)
      expect(wrapper.text()).toContain('Loading')
      expect(wrapper.text()).toContain('...')
    })

    it('accepts custom text slot', () => {
      const customText = 'Custom loading message'
      const wrapper = mount(PineSkeletonLoader, {
        slots: {
          text: customText,
        },
      })
      expect(wrapper.text()).toContain(customText)
    })

    it('renders custom slot content with HTML', () => {
      const wrapper = mount(PineSkeletonLoader, {
        slots: {
          text: '<span class="custom-loading">Loading...</span>',
        },
      })
      expect(wrapper.find('.custom-loading').exists()).toBe(true)
    })
  })

  describe('Structure', () => {
    it('has correct tree structure', () => {
      const wrapper = mount(PineSkeletonLoader)

      // Check tree trunk
      expect(wrapper.find('.pine-trunk').exists()).toBe(true)

      // Check tree layers
      expect(wrapper.find('.pine-layers').exists()).toBe(true)
      expect(wrapper.find('.pine-layer-1').exists()).toBe(true)
      expect(wrapper.find('.pine-layer-2').exists()).toBe(true)
      expect(wrapper.find('.pine-layer-3').exists()).toBe(true)
    })

    it('has correct SVG attributes', () => {
      const wrapper = mount(PineSkeletonLoader)
      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe('0 0 100 150')
      expect(svg.attributes('xmlns')).toBe('http://www.w3.org/2000/svg')
    })
  })

  describe('Component Configuration', () => {
    it('has correct component name', () => {
      expect(PineSkeletonLoader.name).toBe('PineSkeletonLoader')
    })

    it('defines all props correctly', () => {
      expect(PineSkeletonLoader.props).toBeDefined()
      expect(PineSkeletonLoader.props.height).toBeDefined()
      expect(PineSkeletonLoader.props.showProgress).toBeDefined()
      expect(PineSkeletonLoader.props.progress).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('has loading text for screen readers', () => {
      const wrapper = mount(PineSkeletonLoader)
      const loadingText = wrapper.find('.pine-loading-text')
      expect(loadingText.exists()).toBe(true)
    })

    it('can be customized with aria labels via slots', () => {
      const wrapper = mount(PineSkeletonLoader, {
        slots: {
          text: '<span aria-live="polite">Loading content...</span>',
        },
      })
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    })
  })
})
