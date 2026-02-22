/**
 * Boost Baguio - Database Setup Script
 * 
 * This script initializes the Firestore database with collections and sample data
 * for all major features: ARAMIDEM (Events), APANAM (Tourist Spots), 
 * PAGNAAM (Jeepney Routes), MAYKAN (Food), AYANMO (Discovery), etc.
 * 
 * Usage: node setup-database.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { createInterface } from 'readline'
import 'dotenv/config'

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validate configuration
if (!firebaseConfig.apiKey) {
  console.error('❌ Firebase configuration missing. Please create .env file.')
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'superadmin@baguioboosters.com'

// readline for password
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

// ============================================
// DATABASE STRUCTURE
// ============================================

/**
 * Collections:
 * 1. events - ARAMIDEM (Events & Festivals)
 * 2. places - APANAM (Tourist Spots) + MAYKAN (Food) + AYANMO (Discovery)
 * 3. routes - PAGNAAM (Jeepney Routes)
 * 4. jeepneyOptions - PAGNAAM (Jeepney variants)
 * 5. photos - Photo gallery
 * 6. admins - Admin users
 * 7. users - Regular users
 * 8. contactMessages - Contact form submissions
 */

// ============================================
// SAMPLE DATA
// ============================================

const events = [
  {
    title: "Panagbenga Grand Opening Day Parade",
    location: "Panagbenga Park to Melvin Jones Football Grounds",
    category: "festival",
    startDate: "2026-02-01",
    endDate: "2026-02-01",
    startTime: "08:00",
    endTime: "12:00",
    status: "upcoming",
    organizer: "BFFFI / Baguio City Government",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "The official start of the 30th Panagbenga Festival featuring elementary school drum and lyre corps and festive street dancing along Session Road.",
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Panagbenga+Opening"
  },
  {
    title: "Panagbenga Grand Street Dance Parade",
    location: "Panagbenga Park → Session Road → Harrison Road → Melvin Jones",
    category: "festival",
    startDate: "2026-02-28",
    endDate: "2026-02-28",
    startTime: "08:00",
    endTime: "16:00",
    status: "upcoming",
    organizer: "BFFFI",
    description: "THE MAIN HIGHLIGHT! A massive parade of dancers in vibrant, flower-inspired costumes performing to the rhythmic Panagbenga hymn.",
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Street+Dance"
  },
  {
    title: "Panagbenga Grand Floral Float Parade",
    location: "Panagbenga Park to Melvin Jones Football Grounds",
    category: "festival",
    startDate: "2026-03-01",
    endDate: "2026-03-01",
    startTime: "08:00",
    endTime: "17:00",
    status: "upcoming",
    organizer: "BFFFI",
    description: "The festival's MOST FAMOUS event! Giant floats made entirely of fresh flowers parade through the city streets.",
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Floral+Float"
  },
  {
    title: "Session Road in Bloom",
    location: "Session Road (Entire length closed to traffic)",
    category: "festival",
    startDate: "2026-03-02",
    endDate: "2026-03-08",
    startTime: "09:00",
    endTime: "22:00",
    status: "upcoming",
    organizer: "BFFFI / Baguio City Government",
    description: "Baguio's main thoroughfare transforms into a pedestrian mall with sidewalk cafés, floral installations, and local merchant stalls.",
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Session+Road"
  }
]

