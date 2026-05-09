# Codebase Audit

A snapshot of dead/orphan code, structural smells, and cleanup candidates. Each item lists a recommendation; nothing here has been auto-deleted because some of these may be intentional placeholders for upcoming features.

---

## Orphan composables (no imports anywhere)

These files exist in `src/composables/` but nothing in the codebase imports them. Either delete them or wire them up.

| File                   | Notes                                                                                                                                               | Recommendation                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `useIndexPage.js`      | Looks like a refactor that was never landed — no other file imports it.                                                                             | Either move IndexPage's setup logic into it (the original intent) or delete.            |
| `useLazyImage.js`      | Lazy-loading composable; not used. `LazyImage.vue` and `useLazyImage.js` look like a paired feature that wasn't adopted.                            | Delete unless `LazyImage.vue` is wired in (it isn't).                                   |
| `useMetaTags.js`       | Watches the route's `meta.title`/`meta.description` and updates the `<head>`. Useful for SEO; just never imported in `App.vue` or `MainLayout.vue`. | **Wire it up** — call `useMetaTags()` once in `MainLayout.vue` setup. Real SEO benefit. |
| `usePullToRefresh.js`  | PWA pull-to-refresh helper. Not used.                                                                                                               | Delete unless you're planning to add pull-to-refresh.                                   |
| `useStructuredData.js` | JSON-LD generators for SEO. Only referenced internally by `useMetaTags.js`.                                                                         | Same as `useMetaTags.js` — wire both up together or delete both.                        |

## Orphan utils

| File                       | Notes                                                                                                                       | Recommendation                                                         |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/utils/performance.js` | `debounce`/`throttle` helpers. Nothing imports them. Several places re-implement debouncing inline (e.g. `AyanMoPage.vue`). | Either delete, or refactor those inline debounces to use this utility. |

## Orphan components

| File                                   | Notes                                                                               | Recommendation                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/components/LazyImage.vue`         | No imports. Pairs with the orphan `useLazyImage.js`.                                | Delete or adopt project-wide.                          |
| `src/components/SaveForOfflineBtn.vue` | Premium offline-mode UI. `OfflinePage.vue` exists in routes but uses none of these. | Premium-feature placeholder; flag for future.          |
| `src/components/AppBreadcrumbs.vue`    | Verify whether it's mounted in any layout.                                          | Check if `MainLayout` ever rendered it; remove if not. |

## Orphan pages

| File                                  | Notes                                                                                 | Recommendation                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/pages/UpdatePlaceCategories.vue` | One-off data-migration helper. **Not in `routes.js`.**                                | Move to `scripts/` or delete after the migration is final.          |
| `src/pages/RepairJeepneySpots.vue`    | Admin-only data-repair page. Routed at `/repair-jeepney-spots` but no UI links to it. | Add a link from the admin sidebar (gated to super-admin) or delete. |

---

## Files lacking header documentation

32 files have no module-level docstring. List below; pair with the file-header pass to fix.

```
src/App.vue
src/boot/firebase.js
src/boot/pinia.js
src/boot/router-guards.js
src/components/admin/ActivityLogsManagement.vue
src/components/admin/AdminHeader.vue
src/components/admin/AdminSidebar.vue
src/components/admin/AdminsManagement.vue
src/components/admin/AdminStats.vue
src/components/admin/AnalyticsManagement.vue
src/components/admin/EventsManagement.vue
src/components/admin/JeepneyManagement.vue
src/components/admin/JeepneyOptionsManagement.vue
src/components/admin/PlacesManagement.vue
src/components/admin/RouteFormDialog.vue
src/components/admin/RoutesManagement.vue
src/components/BackToTopBtn.vue
src/components/ErrorBoundary.vue
src/components/home/PartnersSection.vue
src/components/MobileBottomNav.vue
src/components/OfflineIndicator.vue
src/components/ProfileEditor.vue
src/components/SaveForOfflineBtn.vue
src/composables/useMetaTags.js
src/composables/useOfflineMode.js
src/layouts/BlankLayout.vue
src/pages/ErrorNotFound.vue
src/pages/OfflinePage.vue
src/pages/RepairJeepneySpots.vue
src/pages/UpdatePlaceCategories.vue
src/router/index.js
src/router/routes.js
```

---

## Inconsistencies and smells

### `bg-pine-green` is component-scoped, used cross-component

The class is defined as a _scoped_ style inside `PhotosManagement.vue` only. Other components that use it (now fixed: `JeepneyOptionsManagement.vue`, `MainLayout.vue`, `RouteCompareDialog.vue`, `JeepneyManagement.vue`'s Route Preview dialog) had silently-broken styling — white text on white background. We've replaced those with inline `style="background: #2d6a4f"`. **Long-term fix:** promote the class to a global utility in `src/css/app.sass` or add a Quasar custom brand color.

### Big single-file pages

| File                                           | LOC   | Notes                                                                                                                                                                                                                         |
| ---------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/ApanamPage.vue`                     | ~2500 | Single-file SFC mixing UI, route generation, OSRM calls, polyline math, marker rendering. **Splitting candidates:** route-rendering logic into `useRouteRendering.js`; double-ride logic into `composables/useDoubleRide.js`. |
| `src/components/admin/JeepneyManagement.vue`   | ~1900 | Form + table + map preview + compare dialog + CSV import. **Splitting candidates:** the CSV import flow into its own component, the form into `JeepneyFormDialog.vue`.                                                        |
| `src/components/admin/PlacesManagement.vue`    | ~2000 | Same pattern (form + table + CSV).                                                                                                                                                                                            |
| `src/components/admin/EventsManagement.vue`    | ~1300 | Same pattern.                                                                                                                                                                                                                 |
| `src/components/admin/PhotosManagement.vue`    | ~2000 | Multi-section gallery/guide editor.                                                                                                                                                                                           |
| `src/components/admin/AnalyticsManagement.vue` | ~1000 | Charts + map + lists. Now accepts a `categories` prop.                                                                                                                                                                        |

