# Accessibility & SEO Implementation Guide

## Overview

This document outlines the accessibility (a11y) and search engine optimization (SEO) improvements implemented in the Boost Baguio application.

---

## ✅ Completed Implementations

### 1. Meta Tags & SEO

#### Dynamic Page Meta Tags (`src/router/index.js`)

- Automatic title updates per route
- Meta description updates
- Open Graph tags for social sharing
- Twitter Card tags
- Canonical URLs

#### Static Meta Tags (`index.html`)

```html
<!-- Open Graph / Facebook -->
<meta property="og:title" content="Boost Baguio - Your Premium City Navigation App" />
<meta property="og:description" content="Navigate Baguio City with ease..." />
<meta property="og:image" content="https://boost-baguio.web.app/og-image.png" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Boost Baguio - Your Premium City Navigation App" />
```

#### Route Meta Configuration (`src/router/routes.js`)

Each route now includes:

- `title`: Page title for SEO and browser tabs
- `description`: Meta description for search engines

### 2. PWA Manifest (`src-pwa/manifest.json`)

- Complete app name and description
- App shortcuts for quick actions
- Categories for app stores
- Screenshots configuration
- Proper icon configurations with purposes

### 3. Sitemap & Robots

#### Sitemap (`public/sitemap.xml`)

- All public pages listed
- Priority levels set
- Change frequency defined
- Last modified dates

#### Robots.txt (`public/robots.txt`)

- Crawl rules for search engines
- Sitemap location
- Bot-specific rules

### 4. ARIA Labels & Accessibility

#### Navigation Components

- **AppHeader.vue**: Full ARIA support for desktop and mobile navigation
- **SharedNavbar.vue**: Complete accessibility for navbar components
- **MobileBottomNav.vue**: ARIA labels for all tabs

#### Key ARIA Features Added:

```vue
<!-- Example: Navigation Button -->
<q-btn
  :aria-label="isActiveRoute('/apanam') ? 'Apanam, current page' : 'Navigate to Apanam'"
  :aria-current="isActiveRoute('/apanam') ? 'page' : undefined"
/>

<!-- Example: Menu Items -->
<q-item role="menuitem" aria-label="Go to My Account settings" />

<!-- Example: Icons -->
<q-icon name="route" aria-hidden="true" />
```

#### Skip Link (`src/layouts/MainLayout.vue`)

- Skip to main content functionality
- Visible on keyboard focus
- Proper styling and positioning

### 5. Structured Data (`src/composables/useStructuredData.js`)

Available structured data types:

- **Organization**: Company information
- **WebApplication**: App details and ratings
- **WebSite**: Site search functionality
- **TouristAttraction**: For places in MAYKAN
- **Event**: For events in ARAMIDEM
- **BusRoute**: For jeepney routes in PAGNAAM
- **FAQPage**: For FAQ sections
- **BreadcrumbList**: For navigation breadcrumbs

Usage example:

```javascript
import { useStructuredData } from 'src/composables/useStructuredData'

const { injectStructuredData, getWebApplicationData } = useStructuredData()
injectStructuredData(getWebApplicationData(), 'web-app-data')
```

### 6. Keyboard Navigation

#### Implemented Features:

- All interactive elements are keyboard accessible
- Proper tabindex management
- Enter and Space key handlers for custom buttons
- Focus indicators visible (`:focus-visible`)

#### Key Bindings:

```vue
<div
  role="button"
  tabindex="0"
  @keydown.enter="handleAction"
  @keydown.space.prevent="handleAction"
/>
```

---

## 📋 Accessibility Checklist

### Navigation

- [x] Skip link implemented
- [x] All navigation buttons have ARIA labels
- [x] Current page indicated with `aria-current`
- [x] Mobile menu accessible via keyboard
- [x] Focus management in drawers

### Forms

- [ ] All inputs have associated labels
- [ ] Form errors announced to screen readers
- [ ] Required fields indicated
- [ ] Input validation messages accessible

### Interactive Elements

- [x] Buttons have descriptive labels
- [x] Icons marked as decorative (`aria-hidden`)
- [x] Cards and clickable regions have proper roles
- [ ] Carousels have keyboard navigation
- [ ] Modals trap focus properly

### Content

- [x] Heading hierarchy maintained
- [x] Images have alt text
- [ ] Complex images have descriptions
- [x] Links have descriptive text
- [ ] Tables have proper headers

### Visual

- [x] Focus indicators visible
- [x] Color contrast meets WCAG AA
- [x] Text can be resized
- [ ] Reduced motion support
- [ ] High contrast mode support

---

## 🔍 SEO Checklist

### Technical SEO