const touristSpots = [
  // Top 10 Most Popular
  {
    name: "Burnham Park",
    category: "tourist-spot",
    description: "Baguio's most popular park featuring a man-made lake, bike paths, skating rink, and recreational facilities in the heart of the city.",
    latitude: 16.4158,
    longitude: 120.5936,
    address: "Session Road, Baguio City",
    operatingHours: { open: "06:00", close: "20:00", days: "Daily" },
    contactInfo: { phone: "+63 74 442 2772" },
    rating: 4.5,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Burnham+Park",
    gallery: []
  },
  {
    name: "Mines View Park",
    category: "tourist-spot",
    description: "Scenic overlook offering panoramic views of the Cordillera mountains and former mining areas. Features Igorot statues and souvenir shops.",
    latitude: 16.4297,
    longitude: 120.6156,
    address: "Mines View Park Road, Baguio City",
    operatingHours: { open: "05:00", close: "20:00", days: "Daily" },
    rating: 4.4,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Mines+View"
  },
  {
    name: "The Mansion",
    category: "tourist-spot",
    description: "Official summer residence of the President of the Philippines with beautiful gardens, peacocks, and colonial architecture.",
    latitude: 16.4358,
    longitude: 120.6089,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "06:00", close: "18:00", days: "Daily" },
    rating: 4.3,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=The+Mansion"
  },
  {
    name: "Baguio Cathedral",
    category: "tourist-spot",
    description: "Our Lady of the Atonement Cathedral, a famous landmark with distinctive red and white architecture and panoramic city views.",
    latitude: 16.4167,
    longitude: 120.5936,
    address: "Session Road, Baguio City",
    operatingHours: { open: "05:00", close: "20:00", days: "Daily" },
    rating: 4.6,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Baguio+Cathedral"
  },
  {
    name: "Camp John Hay",
    category: "tourist-spot",
    description: "Former US military rest and recreation facility, now a leisure and business park with pine trees, golf course, and recreational activities.",
    latitude: 16.4419,
    longitude: 120.6197,
    address: "Loakan Road, Baguio City",
    operatingHours: { open: "00:00", close: "23:59", days: "Daily" },
    rating: 4.5,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Camp+John+Hay"
  },
  {
    name: "Tam-awan Village",
    category: "tourist-spot",
    description: "Cultural village showcasing traditional Cordillera architecture, indigenous art, and authentic Ifugao huts on stilts.",
    latitude: 16.4289,
    longitude: 120.5856,
    address: "Pinsao Pilot, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Daily" },
    contactInfo: { phone: "+63 74 442 2970" },
    rating: 4.4,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Tam-awan+Village"
  },
  {
    name: "BenCab Museum",
    category: "tourist-spot",
    description: "Home to National Artist Benedicto Cabrera's works. Features contemporary and traditional Cordillera art, artifacts, and a café with mountain views.",
    latitude: 16.4378,
    longitude: 120.6089,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "09:00", close: "17:00", days: "Tue-Sun" },
    contactInfo: { phone: "+63 74 442 2970", website: "https://bencabmuseum.org" },
    rating: 4.7,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=BenCab+Museum"
  },
  {
    name: "Strawberry Farm",
    category: "tourist-spot",
    description: "Pick-your-own strawberry farm in La Trinidad. Experience strawberry picking and buy fresh strawberries and products.",
    latitude: 16.4556,
    longitude: 120.5967,
    address: "La Trinidad, Benguet (near Baguio)",
    operatingHours: { open: "06:00", close: "18:00", days: "Daily" },
    rating: 4.2,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Strawberry+Farm"
  },
  {
    name: "Baguio Botanical Garden",
    category: "tourist-spot",
    description: "Also known as Igorota Garden, featuring native plants, flowers, and sculptures showcasing Cordillera culture.",
    latitude: 16.4267,
    longitude: 120.5889,
    address: "Leonard Wood Rd, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Daily" },
    rating: 4.3,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Botanical+Garden"
  },
  {
    name: "Mirador House",
    category: "tourist-spot",
    description: "Historic Spanish-era house with stunning views of Baguio City. Popular photo spot with vintage architecture.",
    latitude: 16.4356,
    longitude: 120.6078,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "09:00", close: "17:00", days: "Daily" },
    rating: 4.4,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Mirador+House"
  },
  // More Popular Spots (11-20)
  {
    name: "Session Road",
    category: "tourist-spot",
    description: "Baguio's main thoroughfare and commercial hub. Famous for shopping, dining, and the annual Session Road in Bloom festival.",
    latitude: 16.4167,
    longitude: 120.5947,
    address: "Session Road, Baguio City",
    operatingHours: { open: "00:00", close: "23:59", days: "Daily" },
    rating: 4.5,
    verified: true,
    featured: true,
    imageUrl: "https://via.placeholder.com/800x600?text=Session+Road"
  },
  {
    name: "SM City Baguio",
    category: "tourist-spot",
    description: "One of the largest shopping malls in the Philippines built on a former military base. Features shopping, dining, and entertainment.",
    latitude: 16.4234,
    longitude: 120.5967,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "10:00", close: "21:00", days: "Daily" },
    rating: 4.4,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=SM+City+Baguio"
  },
  {
    name: "Baguio City Market",
    category: "tourist-spot",
    description: "Public market selling fresh produce, souvenirs, textiles, and local products. Great for buying pasalubong.",
    latitude: 16.4178,
    longitude: 120.5945,
    address: "Magsaysay Ave, Baguio City",
    operatingHours: { open: "04:00", close: "18:00", days: "Daily" },
    rating: 4.1,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Baguio+Market"
  },
  {
    name: "Wright Park",
    category: "tourist-spot",
    description: "Scenic park with a long pool, horseback riding, and the famous stairway leading to the Mansion. Surrounded by pine trees.",
    latitude: 16.4345,
    longitude: 120.6089,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "06:00", close: "18:00", days: "Daily" },
    rating: 4.3,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Wright+Park"
  },
  {
    name: "The Mansion Gate",
    category: "tourist-spot",
    description: "Iconic gate entrance to The Mansion with two lion statues. Popular photo spot with great city views.",
    latitude: 16.4334,
    longitude: 120.6078,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "00:00", close: "23:59", days: "Daily" },
    rating: 4.2,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Mansion+Gate"
  },
  {
    name: "Baguio Country Club",
    category: "tourist-spot",
    description: "Historic private club with an 18-hole golf course designed by Donald Ross. Open to visitors for golf and dining.",
    latitude: 16.4389,
    longitude: 120.6156,
    address: "Military Cut-off Rd, Baguio City",
    operatingHours: { open: "06:00", close: "20:00", days: "Daily" },
    contactInfo: { phone: "+63 74 442 2651" },
    rating: 4.4,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Country+Club"
  },
  {
    name: "Our Lady of Lourdes Grotto",
    category: "tourist-spot",
    description: "Hilltop shrine with a replica of the Lourdes grotto in France. Features 252 steps and panoramic city views.",
    latitude: 16.4289,
    longitude: 120.5978,
    address: "Kisad Rd, Baguio City",
    operatingHours: { open: "06:00", close: "18:00", days: "Daily" },
    rating: 4.5,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Lourdes+Grotto"
  },
  {
    name: "Philippine Military Academy (PMA)",
    category: "tourist-spot",
    description: "Prestigious military academy with beautiful grounds. Open to visitors during special events and parades.",
    latitude: 16.4456,
    longitude: 120.6234,
    address: "Fort Del Pilar, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Mon-Fri" },
    rating: 4.6,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=PMA"
  },
  {
    name: "Baguio Arts Gallery",
    category: "tourist-spot",
    description: "Contemporary art gallery showcasing works by local and national artists. Features paintings, sculptures, and installations.",
    latitude: 16.4156,
    longitude: 120.5928,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "10:00", close: "18:00", days: "Tue-Sun" },
    rating: 4.3,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Arts+Gallery"
  },
  {
    name: "Igorota Garden",
    category: "tourist-spot",
    description: "Beautiful garden park featuring native Cordillera plants, flowers, and traditional sculptures. Great for relaxation and photos.",
    latitude: 16.4278,
    longitude: 120.5878,
    address: "Leonard Wood Rd, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Daily" },
    rating: 4.2,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Igorota+Garden"
  },
  // Additional Spots (21-30)
  {
    name: "Pine Grove Hotel & Convention Center",
    category: "tourist-spot",
    description: "Historic hotel surrounded by pine trees. Features gardens, pools, and conference facilities in a scenic setting.",
    latitude: 16.4367,
    longitude: 120.6123,
    address: "Military Cut-off Rd, Baguio City",
    operatingHours: { open: "00:00", close: "23:59", days: "Daily" },
    rating: 4.1,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Pine+Grove"
  },
  {
    name: "Baguio Hill Station",
    category: "tourist-spot",
    description: "Scenic viewpoint offering panoramic views of Baguio City and surrounding mountains. Popular for sunrise and sunset.",
    latitude: 16.4312,
    longitude: 120.6045,
    address: "Kisad Rd, Baguio City",
    operatingHours: { open: "05:00", close: "20:00", days: "Daily" },
    rating: 4.3,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Hill+Station"
  },
  {
    name: "Nagcarlan Underground Cemetery",
    category: "tourist-spot",
    description: "Historic cemetery with underground crypts. One of the few underground cemeteries in the Philippines.",
    latitude: 16.4189,
    longitude: 120.5967,
    address: "Nagcarlan St, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Daily" },
    rating: 4.0,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Cemetery"
  },
  {
    name: "Baguio Convention Center",
    category: "tourist-spot",
    description: "Modern convention center hosting events, conferences, and exhibitions. Features contemporary architecture.",
    latitude: 16.4245,
    longitude: 120.5989,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "08:00", close: "20:00", days: "Daily" },
    rating: 4.2,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Convention+Center"
  },
  {
    name: "Teachers Camp",
    category: "tourist-spot",
    description: "Historic training center for teachers with beautiful grounds, amphitheater, and pine trees. Open to visitors.",
    latitude: 16.4289,
    longitude: 120.6012,
    address: "Kisad Rd, Baguio City",
    operatingHours: { open: "06:00", close: "18:00", days: "Daily" },
    rating: 4.3,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Teachers+Camp"
  },
  {
    name: "Baguio Central School",
    category: "tourist-spot",
    description: "Historic elementary school with American-era architecture. Known for its well-preserved heritage buildings.",
    latitude: 16.4178,
    longitude: 120.5923,
    address: "Session Road, Baguio City",
    operatingHours: { open: "07:00", close: "17:00", days: "Mon-Fri" },
    rating: 4.1,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Central+School"
  },
  {
    name: "Baguio Post Office",
    category: "tourist-spot",
    description: "Historic post office building with American-era architecture. Still operational and offers postal services.",
    latitude: 16.4167,
    longitude: 120.5934,
    address: "Session Road, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Mon-Fri" },
    rating: 4.0,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Post+Office"
  },
  {
    name: "Baguio City Hall",
    category: "tourist-spot",
    description: "Seat of city government with distinctive architecture. Features a park and open grounds for events.",
    latitude: 16.4156,
    longitude: 120.5912,
    address: "Session Road, Baguio City",
    operatingHours: { open: "08:00", close: "17:00", days: "Mon-Fri" },
    rating: 4.1,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=City+Hall"
  },
  {
    name: "Baguio General Hospital",
    category: "tourist-spot",
    description: "Historic hospital with American-era architecture. One of the oldest medical facilities in the region.",
    latitude: 16.4145,
    longitude: 120.5901,
    address: "Leonard Wood Rd, Baguio City",
    operatingHours: { open: "00:00", close: "23:59", days: "Daily" },
    rating: 4.0,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=General+Hospital"
  },
  {
    name: "Baguio Athletic Bowl",
    category: "tourist-spot",
    description: "Historic sports venue hosting track and field events. Surrounded by pine trees and offers city views.",
    latitude: 16.4234,
    longitude: 120.5945,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "06:00", close: "18:00", days: "Daily" },
    rating: 4.2,
    verified: true,
    featured: false,
    imageUrl: "https://via.placeholder.com/800x600?text=Athletic+Bowl"
  }
]

