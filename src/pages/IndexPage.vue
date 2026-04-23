<template>
  <q-page class="page-wrapper">
    <!-- Hero Section -->
    <HeroSection :hero-image="heroImage" />

    <!-- Partners Section -->
    <PartnersSection :partners="partners" />

    <!-- Features Section -->
    <FeaturesSection />

    <!-- About Section -->
    <AboutSection />

    <!-- Gallery Section -->
    <GallerySection />

    <!-- FAQ Section -->
    <FAQSection />

    <!-- Footer Section -->
    <FooterSection />

    <!-- Back to Top Button -->
    <BackToTopBtn />
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'

// Import sections
import HeroSection from 'src/components/home/HeroSection.vue'
import FeaturesSection from 'src/components/home/FeaturesSection.vue'
import AboutSection from 'src/components/home/AboutSection.vue'
import GallerySection from 'src/components/home/GallerySection.vue'
import PartnersSection from 'src/components/home/PartnersSection.vue'
import FAQSection from 'src/components/home/FAQSection.vue'
import FooterSection from 'src/components/home/FooterSection.vue'
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
    const heroImage = ref('')

    const partners = ref([
      { id: 1, name: 'Baguio City Tourism', icon: 'business', color: 'primary' },
      { id: 2, name: 'LTFRB Cordillera', icon: 'directions_bus', color: 'secondary' },
      { id: 3, name: 'DOT Philippines', icon: 'travel_explore', color: 'accent' },
      { id: 4, name: 'Baguio Local Gov', icon: 'account_balance', color: 'positive' },
    ])

    const loadHeroImage = async () => {
      try {
        const docRef = doc(db, 'pagePhotos', 'home')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.imageUrl) heroImage.value = data.imageUrl
        }
      } catch (error) {
        console.error('[IndexPage] Error loading hero image:', error)
      }
    }

    onMounted(() => {
      loadHeroImage()
    })

    return {
      heroImage,
      partners,
    }
  },
})
</script>

<style lang="scss" scoped>
.page-wrapper {
  background: linear-gradient(180deg, #e8f5e9 0%, #f1f8f4 50%, #ffffff 100%) !important;
  min-height: 100vh;
}
</style>
