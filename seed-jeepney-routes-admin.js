/**
 * Seed Jeepney Routes with Route Coordinates (Admin Version)
 * 
 * This script uses Firebase Admin SDK to bypass security rules.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or service account file.
 * 
 * Usage: node seed-jeepney-routes-admin.js
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, query } from 'firebase-admin/firestore'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Try to load service account from file or use environment variables
let serviceAccount
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json')

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
  console.log('✅ Loaded service account from file')
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'))
  console.log('✅ Loaded service account from GOOGLE_APPLICATION_CREDENTIALS')
} else {
  console.log('❌ No service account found. Please either:')
  console.log('   1. Place serviceAccountKey.json in the project root, OR')
  console.log('   2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable')
  console.log('\nTo get a service account key:')
  console.log('   1. Go to Firebase Console > Project Settings > Service Accounts')
  console.log('   2. Click "Generate New Private Key"')
  console.log('   3. Save the JSON file as serviceAccountKey.json in the project root')
  process.exit(1)
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

const db = getFirestore()

// Sample route coordinates for Baguio City jeepney routes
const sampleRouteCoordinates = {
  'session-road-loakan': {
    routeCoordinates: [
      { lat: 16.4109, lng: 120.5964 },
      { lat: 16.4125, lng: 120.5975 },
      { lat: 16.4145, lng: 120.5985 },
      { lat: 16.4165, lng: 120.5995 },
      { lat: 16.4185, lng: 120.6005 },
      { lat: 16.4205, lng: 120.6015 },
    ],
    terminalCoordinates: { lat: 16.4109, lng: 120.5964 },
    destinationCoordinates: { lat: 16.4205, lng: 120.6015 },
  },
  'burnham-sm-baguio': {
    routeCoordinates: [
      { lat: 16.4075, lng: 120.5935 },
      { lat: 16.4085, lng: 120.5945 },
      { lat: 16.4095, lng: 120.5955 },
      { lat: 16.4105, lng: 120.5965 },
      { lat: 16.4115, lng: 120.5975 },
      { lat: 16.4125, lng: 120.5985 },
    ],
    terminalCoordinates: { lat: 16.4075, lng: 120.5935 },
    destinationCoordinates: { lat: 16.4125, lng: 120.5985 },
  },
  'market-market-mines-view': {
    routeCoordinates: [
      { lat: 16.4095, lng: 120.6025 },
      { lat: 16.4105, lng: 120.6035 },
      { lat: 16.4115, lng: 120.6045 },
      { lat: 16.4135, lng: 120.6065 },
      { lat: 16.4155, lng: 120.6085 },
      { lat: 16.4175, lng: 120.6095 },
    ],
    terminalCoordinates: { lat: 16.4095, lng: 120.6025 },
    destinationCoordinates: { lat: 16.4175, lng: 120.6095 },
  },
  'u-b-good-shepherd': {
    routeCoordinates: [
      { lat: 16.4155, lng: 120.5945 },
      { lat: 16.4165, lng: 120.5955 },
      { lat: 16.4175, lng: 120.5965 },
      { lat: 16.4195, lng: 120.5985 },
      { lat: 16.4215, lng: 120.6005 },
      { lat: 16.4235, lng: 120.6025 },
    ],
    terminalCoordinates: { lat: 16.4155, lng: 120.5945 },
    destinationCoordinates: { lat: 16.4235, lng: 120.6025 },
  },
  'baguio-city-mall-slaughtehouse': {
    routeCoordinates: [
      { lat: 16.4065, lng: 120.5925 },
      { lat: 16.4075, lng: 120.5935 },
      { lat: 16.4085, lng: 120.5945 },
      { lat: 16.4095, lng: 120.5955 },
      { lat: 16.4105, lng: 120.5965 },
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
    console.log('🚌 Starting Jeepney Routes Seeding (Admin Mode)...\n')

    const jeepneysRef = collection(db, 'jeepneys')
    const snapshot = await getDocs(jeepneysRef)

    console.log(`Found ${snapshot.size} existing jeepney(s).`)
    console.log('Adding sample routes with [SAMPLE] tag...\n')

    const sampleData = createSampleJeepneyData()

    for (const jeepney of sampleData) {
      const docRef = await addDoc(jeepneysRef, jeepney)
      console.log(`✅ Added: ${jeepney.jeepName} (ID: ${docRef.id})`)
    }

    console.log('\n✅ Sample jeepney routes added successfully!')
    console.log('\n🎉 Seeding completed!')
    console.log('\nNote: Sample routes are tagged with [SAMPLE] for easy identification.')
  } catch (error) {
    console.error('❌ Error seeding jeepney routes:', error)
    process.exit(1)
  }
}

seedJeepneyRoutes()
