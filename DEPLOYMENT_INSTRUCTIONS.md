# 🚀 Deployment Guide - Phases 1 & 2

## Quick Deploy (For Vercel Hosting)

### Step 1: Set Firebase Custom Claims for Admins

First, you need Firebase Admin credentials. Get them from:

- Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key"
- Download the JSON file

**Add the credentials to your `.env` file:**

Open `.env` and add these two lines at the bottom:

```env
# ... your existing .env variables ...

# Firebase Admin credentials (for custom claims)
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@boost-baguio.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

⚠️ **Important:**

- Use the `client_email` from the downloaded JSON file
- Use the `private_key` from the downloaded JSON file (keep the quotes and `\n` characters)
- **Do NOT commit** `.env` to git (it's in `.gitignore`)

Then run the script:

```bash
node set-admin-custom-claims.js
```

Expected output:

```
🚀 Starting to set Firebase Custom Claims for admins...

📋 Found X admin document(s)

Processing: Admin Name (super_admin)
✅ Set claims for user abc123: { admin: true, role: 'super_admin', permissions: [ 'super_admin:all' ] }

✅ Completed!
   Success: X
```

---

### Step 2: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

This will update your Firestore security rules with:

- Admin-only write access for events, places, routes, jeepneys
- Data validation for all fields
- Rules for error_logs, activity_logs, contactMessages

---

### Step 3: Deploy to Vercel

**Option A: Git Push (Recommended if Vercel connected to Git)**

```bash
git add .
git commit -m "feat: deploy Phase 1 (security) & Phase 2 (testing)"
git push origin main
```

Vercel will automatically deploy when you push to main/master.

**Option B: Vercel CLI**

```bash
# Build first
pnpm build

# Deploy to production
vercel --prod
```

---

### Step 4: Admin Re-login (CRITICAL!)

⚠️ **All admin users MUST sign out and sign back in** for custom claims to take effect.

Custom claims are embedded in the Firebase ID token, which refreshes on login.

**Tell your admins:**

> "Please sign out and sign back in to access the admin dashboard."

---

## Testing After Deployment

### 1. Test Security Rules

Open browser console on your live site:

```javascript
// Test as REGULAR user (should FAIL)
const db = firebase.firestore()
try {
  await db.collection('events').add({
    title: 'Test',
    startDate: new Date(),
    endDate: new Date(),
  })
  console.log('❌ SECURITY ISSUE: Regular user can write!')
} catch (e) {
  console.log('✅ Security working: Regular user cannot write')
}
```

### 2. Test Admin Access

1. Sign in as admin
2. Navigate to `/admin/dashboard`
3. Should load successfully ✅

Try as regular user:

1. Sign in as regular user
2. Navigate to `/admin/dashboard`
3. Should redirect to home ✅

### 3. Run Tests

```bash
# Run all tests
pnpm test:run

# Run with coverage
pnpm test:coverage

# Watch mode for development
pnpm test
```

Expected output:

```
✓ src/composables/useAdminClaims.test.js (20 tests | 1 skipped)
✓ src/stores/user-store.test.js (19 tests)
✓ src/components/PineSkeletonLoader.test.js (21 tests)
✓ src/components/ErrorBoundary.test.js (12 tests)

Test Files  4 passed (4)
Tests  71 passed | 1 skipped (72)
```

---

## Rollback Plan

### If Security Rules Break Something

```bash
# Temporarily revert rules
# Edit firestore.rules, change isAdmin() back to isAuthenticated()
firebase deploy --only firestore:rules
```

### If Admin Dashboard Breaks

1. Revert the git commit
2. Push to trigger Vercel redeploy
3. Or manually promote previous deployment in Vercel dashboard

---

## Verification Checklist

After deployment, verify:

- [ ] Admin users can access `/admin/dashboard`
- [ ] Regular users CANNOT access admin routes
- [ ] Non-admins CANNOT write to events/places/routes/jeepneys
- [ ] Public can still read events/places/routes/jeepneys
- [ ] Contact form works for public users
- [ ] Error logging still works
- [ ] All tests pass locally
- [ ] Build passes locally

---

## Troubleshooting

### "Permission denied" for admins

**Cause:** Custom claims not set or admin hasn't re-logged in

**Solution:**

1. Run `node set-admin-custom-claims.js` again
2. Have admin sign out and sign back in
3. Check claims in browser console:
   ```javascript
   firebase
     .auth()
     .currentUser.getIdTokenResult()
     .then((result) => {
       console.log('Claims:', result.claims)
     })
   ```

### Admin dashboard shows "Admin profile not found"

**Cause:** Admin document missing from Firestore

**Solution:**

1. Check Firestore → `admins` collection
2. Verify document exists with user's UID
3. If missing, create it manually or re-run admin creation script

### Tests failing after deployment

**Cause:** Usually mock caching issues in Vitest

**Solution:**

```bash
# Clear Vitest cache
rm -rf node_modules/.vite

# Reinstall and retest
pnpm install
pnpm test:run
```

---

## Post-Deployment

### Monitor for 24 Hours

Watch for:

- Error logs in Firebase Console
- Admin complaints about access
- Unusual activity in Firestore

### Next Steps

After successful deployment:

1. ✅ Monitor error logs
2. ✅ Gather admin feedback
3. 📋 Plan Phase 3 (Component Refactoring)

---

## Support

If you encounter issues:

1. **Check Firebase Logs**
   - Firebase Console → Firestore → Rules → Usage
   - Firebase Console → Authentication → Users

2. **Check Vercel Logs**
   - Vercel Dashboard → Your Project → Deployments → View Build Logs

3. **Browser Console**
   - Look for errors in admin dashboard
   - Check network tab for failed requests

4. **Review Documentation**
   - `TESTING_GUIDE.md` for test issues
   - `SECURITY_FIXES_DEPLOYMENT.md` for security details

---

## Summary

| Step                 | Command                                  | Time            |
| -------------------- | ---------------------------------------- | --------------- |
| 1. Set custom claims | `node set-admin-custom-claims.js`        | 1 min           |
| 2. Deploy rules      | `firebase deploy --only firestore:rules` | 30 sec          |
| 3. Deploy to Vercel  | `git push` or `vercel --prod`            | 2-5 min         |
| 4. Admin re-login    | Manual                                   | 1 min per admin |

**Total deployment time: ~5-10 minutes**

---

Good luck with your deployment! 🚀
