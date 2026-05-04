<template>
  <footer class="footer">
    <!-- Dark CTA card -->
    <section class="contact-cta-card-section">
      <div class="contact-cta-card">
        <div class="cta-bg" aria-hidden="true" />
        <div class="cta-overlay" aria-hidden="true" />
        <div class="cta-inner">
          <p class="cta-eyebrow">DO YOU NEED OUR HELP?</p>
          <h2 class="cta-title">
            Contact us for help
            <br class="hide-mobile" />
            or <em>information</em>
          </h2>
          <p class="cta-text">We can reach you through the button below.</p>

          <div class="cta-form">
            <q-input
              v-model="email"
              outlined
              dense
              placeholder="Enter your email"
              class="cta-input"
              bg-color="transparent"
            />
            <q-btn label="Submit" unelevated class="cta-submit" @click="openContactDialog" />
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="container-contact">
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon"><q-icon name="email" size="18px" /></div>
            <div>
              <h3 class="contact-title">Email</h3>
              <a href="mailto:contact@boostbaguio.com" class="contact-link">
                contact@boostbaguio.com
              </a>
              <p class="contact-description">
                We'd love to hear from you! Share your thoughts or questions.
              </p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon"><q-icon name="phone" size="18px" /></div>
            <div>
              <h3 class="contact-title">Phone</h3>
              <a href="tel:+639266321140" class="contact-link">+63 926 632 1140</a>
              <p class="contact-description">Reach us anytime for assistance or inquiries.</p>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon"><q-icon name="location_on" size="18px" /></div>
            <div>
              <h3 class="contact-title">Office</h3>
              <a href="#" class="contact-link">Baguio City, PH</a>
              <p class="contact-description">
                Visit us for support or collaboration opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Footer -->
    <section class="main-footer">
      <div class="container-footer">
        <div class="footer-grid">
          <!-- Brand + Newsletter -->
          <div class="footer-brand-block">
            <div class="footer-logo">
              <img src="../../assets/logo.png" alt="Boost Baguio Logo" class="logo-img" />
              <span class="brand-name">Boost Baguio</span>
            </div>
            <p class="newsletter-text">Join our newsletter for the latest updates and features.</p>
            <div class="newsletter-form">
              <q-input
                v-model="newsletterEmail"
                outlined
                dense
                placeholder="Your email"
                class="email-input"
                bg-color="transparent"
              />
              <q-btn label="Subscribe" unelevated class="subscribe-btn" @click="handleSubscribe" />
            </div>
            <p class="privacy-notice">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <p class="copyright">© 2025 Boost Baguio. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies Settings</a>
          </div>
          <div class="footer-social">
            <a href="#" aria-label="Facebook" class="social-icon"
              ><q-icon name="facebook" size="18px"
            /></a>
            <a href="#" aria-label="Twitter" class="social-icon"
              ><q-icon name="public" size="18px"
            /></a>
            <a href="#" aria-label="Instagram" class="social-icon"
              ><q-icon name="photo_camera" size="18px"
            /></a>
          </div>
        </div>
      </div>
    </section>
  </footer>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'FooterSection',
  emits: ['open-contact'],
  setup() {
    const email = ref('')
    const newsletterEmail = ref('')

    const handleSubscribe = () => {
      if (newsletterEmail.value) {
        console.log('Subscribing email:', newsletterEmail.value)
        newsletterEmail.value = ''
      }
    }

    const openContactDialog = () => {
      if (window.openContactDialog) {
        window.openContactDialog()
      }
    }

    return {
      email,
      newsletterEmail,
      handleSubscribe,
      openContactDialog,
    }
  },
}
</script>

<style lang="scss" scoped>
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$sage: #b8cfa3;
$mint-bg: #e8f0e0;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;

// Dark CTA card
.contact-cta-card-section {
  background: $white;
  padding: 4rem 1.25rem 2.5rem;
}

.contact-cta-card {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
  padding: 4.5rem 2rem;
  text-align: center;
  color: $white;
  box-shadow: 0 18px 40px rgba(20, 36, 26, 0.18);
}

.cta-bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920');
  background-size: cover;
  background-position: center;
}

.cta-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, rgba(20, 36, 26, 0.7) 0%, rgba(27, 67, 50, 0.78) 100%);
}

.cta-inner {
  max-width: 600px;
  margin: 0 auto;
}

.cta-eyebrow {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: rgba($white, 0.85);
  margin: 0 0 1rem;
}

.cta-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.7rem, 4vw, 2.6rem);
  font-weight: 600;
  margin: 0 0 1rem;
  line-height: 1.18;
  letter-spacing: -0.01em;
  color: $white;

  em {
    font-style: italic;
    color: $sage;
    font-weight: 600;
  }
}

