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
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'

// Import sections
import HeroSection from 'src/components/home/HeroSection.vue'
import FeaturesSection from 'src/components/home/FeaturesSection.vue'
import AboutSection from 'src/components/home/AboutSection.vue'
import GallerySection from 'src/components/home/GallerySection.vue'
import PartnersSection from 'src/components/home/PartnersSection.vue'
import FAQSection from 'src/components/home/FAQSection.vue'
import FooterSection from 'src/components/home/FooterSection.vue'
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
  },

  setup() {
    const heroImage = ref('')

    const partners = ref([])

    const defaultPartners = [
      {
        id: 'partner-1',
        name: 'Baguio City Tourism',
        icon: 'business',
        color: 'primary',
        order: 0,
      },
      {
        id: 'partner-2',
        name: 'LTFRB Cordillera',
        icon: 'directions_bus',
        color: 'secondary',
        order: 1,
      },
      {
        id: 'partner-3',
        name: 'DOT Philippines',
        icon: 'travel_explore',
        color: 'accent',
        order: 2,
      },
      {
        id: 'partner-4',
        name: 'Baguio Local Gov',
        icon: 'account_balance',
        color: 'positive',
        order: 3,
      },
    ]

    const loadPartners = async () => {
      try {
        const coll = collection(db, 'partners')
        const q = query(coll, orderBy('order', 'asc'))
        const snap = await getDocs(q)
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        partners.value = loaded.length > 0 ? loaded : defaultPartners
      } catch (error) {
        console.error('[IndexPage] Error loading partners:', error)
        partners.value = defaultPartners
      }
    }

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
      loadPartners()
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
  background: #ffffff !important;
  min-height: 100vh;
}
</style>
<!-- --rabbit -->
