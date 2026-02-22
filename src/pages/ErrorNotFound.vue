<template>
  <div class="error-page fullscreen flex flex-center">
    <div class="error-content text-center">
      <div class="error-illustration">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <circle cx="100" cy="100" r="80" fill="#2E5D3E" opacity="0.1" />
          <path d="M100 40 L120 70 L150 70 L130 90 L140 120 L100 100 L60 120 L70 90 L50 70 L80 70 Z" 
                fill="#2E5D3E" />
          <circle cx="80" cy="80" r="8" fill="#8D6E63" />
          <circle cx="120" cy="80" r="8" fill="#8D6E63" />
          <path d="M80 130 Q100 150 120 130" stroke="#8D6E63" stroke-width="4" fill="none" />
        </svg>
      </div>

      <div class="error-code text-primary text-h1 q-my-xl">404</div>

      <div class="text-h3 text-weight-bold text-primary q-mb-md">Page Not Found</div>
      <div class="text-subtitle1 text-grey-7 q-mb-xl">
        Oops! The page you're looking for doesn't exist or has been moved.
      </div>

      <div class="q-gutter-md">
        <q-btn
          color="primary"
          text-color="white"
          unelevated
          to="/"
          label="Go Home"
          icon="home"
          size="lg"
          padding="12px 24px"
          class="q-mr-md"
        />
        <q-btn
          color="secondary"
          text-color="white"
          unelevated
          @click="$router.go(-1)"
          label="Go Back"
          icon="arrow_back"
          size="lg"
          padding="12px 24px"
        />
      </div>

      <div class="q-mt-xl text-grey-6">
        <p>If you believe this is an error, please contact our support team.</p>
        <q-btn
          flat
          text-color="primary"
          label="Contact Support"
          @click="contactSupport"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';

const $q = useQuasar();

const contactSupport = () => {
  $q.dialog({
    title: 'Contact Support',
    message: 'Send us an email at support@boostbaguioph.com or call +63 912 345 6789',
    actions: [
      { label: 'Email', color: 'primary', handler: () => {
        window.location.href = 'mailto:support@boostbaguioph.com';
      }},
      { label: 'Call', color: 'primary', handler: () => {
        window.location.href = 'tel:+639123456789';
      }},
      { label: 'Cancel', color: 'grey' }
    ]
  });
};
</script>

<style scoped>
.error-page {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  color: #212121;
}

.error-content {
  max-width: 600px;
  padding: 2rem;
}

.error-code {
  font-size: 8rem;
  line-height: 1;
  text-shadow: 0 4px 20px rgba(46, 93, 62, 0.15);
  font-weight: 900;
  letter-spacing: -0.05em;
}

.error-illustration {
  margin: 0 auto 2rem;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.text-primary {
  color: #2E5D3E !important;
}

.text-secondary {
  color: #8D6E63 !important;
}

.bg-primary {
  background-color: #2E5D3E !important;
}

.bg-secondary {
  background-color: #8D6E63 !important;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 6rem;
  }
  
  .text-h3 {
    font-size: 1.5rem;
  }
  
  .q-gutter-md {
    display: flex;
    flex-direction: column;
  }
  
  .q-btn {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
  }
}
</style>