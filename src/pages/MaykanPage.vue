<template>
  <q-page class="maykan-page">
    <!-- Section 1: Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content animate-fade-in">
          <div class="text-overline text-white q-mb-sm">MAYKAN</div>
          <h1 class="hero-title">DISCOVER BAGUIO'S BEST PLACES</h1>
          <p class="hero-description">
            Your comprehensive guide to Baguio's tourist spots, cafes, parks, and hidden gems.
            Find the perfect place and navigate there with ease using our jeepney route finder.
          </p>

          <div class="hero-actions">
            <q-btn
              label="Explore Places"
              unelevated
              color="white"
              text-color="dark"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift q-mr-md"
              @click="scrollToSection('places')"
            />
            <q-btn
              label="Join Community"
              outline
              color="white"
              size="lg"
              padding="12px 32px"
              class="btn-hover-lift"
              @click="openSaBaguioGroup"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: About MAYKAN -->
    <section class="about-section">
      <div class="container">
        <div class="section-header text-center">
          <div class="text-overline text-primary q-mb-sm">About</div>
          <h2 class="section-title">WHAT IS MAYKAN?</h2>
          <p class="section-subtitle">
            MAYKAN is your ultimate companion for exploring Baguio City. We provide detailed
            information about the city's best places and seamlessly connect you to our APANAM
            feature for easy jeepney navigation. Whether you're a tourist or a local, MAYKAN
            helps you discover and reach Baguio's amazing destinations.
          </p>
        </div>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card section-animate card-hover"
          >
            <div class="feature-icon-wrapper">
              <q-icon :name="feature.icon" size="48px" class="feature-icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Small Ribbon: Sa Baguio Community -->
    <section class="community-ribbon">
      <div class="container">
        <div class="ribbon-content">
          <div class="ribbon-text">
            <q-icon name="groups" size="32px" class="ribbon-icon" />
            <div>
              <h3 class="ribbon-title">Join the Sa Baguio Community</h3>
              <p class="ribbon-subtitle">
                Connect with locals and travelers, share experiences, and get insider tips!
              </p>
            </div>
          </div>
          <q-btn
            label="Join Facebook Group"
            unelevated
            color="primary"
            text-color="white"
            padding="10px 28px"
            class="btn-hover-lift"
            icon-right="open_in_new"
            @click="openSaBaguioGroup"
          />
        </div>
      </div>
    </section>

    <!-- Section 3: Places Directory (Pinterest-style Grid) -->
    <section id="places" class="places-section" ref="placesSection">
      <div class="container">
        <div class="section-header text-center">
          <h2 class="section-title">EXPLORE BAGUIO'S PLACES</h2>
          <p class="section-description">
            Browse through our curated collection of Baguio's best tourist spots, cafes, parks,
            and more. Click on any place to view details and get directions.
          </p>

          <!-- Category Filter -->
          <div class="category-filter">
            <q-btn
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :unelevated="selectedCategory === category.value"
              :outline="selectedCategory !== category.value"
              :color="selectedCategory === category.value ? 'primary' : 'dark'"
              size="md"
              padding="8px 24px"
              class="category-btn"
              @click="filterByCategory(category.value)"
            />
          </div>
        </div>

        <!-- Places Grid (Pinterest-style) -->
        <div class="places-masonry">
          <div
            v-for="(place, index) in filteredPlaces"
            :key="index"
            class="place-card section-animate card-hover"
            @click="selectPlace(place)"
          >
            <div class="place-image-wrapper">
              <img v-if="place.image" :src="place.image" :alt="place.name" class="place-image" />
              <div v-else class="place-placeholder">
                <q-icon name="image" size="48px" color="grey-4" />
              </div>
              <div class="place-category-badge">{{ place.category }}</div>
            </div>

            <div class="place-content">
              <h3 class="place-name">{{ place.name }}</h3>
              <p class="place-short-desc">{{ place.shortDescription }}</p>

              <div class="place-meta">
                <div class="meta-item">
                  <q-icon name="schedule" size="16px" />
                  <span>{{ place.hours }}</span>
                </div>
                <div class="meta-item">
                  <q-icon name="location_on" size="16px" />
                  <span>{{ place.area }}</span>
                </div>
              </div>

              <div class="place-tags">
                <span v-for="(tag, tagIndex) in place.tags" :key="tagIndex" class="place-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="text-center q-mt-xl" v-if="hasMorePlaces">
          <q-btn
            label="Load More Places"
            unelevated
            color="primary"
            padding="12px 40px"
            class="btn-hover-lift"
            @click="loadMorePlaces"
          />
        </div>
      </div>
    </section>

    <!-- Section 4: Place Detail Modal -->
    <q-dialog
      v-model="showPlaceDetail"
      transition-show="slide-up"
      transition-hide="slide-down"
      maximized
    >
      <q-card class="place-detail-card">
        <q-card-section class="place-detail-content">
          <!-- Close Button -->
          <q-btn
            flat
            dense
            round
            icon="close"
            color="dark"
            size="lg"
            class="close-btn"
            @click="showPlaceDetail = false"
          />

          <div class="detail-container">
            <!-- Image Section -->
            <div class="detail-image-section">
              <div class="detail-image-wrapper">
                <img
                  v-if="selectedPlace?.image"
                  :src="selectedPlace.image"
                  :alt="selectedPlace.name"
                  class="detail-image"
                />
                <div v-else class="detail-image-placeholder">
                  <q-icon name="image" size="120px" color="grey-4" />
                </div>
              </div>

              <!-- Image Gallery Thumbnails (if available) -->
              <div v-if="selectedPlace?.gallery" class="image-gallery">
                <div
                  v-for="(img, idx) in selectedPlace.gallery"
                  :key="idx"
                  class="gallery-thumb"
                >
                  <img :src="img" :alt="`${selectedPlace.name} ${idx + 1}`" />
                </div>
              </div>
            </div>

            <!-- Info Section -->
            <div class="detail-info-section">
              <div class="detail-header">
                <div class="category-badge">{{ selectedPlace?.category }}</div>
                <h2 class="detail-title">{{ selectedPlace?.name }}</h2>
                <p class="detail-description">{{ selectedPlace?.description }}</p>
              </div>

              <!-- Operating Hours -->
              <div class="detail-info-card">
                <div class="info-card-header">
                  <q-icon name="schedule" size="32px" color="primary" />
                  <h3>Operating Hours</h3>
                </div>
                <div class="info-card-content">
                  <p class="hours-text">{{ selectedPlace?.operatingHours }}</p>
                  <p v-if="selectedPlace?.specialHours" class="special-hours">
                    {{ selectedPlace.specialHours }}
                  </p>
                </div>
              </div>

              <!-- Location & Address -->
              <div class="detail-info-card">
                <div class="info-card-header">
                  <q-icon name="location_on" size="32px" color="primary" />
                  <h3>Location</h3>
                </div>
                <div class="info-card-content">
                  <p class="address-text">{{ selectedPlace?.address }}</p>
                  <p class="landmark-text">{{ selectedPlace?.landmark }}</p>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="detail-info-card" v-if="selectedPlace?.entranceFee">
                <div class="info-card-header">
                  <q-icon name="payments" size="32px" color="primary" />
                  <h3>Entrance Fee</h3>
                </div>
                <div class="info-card-content">
                  <p class="fee-text">{{ selectedPlace.entranceFee }}</p>
                </div>
              </div>

              <!-- Contact Info -->
              <div class="detail-info-card" v-if="selectedPlace?.contact">
                <div class="info-card-header">
                  <q-icon name="phone" size="32px" color="primary" />
                  <h3>Contact</h3>
                </div>
                <div class="info-card-content">
                  <p class="contact-text">{{ selectedPlace.contact }}</p>
                </div>
              </div>

              <!-- Tags -->
              <div class="detail-tags">
                <span v-for="(tag, idx) in selectedPlace?.tags" :key="idx" class="detail-tag">
                  {{ tag }}
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="detail-actions">
                <q-btn
                  label="Get Directions via APANAM"
                  unelevated
                  color="primary"
                  size="lg"
                  padding="14px 40px"
                  icon="navigation"
                  class="btn-hover-lift full-width"
                  @click="navigateToApanam"
                />

                <div class="secondary-actions">
                  <q-btn
                    label="Share"
                    outline
                    color="primary"
                    size="md"
                    icon="share"
                    class="btn-hover-lift"
                    @click="sharePlace"
                  />
                  <q-btn
                    label="Save"
                    outline
                    color="primary"
                    size="md"
                    icon="bookmark_border"
                    class="btn-hover-lift"
                    @click="savePlace"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Section 5: FAQs -->
    <FAQSection />

    <!-- Section 6: Footer -->
    <FooterSection />
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import FAQSection from '../components/Home/FAQSection.vue'
import FooterSection from '../components/Home/FooterSection.vue'