These work — none are blocking — but adding inline commentary at this size would make them worse, not better. Refactoring into smaller pieces is the higher-value move when budget allows.

### `bg-primary` is overridden in `ApanamPage.vue` scoped CSS

Line 2882: `.bg-primary { background-color: $primary-green !important; }`. This overrides Quasar's blue primary inside the page. The CSS variable `--q-primary` stays Quasar-blue so any element using `var(--q-primary)` (e.g. our route markers) renders blue while elements using `bg-primary` render green. We've already worked around this in the markers/legends — but the asymmetry is a footgun for future changes. **Options:** (1) accept the override is intentional and document it inline; (2) rebrand Quasar's primary globally in `quasar.variables.sass`.

### `useFirebase.js` duplicates the boot exports

Just re-exports `auth`, `db`, `storage` from `boot/firebase.js`. Most files import directly from the boot file instead. **Decide:** delete `useFirebase.js` and standardize on `from 'src/boot/firebase'`, or migrate everyone to the composable form.

### Inline reimplementations of common helpers

- `haversine` is implemented in at least 4 places (`ApanamPage.vue`, `RouteCompareDialog.vue`, `useJeepneyRouteMatching.js`, `scripts/audit-jeepney-routes.js`). Hoist to `utils/geo.js`.
- Debouncing of search inputs is open-coded in several pages instead of using `utils/performance.js`.

---

## Tests

`vitest` is configured. Tests exist for:

```
src/components/ErrorBoundary.test.js
src/components/PineSkeletonLoader.test.js
src/composables/useAdminClaims.test.js
src/stores/user-store.test.js
```

That's four test files for ~92 source files. **Recommendation:** if you care about regression coverage, the highest-leverage additions are `useFeatureRequests.test.js`, `useGeocoding.test.js`, `useJeepneyRouteMatching.test.js`, and `useRouteGeneration.test.js` (the math and Firestore-touching helpers).

---

## Removed in recent passes (clean — confirming)

These were trimmed during the recent admin-UI work; verifying they're fully gone:

- ✅ Header search bar (`Search…` ⌘F input)
- ✅ Mail/email button next to notifications
- ✅ Recent Activity card on dashboard
- ✅ Standalone Analytics sidebar entry
- ✅ Share + Report Issue from MaykanPage, AyanMoPage, AramidemPage
- ✅ `loadAdminData`/`toggleDrawer` exports from `useAdminDashboard`

---

## Suggested next steps (ordered by leverage)

1. **Wire up `useMetaTags.js` + `useStructuredData.js`** in `MainLayout.vue` — minutes of work, real SEO win.
2. **Hoist `haversine`** to `utils/geo.js` and replace the four inline copies.
3. **Delete the truly-orphan files** (after a quick "do you actually use this?" check): `useLazyImage.js`, `LazyImage.vue`, `usePullToRefresh.js`, `performance.js`, `UpdatePlaceCategories.vue`.
4. **Promote `bg-pine-green`** to a global utility class so it stops being component-scoped.
5. **Add tests for `useFeatureRequests`** — most newly-added critical path with no coverage.
6. **Split the giant SFCs** into form/table/dialog subcomponents when you next touch them.
