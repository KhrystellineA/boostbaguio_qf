/**
 * Boost Baguio - Update Places Categories
 * 
 * This script updates all existing places in Firestore with proper category arrays
 * based on their current single category value.
 * 
 * Usage: node update-places-categories.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore'
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

// Category mapping based on place characteristics
const categoryMapping = {
  // Tourist Spots
  'tourist-spot': ['tourist-spot'],
  
  // Restaurants & Cafes
  'restaurant': ['restaurant'],
  
  // Parks & Nature - places with gardens, parks, natural attractions
  'park-nature': ['park-nature'],
  
  // Museums & Culture - museums, cultural villages, galleries
  'museum-culture': ['museum-culture'],
  
  // Shopping - markets, malls, shopping centers
  'shopping': ['shopping'],
  
  // Hotels & Lodging
  'hotel-lodging': ['hotel-lodging'],
  
  // Government buildings
  'government': ['government'],
  
  // Hospitals
  'hospital': ['hospital'],
  
  // Schools
  'school': ['school'],
  
  // Other
  'other': ['other']
}

// Places that should have multiple categories
const specialCategoryMappings = {
  // Parks that are also tourist spots
  'Burnham Park': ['tourist-spot', 'park-nature'],
  'Mines View Park': ['tourist-spot', 'park-nature'],
  'Wright Park': ['tourist-spot', 'park-nature'],
  'Baguio Botanical Garden': ['tourist-spot', 'park-nature'],
  'Igorota Garden': ['tourist-spot', 'park-nature'],
  'Baguio Hill Station': ['tourist-spot', 'park-nature'],
  'Teachers Camp': ['tourist-spot', 'park-nature'],
  
  // Museums and cultural sites
  'Tam-awan Village': ['tourist-spot', 'museum-culture'],
  'BenCab Museum': ['tourist-spot', 'museum-culture'],
  'Baguio Arts Gallery': ['tourist-spot', 'museum-culture'],
  'The Mansion': ['tourist-spot', 'museum-culture'],
  'Baguio Cathedral': ['tourist-spot', 'museum-culture'],
  'Our Lady of Lourdes Grotto': ['tourist-spot', 'museum-culture'],
  
  // Shopping areas
  'SM City Baguio': ['tourist-spot', 'shopping'],
  'Baguio City Market': ['tourist-spot', 'shopping'],
  'Session Road': ['tourist-spot', 'shopping'],
  
  // Restaurants that are also tourist attractions
  'Café by the Ruins': ['restaurant', 'tourist-spot'],
  'Good Taste Restaurant': ['restaurant', 'tourist-spot'],
  'Oh My Strawberries': ['restaurant', 'tourist-spot'],
  
  // Hotels
  'Pine Grove Hotel & Convention Center': ['tourist-spot', 'hotel-lodging'],
  'Baguio Country Club': ['tourist-spot', 'hotel-lodging'],
  
  // Government/Educational
  'Philippine Military Academy (PMA)': ['tourist-spot', 'school'],
  'Baguio Central School': ['tourist-spot', 'school'],
  'Baguio City Hall': ['tourist-spot', 'government'],
  'Baguio General Hospital': ['tourist-spot', 'hospital'],
  'Baguio Post Office': ['tourist-spot', 'government'],
  'Baguio Convention Center': ['tourist-spot', 'government'],
  
  // Nature/Adventure
  'Camp John Hay': ['tourist-spot', 'park-nature'],
  'Strawberry Farm': ['tourist-spot', 'park-nature']
}

async function authenticate() {
  console.log('🔐 Authenticating with Firebase...')
  console.log('📝 Please enter your admin password below:\n')
  
  const password = await question(`Password for ${ADMIN_EMAIL}: `)
  
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
    console.log('✅ Authentication successful!\n')
    return true
  } catch (error) {
    console.error('❌ Authentication failed:', error.message)
    console.log('\n💡 Tip: Make sure you entered the correct password')
    return false
  }
}

async function updatePlacesCategories() {
  console.log('\n📍 Starting places category update...\n')
  
  try {
    // Get all places
    const q = query(collection(db, 'places'), orderBy('name', 'asc'))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      console.log('❌ No places found in database')
      return
    }
    
    console.log(`📋 Found ${querySnapshot.size} places to update\n`)
    
    let updated = 0
    let skipped = 0
    
    for (const docSnap of querySnapshot.docs) {
      const place = docSnap.data()
      const placeId = docSnap.id
      const placeName = place.name || 'Unknown'
      
      // Check if already has categories array
      if (Array.isArray(place.categories) && place.categories.length > 0) {
        console.log(`⏭️  Skipped: ${placeName} (already has categories)`)
        skipped++
        continue
      }
      
      // Determine categories
      let categories = []
      
      // Check for special mappings first
      if (specialCategoryMappings[placeName]) {
        categories = specialCategoryMappings[placeName]
      } else if (place.category) {
        // Use existing category mapping
        categories = categoryMapping[place.category] || ['tourist-spot']
      } else {
        // Default to tourist-spot
        categories = ['tourist-spot']
      }
      
      // Update the document
      await updateDoc(doc(db, 'places', placeId), {
        categories: categories
      })
      
      console.log(`✅ Updated: ${placeName} → ${categories.join(', ')}`)
      updated++
    }
    
    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Updated: ${updated} places`)
    console.log(`⏭️  Skipped: ${skipped} places`)
    console.log(`📋 Total: ${querySnapshot.size} places`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('❌ Error updating places:', error)
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║  Boost Baguio - Update Places Categories  ║')
  console.log('╚════════════════════════════════════════════╝')
  console.log()
  
  const authenticated = await authenticate()
  if (!authenticated) {
    console.log('\n❌ Exiting due to authentication failure')
    rl.close()
    return
  }
  
  await updatePlacesCategories()
  
  console.log('\n✅ Category update completed!')
  rl.close()
}

// Run the script
main().catch(console.error)