export default defineComponent({
  name: 'MaykanPage',
  components: {
    FAQSection,
    FooterSection,
  },

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const placesSection = ref(null)
    const showPlaceDetail = ref(false)
    const selectedPlace = ref(null)
    const selectedCategory = ref('all')
    const hasMorePlaces = ref(false)

    const features = [
      {
        icon: 'explore',
        title: 'Discover Places',
        description:
          'Browse through hundreds of curated tourist spots, cafes, parks, and hidden gems in Baguio City.',
      },
      {
        icon: 'info',
        title: 'Detailed Information',
        description:
          'Get complete details including operating hours, entrance fees, contact info, and exact locations.',
      },
      {
        icon: 'directions',
        title: 'Easy Navigation',
        description:
          'Seamlessly connect to APANAM for instant jeepney routes and directions to your chosen destination.',
      },
    ]

    const categories = [
      { label: 'All Places', value: 'all' },
      { label: 'Tourist Spots', value: 'tourist' },
      { label: 'Cafes & Restaurants', value: 'cafe' },
      { label: 'Parks & Nature', value: 'park' },
      { label: 'Museums & Culture', value: 'museum' },
      { label: 'Shopping', value: 'shopping' },
    ]

    const places = [
      {
        name: 'Burnham Park',
        category: 'Tourist Spots',
        shortDescription: "Baguio's iconic central park with boating and biking activities",
        description:
          "Burnham Park is the heart of Baguio City, a sprawling urban park perfect for families and tourists. Enjoy boat rides on the lagoon, bike around the park, or simply relax on the grass. It's a must-visit destination that captures the essence of Baguio.",
        area: 'City Center',
        hours: '24 hours',
        operatingHours: 'Open 24 hours daily',
        specialHours: 'Boat rentals: 6:00 AM - 6:00 PM',
        address: 'Jose Abad Santos Drive, Baguio City',
        landmark: 'Near Baguio Cathedral and Session Road',
        entranceFee: 'Free (boat rentals: ₱150-300 per 30 minutes)',
        contact: 'N/A',
        tags: ['Parks', 'Family-Friendly', 'Boating', 'Iconic'],
        image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=400&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
        ],
      },
      {
        name: 'The Mansion',
        category: 'Tourist Spots',
        shortDescription: "Official summer residence of the Philippine President",
        description:
          "The Mansion serves as the official summer residence of the President of the Philippines. While you can't enter the building itself, the well-manicured gardens and impressive architecture make it a popular photo spot. The surrounding area is perfect for a leisurely walk.",
        area: 'Leonard Wood Road',
        hours: 'Gardens: 8AM-5PM',
        operatingHours: 'Gardens open daily 8:00 AM - 5:00 PM',
        specialHours: 'Building interior closed to public',
        address: 'Leonard Wood Road, Baguio City',
        landmark: 'Near Wright Park',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Historical', 'Architecture', 'Photo Spot', 'Gardens'],
        image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
          'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=400&q=80',
        ],
      },
      {
        name: "Mines View Park",
        category: 'Tourist Spots',
        shortDescription: 'Panoramic views of mining areas and souvenir shops',
        description:
          "Mines View Park offers breathtaking panoramic views of the Cordillera mountain ranges and former mining towns. The park features numerous souvenir shops selling local handicrafts, woven products, and Baguio delicacies. Don't miss the photo opportunity with the famous St. Bernard dogs!",
        area: 'Outlook Drive',
        hours: '7AM-6PM',
        operatingHours: 'Open daily 7:00 AM - 6:00 PM',
        address: 'Outlook Drive, Baguio City',
        landmark: 'Near Baguio Country Club',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Scenic Views', 'Shopping', 'Photo Spot', 'Mountain Views'],
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
          'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&q=80',
          'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&q=80',
        ],
      },
      {
        name: 'Baguio Cathedral',
        category: 'Tourist Spots',
        shortDescription: 'Pink twin-spired Catholic cathedral in the city center',
        description:
          'Also known as Our Lady of Atonement Cathedral, this iconic pink church with twin spires is one of Baguio\'s most recognizable landmarks. Built in 1936, it features beautiful stained glass windows and offers a peaceful sanctuary in the heart of the city. The long flight of stairs leading to the cathedral is also a popular photo spot.',
        area: 'City Center',
        hours: 'Daily: 6AM-7PM',
        operatingHours: 'Open daily for prayer 6:00 AM - 7:00 PM',
        specialHours: 'Mass schedules: Sunday 5:30 AM, 7:00 AM, 8:30 AM, 10:00 AM, 5:00 PM',
        address: 'Cathedral Loop, Session Road, Baguio City',
        landmark: 'At the top of Session Road stairs',
        entranceFee: 'Free',
        contact: '(074) 442-3363',
        tags: ['Religious', 'Historical', 'Architecture', 'Photo Spot'],
        image: 'https://images.unsplash.com/photo-1548625149-720d74bf8f05?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1548625149-720d74bf8f05?w=400&q=80',
          'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=400&q=80',
          'https://images.unsplash.com/photo-1605102295070-96259eb81623?w=400&q=80',
        ],
      },
      {
        name: 'Wright Park',
        category: 'Parks & Nature',
        shortDescription: 'Historic park with horseback riding and a pool of pine trees',
        description:
          'Wright Park is famous for its "Pool of Pines" - a scenic stretch of tall pine trees creating a natural canopy. The park offers horseback riding experiences and is a favorite spot for morning walks. The cool, fresh air and towering trees make it a perfect escape from city life.',
        area: 'Leonard Wood Road',
        hours: '6AM-6PM',
        operatingHours: 'Open daily 6:00 AM - 6:00 PM',
        specialHours: 'Horse rentals available during operating hours',
        address: 'Upper Session Road, Baguio City',
        landmark: 'Near The Mansion',
        entranceFee: 'Free (horseback riding: ₱200-500)',
        contact: 'N/A',
        tags: ['Parks', 'Horseback Riding', 'Nature', 'Photo Spot'],
        image: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=400&q=80',
          'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
          'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&q=80',
        ],
      },
      {
        name: 'Tam-awan Village',
        category: 'Museums & Culture',
        shortDescription: 'Traditional Cordillera village showcasing indigenous culture',
        description:
          'Tam-awan Village is a reconstructed traditional Cordillera village that serves as an artist village and cultural center. Experience authentic huts, learn about indigenous traditions, and appreciate local art. The village often hosts workshops and cultural performances, making it a living museum of Cordillera heritage.',
        area: 'Pinsao',
        hours: '9AM-6PM',
        operatingHours: 'Open daily 9:00 AM - 6:00 PM',
        address: '366 Pinsao Proper, Baguio City',
        landmark: 'Near Teacher\'s Camp',
        entranceFee: '₱60 (adults), ₱40 (students)',
        contact: '(074) 446-2949',
        tags: ['Cultural', 'Indigenous', 'Art', 'Educational'],
        image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&q=80',
          'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80',
          'https://images.unsplash.com/photo-1604357209793-fca5dca89f97?w=400&q=80',
        ],
      },
      {
        name: 'Bell Church (Our Lady of Lourdes Grotto)',
        category: 'Tourist Spots',
        shortDescription: 'Serene grotto with 252 steps and religious significance',
        description:
          'The Our Lady of Lourdes Grotto, commonly called Bell Church, is a peaceful religious site featuring a replica of the grotto in Lourdes, France. Climbing the 252 steps to the shrine offers both spiritual reflection and exercise. At the top, you\'re rewarded with a beautiful view and a sense of tranquility.',
        area: 'Dominican Hill',
        hours: '6AM-6PM',
        operatingHours: 'Open daily 6:00 AM - 6:00 PM',
        address: 'Dominican Hill Road, Baguio City',
        landmark: 'Near Lourdes Grotto',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Religious', 'Pilgrimage', 'Exercise', 'Peaceful'],
        image: 'https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1508768787810-6adc1f613514?w=400&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        ],
      },

      // Cafes & Restaurants
      {
        name: 'Hill Station',
        category: 'Cafes & Restaurants',
        shortDescription: 'Upscale dining with colonial ambiance and international cuisine',
        description:
          'Hill Station offers a sophisticated dining experience in a beautifully restored colonial house. The restaurant serves international and Filipino fusion cuisine in an elegant setting. Perfect for special occasions or romantic dinners, with impeccable service and exquisite food presentation.',
        area: 'Casa Vallejo',
        hours: '11AM-2PM, 6PM-10PM',
        operatingHours: 'Lunch: 11:00 AM - 2:00 PM | Dinner: 6:00 PM - 10:00 PM',
        specialHours: 'Closed on Mondays',
        address: 'Casa Vallejo, Upper Session Road, Baguio City',
        landmark: 'Inside Casa Vallejo Hotel',
        entranceFee: 'N/A',
        contact: '(074) 424-2547',
        tags: ['Fine Dining', 'International', 'Romantic', 'Colonial'],
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
        ],
      },
      {
        name: 'Café by the Ruins',
        category: 'Cafes & Restaurants',
        shortDescription: 'Bohemian café serving organic local dishes',
        description:
          'A beloved Baguio institution, Café by the Ruins celebrates local culture and organic ingredients. Built around actual ruins, the café offers a unique ambiance with its open-air setting and eclectic décor. Try their famous mushroom soup and organic salads while enjoying the artsy atmosphere.',
        area: 'Shuntug Trail',
        hours: '8AM-8PM',
        operatingHours: 'Open daily 8:00 AM - 8:00 PM',
        address: '25 Shuntug Trail, Baguio City',
        landmark: 'Near Baguio Cathedral',
        entranceFee: 'N/A',
        contact: '(074) 442-4010',
        tags: ['Local Cuisine', 'Organic', 'Bohemian', 'Historic'],
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80',
          'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80',
          'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&q=80',
        ],
      },
      {
        name: 'Vizco\'s Restaurant & Cake Shop',
        category: 'Cafes & Restaurants',
        shortDescription: 'Famous for strawberry shortcake and Filipino comfort food',
        description:
          'Vizco\'s is a Baguio favorite known for their legendary strawberry shortcake and delicious Filipino dishes. The restaurant offers generous portions of comfort food in a cozy setting. Don\'t leave without trying their signature cake - it\'s a Baguio must-have!',
        area: 'Various locations',
        hours: '8AM-8PM',
        operatingHours: 'Open daily 8:00 AM - 8:00 PM',
        address: 'Multiple branches: Session Road, Abanao Square, SM Baguio',
        landmark: 'Main branch on Session Road',
        entranceFee: 'N/A',
        contact: '(074) 442-2551',
        tags: ['Bakery', 'Filipino Food', 'Desserts', 'Popular'],
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
          'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80',
        ],
      },
      {
        name: 'Good Taste Café and Restaurant',
        category: 'Cafes & Restaurants',
        shortDescription: 'Budget-friendly Filipino-Chinese dishes',
        description:
          'Good Taste has been serving affordable and delicious Filipino-Chinese cuisine since the 1970s. Known for generous portions and reasonable prices, it\'s a favorite among locals and budget-conscious travelers. Their pancit canton and fried chicken are highly recommended.',
        area: 'Session Road',
        hours: '10AM-10PM',
        operatingHours: 'Open daily 10:00 AM - 10:00 PM',
        address: '88 Session Road, Baguio City',
        landmark: 'Near Baguio Center Mall',
        entranceFee: 'N/A',
        contact: '(074) 442-8072',
        tags: ['Budget-Friendly', 'Filipino-Chinese', 'Local Favorite', 'Casual'],
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
        ],
      },
      {
        name: 'Ketchup Food Community',
        category: 'Cafes & Restaurants',
        shortDescription: 'Modern food hall with diverse dining options',
        description:
          'Ketchup Food Community is Baguio\'s premier food hall featuring multiple food stalls and restaurants under one roof. From Korean BBQ to Italian pasta, Japanese ramen to Filipino favorites - there\'s something for everyone. The modern, Instagram-worthy space makes it popular with younger crowds.',
        area: 'Session Road',
        hours: '11AM-11PM',
        operatingHours: 'Open daily 11:00 AM - 11:00 PM',
        address: 'Session Road, Baguio City',
        landmark: 'Near Baguio Cathedral',
        entranceFee: 'N/A',
        contact: 'Various per stall',
        tags: ['Food Hall', 'Diverse Cuisine', 'Modern', 'Instagram-worthy'],
        image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&q=80',
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
          'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&q=80',
        ],
      },
      {
        name: 'The Coffee Beanery',
        category: 'Cafes & Restaurants',
        shortDescription: 'Cozy coffee shop with mountain views',
        description:
          'The Coffee Beanery is a charming café offering quality coffee and pastries with stunning views of the Cordillera mountains. The warm ambiance and friendly service make it perfect for catching up with friends or working remotely. Their specialty coffee blends and homemade cakes are customer favorites.',
        area: 'Upper Session Road',
        hours: '7AM-9PM',
        operatingHours: 'Open daily 7:00 AM - 9:00 PM',
        address: 'Upper Session Road, Baguio City',
        landmark: 'Near Baguio Country Club',
        entranceFee: 'N/A',
        contact: '(074) 442-7890',
        tags: ['Coffee Shop', 'Mountain Views', 'Cozy', 'WiFi'],
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
          'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80',
          'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
        ],
      },
      {
        name: 'Oh My Gulay!',
        category: 'Cafes & Restaurants',
        shortDescription: 'Artistic vegetarian restaurant with rooftop dining',
        description:
          'Oh My Gulay! is an eccentric vegetarian restaurant located on the top floor of La Azotea Building. The quirky décor, which includes paintings and art installations, creates a bohemian atmosphere. The menu features creative vegetarian dishes using fresh, local ingredients. The rooftop setting offers a unique dining experience.',
        area: 'Session Road',
        hours: '11AM-7PM',
        operatingHours: 'Open daily 11:00 AM - 7:00 PM',
        address: '5th Floor, La Azotea Building, Session Road, Baguio City',
        landmark: 'La Azotea Building',
        entranceFee: 'N/A',
        contact: '(074) 424-9573',
        tags: ['Vegetarian', 'Artistic', 'Rooftop', 'Unique'],
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80',
          'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&q=80',
        ],
      },

      // Museums & Culture
      {
        name: 'BenCab Museum',
        category: 'Museums & Culture',
        shortDescription: 'Contemporary art museum showcasing Filipino artists',
        description:
          'The BenCab Museum houses the works of National Artist Benedicto Cabrera and other contemporary Filipino artists. The museum complex includes galleries, gardens, a café, and a souvenir shop. Set in a stunning location with mountain views, it\'s a must-visit for art enthusiasts.',
        area: 'Tuba',
        hours: '9AM-6PM',
        operatingHours: 'Tuesday to Sunday: 9:00 AM - 6:00 PM',
        specialHours: 'Closed on Mondays',
        address: 'Km. 6 Asin Road, Tadiangan, Tuba, Benguet',
        landmark: 'Near Asin Hot Springs',
        entranceFee: '₱150 (adults), ₱80 (students/seniors)',
        contact: '(074) 442-7165',
        tags: ['Art', 'Museum', 'Contemporary', 'Cultural'],
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80',
          'https://images.unsplash.com/photo-1578926078261-dd5553a08c40?w=400&q=80',
          'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&q=80',
        ],
      },
      {
        name: 'Baguio Museum',
        category: 'Museums & Culture',
        shortDescription: 'Historical museum showcasing Cordillera heritage',
        description:
          'Located inside Baguio City Hall, this museum showcases the rich cultural heritage of the Cordillera region. Exhibits include traditional Igorot clothing, artifacts, historical photographs, and information about Baguio\'s development. Free admission makes it accessible to everyone.',
        area: 'City Center',
        hours: '8AM-5PM (weekdays)',
        operatingHours: 'Monday to Friday: 8:00 AM - 5:00 PM',
        specialHours: 'Closed on weekends and holidays',
        address: 'Baguio City Hall Compound, Session Road, Baguio City',
        landmark: 'Inside Baguio City Hall',
        entranceFee: 'Free',
        contact: '(074) 442-8931',
        tags: ['History', 'Cultural', 'Indigenous', 'Educational'],
        image: 'https://images.unsplash.com/photo-1565301660306-29e08751cc3b?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1565301660306-29e08751cc3b?w=400&q=80',
          'https://images.unsplash.com/photo-1551191916-2a40a1b8aef3?w=400&q=80',
          'https://images.unsplash.com/photo-1566127444979-b3d2b654e1d8?w=400&q=80',
        ],
      },

      // Parks & Nature
      {
        name: 'Botanical Garden',
        category: 'Parks & Nature',
        shortDescription: 'Peaceful garden showcasing native plants and Igorot culture',
        description:
          'The Baguio Botanical Garden, also known as the Centennial Park, is a beautiful green space showcasing native plants and traditional Igorot houses. Walking paths wind through the gardens, and you can learn about indigenous culture through the displayed structures. It\'s a perfect spot for nature photography and peaceful walks.',
        area: 'Leonard Wood Road',
        hours: '6AM-6PM',
        operatingHours: 'Open daily 6:00 AM - 6:00 PM',
        address: 'Leonard Wood Road, Baguio City',
        landmark: 'Near Camp John Hay',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Gardens', 'Nature', 'Indigenous Culture', 'Educational'],
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80',
          'https://images.unsplash.com/photo-1591958911259-bee2173bdccc?w=400&q=80',
          'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&q=80',
        ],
      },
      {
        name: 'Camp John Hay',
        category: 'Parks & Nature',
        shortDescription: 'Former US military base turned eco-tourism destination',
        description:
          'Camp John Hay is a sprawling eco-tourism estate featuring pine forests, hiking trails, hotels, restaurants, and recreational facilities. The cool mountain air, scenic trails, and variety of activities make it a favorite destination. Don\'t miss the Bell House, historical cemetery, and butterfly sanctuary.',
        area: 'Loakan Road',
        hours: '24 hours (facilities vary)',
        operatingHours: 'Park grounds: Open 24 hours | Facilities: Various hours',
        address: 'Loakan Road, Baguio City',
        landmark: 'Near Manor Hotel',
        entranceFee: 'Free (some facilities may charge)',
        contact: '(074) 424-3030',
        tags: ['Nature', 'Hiking', 'Historical', 'Recreation'],
        image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&q=80',
          'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400&q=80',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80',
        ],
      },
      {
        name: 'Mirador Jesuit Villa',
        category: 'Parks & Nature',
        shortDescription: 'Scenic spot with panoramic city views and sunset watching',
        description:
          'Mirador Hill offers one of the best panoramic views of Baguio City and the surrounding mountains. It\'s especially popular during sunset when the city lights begin to twinkle. The area includes a small chapel, well-maintained gardens, and viewing decks perfect for photography.',
        area: 'Outlook Drive',
        hours: '6AM-6PM',
        operatingHours: 'Open daily 6:00 AM - 6:00 PM',
        address: 'Dominican Hill, Mirador Hill, Baguio City',
        landmark: 'Near Diplomat Hotel',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Scenic Views', 'Sunset Spot', 'Photography', 'Peaceful'],
        image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
        ],
      },
      {
        name: 'Strawberry Farm (La Trinidad)',
        category: 'Parks & Nature',
        shortDescription: 'Pick-your-own strawberries with scenic views',
        description:
          'Located just outside Baguio in nearby La Trinidad, the strawberry farms offer a unique agricultural tourism experience. Pick your own fresh strawberries directly from the fields, enjoy strawberry-themed treats, and take in the beautiful terraced landscapes. Best visited from December to April during peak season.',
        area: 'La Trinidad',
        hours: '7AM-5PM',
        operatingHours: 'Open daily 7:00 AM - 5:00 PM',
        specialHours: 'Peak season: December to April',
        address: 'La Trinidad, Benguet',
        landmark: 'Various farms in La Trinidad Valley',
        entranceFee: 'Free (strawberry picking: ₱400-500 per kilo)',
        contact: 'Various per farm',
        tags: ['Agriculture', 'Family-Friendly', 'Seasonal', 'Fresh Produce'],
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
          'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&q=80',
          'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80',
        ],
      },

      // Shopping
      {
        name: 'Baguio Public Market',
        category: 'Shopping',
        shortDescription: 'Bustling market for fresh produce, handicrafts, and souvenirs',
        description:
          'The Baguio Public Market is the heart of the city\'s commerce, offering fresh vegetables, fruits, flowers, handicrafts, woven products, and local delicacies. The upper floors feature shops selling ukay-ukay (secondhand clothes), bags, and various goods. Come early for the best selection of fresh produce.',
        area: 'City Center',
        hours: '6AM-7PM',
        operatingHours: 'Open daily 6:00 AM - 7:00 PM',
        address: 'Magsaysay Avenue, Baguio City',
        landmark: 'Near Session Road',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Market', 'Local Products', 'Fresh Produce', 'Handicrafts'],
        image: 'https://images.unsplash.com/photo-1555982105-d25af4182e4e?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1555982105-d25af4182e4e?w=400&q=80',
          'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80',
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80',
        ],
      },
      {
        name: 'Session Road',
        category: 'Shopping',
        shortDescription: "Baguio's main shopping and dining street",
        description:
          'Session Road is Baguio\'s iconic main street and commercial hub. Lined with shops, restaurants, cafes, and banks, it\'s the perfect place for strolling, shopping, and people-watching. During weekends, it transforms into a pedestrian-friendly area with street performers and vendors.',
        area: 'City Center',
        hours: '24 hours',
        operatingHours: 'Open 24 hours (shops: typically 9:00 AM - 8:00 PM)',
        specialHours: 'Pedestrian street: Saturday-Sunday',
        address: 'Session Road, Baguio City',
        landmark: 'From Burnham Park to Baguio Cathedral',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Shopping', 'Dining', 'Iconic', 'City Center'],
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80',
          'https://images.unsplash.com/photo-1519995451813-39e29e054914?w=400&q=80',
          'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=400&q=80',
        ],
      },
      {
        name: 'SM City Baguio',
        category: 'Shopping',
        shortDescription: "Baguio's largest shopping mall",
        description:
          'SM City Baguio is the largest mall in Northern Luzon, offering a complete shopping and entertainment experience. With hundreds of stores, restaurants, a cinema, and a supermarket, it\'s a one-stop destination. The Sky Ranch on the top floor features an observation wheel with city views.',
        area: 'Upper Session Road',
        hours: '10AM-9PM',
        operatingHours: 'Open daily 10:00 AM - 9:00 PM',
        address: 'Luneta Hill, Upper Session Road, Baguio City',
        landmark: 'Visible from various parts of the city',
        entranceFee: 'Free (Sky Ranch rides: ₱50-150)',
        contact: '(074) 446-9291',
        tags: ['Mall', 'Shopping', 'Entertainment', 'Dining'],
        image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&q=80',
          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=80',
          'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=400&q=80',
        ],
      },
      {
        name: 'Night Market',
        category: 'Shopping',
        shortDescription: 'Vibrant evening market with street food and ukay-ukay',
        description:
          'The Baguio Night Market comes alive after sunset along Harrison Road. Browse through countless stalls selling affordable clothing, accessories, plants, and street food. It\'s a beloved local tradition where you can experience authentic Baguio nightlife and score great bargains on ukay-ukay finds.',
        area: 'Harrison Road',
        hours: '6PM-12AM',
        operatingHours: 'Open daily 6:00 PM - 12:00 AM',
        address: 'Harrison Road, Baguio City',
        landmark: 'Near Maharlika Livelihood Center',
        entranceFee: 'Free',
        contact: 'N/A',
        tags: ['Night Market', 'Street Food', 'Ukay-ukay', 'Local Culture'],
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80',
          'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&q=80',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
        ],
      },
    ]

    const filteredPlaces = computed(() => {
      if (selectedCategory.value === 'all') {
        return places
      }
      return places.filter((place) => {
        const categoryMap = {
          tourist: 'Tourist Spots',
          cafe: 'Cafes & Restaurants',
          park: 'Parks & Nature',
          museum: 'Museums & Culture',
          shopping: 'Shopping',
        }
        return place.category === categoryMap[selectedCategory.value]
      })
    })

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const openSaBaguioGroup = () => {
      window.open('https://www.facebook.com/groups/sabaguio', '_blank')
    }

    const filterByCategory = (category) => {
      selectedCategory.value = category
      scrollToSection('places')
    }

    const selectPlace = (place) => {
      selectedPlace.value = place
      showPlaceDetail.value = true
    }

    const navigateToApanam = () => {
      if (!selectedPlace.value) return

      showPlaceDetail.value = false

      const destinationData = {
        name: selectedPlace.value.name,
        address: selectedPlace.value.address,
        landmark: selectedPlace.value.landmark,
        area: selectedPlace.value.area,
        coordinates: selectedPlace.value.coordinates,
      }

      try {
        router.push({
          name: 'apanam', 
          query: {
            to: selectedPlace.value.name,
            toAddress: selectedPlace.value.address,
            toLandmark: selectedPlace.value.landmark,
          },
          state: {
            destination: destinationData,
            fromMAYKAN: true,
          },
        })

        $q.notify({
          message: `Navigating to APANAM with destination: ${selectedPlace.value.name}`,
          color: 'positive',
          icon: 'navigation',
          position: 'top',
        })
      } catch (error) {
        $q.notify({
          message:
            'APANAM feature is coming soon! Your destination will be: ' + selectedPlace.value.name,
          color: 'info',
          icon: 'info',
          position: 'top',
          timeout: 3000,
        })

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('apanam_destination', JSON.stringify(destinationData))
        }
      }
    }

    const sharePlace = () => {
      if (navigator.share) {
        navigator
          .share({
            title: selectedPlace.value?.name,
            text: selectedPlace.value?.shortDescription,
            url: window.location.href,
          })
          .then(() => {
            $q.notify({
              message: 'Place shared successfully!',
              color: 'positive',
              icon: 'share',
            })
          })
          .catch((error) => {
            console.log('Error sharing:', error)
          })
      } else {
        $q.notify({
          message: 'Share link copied to clipboard!',
          color: 'positive',
          icon: 'content_copy',
        })
      }
    }

    const savePlace = () => {
      $q.notify({
        message: `${selectedPlace.value?.name} saved to your favorites!`,
        color: 'positive',
        icon: 'bookmark',
      })
    }

    const loadMorePlaces = () => {
      $q.notify({
        message: 'Loading more places...',
        color: 'primary',
        icon: 'refresh',
      })
    }

    const observeElements = () => {
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      }, options)

      const elements = document.querySelectorAll('.section-animate')
      elements.forEach((el) => observer.observe(el))

      return observer
    }

    let observer

    onMounted(() => {
      setTimeout(() => {
        observer = observeElements()
      }, 100)
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      features,
      categories,
      places,
      filteredPlaces,
      placesSection,
      showPlaceDetail,
      selectedPlace,
      selectedCategory,
      hasMorePlaces,
      scrollToSection,
      openSaBaguioGroup,
      filterByCategory,
      selectPlace,
      navigateToApanam,
      sharePlace,
      savePlace,
      loadMorePlaces,
    }
  },
})
</script>

