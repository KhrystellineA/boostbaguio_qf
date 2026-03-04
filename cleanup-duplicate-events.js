/**
 * Boost Baguio - Cleanup Duplicate Events
 * 
 * This script identifies and removes duplicate events from Firestore
 * based on event name and start date.
 * 
 * Usage: node cleanup-duplicate-events.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
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

async function authenticate() {
  console.log('🔐 Authenticating with Firebase...')
  console.log('📝 Please enter your admin password below:\n')
  
  let password = process.env.VITE_ADMIN_PASSWORD
  
  if (!password) {
    password = await question(`Password for ${ADMIN_EMAIL}: `)
  } else {
    console.log('Using password from environment variable...')
  }
  
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

async function cleanupDuplicateEvents() {
  console.log('\n🗑️  Starting duplicate events cleanup...\n')
  
  try {
    // Get all events
    const q = query(collection(db, 'events'), orderBy('startDate', 'asc'))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      console.log('❌ No events found in database')
      return
    }
    
    console.log(`📋 Found ${querySnapshot.size} total events\n`)
    
    // Group events by name + start date (unique identifier)
    const eventsMap = new Map()
    const duplicates = []
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data()
      const eventName = data.title || data.name || 'Unknown'
      const startDate = data.startDate || 'unknown'
      
      // Create unique key from name and start date
      const uniqueKey = `${eventName.toLowerCase().trim()}|${startDate}`
      
      if (eventsMap.has(uniqueKey)) {
        // This is a duplicate
        duplicates.push({
          id: docSnap.id,
          name: eventName,
          startDate: startDate,
          description: data.description?.substring(0, 50) || ''
        })
      } else {
        // First occurrence - keep this one
        eventsMap.set(uniqueKey, {
          id: docSnap.id,
          name: eventName,
          startDate: startDate
        })
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate events found!')
      return
    }
    
    console.log('📊 DUPLICATE EVENTS FOUND:')
    console.log('='.repeat(70))
    console.log(`Total duplicates: ${duplicates.length}\n`)
    
    // Group duplicates by name for better display
    const duplicatesByName = new Map()
    duplicates.forEach(dup => {
      if (!duplicatesByName.has(dup.name)) {
        duplicatesByName.set(dup.name, [])
      }
      duplicatesByName.get(dup.name).push(dup)
    })
    
    for (const [name, dups] of duplicatesByName) {
      console.log(`📌 Event: "${name}"`)
      dups.forEach((dup, idx) => {
        console.log(`   ${idx + 1}. ID: ${dup.id} | Date: ${dup.startDate}`)
      })
      console.log()
    }
    
    console.log('='.repeat(70))
    console.log()
    
    // Ask for confirmation
    const answer = await question(`⚠️  Do you want to delete these ${duplicates.length} duplicate events? (yes/no): `)
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Cleanup cancelled by user')
      return
    }
    
    console.log('\n🗑️  Deleting duplicate events...\n')
    
    let deleted = 0
    let failed = 0
    
    for (const dup of duplicates) {
      try {
        await deleteDoc(doc(db, 'events', dup.id))
        console.log(`✅ Deleted: "${dup.name}" (${dup.startDate})`)
        deleted++
      } catch (error) {
        console.error(`❌ Failed to delete "${dup.name}": ${error.message}`)
        failed++
      }
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('📊 CLEANUP SUMMARY')
    console.log('='.repeat(70))
    console.log(`✅ Successfully deleted: ${deleted} events`)
    if (failed > 0) {
      console.log(`❌ Failed to delete: ${failed} events`)
    }
    console.log(`📋 Total duplicates removed: ${deleted}`)
    console.log('='.repeat(70))
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║  Boost Baguio - Cleanup Duplicate Events    ║')
  console.log('╚══════════════════════════════════════════════╝')
  console.log()
  
  const authenticated = await authenticate()
  if (!authenticated) {
    console.log('\n❌ Exiting due to authentication failure')
    rl.close()
    return
  }
  
  await cleanupDuplicateEvents()
  
  console.log('\n✅ Cleanup completed!')
  rl.close()
}

// Run the script
main().catch(console.error)
