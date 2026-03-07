<template>
  <section class="partners-section">
    <div class="container-custom">
      <h3 class="partners-title scroll-animate">
        Our Partners & Supporters
      </h3>

      <div class="partners-row">
        <div
          v-for="(partner, index) in partners"
          :key="partner.id"
          class="bento-item partner-card"
          :class="{ 'animate-in': true }"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <q-icon :name="partner.icon" :size="partner.size || 'md'" :color="partner.color" />
          <div class="partner-name">{{ partner.name }}</div>
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
      default: () => []
    }
  }
}
</script>

<style lang="scss" scoped>
.partners-section {
  padding: 2.5rem 0;
  background: linear-gradient(180deg, #FFFFFF 0%, #F1F8F4 100%);
}

.partners-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1B4332;
  text-align: center;
  margin-bottom: 2rem;
}

.partners-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  padding: 0 1rem;

  .partner-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    min-width: 130px;
    padding: 1.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .partner-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: #2E5D3E;
      text-align: center;
    }
  }
}

@media (max-width: 599px) {
  .partners-section {
    padding: 2rem 0;
  }

  .partners-title {
    font-size: 1.15rem;
  }

  .partners-row {
    gap: 1rem;

    .partner-card {
      min-width: 100px;
      padding: 1rem 0.5rem;

      .partner-name {
        font-size: 0.7rem;
      }
    }
  }
}
</style>