<style lang="scss" scoped>
$pine-green: #2d5016;
$pine-green-light: #4a7c2c;
$pine-green-dark: #1a3309;
$mountain-blue: #4a7ba7;
$sunset-orange: #e67e22;
$cream-white: #f8f6f0;
$warm-beige: #e8e0d5;
$earth-brown: #8b6f47;
$text-dark: #2c3e50;
$text-medium: #546e7a;
$text-light: #78909c;

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.section-animate {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;

  &.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-hover-lift {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(45, 80, 22, 0.3);
  }
}

.card-hover {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

// Hero Section
.hero-section {
  position: relative;
  min-height: 650px;
  background: linear-gradient(135deg, $pine-green-dark 0%, $pine-green 50%, $pine-green-light 100%);
  display: flex;
  align-items: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.15;
    z-index: 0;
  }

  .hero-overlay {
    position: relative;
    width: 100%;
    padding: 0 5%;
    z-index: 1;
  }

  .hero-content {
    max-width: 800px;
    color: white;

    .hero-title {
      font-size: 4rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 1.5rem 0;
      letter-spacing: 2px;
      text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.3);

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }

    .hero-description {
      font-size: 1.2rem;
      line-height: 1.7;
      margin-bottom: 2.5rem;
      opacity: 0.95;
      text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;

      .q-btn {
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }
  }
}

