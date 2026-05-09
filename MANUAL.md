# Boost Baguio — Complete Setup & Operations Manual

A start-to-finish guide for getting **Boost Baguio** running, deployed, and operated. Copy this whole document into a PDF if you need a printable reference.

This manual covers:

1. Prerequisites and accounts you need
2. Cloning the repository and installing dependencies
3. Setting up Firebase (Auth, Firestore, rules, indexes)
4. Setting up Cloudinary (image uploads)
5. Filling in the `.env` file
6. Running the app locally
7. Bootstrapping your first super-admin account
8. Building and deploying to Vercel
9. Post-deployment verification
10. How to use the public-facing app (user guide)
11. How to use the admin dashboard (admin guide)
12. Troubleshooting

---

## 1. Prerequisites

Install these on your computer **before** starting.

| Tool                 | Minimum version                | How to verify        |
| -------------------- | ------------------------------ | -------------------- |
| **Node.js**          | 20.x                           | `node --version`     |
| **pnpm**             | 10.x (or use npm 10+)          | `pnpm --version`     |
| **Git**              | 2.30+                          | `git --version`      |
| **Firebase CLI**     | 13+                            | `firebase --version` |
| **A modern browser** | Chrome / Edge / Firefox latest | —                    |

### Install pnpm (if not already)

```bash
npm install -g pnpm
```

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Accounts you'll need (all free tier is enough for development)

| Service                     | Why                                 | URL                                        |
| --------------------------- | ----------------------------------- | ------------------------------------------ |
| **GitHub**                  | Host the code                       | https://github.com/signup                  |
| **Firebase / Google Cloud** | Auth + Firestore database + Storage | https://console.firebase.google.com        |
| **Cloudinary**              | Image uploads & transformations     | https://cloudinary.com/users/register/free |
| **Vercel**                  | Production hosting                  | https://vercel.com/signup                  |

You can use a single Google account to sign into both GitHub (via GitHub auth) and Firebase.

---

## 2. Clone the repository and install dependencies

### 2.1 Clone

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO>.git
cd <YOUR_REPO>
```

If you're forking from the original repo, fork it first on GitHub, then clone your fork.

### 2.2 Install

```bash
pnpm install
```

This installs Vue, Quasar, Firebase SDK, Leaflet, Chart.js, and all dev dependencies. It takes 1–3 minutes the first time.

> ⚠️ If you don't have pnpm, you can substitute `npm install` everywhere — there's a `pnpm-lock.yaml` but Vercel and the project will work with npm too.

---

## 3. Set up Firebase

### 3.1 Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project**.
3. Name it (e.g. `boost-baguio`). Accept the defaults; Google Analytics is optional but recommended.
4. Wait for the project to be provisioned (~30 seconds).

### 3.2 Register a web app inside the project

1. In your new Firebase project's **Project Overview**, click the **`</>`** (web app) icon.
2. Give the app a nickname (e.g. `boost-baguio-web`).
3. Tick **Also set up Firebase Hosting** if you want the option — not required since we use Vercel.
4. Click **Register app**.
5. Firebase shows a **firebaseConfig** snippet that looks like this:

   ```js
   const firebaseConfig = {
     apiKey: 'AIzaSy...',
     authDomain: 'boost-baguio.firebaseapp.com',
     projectId: 'boost-baguio',
     storageBucket: 'boost-baguio.appspot.com',
     messagingSenderId: '1234567890',
     appId: '1:1234567890:web:abc123...',
     measurementId: 'G-ABCDEF1234',
   }
   ```

   **Save these values** — you'll paste them into `.env` in step 5.

6. Click **Continue to console**.

### 3.3 Enable Authentication

1. In the left sidebar of the Firebase console, click **Build → Authentication**.
2. Click **Get started**.
3. Under **Sign-in method**, enable **Email/Password**.
4. Click **Save**.

### 3.4 Enable Firestore Database

1. Sidebar → **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (we'll deploy our own rules in 3.5).
4. Pick a location close to your users (for Baguio: `asia-southeast1` recommended).
5. Click **Enable**. Wait ~30 seconds.

### 3.5 Deploy Firestore security rules and indexes

Boot Baguio ships rules in `firestore.rules` and indexes in `firestore.indexes.json`. Push them to your project:

```bash
firebase login
firebase use --add
# Pick your project; alias it as "default"
firebase deploy --only firestore:rules,firestore:indexes
```

If `firebase use --add` doesn't see your project, run `firebase projects:list` first to confirm you're logged in to the right Google account.

> ⚠️ **Important:** Without deploying these rules, the app will appear to work but every Firestore write will fail with "Missing or insufficient permissions."

### 3.6 Enable Storage (optional)

The app currently uploads images to Cloudinary, not Firebase Storage. You can skip this section unless you plan to migrate to Storage.

If you do enable it: sidebar → **Build → Storage** → **Get started**, accept defaults.

---

## 4. Set up Cloudinary

Cloudinary handles image uploads for places, events, jeepneys, and gallery photos.

### 4.1 Create a free account

1. Go to https://cloudinary.com/users/register/free.
2. Sign up with email + password.
3. After verification you'll land on the **Programmable Media Dashboard**. The very top shows your **Cloud Name** (e.g. `dc9vkemqm`). **Save it.**

### 4.2 Create an unsigned upload preset

The app uses unsigned uploads from the browser, which require a preset.

1. From your Cloudinary dashboard, click the **gear icon** (Settings) in the top right.
2. Go to the **Upload** tab.
3. Scroll to **Upload presets** → click **Add upload preset**.
4. Name it (e.g. `BoostBaguio`). **Save the name** — you'll paste it into `.env`.
5. Set **Signing Mode** to **Unsigned**.
6. (Optional) Under **Folder**, set a folder like `boost-baguio` to keep uploads organized.
7. Click **Save**.

---

## 5. Fill in the environment file

The repo has a placeholder `.env`. Open it (or create a new file named `.env` in the project root) and replace the values with what you collected in steps 3 and 4.

```env
# ── Firebase (from step 3.2) ─────────────────────────
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=boost-baguio.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=boost-baguio
VITE_FIREBASE_STORAGE_BUCKET=boost-baguio.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123...
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234

