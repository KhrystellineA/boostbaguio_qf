<template>
  <section class="faqs-section" aria-label="Frequently Asked Questions about Boost Baguio">
    <div class="container-faqs">
      <!-- Header -->
      <div class="faqs-header">
        <p class="faqs-tag">QUESTIONS &amp; ANSWERS</p>
        <h2 class="faqs-title">
          <em>Frequently</em> asked
          <br class="hide-mobile" />
          questions
        </h2>
        <p class="faqs-description">
          Find answers to common questions about our app and its features.
        </p>
      </div>

      <!-- FAQs Grid -->
      <div class="faqs-grid" role="list">
        <div class="faqs-column" role="listitem">
          <q-expansion-item
            v-for="(faq, index) in leftFaqs"
            :key="index"
            :label="faq.question"
            class="faq-item"
            expand-icon="add"
            expanded-icon="remove"
            header-class="faq-header"
            :aria-label="`Question: ${faq.question}`"
          >
            <q-card class="faq-card">
              <q-card-section class="faq-answer">
                {{ faq.answer }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>

        <div class="faqs-column" role="listitem">
          <q-expansion-item
            v-for="(faq, index) in rightFaqs"
            :key="index"
            :label="faq.question"
            class="faq-item"
            expand-icon="add"
            expanded-icon="remove"
            header-class="faq-header"
            :aria-label="`Question: ${faq.question}`"
          >
            <q-card class="faq-card">
              <q-card-section class="faq-answer">
                {{ faq.answer }}
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
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
$primary-green: #2e5d3e;
$mint-bg: #e8f0e0;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;

.faqs-section {
  background: $white;
  padding: 5rem 0;
  color: $ink;
}

.container-faqs {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

.faqs-header {
  text-align: center;
  margin-bottom: 3rem;
}

.faqs-tag {
  font-size: 0.74rem;
  font-weight: 600;
  color: $primary-green;
  margin-bottom: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.faqs-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.7rem, 3.2vw, 2.3rem);
  font-weight: 600;
  color: $ink;
  margin: 0 0 0.85rem;
  line-height: 1.18;
  letter-spacing: -0.01em;

  em {
    font-style: italic;
    font-weight: 600;
    color: $primary-green;
  }
}

.faqs-description {
  font-size: 0.95rem;
  color: $muted;
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto;
}

.faqs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.faqs-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  background: $white;
  border: 1px solid $border;
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba($primary-green, 0.35);
    box-shadow: 0 6px 18px rgba(20, 36, 26, 0.06);
  }

  :deep(.q-item) {
    padding: 0.95rem 1.25rem;
    border-radius: 14px;
  }

  :deep(.q-item__label) {
    font-size: 0.92rem;
    font-weight: 600;
    color: $ink;
    letter-spacing: -0.005em;
  }

  :deep(.q-icon) {
    color: $primary-green;
    font-size: 18px;
  }
}

.faq-card {
  background: transparent;
  box-shadow: none;
}

.faq-answer {
  padding: 0 1.25rem 1.1rem;
  font-size: 0.88rem;
  color: $muted;
  line-height: 1.65;
}

@media (max-width: 1023px) {
  .faqs-section {
    padding: 4rem 0;
  }

  .faqs-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .faqs-section {
    padding: 3rem 0;
  }

  .container-faqs {
    padding: 0 1.25rem;
  }

  .hide-mobile {
    display: none;
  }

  .faqs-header {
    margin-bottom: 2rem;
  }

  .faq-item {
    :deep(.q-item__label) {
      font-size: 0.85rem;
    }
  }

  .faq-answer {
    font-size: 0.82rem;
  }
}
</style>
