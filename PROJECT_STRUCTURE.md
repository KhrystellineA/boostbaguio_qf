# 📁 BOOST-BAGUIO Project Structure

Complete documentation of the project's file structure, including file purposes, relationships, and connections.

---

## 🏗️ Project Overview

**Boost Baguio** is a Progressive Web App (PWA) for navigating Baguio City with the following features:

| Feature      | Description                       |
| ------------ | --------------------------------- |
| **APANAM**   | Point-to-point jeepney navigation |
| **PAGNAAM**  | Jeepney routes directory          |
| **MAYKAN**   | Tourist spots & places discovery  |
| **ARAMIDEM** | Events calendar                   |
| **AYAN MO**  | Nearby places finder              |

---

## 📊 Tech Stack

| Category               | Technology                          |
| ---------------------- | ----------------------------------- |
| **Frontend Framework** | Vue.js 3.5.22                       |
| **UI Framework**       | Quasar 2.16.0                       |
| **State Management**   | Pinia 3.0.4                         |
| **Routing**            | Vue Router 4.0.0                    |
| **Backend/BaaS**       | Firebase (Auth, Firestore, Storage) |
| **Build Tool**         | Vite (via Quasar)                   |
| **Deployment**         | Vercel                              |
| **Package Manager**    | pnpm                                |
| **Testing**            | Vitest 4.0.18 + Vue Testing Library |
| **Image CDN**          | Cloudinary                          |
| **Maps**               | Leaflet 1.9.4                       |
| **Charts**             | Chart.js 4.5.1                      |
| **PWA**                | Workbox 7.4.0                       |

---

## 📂 Root Directory Structure

```
BOOST-BAGUIO/
├── 📄 Configuration Files
├── 📄 Documentation Files
├── 📄 Setup/Seed Scripts
├── 📂 src/                 # Main source code
├── 📂 public/              # Static assets
├── 📂 src-pwa/             # PWA-specific configuration
├── 📂 .github/             # GitHub workflows & documentation
├── 📂 .husky/              # Git hooks
├── 📂 .quasar/             # Quasar build artifacts (auto-generated)
├── 📂 coverage/            # Test coverage reports (auto-generated)
└── 📂 dist/                # Production build output (auto-generated)
```

---

## 📄 Root-Level Files

### Configuration Files

| File                         | Purpose & Contents                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`package.json`**           | ⚙️ Project metadata, dependencies, and npm scripts. Defines the project as an ESM module. Contains all dependencies (Vue, Quasar, Firebase, Pinia, testing libraries) and scripts for dev, build, test, lint, and format.       |
| **`quasar.config.js`**       | ⚙️ Main Quasar framework configuration. Defines boot files order, CSS files, build settings (chunk optimization, code splitting), PWA manifest settings, dev server configuration (port 9200), and Quasar framework plugins.    |
| **`firebase.json`**          | ⚙️ Firebase services configuration. Specifies Firestore security rules and indexes paths, hosting settings (public folder: `dist/pwa`), SPA rewrites, and cache-control headers for different file types.                       |
| **`firestore.rules`**        | 🔒 Firestore security rules. Defines read/write permissions for all collections including `users`, `admins`, `events`, `places`, `routes`, `jeepneys`, `photos`, `analytics`, and `logs`. Implements role-based access control. |
| **`firestore.indexes.json`** | ⚙️ Firestore composite indexes configuration for optimized queries.                                                                                                                                                             |
| **`.firebaserc`**            | ⚙️ Firebase project alias configuration. Maps default to `boost-baguio` project.                                                                                                                                                |
| **`vercel.json`**            | ⚙️ Vercel deployment configuration. Sets SPA rewrites (`/**` → `/index.html`), build command (`quasar build`), output directory (`dist/spa`), and install command (`pnpm install`).                                             |
| **`vite.config.js`**         | ⚙️ Vite bundler configuration. Configures path aliases (`@` → `./src`), Vue plugin, and server settings.                                                                                                                        |
| **`vitest.config.js`**       | ⚙️ Vitest testing framework configuration. Sets JSDOM environment, coverage settings, test patterns, and path aliases.                                                                                                          |
| **`eslint.config.js`**       | 🔧 ESLint flat configuration for Vue 3, Quasar, and Prettier. Defines linting rules for `.vue`, `.js`, `.cjs`, `.mjs` files in `src/` directories.                                                                              |
| **`.prettierrc`**            | 🔧 Prettier code formatter settings: single quotes, no semicolons, trailing commas (ES5), 100 char print width, 2 space tabs.                                                                                                   |
| **`jsconfig.json`**          | ⚙️ JavaScript path aliases configuration. Extends `.quasar/tsconfig.json` for IDE support.                                                                                                                                      |
| **`postcss.config.js`**      | ⚙️ PostCSS configuration for CSS processing with Autoprefixer.                                                                                                                                                                  |
| **`.gitignore`**             | 🚫 Git ignore patterns: `node_modules/`, `dist/`, `.env`, `.quasar/`, `coverage/`, `*.log`, `.DS_Store`, etc.                                                                                                                   |
| **`.gitmessage`**            | 📝 Git commit message template for standardized commit messages.                                                                                                                                                                |
| **`index.html`**             | 📄 Main HTML entry point. Contains meta tags, SEO configuration, Open Graph tags, Twitter Cards, canonical URL, theme color, favicons, and preconnect links to Firebase and Google Fonts.                                       |

