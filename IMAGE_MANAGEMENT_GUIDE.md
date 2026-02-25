# Image Management Guide - Boost Baguio

This document describes how images are managed between the Admin panel and User-facing pages.

## Overview

All page images are stored in Firebase Storage (via Cloudinary) and metadata is saved in Firestore under the `pagePhotos` collection.

## Firestore Collection: `pagePhotos`

### Security Rules (Updated)
```javascript
match /pagePhotos/{photoId} {
  // Anyone can read page photos (for public pages)
  // Only admins can write/delete page photos
  allow read: if true;
  allow create: if isAuthenticated() && isAdmin();
  allow update: if isAuthenticated() && isAdmin();
  allow delete: if isAuthenticated() && isAdmin();
}
```

## Document ID Mapping

| Document ID | Admin Label | User Page/Component | Fallback Image |
|-------------|-------------|---------------------|----------------|
| `home` | HOME (Hero Section) | `IndexPage.vue` | Unsplash default |
| `home-features` | HOME (Features Section) | `FeaturesSection.vue` | Unsplash image |
| `home-guide` | HOME (Guide Steps - 3 Images) | `GuideSection.vue` | None (uses icons) |
| `home-about` | HOME (About Section) | `AboutSection.vue` | Unsplash image |
| `home-gallery` | HOME (Gallery Section) | `GallerySection.vue` | None (empty) |
| `apanam` | APANAM | `ApanamPage.vue` | `src/assets/44.png` |
| `maykan` | MAYKAN | `MaykanPage.vue` | `src/assets/456.png` |
| `pagnaam` | PAGNAAM (Hero) | `PagnaamPage.vue` | `src/assets/44.png` |
| `pagnaam-features` | PAGNAAM (Features Section) | *Not yet implemented* | N/A |
| `ayanmo` | AYAN MO (Hero) | `AyanMoPage.vue` | Fallback image |
| `ayanmo-discovery` | AYAN MO (Discovery Section) | *Not yet implemented* | N/A |
| `aramidem` | ARAMIDEM | `AramidemPage.vue` | `src/assets/bakery.png` |

## Image Upload Flow (Admin Side)

1. Admin navigates to Admin Dashboard → Photos Management
2. Clicks "Change Image" for the desired section
3. Selects an image file (max 10MB, recommended 1920x1080px)
4. Image is uploaded to Cloudinary with optimization:
   - Format: WebP
   - Max dimensions: 1920x1080
   - Quality: 85%
5. Image metadata is saved to Firestore `pagePhotos/{documentId}`:
   ```javascript
   {
     pageName: string,
     imageUrl: string,        // Cloudinary URL
     imagePublicId: string,   // Cloudinary public ID
     imageWidth: number,
     imageHeight: number,
     updatedAt: timestamp
   }
   ```

## Image Loading Flow (User Side)

Each page/component loads its image on mount:

```javascript
const loadHeroImage = async () => {
  try {
    const docRef = doc(db, 'pagePhotos', 'home')
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists() && docSnap.data().imageUrl) {
      heroImage.value = docSnap.data().imageUrl
    } else {
      // Use fallback image
    }
  } catch (error) {
    console.error('Error loading image:', error)
    // Use fallback image
  }
}
```

## Special Cases

### home-guide (Guide Steps)
Stores an array of 3 images:
```javascript
{
  pageName: 'home-guide',
  images: [
    { imageUrl: string, imagePublicId: string },
    { imageUrl: string, imagePublicId: string },
    { imageUrl: string, imagePublicId: string }
  ],
  updatedAt: timestamp
}
```

### home-gallery (Gallery Section)
Stores an array of gallery images:
```javascript
{
  pageName: 'home-gallery',
  images: [
    { imageUrl: string, imagePublicId: string },
    // ... more images
  ],
  updatedAt: timestamp
}
```

## Troubleshooting

### Issue: Default image shows instead of uploaded image

**Possible causes:**
1. **Firestore rules blocking reads** - Fixed: Rules now allow public read access
2. **Image upload failed** - Check admin console for error messages
3. **Page not refreshed** - Refresh the browser after uploading
4. **Browser cache** - Clear cache or do hard refresh (Ctrl+Shift+R)
5. **Wrong document ID** - Verify admin is saving to correct document ID

**Debugging steps:**
```javascript
// Check browser console for logs like:
[IndexPage] Loading hero image from Firebase...
[IndexPage] Hero image loaded: https://res.cloudinary.com/...
```

### Issue: Upload fails in admin

**Possible causes:**
1. **File too large** - Image must be < 10MB
2. **Invalid format** - Only JPG, PNG, WebP allowed
3. **Network error** - Check internet connection
4. **Admin permissions** - User must be logged in as admin

## Testing

To verify images are loading correctly:

1. **Upload a test image via Admin:**
   - Go to Admin Dashboard → Photos Management
   - Upload a new image for any section
   - Confirm success notification appears

2. **Check User side:**
   - Navigate to the corresponding page
   - Open browser console (F12)
   - Look for log messages: `[PageName] Hero image loaded: ...`
   - Verify the new image appears

3. **Verify Firestore:**
   - Go to Firebase Console → Firestore
   - Navigate to `pagePhotos` collection
   - Check the document exists with correct `imageUrl`

## Future Enhancements

- [ ] Implement `pagnaam-features` loading in PagnaamPage
- [ ] Implement `ayanmo-discovery` loading in AyanMoPage
- [ ] Add image caching strategy
- [ ] Add loading states for all images
- [ ] Add image optimization hints in admin UI
- [ ] Add bulk upload for gallery images
