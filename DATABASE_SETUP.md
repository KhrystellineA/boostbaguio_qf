# 🗄️ Boost Baguio - Database Setup Guide

Complete guide to setting up your Firestore database with all collections and sample data.

---

## 📋 Database Structure

### **Collections Overview**

| Collection | Feature | Purpose |
|------------|---------|---------|
| `events` | ARAMIDEM | Events & Festivals |
| `places` | APANAM | Tourist Spots |
| `places` | MAYKAN | Food & Restaurants |
| `places` | AYANMO | Discovery & Places |
| `routes` | PAGNAAM | Jeepney Routes |
| `jeepneyOptions` | PAGNAAM | Jeepney Variants |
| `photos` | Gallery | Photo Collection |
| `users` | User Accounts | Regular Users |
| `admins` | Admin Panel | Admin Users |
| `contactMessages` | Contact Page | Form Submissions |

---

## 🚀 Quick Setup

### **Prerequisites**

1. ✅ Firebase project created (`boost-baguio`)
2. ✅ Firestore Database enabled
3. ✅ Admin user created in Authentication
4. ✅ `.env` file configured

### **Step 1: Install dotenv**

```bash
pnpm add dotenv
```

### **Step 2: Deploy Security Rules**

```bash
firebase login
firebase use boost-baguio
firebase deploy --only firestore:rules,firestore:indexes
```

### **Step 3: Run Database Setup**

```bash
node setup-database.js
```

Enter your admin password when prompted.

This will create:
- ✅ 4 sample events (ARAMIDEM)
- ✅ 5 tourist spots (APANAM)
- ✅ 3 food places (MAYKAN)
- ✅ 3 jeepney routes (PAGNAAM)
- ✅ 3 photos (Gallery)

---

## 📊 Collection Schemas

### **events** (ARAMIDEM)

```javascript
{
  title: string,              // Event name
  location: string,           // Venue
  category: string,           // 'festival' | 'concert' | 'cultural' | 'sports'
  startDate: string,          // YYYY-MM-DD
  endDate: string,            // YYYY-MM-DD
  startTime: string,          // HH:MM
  endTime: string,            // HH:MM
  status: string,             // 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  organizer: string,          // Organizer name
  contactEmail: string,       // Contact email
  contactPhone: string,       // Contact phone
  description: string,        // Full description
  featured: boolean,          // Show on homepage
  imageUrl: string,           // Cloudinary image URL
  createdAt: timestamp        // Auto-generated
}
```

### **places** (APANAM, MAYKAN, AYANMO)

```javascript
{
  name: string,               // Place name
  category: string,           // 'tourist-spot' | 'restaurant' | 'hotel' | 'shopping' | 'cafe'
  description: string,        // Description
  latitude: number,           // For maps
  longitude: number,          // For maps
  address: string,            // Full address
  operatingHours: {           // Operating hours
    open: string,             // HH:MM
    close: string,            // HH:MM
    days: string              // 'Daily' | 'Mon-Fri' etc.
  },
  contactInfo: {              // Contact details
    phone: string,
    email: string,
    website: string
  },
  rating: number,             // 1-5 stars
  verified: boolean,          // Verified by admin
  featured: boolean,          // Show on homepage
  priceRange: string,         // '₱' | '₱₱' | '₱₱₱' (for restaurants)
  cuisine: string,            // Cuisine type (for restaurants)
  imageUrl: string,           // Main image
  gallery: string[],          // Additional images
  createdAt: timestamp
}
```

### **routes** (PAGNAAM)

```javascript
{
  name: string,               // Route name (e.g., "Session Road - Loakan")
  routeNumber: string,        // Route number
  jeepneyType: string,        // 'Regular' | 'Aircon' | 'E-Jeep'
  color: string,              // Route color for UI
  description: string,        // Route description
  fare: number,               // Minimum fare in PHP
  operatingHours: {           // Operating hours
    start: string,            // HH:MM
    end: string               // HH:MM
  },
  active: boolean,            // Currently operating
  stops: [{                  // Array of stops
    name: string,
    lat: number,
    lng: number,
    order: number             // Stop order
  }],
  imageUrl: string,           // Route image
  createdAt: timestamp
}
```

### **photos**

