<!--
  Auto-scrolling marquee of partner logos on the landing page.
  Used by: src/pages/IndexPage.vue.
-->
<template>
  <section class="partners-banner">
    <div class="marquee-track">
      <div class="marquee-content">
        <div v-for="partner in partners" :key="'a-' + partner.id" class="partner-chip">
          <q-icon :name="partner.icon" size="16px" />
          <span>{{ partner.name }}</span>
        </div>
        <div v-for="partner in partners" :key="'b-' + partner.id" class="partner-chip">
          <q-icon :name="partner.icon" size="16px" />
          <span>{{ partner.name }}</span>
        </div>
        <div v-for="partner in partners" :key="'c-' + partner.id" class="partner-chip">
          <q-icon :name="partner.icon" size="16px" />
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
$ink: #14241a;
$primary-green: #2e5d3e;
$muted: #5b6b5f;
$white: #ffffff;

.partners-banner {
  background: $white;
  padding: 18px 0;
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
  gap: 1.5rem;
  width: max-content;
  animation: scroll-marquee 24s linear infinite;
}

.partner-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba($ink, 0.1);
  color: $ink;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;

  .q-icon {
    color: $primary-green;
  }

  span {
    opacity: 0.85;
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
    padding: 14px 0;
  }

  .marquee-content {
    gap: 1rem;
    animation-duration: 18s;
  }

  .partner-chip {
    font-size: 0.72rem;
    padding: 6px 12px;
  }
}
</style>
