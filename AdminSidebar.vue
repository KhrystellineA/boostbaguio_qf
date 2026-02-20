<template>
  <q-drawer :model-value="modelValue" @update:model-value="emit('update:modelValue')" show-if-above bordered :width="250">
    <q-scroll-area class="fit">
      <q-list padding>
        <q-item-label header>Navigation</q-item-label>

        <q-item v-for="item in filteredMenu" :key="item.label" clickable v-ripple :to="item.to" exact>
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>

      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  userRole: {
    type: String,
    default: 'viewer', // e.g., 'admin', 'editor', 'viewer'
  },
});

const emit = defineEmits(['update:modelValue']);

const menuItems = ref([
  { label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard', roles: ['viewer', 'editor', 'admin'] },
  { label: 'Routes', icon: 'route', to: '/admin/routes', roles: ['editor', 'admin'] },
  { label: 'Places', icon: 'place', to: '/admin/places', roles: ['editor', 'admin'] },
  { label: 'Users', icon: 'people', to: '/admin/users', roles: ['admin'] },
]);

const filteredMenu = computed(() => {
  return menuItems.value.filter(item => item.roles.includes(props.userRole));
});
</script>

<style lang="scss" scoped>
.q-item.q-router-link--active {
  color: $primary;
  background-color: rgba($primary, 0.1);

  .q-icon {
    color: $primary;
  }
}
</style>