```javascript
{
  title: string,              // Photo title
  category: string,           // 'landscape' | 'festival' | 'landmark' | 'culture'
  photographer: string,       // Photographer name
  featured: boolean,          // Show on homepage
  imageUrl: string,           // Cloudinary URL
  uploadedBy: string,         // User UID
  createdAt: timestamp
}
```

### **users**

```javascript
{
  email: string,
  displayName: string,
  photoURL: string,
  role: string,               // 'user' | 'admin'
  isPremium: boolean,
  premiumExpiry: timestamp,
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

### **admins**

```javascript
{
  email: string,
  name: string,
  permissions: string[],      // ['super-admin'] | ['route_manager'] | ['content_admin']
  createdBy: string,          // UID of super-admin
  createdAt: timestamp
}
```

---

## 🔧 Manual Data Entry (Firebase Console)

If you prefer to add data manually:

### **1. Go to Firebase Console**

https://console.firebase.google.com/project/boost-baguio/firestore

### **2. Create Collection**

Click **"Start collection"**

### **3. Add Document**

- Click **"Add document"**
- Fill in fields according to schema
- Click **"Save"**

---

## 📱 Feature-to-Collection Mapping

| Feature Page | Collection | Data Displayed |
|-------------|------------|----------------|
| **ARAMIDEM** | `events` | Events list, event details, featured events |
| **APANAM** | `places` (category: tourist-spot) | Tourist spots list, spot details, map view |
| **MAYKAN** | `places` (category: restaurant, cafe) | Food places, cuisine types, price range |
| **PAGNAAM** | `routes` + `jeepneyOptions` | Route list, route details, interactive map |
| **AYANMO** | `places` (all categories) | Discovery quiz, recommended places |
| **Home** | All collections | Featured events, top spots, gallery |

---

## 🎯 Sample Queries

### **Get Featured Events**

```javascript
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const q = query(
  collection(db, 'events'),
  where('featured', '==', true),
  where('status', '==', 'upcoming')
)

const snapshot = await getDocs(q)
const events = snapshot.docs.map(doc => doc.data())
```

### **Get Tourist Spots**

```javascript
const q = query(
  collection(db, 'places'),
  where('category', '==', 'tourist-spot'),
  where('verified', '==', true)
)

const snapshot = await getDocs(q)
const spots = snapshot.docs.map(doc => doc.data())
```

### **Get Active Routes**

```javascript
const q = query(
  collection(db, 'routes'),
  where('active', '==', true)
)

const snapshot = await getDocs(q)
const routes = snapshot.docs.map(doc => doc.data())
```

---

## 🔄 Update Existing Data

### **Update a Document**

```javascript
import { doc, updateDoc } from 'firebase/firestore'

const eventRef = doc(db, 'events', 'documentId')
await updateDoc(eventRef, {
  status: 'ongoing',
  lastUpdated: new Date().toISOString()
})
```

### **Delete a Document**

```javascript
import { doc, deleteDoc } from 'firebase/firestore'

const eventRef = doc(db, 'events', 'documentId')
await deleteDoc(eventRef)
```

---

## ✅ Setup Checklist

- [ ] Install dotenv: `pnpm add dotenv`
- [ ] Deploy security rules: `firebase deploy --only firestore:rules,firestore:indexes`
- [ ] Run setup script: `node setup-database.js`
- [ ] Verify data in Firebase Console
- [ ] Test features in development:
  - [ ] ARAMIDEM shows events
  - [ ] APANAM shows tourist spots
  - [ ] MAYKAN shows food places
  - [ ] PAGNAAM shows routes
  - [ ] AYANMO shows places
  - [ ] Home page shows featured items

---

## 🐛 Troubleshooting

### **Error: Missing environment variables**

**Solution:** Ensure `.env` file exists with all Firebase config values.

### **Error: Permission denied**

**Solution:**
1. Check if security rules are deployed
2. Verify admin user exists in Authentication
3. Create admin document in Firestore `admins` collection

### **Error: Admin email not found**

**Solution:** Create admin user in Firebase Console > Authentication > Add user.

---

## 📚 Next Steps

After database setup:

1. **Test all features** in development mode
2. **Add more data** via Firebase Console or setup script
3. **Configure Cloudinary** for image uploads
4. **Deploy to Firebase Hosting** when ready

---

**Your database is now ready to power all Boost Baguio features!** 🎉
