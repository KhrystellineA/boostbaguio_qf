/**
 * Boost Baguio - Admin & User Seeder
 * 
 * This script creates admin and user accounts with specific roles:
 * 1. admin@baguioboosters.com - Places Admin (CRUD for places/tourist spots)
 * 2. routesadmin@baguioboosters.com - Routes Admin (CRUD for jeepney routes)
 * 3. eventsadmin@baguioboosters.com - Events Admin (CRUD for events)
 * 4. regularuser@email.com - Regular User
 * 5. premiumuser@email.com - Premium User
 * 
 * Usage: node seed-admin-users.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
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

// Super admin credentials for authentication
const SUPER_ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'superadmin@baguioboosters.com'

// Users to create
const usersToCreate = [
  {
    email: 'admin@baguioboosters.com',
    password: '', // Will be prompted
    displayName: 'Places Administrator',
    role: 'places_admin',
    permissions: ['places:read', 'places:write', 'places:delete', 'places:update'],
    description: 'Can manage all places (tourist spots, restaurants, hotels, etc.)'
  },
  {
    email: 'routesadmin@baguioboosters.com',
    password: '',
    displayName: 'Routes Administrator',
    role: 'routes_admin',
    permissions: ['routes:read', 'routes:write', 'routes:delete', 'routes:update', 'jeepneyOptions:all'],
    description: 'Can manage all jeepney routes and options'
  },
  {
    email: 'eventsadmin@baguioboosters.com',
    password: '',
    displayName: 'Events Administrator',
    role: 'events_admin',
    permissions: ['events:read', 'events:write', 'events:delete', 'events:update'],
    description: 'Can manage all events and festivals'
  },
  {
    email: 'regularuser@email.com',
    password: '',
    displayName: 'Regular User',
    role: 'user',
    isPremium: false,
    permissions: ['basic:access'],
    description: 'Regular user with basic access'
  },
  {
    email: 'premiumuser@email.com',
    password: '',
    displayName: 'Premium User',
    role: 'user',
    isPremium: true,
    permissions: ['basic:access', 'premium:access', 'offline:access'],
    description: 'Premium user with full access to premium features'
  }
]

// readline for password
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createUsers() {
  console.log('🚀 Boost Baguio - Admin & User Seeder\n')
  console.log('📋 Users to create:')
  usersToCreate.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email} (${user.role})`)
  })
  console.log()

  try {
    // Get super admin password
    console.log('🔐 SUPER ADMIN AUTHENTICATION REQUIRED')
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`)
    const password = await question('Password: ')

    console.log('\n🔑 Signing in as super admin...')
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password)
    console.log('✅ Successfully authenticated as super admin!\n')

    // Create each user
    let successCount = 0
    let errorCount = 0

    for (const userData of usersToCreate) {
      try {
        console.log(`\n📝 Creating: ${userData.email}...`)

        // Set the password
        userData.password = password

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        )

        const user = userCredential.user

        // Create user document in Firestore
        if (userData.role === 'user') {
          // Regular/Premium user - create in 'users' collection
          await setDoc(doc(db, 'users', user.uid), {
            email: userData.email,
            displayName: userData.displayName,
            photoURL: null,
            role: userData.role,
            isPremium: userData.isPremium,
            premiumExpiry: userData.isPremium ? null : null,
            permissions: userData.permissions,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
          })

          console.log(`   ✅ Created user: ${userData.displayName}`)
          console.log(`   📊 Role: ${userData.isPremium ? 'PREMIUM' : 'REGULAR'}`)
          console.log(`   📊 UID: ${user.uid}`)
        } else {
          // Admin user - create in 'admins' collection
          await setDoc(doc(db, 'admins', user.uid), {
            email: userData.email,
            name: userData.displayName,
            role: userData.role,
            permissions: userData.permissions,
            isActive: true,
            createdBy: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            description: userData.description
          })

          console.log(`   ✅ Created admin: ${userData.displayName}`)
          console.log(`   📊 Role: ${userData.role.toUpperCase()}`)
          console.log(`   📊 Permissions: ${userData.permissions.join(', ')}`)
          console.log(`   📊 UID: ${user.uid}`)
        }

        successCount++

        // Sign out to create next user
        await signOut(auth)

        // Sign back in as super admin
        await signInWithEmailAndPassword(auth, SUPER_ADMIN_EMAIL, password)

      } catch (error) {
        errorCount++
        console.error(`   ❌ Error creating ${userData.email}:`, error.message)

        // Check if user already exists
        if (error.code === 'auth/email-already-in-use') {
          console.log(`   ⚠️  User already exists. Skipping...`)
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('🎉 USER CREATION COMPLETE!')
    console.log('='.repeat(70))
    console.log(`✅ Successfully created: ${successCount} users`)
    console.log(`❌ Failed: ${errorCount} users`)
    console.log(`📊 Total: ${usersToCreate.length} users`)
    console.log('='.repeat(70))

    console.log('\n📋 ACCOUNT SUMMARY:\n')

    console.log('🔐 ADMIN ACCOUNTS:')
    console.log('   1. admin@baguioboosters.com')
    console.log('      - Role: Places Administrator')
    console.log('      - Can: CRUD all places (tourist spots, restaurants, hotels, etc.)')
    console.log()
    console.log('   2. routesadmin@baguioboosters.com')
    console.log('      - Role: Routes Administrator')
    console.log('      - Can: CRUD all jeepney routes and options')
    console.log()
    console.log('   3. eventsadmin@baguioboosters.com')
    console.log('      - Role: Events Administrator')
    console.log('      - Can: CRUD all events and festivals')
    console.log()

    console.log('👤 USER ACCOUNTS:')
    console.log('   4. regularuser@email.com')
    console.log('      - Role: Regular User')
    console.log('      - Access: Basic features only')
    console.log()
    console.log('   5. premiumuser@email.com')
    console.log('      - Role: Premium User')
    console.log('      - Access: All premium features (offline mode, saved routes, etc.)')
    console.log()

    console.log('🔑 All accounts use the same password as super admin')
    console.log()
    console.log('✅ You can now login with any of these accounts!\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.code === 'auth/wrong-password') {
      console.error('❌ Incorrect password.')
    } else if (error.code === 'auth/user-not-found') {
      console.error('❌ Super admin email not found.')
    } else if (error.code === 'auth/invalid-credential') {
      console.error('❌ Invalid credentials.')
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('❌ Email/Password authentication is not enabled.')
      console.error('   Go to Firebase Console > Authentication > Sign-in method')
      console.error('   Enable "Email/Password"')
    }
    console.error('Stack trace:', error.stack)
  } finally {
    rl.close()
  }
}

// Run the seeder
createUsers()
