<template>
  <section class="guide-section">
    <div class="container-guide">
      <!-- Header -->
      <div class="guide-header">
        <p class="guide-tag">Navigate</p>
        <h2 class="guide-title">YOUR GUIDE TO JEEPNEY NAVIGATION</h2>
        <p class="guide-description">
          Boost Baguio simplifies your commute with easy-to-follow jeepney routes. Explore the
          city's attractions effortlessly while contributing to sustainable tourism.
        </p>
      </div>

      <!-- Steps Grid -->
      <div class="steps-grid">
        <!-- Step 1 -->
        <div class="step-card">
          <div class="step-image">
            <q-icon name="image" size="64px" color="grey-6" />
          </div>
          <h3 class="step-title">STEP 1: INPUT YOUR START AND END POINTS</h3>
          <p class="step-description">Enter your desired locations for tailored navigation.</p>
        </div>

        <!-- Step 2 -->
        <div class="step-card">
          <div class="step-image">
            <q-icon name="image" size="64px" color="grey-6" />
          </div>
          <h3 class="step-title">STEP 2: FOLLOW THE SUGGESTED ROUTE</h3>
          <p class="step-description">Receive step-by-step directions to your destination.</p>
        </div>

        <!-- Step 3 -->
        <div class="step-card">
          <div class="step-image">
            <q-icon name="image" size="64px" color="grey-6" />
          </div>
          <h3 class="step-title">STEP 3: DISCOVER LOCAL ATTRACTIONS</h3>
          <p class="step-description">Explore curated tourist spots along your route.</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="guide-actions">
        <q-btn label="Start" unelevated rounded class="start-btn" size="md" />
        <q-btn label="Learn More" flat class="learn-more-btn" size="md">
          <q-icon name="arrow_forward" size="18px" class="q-ml-xs" />
        </q-btn>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'GuideSection',
}
</script>

<style lang="scss" scoped>
.guide-section {
  background: #9db98f;
  padding: 5rem 0;
}

.container-guide {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Header
.guide-header {
  margin-bottom: 3rem;
}

.guide-tag {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.guide-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.guide-description {
  font-size: 0.95rem;
  color: #2c3e50;
  line-height: 1.6;
  max-width: 700px;
}

// Steps Grid
.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.step-card {
  background: #d9d9d9;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.step-image {
  width: 100%;
  height: 180px;
  background: #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  padding: 0 1.5rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.step-description {
  font-size: 0.875rem;
  color: #4a4a4a;
  line-height: 1.5;
  padding: 0 1.5rem 1.5rem;
}

// Action Buttons
.guide-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.start-btn {
  background: white !important;
  color: #1a1a1a !important;
  font-weight: 600;
  padding: 0.5rem 2rem;
  text-transform: none;

  &:hover {
    background: #f5f5f5 !important;
  }
}

.learn-more-btn {
  color: #1a1a1a;
  font-weight: 500;
  text-transform: none;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Responsive
@media (max-width: 1023px) {
  .guide-section {
    padding: 4rem 0;
  }

  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .guide-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 599px) {
  .guide-section {
    padding: 3rem 0;
  }

  .guide-header {
    margin-bottom: 2rem;
  }

  .guide-title {
    font-size: 1.5rem;
  }

  .guide-description {
    font-size: 0.875rem;
  }

  .steps-grid {
    margin-bottom: 2rem;
  }

  .guide-actions {
    flex-direction: column;
    width: 100%;

    .start-btn,
    .learn-more-btn {
      width: 100%;
    }
  }
}
</style>