# ── Cloudinary (from step 4) ─────────────────────────
VITE_CLOUDINARY_CLOUD_NAME=dc9vkemqm
VITE_CLOUDINARY_UPLOAD_PRESET=BoostBaguio

# ── Bootstrap super-admin (your email) ───────────────
# This is the email the app will recognize as the initial super-admin
# during AdminSignup. See step 7.
VITE_ADMIN_EMAIL=you@example.com
```

> 🔒 **Never commit `.env` to git.** It's already in `.gitignore`.

### Optional: a separate `.env.local`

For per-developer overrides (e.g. pointing at a different Firebase project), create a `.env.local` — Vite reads both, with `.env.local` winning.

---

## 6. Run the app locally

```bash
pnpm dev
```

Quasar starts the Vite dev server. The app opens at:

```
http://localhost:9200
```

If port 9200 is busy, Quasar auto-picks the next free port — watch the terminal for the actual URL.

### 6.1 Quick smoke test

| Action                          | Expected                                                             |
| ------------------------------- | -------------------------------------------------------------------- |
| Open `/`                        | Landing page renders, hero animates in                               |
| Click "Apanam" in the navbar    | Browser asks for location permission; FROM input prefills            |
| Click "Maykan"                  | Place grid renders (will be empty until you create places via admin) |
| Open browser devtools → Console | Look for `[Firebase] ✅ Initialized successfully`                    |

If the Firebase log says `⚠️ Firebase not configured` you missed a `.env` value or didn't restart the dev server after editing it. Stop the server (`Ctrl+C`) and restart.

---

## 7. Create your first super-admin account

The first admin is bootstrapped through the in-app **AdminSignup** flow, which uses `VITE_ADMIN_EMAIL` (set in step 5) to allow self-registration as super-admin.

### 7.1 Sign up as super-admin

1. With `pnpm dev` running, navigate to **http://localhost:9200/admin/signup**.
2. Fill in:
   - **Email:** the same address you put in `VITE_ADMIN_EMAIL`.
   - **Name:** your name.
   - **Password:** at least 8 characters, mix of letters/numbers.
3. Click **Sign up**.
4. You'll be redirected to **/admin/dashboard**. You're now a super-admin.

> ✅ Verify it worked: open Firebase Console → Firestore → `admins` collection. You should see one document with your `uid` and `role: "super_admin"`.

### 7.2 Create additional admins

From the dashboard:

1. Sidebar → **Admins**.
2. Click **Add Admin**.
3. Choose a role:
   - **places_admin** — can CRUD places
   - **events_admin** — can CRUD events
   - **routes_admin** — can CRUD jeepneys and routes
   - **super_admin** — full access (only super-admin can create another super-admin)
4. Each new admin can log in at **/admin/adminlogin** with the password you give them.

> ⚠️ Once you've created your first super-admin, **change `VITE_ADMIN_EMAIL` to a unique value or keep it locked down** — it's the bootstrap escape hatch. Anyone who can both sign up at `/admin/signup` and match this email becomes super-admin.

---

## 8. Build for production

```bash
pnpm build
```

Output lands in **`dist/spa/`**.

To preview the production build locally:

```bash
pnpm exec quasar serve dist/spa
```

This serves the built bundle exactly the way the deployed version will run, so you can sanity-check before deploying.

---

## 9. Deploy to Vercel

The repo is preconfigured for Vercel deployment.

### 9.1 First-time Vercel setup

1. Sign in to https://vercel.com with your GitHub account.
2. Click **Add New → Project**.
3. **Import** your GitHub repo. Vercel detects `vercel.json` in the root.
4. **Framework Preset:** leave as `Other` (Vercel reads our config).
5. **Build & Output settings:**
   - Build command: `quasar build` (already in `vercel.json`)
   - Output directory: `dist/spa` (already in `vercel.json`)
   - Install command: `pnpm install` (already in `vercel.json`)
6. **Environment Variables:** copy every line from your `.env` file into Vercel's env panel:

   | Key                                 | Scope                             |
   | ----------------------------------- | --------------------------------- |
   | `VITE_FIREBASE_API_KEY`             | Production, Preview, Development  |
   | `VITE_FIREBASE_AUTH_DOMAIN`         | All                               |
   | `VITE_FIREBASE_PROJECT_ID`          | All                               |
   | `VITE_FIREBASE_STORAGE_BUCKET`      | All                               |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | All                               |
   | `VITE_FIREBASE_APP_ID`              | All                               |
   | `VITE_FIREBASE_MEASUREMENT_ID`      | All                               |
   | `VITE_CLOUDINARY_CLOUD_NAME`        | All                               |
   | `VITE_CLOUDINARY_UPLOAD_PRESET`     | All                               |
   | `VITE_ADMIN_EMAIL`                  | Production only (after bootstrap) |

7. Click **Deploy**. The first build takes ~3 minutes.
8. When it finishes you'll have a `https://<your-app>.vercel.app` URL.

