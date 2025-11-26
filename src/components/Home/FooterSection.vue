<template>
  <footer class="footer">
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

          <!-- Column One -->
          <div class="footer-column">
            <h4 class="column-title">Column One</h4>
            <ul class="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Use</a></li>
              <li><a href="#faqs">FAQs</a></li>
            </ul>
          </div>

          <!-- Column Two -->
          <div class="footer-column">
            <h4 class="column-title">Column Two</h4>
            <ul class="footer-links">
              <li><a href="#blog">Blog</a></li>
              <li><a href="#support">Support Team</a></li>
              <li><a href="#join">Join Us</a></li>
              <li><a href="#follow">Follow Us</a></li>
              <li><a href="#feedback">Feedback</a></li>
            </ul>
          </div>

          <!-- Social Media -->
          <div class="footer-social">
            <h4 class="column-title">Follow us</h4>
            <ul class="social-links">
              <li>
                <a href="#" class="social-link">
                  <q-icon name="fab fa-facebook" size="20px" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a href="#" class="social-link">
                  <q-icon name="fab fa-instagram" size="20px" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a href="#" class="social-link">
                  <q-icon name="fab fa-x-twitter" size="20px" />
                  <span>X</span>
                </a>
              </li>
              <li>
                <a href="#" class="social-link">
                  <q-icon name="fab fa-linkedin" size="20px" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="#" class="social-link">
                  <q-icon name="fab fa-youtube" size="20px" />
                  <span>YouTube</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <p class="copyright">© 2025 Relume. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookies Settings</a>
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
  setup() {
    const email = ref('')

    const handleSubscribe = () => {
      if (email.value) {
        console.log('Subscribing email:', email.value)
        // Add subscription logic here
        email.value = ''
      }
    }

    return {
      email,
      handleSubscribe,
    }
  },
}
</script>

<style lang="scss" scoped>
// Contact Section
.contact-section {
  background: #2a2a2a;
  padding: 4rem 0;
}

.container-contact {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
}

.contact-item {
  text-align: center;
  color: white;
}

.contact-icon {
  margin-bottom: 1.5rem;
  color: white;
}

.contact-title {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.contact-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.contact-link {
  font-size: 0.875rem;
  color: white;
  text-decoration: underline;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.7;
  }
}

// Main Footer Section
.main-footer {
  background: #4a5f4a;
  padding: 3rem 0 1.5rem;
}

.container-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

// Newsletter
.footer-newsletter {
  max-width: 350px;
}

.footer-logo {
  margin-bottom: 1.5rem;

  .logo-img {
    height: 48px;
    width: auto;
  }
}

.newsletter-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.email-input {
  flex: 1;

  :deep(.q-field__control) {
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;

    &:before {
      border: none;
    }
  }

  :deep(input) {
    color: white;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
}

.subscribe-btn {
  background: white !important;
  color: #4a5f4a !important;
  font-weight: 600;
  padding: 0 1.5rem;
  border-radius: 6px;
  text-transform: none;

  &:hover {
    background: #f5f5f5 !important;
  }
}

.privacy-notice {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

// Footer Columns
.footer-column,
.footer-social {
  color: white;
}

.column-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links,
.social-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    a {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.85);
      text-decoration: none;
      transition: color 0.3s ease;

      &:hover {
        color: white;
      }
    }
  }
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

// Footer Bottom
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
}

.copyright {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  gap: 1.5rem;

  a {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.85);
    text-decoration: underline;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }
}

// Responsive
@media (max-width: 1023px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .footer-newsletter {
    grid-column: 1 / -1;
    max-width: 100%;
  }
}

@media (max-width: 599px) {
  .contact-section {
    padding: 3rem 0;
  }

  .contact-grid {
    gap: 2rem;
  }

  .main-footer {
    padding: 2rem 0 1rem;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
  }

  .footer-newsletter {
    max-width: 100%;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .footer-bottom-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
