<template>
  <section class="faqs-section">
    <div class="container-faqs">
      <!-- Header -->
      <div class="faqs-header">
        <h2 class="faqs-title">FAQS</h2>
        <p class="faqs-description">
          Find answers to common questions about our app and its features.
        </p>
      </div>

      <!-- FAQs Grid -->
      <div class="faqs-grid">
        <!-- Left Column -->
        <div class="faqs-column">
          <q-expansion-item
            v-for="(faq, index) in leftFaqs"
            :key="index"
            :label="faq.question"
            class="faq-item"
            dark
            expand-icon="add"
            expanded-icon="close"
            header-class="faq-header"
          >
            <q-card dark class="faq-card">
              <q-card-section class="faq-answer">
                {{ faq.answer }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>

        <!-- Right Column -->
        <div class="faqs-column">
          <q-expansion-item
            v-for="(faq, index) in rightFaqs"
            :key="index"
            :label="faq.question"
            class="faq-item"
            dark
            expand-icon="add"
            expanded-icon="close"
            header-class="faq-header"
          >
            <q-card dark class="faq-card">
              <q-card-section class="faq-answer">
                {{ faq.answer }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="faqs-cta">
        <h3 class="cta-title">STILL HAVE QUESTIONS?</h3>
        <p class="cta-description">We're here to help you!</p>
        <q-btn label="Contact" unelevated rounded class="contact-btn" size="md" />
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'FaqsSection',
  setup() {
    const leftFaqs = ref([
      {
        question: 'What is Boost Baguio?',
        answer:
          'Boost Baguio is a web app designed to enhance your commuting experience in Baguio City. It provides real-time jeepney navigation, route information, and curated tourist spots. Our goal is to promote sustainable tourism while making travel easier for everyone.',
      },
      {
        question: 'How does navigation work?',
        answer:
          'Users can input their start and end points either manually or via GPS. The app then generates step-by-step directions for jeepney routes and terminal information. This feature ensures you never miss a ride!',
      },
      {
        question: 'Are routes updated regularly?',
        answer:
          'Yes, our routes are constantly updated based on user feedback and crowdsourced data. We also include "Last Verified" timestamps to ensure accuracy. You can report any inaccuracies directly through the app.',
      },
      {
        question: 'What are the fees?',
        answer:
          'Fares for jeepney rides vary depending on the route. The app provides fare information for each route to help you budget your travel. Keep an eye on updates for any changes in fares.',
      },
      {
        question: 'Can I find events?',
        answer:
          'Absolutely! Our Events section aggregates local festivals and concerts happening in Baguio. You’ll also find transportation tips for getting to and from these events. Stay connected with the vibrant culture of Baguio!',
      },
    ])

    const rightFaqs = ref([
      {
        question: 'How to use "Near Me"?',
        answer:
          '"Near Me" utilizes your geolocation to suggest nearby attractions and jeepney routes. You can read reviews from the "Sa Baguio" Facebook group for additional insights. It’s a great way to discover hidden gems!',
      },
      {
        question: 'Is the app free?',
        answer:
          'Yes, Boost Baguio is completely free to use. We aim to make commuting accessible to everyone in Baguio City. Enjoy all features without any hidden costs!',
      },
      {
        question: 'How can I contact support?',
        answer:
          'For support, you can reach out through the Contact section of the app. We’re here to assist you with any questions or concerns. Your feedback helps us improve our service!',
      },
      {
        question: 'What if I have suggestions?',
        answer:
          'We welcome your suggestions! You can submit them directly through the app or via our website. Your input is invaluable in helping us enhance the user experience.',
      },
      {
        question: 'Is the app safe?',
        answer:
          'Yes, we prioritize user safety and data privacy. The app is designed with secure protocols to protect your information. Travel with peace of mind while using Boost Baguio.',
      },
    ])

    return {
      leftFaqs,
      rightFaqs,
    }
  },
}
</script>

<style lang="scss" scoped>
.faqs-section {
  background: #6b5344;
  padding: 5rem 0;
  color: white;
}

.container-faqs {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

// Header
.faqs-header {
  text-align: center;
  margin-bottom: 3rem;
}

.faqs-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.faqs-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

// FAQs Grid
.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  :deep(.q-item) {
    padding: 1rem 1.25rem;
  }

  :deep(.q-item__label) {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  :deep(.q-icon) {
    color: white;
    font-size: 20px;
  }
}

.faq-card {
  background: transparent;
  box-shadow: none;
}

.faq-answer {
  padding: 0 1.25rem 1.25rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.6;
}

// Bottom CTA
.faqs-cta {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.cta-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
}

.contact-btn {
  background: white !important;
  color: #6b5344 !important;
  font-weight: 600;
  padding: 0.625rem 2.5rem;
  text-transform: none;

  &:hover {
    background: #f5f5f5 !important;
  }
}

// Responsive
@media (max-width: 1023px) {
  .faqs-section {
    padding: 4rem 0;
  }

  .faqs-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .faqs-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 599px) {
  .faqs-section {
    padding: 3rem 0;
  }

  .faqs-header {
    margin-bottom: 2rem;
  }

  .faqs-title {
    font-size: 1.5rem;
  }

  .faqs-grid {
    margin-bottom: 3rem;
  }

  .cta-title {
    font-size: 1.25rem;
  }

  .cta-description {
    font-size: 0.875rem;
  }

  .faq-item {
    :deep(.q-item__label) {
      font-size: 0.8rem;
    }
  }

  .faq-answer {
    font-size: 0.8rem;
  }
}
</style>
