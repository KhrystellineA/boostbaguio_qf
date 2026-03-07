/**
 * User Store - Manages user authentication and premium status
 * @module stores/user-store
 */

import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from 'src/boot/firebase'
import { Notify } from 'quasar'

/**
 * @typedef {Object} User
 * @property {string} uid - User ID
 * @property {string} email - User email
 * @property {string|null} displayName - User display name
 * @property {string|null} photoURL - User photo URL
 */

/**
 * @typedef {Object} UserState
 * @property {User|null} user - Current user
 * @property {boolean} isPremium - Premium status
 * @property {boolean} loading - Loading state
 * @property {string|null} premiumExpiry - Premium expiry date
 */

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isPremium: false,
    loading: true,
    premiumExpiry: null
  }),

  getters: {
    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated: (state) => !!state.user,
    /**
     * Get user email
     * @returns {string}
     */
    userEmail: (state) => state.user?.email || '',
    /**
     * Get user display name
     * @returns {string}
     */
    userName: (state) => state.user?.displayName || 'User',
    /**
     * Get user photo URL
     * @returns {string|null}
     */
    userPhotoURL: (state) => state.user?.photoURL || null,
    /**
     * Check if user can use offline mode (premium feature)
     * @returns {boolean}
     */
    canUseOffline: (state) => state.isPremium,
  },

  actions: {
    /**
     * Initialize authentication state
     * @returns {Promise<User|null>}
     */
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            this.user = user
            await this.checkPremiumStatus()
          } else {
            this.user = null
            this.isPremium = false
            this.premiumExpiry = null
          }
          this.loading = false
          resolve(user)
        })
      })
    },

    /**
     * Sign up a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} displayName - User display name
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async signUp(email, password, displayName) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        await updateProfile(userCredential.user, {
          displayName: displayName
        })

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          displayName: displayName,
          isPremium: false,
          createdAt: new Date().toISOString(),
          premiumExpiry: null
        })

        this.user = userCredential.user
        this.isPremium = false

        Notify.create({
          type: 'positive',
          message: 'Account created successfully!',
          position: 'top'
        })

        return { success: true }
      } catch (error) {
        let message = 'Failed to create account'
        
        if (error.code === 'auth/email-already-in-use') {
          message = 'Email already in use'
        } else if (error.code === 'auth/weak-password') {
          message = 'Password should be at least 6 characters'
        } else if (error.code === 'auth/invalid-email') {
          message = 'Invalid email address'
        }

        Notify.create({
          type: 'negative',
          message: message,
          position: 'top'
        })

        return { success: false, error: message }
      }
    },

    /**
     * Sign in an existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async signIn(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        
        // ✅ IMPROVED: Check premium status but don't let it fail login
        await this.checkPremiumStatus()

        Notify.create({
          type: 'positive',
          message: 'Welcome back!',
          position: 'top'
        })

        return { success: true }
      } catch (error) {
        console.error('[UserStore] Sign in error:', error.code, error.message)
        
        let message = 'Failed to sign in'
        
        if (error.code === 'auth/user-not-found') {
          message = 'No account found with this email'
        } else if (error.code === 'auth/wrong-password') {
          message = 'Incorrect password'
        } else if (error.code === 'auth/invalid-email') {
          message = 'Invalid email address'
        } else if (error.code === 'auth/invalid-credential') {
          message = 'Invalid email or password'
        }

        Notify.create({
          type: 'negative',
          message: message,
          position: 'top'
        })

        return { success: false, error: message }
      }
    },

    /**
     * Sign out current user
     * @returns {Promise<{success: boolean}>}
     */
    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.isPremium = false
        this.premiumExpiry = null

        Notify.create({
          type: 'info',
          message: 'Signed out successfully',
          position: 'top'
        })

        return { success: true }
      } catch (error) {
        console.error('[UserStore] Logout error:', error)
        
        Notify.create({
          type: 'negative',
          message: 'Failed to sign out',
          position: 'top'
        })

        return { success: false }
      }
    },

    async checkPremiumStatus() {
      if (!this.user) return

      try {
        const userDoc = await getDoc(doc(db, 'users', this.user.uid))
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          this.isPremium = userData.isPremium || false
          this.premiumExpiry = userData.premiumExpiry

          if (this.isPremium && this.premiumExpiry) {
            const expiryDate = new Date(this.premiumExpiry)
            if (expiryDate < new Date()) {
              await this.updatePremiumStatus(false, null)
              this.isPremium = false
              this.premiumExpiry = null

              Notify.create({
                type: 'warning',
                message: 'Your premium subscription has expired',
                position: 'top'
              })
            }
          }
        } else {
          // ✅ IMPROVED: If user document doesn't exist, create it
          console.warn('[UserStore] User document not found, creating...')
          await this.createUserDocument()
        }
      } catch (error) {
        // ✅ FIXED: Changed console() to console.error()
        console.error('[UserStore] Error checking premium status:', error)
      }
    },

    // ✅ NEW: Create missing user document
    async createUserDocument() {
      if (!this.user) return

      try {
        await setDoc(doc(db, 'users', this.user.uid), {
          email: this.user.email,
          displayName: this.user.displayName || 'User',
          role: 'user',
          isPremium: false,
          createdAt: new Date().toISOString(),
          premiumExpiry: null
        })

        this.isPremium = false
        this.premiumExpiry = null

        console.log('[UserStore] User document created successfully')
      } catch (error) {
        console.error('[UserStore] Error creating user document:', error)
      }
    },

    async updatePremiumStatus(isPremium, expiryDate) {
      if (!this.user) return

      try {
        await updateDoc(doc(db, 'users', this.user.uid), {
          isPremium: isPremium,
          premiumExpiry: expiryDate,
          lastUpdated: new Date().toISOString()
        })

        this.isPremium = isPremium
        this.premiumExpiry = expiryDate

        return { success: true }
      } catch (error) {
        console.error('[UserStore] Error updating premium status:', error)
        return { success: false }
      }
    },

    async activatePremium(durationMonths = 1) {
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths)

      await this.updatePremiumStatus(true, expiryDate.toISOString())

      Notify.create({
        type: 'positive',
        message: `Premium activated until ${expiryDate.toLocaleDateString()}`,
        position: 'top'
      })
    },

    async updateProfileInfo({ displayName, photoURL }) {
      if (!this.user) {
        Notify.create({
          type: 'negative',
          message: 'User not authenticated',
          position: 'top'
        })
        return { success: false }
      }

      try {
        const updateData = {}
        if (displayName !== undefined) updateData.displayName = displayName
        if (photoURL !== undefined) updateData.photoURL = photoURL

        await updateProfile(this.user, updateData)

        const userDocRef = doc(db, 'users', this.user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          await updateDoc(userDocRef, {
            displayName: displayName !== undefined ? displayName : this.user.displayName,
            photoURL: photoURL !== undefined ? photoURL : this.user.photoURL,
            lastUpdated: new Date().toISOString()
          })
        } else {
          await setDoc(userDocRef, {
            email: this.user.email,
            displayName: displayName !== undefined ? displayName : this.user.displayName,
            photoURL: photoURL !== undefined ? photoURL : this.user.photoURL,
            role: 'user',
            isPremium: false,
            createdAt: new Date().toISOString(),
            premiumExpiry: null,
            lastUpdated: new Date().toISOString()
          })
        }

        // Refresh the user object to get the updated photoURL
        const currentUser = auth.currentUser
        if (currentUser) {
          this.user = currentUser
        }

        Notify.create({
          type: 'positive',
          message: 'Profile updated successfully!',
          position: 'top'
        })

        return { success: true }
      } catch (error) {
        console.error('[UserStore] Profile update error:', error)

        let message = 'Failed to update profile'
        if (error.code === 'auth/requires-recent-login') {
          message = 'Please log in again to update your profile'
        }

        Notify.create({
          type: 'negative',
          message: message,
          position: 'top'
        })

        return { success: false, error: message }
      }
    },

    async updatePassword({ currentPassword, newPassword }) {
      if (!this.user || !this.user.email) {
        Notify.create({
          type: 'negative',
          message: 'User not authenticated',
          position: 'top'
        })
        return { success: false }
      }

      if (!currentPassword || !newPassword) {
        Notify.create({
          type: 'warning',
          message: 'Please fill in all password fields',
          position: 'top'
        })
        return { success: false }
      }

      if (newPassword.length < 6) {
        Notify.create({
          type: 'warning',
          message: 'New password must be at least 6 characters',
          position: 'top'
        })
        return { success: false }
      }

      try {
        const credential = EmailAuthProvider.credential(
          this.user.email,
          currentPassword
        )

        await reauthenticateWithCredential(this.user, credential)

        await updatePassword(this.user, newPassword)

        Notify.create({
          type: 'positive',
          message: 'Password changed successfully!',
          position: 'top'
        })

        return { success: true }
      } catch (error) {
        console.error('[UserStore] Password update error:', error)

        let message = 'Failed to change password'
        if (error.code === 'auth/wrong-password') {
          message = 'Current password is incorrect'
        } else if (error.code === 'auth/requires-recent-login') {
          message = 'Please log in again to change your password'
        } else if (error.code === 'auth/weak-password') {
          message = 'New password is too weak'
        }

        Notify.create({
          type: 'negative',
          message: message,
          position: 'top'
        })

        return { success: false, error: message }
      }
    }
  }
})