### 9.2 Authorize the production domain in Firebase

1. Firebase Console → **Authentication → Settings → Authorized domains**.
2. Click **Add domain** and add your Vercel URL (e.g. `boost-baguio.vercel.app`).
3. If you wire up a custom domain (e.g. `boostbaguio.com`), add it too.

Without this, signups/logins from your production URL will fail with "auth/unauthorized-domain."

### 9.3 Subsequent deployments

Push to your repo's main branch → Vercel auto-builds and deploys. Pull-request branches get preview deployments automatically.

Manual redeploy:

```bash
pnpm dlx vercel --prod
```

---

## 10. Post-deployment verification

Run through this checklist on the **production URL** to confirm everything is working.

### Public app

- [ ] Landing page loads with no console errors.
- [ ] Click any of the 5 named features (APANAM, PAGNAAM, MAYKAN, ARAMIDEM, AYAN MO) — the page loads.
- [ ] APANAM / AYAN MO ask for location permission.
- [ ] Map tiles render (CartoDB Voyager — colorful but no POI icons).
- [ ] Sign up at `/login`, log in, log out — no errors.
- [ ] On a logged-in user account: navigate to `/account` → profile editor opens.

### Admin app

- [ ] `/admin/dashboard` redirects to `/admin/adminlogin` when not logged in.
- [ ] Logging in as super-admin lands on the dashboard.
- [ ] Add a Place via the Places module — saves, image uploads to Cloudinary, place appears on the public Maykan page.
- [ ] Add an Event via Events — saves and appears on Aramidem.
- [ ] Add a Jeepney via Routes/Jeepneys — saves; the green map icon shows the route preview.
- [ ] As a non-super admin, click "Request to feature" on a place → super-admin sees the notification in the bell dropdown.
- [ ] Approving the request flips the place's `featured: true` field in Firestore.

### Firestore audit

- [ ] All documents are being created/updated (check Firestore console).
- [ ] No "Missing or insufficient permissions" errors in browser devtools.
- [ ] Indexes show as **Enabled** in Firebase Console → Firestore → Indexes.

---

## 11. How to use the public web app (user guide)

The public site has a top navbar with five named modules.

### APANAM — Plan a jeepney trip

**URL:** `/apanam`