// About Section
.about-section {
  background: white;
  padding: 100px 0;

  .section-header {
    margin-bottom: 60px;

    .text-overline {
      color: $pine-green;
      font-weight: 700;
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: $text-dark;
      letter-spacing: 0.5px;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .section-subtitle {
      font-size: 1.1rem;
      color: $text-medium;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.8;
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;

    @media (max-width: 960px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    .feature-card {
      background: $cream-white;
      border: 2px solid $warm-beige;
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;

      .feature-icon-wrapper {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem auto;
        box-shadow: 0 4px 15px rgba(45, 80, 22, 0.2);

        .feature-icon {
          color: white;
        }
      }

      .feature-title {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0 0 1rem 0;
        color: $text-dark;
        letter-spacing: 0.3px;
      }

      .feature-description {
        font-size: 0.95rem;
        line-height: 1.6;
        color: $text-medium;
      }
    }
  }
}

// Community Ribbon
.community-ribbon {
  background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
  padding: 35px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  .ribbon-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }

    .ribbon-text {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;

      @media (max-width: 768px) {
        flex-direction: column;
      }

      .ribbon-icon {
        color: white;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.15);
        padding: 12px;
        border-radius: 50%;
      }

      .ribbon-title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: white;
      }

      .ribbon-subtitle {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.9);
        margin: 0;
      }
    }

    .q-btn {
      background: white !important;
      color: $pine-green !important;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

      &:hover {
        background: $cream-white !important;
      }
    }
  }
}

