# Boost Baguio — Architecture & UI Map

This is the "where does the code for X live?" cheat sheet. Read it once and you'll know how a click in the UI flows down to the files that handle it.

The app is a Vue 3 + Quasar PWA backed by Firebase (Auth, Firestore, Storage, Cloudinary for images). Maps use Leaflet on top of CartoDB Voyager tiles. Routing uses public OSRM. Geocoding uses public OSM Nominatim.

---

## High-level layout

```
src/
├── App.vue                Root <router-view> shell
├── boot/                  Quasar boot files: run before the app mounts
├── layouts/               Page-level chrome (navbar/footer wrappers)
├── pages/                 One file per top-level route in router/routes.js
│   └── admin/             Admin login + dashboard pages
├── components/            Reusable Vue components
│   ├── home/              Landing-page sections (Hero, About, FAQ, etc.)
│   ├── admin/             Admin-only modules (PlacesManagement, JeepneyManagement, …)
│   └── shared/            Cross-page UI pieces
├── composables/           Vue 3 composition functions (useX) — all reusable logic
├── stores/                Pinia state (currently just user-store)
├── router/                Vue Router config + auth guards
├── utils/                 Framework-free helpers (validation, errorHandler, …)
├── css/                   Global styles
└── test/                  Vitest setup + helpers
```

Plus:

```
scripts/                   Standalone Node scripts (audit, etc.) — NOT bundled with the app
src-pwa/                   Service worker source for the PWA
firestore.rules            Security rules for the Firestore collections
firebase.json              Firebase project config
```

---

## The five user-facing features

The product is built around five named features. Each one is a single page; each page reuses the same composables for the heavy lifting (geocoding, routing, place lookup).

### 1. APANAM — Point-to-point jeepney navigation

**Path:** `/apanam` → `src/pages/ApanamPage.vue`

**What the user sees:**

- Hero section, then a FROM/TO form. FROM is auto-detected via GPS on mount and prefilled.
- "Find routes" → a list of single-ride and double-ride jeepney options ranked by total walking distance.
- Selecting an option shows: a step-by-step "How to Get There" panel with color-coded avatars; a Leaflet map with the full journey drawn; a 5-marker color-coded route (start → board ride 1 → alight ride 1 → board ride 2 → drop-off ride 2).

**Color legend (matches between map markers and instruction step avatars):**

| Step | Action              | Color                           |
| ---- | ------------------- | ------------------------------- |
| 1    | Walk to terminal 1  | green (`positive`)              |
| 2    | Ride jeepney 1      | blue (`blue-8` / `--q-primary`) |
| 3    | Walk to terminal 2  | yellow (`warning`)              |
| 4    | Ride jeepney 2      | purple (`accent`)               |
| 5    | Get off at drop-off | red (`negative`)                |

**Key files:**

- `src/composables/useGeolocation.js` — `getCurrentLocation()` (browser GPS)
- `src/composables/useGeocoding.js` — `searchLocations()` + `reverseGeocode()` (OSM Nominatim)
- `src/composables/useJeepneyRouteMatching.js` — `isNearRoute()` (distance from a point to a polyline) and the matching helpers
- `src/composables/useRouteGeneration.js` — `fetchPlaces()`, `fuzzyMatch()`, `callOSRM()`, `buildOSRMUrl()`
- `src/composables/useWalkingDirections.js` — OSRM-foot routing for the dashed walking legs

### 2. PAGNAAM — Jeepney routes directory

**Path:** `/pagnaam` → `src/pages/PagnaamPage.vue`

**What the user sees:** searchable grid of every active jeepney; clicking a card opens a maximised dialog with route info on the left (terminals, fares, operating hours, "How to identify this jeepney", a color-coded **Map Legend**, and a numbered Route Stops list) and a `<RouteMap>` on the right.

**How route stops are positioned:** the jeepney doc only stores `terminalLat/Lng` and a list of tourist-spot names. The page uses `fuzzyMatch()` against the curated `places` collection first; for unmatched names it falls back to OSM Nominatim (`searchLocations`). Results are cached per session in `stopsCoordCache`. See the `resolveStopCoords` and `buildStopsFromRoute` functions.

**Key files:**

- `src/components/RouteMap.vue` — the shared Leaflet map used here and in admin/JeepneyManagement
- `src/composables/useGeocoding.js`, `src/composables/useRouteGeneration.js`

### 3. MAYKAN — Tourist spots & places

**Path:** `/maykan` → `src/pages/MaykanPage.vue`

**What the user sees:** category-filtered grid of places; clicking a card opens a place-detail modal with image, address, hours, contact, "Get Directions" (routes to APANAM with `toName/toLat/toLng`), and "Save Place" (writes to `users/{uid}/savedPlaces` in Firestore).

