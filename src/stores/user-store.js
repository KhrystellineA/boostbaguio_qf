import { defineStore } from 'pinia'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from 'src/boot/firebase'
import { Notify } from 'quasar'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isPremium: false,
    loading: true,
    premiumExpiry: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email || '',
    userName: (state) => state.user?.displayName || 'User',
    canUseOffline: (state) => state.isPremium,
  },

  actions: {
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

    async signIn(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        await this.checkPremiumStatus()

        Notify.create({
          type: 'positive',
          message: 'Welcome back!',
          position: 'top'
        })

        return { success: true }
      } catch (error) {
        let message = 'Failed to sign in'
        
        if (error.code === 'auth/user-not-found') {
          message = 'No account found with this email'
        } else if (error.code === 'auth/wrong-password') {
          message = 'Incorrect password'
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
      } catch {
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
        }
      } catch {
        console('Error checking premium status:')
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
      } catch {
        console.log('Error updating premium status:')
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
    }
  }
})