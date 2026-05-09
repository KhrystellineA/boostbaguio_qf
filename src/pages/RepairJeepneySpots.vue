<!--
  Admin-only data-repair utility (route /repair-jeepney-spots). Walks every
  jeepney in Firestore and resolves its `touristSpotsServiced` names against
  the `places` collection so the in-app fuzzy matcher works reliably.
  Run-once style page — no sidebar link points to it; reach it by typing the
  URL while logged in as an admin.
-->
<template>
  <q-page class="q-pa-xl">
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <h4 class="text-h4 q-mb-md">Repair Jeepney Tourist Spots</h4>
        <p class="text-body1 q-mb-md">
          Scans every jeepney document and rewrites <code>touristSpotsServiced</code>:
        </p>
        <ul class="q-mb-lg">
          <li>
            Replaces the corrupted replacement character (<code>�</code>) with a straight apostrophe
            (e.g. <code>People�s Park</code> → <code>People's Park</code>).
          </li>
          <li>Renames <code>Teachers Camp</code> → <code>Teacher's Camp</code>.</li>
          <li>
            Removes the following names (unmatched in the <code>places</code> collection):
            <code>{{ REMOVE_LIST.join(', ') }}</code
            >.
          </li>
          <li>Deduplicates the resulting array and only writes if it actually changed.</li>
        </ul>

        <q-btn
          :label="isRunning ? 'Repairing...' : 'Repair Jeepney Tourist Spots'"
          color="primary"
          unelevated
          size="lg"
          icon="build"
          @click="runRepair"
          :disable="isRunning || isClearing"
        />

        <q-btn
          :label="isClearing ? 'Clearing...' : 'Clear Cached Jeepney Routes'"
          color="orange-9"
          outline
          size="lg"
          icon="refresh"
          class="q-ml-md"
          @click="clearCachedRoutes"
          :disable="isRunning || isClearing"
        />
        <p class="text-caption q-mt-sm">
          Clearing wipes every jeepney's <code>routeCoordinates</code> so APANAM regenerates
          polylines on its next visit (needed after changing waypoint order).
        </p>

        <div v-if="summary" class="q-mt-lg">
          <q-banner class="bg-green-1 text-green-10">
            Scanned {{ summary.total }} jeepneys — updated {{ summary.updated }}, unchanged
            {{ summary.unchanged }}, errors {{ summary.errors }}.
          </q-banner>
        </div>

        <div v-if="log.length > 0" class="q-mt-lg">
          <h5 class="text-subtitle1 q-mb-md">Changes:</h5>
          <q-card>
            <q-scroll-area style="height: 500px">
              <q-list>
                <q-item
                  v-for="(entry, i) in log"
                  :key="i"
                  :class="
                    entry.type === 'updated'
                      ? 'bg-green-1'
                      : entry.type === 'error'
                        ? 'bg-red-1'
                        : ''
                  "
                >
                  <q-item-section>
                    <q-item-label>{{ entry.jeepName }}</q-item-label>
                    <q-item-label caption>{{ entry.detail }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon v-if="entry.type === 'updated'" name="check_circle" color="positive" />
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
import { collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore'

const REMOVE_LIST = [
  'igorot park',
  'igorot garden',
  'baguio museum (nearby)',
  'baguio city public market',
  'upper crystal cave',
  'baguio general hospital view deck',
]

const RENAME_MAP = {
  'teachers camp': "Teacher's Camp",
}

function repairName(raw) {
  if (typeof raw !== 'string') return null
  // Fix encoding corruption: U+FFFD replacement char → straight apostrophe.
  // Also handle any stray curly apostrophes.
  const fixed = raw.replace(/�/g, "'").replace(/[‘’]/g, "'").trim()
  const key = fixed.toLowerCase()
  if (REMOVE_LIST.includes(key)) return null
  if (RENAME_MAP[key]) return RENAME_MAP[key]
  return fixed
}

export default defineComponent({
  name: 'RepairJeepneySpots',

  setup() {
    const $q = useQuasar()
    const isRunning = ref(false)
    const isClearing = ref(false)
    const log = ref([])
    const summary = ref(null)

    const clearCachedRoutes = async () => {
      isClearing.value = true
      log.value = []
      summary.value = null

      let total = 0
      let cleared = 0
      let skipped = 0
      let errors = 0

      try {
        const snapshot = await getDocs(collection(db, 'jeepneys'))
        total = snapshot.size

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const jeepName = data.jeepName || docSnap.id
          const hasCache = Array.isArray(data.routeCoordinates) && data.routeCoordinates.length > 0

          if (!hasCache) {
            skipped++
            continue
          }

          try {
            await updateDoc(doc(db, 'jeepneys', docSnap.id), {
              routeCoordinates: deleteField(),
              routeDistance: deleteField(),
              routeDuration: deleteField(),
            })
            cleared++
            log.value.push({
              jeepName,
              type: 'updated',
              detail: 'Cleared cached routeCoordinates',
            })
          } catch (e) {
            errors++
            log.value.push({
              jeepName,
              type: 'error',
              detail: `Clear failed: ${e.message}`,
            })
          }
        }

        summary.value = { total, updated: cleared, unchanged: skipped, errors }
        $q.notify({
          type: 'positive',
          message: `Cleared ${cleared} of ${total} jeepneys. Open APANAM to regenerate.`,
          position: 'top',
          timeout: 6000,
        })
      } catch (error) {
        console.error('[RepairJeepneySpots] Clear failed:', error)
        $q.notify({
          type: 'negative',
          message: `Clear failed: ${error.message}`,
          position: 'top',
        })
      } finally {
        isClearing.value = false
      }
    }

    const runRepair = async () => {
      isRunning.value = true
      log.value = []
      summary.value = null

      let total = 0
      let updated = 0
      let unchanged = 0
      let errors = 0

      try {
        const snapshot = await getDocs(collection(db, 'jeepneys'))
        total = snapshot.size

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data()
          const jeepName = data.jeepName || docSnap.id
          const before = Array.isArray(data.touristSpotsServiced) ? data.touristSpotsServiced : []

          const after = []
          const seen = new Set()
          for (const raw of before) {
            const next = repairName(raw)
            if (next && !seen.has(next)) {
              seen.add(next)
              after.push(next)
            }
          }

          const beforeStr = JSON.stringify(before)
          const afterStr = JSON.stringify(after)
          if (beforeStr === afterStr) {
            unchanged++
            continue
          }

          try {
            await updateDoc(doc(db, 'jeepneys', docSnap.id), {
              touristSpotsServiced: after,
            })
            updated++
            log.value.push({
              jeepName,
              type: 'updated',
              detail: `${beforeStr}  →  ${afterStr}`,
            })
          } catch (e) {
            errors++
            log.value.push({
              jeepName,
              type: 'error',
              detail: `Write failed: ${e.message}`,
            })
          }
        }

        summary.value = { total, updated, unchanged, errors }
        $q.notify({
          type: 'positive',
          message: `Done — updated ${updated} of ${total} jeepneys.`,
          position: 'top',
          timeout: 6000,
        })
      } catch (error) {
        console.error('[RepairJeepneySpots] Scan failed:', error)
        $q.notify({
          type: 'negative',
          message: `Scan failed: ${error.message}`,
          position: 'top',
        })
      } finally {
        isRunning.value = false
      }
    }

    return {
      isRunning,
      isClearing,
      log,
      summary,
      runRepair,
      clearCachedRoutes,
      REMOVE_LIST,
    }
  },
})
</script>