**Where saved places go:** the bookmark is per-user; AyanMo's popup mirrors the same shape so saving from either page hits the same subcollection.

### 4. ARAMIDEM — Events calendar

**Path:** `/aramidem` → `src/pages/AramidemPage.vue`

**What the user sees:** monthly calendar grid + list of upcoming events; click an event to view details with "Get Directions" routing to APANAM.

### 5. AYAN MO — Nearby places finder

**Path:** `/ayanmo` → `src/pages/AyanMoPage.vue`

**What the user sees:** Leaflet map (full-page, CartoDB Voyager tiles), with a floating "bento" card on the right that holds:

1. **FROM input** — auto-detects GPS on mount; prepend GPS button mirrors APANAM's behavior (`gps_fixed` when auto-detected, `gps_not_fixed` when typed); typing or clicking the search icon geocodes a different location.
2. **Multi-select category chips** (All, Tourist Spots, Restaurants, Parks, Museums, Shopping). Clicking adds/removes a category from `selectedCategories`. "All" is mutually exclusive with the others; if you deselect everything the filter falls back to `['all']`.
3. **Search Radius** chips (500 m / 1 km / 2 km / 5 km).
4. **Free-text search bar** (filters the list by name/category/description).
5. **Nearby Places list** with hoverable, clickable rows that open a place-detail popup mirroring Maykan's.

**Map markers** show a hover tooltip with the place name. Click the marker → popup → opens the same place-detail dialog. Markers are color-coded by category.

---

## Admin dashboard

**Path:** `/admin/dashboard` → `src/pages/admin/AdminDashboard.vue` (gated by router guards in `src/router/index.js`).

**Sidebar menu** (from `src/components/admin/AdminSidebar.vue`):

| Menu item         | Component                        | Purpose                                      |
| ----------------- | -------------------------------- | -------------------------------------------- |
| Dashboard         | (inline in `AdminDashboard.vue`) | Stat cards + analytics, see below            |
| Routes / Jeepneys | `JeepneyManagement.vue`          | CRUD jeepneys, view routes, **OSRM compare** |
| Places            | `PlacesManagement.vue`           | CRUD tourist spots, **Request to feature**   |
| Events            | `EventsManagement.vue`           | CRUD events, **Request to feature**          |
| Photos            | `PhotosManagement.vue`           | Manage hero/gallery/guide images             |
| Admins            | `AdminsManagement.vue`           | CRUD admin accounts (super-admin only)       |
| Activity Logs     | `ActivityLogsManagement.vue`     | Read-only audit trail                        |

### Dashboard view

Lives directly inside `AdminDashboard.vue` (no separate Analytics tab — that was merged in).

- **Top:** four stat cards from `AdminStats.vue` (Routes, Places, Events, Admins). Each card is a **toggle filter** for the analytics block below — click to add/remove that category from `activeCategories`. Default `['places']`; if you ever empty the selection it falls back to Places.
- **Below cards:** `AnalyticsManagement.vue` rendered with `:categories="activeCategories"`. Real analytics (foot-traffic map, popular places, peak hours, charts, engagement metrics) only render when Places is in the selection. For Routes/Events/Admins, a dashed-bordered "Not yet tracked" placeholder is shown — the engagement events for those categories aren't instrumented yet.

### Header (super-admin notification bell)

`src/components/admin/AdminHeader.vue` shows a notifications bell. For super-admins only, the bell is a live dropdown of pending feature-requests (see workflow below).

### Feature-request workflow

A places-admin or events-admin asks the super-admin to mark a specific place/event as `featured`.

**Submit side** — buttons in PlacesManagement / EventsManagement row actions:

- An amber `auto_awesome` icon button, only visible when `!isSuperAdmin && !row.featured`.
- Calls `submitFeatureRequest({ targetType, targetId, targetName, ... })` in `src/composables/useFeatureRequests.js`.
- Refuses to create a duplicate if a `pending` request for the same target already exists.

**Receive side** — the super-admin's notifications dropdown:

- `useAdminDashboard.js` subscribes via `watchPendingRequests()` only when `role === 'super_admin'`.
- `AdminHeader.vue`'s dropdown lists each pending request with green ✓ / red ✕ inline buttons.
- `AdminDashboard.vue` listens to `@approve-request` / `@reject-request` and calls `approveFeatureRequest` (sets `featured: true` on the target + marks request approved) or `rejectFeatureRequest`.

**Storage** — Firestore collection `featureRequests`. Schema and rules documented at the top of `src/composables/useFeatureRequests.js` and in `firestore.rules` (search "feature requests").

### Route compare / regenerate (admin)

`src/components/admin/RouteCompareDialog.vue`, opened from the red `compare_arrows` button in JeepneyManagement's Route column.

