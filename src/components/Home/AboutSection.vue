<template>
  <section class="about-section">
    <div class="container-about">
      <div class="about-grid">
        <!-- Left Content -->
        <div class="about-content">
          <div class="about-icon">
            <q-icon name="eco" size="48px" />
          </div>
          <h2 class="about-title">ABOUT US</h2>
          <p class="about-description">
            At Boost Baguio, we are dedicated to enhancing your commuting experience in Baguio City.
            Our app seamlessly connects you to jeepney routes, local attractions, and events, while
            promoting eco-friendly travel.
          </p>
        </div>

        <!-- Right Image -->
        <div class="about-image">
          <q-img src="../../assets/img.png" class="about-img" :ratio="4 / 3" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutSection',
}
</script>

<style lang="scss" scoped>
.about-section {
  background: #9ec98f;
  padding: 5rem 0;
}

.container-about {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

// Left Content
.about-content {
  display: flex;
  flex-direction: column;
}

.about-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.about-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.25rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.about-description {
  font-size: 0.95rem;
  color: #2c3e50;
  line-height: 1.7;
  max-width: 500px;
}

// Right Image
.about-image {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.about-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Responsive
@media (max-width: 1023px) {
  .about-section {
    padding: 4rem 0;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .about-title {
    font-size: 1.5rem;
  }

  .about-description {
    max-width: 100%;
  }
}

@media (max-width: 599px) {
  .about-section {
    padding: 3rem 0;
  }

  .about-grid {
    gap: 2rem;
  }

  .about-title {
    font-size: 1.35rem;
  }

  .about-description {
    font-size: 0.875rem;
  }

  .about-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;

    .q-icon {
      font-size: 40px;
    }
  }
}
</style>
