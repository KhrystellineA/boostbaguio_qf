<template>
  <div class="teaching-steps-container">
    <div v-for="(step, index) in steps" :key="index" class="step-card card-hover">
      <div class="step-icon">{{ step.icon }}</div>
      <div class="step-number">STEP {{ index + 1 }}</div>
      <div class="step-title">{{ step.title }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const steps = ref([
  { icon: '🚶‍♂️', title: 'Walk to Terminal' },
  { icon: '🚌', title: 'Board the Jeepney' },
  { icon: '💬', title: 'Tell the Driver' },
  { icon: '📍', title: 'Arrive at Destination' },
]);
</script>

<style lang="scss" scoped>
.teaching-steps-container {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.step-card {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  width: 180px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.step-icon {
  font-size: 48px;
  line-height: 1;
  margin-bottom: 12px;
}

.step-number {
  font-size: 12px;
  font-weight: 600;
  color: $secondary;
  margin-bottom: 4px;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-color;
}
</style>