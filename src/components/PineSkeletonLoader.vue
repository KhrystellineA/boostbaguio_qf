<template>
  <div class="pine-skeleton-loader" :style="{ height: height }">
    <div class="pine-tree-container">
      <!-- Pine Tree SVG Animation -->
      <svg class="pine-tree" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
        <!-- Tree Trunk -->
        <rect class="pine-trunk" x="45" y="120" width="10" height="30" rx="2" />

        <!-- Tree Layers (animated to grow) -->
        <g class="pine-layers">
          <!-- Bottom Layer -->
          <polygon class="pine-layer pine-layer-1" points="50,20 15,90 85,90" />
          <!-- Middle Layer -->
          <polygon class="pine-layer pine-layer-2" points="50,40 20,80 80,80" />
          <!-- Top Layer -->
          <polygon class="pine-layer pine-layer-3" points="50,60 25,90 75,90" />
        </g>

        <!-- Pine Cones (decorative) -->
        <circle class="pine-cone" cx="35" cy="75" r="3" />
        <circle class="pine-cone" cx="65" cy="70" r="3" />
        <circle class="pine-cone" cx="40" cy="85" r="3" />
        <circle class="pine-cone" cx="60" cy="80" r="3" />

        <!-- Sparkles (loading indicator) -->
        <g class="pine-sparkles">
          <circle class="sparkle sparkle-1" cx="50" cy="15" r="2" />
          <circle class="sparkle sparkle-2" cx="20" cy="85" r="1.5" />
          <circle class="sparkle sparkle-3" cx="80" cy="85" r="1.5" />
          <circle class="sparkle sparkle-4" cx="30" cy="95" r="1" />
          <circle class="sparkle sparkle-5" cx="70" cy="95" r="1" />
        </g>
      </svg>

      <!-- Loading Text -->
      <div class="pine-loading-text">
        <slot name="text">
          <span class="loading-dots">
            <span>Loading</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
          </span>
        </slot>
      </div>

      <!-- Optional Progress Bar -->
      <div v-if="showProgress" class="pine-progress-bar">
        <div class="pine-progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PineSkeletonLoader',

  props: {
    height: {
      type: String,
      default: '300px',
    },
    showProgress: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      validator: (val) => val >= 0 && val <= 100,
    },
  },
}
</script>

<style lang="sass" scoped>
.pine-skeleton-loader
  display: flex
  align-items: center
  justify-content: center
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)
  border-radius: 16px
  overflow: hidden
  position: relative

.pine-tree-container
  display: flex
  flex-direction: column
  align-items: center
  gap: 20px
  padding: 20px

.pine-tree
  width: 120px
  height: 180px
  animation: pine-sway 3s ease-in-out infinite

.pine-trunk
  fill: #8B4513
  animation: pine-grow-trunk 1s ease-out

.pine-layers
  animation: pine-grow-layers 1.2s ease-out

.pine-layer
  fill: #2E5D3E
  opacity: 0
  transform-origin: center bottom

  &.pine-layer-1
    animation: pine-layer-appear-1 0.8s ease-out 0.3s forwards

  &.pine-layer-2
    animation: pine-layer-appear-2 0.8s ease-out 0.5s forwards

  &.pine-layer-3
    animation: pine-layer-appear-3 0.8s ease-out 0.7s forwards

.pine-cone
  fill: #654321
  opacity: 0
  animation: pine-cone-appear 0.5s ease-out 1s forwards

.pine-sparkles
  .sparkle
    fill: #FFD60A
    opacity: 0
    animation: pine-sparkle 2s ease-in-out infinite

    &.sparkle-1
      animation-delay: 0s

    &.sparkle-2
      animation-delay: 0.4s

    &.sparkle-3
      animation-delay: 0.8s

    &.sparkle-4
      animation-delay: 1.2s

    &.sparkle-5
      animation-delay: 1.6s

.pine-loading-text
  font-size: 16px
  font-weight: 600
  color: #2E5D3E
  text-align: center
  letter-spacing: 0.5px

.loading-dots
  display: inline-flex
  gap: 2px

  .dot
    animation: pine-dot-pulse 1.5s ease-in-out infinite

    &:nth-child(1)
      animation-delay: 0s

    &:nth-child(2)
      animation-delay: 0.2s

    &:nth-child(3)
      animation-delay: 0.4s

.pine-progress-bar
  width: 200px
  height: 6px
  background: rgba(46, 93, 62, 0.2)
  border-radius: 3px
  overflow: hidden

.pine-progress-fill
  height: 100%
  background: linear-gradient(90deg, #2E5D3E 0%, #4A7D5D 100%)
  border-radius: 3px
  transition: width 0.3s ease

// Animations
@keyframes pine-sway
  0%, 100%
    transform: rotate(-2deg)

  50%
    transform: rotate(2deg)

@keyframes pine-grow-trunk
  0%
    height: 0
    y: 150

  100%
    height: 30
    y: 120

@keyframes pine-grow-layers
  0%
    transform: scale(0)

  100%
    transform: scale(1)

@keyframes pine-layer-appear-1
  0%
    opacity: 0
    transform: scale(0.8) translateY(20px)

  100%
    opacity: 1
    transform: scale(1) translateY(0)

@keyframes pine-layer-appear-2
  0%
    opacity: 0
    transform: scale(0.8) translateY(20px)

  100%
    opacity: 1
    transform: scale(1) translateY(0)

@keyframes pine-layer-appear-3
  0%
    opacity: 0
    transform: scale(0.8) translateY(20px)

  100%
    opacity: 1
    transform: scale(1) translateY(0)

@keyframes pine-cone-appear
  0%
    opacity: 0
    transform: scale(0)

  100%
    opacity: 1
    transform: scale(1)

@keyframes pine-sparkle
  0%, 100%
    opacity: 0
    transform: scale(0)

  50%
    opacity: 1
    transform: scale(1.5)

@keyframes pine-dot-pulse
  0%, 100%
    opacity: 0.3

  50%
    opacity: 1

// Dark mode support
.body--dark .pine-skeleton-loader
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%)

.body--dark .pine-loading-text
  color: #81c784
</style>
