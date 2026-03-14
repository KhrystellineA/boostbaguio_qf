/**
 * Migrate Jeepney Routes from routePoints to routeCoordinates
 *
 * This script updates all existing jeepney documents to use the
 * routeCoordinates field (with [lng, lat] format) instead of routePoints.
 *
 * Usage: node migrate-jeepney-routes.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, updateDoc, query } from 'firebase/firestore'
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function promptPassword() {
  return new Promise((resolve) => {
    rl.question('Enter your Firebase admin password: ', (password) => {
      resolve(password)
    })
  })
}

async function migrateJeepneyRoutes() {
  try {
    console.log('🔄 Starting Jeepney Routes Migration...\n')

    const email = process.env.VITE_ADMIN_EMAIL || process.env.VITE_FIREBASE_AUTH_EMAIL

    if (!email) {
      console.log('❌ No admin email found in .env file.')
      console.log('Please add VITE_ADMIN_EMAIL=your-email@example.com to your .env file')
      rl.close()
      process.exit(1)
    }

    console.log(`Using admin email: ${email}`)

    const password = await promptPassword()
    rl.close()

    if (!password) {
      console.log('❌ Password cannot be empty.')
      process.exit(1)
    }

    console.log(`\n🔐 Signing in as ${email}...`)
    await signInWithEmailAndPassword(auth, email, password)
    console.log('✅ Signed in successfully!\n')

    // Get all jeepneys
    const jeepneysQuery = query(collection(db, 'jeepneys'))
    const jeepneysSnapshot = await getDocs(jeepneysQuery)

    if (jeepneysSnapshot.empty) {
      console.log('No jeepneys found in database.')
      process.exit(0)
    }

    console.log(`Found ${jeepneysSnapshot.size} jeepney(s).\n`)

    let updated = 0
    let skipped = 0
    let errors = 0

    // Process each jeepney
    for (const docSnap of jeepneysSnapshot.docs) {
      const data = docSnap.data()
      const jeepneyId = docSnap.id

      // Check if already has routeCoordinates
      if (data.routeCoordinates && data.routeCoordinates.length > 0) {
        console.log(`⏭️  Skipped (has routeCoordinates): ${data.jeepName}`)
        skipped++
        continue
      }

      // Check if has routePoints to migrate
      if (data.routePoints && data.routePoints.length > 0) {
        try {
          // Convert from {lat, lng} format to [lng, lat] format
          const routeCoordinates = data.routePoints
            .map((point) => {
              if (Array.isArray(point)) {
                // Already in [lng, lat] format
                return point
              } else if (point.lat !== undefined && point.lng !== undefined) {
                // Convert from {lat, lng} to [lng, lat]
                return [point.lng, point.lat]
              }
              return null
            })
            .filter((coord) => coord !== null)

          // Update document
          await updateDoc(doc(db, 'jeepneys', jeepneyId), {
            routeCoordinates,
          })

          console.log(`✅ Migrated: ${data.jeepName} (${routeCoordinates.length} points)`)
          updated++
        } catch (error) {
          console.error(`❌ Error migrating ${data.jeepName}:`, error.message)
          errors++
        }
      } else {
        console.log(`⏭️  Skipped (no route data): ${data.jeepName}`)
        skipped++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎉 Migration Complete!')
    console.log('='.repeat(60))
    console.log(`✅ Updated: ${updated} jeepneys`)
    console.log(`⏭️  Skipped: ${skipped} jeepneys`)
    if (errors > 0) {
      console.log(`❌ Errors: ${errors} jeepneys`)
    }
    console.log('='.repeat(60))
    console.log('\n✅ All jeepney routes now use routeCoordinates field!')
    console.log('\n💡 Tip: Routes will now display correctly on the map!\n')
  } catch (error) {
    console.error('❌ Error during migration:', error.message)
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      console.log('\n💡 Invalid credentials. Please check your email and password.')
    }
    rl.close()
    process.exit(1)
  }
}

migrateJeepneyRoutes()
