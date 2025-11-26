<template>
  <q-page class="page-wrapper">
    <section class="hero-section">
      <div class="container-custom">
        <div class="hero-box">
          <div class="hero-bg-wrapper">
            <q-img
              src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=900&fit=crop"
              class="hero-bg"
            />
            <div class="hero-overlay"></div>
          </div>

          <div class="hero-content">
            <div class="content-grid">
              <div class="left-content">
                <h1 class="hero-title scroll-animate">NAVIGATE BAGUIO'S<br />JEEPNEYS WITH EASE</h1>
                <p class="hero-description scroll-animate">
                  Boost Baguio is your go-to app for seamless jeepney navigation in Baguio City.
                  Discover curated tourist spots, real-time updates, and eco-friendly routes — all
                  at your fingertips!
                </p>
                <q-btn
                  label="Learn More"
                  unelevated
                  rounded
                  class="learn-more-btn scroll-animate"
                  size="md"
                />
              </div>

              <div class="right-content">
                <div class="route-card scroll-animate">
                  <div class="input-group">
                    <div class="input-label">FROM:</div>
                    <q-input
                      v-model="fromLocation"
                      outlined
                      dense
                      class="custom-input"
                      bg-color="white"
                    />
                  </div>

                  <div class="input-group">
                    <div class="input-label">TO:</div>
                    <q-input
                      v-model="toLocation"
                      outlined
                      dense
                      class="custom-input"
                      bg-color="white"
                    />
                  </div>

                  <q-btn label="Start Navigation" unelevated class="start-nav-btn" size="md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="brands-section">
      <div class="container-custom">
        <p class="brands-title scroll-animate">Trusted by top brands for sustainability efforts</p>
        <div class="brands-row">
          <div class="brand-item scroll-animate">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5 9.5c-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z"
              />
            </svg>
            <span class="brand-name">Webflow</span>
          </div>

          <div class="brand-item scroll-animate">
            <div class="brand-circle"></div>
            <span class="brand-name">Relume</span>
          </div>

          <div class="brand-item scroll-animate">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5 9.5c-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z"
              />
            </svg>
            <span class="brand-name">Webflow</span>
          </div>

          <div class="brand-item scroll-animate">
            <div class="brand-circle"></div>
            <span class="brand-name">Relume</span>
          </div>

          <div class="brand-item scroll-animate">
            <svg class="brand-icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5 9.5c-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.2 0-2.1.9-2.4 2.1-.5-1.2-1.4-2.1-2.6-2.1-1.7 0-3 1.3-3 3v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-.6.4-1 1-1s1 .4 1 1v6h2v-6c0-1.7-1.3-3-3-3z"
              />
            </svg>
            <span class="brand-name">Webflow</span>
          </div>
        </div>
      </div>
    </section>

    <FeaturesSection />

    <GuideSection />

    <AboutSection />

    <GallerySection />

    <FAQSection />

    <FooterSection />
  </q-page>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import FeaturesSection from '../components/Home/FeaturesSection.vue'
import GuideSection from '../components/Home/GuideSection.vue'
import AboutSection from '../components/Home/AboutSection.vue'
import GallerySection from '../components/Home/GallerySection.vue'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default {
  name: 'BaguioHero',
  components: {
    FeaturesSection,
    GuideSection,
    AboutSection,
    GallerySection,
    FAQSection,
    FooterSection,
  },
  setup() {
    const fromLocation = ref('')
    const toLocation = ref('')

    const observeElements = () => {
      const options = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, options)

      const elements = document.querySelectorAll('.scroll-animate')
      elements.forEach((el) => observer.observe(el))

      return observer
    }

    let observer

    onMounted(() => {
      setTimeout(() => {
        observer = observeElements()
      }, 100)
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      fromLocation,
      toLocation,
    }
  },
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  background: #99928b;
  min-height: 100vh;
  padding: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.scroll-animate {
  opacity: 0;
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;

  &.animate-in {
    opacity: 1;
    animation-duration: 0.8s;
    animation-fill-mode: both;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:nth-child(1) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.1s;
    }
  }

  &:nth-child(2) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.2s;
    }
  }

  &:nth-child(3) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.3s;
    }
  }

  &:nth-child(4) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.4s;
    }
  }

  &:nth-child(5) {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.5s;
    }
  }
}

.route-card.scroll-animate {
  &.animate-in {
    animation-name: fadeInRight;
    animation-delay: 0.3s;
  }
}

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.container-custom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 100%;
}

.hero-box {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.hero-bg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 3rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  width: 100%;
  align-items: center;
}

.left-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1.2;
  margin-bottom: 1.25rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.hero-description {
  font-size: 0.95rem;
  color: white;
  line-height: 1.6;
  margin-bottom: 1.75rem;
  opacity: 0.95;
}

.learn-more-btn {
  background: white !important;
  color: #1a1a1a !important;
  font-weight: 600;
  padding: 0.625rem 1.75rem;
  border-radius: 50px;
  text-transform: none;
  font-size: 0.9rem;
  align-self: flex-start;
  transition: all 0.3s ease;

  &:hover {
    background: #f0f0f0 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.right-content {
  display: flex;
  justify-content: flex-end;
}

.route-card {
  background: rgba(211, 211, 211, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.input-group {
  margin-bottom: 1.25rem;

  &:last-of-type {
    margin-bottom: 1.75rem;
  }
}

.input-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #4a4a4a;
  margin-bottom: 0.5rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.custom-input {
  :deep(.q-field__control) {
    border-radius: 10px;
    height: 48px;
    background: white;
    transition: all 0.3s ease;

    &:before {
      border-color: rgba(0, 0, 0, 0.12);
    }

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.start-nav-btn {
  background: white !important;
  color: #1a1a1a !important;
  font-weight: 600;
  border-radius: 10px;
  text-transform: none;
  font-size: 0.9rem;
  width: 100%;
  height: 48px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.brands-section {
  background: #4a5f4a;
  padding: 3rem 0;
}

.brands-title {
  text-align: center;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
}

.brands-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.brand-icon {
  width: 24px;
  height: 24px;
}

.brand-circle {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
}

.brand-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
}

@media (max-width: 1023px) {
  .hero-section {
    padding: 1rem 0;
  }

  .hero-box {
    height: auto;
    min-height: calc(100vh - 2rem);
  }

  .hero-content {
    padding: 2rem;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .right-content {
    justify-content: center;
  }

  .route-card {
    max-width: 100%;
  }

  .route-card.scroll-animate {
    &.animate-in {
      animation-name: fadeInUp;
      animation-delay: 0.4s;
    }
  }
}

@media (max-width: 599px) {
  .hero-section {
    padding: 0.5rem;
  }

  .container-custom {
    padding: 0 0.5rem;
  }

  .hero-box {
    border-radius: 16px;
    min-height: calc(100vh - 1rem);
  }

  .hero-content {
    padding: 1.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-description {
    font-size: 0.875rem;
  }

  .route-card {
    padding: 1.5rem;
  }

  .brands-row {
    gap: 2rem;
  }
}
</style>