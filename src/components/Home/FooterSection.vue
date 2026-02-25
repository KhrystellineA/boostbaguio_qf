<template>
  <footer class="footer">
    <!-- Contact CTA Button -->
    <div class="contact-cta-bar">
      <div class="container-cta">
        <p class="cta-text">Have questions or feedback? We'd love to hear from you!</p>
        <q-btn
          label="Contact Us"
          unelevated
          rounded
          class="contact-cta-btn"
          @click="openContactDialog"
        />
      </div>
    </div>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="container-contact">
        <div class="contact-grid">
          <!-- Email -->
          <div class="contact-item">
            <div class="contact-icon">
              <q-icon name="email" size="48px" />
            </div>
            <h3 class="contact-title">EMAIL</h3>
            <p class="contact-description">
              We'd love to hear from you! Share your thoughts or questions.
            </p>
            <a href="mailto:contact@boostbaguio.com" class="contact-link">
              contact@boostbaguio.com
            </a>
          </div>

          <!-- Phone -->
          <div class="contact-item">
            <div class="contact-icon">
              <q-icon name="phone" size="48px" />
            </div>
            <h3 class="contact-title">PHONE</h3>
            <p class="contact-description">Reach us anytime for assistance or inquiries.</p>
            <a href="tel:+639266321140" class="contact-link"> +63 926 632 1140 </a>
          </div>

          <!-- Office -->
          <div class="contact-item">
            <div class="contact-icon">
              <q-icon name="location_on" size="48px" />
            </div>
            <h3 class="contact-title">OFFICE</h3>
            <p class="contact-description">Visit us for support or collaboration opportunities.</p>
            <a href="#" class="contact-link"> Baguio City, PH </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Footer Section -->
    <section class="main-footer">
      <div class="container-footer">
        <div class="footer-grid">
          <!-- Newsletter Section -->
          <div class="footer-newsletter">
            <div class="footer-logo">
              <img src="../../assets/logo.png" alt="Boost Baguio Logo" class="logo-img" />
            </div>
            <p class="newsletter-text">Join our newsletter for the latest updates and features.</p>
            <div class="newsletter-form">
              <q-input
                v-model="email"
                outlined
                dense
                placeholder="Enter your email"
                class="email-input"
                dark
                bg-color="transparent"
              />
              <q-btn label="Subscribe" unelevated class="subscribe-btn" @click="handleSubscribe" />
            </div>
            <p class="privacy-notice">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="copyright">© 2025 Boost Baguio. All rights reserved.</p>
            <div class="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookies Settings</a>
            </div>
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

    const handleSubscribe = () => {
      if (email.value) {
        console.log('Subscribing email:', email.value)
        // Add subscription logic here
        email.value = ''
      }
    }

    const openContactDialog = () => {
      if (window.openContactDialog) {
        window.openContactDialog()
      }
    }

    return {
      email,
      handleSubscribe,
      openContactDialog,
    }
  },
}
</script>

<style lang="scss" scoped>
// Color Palette Variables
$dark-green: #1B4332;
$primary-green: #2E5D3E;
$light-green: #9EC98F;
$brown: #6B5344;
$white: #FFFFFF;

// Contact CTA Bar
.contact-cta-bar {
  background: $primary-green;
  padding: 2.5rem 0;
  position: relative;
  overflow: hidden;
}

.container-cta {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.cta-text {
  color: rgba($white, 0.95);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.contact-cta-btn {
  background: $white !important;
  color: $primary-green !important;
  font-weight: 600;
  padding: 0.875rem 2.5rem;
  border-radius: 50px;
  text-transform: none;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

  &:hover {
    background: $white !important;
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
}

// Contact Section
.contact-section {
  background: #1A1A1A;
  padding: 5rem 0;
}

.container-contact {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.contact-item {
  text-align: center;
  color: $white;
  padding: 2rem;
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($white, 0.03);
    transform: translateY(-4px);
  }
}

.contact-icon {
  margin-bottom: 1.5rem;
  color: $white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba($primary-green, 0.2);
  transition: all 0.3s ease;

  .contact-item:hover & {
    background: rgba($primary-green, 0.3);
    transform: scale(1.1);
  }
}

.contact-title {
  font-size: 1rem;
  font-weight: 700;
  color: $white;
  margin-bottom: 1rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.contact-description {
  font-size: 0.9rem;
  color: rgba($white, 0.75);
  line-height: 1.7;
  margin-bottom: 1.25rem;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.contact-link {
  font-size: 0.95rem;
  color: $light-green;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    color: $white;
    text-decoration: underline;
  }
}

// Main Footer Section
.main-footer {
  background: $dark-green;
  padding: 4rem 0 2rem;
}

.container-footer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba($white, 0.15);
}

// Newsletter
.footer-newsletter {
  max-width: 450px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;

  .logo-img {
    height: 56px;
    width: auto;
    filter: brightness(0) invert(1);
  }
}

.newsletter-text {
  font-size: 1rem;
  color: rgba($white, 0.85);
  line-height: 1.7;
  margin-bottom: 1.5rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.newsletter-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.email-input {
  flex: 1;

  :deep(.q-field__control) {
    border-radius: 10px;
    border: 1px solid rgba($white, 0.25);
    color: $white;
    background: rgba($white, 0.05);

    &:before {
      border: none;
    }

    &:hover {
      background: rgba($white, 0.08);
      border-color: rgba($white, 0.4);
    }

    &.q-field--focused {
      background: rgba($white, 0.1);
      border-color: $light-green;
    }
  }

  :deep(input) {
    color: $white;

    &::placeholder {
      color: rgba($white, 0.4);
    }
  }
}

.subscribe-btn {
  background: $light-green !important;
  color: $dark-green !important;
  font-weight: 600;
  padding: 0 1.75rem;
  border-radius: 10px;
  text-transform: none;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  &:hover {
    background: $white !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
}

.privacy-notice {
  font-size: 0.8rem;
  color: rgba($white, 0.5);
  line-height: 1.6;
}

// Footer Bottom
.footer-bottom {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
}

.footer-bottom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.copyright {
  font-size: 0.9rem;
  color: rgba($white, 0.6);
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: 2rem;

  a {
    font-size: 0.9rem;
    color: rgba($white, 0.7);
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 1px;
      background: $light-green;
      transition: width 0.3s ease;
    }

    &:hover {
      color: $white;

      &::after {
        width: 100%;
      }
    }
  }
}

// Responsive
@media (max-width: 1023px) {
  .container-cta {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }

  .contact-cta-btn {
    width: 100%;
    max-width: 280px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .footer-newsletter {
    max-width: 100%;
  }

  .newsletter-form {
    max-width: 100%;
  }
}

@media (max-width: 599px) {
  .contact-cta-bar {
    padding: 2rem 0;
  }

  .container-cta {
    padding: 0 2rem;
  }

  .cta-text {
    font-size: 1rem;
  }

  .contact-section {
    padding: 4rem 0;
  }

  .container-contact {
    padding: 0 2rem;
  }

  .contact-grid {
    gap: 2rem;
  }

  .contact-icon {
    width: 64px;
    height: 64px;
  }

  .main-footer {
    padding: 3rem 0 1.5rem;
  }

  .container-footer {
    padding: 0 2rem;
  }

  .footer-grid {
    gap: 2.5rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2.5rem;
  }

  .footer-newsletter {
    max-width: 100%;
  }

  .newsletter-form {
    flex-direction: column;
    max-width: 100%;
  }

  .subscribe-btn {
    width: 100%;
  }

  .footer-bottom-content {
    gap: 1rem;
  }

  .footer-bottom-links {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
}
</style>
