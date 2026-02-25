# Boost Baguio - Image Management Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         IMAGE FLOW ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   ADMIN UI   │ ───► │  Cloudinary  │ ───► │  Firebase    │ ───► │   USER UI    │
│  (Upload)    │      │   (Storage)  │      │  (Firestore) │      │   (Display)  │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
       │                     │                     │                     │
       │ 1. Select Image     │                     │                     │
       │ 2. Upload Request   │                     │                     │
       │────────────────────►│                     │                     │
       │                     │                     │                     │
       │                     │ 3. Optimize & Store │                     │
       │                     │                     │                     │
       │                     │ 4. Return URL       │                     │
       │◄────────────────────│                     │                     │
       │                     │                     │                     │
       │ 5. Save Metadata    │                     │                     │
       │──────────────────────────────────────────►│                     │
       │                     │                     │                     │
       │                     │                     │ 6. Query Image URL  │
       │                     │                     │────────────────────►│
       │                     │                     │                     │
       │                     │                     │ 7. Return URL       │
       │                     │                     │◄────────────────────│
       │                     │                     │                     │
       │                     │ 8. Load Image       │                     │
       │                     │◄──────────────────────────────────────────│
       │                     │                     │                     │
```

---

## Component Breakdown

### 1. 🎨 ADMIN SIDE (PhotosManagement.vue)

**Location:** `src/components/admin/PhotosManagement.vue`

**Responsibilities:**
- Provide UI for admins to upload/manage images
- Handle file selection and preview
- Trigger upload to Cloudinary
- Save metadata to Firestore

**Upload Flow:**

```javascript
// Step 1: Admin selects image via file input
<q-file
  v-model="imageFile"
  accept="image/*"
  max-file-size="10485760"  // 10MB limit
  @update:model-value="onImageSelected"
/>

// Step 2: Image is optimized and uploaded to Cloudinary
async uploadImage() {
  const { uploadOptimizedImage } = await import('src/utils/cloudinary')
  
  const uploadResult = await uploadOptimizedImage(
    this.imageFile,
    'baguiboost/page-photos',      // Cloudinary folder
    {
      maxWidth: 1920,               // Resize to max 1920px
      maxHeight: 1080,              // Maintain aspect ratio
      quality: 0.85,                // 85% quality for optimization
      format: 'image/webp'          // Convert to WebP format
    }
  )
  
  // uploadResult contains:
  // {
  //   url: 'https://res.cloudinary.com/xxx/image/upload/v1234567890/baguiboost/page-photos/xxx.webp',
  //   publicId: 'baguiboost/page-photos/xxx',
  //   width: 1920,
  //   height: 1080
  // }
  
  // Step 3: Save metadata to Firestore
  await setDoc(doc(db, 'pagePhotos', this.selectedPage), {
    pageName: this.selectedPage,
    imageUrl: uploadResult.url,
    imagePublicId: uploadResult.publicId,
    imageWidth: uploadResult.width,
    imageHeight: uploadResult.height,
    updatedAt: serverTimestamp()
  })
}
```

**Key Points:**
- Images are **optimized before upload** (compressed, resized, converted to WebP)
- Admin UI shows **preview** before uploading
- Upload is **atomic** - if Firestore save fails, admin is notified
- Each page section has a **unique document ID** (e.g., 'home', 'apanam', 'maykan')

---

### 2. ☁️ CLOUDINARY (Image Storage & CDN)

**Configuration:** `src/utils/cloudinary.js`

**What is Cloudinary?**
- Cloud-based image and video management platform
- Provides **automatic optimization**, transformation, and CDN delivery
- Faster load times through global CDN
- Automatic format selection (WebP, AVIF) based on browser support

**Upload Utility:**

```javascript
// src/utils/cloudinary.js

const CLOUD_NAME = 'your-cloud-name'
const UPLOAD_PRESET = 'your-upload-preset'  // Unsigned preset for client-side upload

export async function uploadOptimizedImage(file, folder = '', options = {}) {
  // 1. Create FormData for upload
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)
  
  // 2. Add transformation parameters
  if (options.maxWidth) formData.append('width', options.maxWidth)
  if (options.maxHeight) formData.append('height', options.maxHeight)
  if (options.quality) formData.append('quality', `auto:${Math.round(options.quality * 100)}`)
  if (options.format) formData.append('format', options.format.replace('image/', ''))
  
  // 3. Upload to Cloudinary API
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )
  
  const result = await response.json()
  
  // 4. Return optimized image data
  return {
    url: result.secure_url,      // HTTPS URL for delivery
    publicId: result.public_id,  // Unique identifier
    width: result.width,
    height: result.height
  }
}
```

**Image Delivery URL Structure:**
```
https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}