1. The **FROM** input auto-fills with your current location (you'll be asked for permission the first time).
2. To override, click in the FROM input and type a place; press Enter or click the magnifier.
3. The **GPS button** (left of FROM) is green when the location is auto-detected, gray when you've typed something. Click it to re-detect.
4. Choose a destination from the **TO** dropdown.
5. Click **Start Navigation** — the app finds single-ride and double-ride jeepney options.
6. Pick an option from the list. The map renders the route with color-coded markers and lines:

   | Color     | Meaning                            |
   | --------- | ---------------------------------- |
   | 🟢 Green  | Start (you)                        |
   | 🔵 Blue   | Board Jeepney 1 (terminal 1)       |
   | 🟡 Yellow | Get off Jeepney 1 (transfer point) |
   | 🟣 Purple | Board Jeepney 2 (terminal 2)       |
   | 🔴 Red    | Final drop-off                     |

7. Below the map is a numbered **How To Get There** step-by-step guide whose avatar colors match the markers.

### PAGNAAM — Browse all jeepney routes

**URL:** `/pagnaam`

- Searchable grid of every jeepney. Click a card to open a detailed dialog with:
  - Terminal info, fares, operating hours
  - "How to identify this jeepney" tips
  - **Map Legend** + numbered Route Stops list
  - Full route polyline on the right

### MAYKAN — Discover places

**URL:** `/maykan`

- Filter by category (tourist spot, restaurant, hotel, etc.).
- Click a place to open its detail modal with photo, address, hours, contact.
- **Get Directions** sends the user to APANAM with the place pre-filled as the destination.
- **Save Place** bookmarks it (logged-in users only) — view saved places in `/account`.

### ARAMIDEM — Events calendar

**URL:** `/aramidem`

- Monthly calendar grid + list view.
- Click an event for full details, plus **Get Directions** to the venue.

### AYAN MO — Find places near me

**URL:** `/ayanmo`

- Map view with a floating filter card on the right.
- The FROM input behaves the same as APANAM (auto-detects, GPS button toggles).
- **Multi-select category chips** — click to add/remove categories from the filter.
- **Search radius chips** — 500m / 1km / 2km / 5km.
- The **Nearby Places list** updates live; clicking a row opens a place detail popup.
- **Hover any marker** on the map → tooltip with the place name. Click → opens detail popup.

### User account

- `/login` — sign up or log in.
- `/account` — edit profile, view saved places.
- `/saved-routes` — premium-only, list of bookmarked APANAM routes.

---

## 12. How to use the admin dashboard (admin guide)

**URL:** `/admin/dashboard` (after logging in at `/admin/adminlogin`).

### Layout

- **Top header:** menu toggle, notifications bell (super-admin only), profile dropdown.
- **Left sidebar:** Dashboard, Routes/Jeepneys, Places, Events, Photos, Admins, Activity Logs. Items hide based on your role.
- **Main area:** the selected module.

### Dashboard tab

Four stat cards at the top show counts: Routes/Jeepneys, Places, Events, Admins.

**Cards are filters.** Click any card to toggle that category in/out of the analytics view below. Defaults to Places. Multi-select is supported (click multiple cards). Deselecting all falls back to Places.

The analytics block shows real metrics for Places (foot-traffic map, popular places, peak hours, charts, engagement). For other categories, a "Not yet tracked" placeholder appears — those events aren't instrumented yet.

### Routes / Jeepneys

- **Search + bulk delete** at the top.
- **Add Jeepney** opens a form: name, terminal location, end point, fares, operating hours, route coordinates editor (Leaflet map for clicking points), tourist spots serviced (tag chips), image upload.
- **Route column** of each row has two icon buttons:
  - 🟢 **Map** — preview the stored route polyline.
  - 🔴 **Compare** — open the OSRM compare dialog. Shows your stored polyline (solid blue) over a freshly-fetched OSRM route (dashed red), with side-panel drift %. Click **Apply OSRM route** to overwrite the stored polyline; **Keep current route** to bail. If a jeepney has no polyline yet, the dialog flips into "Generate Route" mode.

There's also a CLI auditor for triaging bad routes:

```bash
npm run audit:routes            # offline structural checks only
npm run audit:routes:osrm       # also compares each route to a fresh OSRM route
```

The script flags sharp U-turns, long jumps between adjacent points, self-intersections, excessive zigzag ratio, and large drift from OSRM's recommended path. Output is sorted worst-first.

### Places

- Same shape as Routes: search + bulk delete, add/edit form with image upload (Cloudinary), Leaflet location picker, multi-category selector, address autocomplete.
- **CSV import** for bulk loading places.
- **Per-row "Request to feature"** (amber sparkle icon) — only visible to non-super admins. Click to ask the super-admin to mark the place as featured.

### Events

- Identical pattern to Places. Includes date pickers and a status field (Upcoming / Ongoing / Completed / Cancelled).

### Photos

- Manage hero, gallery, and guide images for the public landing page. Galleries support drag-to-reorder.

### Admins (super-admin only)

- Create new admin accounts and assign roles.
- Edit role/permissions of existing admins.
- Delete admins (be careful — there's no soft-delete).

### Activity Logs

- Read-only audit trail of every admin action: signups, logins, CRUD operations, bulk deletes, exports/imports. Filterable by action type and date range.

### Feature requests (super-admin notification flow)

When a places-admin or events-admin clicks **"Request to feature"** on a row:

1. A document is created in the `featureRequests` Firestore collection with `status: "pending"`.
2. Super-admin sees a red badge on the bell icon in the AdminHeader; clicking the bell opens a dropdown listing every pending request with the requester's name + role.
3. Each row has inline **✓** (approve) and **✕** (reject) buttons.
4. Approving sets `featured: true` on the target place/event AND marks the request `approved`.
5. Rejecting only marks the request `rejected`; the target is untouched.

---

## 13. Troubleshooting

### "Missing or insufficient permissions" on every Firestore write

You haven't deployed `firestore.rules`. Run:

```bash
firebase deploy --only firestore:rules
```

### "auth/unauthorized-domain" when signing in on production

Add your Vercel URL to Firebase Console → Authentication → Settings → Authorized domains.

### Map tiles don't load

Check the browser network tab for blocked requests to `basemaps.cartocdn.com`. CartoDB tiles are public; the only reason they'd fail is a corporate proxy or CSP. Add `basemaps.cartocdn.com` to your CSP if you have one.

### Routes/jeepneys page is empty

You haven't created any jeepneys yet. Sign in to admin and add some via Routes/Jeepneys.

### "OSRM HTTP 429" or routes fail to compute

The public OSRM server (`router.project-osrm.org`) rate-limits aggressive concurrency. The app already throttles, but if you hit it, just wait 30 seconds and retry. For production scale, host your own OSRM server.

### Cloudinary uploads fail with 401 "Unauthorized"

The upload preset isn't set to **Unsigned**. Re-check Cloudinary → Settings → Upload → Upload presets → click your preset → Signing Mode = **Unsigned**.

### Cloudinary uploads succeed but images return 404

Your `VITE_CLOUDINARY_CLOUD_NAME` doesn't match the actual cloud name in Cloudinary. Double-check the dashboard's top-left.

### Dev server runs but `[Firebase] ⚠️ Firebase not configured`

`.env` was added/edited after starting the dev server. Stop (`Ctrl+C`) and restart `pnpm dev`. Vite only reads env files at startup.

### `/admin/signup` says "Email already in use" but the user doesn't exist

A previous signup attempt created a Firebase Auth user but failed to write the `admins/{uid}` doc. Either:

- Use a different email; or
- Delete the orphan user from Firebase Console → Authentication → Users.

### Deploy succeeds on Vercel but production page is blank

Open the deployed page's devtools console. The most common cause is an env var mismatch between local and Vercel. Double-check that **every** `VITE_*` var from your local `.env` is also set in Vercel → Settings → Environment Variables. Redeploy after editing env vars.

### Linting fails on commit

```bash
pnpm lint:fix
```

If lint errors remain after auto-fix, address them — the pre-commit hook (`husky`) blocks commits with lint errors.

---

## 14. Where to read more

| Topic                     | File                                       |
| ------------------------- | ------------------------------------------ |
| Project architecture map  | `ARCHITECTURE.md`                          |
| Outstanding cleanup items | `AUDIT.md`                                 |
| Firestore security rules  | `firestore.rules`                          |
| Vercel build config       | `vercel.json`                              |
| Environment variable list | `.env` (after you create it)               |
| Firebase project config   | `firebase.json` + `firestore.indexes.json` |
| Quasar config             | `quasar.config.js`                         |

---

**Maintained by:** BaguioBoosters

For day-to-day operational questions, refer first to `ARCHITECTURE.md` ("where does the code for X live?"), then `AUDIT.md` (orphans, smells), then this manual (setup + how-to).
