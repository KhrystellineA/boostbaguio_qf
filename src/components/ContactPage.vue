<template>
  <div class="contact-overlay" @click.self="closeModal">
    <div class="contact-container">
      <button class="close-btn" @click="closeModal">×</button>

      <div class="contact-header">
        <h1>CONTACT US</h1>
        <p>We're here to help with your travel inquiries!</p>
      </div>

      <div class="contact-content">
        <div class="contact-info">
          <div class="info-section">
            <div class="info-icon">
              <i class="icon-email">✉</i>
            </div>
            <div class="info-details">
              <h3>EMAIL</h3>
              <a href="mailto:info@baguioboostph.com">info@baguioboostph.com</a>
              <a href="mailto:support@baguioboostph.com">support@baguioboostph.com</a>
            </div>
          </div>

          <div class="info-section">
            <div class="info-icon">
              <i class="icon-phone">📞</i>
            </div>
            <div class="info-details">
              <h3>PHONE</h3>
              <p>Call us anytime!</p>
              <a href="tel:+639123456789">+63 912 345 6789</a>
            </div>
          </div>

          <div class="info-section">
            <div class="info-icon">
              <i class="icon-location">📍</i>
            </div>
            <div class="info-details">
              <h3>OFFICE</h3>
              <p>Session Road, Baguio City, PH</p>
              <a href="#" class="directions-link" @click.prevent="getDirections">
                Get Directions →
              </a>
            </div>
          </div>
        </div>

        <div class="contact-form">
          <form @submit.prevent="handleSubmit" ref="contactForm">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                type="text"
                id="name"
                name="from_name"
                v-model="formData.name"
                placeholder=""
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="reply_to"
                v-model="formData.email"
                placeholder=""
                required
              />
            </div>

            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                name="message"
                v-model="formData.message"
                placeholder="Type your message..."
                rows="5"
                required
              ></textarea>
            </div>

            <div class="form-group checkbox-group">
              <input type="checkbox" id="terms" v-model="formData.acceptTerms" required />
              <label for="terms">
                I accept the <a href="#" @click.prevent="showTerms">Terms</a>
              </label>
            </div>

            <button
              type="submit"
              class="submit-btn"
              :disabled="!formData.acceptTerms || isSubmitting"
            >
              {{ isSubmitting ? 'Sending...' : 'Submit' }}
            </button>
          </form>

          <div v-if="showSuccess" class="success-message">
            Thank you! Your message has been sent successfully.
          </div>

          <div v-if="showError" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import emailjs from '@emailjs/browser'

export default {
  name: 'ContactPage',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        message: '',
        acceptTerms: false,
      },
      showSuccess: false,
      showError: false,
      errorMessage: '',
      isSubmitting: false,
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    async handleSubmit() {
      this.isSubmitting = true
      this.showError = false

      try {
        await emailjs.sendForm(
          'service_8ynb7sl',
          'template_ulpsosa',
          this.$refs.contactForm,
          'zqjrv9JYsfZvzDG8t'
        )

        this.showSuccess = true

        setTimeout(() => {
          this.resetForm()
          this.showSuccess = false
          this.$emit('close')
        }, 3000)

        this.$emit('submit', this.formData)
      } catch (error) {
        console.error('EmailJS Error:', error)
        this.showError = true
        this.errorMessage = 'Failed to send message. Please try again or email us directly.'

        setTimeout(() => {
          this.showError = false
        }, 5000)
      } finally {
        this.isSubmitting = false
      }
    },
    resetForm() {
      this.formData = {
        name: '',
        email: '',
        message: '',
        acceptTerms: false,
      }
    },
    getDirections() {
      const address = 'Session Road, Baguio City, Philippines'
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      window.open(mapsUrl, '_blank')
    },
    showTerms() {
      this.$router.push('/terms')
    },
  },
}
</script>

<style scoped>
.contact-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.contact-container {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #000;
}

.contact-header {
  text-align: center;
  margin-bottom: 40px;
}

.contact-header h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  color: #1a1a1a;
}

.contact-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 50px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section {
  display: flex;
  gap: 15px;
}

.info-icon {
  font-size: 24px;
  color: #333;
  width: 40px;
  flex-shrink: 0;
}

.info-details h3 {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.info-details p {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px 0;
}

.info-details a {
  display: block;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  margin: 3px 0;
  transition: color 0.3s;
}

.info-details a:hover {
  color: #007bff;
}

.directions-link {
  font-weight: 500;
  margin-top: 8px !important;
}

.contact-form {
  position: relative;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group label {
  margin: 0;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.checkbox-group a {
  color: #007bff;
  text-decoration: none;
}

.checkbox-group a:hover {
  text-decoration: underline;
}

.submit-btn {
  background-color: #fff;
  color: #333;
  border: 2px solid #333;
  padding: 12px 40px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333;
  color: white;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #4caf50;
  color: white;
  padding: 20px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s;
  z-index: 10;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #f44336;
  color: white;
  padding: 20px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s;
  z-index: 10;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 768px) {
  .contact-container {
    padding: 30px 20px;
  }

  .contact-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .contact-header h1 {
    font-size: 24px;
  }

  .contact-header p {
    font-size: 14px;
  }
}
</style>

<style scoped>
.contact-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.contact-container {
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #666;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #000;
}

.contact-header {
  text-align: center;
  margin-bottom: 40px;
}

.contact-header h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0 0 10px 0;
  color: #1a1a1a;
}

.contact-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 50px;
}

/* Left Side - Contact Info */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section {
  display: flex;
  gap: 15px;
}

.info-icon {
  font-size: 24px;
  color: #333;
  width: 40px;
  flex-shrink: 0;
}

.info-details h3 {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.info-details p {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px 0;
}

.info-details a {
  display: block;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  margin: 3px 0;
  transition: color 0.3s;
}

.info-details a:hover {
  color: #007bff;
}

.directions-link {
  font-weight: 500;
  margin-top: 8px !important;
}

/* Right Side - Contact Form */
.contact-form {
  position: relative;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group label {
  margin: 0;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.checkbox-group a {
  color: #007bff;
  text-decoration: none;
}

.checkbox-group a:hover {
  text-decoration: underline;
}

.submit-btn {
  background-color: #fff;
  color: #333;
  border: 2px solid #333;
  padding: 12px 40px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background-color: #333;
  color: white;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #4caf50;
  color: white;
  padding: 20px 30px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-container {
    padding: 30px 20px;
  }

  .contact-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .contact-header h1 {
    font-size: 24px;
  }

  .contact-header p {
    font-size: 14px;
  }
}
</style>