const foodPlaces = [
  {
    name: "Good Taste Restaurant",
    category: "restaurant",
    description: "Famous local restaurant known for affordable Filipino-Chinese cuisine.",
    latitude: 16.4167,
    longitude: 120.5947,
    address: "Session Road, Baguio City",
    operatingHours: { open: "09:00", close: "21:00", days: "Daily" },
    contactInfo: { phone: "+63 74 442 5818" },
    rating: 4.3,
    verified: true,
    featured: true,
    priceRange: "₱₱",
    cuisine: "Filipino-Chinese",
    imageUrl: "https://via.placeholder.com/800x600?text=Good+Taste"
  },
  {
    name: "Café by the Ruins",
    category: "restaurant",
    description: "Garden restaurant serving organic and locally-sourced ingredients.",
    latitude: 16.4156,
    longitude: 120.5928,
    address: "Upper Gen. Luna St, Baguio City",
    operatingHours: { open: "09:00", close: "21:00", days: "Tue-Sun" },
    contactInfo: { phone: "+63 74 442 7167" },
    rating: 4.5,
    verified: true,
    featured: true,
    priceRange: "₱₱₱",
    cuisine: "Filipino-Continental",
    imageUrl: "https://via.placeholder.com/800x600?text=Cafe+Ruins"
  },
  {
    name: "Oh My Strawberries",
    category: "restaurant",
    description: "Famous strawberry-themed café and dessert shop.",
    latitude: 16.4189,
    longitude: 120.5956,
    address: "Session Road, Baguio City",
    operatingHours: { open: "10:00", close: "22:00", days: "Daily" },
    rating: 4.4,
    verified: true,
    priceRange: "₱₱",
    cuisine: "Desserts & Beverages",
    imageUrl: "https://via.placeholder.com/800x600?text=Strawberries"
  }
]

