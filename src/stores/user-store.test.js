/**
 * Tests for User Store
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from 'src-stores/user-store'

// Mock Firebase
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  reauthenticateWithCredential: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
}))

vi.mock('src-boot/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  db: {},
}))

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
}))

describe('User Store', () => {
  let store

  beforeEach(async () => {
    setActivePinia(createPinia())
    store = useUserStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Initial State', () => {
    it('starts with default state', () => {
      expect(store.user).toBeNull()
      expect(store.isPremium).toBe(false)
      expect(store.loading).toBe(true)
      expect(store.premiumExpiry).toBeNull()
    })
  })

  describe('Getters', () => {
    it('isAuthenticated returns false when no user', () => {
      expect(store.isAuthenticated).toBe(false)
    })

    it('isAuthenticated returns true when user exists', () => {
      store.user = { uid: 'test-uid' }
      expect(store.isAuthenticated).toBe(true)
    })

    it('userEmail returns empty string when no user', () => {
      expect(store.userEmail).toBe('')
    })

    it('userEmail returns email when user exists', () => {
      store.user = { email: 'test@example.com' }
      expect(store.userEmail).toBe('test@example.com')
    })

    it('userName returns default name when no user', () => {
      expect(store.userName).toBe('User')
    })

    it('userName returns displayName when user exists', () => {
      store.user = { displayName: 'John Doe' }
      expect(store.userName).toBe('John Doe')
    })
  })

  describe('signUp', () => {
    it('creates a new user successfully', async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
      const { setDoc } = await import('firebase/firestore')

      const mockUserCredential = {
        user: {
          uid: 'new-user-uid',
          email: 'newuser@example.com',
          displayName: null,
        },
      }

      createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential)
      updateProfile.mockResolvedValue()
      setDoc.mockResolvedValue()

      const result = await store.signUp('newuser@example.com', 'password123', 'New User')

      expect(result.success).toBe(true)
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      )
      expect(updateProfile).toHaveBeenCalledWith(mockUserCredential.user, {
        displayName: 'New User',
      })
      expect(store.user).toEqual(mockUserCredential.user)
    })

    it('handles email already in use error', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')

      createUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/email-already-in-use',
      })

      const result = await store.signUp('test@example.com', 'password', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already in use')
    })

    it('handles weak password error', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')

      createUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/weak-password',
      })

      const result = await store.signUp('test@example.com', '123', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Password should be at least 6 characters')
    })

    it('handles invalid email error', async () => {
      const { createUserWithEmailAndPassword } = await import('firebase/auth')

      createUserWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-email',
      })

      const result = await store.signUp('invalid-email', 'password', 'Test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email address')
    })
  })

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth')

      const mockUserCredential = {
        user: {
          uid: 'existing-user-uid',
          email: 'user@example.com',
          displayName: 'Existing User',
        },
      }

      signInWithEmailAndPassword.mockResolvedValue(mockUserCredential)

      const result = await store.signIn('user@example.com', 'password123')

      expect(result.success).toBe(true)
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'user@example.com',
        'password123'
      )
      expect(store.user).toEqual(mockUserCredential.user)
    })

    it('handles user not found error', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth')

      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found',
      })

      const result = await store.signIn('notfound@example.com', 'password')

      expect(result.success).toBe(false)
      expect(result.error).toBe('No account found with this email')
    })

    it('handles wrong password error', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth')

      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/wrong-password',
      })

      const result = await store.signIn('user@example.com', 'wrongpassword')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Incorrect password')
    })

    it('handles invalid credential error', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth')

      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-credential',
      })

      const result = await store.signIn('user@example.com', 'password')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email or password')
    })
  })

  describe('logout', () => {
    it('signs out user successfully', async () => {
      const { signOut } = await import('firebase/auth')

      signOut.mockResolvedValue()
      store.user = { uid: 'test-uid' }
      store.isPremium = true

      const result = await store.logout()

      expect(result.success).toBe(true)
      expect(signOut).toHaveBeenCalled()
      expect(store.user).toBeNull()
      expect(store.isPremium).toBe(false)
    })

    it('handles logout error', async () => {
      const { signOut } = await import('firebase/auth')

      signOut.mockRejectedValue(new Error('Logout failed'))

      const result = await store.logout()

      expect(result.success).toBe(false)
    })
  })

  describe('canUseOffline', () => {
    it('returns true when user is premium', () => {
      store.isPremium = true
      expect(store.canUseOffline).toBe(true)
    })

    it('returns false when user is not premium', () => {
      store.isPremium = false
      expect(store.canUseOffline).toBe(false)
    })
  })
})
