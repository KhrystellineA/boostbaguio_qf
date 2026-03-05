/**
 * Seed Jeepney Routes with Route Coordinates
 * 
 * This script adds sample route coordinates to jeepney documents in Firestore.
 * The coordinates represent actual routes in Baguio City.
 * 
 * Usage: node seed-jeepney-routes.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config()

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper function to prompt for password (hidden input)
function promptPassword() {
  return new Promise((resolve) => {
    // For Windows, we'll use a simple prompt (hidden input is complex in Node.js)
    rl.question('Enter your Firebase admin password: ', (password) => {
      resolve(password)
    })
  })
}

// Sample route coordinates for Baguio City jeepney routes
// These are approximate coordinates following actual roads
const sampleRouteCoordinates = {
  'session-road-loakan': {
    routeCoordinates: [
      { lat: 16.4109, lng: 120.5964 }, // Session Road (starting point)
      { lat: 16.4125, lng: 120.5975 }, // Session Road - Upper
      { lat: 16.4145, lng: 120.5985 }, // Leonard Wood Road
      { lat: 16.4165, lng: 120.5995 }, // Loakan Road
      { lat: 16.4185, lng: 120.6005 }, // Loakan - Near Airport
      { lat: 16.4205, lng: 120.6015 }, // Loakan Terminal
    ],
    terminalCoordinates: { lat: 16.4109, lng: 120.5964 },
    destinationCoordinates: { lat: 16.4205, lng: 120.6015 },
  },
  'burnham-sm-baguio': {
    routeCoordinates: [
      { lat: 16.4075, lng: 120.5935 }, // SM Baguio
      { lat: 16.4085, lng: 120.5945 }, // SM Access Road
      { lat: 16.4095, lng: 120.5955 }, // Harrison Road
      { lat: 16.4105, lng: 120.5965 }, // Burnham Park - North
      { lat: 16.4115, lng: 120.5975 }, // Burnham Lake
      { lat: 16.4125, lng: 120.5985 }, // Burnham Park - South
    ],
    terminalCoordinates: { lat: 16.4075, lng: 120.5935 },
    destinationCoordinates: { lat: 16.4125, lng: 120.5985 },
  },
  'market-market-mines-view': {
    routeCoordinates: [
      { lat: 16.4095, lng: 120.6025 }, // Market Market
      { lat: 16.4105, lng: 120.6035 }, // Mabini Street
      { lat: 16.4115, lng: 120.6045 }, // Rizal Street
      { lat: 16.4135, lng: 120.6065 }, // Bonifacio Street
      { lat: 16.4155, lng: 120.6085 }, // Mines View Park Road
      { lat: 16.4175, lng: 120.6095 }, // Mines View Park
    ],
    terminalCoordinates: { lat: 16.4095, lng: 120.6025 },
    destinationCoordinates: { lat: 16.4175, lng: 120.6095 },
  },
  'u-b-good-shepherd': {
    routeCoordinates: [
      { lat: 16.4155, lng: 120.5945 }, // University of Baguio
      { lat: 16.4165, lng: 120.5955 }, // General Luna Street
      { lat: 16.4175, lng: 120.5965 }, // Upper Gen. Luna
      { lat: 16.4195, lng: 120.5985 }, // Governor Pack Road
      { lat: 16.4215, lng: 120.6005 }, // Teacher's Camp
      { lat: 16.4235, lng: 120.6025 }, // Good Shepherd
    ],
    terminalCoordinates: { lat: 16.4155, lng: 120.5945 },
    destinationCoordinates: { lat: 16.4235, lng: 120.6025 },
  },
  'baguio-city-mall-slaughtehouse': {
    routeCoordinates: [
      { lat: 16.4065, lng: 120.5925 }, // Baguio City Mall
      { lat: 16.4075, lng: 120.5935 }, // McArthur Drive
      { lat: 16.4085, lng: 120.5945 }, // Port Area
      { lat: 16.4095, lng: 120.5955 }, // Slaughterhouse Road
      { lat: 16.4105, lng: 120.5965 }, // End point
    ],
    terminalCoordinates: { lat: 16.4065, lng: 120.5925 },
    destinationCoordinates: { lat: 16.4105, lng: 120.5965 },
  },
}

function createSampleJeepneyData() {
  return [
    {
      jeepName: 'Session Road - Loakan [SAMPLE]',
      routeName: 'Session Road - Loakan [SAMPLE]',
      terminalLocation: 'Session Road',
      terminalStart: 'Session Road Terminal',
      terminalEnd: 'Loakan Terminal',
      endPoint: 'Loakan',
      fare: 15,
      fareRegular: 15,
      fareStudent: 12,
      fareSenior: 12,
      farePWD: 12,
      operatingHours: { open: '05:00', close: '22:00' },
      touristSpotsServiced: ['Session Road', 'Burnham Park', 'Loakan'],
      isActive: true,
      imageUrl: '~assets/jeepney.png',
      ...sampleRouteCoordinates['session-road-loakan'],
    },
    {
      jeepName: 'Burnham - SM Baguio [SAMPLE]',
      routeName: 'Burnham - SM Baguio [SAMPLE]',
      terminalLocation: 'SM Baguio',
      terminalStart: 'SM Baguio Terminal',
      terminalEnd: 'Burnham Park Terminal',
      endPoint: 'Burnham Park',
      fare: 12,
      fareRegular: 12,
      fareStudent: 10,
      fareSenior: 10,
      farePWD: 10,
      operatingHours: { open: '05:00', close: '22:00' },
      touristSpotsServiced: ['SM Baguio', 'Burnham Park', 'Baguio Botanical Garden'],
      isActive: true,
      imageUrl: '~assets/jeepney.png',
      ...sampleRouteCoordinates['burnham-sm-baguio'],
    },
    {
      jeepName: 'Market Market - Mines View [SAMPLE]',
      routeName: 'Market Market - Mines View [SAMPLE]',
      terminalLocation: 'Market Market',
      terminalStart: 'Market Market Terminal',
      terminalEnd: 'Mines View Park Terminal',
      endPoint: 'Mines View Park',
      fare: 18,
      fareRegular: 18,
      fareStudent: 15,
      fareSenior: 15,
      farePWD: 15,
      operatingHours: { open: '05:00', close: '21:00' },
      touristSpotsServiced: ['Market Market', 'Baguio Cathedral', 'Mines View Park'],
      isActive: true,
      imageUrl: '~assets/jeepney.png',
      ...sampleRouteCoordinates['market-market-mines-view'],
    },
    {
      jeepName: 'U-B - Good Shepherd [SAMPLE]',
      routeName: 'U-B - Good Shepherd [SAMPLE]',
      terminalLocation: 'University of Baguio',
      terminalStart: 'University of Baguio Terminal',
      terminalEnd: 'Good Shepherd Terminal',
      endPoint: 'Good Shepherd',
      fare: 16,
      fareRegular: 16,
      fareStudent: 13,
      fareSenior: 13,
      farePWD: 13,
      operatingHours: { open: '05:00', close: '21:30' },
      touristSpotsServiced: ['University of Baguio', "Teacher's Camp", 'Good Shepherd'],
      isActive: true,
      imageUrl: '~assets/jeepney.png',
      ...sampleRouteCoordinates['u-b-good-shepherd'],
    },
    {
      jeepName: 'Baguio City Mall - Slaughterhouse [SAMPLE]',
      routeName: 'Baguio City Mall - Slaughterhouse [SAMPLE]',
      terminalLocation: 'Baguio City Mall',
      terminalStart: 'Baguio City Mall Terminal',
      terminalEnd: 'Slaughterhouse Terminal',
      endPoint: 'Slaughterhouse',
      fare: 14,
      fareRegular: 14,
      fareStudent: 11,
      fareSenior: 11,
      farePWD: 11,
      operatingHours: { open: '05:00', close: '21:00' },
      touristSpotsServiced: ['Baguio City Mall', 'Baguio Port'],
      isActive: true,
      imageUrl: '~assets/jeepney.png',
      ...sampleRouteCoordinates['baguio-city-mall-slaughtehouse'],
    },
  ]
}

async function seedJeepneyRoutes() {
  try {
    console.log('🚌 Starting Jeepney Routes Seeding...\n')

    // Get email from .env or prompt
    const email = process.env.VITE_ADMIN_EMAIL || process.env.VITE_FIREBASE_AUTH_EMAIL
    
    if (!email) {
      console.log('❌ No admin email found in .env file.')
      console.log('Please add VITE_ADMIN_EMAIL=your-email@example.com to your .env file')
      rl.close()
      process.exit(1)
    }

    console.log(`Using admin email: ${email}`)
    
    // Prompt for password
    const password = await promptPassword()
    rl.close()
    
    if (!password) {
      console.log('❌ Password cannot be empty.')
      process.exit(1)
    }

    console.log(`\n🔐 Signing in as ${email}...`)
    await signInWithEmailAndPassword(auth, email, password)
    console.log('✅ Signed in successfully!\n')

    // Check if jeepneys collection has existing data
    const jeepneysQuery = query(collection(db, 'jeepneys'))
    const existingJeepneys = await getDocs(jeepneysQuery)

    if (existingJeepneys.empty) {
      console.log('No existing jeepneys found. Creating new sample data...\n')

      const sampleData = createSampleJeepneyData()

      for (const jeepney of sampleData) {
        const docRef = await addDoc(collection(db, 'jeepneys'), jeepney)
        console.log(`✅ Created: ${jeepney.jeepName} (ID: ${docRef.id})`)
      }

      console.log('\n✅ Sample jeepney routes created successfully!')
      console.log('\n🎉 Seeding completed!')
    } else {
      console.log(`Found ${existingJeepneys.size} existing jeepney(s).`)
      console.log('Adding sample routes with [SAMPLE] tag...\n')

      // Add sample routes without affecting existing ones
      const sampleData = createSampleJeepneyData()

      for (const jeepney of sampleData) {
        const docRef = await addDoc(collection(db, 'jeepneys'), jeepney)
        console.log(`✅ Added: ${jeepney.jeepName} (ID: ${docRef.id})`)
      }

      console.log('\n✅ Sample jeepney routes added successfully!')
      console.log('\n🎉 Seeding completed!')
      console.log('\nNote: Sample routes are tagged with [SAMPLE] for easy identification.')
    }
  } catch (error) {
    console.error('❌ Error seeding jeepney routes:', error.message)
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      console.log('\n💡 Invalid credentials. Please check your email and password.')
    }
    rl.close()
    process.exit(1)
  }
}

// Run the seeding
seedJeepneyRoutes()