// Places Section
.places-section {
  background: $cream-white;
  padding: 100px 0;

  .section-header {
    margin-bottom: 60px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1.5rem 0;
      color: $text-dark;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    .section-description {
      font-size: 1.1rem;
      line-height: 1.7;
      color: $text-medium;
      max-width: 800px;
      margin: 0 auto 2.5rem auto;
    }

    .category-filter {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;

      .category-btn {
        border-radius: 25px;
        text-transform: none;
        font-weight: 600;
        transition: all 0.3s ease;

        &:not(.q-btn--unelevated) {
          border: 2px solid $pine-green;
        }
      }
    }
  }

  // Pinterest-style Masonry Grid
  .places-masonry {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    margin-bottom: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .place-card {
      background: white;
      border: 2px solid $warm-beige;
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

      .place-image-wrapper {
        position: relative;
        width: 100%;
        padding-top: 75%;
        background: linear-gradient(135deg, $warm-beige 0%, $cream-white 100%);
        overflow: hidden;

        .place-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        &:hover .place-image {
          transform: scale(1.1);
        }

        .place-placeholder {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .place-category-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 0.8rem;
          font-weight: 700;
          color: $pine-green;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
          letter-spacing: 0.5px;
        }
      }

      .place-content {
        padding: 25px;

        .place-name {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 0.75rem 0;
          color: $text-dark;
          line-height: 1.3;
        }

        .place-short-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          color: $text-medium;
          margin: 0 0 1rem 0;
        }

        .place-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid $warm-beige;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: $text-medium;

            .q-icon {
              color: $pine-green;
            }
          }
        }

        .place-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;

          .place-tag {
            font-size: 0.75rem;
            font-weight: 600;
            color: $pine-green;
            background: rgba(45, 80, 22, 0.08);
            padding: 5px 12px;
            border-radius: 15px;
            border: 1px solid rgba(45, 80, 22, 0.15);
          }
        }
      }
    }
  }
}