- [x] Meta titles unique per page
- [x] Meta descriptions unique per page
- [x] Canonical URLs set
- [x] Sitemap.xml created
- [x] Robots.txt configured
- [x] Open Graph tags implemented
- [x] Twitter Card tags implemented
- [x] Structured data (JSON-LD) added

### Content SEO

- [ ] H1 tag unique per page
- [ ] Heading hierarchy (H1-H6) proper
- [ ] Image alt text descriptive
- [ ] Internal linking structure
- [ ] URL structure clean and descriptive

### Performance

- [ ] Page load time optimized
- [ ] Images lazy loaded
- [ ] Code splitting implemented
- [ ] Service worker configured
- [ ] Core Web Vitals optimized

---

## 🚀 Usage Guidelines

### Adding ARIA Labels to New Components

```vue
<template>
  <!-- Button with ARIA -->
  <q-btn icon="add" aria-label="Add new item" @click="addItem" />

  <!-- Input with label -->
  <q-input v-model="search" label="Search places" aria-label="Search for places in Baguio" />

  <!-- Card as button -->
  <div
    role="button"
    tabindex="0"
    aria-label="View details for {{ place.name }}"
    @click="viewDetails"
    @keydown.enter="viewDetails"
    @keydown.space.prevent="viewDetails"
  >
    <!-- Card content -->
  </div>
</template>
```

### Adding Structured Data to Pages

```javascript
// In a page component setup
import { useStructuredData } from 'src/composables/useStructuredData'
import { onMounted, onUnmounted } from 'vue'

setup() {
  const { injectStructuredData, removeStructuredData, getTouristAttractionData } = useStructuredData()

  const place = {
    name: 'Burnham Park',
    description: 'A popular urban park in Baguio City',
    image: '/images/burnham-park.jpg',
    location: { lat: 16.4023, lng: 120.5960 }
  }

  onMounted(() => {
    injectStructuredData(getTouristAttractionData(place), 'place-data')
  })

  onUnmounted(() => {
    removeStructuredData('place-data')
  })
}
```

### Testing Accessibility

#### Manual Testing:

1. **Keyboard Navigation**: Tab through all interactive elements
2. **Screen Reader**: Test with NVDA (Windows), VoiceOver (Mac), or TalkBack (Mobile)
3. **Focus Indicators**: Ensure focus is visible on all elements
4. **Skip Link**: Press Tab to see skip link appear

#### Automated Testing:

```bash
# Run accessibility tests
pnpm test:a11y

# Lighthouse accessibility audit
# Open Chrome DevTools > Lighthouse > Select Accessibility
```

#### Tools:

- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance & accessibility

---

## 📁 File Locations

| File                                   | Purpose                             |
| -------------------------------------- | ----------------------------------- |
| `src/router/routes.js`                 | Page meta tags (title, description) |
| `src/router/index.js`                  | Dynamic meta tag updates            |
| `index.html`                           | Static SEO meta tags                |
| `src-pwa/manifest.json`                | PWA configuration                   |
| `public/sitemap.xml`                   | Sitemap for search engines          |
| `public/robots.txt`                    | Crawler instructions                |
| `src/components/AppHeader.vue`         | Header with ARIA labels             |
| `src/components/SharedNavbar.vue`      | Navbar with ARIA labels             |
| `src/components/MobileBottomNav.vue`   | Mobile nav with ARIA labels         |
| `src/layouts/MainLayout.vue`           | Skip link implementation            |
| `src/composables/useMetaTags.js`       | Meta tag management                 |
| `src/composables/useStructuredData.js` | JSON-LD structured data             |
| `src/css/accessibility.scss`           | Accessibility styles                |
| `src/utils/accessibility.js`           | Accessibility utilities             |

---

## 🎯 Next Steps

### Priority 1: Page-Specific ARIA Labels

Add ARIA labels to remaining pages:

- IndexPage components (HeroSection, FeaturesSection, GallerySection, FAQSection)
- ApanamPage (forms, maps, route cards)
- PagnaamPage (search, route cards, dialogs)
- MaykanPage (carousel, filters, place cards)
- AramidemPage (calendar, event cards)
- AyanMoPage (map, filters, place cards)
- AuthPage (login/signup forms)
- AccountPage (settings, preferences)

### Priority 2: Enhanced Keyboard Navigation

- Implement arrow key navigation for carousels
- Add keyboard shortcuts for common actions
- Improve focus management in modals/dialogs

### Priority 3: Screen Reader Testing

- Test with NVDA, JAWS, VoiceOver
- Verify all dynamic content is announced
- Ensure form errors are properly communicated

### Priority 4: Performance Optimization

- Implement lazy loading for images
- Optimize bundle size
- Improve Core Web Vitals scores

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/docs/documents.html)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
