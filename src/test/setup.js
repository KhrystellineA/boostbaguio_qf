/**
 * Test Setup File
 * Configures global test utilities and mocks
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom'

// ============================================
// Global Mocks
// ============================================

// Mock Quasar with all components
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Notify: {
      create: vi.fn(),
    },
    Dialog: {
      create: vi.fn(),
    },
    Loading: {
      show: vi.fn(),
      hide: vi.fn(),
    },
    useQuasar: () => ({
      notify: vi.fn(),
      dialog: {
        create: vi.fn(),
      },
      loading: {
        show: vi.fn(),
        hide: vi.fn(),
      },
    }),
    // Mock Quasar components
    QIcon: { name: 'QIcon' },
    QBtn: { name: 'QBtn' },
    QCard: { name: 'QCard' },
    QCardSection: { name: 'QCardSection' },
    QSeparator: { name: 'QSeparator' },
  }
})

// Mock Firebase
vi.mock('src/boot/firebase', () => {
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: vi.fn((callback) => {
      callback(null)
      return vi.fn() // unsubscribe
    }),
    config: {
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
    },
  }

  const mockDb = {
    id: 'test-db',
  }

  const mockStorage = {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
    deleteObject: vi.fn(),
  }

  return {
    auth: mockAuth,
    db: mockDb,
    storage: mockStorage,
    default: {
      auth: mockAuth,
      db: mockDb,
      storage: mockStorage,
    },
  }
})

// Mock Firebase functions
vi.mock('firebase/auth', () => {
  return {
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
  }
})

vi.mock('firebase/firestore', () => {
  return {
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    serverTimestamp: vi.fn(),
  }
})

vi.mock('firebase/storage', () => {
  return {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
    deleteObject: vi.fn(),
    uploadBytesResumable: vi.fn(),
  }
})

// Mock Vue Router
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      currentRoute: { value: { path: '/', name: 'home' } },
      addRoute: vi.fn(),
      removeRoute: vi.fn(),
      getRoutes: vi.fn(() => []),
      resolve: vi.fn(),
    }),
    useRoute: () => ({
      path: '/',
      name: 'home',
      params: {},
      query: {},
      hash: '',
      fullPath: '/',
      matched: [],
    }),
  }
})

// Mock Pinia stores
vi.mock('stores/user-store', () => {
  return {
    useUserStore: () => ({
      user: null,
      isPremium: false,
      loading: false,
      premiumExpiry: null,
      isAuthenticated: false,
      userEmail: '',
      userName: 'Test User',
      userPhotoURL: null,
      canUseOffline: false,
      initAuth: vi.fn(),
      signUp: vi.fn(),
      signIn: vi.fn(),
      logout: vi.fn(),
      checkPremiumStatus: vi.fn(),
      updatePremiumStatus: vi.fn(),
      updateProfileInfo: vi.fn(),
      updatePassword: vi.fn(),
      deleteUserAccount: vi.fn(),
    }),
  }
})

// ============================================
// Global Test Utilities
// ============================================

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// ============================================
// Helper Functions
// ============================================

/**
 * Create a mock Firebase user
 */
export function mockFirebaseUser(overrides = {}) {
  return {
    uid: 'test-user-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: false,
    isAnonymous: false,
    providerData: [],
    metadata: {},
    ...overrides,
  }
}

/**
 * Create a mock Firestore document
 */
export function mockFirestoreDoc(data, id = 'test-id') {
  return {
    id,
    data: () => data,
    exists: () => true,
  }
}

/**
 * Create a mock Firestore snapshot
 */
export function mockFirestoreSnapshot(docs = []) {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs,
    forEach: vi.fn((callback) => docs.forEach(callback)),
  }
}

/**
 * Wait for next tick
 */
export async function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Wait for async operations
 */
export async function waitForAsyncOperations() {
  await vi.runAllTimersAsync()
  await nextTick()
}
