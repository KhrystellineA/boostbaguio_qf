<template>
  <q-page class="page-wrapper">
    <!-- Hero Section with Navigation -->
    <HeroSection
      :hero-image="heroImage"
      :from-location-text="fromLocationText"
      :from-location="fromLocation"
      :to-location="toLocation"
      :from-location-options="fromLocationOptions"
      :to-location-options="toLocationOptions"
      :from-auto-detect="fromAutoDetect"
      @update:from-location-text="fromLocationText = $event"
      @update:from-location="fromLocation = $event"
      @update:to-location="toLocation = $event"
      @search="searchFromLocation"
      @detect="detectCurrentLocation"
      @disable-auto="disableFromAutoDetect"
      @start="startNavigation"
    />

    <!-- Features Section -->
    <FeaturesSection />

    <!-- About Section -->
    <AboutSection />

    <!-- Gallery Section -->
    <GallerySection />

    <!-- Partners Section -->
    <PartnersSection :partners="partners" />

    <!-- FAQ Section -->
    <FAQSection />

    <!-- Footer Section -->
    <FooterSection />

    <!-- Back to Top Button -->
    <BackToTopBtn />
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useIndexPage } from 'src/composables/useIndexPage'

// Import sections
import HeroSection from 'src/components/Home/HeroSection.vue'
import FeaturesSection from 'src/components/Home/FeaturesSection.vue'
import AboutSection from 'src/components/Home/AboutSection.vue'
import GallerySection from 'src/components/Home/GallerySection.vue'
import PartnersSection from 'src/components/Home/PartnersSection.vue'
import FAQSection from 'src/components/Home/FAQSection.vue'
import FooterSection from 'src/components/Home/FooterSection.vue'
import BackToTopBtn from 'src/components/BackToTopBtn.vue'

export default defineComponent({
  name: 'IndexPage',

  components: {
    HeroSection,
    FeaturesSection,
    AboutSection,
    GallerySection,
    PartnersSection,
    FAQSection,
    FooterSection,
    BackToTopBtn,
  },

  setup() {
    // Use the composable for logic
    const {
      fromLocationText,
      fromLocation,
      toLocation,
      fromLocationOptions,
      toLocationOptions,
      fromAutoDetect,
      heroImage,
      searchFromLocation,
      detectCurrentLocation,
      disableFromAutoDetect,
      startNavigation,
    } = useIndexPage()

    // Partners data
    const partners = ref([
      { id: 1, name: 'Baguio City Tourism', icon: 'business', color: 'primary' },
      { id: 2, name: 'LTFRB Cordillera', icon: 'directions_bus', color: 'secondary' },
      { id: 3, name: 'DOT Philippines', icon: 'travel_explore', color: 'accent' },
      { id: 4, name: 'Baguio Local Gov', icon: 'account_balance', color: 'positive' },
    ])

    // Scroll to features
    const scrollToFeatures = () => {
      const featuresSection = document.querySelector('#features-section')
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      // State
      fromLocationText,
      fromLocation,
      toLocation,
      fromLocationOptions,
      toLocationOptions,
      fromAutoDetect,
      heroImage,
      partners,

      // Methods
      searchFromLocation,
      detectCurrentLocation,
      disableFromAutoDetect,
      startNavigation,
      scrollToFeatures,
    }
  },
})
</script>

<style lang="scss" scoped>
.page-wrapper {
  background: linear-gradient(180deg, #E8F5E9 0%, #F1F8F4 50%, #FFFFFF 100%) !important;
  min-height: 100vh;
}
</style>
