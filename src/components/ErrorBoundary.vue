<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-fallback">
      <div class="error-content">
        <q-icon name="error_outline" size="64px" color="negative" class="q-mb-md" />
        
        <h4 class="q-my-md">Oops! Something went wrong</h4>
        
        <p class="text-grey-7 q-mb-lg">
          {{ errorMessage }}
        </p>
        
        <div class="error-actions q-gutter-sm">
          <q-btn
            v-if="showRetry"
            unelevated
            color="primary"
            label="Retry"
            icon="refresh"
            no-caps
            @click="handleRetry"
            :loading="isRetrying"
          />
          
          <q-btn
            unelevated
            color="secondary"
            label="Go Home"
            icon="home"
            no-caps
            @click="goHome"
          />
          
          <q-btn
            flat
            color="grey-7"
            label="Show Details"
            icon="expand_more"
            no-caps
            @click="showDetails = !showDetails"
          />
        </div>
        
        <div v-if="showDetails" class="error-details q-mt-md">
          <q-separator class="q-mb-md" />
          
          <div class="text-caption text-grey-6 q-mb-sm">Error Details:</div>
          
          <q-card flat bordered class="bg-grey-2 q-mb-md">
            <q-card-section class="q-pa-sm">
              <div class="text-body2"><strong>Component:</strong> {{ componentName }}</div>
              <div class="text-body2"><strong>Error Code:</strong> {{ errorCode }}</div>
              <div class="text-body2"><strong>Time:</strong> {{ errorTime }}</div>
            </q-card-section>
          </q-card>
          
          <div class="text-caption text-grey-6 q-mb-sm">Stack Trace:</div>
          <pre class="error-stack">{{ errorStack }}</pre>
          
          <q-btn
            flat
            size="sm"
            color="primary"
            label="Copy Error Details"
            icon="content_copy"
            no-caps
            class="q-mt-sm"
            @click="copyErrorDetails"
          />
        </div>
      </div>
    </div>
    
    <slot v-else></slot>
  </div>
</template>

<script>
import { logErrorToMonitoring } from 'src/utils/errorMonitoring'
import { formatError } from 'src/utils/errorHandler'

export default {
  name: 'ErrorBoundary',

  props: {
    componentName: {
      type: String,
      default: 'Unknown Component'
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    customErrorMessage: {
      type: String,
      default: null
    },
    onError: {
      type: Function,
      default: null
    }
  },

  emits: ['error', 'retry'],

  data() {
    return {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isRetrying: false
    }
  },

  computed: {
    errorMessage() {
      if (this.customErrorMessage) {
        return this.customErrorMessage
      }
      
      if (!this.error) {
        return 'An unexpected error occurred.'
      }
      
      const formatted = formatError(this.error)
      return formatted.message || 'An unexpected error occurred.'
    },

    errorCode() {
      if (!this.error) return 'UNKNOWN'
      const formatted = formatError(this.error)
      return formatted.code
    },

    errorTime() {
      return new Date().toLocaleString()
    },

    errorStack() {
      if (!this.error) return 'No stack trace available'
      return this.error.stack || this.error.toString()
    }
  },

  created() {
    // Set up Vue error handler for this component
    this.$options.errorCaptured = this.errorCaptured
  },

  methods: {
    errorCaptured(err, vm, info) {
      this.handleError(err, { componentStack: info })
      // Don't propagate error further
      return false
    },

    handleError(error, errorInfo = {}) {
      this.hasError = true
      this.error = error
      this.errorInfo = errorInfo

      // Log to monitoring service
      logErrorToMonitoring({
        context: `ErrorBoundary:${this.componentName}`,
        error,
        severity: 'high',
        metadata: {
          componentStack: errorInfo.componentStack,
          props: this.$props
        }
      })

      // Emit error event
      this.$emit('error', { error, errorInfo })

      // Call custom error handler
      if (this.onError) {
        this.onError(error, errorInfo)
      }
    },

    async handleRetry() {
      this.isRetrying = true
      
      try {
        // Emit retry event
        this.$emit('retry')
        
        // Reset error state
        this.hasError = false
        this.error = null
        this.errorInfo = null
        
        // Force component re-render
        this.$forceUpdate()
      } catch (error) {
        console.error('[ErrorBoundary] Retry failed:', error)
      } finally {
        this.isRetrying = false
      }
    },

    goHome() {
      this.$router?.push('/')
    },

    async copyErrorDetails() {
      const details = {
        component: this.componentName,
        errorCode: this.errorCode,
        message: this.errorMessage,
        time: this.errorTime,
        stack: this.errorStack
      }

      try {
        await navigator.clipboard.writeText(JSON.stringify(details, null, 2))
        this.$q?.notify({
          type: 'positive',
          message: 'Error details copied to clipboard',
          position: 'top',
          timeout: 2000
        })
      } catch (error) {
        console.error('[ErrorBoundary] Failed to copy:', error)
      }
    },

    // Method to be called from parent components
    triggerError(error) {
      this.handleError(error, {})
    },

    // Method to reset error state
    reset() {
      this.hasError = false
      this.error = null
      this.errorInfo = null
      this.showDetails = false
    }
  }
}
</script>

<style lang="sass" scoped>
.error-boundary
  min-height: inherit
  display: block

.error-fallback
  display: flex
  align-items: center
  justify-content: center
  min-height: 400px
  padding: 40px
  background: #f5f5f5
  border-radius: 12px
  border: 2px solid #ffebee

.error-content
  text-align: center
  max-width: 500px

  h4
    font-size: 24px
    font-weight: 600
    color: #333

  p
    font-size: 15px
    line-height: 1.6

.error-actions
  display: flex
  justify-content: center
  flex-wrap: wrap

.error-details
  text-align: left

  .error-stack
    background: #263238
    color: #aed581
    padding: 16px
    border-radius: 8px
    font-family: 'Courier New', monospace
    font-size: 12px
    line-height: 1.5
    max-height: 300px
    overflow-y: auto
    white-space: pre-wrap
    word-wrap: break-word
    margin: 0
</style>
