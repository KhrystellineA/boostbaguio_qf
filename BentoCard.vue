<template>
  <div class="bento-card card-hover">
    <div class="bento-card__accent-border"></div>
    <div class="bento-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
// No script needed for this simple component
</script>

<style lang="scss" scoped>
.bento-card {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;

  &__accent-border {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    background-color: $primary;
  }

  &__content {
    margin-left: 18px; // Give space from the accent border
  }
}
</style>