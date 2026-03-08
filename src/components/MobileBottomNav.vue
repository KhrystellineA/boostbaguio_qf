<template>
  <div
    class="mobile-bottom-nav"
    v-if="showOnMobile"
    role="navigation"
    aria-label="Mobile bottom navigation"
  >
    <q-tabs
      v-model="activeTab"
      align="justify"
      class="bg-primary text-white"
      active-color="amber"
      indicator-color="transparent"
      aria-label="Main navigation tabs"
    >
      <q-route-tab name="home" to="/" label="Home" icon="home" aria-label="Go to Home page" />
      <q-route-tab
        name="apanam"
        to="/apanam"
        label="APANAM"
        icon="directions_bus"
        aria-label="Go to APANAM - Point to Point Navigation"
      />
      <q-route-tab
        name="ayanmo"
        to="/ayanmo"
        label="AYAN MO"
        icon="my_location"
        aria-label="Go to AYAN MO - Nearby Places Search"
      />
      <q-route-tab
        name="maykan"
        to="/maykan"
        label="MAYKAN"
        icon="restaurant"
        aria-label="Go to MAYKAN - Tourist Spots and Places"
      />
      <q-route-tab
        name="account"
        to="/account"
        label="Account"
        icon="person"
        aria-label="Go to My Account"
      />
    </q-tabs>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'MobileBottomNav',
  setup() {
    const $q = useQuasar()
    const activeTab = ref('home')

    const showOnMobile = computed(() => {
      return $q.platform.is.mobile || $q.screen.lt.md
    })

    return {
      activeTab,
      showOnMobile,
    }
  },
})
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.q-tab) {
  min-height: 60px !important;
  padding: 8px 4px !important;
}

:deep(.q-tab__label) {
  font-size: 10px !important;
  font-weight: 500;
}

:deep(.q-tab__icon) {
  font-size: 24px !important;
}
</style>