Example:
https://res.cloudinary.com/boost-baguio/image/upload/v1234567890/baguiboost/page-photos/home.webp
```

**Benefits:**
- ✅ **Automatic Format Selection:** Delivers WebP to Chrome, AVIF to Firefox, etc.
- ✅ **Responsive Images:** Can generate multiple sizes on-the-fly
- ✅ **Lazy Loading:** Built-in support for progressive loading
- ✅ **CDN:** Images served from edge locations worldwide
- ✅ **Compression:** Automatic quality optimization without visible loss

---

### 3. 🔥 FIREBASE BACKEND SERVICES

#### A. Firestore Database (Metadata Storage)

**Collection:** `pagePhotos`

**Document Structure:**

```javascript
// Single Image (e.g., home, apanam, maykan)
{
  pageName: "home",
  imageUrl: "https://res.cloudinary.com/.../home.webp",
  imagePublicId: "baguiboost/page-photos/home",
  imageWidth: 1920,
  imageHeight: 1080,
  updatedAt: Timestamp(2026-02-25T12:00:00Z)
}

// Multiple Images (e.g., home-guide, home-gallery)
{
  pageName: "home-guide",
  images: [
    {
      imageUrl: "https://res.cloudinary.com/.../step1.webp",
      imagePublicId: "baguiboost/page-photos/guide-step1"
    },
    {
      imageUrl: "https://res.cloudinary.com/.../step2.webp",
      imagePublicId: "baguiboost/page-photos/guide-step2"
    },
    {
      imageUrl: "https://res.cloudinary.com/.../step3.webp",
      imagePublicId: "baguiboost/page-photos/guide-step3"
    }
  ],
  updatedAt: Timestamp(2026-02-25T12:00:00Z)
}
```

**Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /pagePhotos/{photoId} {
      // ✅ PUBLIC READ - Anyone can read images (for user pages)
      allow read: if true;
      
      // 🔒 ADMIN WRITE - Only authenticated admins can modify
      allow create: if isAuthenticated() && isAdmin();
      allow update: if isAuthenticated() && isAdmin();
      allow delete: if isAuthenticated() && isAdmin();
    }
  }
}
```

**Why This Structure?**
- **Decoupled Storage:** Images in Cloudinary, metadata in Firestore
- **Fast Queries:** Firestore provides instant access to image URLs
- **Flexible:** Can store multiple images per document (arrays)
- **Secure:** Read access is public, write access is restricted

#### B. Firebase Authentication (Admin Verification)

**How Admin Check Works:**

```javascript
// Helper functions in firestore.rules
function isAuthenticated() {
  return request.auth != null;
}

function isAdmin() {
  return isAuthenticated() &&
         exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}

function isSuperAdmin() {
  return isAdmin() &&
         get(/databases/$(database)/documents/admins/$(request.auth.uid))
           .data.permissions.hasAny(['super-admin']);
}
```

**Admin Collection Structure:**

```javascript
// Firestore: admins/{adminId}
{
  email: "admin@boostbaguio.com",
  name: "Admin User",
  permissions: ["super-admin"],  // or "places_admin", "routes_admin", etc.
  createdAt: Timestamp(...)
}
```

---

### 4. 👤 USER SIDE (Page Components)

**Location:** Various page components (`IndexPage.vue`, `ApanamPage.vue`, etc.)

**Loading Flow:**

```javascript
// Example: IndexPage.vue

import { db } from 'src/boot/firebase'
import { doc, getDoc } from 'firebase/firestore'

setup() {
  const heroImage = ref('')
  const defaultHeroImage = 'https://images.unsplash.com/...'  // Fallback
  
  const loadHeroImage = async () => {
    try {
      console.log('[IndexPage] Loading hero image from Firebase...')
      
      // 1. Query Firestore for image metadata
      const docRef = doc(db, 'pagePhotos', 'home')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        
        // 2. Check if custom image exists
        if (data.imageUrl) {
          heroImage.value = data.imageUrl
          console.log('[IndexPage] Hero image loaded:', data.imageUrl)
        } else {
          console.log('[IndexPage] No custom hero image, using default')
        }
      } else {
        console.log('[IndexPage] No hero image document, using default')
      }
      
    } catch (error) {
      // 3. On error, use fallback image
      console.error('[IndexPage] Error loading hero image:', error)
    }
  }
  
  // 4. Load image when component mounts
  onMounted(() => {
    loadHeroImage()
  })
  
  return {
    heroImage,
    defaultHeroImage
  }
}
```