.cta-text {
  font-size: 0.95rem;
  color: rgba($white, 0.85);
  margin: 0 0 1.75rem;
  line-height: 1.65;
}

.cta-form {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  padding: 6px;
  gap: 4px;
  backdrop-filter: blur(12px);
  max-width: 480px;
  width: 100%;
}

.cta-input {
  flex: 1;

  :deep(.q-field__control) {
    background: transparent;
    border-radius: 999px;
    padding: 0 1rem;
    color: $white;

    &:before,
    &:after {
      border: none !important;
    }
  }

  :deep(input) {
    color: $white;
    font-size: 0.9rem;

    &::placeholder {
      color: rgba($white, 0.6);
    }
  }
}

.cta-submit {
  background: $sage !important;
  color: $ink !important;
  font-weight: 700;
  border-radius: 999px;
  padding: 0 1.5rem;
  text-transform: none;
  white-space: nowrap;
  transition: all 0.3s ease;

  &:hover {
    background: $white !important;
    transform: translateY(-1px);
  }
}

// Contact strip
.contact-section {
  background: $white;
  padding: 1rem 0 2rem;
}

.container-contact {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border: 1px solid $border;
  border-radius: 14px;
  background: $white;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba($primary-green, 0.35);
    box-shadow: 0 6px 16px rgba(20, 36, 26, 0.06);
  }
}

.contact-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $mint-bg;
  color: $primary-green;
}

.contact-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: $primary-green;
  margin: 0 0 0.2rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.contact-link {
  font-size: 0.92rem;
  color: $ink;
  text-decoration: none;
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;

  &:hover {
    color: $primary-green;
    text-decoration: underline;
  }
}

.contact-description {
  font-size: 0.8rem;
  color: $muted;
  line-height: 1.55;
  margin: 0;
}

// Main Footer
.main-footer {
  background: $white;
  padding: 3rem 0 2rem;
  border-top: 1px solid $border;
}

.container-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-brand-block {
  max-width: 460px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1rem;

  .logo-img {
    height: 32px;
    width: auto;
  }

  .brand-name {
    font-family: 'Georgia', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: $ink;
    letter-spacing: -0.01em;
  }
}

.newsletter-text {
  font-size: 0.88rem;
  color: $muted;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.newsletter-form {
  display: flex;
  align-items: center;
  background: $white;
  border: 1px solid $border;
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
  margin: 0 auto 0.75rem;
  max-width: 380px;
}

.email-input {
  flex: 1;

  :deep(.q-field__control) {
    background: transparent;
    border-radius: 999px;
    padding: 0 0.85rem;

    &:before,
    &:after {
      border: none !important;
    }
  }

  :deep(input) {
    color: $ink;
    font-size: 0.85rem;

    &::placeholder {
      color: rgba($ink, 0.45);
    }
  }
}

.subscribe-btn {
  background: $primary-green !important;
  color: $white !important;
  font-weight: 600;
  border-radius: 999px;
  padding: 0 1.1rem;
  text-transform: none;
  white-space: nowrap;
  font-size: 0.82rem;

  &:hover {
    background: $dark-green !important;
  }
}

.privacy-notice {
  font-size: 0.74rem;
  color: $muted;
  line-height: 1.55;
  margin: 0;
}

// Footer Bottom
.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid $border;
}

.copyright {
  font-size: 0.78rem;
  color: $muted;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: 1.25rem;

  a {
    font-size: 0.78rem;
    color: $muted;
    text-decoration: none;

    &:hover {
      color: $primary-green;
    }
  }
}

.footer-social {
  display: flex;
  gap: 0.5rem;
}

.social-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $mint-bg;
  color: $primary-green;
  text-decoration: none;
  transition: all 0.25s ease;

  &:hover {
    background: $primary-green;
    color: $white;
    transform: translateY(-2px);
  }
}

// Responsive
@media (max-width: 1023px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-brand-block {
    max-width: 100%;
  }
}

@media (max-width: 599px) {
  .contact-cta-card-section {
    padding: 2.5rem 1rem 1.5rem;
  }

  .contact-cta-card {
    padding: 3rem 1.25rem;
    border-radius: 18px;
  }

  .cta-form {
    flex-direction: column;
    border-radius: 18px;
    padding: 8px;
    gap: 8px;
  }

  .cta-input {
    width: 100%;
  }

  .cta-submit {
    width: 100%;
    padding: 0.6rem 1rem;
  }

  .container-contact {
    padding: 0 1.25rem;
  }

  .container-footer {
    padding: 0 1.25rem;
  }

  .hide-mobile {
    display: none;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