const jeepneyRoutes = [
  {
    name: "Session Road - Loakan",
    routeNumber: "1",
    jeepneyType: "Regular",
    color: "#FF6B6B",
    description: "Main route connecting Session Road to Loakan Airport area.",
    fare: 13,
    operatingHours: { start: "05:00", end: "22:00" },
    active: true,
    stops: [
      { name: "Session Road", lat: 16.4167, lng: 120.5936, order: 1 },
      { name: "Melvin Jones", lat: 16.4156, lng: 120.5928, order: 2 },
      { name: "Burnham Park", lat: 16.4145, lng: 120.5920, order: 3 },
      { name: "Loakan Airport", lat: 16.4089, lng: 120.5856, order: 4 }
    ],
    imageUrl: "https://via.placeholder.com/800x600?text=Route+1"
  },
  {
    name: "Baguio - La Trinidad",
    routeNumber: "2",
    jeepneyType: "Regular",
    color: "#4ECDC4",
    description: "Route from Baguio City to La Trinidad, Benguet.",
    fare: 15,
    operatingHours: { start: "04:30", end: "22:00" },
    active: true,
    stops: [
      { name: "Session Road", lat: 16.4167, lng: 120.5936, order: 1 },
      { name: "SM Baguio", lat: 16.4234, lng: 120.5967, order: 2 },
      { name: "Public Market", lat: 16.4178, lng: 120.5945, order: 3 },
      { name: "La Trinidad", lat: 16.4456, lng: 120.5967, order: 4 }
    ],
    imageUrl: "https://via.placeholder.com/800x600?text=Route+2"
  },
  {
    name: "Baguio - Tam-Awan",
    routeNumber: "3",
    jeepneyType: "Regular",
    color: "#95E1D3",
    description: "Route to Tam-Awan Village and northern barangays.",
    fare: 15,
    operatingHours: { start: "05:00", end: "20:00" },
    active: true,
    stops: [
      { name: "Session Road", lat: 16.4167, lng: 120.5936, order: 1 },
      { name: "Baguio Cathedral", lat: 16.4178, lng: 120.5945, order: 2 },
      { name: "Tam-Awan Village", lat: 16.4289, lng: 120.5856, order: 3 }
    ],
    imageUrl: "https://via.placeholder.com/800x600?text=Route+3"
  }
]