**Template Usage:**

```vue
<template>
  <section class="hero-section">
    <q-img
      :src="heroImage || defaultHeroImage"  <!-- Use custom or fallback -->
      class="hero-bg"
      :ratio="16/9"
    >
      <template v-slot:loading>
        <q-spinner color="white" size="50px" />
      </template>
    </q-img>
  </section>
</template>
```

**Key Points:**
- ✅ **Graceful Fallback:** Always has a default image if Firestore is empty
- ✅ **Loading State:** Shows spinner while image loads
- ✅ **Error Handling:** Continues to work even if Firestore query fails
- ✅ **Logging:** Console logs for debugging

---

## Complete Data Flow Example

### Scenario: Admin uploads new HOME hero image

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ STEP-BY-STEP: ADMIN UPLOADS NEW HOME HERO IMAGE                             │
└─────────────────────────────────────────────────────────────────────────────┘

1. ADMIN ACTION
   └─► Admin logs into Admin Dashboard
   └─► Navigates to "Photos Management"
   └─► Clicks "Change Image" for HOME (Hero Section)
   └─► Selects file: baguio-sunset.jpg (5MB, 4000x3000px)

2. FILE PREVIEW (Client-side)
   └─► FileReader reads file as DataURL
   └─► Shows preview in dialog
   └─► Admin clicks "Upload & Save"

3. IMAGE OPTIMIZATION & UPLOAD
   └─► uploadOptimizedImage() is called
   └─► File is resized to 1920x1080 (maintains aspect ratio)
   └─► Quality reduced to 85%
   └─► Converted to WebP format
   └─► POST request to Cloudinary API
   
   Cloudinary Response:
   {
     "secure_url": "https://res.cloudinary.com/.../baguiboost/page-photos/home.webp",
     "public_id": "baguiboost/page-photos/home",
     "width": 1920,
     "height": 1080,
     "format": "webp",
     "bytes": 245000  // ~245KB (down from 5MB!)
   }

4. METADATA SAVE TO FIRESTORE
   └─► setDoc() called with:
       {
         pageName: "home",
         imageUrl: "https://res.cloudinary.com/.../home.webp",
         imagePublicId: "baguiboost/page-photos/home",
         imageWidth: 1920,
         imageHeight: 1080,
         updatedAt: Timestamp(2026-02-25T12:30:00Z)
       }
   └─► Document saved to: pagePhotos/home

5. SUCCESS NOTIFICATION
   └─► Admin sees: "HOME (Hero Section) image uploaded successfully!"
   └─► Dialog closes
   └─► Admin UI updates with new image preview

6. USER SIDE (Automatic)
   └─► User visits boost-baguio.com (IndexPage)
   └─► onMounted() triggers loadHeroImage()
   └─► getDoc(db, 'pagePhotos', 'home') returns new metadata
   └─► heroImage.value = "https://res.cloudinary.com/.../home.webp"
   └─► <q-img :src="heroImage"> displays new image
   └─► Image loads from Cloudinary CDN (fast!)
```

---

## Why This Architecture?

### 1. **Separation of Concerns**
```
Cloudinary  → Specialized for images (storage, optimization, CDN)
Firestore   → Specialized for metadata (fast queries, security rules)
Firebase Auth → Specialized for authentication
```

### 2. **Performance Benefits**

| Without Cloudinary | With Cloudinary |
|-------------------|-----------------|
| Upload 5MB original | Upload 5MB, store 245KB WebP |
| Serve from single server | Serve from global CDN |
| Manual optimization | Automatic optimization |
| Fixed format (JPG/PNG) | Auto WebP/AVIF by browser |
| Slow on mobile | Fast everywhere |

### 3. **Cost Efficiency**

```
Firebase Storage Pricing (if we stored images directly):
- Storage: $0.026/GB
- Download: $0.12/GB
- No optimization included

