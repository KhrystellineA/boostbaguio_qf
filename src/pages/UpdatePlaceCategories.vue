<template>
  <q-page class="q-pa-xl">
    <div class="row justify-center">
      <div class="col-12 col-md-8">
        <h4 class="text-h4 q-mb-md">Update Place Categories</h4>
        <p class="text-body1 q-mb-lg">
          This utility will update all existing places in Firestore with proper categories for AYAN
          MO color-coded markers. Must be logged in as admin.
        </p>

        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">Instructions</div>
            <ol class="q-mt-sm">
              <li>Make sure you're logged in as an admin</li>
              <li>Click the button below to update categories</li>
              <li>After completion, go to AYAN MO page to see the new colors</li>
            </ol>
          </q-card-section>
        </q-card>

        <q-btn
          :label="isRunning ? 'Updating...' : 'Update Place Categories'"
          color="primary"
          unelevated
          size="lg"
          @click="updateCategories"
          :disable="isRunning"
          icon="update"
        />

        <div v-if="log.length > 0" class="q-mt-lg">
          <h5 class="text-subtitle1 q-mb-md">Results:</h5>
          <q-card>
            <q-scroll-area style="height: 400px">
              <q-list>
                <q-item
                  v-for="(entry, i) in log"
                  :key="i"
                  :class="
                    entry.type === 'success'
                      ? 'bg-green-1'
                      : entry.type === 'error'
                        ? 'bg-red-1'
                        : ''
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ entry.name }}</q-item-label>
                    <q-item-label caption>{{ entry.detail }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon v-if="entry.type === 'success'" name="check_circle" color="positive" />
                    <q-icon v-else-if="entry.type === 'error'" name="error" color="negative" />
                    <q-icon v-else name="skip_next" color="grey" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'

const categoryMap = {
  'burnham park': 'park-nature',
  'wright park': 'park-nature',
  'mirador park': 'park-nature',
  'botanical garden': 'park-nature',
  'heritage park': 'park-nature',
  'sunset point': 'park-nature',
  'baguio cathedral': 'museum-culture',
  'national museum': 'museum-culture',
  'bencab museum': 'museum-culture',
  'tam-awan village': 'museum-culture',
  'good shepherd': 'museum-culture',
  'lourdes grotto': 'museum-culture',
  'igorot stone kingdom': 'museum-culture',
  'arts village': 'museum-culture',
  'arts gallery': 'museum-culture',
  cemetery: 'museum-culture',
  'sm city baguio': 'shopping',
  'session road': 'shopping',
  'city market': 'shopping',
  'fish market': 'shopping',
  'good taste restaurant': 'restaurant',
  'café by the ruins': 'restaurant',
  'cafe by the ruins': 'restaurant',
  'oh my strawberries': 'restaurant',
  'craft brewery': 'restaurant',
  'volcano island coffee': 'restaurant',
  'pinecone house': 'restaurant',
  'mines view park': 'tourist-spot',
  'the mansion': 'tourist-spot',
  'camp john hay': 'tourist-spot',
  pma: 'tourist-spot',
  "teacher's camp": 'tourist-spot',
  'strawberry farm': 'tourist-spot',
  'country club': 'tourist-spot',
  'mt. pulag': 'tourist-spot',
  'post office': 'tourist-spot',
  'city hall': 'tourist-spot',
  'central school': 'tourist-spot',
  'general hospital': 'tourist-spot',
}

export default defineComponent({
  name: 'UpdatePlaceCategories',

  setup() {
    const $q = useQuasar()
    const isRunning = ref(false)
    const log = ref([])

    const updateCategories = async () => {
      isRunning.value = true
      log.value = []

      try {
        const placesRef = collection(db, 'places')
        const snapshot = await getDocs(placesRef)
        let updated = 0
        let skipped = 0

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const placeName = (data.name || '').toLowerCase().trim()

          let newCategory = null
          for (const [name, category] of Object.entries(categoryMap)) {
            if (placeName.includes(name) || name.includes(placeName)) {
              newCategory = category
              break
            }
          }

          if (!newCategory) {
            skipped++
            log.value.push({
              name: data.name || 'Unknown',
              detail: 'No category match',
              type: 'skip',
            })
            continue
          }

          try {
            const docRef = doc(db, 'places', docSnap.id)
            await updateDoc(docRef, { categories: [newCategory] })
            updated++
            log.value.push({
              name: data.name,
              detail: `Updated to: ${newCategory}`,
              type: 'success',
            })
          } catch (e) {
            log.value.push({ name: data.name, detail: `Error: ${e.message}`, type: 'error' })
          }
        }

        $q.notify({
          type: 'positive',
          message: `✅ Updated ${updated} places! (${skipped} skipped). Refresh AYAN MO page to see colors.`,
          position: 'top',
          timeout: 8000,
        })
      } catch (error) {
        console.error('Error updating categories:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to update. Check console for details.',
          position: 'top',
        })
      } finally {
        isRunning.value = false
      }
    }

    return { isRunning, log, updateCategories }
  },
})
</script>