Draws the stored polyline (solid blue) on top of a freshly-fetched OSRM driving route (dashed red) through the same waypoints, with side-panel drift % and waypoint list. Click "Apply OSRM route" to overwrite the stored polyline; click "Keep current route" to bail. If a jeepney has no stored polyline yet, the dialog flips into "Generate Route" mode and the same button writes the OSRM polyline as the new stored route.

Polylines are persisted as `[{ lng, lat }, ...]` objects (NOT nested arrays — Firestore rejects those). See the `coordsForStorage`/`normalizeRouteCoords` pair in `src/pages/ApanamPage.vue` for the read/write helpers.

### Standalone audit script

`scripts/audit-jeepney-routes.js` — a Node CLI that pulls every jeepney from Firestore and flags structural red flags in the polyline (sharp U-turns, long jumps, self-intersections, length-vs-straightline ratio, OSRM drift). Runs via `npm run audit:routes` or `npm run audit:routes:osrm`. Triage worst-first; fix flagged jeepneys via the Compare dialog.

---

## Cross-cutting infrastructure

### Boot files (`src/boot/`)

Run by Quasar in the order listed in `quasar.config.js > boot`.

| File               | Purpose                                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pinia.js`         | Initialize Pinia (used by `stores/user-store.js`)                                                                                                                            |
| `firebase.js`      | Initialize Firebase app, Auth, Firestore (with persistent local cache, 50 MB), Storage. Pulls config from `VITE_FIREBASE_*` env vars.                                        |
| `router-guards.js` | Global Vue Router beforeEach: enforces `requiresAuth`, `requiresAdmin`, `requiresGuest`, `requiresPremium` from each route's `meta`. Source of truth: `src/router/index.js`. |
| `errorHandler.js`  | Global Vue error handler — logs to `error_logs` collection.                                                                                                                  |
| `offline.js`       | (Currently disabled in `quasar.config.js`.)                                                                                                                                  |

### Composables (`src/composables/`)

| File                         | Used by                                                               | Purpose                                                                                           |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `useGeolocation.js`          | ApanamPage, AyanMoPage                                                | `getCurrentLocation()` — browser GPS Promise                                                      |
| `useGeocoding.js`            | ApanamPage, AyanMoPage, PagnaamPage                                   | `searchLocations()`, `reverseGeocode()` (OSM Nominatim, scoped to Baguio)                         |
| `useRouteGeneration.js`      | ApanamPage, PagnaamPage, RouteCompareDialog                           | `fetchPlaces()`, `fuzzyMatch()`, `callOSRM()`, `buildOSRMUrl()`, `generateRoute()`                |
| `useJeepneyRouteMatching.js` | ApanamPage                                                            | `isNearRoute()` (point-to-polyline distance), `loadJeepneys()`, `calculateDistance()` (haversine) |
| `useWalkingDirections.js`    | ApanamPage                                                            | OSRM foot routing for dashed walking legs, `formatDistance()`, `formatDuration()`                 |
| `useFeatureRequests.js`      | PlacesManagement, EventsManagement, useAdminDashboard, AdminDashboard | Submit / watch / approve / reject feature requests (super-admin → places/events admins)           |
| `useAdminClaims.js`          | router-guards, useAdminDashboard                                      | `checkIsAdmin()`, `getAdminRole()`, `getPermissions()` — reads from `admins/{uid}` Firestore doc  |
| `useAdminDashboard.js`       | AdminDashboard                                                        | Loads admin profile, stats, and (super-admin only) subscribes to feature-request notifications    |
| `useFirebase.js`             | (legacy)                                                              | Re-exports the boot Firebase services with a Vue-3-composable shape                               |
| `useOfflineMode.js`          | (currently unused in pages — premium feature placeholder)             | online/offline detection + queue                                                                  |

### Utils (`src/utils/`)

| File                            | Used by                                        | Purpose                                                                                                  |
| ------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `validation.js`                 | Most admin forms                               | Reusable validators (`required`, `minLength`, `email`, `coordinates`, etc.)                              |
| `errorHandler.js`               | Most pages                                     | `withRetry()`, `getErrorMessage()`, `isOnline()`                                                         |
| `errorMonitoring.js`            | Admin pages, ApanamPage                        | `logActionFailure()` → `error_logs` Firestore collection                                                 |
| `analytics.js`                  | AnalyticsManagement, IndexPage hero            | `getAnalyticsSummary()`, `getRealTimeTraffic()`, `getPopularPlaces()` over the `analytics_*` collections |
| `activityLogger.js`             | EventsManagement, PlacesManagement, AdminLogin | `logActivity()`, `getRecentActivityLogs()` over `activity_logs`                                          |
| `accessibility.js`              | Admin forms                                    | `announceActionResult()` — screen-reader live region                                                     |
| `cloudinary.js`                 | All image-uploading components                 | Cloudinary upload + URL transforms                                                                       |
| `offline.js`, `offlineCache.js` | (premium feature placeholder)                  | Offline detection + cache management                                                                     |
| `performance.js`                | (orphan — see audit)                           | `debounce()`, `throttle()`, etc.                                                                         |

### Stores (`src/stores/`)

| File            | Purpose                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `user-store.js` | Pinia store for the currently-authenticated user. `isAuthenticated`, `isPremium`, `userData`. Mostly read; mutations happen via Firebase Auth. |

### Layouts (`src/layouts/`)

| File              | Used by          | Purpose                                                                                     |
| ----------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `MainLayout.vue`  | All public pages | SharedNavbar + page slot + global footer + Contact-Us dialog + service-worker update prompt |
| `BlankLayout.vue` | Admin pages      | No chrome — admin pages render their own header/sidebar                                     |

### Pages (`src/pages/`)

User-facing:

- `IndexPage.vue` — landing page
- `ApanamPage.vue`, `MaykanPage.vue`, `AramidemPage.vue`, `PagnaamPage.vue`, `AyanMoPage.vue` — the five named features (see above)
- `AccountPage.vue` — user profile editing (uses `ProfileEditor.vue`)
- `SavedRoutesPage.vue`, `OfflinePage.vue` — premium-only
- `AuthPage.vue` — public login/signup
- `RepairJeepneySpots.vue` — admin-only utility page (tourist-spot data repair)
- `UpdatePlaceCategories.vue` — admin-only data migration helper
- `ErrorNotFound.vue` — 404

Admin:

- `pages/admin/AdminLogin.vue`, `AdminSignup.vue`, `AdminDashboard.vue`

---

## Data model (Firestore)

Major collections:

| Collection                                                                            | Written by                      | Read rules         |
| ------------------------------------------------------------------------------------- | ------------------------------- | ------------------ |
| `users/{uid}`                                                                         | Auth signup                     | Owner + admins     |
| `users/{uid}/savedPlaces/{placeId}`                                                   | Owner                           | Owner              |
| `users/{uid}/savedRoutes/{routeId}`                                                   | Owner                           | Owner              |
| `admins/{uid}`                                                                        | Super-admin (or self at signup) | Owner + admins     |
| `places/{id}`                                                                         | places-admin                    | Public             |
| `events/{id}`                                                                         | events-admin                    | Public             |
| `jeepneys/{id}`                                                                       | routes-admin                    | Public             |
| `routes/{id}`                                                                         | routes-admin                    | Public             |
| `featureRequests/{id}`                                                                | Any admin (status=pending)      | Any admin          |
| `photos`, `pagePhotos`                                                                | Any admin                       | Public             |
| `analytics_searches`, `analytics_saves`, `analytics_visits`, `analytics_foot_traffic` | Any auth user (writes)          | Admin only (reads) |
| `error_logs`                                                                          | Anyone (writes)                 | Admin only (reads) |
| `activity_logs`                                                                       | Any auth user                   | Admin only         |
| `contactMessages`                                                                     | Anyone (validated)              | Admin only         |

Full security rules: `firestore.rules`.

---

## External services

| Service           | Used for                                           | Auth                                         |
| ----------------- | -------------------------------------------------- | -------------------------------------------- |
| Firebase Auth     | User & admin login                                 | Email/password                               |
| Firestore         | Primary database (offline cache enabled)           | Same                                         |
| Firebase Storage  | (currently unused; image uploads go to Cloudinary) | —                                            |
| Cloudinary        | Image uploads + transforms                         | Unsigned upload preset (`VITE_CLOUDINARY_*`) |
| OSM Nominatim     | Geocoding & reverse geocoding                      | None (public, 1 req/sec polite limit)        |
| OSRM project demo | Driving + foot routing                             | None (public; rate-limited)                  |
| CartoDB Voyager   | Map tiles                                          | Free tier, attribution required              |

---

## Local development cheat sheet

| Want to…               | Do this                                                         |
| ---------------------- | --------------------------------------------------------------- |
| Run dev server         | `pnpm dev` (or `npm run dev`)                                   |
| Lint everything        | `pnpm lint`                                                     |
| Audit jeepney routes   | `npm run audit:routes` (offline) or `npm run audit:routes:osrm` |
| Deploy Firestore rules | `firebase deploy --only firestore:rules`                        |
| Build for production   | `pnpm build` (output: `dist/pwa/`)                              |

---

## Known follow-ups

See `AUDIT.md` for the current list of cleanup candidates and orphan files.