const photos = [
  {
    title: "Baguio Sunrise",
    category: "landscape",
    photographer: "Boost Baguio Team",
    featured: true,
    imageUrl: "https://via.placeholder.com/1920x1080?text=Baguio+Sunrise"
  },
  {
    title: "Panagbenga Festival",
    category: "festival",
    photographer: "Boost Baguio Team",
    featured: true,
    imageUrl: "https://via.placeholder.com/1920x1080?text=Panagbenga"
  },
  {
    title: "Baguio Cathedral",
    category: "landmark",
    photographer: "Boost Baguio Team",
    featured: true,
    imageUrl: "https://via.placeholder.com/1920x1080?text=Cathedral"
  }
]

// ============================================
// MAIN SETUP FUNCTION
// ============================================

async function setupDatabase() {
  console.log('🚀 Boost Baguio - Database Setup\n')
  console.log(`📦 Connected to: ${firebaseConfig.projectId}\n`)

  try {
    // Authenticate
    console.log('🔐 ADMIN AUTHENTICATION REQUIRED')
    console.log(`Email: ${ADMIN_EMAIL}`)
    const password = await question('Password: ')

    console.log('\n🔑 Signing in...')
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
    console.log('✅ Successfully authenticated!\n')

    // Create collections
    console.log('📝 Setting up collections...\n')

    // 1. Events Collection
    console.log('📅 Creating Events (ARAMIDEM)...')
    let eventCount = 0
    for (const event of events) {
      await addDoc(collection(db, 'events'), {
        ...event,
        createdAt: serverTimestamp()
      })
      eventCount++
      console.log(`   ✅ Added: ${event.title}`)
    }
    console.log(`   📊 Total events: ${eventCount}\n`)

    // 2. Places Collection (Tourist Spots, Food, etc.)
    console.log('📍 Creating Places (APANAM, MAYKAN, AYANMO)...')
    let placeCount = 0
    
    // Tourist spots (30 total)
    for (const place of touristSpots) {
      await addDoc(collection(db, 'places'), {
        ...place,
        createdAt: serverTimestamp()
      })
      placeCount++
      console.log(`   ✅ Added: ${place.name} (Tourist Spot)`)
    }
    console.log(`   📊 Total tourist spots: ${touristSpots.length}`)
    
    // Food places
    for (const place of foodPlaces) {
      await addDoc(collection(db, 'places'), {
        ...place,
        createdAt: serverTimestamp()
      })
      placeCount++
      console.log(`   ✅ Added: ${place.name} (Food)`)
    }
    console.log(`   📊 Total places: ${placeCount} (${touristSpots.length} tourist spots + ${foodPlaces.length} food places)\n`)

    // 3. Routes Collection
    console.log('🚌 Creating Routes (PAGNAAM)...')
    let routeCount = 0
    for (const route of jeepneyRoutes) {
      await addDoc(collection(db, 'routes'), {
        ...route,
        createdAt: serverTimestamp()
      })
      routeCount++
      console.log(`   ✅ Added: ${route.name}`)
    }
    console.log(`   📊 Total routes: ${routeCount}\n`)

    // 4. Photos Collection
    console.log('📸 Creating Photos...')
    let photoCount = 0
    for (const photo of photos) {
      await addDoc(collection(db, 'photos'), {
        ...photo,
        uploadedBy: auth.currentUser.uid,
        createdAt: serverTimestamp()
      })
      photoCount++
      console.log(`   ✅ Added: ${photo.title}`)
    }
    console.log(`   📊 Total photos: ${photoCount}\n`)

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('🎉 DATABASE SETUP COMPLETE!')
    console.log('='.repeat(70))
    console.log(`✅ Events: ${eventCount}`)
    console.log(`✅ Tourist Spots: ${touristSpots.length}`)
    console.log(`✅ Food Places: ${foodPlaces.length}`)
    console.log(`✅ Routes: ${routeCount}`)
    console.log(`✅ Photos: ${photoCount}`)
    console.log('='.repeat(70))
    console.log('\n📱 Your app features can now pull data:')
    console.log('   • ARAMIDEM - Events & Festivals')
    console.log('   • APANAM - Tourist Spots (30 locations)')
    console.log('   • MAYKAN - Food & Restaurants')
    console.log('   • PAGNAAM - Jeepney Routes')
    console.log('   • AYANMO - Discovery & Places')
    console.log('   • Photos - Gallery\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code === 'auth/wrong-password') {
      console.error('❌ Incorrect password.')
    } else if (error.code === 'auth/user-not-found') {
      console.error('❌ Admin email not found.')
    } else if (error.code === 'auth/invalid-credential') {
      console.error('❌ Invalid credentials.')
    }
  } finally {
    rl.close()
  }
}

// Run setup
setupDatabase()