// Place Detail Modal
.place-detail-card {
  background: white;
  height: 100%;
  overflow-y: auto;

  .close-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover {
      background: $cream-white;
    }
  }

  .place-detail-content {
    padding: 40px 20px;
    background: $cream-white;

    @media (min-width: 768px) {
      padding: 60px 40px;
    }

    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;

      @media (min-width: 1024px) {
        grid-template-columns: 1fr 1fr;
        gap: 60px;
      }

      .detail-image-section {
        .detail-image-wrapper {
          width: 100%;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          background: white;
          margin-bottom: 20px;
          border: 3px solid white;

          .detail-image {
            width: 100%;
            height: auto;
            display: block;
            aspect-ratio: 4/3;
            object-fit: cover;
          }

          .detail-image-placeholder {
            width: 100%;
            aspect-ratio: 4/3;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, $warm-beige 0%, $cream-white 100%);
          }
        }

        .image-gallery {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;

          .gallery-thumb {
            border-radius: 16px;
            overflow: hidden;
            cursor: pointer;
            aspect-ratio: 1;
            border: 3px solid white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;

              &:hover {
                transform: scale(1.1);
              }
            }
          }
        }
      }

      .detail-info-section {
        .detail-header {
          margin-bottom: 30px;

          .category-badge {
            display: inline-block;
            background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
            color: white;
            padding: 8px 18px;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 15px rgba(45, 80, 22, 0.2);
          }

          .detail-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 1rem 0;
            color: $text-dark;
            line-height: 1.2;

            @media (max-width: 768px) {
              font-size: 2rem;
            }
          }

          .detail-description {
            font-size: 1rem;
            line-height: 1.7;
            color: $text-medium;
            margin: 0;
          }
        }

        .detail-info-card {
          background: white;
          border: 2px solid $warm-beige;
          border-radius: 16px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);

          .info-card-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px solid $warm-beige;

            .q-icon {
              color: $pine-green;
            }

            h3 {
              font-size: 1.1rem;
              font-weight: 700;
              margin: 0;
              color: $text-dark;
              letter-spacing: 0.3px;
            }
          }

          .info-card-content {
            p {
              margin: 0 0 8px 0;
              line-height: 1.6;
              color: $text-dark;

              &:last-child {
                margin-bottom: 0;
              }
            }

            .hours-text,
            .address-text,
            .fee-text,
            .contact-text {
              font-size: 0.95rem;
              font-weight: 500;
            }

            .special-hours,
            .landmark-text {
              font-size: 0.85rem;
              color: $text-medium;
              font-style: italic;
            }
          }
        }

        .detail-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 30px;

          .detail-tag {
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
            background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
            padding: 8px 16px;
            border-radius: 20px;
            box-shadow: 0 2px 10px rgba(45, 80, 22, 0.2);
          }
        }

        .detail-actions {
          .full-width {
            width: 100%;
            margin-bottom: 15px;
            font-weight: 700;
            font-size: 1rem;
            padding: 16px 40px;
            background: linear-gradient(135deg, $pine-green 0%, $pine-green-light 100%);
            letter-spacing: 0.5px;
          }

          .secondary-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;

            .q-btn {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}
</style>