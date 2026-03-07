/**
 * Script to set Firebase Custom Claims for admin users
 *
 * This script reads admin documents from Firestore and sets
 * corresponding Firebase Custom Claims for each admin user.
 *
 * Usage:
 *   node set-admin-custom-claims.js
 *
 * Requirements:
 *   - Firebase Admin SDK initialized
 *   - Service account credentials in .env file
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()
const auth = getAuth()

// Role mapping from old sessionStorage roles to custom claims
const ROLE_MAPPING = {
  super_admin: {
    role: 'super_admin',
    permissions: ['super_admin:all'],
  },
  routes_admin: {
    role: 'routes_admin',
    permissions: ['routes:write', 'routes:read'],
  },
  places_admin: {
    role: 'places_admin',
    permissions: ['places:write', 'places:read'],
  },
  events_admin: {
    role: 'events_admin',
    permissions: ['events:write', 'events:read'],
  },
  photos_admin: {
    role: 'photos_admin',
    permissions: ['photos:write', 'photos:read'],
  },
}

/**
 * Set custom claims for a single user
 * @param {string} uid - User ID
 * @param {Object} claims - Custom claims object
 */
async function setCustomClaimsForUser(uid, claims) {
  try {
    await auth.setCustomUserClaims(uid, claims)
    console.log(`✅ Set claims for user ${uid}:`, claims)
    return true
  } catch (error) {
    console.error(`❌ Error setting claims for user ${uid}:`, error.message)
    return false
  }
}

/**
 * Main function to process all admins
 */
async function setAdminCustomClaims() {
  console.log('🚀 Starting to set Firebase Custom Claims for admins...\n')

  try {
    // Get all admin documents
    const adminsRef = db.collection('admins')
    const adminsSnapshot = await adminsRef.get()

    if (adminsSnapshot.empty) {
      console.log('⚠️ No admin documents found in Firestore')
      return
    }

    console.log(`📋 Found ${adminsSnapshot.size} admin document(s)\n`)

    let successCount = 0
    let errorCount = 0

    // Process each admin
    for (const adminDoc of adminsSnapshot.docs) {
      const adminData = adminDoc.data()
      const uid = adminDoc.id

      console.log(
        `Processing: ${adminData.name || adminData.email} (${adminData.role || 'unknown role'})`
      )

      // Get claims based on role
      const roleClaims = ROLE_MAPPING[adminData.role] || {
        role: adminData.role || 'admin',
        permissions: adminData.permissions || ['admin:read'],
      }

      // Create custom claims object
      const customClaims = {
        admin: true,
        ...roleClaims,
      }

      // Set custom claims
      const success = await setCustomClaimsForUser(uid, customClaims)

      if (success) {
        successCount++
      } else {
        errorCount++
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log('\n✅ Completed!')
    console.log(`   Success: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total: ${adminsSnapshot.size}`)

    console.log(
      '\n⚠️ IMPORTANT: Users need to sign out and sign back in for claims to take effect.'
    )
    console.log('   The custom claims are included in the ID token, which is refreshed on login.\n')
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
setAdminCustomClaims()
