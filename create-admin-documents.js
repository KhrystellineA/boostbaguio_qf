/**
 * Boost Baguio - Create Firestore Documents for Existing Users
 * 
 * This script creates Firestore admin documents for users that already exist in Firebase Auth.
 * Run this if you previously created users but they don't have admin documents in Firestore.
 * 
 * Usage: node create-admin-documents.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
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

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

const SUPER_ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'superadmin@baguioboosters.com'

// Admin users to create documents for
const adminUsers = [
  {
    email: 'admin@baguioboosters.com',
    name: 'Places Administrator',
    role: 'places_admin',
    permissions: ['places:read', 'places:write', 'places:delete', 'places:update'],
    description: 'Can manage all places (tourist spots, restaurants, hotels, etc.)'
  },
  {
    email: 'routesadmin@baguioboosters.com',
    name: 'Routes Administrator',
    role: 'routes_admin',
    permissions: ['routes:read', 'routes:write', 'routes:delete', 'routes:update', 'jeepneyOptions:all'],
    description: 'Can manage all jeepney routes and options'
  },
  {
    email: 'eventsadmin@baguioboosters.com',
    name: 'Events Administrator',
    role: 'events_admin',
    permissions: ['events:read', 'events:write', 'events:delete', 'events:update'],
    description: 'Can manage all events and festivals'
  }
]

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createAdminDocuments() {
  console.log('🚀 Boost Baguio - Create Admin Firestore Documents\n')
  console.log('📋 Admin documents to create:')
  adminUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email} (${user.role})`)
  })
  console.log()

  try {
    // Authenticate as super admin
    console.log('🔐 SUPER ADMIN AUTHENTICATION REQUIRED')
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`)
    const password = await question('Password: ')

    console.log('\n🔑 Signing in as super admin...')
    await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password)
    console.log('✅ Successfully authenticated!\n')

    let successCount = 0
    let errorCount = 0
    let skipCount = 0

    for (const adminData of adminUsers) {
      try {
        console.log(`\n📝 Creating document for: ${adminData.email}...`)

        // Get user from Auth to get UID
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        
        // Sign in as the user to get their UID (temporary)
        try {
          const userCred = await signInWithEmailAndPassword(auth, adminData.email, password)
          const uid = userCred.user.uid
          
          // Sign back out
          await auth.signOut()
          
          // Sign back in as super admin
          await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password)

          // Check if document already exists
          const adminDocRef = doc(db, 'admins', uid)
          const adminDocSnap = await getDoc(adminDocRef)

          if (adminDocSnap.exists()) {
            console.log(`   ⚠️  Document already exists. Skipping...`)
            skipCount++
            continue
          }

          // Create admin document
          await setDoc(adminDocRef, {
            email: adminData.email,
            name: adminData.name,
            role: adminData.role,
            permissions: adminData.permissions,
            isActive: true,
            createdBy: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            description: adminData.description
          })

          console.log(`   ✅ Created admin document for ${adminData.name}`)
          console.log(`   📊 Role: ${adminData.role.toUpperCase()}`)
          console.log(`   📊 UID: ${uid}`)
          successCount++

        } catch (err) {
          // If sign in fails, try to find user by querying
          console.log(`   ⚠️  Could not sign in as user, trying alternative method...`)
          
          // Query all admins to find matching email
          const { collection, query, where, getDocs } = await import('firebase/firestore')
          const q = query(collection(db, 'admins'), where('email', '==', adminData.email))
          const querySnap = await getDocs(q)
          
          if (!querySnap.empty) {
            console.log(`   ⚠️  Admin document already exists. Skipping...`)
            skipCount++
            continue
          }
          
          // We need the UID - skip for now
          console.log(`   ❌ Could not find UID for ${adminData.email}. Manual creation required.`)
          errorCount++
        }

      } catch (error) {
        errorCount++
        console.error(`   ❌ Error:`, error.message)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('🎉 ADMIN DOCUMENT CREATION COMPLETE!')
    console.log('='.repeat(70))
    console.log(`✅ Successfully created: ${successCount} documents`)
    console.log(`⚠️  Skipped (already exist): ${skipCount} documents`)
    console.log(`❌ Failed: ${errorCount} documents`)
    console.log('='.repeat(70))

    if (errorCount > 0) {
      console.log('\n⚠️  Some documents could not be created automatically.')
      console.log('   You can create them manually in Firebase Console:')
      console.log('   1. Go to https://console.firebase.google.com/project/boost-baguio/firestore')
      console.log('   2. Create collection: admins')
      console.log('   3. Add document with UID from Authentication')
      console.log('   4. Add fields: email, name, role, permissions, isActive')
    }

    console.log('\n✅ Admins can now login and will be redirected to their dashboard!\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code === 'auth/wrong-password') {
      console.error('❌ Incorrect password.')
    } else if (error.code === 'auth/user-not-found') {
      console.error('❌ Super admin email not found.')
    }
  } finally {
    rl.close()
  }
}

createAdminDocuments()
