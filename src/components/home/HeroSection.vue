<template>
  <section class="hero-section" aria-label="Hero section">
    <!-- Rounded hero card -->
    <div class="hero-card">
      <q-img
        :src="heroImage || defaultHeroImage"
        class="hero-bg"
        alt="Beautiful scenery of Baguio City"
      >
        <template v-slot:loading>
          <div class="absolute-full flex flex-center">
            <q-spinner color="white" size="50px" />
          </div>
        </template>
      </q-img>
      <div class="hero-overlay" />

      <!-- Content -->
      <div class="hero-inner">
        <div class="hero-content">
          <h1 class="hero-title">Explore <em>Baguio</em> City</h1>
          <p class="hero-description">
            Commute like a local, discover tourist spots, browse events, and find nearby attractions
            — all in one place.
          </p>

          <!-- Tourist-spot search → routes to Apanam with the chosen spot as TO -->
          <form class="hero-spot-search" @submit.prevent="navigateToSpot">
            <q-icon name="place" class="spot-search-icon" size="18px" />
            <q-select
              v-model="selectedSpot"
              :options="spotOptions"
              option-label="label"
              option-value="value"
              use-input
              hide-selected
              fill-input
              borderless
              dense
              input-debounce="200"
              placeholder="Search a tourist spot…"
              class="spot-search-input"
              :loading="loadingPlaces"
              @filter="filterSpots"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    <q-item-label caption>
                      {{ loadingPlaces ? 'Loading places…' : 'Type to search Baguio places' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-icon name="place" color="primary" size="18px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <button
              type="submit"
              class="spot-search-cta"
              :disabled="!selectedSpot"
              :aria-disabled="!selectedSpot"
            >
              <q-icon name="navigation" size="16px" />
              <span>Navigate</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPlaces } from 'src/composables/useRouteGeneration'

export default defineComponent({
  name: 'HeroSection',

  props: {
    heroImage: {
      type: String,
      default: '',
    },
  },

  setup() {
    const router = useRouter()

    const allPlaces = ref([])
    const spotOptions = ref([])
    const selectedSpot = ref(null)
    const loadingPlaces = ref(false)

    const buildOptions = (places) =>
      places
        .filter((p) => p?.name && typeof p.latitude === 'number' && typeof p.longitude === 'number')
        .map((p) => ({
          label: p.name,
          value: `place-${p.id}`,
          coords: [p.latitude, p.longitude],
          placeId: p.id,
        }))

    const loadPlaces = async () => {
      loadingPlaces.value = true
      try {
        const places = await fetchPlaces()
        allPlaces.value = buildOptions(places || [])
        spotOptions.value = allPlaces.value
      } catch (err) {
        console.error('[HeroSection] Failed to load places:', err)
      } finally {
        loadingPlaces.value = false
      }
    }

    const filterSpots = (input, update) => {
      if (!input) {
        update(() => {
          spotOptions.value = allPlaces.value
        })
        return
      }
      const needle = input.toLowerCase()
      update(() => {
        spotOptions.value = allPlaces.value.filter((opt) =>
          opt.label.toLowerCase().includes(needle)
        )
      })
    }

    const navigateToSpot = () => {
      const spot = selectedSpot.value
      if (!spot || !Array.isArray(spot.coords) || spot.coords.length !== 2) return
      router.push({
        path: '/apanam',
        query: {
          toName: spot.label,
          toLat: String(spot.coords[0]),
          toLng: String(spot.coords[1]),
        },
      })
    }

    onMounted(() => {
      loadPlaces()
    })

    return {
      selectedSpot,
      spotOptions,
      loadingPlaces,
      filterSpots,
      navigateToSpot,
    }
  },

  computed: {
    defaultHeroImage() {
      return 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920'
    },
  },
})
</script>

<style lang="scss" scoped>
$dark-green: #1b4332;
$primary-green: #2e5d3e;
$sage: #b8cfa3;
$mint-bg: #e8f0e0;
$ink: #14241a;
$muted: #5b6b5f;
$border: #e6ebe1;
$white: #ffffff;

.hero-section {
  width: 100%;
  padding: 1.25rem 1.25rem 2rem;
  background: $white;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: clamp(460px, 66vh, 660px);
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 20px 50px rgba(20, 36, 26, 0.18);

  .hero-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 36, 26, 0.45) 0%,
    rgba(20, 36, 26, 0.2) 50%,
    rgba(20, 36, 26, 0.65) 100%
  );
}

.hero-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 5%;
  text-align: center;
}

.hero-content {
  max-width: 820px;
  width: 100%;
}

.hero-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  font-weight: 700;
  color: $white;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
  line-height: 1.05;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);

  em {
    font-style: italic;
    color: $sage;
    font-weight: 700;
  }
}

.hero-description {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba($white, 0.94);
  margin: 0 auto 1.5rem;
  max-width: 560px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);

  @media (max-width: 599px) {
    font-size: 0.9rem;
  }
}

/* Tourist spot search */
.hero-spot-search {
  display: flex;
  align-items: center;
  gap: 4px;
  background: $white;
  border-radius: 999px;
  padding: 6px 6px 6px 18px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  max-width: 540px;
  margin: 0 auto 1.5rem;
}

.spot-search-icon {
  color: $primary-green;
  flex-shrink: 0;
}

.spot-search-input {
  flex: 1;
  text-align: left;

  :deep(.q-field__control) {
    padding: 0 0.5rem;
    min-height: 40px;

    &:before,
    &:after {
      border: none !important;
    }
  }

  :deep(.q-field__native),
  :deep(input) {
    color: $ink;
    font-size: 0.92rem;
    font-weight: 500;

    &::placeholder {
      color: $muted;
      opacity: 0.85;
    }
  }
}

.spot-search-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 20px;
  border-radius: 999px;
  background: $primary-green;
  color: $white;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(46, 93, 62, 0.35);

  &:hover:not(:disabled) {
    background: $dark-green;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
  }
}

/* Mobile */
@media (max-width: 599px) {
  .hero-section {
    padding: 0.75rem 0.75rem 1.5rem;
  }

  .hero-card {
    height: clamp(540px, 78vh, 680px);
    border-radius: 20px;
  }

  .hero-spot-search {
    border-radius: 22px;
    padding: 8px;
    flex-wrap: wrap;
  }

  .spot-search-icon {
    display: none;
  }

  .spot-search-input {
    width: 100%;
    flex: 1 1 100%;

    :deep(.q-field__control) {
      padding: 0 0.85rem;
    }
  }

  .spot-search-cta {
    width: 100%;
    justify-content: center;
    padding: 10px 14px;
  }
}
</style>