### Documentation Files

| File                             | Purpose & Contents                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **`README.md`**                  | 📖 Project overview, installation instructions, build commands, and quick start guide.                                                        |
| **`DATABASE_SETUP.md`**          | 📖 Complete Firestore database setup guide. Includes collection schemas, sample data scripts, feature-to-collection mapping, and admin setup. |
| **`DEPLOYMENT_INSTRUCTIONS.md`** | 📖 Step-by-step deployment guide for Vercel and Firebase. Covers custom claims setup, security rules deployment, and admin re-login process.  |
| **`DEVELOPER_WORKFLOW.md`**      | 📖 Developer guide covering npm scripts, git workflow, commit conventions, testing strategies, and debugging tips.                            |
| **`ACCESSIBILITY_SEO_GUIDE.md`** | 📖 Accessibility and SEO implementation guide. Documents ARIA labels, structured data (JSON-LD), meta tags, and WCAG compliance.              |
| **`IMAGE_MANAGEMENT_GUIDE.md`**  | 📖 Image management between admin and user pages. Documents Cloudinary integration and Firestore `pagePhotos` collection usage.               |
| **`IMAGE_ARCHITECTURE.md`**      | 📖 Image architecture documentation covering upload flows, optimization strategies, and CDN usage.                                            |
| **`ROUTE_GENERATION_GUIDE.md`**  | 📖 **Route generation & visualization guide**. Documents OSRM integration, Leaflet maps, fuzzy matching, and route saving to Firestore.       |
| **`TESTING_GUIDE.md`**           | 📖 Testing guide for unit and component tests using Vitest and Vue Testing Library.                                                           |
| **`.github/CICD_GUIDE.md`**      | 📖 CI/CD setup guide for GitHub Actions. Documents workflow stages, secrets setup, and deployment environments.                               |

### Setup/Seed Scripts

| File                               | Purpose & Contents                                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **`setup-database.js`**            | 🗄️ Database setup script. Creates sample events, places, routes, and photos in Firestore for development/testing. |
| **`seed-admin-users.js`**          | 🗄️ Seeds admin user documents in Firestore.                                                                       |
| **`seed-jeepney-routes.js`**       | 🗄️ Seeds sample jeepney routes data to Firestore.                                                                 |
| **`seed-jeepney-routes-admin.js`** | 🗄️ Seeds admin data for jeepney routes management.                                                                |
| **`set-admin-custom-claims.js`**   | 🔐 Sets Firebase Custom Claims for admin users. Required for admin dashboard access and role-based permissions.   |
| **`create-admin-documents.js`**    | 🗄️ Creates admin user documents in Firestore.                                                                     |
| **`cleanup-duplicate-events.js`**  | 🧹 Cleanup script for removing duplicate events from Firestore.                                                   |
| **`update-places-categories.js`**  | 🗄️ Updates places categories in Firestore.                                                                        |

### Auto-Generated Folders

| Folder              | Purpose                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **`dist/`**         | 🏗️ Production build output (generated by `pnpm build`). Contains optimized, minified assets ready for deployment to Vercel. |
| **`coverage/`**     | 📊 Test coverage reports (generated by `pnpm test:coverage`). Contains HTML and JSON coverage data from Vitest.             |
| **`.quasar/`**      | ⚙️ Quasar build artifacts and TypeScript configuration (auto-generated by Quasar).                                          |
| **`node_modules/`** | 📦 Dependencies installed by pnpm.                                                                                          |

---

## 📂 src/ Directory - Main Source Code

```
src/
├── App.vue                    # Root Vue component
├── assets/                    # Static image assets
├── boot/                      # Boot files (run before app mount)
├── components/                # Reusable Vue components
├── composables/               # Vue 3 composable functions
├── css/                       # Global stylesheets
├── layouts/                   # Layout components
├── pages/                     # Page components (routes)
├── router/                    # Vue Router configuration
├── stores/                    # Pinia state stores
├── test/                      # Test utilities and setup
└── utils/                     # Utility functions
```

---

### 📂 src/assets/ (42 files)

**Purpose:** Static image assets for the application.

