<template>
  <section class="partners-banner">
    <div class="marquee-track">
      <div class="marquee-content">
        <div v-for="partner in partners" :key="'a-' + partner.id" class="partner-chip">
          <q-icon :name="partner.icon" size="18px" :color="partner.color" />
          <span>{{ partner.name }}</span>
        </div>
        <!-- Duplicates for seamless loop -->
        <div v-for="partner in partners" :key="'b-' + partner.id" class="partner-chip">
          <q-icon :name="partner.icon" size="18px" :color="partner.color" />
          <span>{{ partner.name }}</span>
        </div>
        <div v-for="partner in partners" :key="'c-' + partner.id" class="partner-chip">
          <q-icon :name="partner.icon" size="18px" :color="partner.color" />
          <span>{{ partner.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PartnersSection',

  props: {
    partners: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style lang="scss" scoped>
$brown: #3e2723;

.partners-banner {
  background: $brown;
  padding: 14px 0;
  overflow: hidden;
  position: relative;
}

.marquee-track {
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );
}

.marquee-content {
  display: flex;
  gap: 2rem;
  width: max-content;
  animation: scroll-marquee 20s linear infinite;
}

.partner-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.03em;

  span {
    opacity: 0.9;
  }
}

@keyframes scroll-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.333%);
  }
}

@media (max-width: 599px) {
  .partners-banner {
    padding: 10px 0;
  }

  .marquee-content {
    gap: 1.5rem;
    animation-duration: 15s;
  }

  .partner-chip {
    font-size: 0.75rem;
  }
}
</style>
