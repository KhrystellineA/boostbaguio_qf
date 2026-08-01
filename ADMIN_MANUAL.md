# Boost Baguio — Administrator Manual

Welcome to the **Boost Baguio Admin Dashboard**. This manual is your complete guide to managing the content, users, and overall health of the Boost Baguio platform.

Whether you are adding new jeepney routes, updating tourist spots, or overseeing other administrators, this guide will walk you through every feature available to you.

---

## Table of Contents

1. [Accessing the Dashboard & Roles](#1-accessing-the-dashboard--roles)
2. [Dashboard & Analytics](#2-dashboard--analytics)
3. [Managing Routes & Jeepneys](#3-managing-routes--jeepneys)
4. [Managing Places](#4-managing-places)
5. [Managing Events](#5-managing-events)
6. [Managing Photos](#6-managing-photos)
7. [Admin Management (Super Admins Only)](#7-admin-management-super-admins-only)
8. [Activity Logs](#8-activity-logs)
9. [Handling Feature Requests](#9-handling-feature-requests)

---

## 1. Accessing the Dashboard & Roles

**Login URL:** `/admin/adminlogin`  
**Dashboard URL:** `/admin/dashboard`

If you try to access the dashboard without logging in, you will be automatically redirected to the login page. Your access level within the dashboard depends on the **Role** assigned to your account:

- **super_admin:** Full access to all modules, including creating and deleting other administrators and approving feature requests.
- **routes_admin:** Can create, read, update, and delete (CRUD) Jeepneys and Routes.
- **places_admin:** Can CRUD Places and submit "Feature Requests" to super-admins.
- **events_admin:** Can CRUD Events and submit "Feature Requests" to super-admins.

_Depending on your role, some items in the left sidebar will be hidden from view._

---

## 2. Dashboard & Analytics

When you log in, you will land on the main **Dashboard** tab.

- **Stat Cards:** At the top, you will see four overview cards displaying total counts for: Routes/Jeepneys, Places, Events, and Admins.
- **Interactive Filtering:** These cards double as filters! Click any card to toggle its data in the analytics view below. For example, click "Places" to see the foot-traffic map, popular places, and peak hours. You can click multiple cards to combine data. (If you deselect all, it defaults back to Places).
- **Analytics View:** Currently, detailed metrics (like engagement and traffic maps) are fully supported for Places. For other categories, you may see a "Not yet tracked" placeholder until instrumentation is fully deployed.

---

## 3. Managing Routes & Jeepneys

This module allows you to digitize the physical jeepney routes of Baguio.

**Key Features:**

- **Search & Bulk Delete:** Quickly find specific jeepneys or remove multiple entries at once using the top bar.
- **Add/Edit Jeepney:** When adding a jeepney, you can define:
  - Name, Terminal Location, and End Point.
  - Fares and Operating Hours.
  - **Tourist Spots Serviced:** Tag chips to link the jeepney to popular destinations.
  - **Route Coordinates Editor:** Use the interactive Leaflet map to click and draw the exact path the jeepney takes.
  - Image Upload.

**The Route Column Tools:**
In the list view, the "Route" column has two important buttons:

1. 🟢 **Map (Preview):** View the currently saved route polyline on a map.
2. 🔴 **Compare (OSRM tool):** This opens the OSRM (Open Source Routing Machine) compare dialog.
   - It shows your manually drawn route (solid blue) overlaid on the system-recommended route (dashed red).
   - A side panel shows the "drift percentage" (how much your route deviates from the system's suggestion).
   - You can choose to **Apply OSRM route** to automatically fix your line, or **Keep current route**.
   - _Tip:_ If a jeepney has no route drawn yet, this button flips to a "Generate Route" mode to automatically plot it.

**Auditing Routes (CLI):**
For developers or super-admins with terminal access, you can run quality checks:

- `npm run audit:routes` (Offline check for U-turns, huge jumps, self-intersections).
- `npm run audit:routes:osrm` (Compares all routes against fresh OSRM data and flags deviations).

---

## 4. Managing Places

Use this module to curate the tourist spots, restaurants, and hotels shown in the MAYKAN and AYAN MO public apps.

- **Add/Edit Place:** You can fill in the place details, use the Leaflet location picker to drop a pin on the map, select multiple categories, and use the address autocomplete. Images are uploaded seamlessly via Cloudinary.
- **CSV Import:** Need to add 50 restaurants at once? Use the CSV import tool for bulk loading.
- **Request to Feature (Amber Sparkle Icon):** If you are a `places_admin`, you will see a sparkle icon next to rows. Click this to send a request to a Super Admin to mark this place as "Featured" on the public app.

---

## 5. Managing Events

Keep the ARAMIDEM calendar up to date. The Events module functions identically to the Places module, with the addition of:

- **Date Pickers:** Specify start and end dates/times.
- **Status Field:** Mark events as _Upcoming_, _Ongoing_, _Completed_, or _Cancelled_.

---

## 6. Managing Photos

Control the visual presentation of the public landing page.

- Here you can manage the **Hero** image, **Gallery** photos, and **Guide** images.
- The gallery manager supports **drag-and-drop reordering**, making it easy to shuffle which photos tourists see first.

---

## 7. Admin Management (Super Admins Only)

If you are a `super_admin`, you will see the **Admins** tab.

- **Add Admin:** Create new accounts for your team members. You will set their email, password, and assign their specific Role (places, events, routes, or super).
- **Edit Permissions:** You can change an existing admin's role at any time.
- **Delete Admin:** Remove an admin's access entirely. _(Warning: This is a hard delete and cannot be undone)._

---

## 8. Activity Logs

Security and accountability are critical. The **Activity Logs** provide a read-only audit trail of everything happening in the admin dashboard.

- Every signup, login, creation, edit, bulk delete, and export/import is recorded here.
- You can filter the logs by specific **Action Types** and **Date Ranges** to investigate who changed what and when.

---

## 9. Handling Feature Requests

To maintain quality control, only Super Admins can officially mark a Place or Event as "Featured."

**The Workflow:**

1. A `places_admin` or `events_admin` clicks the **"Request to feature"** button on an item.
2. The **Super Admin** will see a **Red Badge** appear on the notification bell in the top-right header of their dashboard.
3. Clicking the bell opens a dropdown listing all pending requests, showing the item name and who requested it.
4. The Super Admin has two choices inline:
   - **✓ Approve:** The item's `featured` status is flipped to true, and the request is closed.
   - **✕ Reject:** The request is discarded, and the item remains un-featured.

---

_Thank you for keeping Boost Baguio running smoothly! For technical troubleshooting (like missing permissions or map loading errors), please refer to the technical `MANUAL.md` file._