| File/Pattern         | Purpose                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Logo files**       | `BOOST BAGUIO LOGO.svg`, `boost baguio logo small.svg`, `logo.png`, `quasar-logo-vertical.svg` - App branding and logos                                     |
| **Icons**            | `favicon.ico`, `favicon.svg`, `favicon-96x96.png`, `apple-touch-icon.png`, `site.webmanifest`, PWA icons (192x192, 512x512) - App icons and manifest        |
| **Baguio landmarks** | `baguio.png`, `burnham.png`, `cathedral.png`, `session.png`, `sm.png`, `wright park.png`, `igorot park.png`, `the mansion.png` - Location images for places |
| **Event images**     | `panagbenga-1/2/3.png`, `fireworks display.png`, `pride march.png` - Event placeholder images                                                               |
| **Category icons**   | `bakery.png`, `cafe.png`, `jeepney.png`, `strawberry.png` - Category/feature icons                                                                          |
| **General images**   | `mountains.png`, `colorful houses LT.png`, `streetphotog.png` - Gallery and section images                                                                  |
| **Numbered images**  | `1.png`, `2.png`, `30.png`, `44.png`, `456.png`, `img.png`, `img1.png` - Miscellaneous images                                                               |

---

### 📂 src/boot/ (6 files)

**Purpose:** Boot files run before the Vue app is mounted. They initialize services and configure the app.

| File                   | Purpose & Contents                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`pinia.js`**         | 🏪 Initializes Pinia store and registers it with the Vue app. Must run first before other boot files that use stores.                                                           |
| **`firebase.js`**      | 🔥 Initializes Firebase app and services (Auth, Firestore with 50MB offline persistence, Storage). Validates environment variables and exports services for use across the app. |
| **`router-guards.js`** | 🛡️ Ensures Firebase Auth is ready before app mounts. Waits for auth state to be determined before rendering.                                                                    |
| **`errorHandler.js`**  | ⚠️ Global error handler configuration. Sets up Vue app-level error catching.                                                                                                    |
| **`offline.js`**       | 📴 Offline mode initialization. Configures offline detection and caching (currently disabled in config).                                                                        |
| **`.gitkeep`**         | 📝 Placeholder to keep directory in git.                                                                                                                                        |

**Boot Order** (from `quasar.config.js`): `['pinia', 'firebase', 'router-guards', 'errorHandler']`

---

### 📂 src/components/ (14 files + 2 subdirectories)

**Purpose:** Reusable Vue components used across pages.

#### Root Components

| File                         | Purpose & Contents                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`App.vue`**                | 🎯 Root Vue component. Contains `<router-view>` for page rendering. Sets document title and global styles (Roboto font, smooth scrolling, custom scrollbar). |
| **`AppHeader.vue`**          | 📰 Main application header with navigation links and branding.                                                                                               |
| **`AppBreadcrumbs.vue`**     | 🍞 Breadcrumb navigation component for hierarchical page navigation.                                                                                         |
| **`SharedNavbar.vue`**       | 🧭 Shared navbar component with bento-glassmorphism design. Includes desktop navigation, mobile drawer, profile dropdown, and ARIA labels for accessibility. |
| **`MobileBottomNav.vue`**    | 📱 Mobile bottom navigation bar for easy thumb navigation.                                                                                                   |
| **`BackToTopBtn.vue`**       | ⬆️ Scroll-to-top floating action button. Appears after scrolling down.                                                                                       |
| **`OfflineIndicator.vue`**   | 📴 Shows offline status indicator when connection is lost.                                                                                                   |
| **`SaveForOfflineBtn.vue`**  | 💾 Button to save content for offline access.                                                                                                                |
| **`LazyImage.vue`**          | 🖼️ Lazy-loading image component with Cloudinary optimization, Intersection Observer, srcset support, and fallback images.                                    |
| **`PineSkeletonLoader.vue`** | 💀 Skeleton loading component with bento design. Shows placeholder while content loads. Includes test file.                                                  |
| **`ErrorBoundary.vue`**      | 🛡️ Error boundary component with fallback UI, error details display, retry functionality, and error monitoring integration. Includes test file.              |
| **`ProfileEditor.vue`**      | 👤 User profile editing component with form validation.                                                                                                      |
| **`RouteMap.vue`**           | 🗺️ **Reusable Leaflet map component**. Displays route polylines, waypoint markers, distance/duration stats. Used in admin and public pages.                  |

#### 📂 src/components/admin/ (14 files)

**Purpose:** Admin dashboard management components for CRUD operations.

