# Phase 1 Security Fixes - Deployment Guide

## Overview

This document describes the critical security fixes implemented in Phase 1 and the steps required to deploy them.

---

## Changes Made

### 1. ✅ Fixed Firestore Security Rules

**File:** `firestore.rules`

**Changes:**
- Changed `isAuthenticated()` to `isAdmin()` for events, places, routes, and jeepneys collections
- Added comprehensive data validation:
  - String length limits (200 characters for titles/names)
  - Coordinate validation (latitude: -90 to 90, longitude: -180 to 180)
  - Date relationship validation (endDate >= startDate)
  - Email format validation
  - Required field validation

**New Collections Added:**
- `error_logs` - Error monitoring (public create, admin read/update/delete)
- `activity_logs` - Admin activity tracking (authenticated create, admin read/update/delete)
- `contactMessages` - Public contact form (public create with validation, admin read/update/delete)

---

### 2. ✅ Implemented Firebase Custom Claims

**New Files:**
- `src/composables/useAdminClaims.js` - Composable for checking admin permissions
- `set-admin-custom-claims.js` - Script to set custom claims for existing admins

**Modified Files:**
- `src/router/index.js` - Updated to use Firebase Custom Claims
- `src/boot/router-guards.js` - Simplified to only handle auth initialization
- `src/pages/Admin/AdminDashboard.vue` - Updated to load admin data from Firestore + Custom Claims

**Security Improvement:**
- **BEFORE:** Admin role stored in `sessionStorage` (easily manipulated)
- **AFTER:** Admin role stored in Firebase Custom Claims (server-side, secure)

---

### 3. ✅ Consolidated Router Guards

**Before:**
- Duplicate `beforeEach` guards in `src/router/index.js` and `src/boot/router-guards.js`
- Inconsistent auth checking logic

**After:**
- Single source of truth in `src/router/index.js`
- `src/boot/router-guards.js` only handles auth initialization
- Clear, documented auth flow

---

## Deployment Steps

### Step 1: Deploy Firestore Security Rules

```bash
# Deploy only the security rules
firebase deploy --only firestore:rules
```

⚠️ **IMPORTANT:** This will immediately enforce the new rules. Make sure all admin users have proper permissions before deploying.

---

### Step 2: Set Up Firebase Custom Claims

#### Option A: Using the Script (Recommended)

1. **Set up environment variables for Admin SDK:**

   Create a `.env.admin` file (or add to your existing `.env`):
   ```env
   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   You can get these from:
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract the `client_email` and `private_key` values

2. **Run the script:**

   ```bash
   node set-admin-custom-claims.js
   ```

3. **Verify the output:**
   ```
   ✅ Set claims for user abc123: { admin: true, role: 'super_admin', permissions: [ 'super_admin:all' ] }
   ```

#### Option B: Manual Setup (If script doesn't work)

If you can't run the script, you can set custom claims manually in your Firebase Admin SDK:

```javascript
// In any server-side code or Cloud Function
const admin = require('firebase-admin');
admin.initializeApp();

const auth = admin.auth();

// For each admin user
await auth.setCustomUserClaims('USER_UID', {
  admin: true,
  role: 'super_admin',  // or 'routes_admin', 'places_admin', 'events_admin'
  permissions: ['super_admin:all']  // or ['routes:write'], etc.
});
```

---

### Step 3: Update Frontend Code

The code changes are already in place. Just deploy your frontend:

```bash
# Build the application
pnpm build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

### Step 4: Admin Users Must Re-login

⚠️ **CRITICAL:** Firebase Custom Claims are included in the ID token, which is refreshed when users log in.

**All admin users must:**
1. Sign out
2. Sign back in

This ensures their new custom claims are included in their ID token.

---

## Testing

### Test Security Rules

1. **Test admin access:**
   ```javascript
   // In browser console (logged in as admin)
   const db = firebase.firestore();
   await db.collection('events').add({
     title: 'Test Event',
     startDate: new Date(),
     endDate: new Date()
   });
   // Should succeed ✅
   ```

2. **Test non-admin access:**
   ```javascript
   // In browser console (logged in as regular user)
   const db = firebase.firestore();
   await db.collection('events').add({
     title: 'Test Event',
     startDate: new Date(),
     endDate: new Date()
   });
   // Should fail with PERMISSION_DENIED ❌
   ```

### Test Admin Dashboard

1. Log in as an admin
2. Navigate to `/admin/dashboard`
3. Verify that:
   - Admin role displays correctly
   - Permission-based menu items show/hide correctly
   - CRUD operations work

### Test Router Guards

1. **Regular user accessing admin routes:**
   - Navigate to `/admin/dashboard` while logged in as regular user
   - Should redirect to `/` ✅

2. **Unauthenticated user accessing admin routes:**
   - Navigate to `/admin/dashboard` while logged out
   - Should redirect to `/admin/adminlogin` ✅

3. **Admin accessing regular login:**
   - Navigate to `/login` while logged in as admin
   - Should redirect to `/admin/dashboard` ✅

---

## Rollback Plan

If something goes wrong:

### 1. Rollback Security Rules

```bash
# Revert to previous rules (if you saved them)
# Edit firestore.rules back to previous version
firebase deploy --only firestore:rules
```

### 2. Disable Custom Claims (Emergency)

If custom claims cause issues, temporarily modify `src/router/index.js`:

```javascript
// TEMPORARY: Bypass custom claims check
const isAdmin = true; // Remove this line after fixing
```

⚠️ **This is insecure - only use for emergency debugging!**

---

## Verification Checklist

- [ ] Firestore rules deployed successfully
- [ ] Custom claims set for all admin users
- [ ] All admin users have signed out and back in
- [ ] Admin dashboard loads correctly
- [ ] Permission-based features work (canManageRoutes, canManagePlaces, etc.)
- [ ] Regular users cannot access admin routes
- [ ] Non-admins cannot write to events/places/routes/jeepneys
- [ ] Contact form still works for public users
- [ ] Error logging still works

---

## Troubleshooting

### "Permission denied" errors for admins

**Cause:** Custom claims not set or user hasn't re-logged in

**Solution:**
1. Run `node set-admin-custom-claims.js`
2. Have admin user sign out and sign back in
3. Check claims in browser console:
   ```javascript
   firebase.auth().currentUser.getIdTokenResult().then(result => {
     console.log(result.claims);
   });
   ```

### Admin dashboard shows "Admin profile not found"

**Cause:** Admin document missing from Firestore

**Solution:**
1. Check Firestore → `admins` collection
2. Verify document exists with user's UID
3. If missing, create it or run your admin creation script

### Router still using old sessionStorage logic

**Cause:** Browser cache

**Solution:**
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Rebuild and redeploy

---

## Next Steps

After successfully deploying Phase 1:

1. ✅ Monitor error logs for permission issues
2. ✅ Check analytics for any broken user flows
3. 📋 Proceed to Phase 2: Testing Infrastructure

---

## Support

If you encounter issues:
1. Check Firebase Console → Firestore → Rules → Usage
2. Check Firebase Console → Authentication → Users
3. Review browser console logs
4. Check Firebase function logs (if using Cloud Functions)
