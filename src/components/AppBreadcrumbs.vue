<template>
  <nav class="breadcrumbs-nav" aria-label="Breadcrumb">
    <q-breadcrumbs separator=">" class="breadcrumbs">
      <!-- Home Link -->
      <q-breadcrumbs-el label="Home" to="/" icon="home" aria-label="Go to homepage" />

      <!-- Dynamic Breadcrumbs -->
      <template v-for="(crumb, index) in crumbs" :key="index">
        <q-breadcrumbs-el
          v-if="index < crumbs.length - 1"
          :label="crumb.label"
          :to="crumb.to"
          :icon="crumb.icon"
        />
        <!-- Current Page (last item, not clickable) -->
        <q-breadcrumbs-el
          v-else
          :label="crumb.label"
          :icon="crumb.icon"
          class="breadcrumbs-current"
          aria-current="page"
        />
      </template>
    </q-breadcrumbs>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'AppBreadcrumbs',

  props: {
    // Override automatic breadcrumbs with custom ones
    customCrumbs: {
      type: Array,
      default: null,
    },
  },

  setup(props) {
    const route = useRoute()

    // Generate breadcrumbs from route
    const crumbs = computed(() => {
      if (props.customCrumbs) {
        return props.customCrumbs
      }

      const pathSegments = route.path.split('/').filter(Boolean)
      const breadcrumbs = []

      let cumulativePath = ''

      pathSegments.forEach((segment) => {
        cumulativePath += `/${segment}`

        // Convert segment to readable label
        const label = segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        // Map common routes to icons
        const iconMap = {
          admin: 'admin_panel_settings',
          dashboard: 'dashboard',
          places: 'place',
          events: 'event',
          routes: 'route',
          jeepneys: 'directions_bus',
          analytics: 'analytics',
          settings: 'settings',
          profile: 'person',
        }

        breadcrumbs.push({
          label,
          to: cumulativePath,
          icon: iconMap[segment.toLowerCase()] || null,
        })
      })

      return breadcrumbs
    })

    return {
      crumbs,
    }
  },
}
</script>

<style lang="sass" scoped>
.breadcrumbs-nav
  padding: 8px 0
  background: transparent

.breadcrumbs
  padding: 8px 16px
  background: rgba(46, 93, 62, 0.05)
  border-radius: 8px

  :deep(.q-breadcrumbs__separator)
    color: #9e9e9e
    font-weight: 400
    margin: 0 8px

  :deep(.q-breadcrumbs__el)
    color: #2E5D3E
    text-decoration: none
    font-weight: 500
    transition: all 0.2s ease
    padding: 4px 8px
    border-radius: 4px

    &:hover
      background: rgba(46, 93, 62, 0.1)
      color: #1b4332

    &.q-router-link-exact-active
      color: #1b4332
      font-weight: 600

.breadcrumbs-current
  color: #1b4332 !important
  font-weight: 600 !important
  cursor: default

  &:hover
    background: transparent !important

// Dark mode support
.body--dark .breadcrumbs
  background: rgba(46, 93, 62, 0.15)

  :deep(.q-breadcrumbs__el)
    color: #81c784

    &:hover
      background: rgba(129, 199, 132, 0.15)

  :deep(.q-breadcrumbs__separator)
    color: #757575

  .breadcrumbs-current
    color: #a5d6a7 !important

// Mobile responsiveness
@media (max-width: 599px)
  .breadcrumbs
    padding: 8px 12px
    font-size: 13px

    :deep(.q-breadcrumbs__el)
      padding: 2px 4px

    :deep(.q-breadcrumbs__separator)
      margin: 0 4px
</style>
