import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    quasar({
      sassVariables: 'src/css/quasar-variables.sass',
    }),
  ],

  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      'src-boot': fileURLToPath(new URL('./src/boot', import.meta.url)),
      'src-components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'src-composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      'src-css': fileURLToPath(new URL('./src/css', import.meta.url)),
      'src-layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      'src-pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      'src-router': fileURLToPath(new URL('./src/router', import.meta.url)),
      'src-stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      'src-utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },

  test: {
    // Test environment
    environment: 'jsdom',

    // Global test setup
    globals: true,

    // Setup files
    setupFiles: ['./src/test/setup.js'],

    // Include test files
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [...configDefaults.exclude, 'e2e/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,vue}'],
      exclude: [
        'src/boot/**',
        'src/router/**',
        'src/test/**',
        '**/*.d.ts',
        '**/*.config.js',
        '**/main.js',
        'src/pages/admin/**',
        'src/components/admin/**',
      ],
    },

    // Test timeout
    testTimeout: 10000,

    // Hook timeout
    hookTimeout: 10000,

    // Restore mocks after each test
    restoreMocks: true,

    // Clear mocks after each test
    clearMocks: true,
  },
})
