/**
 * Panagbenga 2026 Events Seeder
 * Run this script to add all official Panagbenga Festival 2026 events to Firebase
 *
 * Usage: node seed-panagbenga-events.js
 *
 * Before running:
 * 1. Create .env file with your Firebase config (see .env.example)
 * 2. Install dotenv: npm install dotenv
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { createInterface } from 'readline'
import 'dotenv/config'

// Firebase Configuration from environment variables
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
const missingConfig = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingConfig.length > 0) {
  console.error('❌ Missing Firebase configuration:')
  console.error('   ', missingConfig.join(', '))
  console.error('\n📝 Please create a .env file with your Firebase config.')
  console.error('   Copy .env.example to .env and fill in the values.\n')
  process.exit(1)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Admin credentials
const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'superadmin@baguioboosters.com'

// Panagbenga 2026 Events Data
const panagbengaEvents = [
  {
    title: "Panagbenga Grand Opening Day Parade",
    location: "Panagbenga Park to Melvin Jones Football Grounds",
    startDate: "2026-02-01",
    endDate: "2026-02-01",
    startTime: "08:00",
    endTime: "12:00",
    status: "Upcoming",
    organizer: "BFFFI / Baguio City Government",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "The official start of the 30th Panagbenga Festival featuring elementary school drum and lyre corps and festive street dancing along Session Road. Theme: 'Blooming Without End' - celebrating the Pearl Anniversary of Baguio City's resilience and creative spirit.",
    featured: true,
    imageUrl: ""
  },
  {
    title: "Panagbenga Market Encounter & Panagbengascapes",
    location: "Juan Luna Drive and Rose Garden, Burnham Park",
    startDate: "2026-02-01",
    endDate: "2026-03-08",
    startTime: "09:00",
    endTime: "21:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "A month-long landscaping exhibition and trade fair featuring floral designs, local handicrafts, and food stalls. Experience the beauty of Baguio's flowers and support local artisans and businesses.",
    featured: true,
    imageUrl: ""
  },
  {
    title: "Cup of Joe: Stardust Philippine Tour 2026",
    location: "University of Baguio Gym",
    startDate: "2026-02-06",
    endDate: "2026-02-06",
    startTime: "19:00",
    endTime: "23:00",
    status: "Upcoming",
    organizer: "Ovation Productions",
    contactEmail: "info@ovationproductions.com",
    contactPhone: "+63 917 123 4567",
    description: "A special concert by the popular Baguio-based OPM band Cup of Joe as part of the Panagbenga Festival's musical highlights. Enjoy hit songs live in the cool Baguio weather!",
    featured: true,
    imageUrl: ""
  },
  {
    title: "Floral Fiesta: Bouquet & Dish Garden Competition",
    location: "Melvin Jones Football Grounds",
    startDate: "2026-02-07",
    endDate: "2026-02-07",
    startTime: "09:00",
    endTime: "17:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "A school-based competition showcasing the floral arrangement skills of students from various schools in Baguio City. Watch talented young artists create beautiful bouquets and dish gardens.",
    featured: false,
    imageUrl: ""
  },
  {
    title: "PMA Alumni Homecoming",
    location: "Fort Del Pilar, Baguio City",
    startDate: "2026-02-13",
    endDate: "2026-02-15",
    startTime: "08:00",
    endTime: "20:00",
    status: "Upcoming",
    organizer: "Philippine Military Academy (PMA)",
    contactEmail: "alumni@pma.edu.ph",
    contactPhone: "+63 74 442 2031",
    description: "An annual tradition where thousands of PMA alumni gather for a weekend of camaraderie and celebration. A major draw for tourism during the festival month, featuring parades, ceremonies, and social events.",
    featured: false,
    imageUrl: ""
  },
  {
    title: "Handog ng Panagbenga sa Pamilya Baguio",
    location: "Melvin Jones Football Grounds",
    startDate: "2026-02-14",
    endDate: "2026-02-14",
    startTime: "08:00",
    endTime: "18:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "A family-oriented Valentine's Day celebration featuring the 'Colours in Bloom' open painting competition and the 11th Annual Panagbenga Kite Flying Challenge. Perfect for families and art enthusiasts!",
    featured: false,
    imageUrl: ""
  },
  {
    title: "Rhythm of the Highlands",
    location: "Melvin Jones Football Grounds",
    startDate: "2026-02-15",
    endDate: "2026-02-15",
    startTime: "15:00",
    endTime: "21:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "A dedicated showcase of traditional Cordilleran culture, music, and ethnic dances. Experience the rich heritage of the highlands through authentic performances by indigenous cultural communities.",
    featured: false,
    imageUrl: ""
  },
  {
    title: "Baguio Spring Festival (Chinese New Year Parade)",
    location: "Session Road to Melvin Jones",
    startDate: "2026-02-18",
    endDate: "2026-02-18",
    startTime: "10:00",
    endTime: "14:00",
    status: "Upcoming",
    organizer: "Baguio Filipino-Chinese Community",
    contactEmail: "info@baguiochinese.org",
    contactPhone: "+63 74 442 3456",
    description: "A colorful parade celebrating the Lunar New Year, integrated into the Panagbenga calendar. Features dragon dances, cultural performances, and traditional Chinese-Filipino celebrations.",
    featured: false,
    imageUrl: ""
  },
  {
    title: "Panagbenga Grand Street Dance Parade",
    location: "Panagbenga Park → Session Road → Harrison Road → Melvin Jones",
    startDate: "2026-02-28",
    endDate: "2026-02-28",
    startTime: "08:00",
    endTime: "16:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "THE MAIN HIGHLIGHT! A massive parade of dancers in vibrant, flower-inspired costumes performing to the rhythmic Panagbenga hymn. Watch thousands of performers from schools and organizations across the Cordillera region.",
    featured: true,
    imageUrl: ""
  },
  {
    title: "Panagbenga Grand Floral Float Parade",
    location: "Panagbenga Park to Melvin Jones Football Grounds",
    startDate: "2026-03-01",
    endDate: "2026-03-01",
    startTime: "08:00",
    endTime: "17:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "The festival's MOST FAMOUS event! Giant floats made entirely of fresh flowers parade through the city streets, often carrying celebrities and local icons. A spectacular display of creativity and floral artistry.",
    featured: true,
    imageUrl: ""
  },
  {
    title: "Session Road in Bloom",
    location: "Session Road (Entire length closed to traffic)",
    startDate: "2026-03-02",
    endDate: "2026-03-08",
    startTime: "09:00",
    endTime: "22:00",
    status: "Upcoming",
    organizer: "BFFFI / Baguio City Government",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "Baguio's main thoroughfare transforms into a pedestrian mall with sidewalk cafés, floral installations, and hundreds of local merchant stalls. Enjoy street performances, food trips, and shopping in a car-free environment!",
    featured: true,
    imageUrl: ""
  },
  {
    title: "Panagbenga Awarding and Closing Ceremonies",
    location: "Melvin Jones Football Grounds",
    startDate: "2026-03-08",
    endDate: "2026-03-08",
    startTime: "16:00",
    endTime: "22:00",
    status: "Upcoming",
    organizer: "BFFFI",
    contactEmail: "info@panagbenga.org",
    contactPhone: "+63 74 442 2772",
    description: "The official wrap-up of the 30th Panagbenga Festival featuring the PMA Silent Drill Exhibition, the Little Miss Panagbenga pageant, and the spectacular 'Flowers in the Sky' Grand Fireworks Display. Don't miss this grand finale!",
    featured: true,
    imageUrl: ""
  }
]

// Main seeder function
async function seedEvents() {
  console.log('🌸 Starting Panagbenga 2026 Events Seeder...\n')
  console.log(`📦 Connected to Firebase project: ${firebaseConfig.projectId}\n`)

  try {
    // Create readline interface for password input
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const question = (query) => new Promise((resolve) => rl.question(query, resolve))

    // Authentication required for Firestore writes
    console.log('🔐 ADMIN AUTHENTICATION REQUIRED\n')
    console.log(`Email: ${ADMIN_EMAIL}`)
    const password = await question('Password: ')

    console.log('\n🔑 Signing in...')
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
    console.log('✅ Successfully authenticated!\n')

    rl.close()

    console.log('📝 Adding events to Firebase Firestore...\n')

    let successCount = 0
    let errorCount = 0

    for (const event of panagbengaEvents) {
      try {
        const docRef = await addDoc(collection(db, 'events'), {
          ...event,
          createdAt: serverTimestamp()
        })

        successCount++
        console.log(`✅ Added: ${event.title}`)
        console.log(`   Document ID: ${docRef.id}`)
        console.log(`   Date: ${event.startDate} - ${event.endDate}`)
        console.log(`   Featured: ${event.featured ? '⭐ YES' : 'No'}\n`)
      } catch (error) {
        errorCount++
        console.error(`❌ Error adding "${event.title}":`, error.message)
        console.log()
      }
    }

    console.log('\n' + '='.repeat(70))
    console.log('🎉 Seeding Complete!')
    console.log('='.repeat(70))
    console.log(`✅ Successfully added: ${successCount} events`)
    console.log(`❌ Failed: ${errorCount} events`)
    console.log(`📊 Total: ${panagbengaEvents.length} events`)
    console.log('='.repeat(70))
    console.log('\n🌸 Visit the ARAMIDEM page to see all Panagbenga 2026 events!')
    console.log('📅 Events are scheduled from February 1 to March 8, 2026\n')

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    if (error.code === 'auth/wrong-password') {
      console.error('❌ Incorrect password. Please try again.')
    } else if (error.code === 'auth/user-not-found') {
      console.error('❌ Admin email not found. Check your credentials.')
    } else if (error.code === 'auth/invalid-credential') {
      console.error('❌ Invalid credentials. Please check your email and password.')
    }
    console.error('Stack trace:', error.stack)
  }
}

// Run the seeder
seedEvents()
