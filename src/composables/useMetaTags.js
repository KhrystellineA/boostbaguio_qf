/**
 * SEO meta-tags composable.
 *
 * Watches the active route and rewrites `document.title`, the meta
 * description, and Open Graph / Twitter card tags from each route's
 * `meta.title` / `meta.description` (declared in src/router/routes.js).
 *
 * Currently NOT mounted anywhere — see AUDIT.md. Wire up in MainLayout.vue
 * setup with `useMetaTags()` for real SEO benefit.
 */
import { watch } from 'vue'
import { useRoute } from 'vue-router'

const BASE_URL = 'https://boost-baguio.web.app'
const DEFAULT_TITLE = 'Boost Baguio - Your Premium City Navigation App'
const DEFAULT_DESCRIPTION =
  'Navigate Baguio City with ease using APANAM jeepney routes, MAYKAN tourist spots, ARAMIDEM events calendar, and AYAN MO nearby places.'
const DEFAULT_IMAGE = '/og-image.png'

/**
 * Composable for managing meta tags dynamically
 * Updates page title, meta description, Open Graph, and Twitter Card tags
 */
export function useMetaTags() {
  const route = useRoute()

  /**
   * Update all meta tags based on route or custom values
   * @param {Object} options - Optional overrides for meta tags
   */
  const updateMetaTags = (options = {}) => {
    const {
      title = route.meta?.title || DEFAULT_TITLE,
      description = route.meta?.description || DEFAULT_DESCRIPTION,
      image = DEFAULT_IMAGE,
      url = BASE_URL + route.path,
      type = 'website',
    } = options

    // Update document title
    document.title = title

    // Update meta description
    updateMetaTag('name', 'description', description)

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:image', image)
    updateMetaTag('property', 'og:url', url)
    updateMetaTag('property', 'og:type', type)
    updateMetaTag('property', 'og:site_name', 'Boost Baguio')

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', title)
    updateMetaTag('name', 'twitter:description', description)
    updateMetaTag('name', 'twitter:image', image)

    // Update canonical URL
    updateCanonicalLink(url)
  }

  /**
   * Helper to update or create a meta tag
   */
  const updateMetaTag = (attributeType, attributeName, content) => {
    let tag = document.querySelector(`meta[${attributeType}="${attributeName}"]`)

    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute(attributeType, attributeName)
      document.head.appendChild(tag)
    }

    tag.setAttribute('content', content)
  }

  /**
   * Update or create canonical link
   */
  const updateCanonicalLink = (href) => {
    let link = document.querySelector('link[rel="canonical"]')

    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }

    link.setAttribute('href', href)
  }

  /**
   * Watch for route changes and update meta tags automatically
   */
  const initRouteWatcher = () => {
    watch(
      () => route.path,
      () => {
        updateMetaTags()
      },
      { immediate: true }
    )
  }

  return {
    updateMetaTags,
    initRouteWatcher,
  }
}
// --rabbit --K