| File                               | Purpose & Contents                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AdminHeader.vue`**              | 📰 Admin dashboard header with notifications, profile menu, and admin branding.                                                                                           |
| **`AdminSidebar.vue`**             | 🧭 Admin sidebar navigation with role-based menu visibility. Shows/hides items based on admin permissions.                                                                |
| **`AdminStats.vue`**               | 📊 Dashboard statistics cards displaying counts for routes, places, events, users.                                                                                        |
| **`JeepneyManagement.vue`**        | 🚌 CRUD interface for jeepney routes. List, create, edit, delete jeepney data. **Includes route preview dialog with map visualization.**                                  |
| **`JeepneyOptionsManagement.vue`** | 🔧 Management for jeepney variants/options (colors, sizes, etc.).                                                                                                         |
| **`RoutesManagement.vue`**         | 🗺️ CRUD interface for routes. Manage point-to-point and jeepney routes.                                                                                                   |
| **`RouteFormDialog.vue`**          | 📝 **Complete rewrite with route generation flow**. Dialog form for creating/editing jeepney routes with OSRM route generation, map preview, and confirm/save workflow.   |
| **`PlacesManagement.vue`**         | 📍 CRUD interface for tourist spots and places. Manage MAYKAN/APANAM/AYAN MO locations.                                                                                   |
| **`EventsManagement.vue`**         | 📅 CRUD interface for events. Manage ARAMIDEM events calendar.                                             |
| **`PhotosManagement.vue`**         | 📸 Image management for page photos. Cloudinary integration for upload, optimize, delete.                  |
| **`AdminsManagement.vue`**         | 👥 Admin user management (super-admin only). Add/remove admins, assign roles.                              |
| **`AnalyticsManagement.vue`**      | 📈 Analytics dashboard and reports. View search analytics, saves, visits, foot traffic.                    |
| **`ActivityLogsManagement.vue`**   | 📜 Activity logs viewer. Track user and admin actions.                                                     |

#### 📂 src/components/Home/ (8 files)

**Purpose:** Homepage section components that compose the landing page.

| File                      | Purpose & Contents                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------- |
| **`HeroSection.vue`**     | 🦸 Hero section with location search, geolocation button, and navigation CTAs.        |
| **`FeaturesSection.vue`** | ⭐ Features showcase section highlighting APANAM, PAGNAAM, MAYKAN, ARAMIDEM, AYAN MO. |
| **`AboutSection.vue`**    | ℹ️ About Baguio section with city information and history.                            |
| **`GallerySection.vue`**  | 🖼️ Photo gallery section showcasing Baguio landmarks.                                 |
| **`PartnersSection.vue`** | 🤝 Partners/sponsors section.                                                         |
| **`GuideSection.vue`**    | 📖 How-to guide section for using the app.                                            |
| **`FAQSection.vue`**      | ❓ Frequently asked questions accordion.                                              |
| **`FooterSection.vue`**   | 🦶 Footer with links, contact form, social media, and copyright.                      |

---

### 📂 src/composables/ (12 files)

**Purpose:** Vue 3 composable functions for reusable logic. Follows the composition API pattern.

| File                       | Purpose & Contents                                                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`useFirebase.js`**       | 🔥 Firebase services composable. Exports `useFirebase()`, `useAuth()`, `useFirestore()`, `useStorage()` for easy Firebase access in components. Central Firebase service locator.                           |
| **`useAdminClaims.js`**    | 🔐 Firebase Custom Claims composable. Functions: `checkIsAdmin()`, `checkIsSuperAdmin()`, `getAdminRole()`, `getPermissions()`, `getIdTokenClaims()`. Used for role-based UI rendering. Includes test file. |
| **`useAdminDashboard.js`** | 📊 Admin dashboard logic. Fetches stats, notifications, admin data. Used by `AdminDashboard.vue`.                                                                                                           |
| **`useIndexPage.js`**      | 🏠 IndexPage logic. Location search, geolocation handling, hero image loading. Separates logic from view.                                                                                                   |
| **`useBaguioPlaces.js`**   | 📍 Default Baguio places data. 30 tourist locations with coordinates, descriptions, operating hours, categories. Fallback data when Firestore is unavailable.                                               |
| **`useLazyImage.js`**      | 🖼️ Lazy image loading logic. Intersection Observer setup, loading states, error handling.                                                                                                                   |
| **`useMetaTags.js`**       | 🏷️ Dynamic meta tag management for SEO. Updates title, description, Open Graph, Twitter Cards per route.                                                                                                    |
| **`useStructuredData.js`** | 📊 JSON-LD structured data injection for SEO. Generates schemas for Organization, WebApplication, TouristAttraction, Event, BusRoute, FAQPage, BreadcrumbList.                                              |
| **`useOfflineMode.js`**    | 📴 Offline mode functionality. Cache management, queue pending actions, sync when online.                                                                                                                   |
| **`usePullToRefresh.js`**  | 🔄 Pull-to-refresh gesture handling for mobile. Touch event listeners and refresh callbacks.                                                                                                                |
| **`useRouteGeneration.js`**| 🗺️ **Route generation logic**. Fuzzy matching for place names, OSRM API integration, route coordinate generation. Used for generating road-following jeepney routes.                                        |

---

### 📂 src/css/ (3 files)

**Purpose:** Global stylesheets defining the app's visual design.

| File                        | Purpose & Contents                                                                                                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`app.sass`**              | 🎨 Main application styles. Defines **Bento-Glassmorphism** design system with color palette, glassmorphism cards, bento grids, badges, gradients, animations (`fadeInUp`, `scaleIn`, `shimmer`), and Quasar component overrides. |
| **`accessibility.scss`**    | ♿ Accessibility styles. Includes screen reader utilities (`.sr-only`), skip link, focus indicators, high contrast support, reduced motion support, and WCAG compliance styles.                                                   |
| **`quasar.variables.sass`** | ⚙️ Quasar framework variable overrides. Customizes Quasar's default colors, fonts, spacing.                                                                                                                                       |

---

### 📂 src/layouts/ (2 files)

**Purpose:** Layout components that wrap pages. Define the app's structural shell.

| File                  | Purpose & Contents                                                                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`MainLayout.vue`**  | 🏗️ Main application layout with `<q-layout>`. Includes `SharedNavbar`, page container, scroll-to-top button, and global contact dialog. Has skip link for accessibility and mobile touch optimizations. Used by public pages. |
| **`BlankLayout.vue`** | 📄 Minimal layout without navigation. Used for admin pages and auth pages.                                                                                                                                                    |

---

### 📂 src/pages/ (12 files + 1 subdirectory)

**Purpose:** Page components mapped to routes. Each file represents a unique URL path.

#### Root Pages

| File                         | Purpose & Contents                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`IndexPage.vue`**          | 🏠 Homepage. Composes `HeroSection`, `FeaturesSection`, `AboutSection`, `GallerySection`, `PartnersSection`, `FAQSection`, `FooterSection`. Uses `useIndexPage` composable for location search logic. |
| **`ApanamPage.vue`**         | 🚌 Point-to-point navigation page. Shows jeepney routes and directions. **Integrated with RouteMap component for route visualization.**                                                               |
| **`PagnaamPage.vue`**        | 🗺️ Jeepney routes directory page. Lists all available jeepney routes. **Integrated with RouteMap component for interactive map display in dialog.**                                                  |
| **`MaykanPage.vue`**         | 📍 Tourist spots discovery page. Browse and search places in Baguio.                                                                                                                                  |
| **`AramidemPage.vue`**       | 📅 Events calendar page. Upcoming and ongoing events in Baguio.                                                                                                                                       |
| **`AyanMoPage.vue`**         | 📍 Nearby places finder page. Uses geolocation to show places near user.                                                                                                                              |
| **`AuthPage.vue`**           | 🔐 Authentication page with login/signup tabs. Beautiful animated background with bento design.                                                                                                       |
| **`AccountPage.vue`**        | 👤 User account settings page. Requires authentication. Profile management, password change.                                                                                                          |
| **`SavedRoutesPage.vue`**    | 💾 Saved routes page. Requires premium subscription. View saved routes.                                                                                                                               |
| **`OfflinePage.vue`**        | 📴 Offline mode management page. Requires premium. Manage offline content.                                                                                                                            |
| **`ErrorNotFound.vue`**      | ❌ 404 page for undefined routes. Shown when route doesn't exist.                                                                                                                                     |

#### 📂 src/pages/Admin/ (4 files)

**Purpose:** Admin dashboard pages. Protected by admin authentication guard.

| File                              | Purpose & Contents                                                                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`AdminDashboard.vue`**          | 📊 Main admin dashboard. Dynamically loads management components based on active menu. Shows stats, recent activity, and provides access to all CRUD interfaces. |
| **`AdminLogin.vue`**              | 🔐 Admin login page. Separate from user auth.                                                                                                                    |
| **`AdminSignup.vue`**             | 📝 Admin signup page. Self-registration for new admins (requires approval).                                                                                      |
| **`AdminDashboard-ORIGINAL.vue`** | 💾 Original version (backup/reference).                                                                                                                          |

---

### 📂 src/router/ (2 files)

**Purpose:** Vue Router configuration. Defines all app routes and navigation guards.

| File            | Purpose & Contents                                                                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`routes.js`** | 🗺️ Route definitions. Defines all routes with meta tags (`title`, `description`, `requiresAuth`, `requiresAdmin`, `requiresPremium`). Organized under `MainLayout` (public pages) and `BlankLayout` (admin pages).                              |
| **`index.js`**  | 🛡️ Router initialization. Creates router with history mode, sets up global guards (auth, premium, admin checks), and implements `afterEach` hooks for dynamic meta tag updates (title, description, Open Graph, Twitter Cards, canonical URLs). |

**Route Structure:**

| Path            | Page              | Meta                          |
| --------------- | ----------------- | ----------------------------- |
| `/`             | `IndexPage`       | Home                          |
| `/apanam`       | `ApanamPage`      | P2P Navigation                |
| `/pagnaam`      | `PagnaamPage`     | Jeepney Routes                |
| `/maykan`       | `MaykanPage`      | Tourist Spots                 |
| `/aramidem`     | `AramidemPage`    | Events                        |
| `/ayanmo`       | `AyanMoPage`      | Near Me                       |
| `/login`        | `AuthPage`        | Login/Signup                  |
| `/account`      | `AccountPage`     | requiresAuth                  |
| `/saved-routes` | `SavedRoutesPage` | requiresAuth, requiresPremium |
| `/offline`      | `OfflinePage`     | requiresAuth, requiresPremium |
| `/admin/*`      | `AdminDashboard`  | requiresAdmin                 |

---

### 📂 src/stores/ (2 files)

**Purpose:** Pinia state management stores. Centralized application state.

| File                     | Purpose & Contents                                                                                                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`user-store.js`**      | 👤 User authentication and premium status store. Manages: user state, auth actions (`signIn`, `signUp`, `logout`), premium status, profile updates, password changes. Includes comprehensive JSDoc documentation. Has test file. |
| **`user-store.test.js`** | ✅ Unit tests for user store. Tests auth actions, state mutations, and getters.                                                                                                                                                  |

---

### 📂 src/utils/ (10 files)

**Purpose:** Utility functions and helpers. Pure functions for common operations.

| File                     | Purpose & Contents                                                                                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`cloudinary.js`**      | ☁️ Cloudinary image optimization utilities. Functions: `getOptimizedImageUrl()`, `getSrcSet()`, `getUploadUrl()`, `uploadOptimizedImage()`, `lazyLoadImage()`, `preloadImage()`. Includes `ImagePresets` for common use cases (hero, thumbnail, gallery, avatar, product). |
| **`offline.js`**         | 📴 Offline detection and management. Provides: online/offline status, connection quality monitoring, offline queue management, event listeners, screen reader announcements.                                                                                               |
| **`offlineCache.js`**    | 💾 Offline caching utilities. Manage IndexedDB and Cache API for offline content.                                                                                                                                                                                          |
| **`errorHandler.js`**    | ⚠️ Error handling utilities with formatted error messages. User-friendly error messages from Firebase errors.                                                                                                                                                              |
| **`errorMonitoring.js`** | 📊 Error monitoring and logging to Firebase. Track errors in Firestore `error_logs` collection.                                                                                                                                                                            |
| **`activityLogger.js`**  | 📜 Activity logging utility. Log user actions to `activity_logs` collection.                                                                                                                                                                                               |
| **`analytics.js`**       | 📈 Analytics tracking utilities. Track searches, saves, visits, foot traffic to respective analytics collections.                                                                                                                                                          |
| **`validation.js`**      | ✅ Form validation utilities. Email, password, required field validators.                                                                                                                                                                                                  |
| **`accessibility.js`**   | ♿ Accessibility helper functions. Focus management, ARIA announcements, keyboard navigation.                                                                                                                                                                              |
| **`performance.js`**     | ⚡ Performance monitoring utilities. Measure page load times, component render times.                                                                                                                                                                                      |

---

### 📂 src/test/ (2 files)

**Purpose:** Test configuration and utilities for Vitest.

| File           | Purpose & Contents                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`setup.js`** | ⚙️ Test setup file. Configures Vue Testing Library, Vitest globals, and global mocks (Firebase, router, stores). |
| **`utils.js`** | 🧰 Test utility functions. Helper functions for rendering components, mocking services, and assertions.          |

---

## 📂 public/ Directory

**Purpose:** Static assets served directly without processing.

```
public/
├── favicon.ico                 # Browser favicon
├── robots.txt                  # Search engine crawler instructions
├── sitemap.xml                 # Sitemap for SEO (lists all public pages)
├── icons/                      # Favicon and PWA icons (15 files)
│   ├── apple-icon-*.png        # Apple touch icons (4 sizes)
│   ├── favicon-*.png           # Favicons (4 sizes)
│   ├── icon-*.png              # PWA icons (5 sizes)
│   └── ms-icon-144x144.png     # Windows tile icon
└── images/
    └── placeholder-image.png   # Default placeholder for LazyImage component
```

| File                               | Purpose                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| **`robots.txt`**                   | 🤖 Search engine crawler instructions. Allows all public pages, disallows admin paths. |
| **`sitemap.xml`**                  | 🗺️ Sitemap for SEO. Lists all public pages for search engine indexing.                 |
| **`icons/`**                       | 🎨 Favicon and PWA icons in multiple sizes for different devices and browsers.         |
| **`images/placeholder-image.png`** | 🖼️ Default placeholder image shown while lazy images load or on error.                 |

---

## 📂 src-pwa/ Directory (PWA Configuration)

**Purpose:** Progressive Web App specific configuration and service worker.

| File                             | Purpose & Contents                                                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`manifest.json`**              | 📱 PWA manifest. Defines app name, description, icons, shortcuts (Navigate, Spots, Events), categories, screenshots, and display mode (`standalone`). Enables install-to-home-screen functionality. |
| **`register-service-worker.js`** | 🔧 Service worker registration with lifecycle hooks (ready, updated, offline). Registers the custom service worker on app mount.                                                                    |
| **`custom-service-worker.js`**   | 🛡️ Custom service worker with Workbox caching strategies. Defines caching rules for static assets, API calls, images. Enables offline functionality.                                                |

---

## 📂 .github/ Directory

**Purpose:** GitHub Actions CI/CD configuration and documentation.

```
.github/
├── workflows/
│   └── ci.yml              # GitHub Actions CI/CD pipeline
└── CICD_GUIDE.md          # CI/CD setup documentation
```

### CI/CD Pipeline (`ci.yml`)

| Stage          | Purpose                                             |
| -------------- | --------------------------------------------------- |
| **Lint Job**   | Runs ESLint + Prettier check to ensure code quality |
| **Test Job**   | Runs Vitest unit tests with coverage reporting      |
| **Build Job**  | Runs `quasar build` to create production build      |
| **Deploy Job** | Deploys to Vercel (only on `main` branch)           |

---

## 📂 .husky/ Directory

**Purpose:** Git hooks for pre-commit checks and automation.

| File             | Purpose                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **`pre-commit`** | Runs lint-staged before commits (ESLint, Prettier, tests). Ensures code quality before committing. |
| **`_/`**         | Husky internal files (auto-generated).                                                             |

---

## 🔑 Key Architectural Patterns

### 1. **Composable Pattern** 🎯

Logic is extracted into composables (e.g., `useIndexPage`, `useAdminClaims`) for reusability and testability. Components import composables instead of containing business logic.

### 2. **Bento-Glassmorphism Design** 🎨

Custom design system with glassmorphism cards, bento grids, soft gradients, and smooth animations defined in `app.sass`.

### 3. **Role-Based Access Control** 🔐

| Role                    | Permissions                                                 |
| ----------------------- | ----------------------------------------------------------- |
| **Public users**        | Read access to events, places, routes                       |
| **Authenticated users** | Can save places/routes, access premium features             |
| **Admins**              | CRUD access to content (checked via Firebase Custom Claims) |
| **Super Admins**        | Full system access including admin management               |

### 4. **Offline-First Architecture** 📴

- Firestore with 50MB persistent cache
- Service worker with Workbox caching strategies
- Offline queue for pending actions
- Connection quality monitoring

### 5. **Image Optimization** ☁️

- Cloudinary integration for automatic optimization
- `LazyImage` component with Intersection Observer
- Responsive srcset generation
- Multiple presets for different use cases

### 6. **Accessibility-First** ♿

- ARIA labels throughout components
- Skip link for keyboard navigation
- Focus indicators
- Screen reader announcements
- High contrast and reduced motion support

### 7. **SEO Optimization** 🔍

- Dynamic meta tags per route
- Structured data (JSON-LD)
- Open Graph and Twitter Cards
- Sitemap and robots.txt
- Canonical URLs

---

## 📊 Firestore Database Structure

**Collections:**

| Collection               | Purpose                               |
| ------------------------ | ------------------------------------- |
| `users`                  | User accounts and premium status      |
| `admins`                 | Admin user documents and roles        |
| `events`                 | ARAMIDEM events data                  |
| `places`                 | MAYKAN/APANAM/AYAN MO places          |
| `routes`                 | PAGNAAM routes                        |
| `jeepneys`               | Jeepney variants and details          |
| `photos`                 | Gallery photos                        |
| `pagePhotos`             | Page-specific images (hero, sections) |
| `analytics_searches`     | Search analytics tracking             |
| `analytics_saves`        | Save analytics tracking               |
| `analytics_visits`       | Visit analytics tracking              |
| `analytics_foot_traffic` | Location tracking analytics           |
| `error_logs`             | Error monitoring and logging          |
| `activity_logs`          | User activity tracking                |
| `contactMessages`        | Contact form submissions              |

---

## 🔗 File Relationships & Connections

### Core Dependencies

```
index.html
    └── App.vue (entry point)
            └── router/index.js
                    └── router/routes.js
                            └── pages/*.vue
                                    ├── layouts/*.vue
                                    ├── components/*.vue
                                    └── composables/*.js

boot/firebase.js → provides Firebase services to entire app
boot/pinia.js → provides stores to entire app
```

### Component Hierarchy

```
MainLayout.vue
├── SharedNavbar.vue
├── Page Component (e.g., IndexPage.vue)
│   ├── HeroSection.vue
│   ├── FeaturesSection.vue
│   ├── AboutSection.vue
│   └── ...
└── BackToTopBtn.vue

AdminDashboard.vue
├── AdminSidebar.vue
├── AdminHeader.vue
└── Management Components (e.g., PlacesManagement.vue)
```

### Data Flow

```
User Action → Component Event → Composable → Firebase/Firestore → Store Update → UI Re-render
```

### Image Flow

```
Admin uploads → PhotosManagement.vue → Cloudinary → Optimized URLs → Firestore pagePhotos → LazyImage.vue → User sees optimized image
```

---

## 📝 Summary

The **BOOST-BAGUIO** project is a well-structured, production-ready Vue 3 + Quasar application with:

- ✅ **Clean architecture** following Vue 3 best practices
- ✅ **Comprehensive testing** with Vitest and Vue Testing Library
- ✅ **Full accessibility** support (WCAG compliant)
- ✅ **SEO optimized** with dynamic meta tags and structured data
- ✅ **PWA capabilities** for offline usage
- ✅ **Role-based admin system** with Firebase Custom Claims
- ✅ **Modern design** with bento-glassmorphism aesthetic
- ✅ **Image optimization** via Cloudinary
- ✅ **CI/CD pipeline** with GitHub Actions and Vercel
- ✅ **Route generation & visualization** with OSRM integration and Leaflet maps

The codebase is well-documented with extensive guides for database setup, deployment, accessibility, image management, developer workflow, and route generation.

---

## 🗺️ Route Generation Feature

### Overview

The route generation feature allows admins to generate road-following jeepney routes using the free OSRM (Open Source Routing Machine) API.

### How It Works

```
Admin fills jeepney form
  ↓
Click "Generate Route" button
  ↓
Fetch places from Firestore
  ↓
Fuzzy-match endPoint and touristSpots against places
  ↓
Build waypoints: Terminal → Tourist Spots → End Point
  ↓
Call OSRM API: router.project-osrm.org
  ↓
Receive route geometry (coordinates array)
  ↓
Preview route on map with waypoints
  ↓
Confirm & Save to Firestore
```

### Key Files

| File                               | Purpose                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `src/composables/useRouteGeneration.js` | Core route generation logic with fuzzy matching and OSRM API integration                        |
| `src/components/RouteMap.vue`      | Reusable Leaflet map component for displaying routes                                                 |
| `src/components/admin/RouteFormDialog.vue` | Admin dialog with route generation workflow                                                   |
| `src/components/admin/JeepneyManagement.vue` | Jeepney CRUD with route preview dialog                                                        |
| `src/pages/PagnaamPage.vue`        | Public jeepney directory with route map display                                                      |
| `src/pages/ApanamPage.vue`         | Point-to-point navigation with route visualization                                                   |

### Firestore Structure

**jeepneys** collection now includes:

```javascript
{
  // Existing fields
  jeepName: "Tuba A",
  terminalLocation: "Shagem St",
  terminalLat: 16.4136,
  terminalLng: 120.5934,
  endPoint: "Asin Rd",
  touristSpotsServiced: ["Burnham Park", "Igorot Park"],
  
  // NEW route fields
  routePoints: [[120.5934, 16.4136], [120.5940, 16.4140], ...], // [lng, lat] pairs
  routeDistance: 5420,  // meters
  routeDuration: 1200,  // seconds
}
```

### Coordinate System

**IMPORTANT**: Different systems use different coordinate orders:

- **OSRM/GeoJSON**: `[longitude, latitude]` (lng, lat)
- **Leaflet**: `[latitude, longitude]` (lat, lng)
- **Firestore**: Store as `[longitude, latitude]` (OSRM format)

The RouteMap component automatically converts between formats.

### Fuzzy Matching

The fuzzy matching algorithm matches place names with:
1. Exact match (case-insensitive)
2. Partial match (name contains target or vice versa)
3. Normalized match (removes special characters)

Example: "BenCab Museum" → "Bencab Museum" ✓

### Tech Stack

- **OSRM Public API**: Free routing engine (router.project-osrm.org)
- **Leaflet**: Interactive maps (leafletjs.com)
- **OpenStreetMap**: Map tiles
- **Firestore**: Places collection for fuzzy matching

### Admin Workflow

1. Navigate to Admin Dashboard → Jeepney Management
2. Click "Add Jeepney" or edit existing
3. Fill in terminal location and coordinates
4. Enter end point name
5. Select tourist spots serviced
6. Click "Generate Route"
7. Review route on map preview
8. Click "Confirm & Save Route"
9. Click "Create/Update" to save to Firestore

### Public Display

Routes are displayed on:
- **PagnaamPage**: Full route map in dialog when clicking a jeepney card
- **ApanamPage**: Route overlay for navigation
- **JeepneyManagement**: Route preview column with map dialog

---

**Last Updated**: March 16, 2026
**Version**: 2.0.0 (with Route Generation)