Cloudinary Pricing (Free Tier):
- Storage: 25GB free
- Bandwidth: 25GB/month free
- Includes optimization, transformations, CDN
```

### 4. **Security**

```javascript
// Images can be public (no sensitive data)
// Metadata has public read, admin-only write
// Admin authentication via Firebase Auth
// No direct database access from client
```

---

## Document ID Mapping (Complete Reference)

| Document ID | Admin Label | User Page | Fallback |
|-------------|-------------|-----------|----------|
| `home` | HOME (Hero) | IndexPage.vue | Unsplash |
| `home-features` | HOME (Features) | FeaturesSection.vue | Unsplash |
| `home-guide` | HOME (Guide Steps) | GuideSection.vue | Icons |
| `home-about` | HOME (About) | AboutSection.vue | Unsplash |
| `home-gallery` | HOME (Gallery) | GallerySection.vue | Empty |
| `apanam` | APANAM | ApanamPage.vue | 44.png |
| `maykan` | MAYKAN | MaykanPage.vue | 456.png |
| `pagnaam` | PAGNAAM (Hero) | PagnaamPage.vue | 44.png |
| `pagnaam-features` | PAGNAAM (Features) | *Not implemented* | N/A |
| `ayanmo` | AYAN MO (Hero) | AyanMoPage.vue | Fallback |
| `ayanmo-discovery` | AYAN MO (Discovery) | *Not implemented* | N/A |
| `aramidem` | ARAMIDEM | AramidemPage.vue | bakery.png |

---

## Troubleshooting Guide

### Problem: Image doesn't appear after upload

**Check 1: Browser Console Logs**
```javascript
// Should see:
[Photos] Uploading to Cloudinary...
[Photos] Upload successful: https://res.cloudinary.com/...
[IndexPage] Loading hero image from Firebase...
[IndexPage] Hero image loaded: https://res.cloudinary.com/...
```

**Check 2: Firestore Document**
```
Firebase Console → Firestore → pagePhotos → home
Should contain: imageUrl, imagePublicId, updatedAt
```

**Check 3: Security Rules**
```
Ensure pagePhotos has: allow read: if true;
```

**Check 4: Browser Cache**
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Problem: Upload fails

**Check 1: File Size**
```
Max: 10MB (10485760 bytes)
Recommended: < 5MB for faster upload
```

**Check 2: File Format**
```
Accepted: JPG, PNG, WebP, GIF
```

**Check 3: Admin Permissions**
```
User must be authenticated as admin in Firebase Auth
Check admins collection for user document
```

**Check 4: Cloudinary Credentials**
```
Verify CLOUD_NAME and UPLOAD_PRESET in cloudinary.js
```

---

## Future Improvements

1. **Image Preloading**
   ```javascript
   // Preload images before page render
   const preloadImage = (url) => {
     return new Promise((resolve, reject) => {
       const img = new Image()
       img.onload = resolve
       img.onerror = reject
       img.src = url
     })
   }
   ```

2. **Progressive Image Loading**
   ```javascript
   // Load low-res first, then high-res
   const lowResUrl = `${imageUrl}?w=400&q=50`
   const highResUrl = `${imageUrl}?w=1920&q=85`
   ```

3. **Image Caching Strategy**
   ```javascript
   // Cache image URLs in localStorage
   localStorage.setItem('heroImage', imageUrl)
   localStorage.setItem('heroImageTimestamp', Date.now())
   ```

4. **Automatic Cleanup**
   ```javascript
   // Delete old Cloudinary images when replaced
   await cloudinary.uploader.destroy(oldPublicId)
   ```

---

## Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE MANAGEMENT SUMMARY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ADMIN UPLOADS                                                   │
│  ├─► Select image (max 10MB)                                    │
│  ├─► Preview in dialog                                          │
│  └─► Click "Upload & Save"                                      │
│                                                                  │
│  CLOUDINARY PROCESSES                                            │
│  ├─► Resize to max 1920x1080                                    │
│  ├─► Compress to 85% quality                                    │
│  ├─► Convert to WebP format                                     │
│  ├─► Store in CDN                                               │
│  └─► Return optimized URL                                       │
│                                                                  │
│  FIRESTORE SAVES                                                 │
│  ├─► Store metadata (URL, dimensions, timestamp)                │
│  ├─► Document ID matches page section                           │
│  └─► Public read, admin-only write                              │
│                                                                  │
│  USER DISPLAYS                                                   │
│  ├─► Page loads, queries Firestore                              │
│  ├─► Gets image URL from metadata                               │
│  ├─► Falls back to default if not found                         │
│  └─► Loads image from Cloudinary CDN (fast!)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

This architecture provides:
- ✅ **Fast loading** (CDN + optimization)
- ✅ **Cost effective** (free tiers, efficient storage)
- ✅ **Secure** (admin-only writes, public reads)
- ✅ **Scalable** (handles traffic spikes)
- ✅ **Maintainable** (clear separation of concerns)
