<template>
  <section class="features-section">
    <div class="container-features">
      <!-- Header -->
      <div class="section-header">
        <p class="section-tag">Explore</p>
        <h2 class="section-title">DISCOVER BAGUIO'S BEST WITH OUR FEATURES</h2>
        <p class="section-description">
          Navigate Baguio effortlessly with our innovative features designed for commuters and
          tourists alike. From real-time jeepney routes to curated local spots, we've got you
          covered.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="features-grid">
        <!-- Left Column -->
        <div class="features-column left-column">
          <!-- Feature 1: P2P Navigation -->
          <div class="feature-item">
            <div class="feature-icon">
              <q-icon name="map" size="42px" />
            </div>
            <h3 class="feature-title">P2P NAVIGATION (APANAM)</h3>
            <p class="feature-description">
              Get step-by-step directions for jeepney routes tailored to your start and end points.
            </p>
          </div>

          <!-- Feature 2: City Jeeps -->
          <div class="feature-item">
            <div class="feature-icon">
              <q-icon name="alt_route" size="42px" />
            </div>
            <h3 class="feature-title">CITY JEEPS (PAGNAAM)</h3>
            <p class="feature-description">
              Access an interactive map with routes, schedules, fares, and real-time updates from
              fellow commuters.
            </p>
          </div>
        </div>

        <!-- Center Image -->
        <div class="center-image">
          <q-img
            src="https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=600&h=800&fit=crop"
            class="tower-image"
            :ratio="3 / 4"
          />
        </div>

        <!-- Right Column -->
        <div class="features-column right-column">
          <!-- Feature 3: Places -->
          <div class="feature-item">
            <div class="feature-icon">
              <q-icon name="explore" size="42px" />
            </div>
            <h3 class="feature-title">PLACES (ARAMIDEM)</h3>
            <p class="feature-description">
              Explore curated tourist spots with easy commute guides for a seamless travel
              experience.
            </p>
          </div>

          <!-- Feature 4: Events -->
          <div class="feature-item">
            <div class="feature-icon">
              <q-icon name="apartment" size="42px" />
            </div>
            <h3 class="feature-title">EVENTS (ARAMIDEM)</h3>
            <p class="feature-description">
              Stay updated on local festivals and concerts, complete with post-event transportation
              tips.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <q-btn label="Learn More" outline rounded class="learn-btn" size="md" to="/pagnaam" />
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FeaturesSection',
}
</script>

<style lang="scss" scoped>
.features-section {
  background: #f8f8f8;
  padding: 5rem 0;
}

.container-features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Header
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-tag {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.section-description {
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
}

// Features Grid
.features-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 4rem;
  align-items: center;
  margin-bottom: 3rem;
}

.features-column {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.left-column {
  align-items: flex-end;
  text-align: right;
}

.right-column {
  align-items: flex-start;
  text-align: left;
}

// Feature Item
.feature-item {
  max-width: 280px;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: #2c3e50;

  .q-icon {
    font-size: 42px;
  }
}

.left-column .feature-icon {
  margin-left: auto;
}

.right-column .feature-icon {
  margin-right: auto;
}

.feature-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.feature-description {
  font-size: 0.875rem;
  color: #4a4a4a;
  line-height: 1.6;
}

// Center Image
.center-image {
  width: 580px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.tower-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Action Buttons
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.learn-btn {
  border: 1px solid #333;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 2rem;
  text-transform: none;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.signup-btn {
  color: #333;
  font-weight: 500;
  text-transform: none;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

// Responsive
@media (max-width: 1023px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .features-column {
    align-items: center;
    text-align: center;
  }

  .left-column,
  .right-column {
    text-align: center;
  }

  .feature-icon {
    margin: 0 auto 1rem;
  }

  .center-image {
    order: -1;
    margin: 0 auto;
  }

  .section-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 599px) {
  .features-section {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-description {
    font-size: 0.875rem;
  }

  .features-grid {
    gap: 2rem;
  }

  .features-column {
    gap: 2rem;
  }

  .center-image {
    width: 240px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;

    .learn-btn,
    .signup-btn {
      width: 100%;
      max-width: 280px;
    }
  }
}
</style>
