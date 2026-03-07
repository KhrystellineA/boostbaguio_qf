/**
 * Composable for checking admin permissions via Firebase Custom Claims
 * @module useAdminClaims
 */

import { auth } from 'src/boot/firebase'

/**
 * @typedef {Object} AdminClaims
 * @property {boolean} [admin] - Whether user is an admin
 * @property {string} [role] - Admin role (super_admin, routes_admin, etc.)
 * @property {string[]} [permissions] - Array of permissions
 */

/**
 * Get the current user's ID token claims (includes custom claims)
 * @param {boolean} forceRefresh - Force refresh the token
 * @returns {Promise<AdminClaims|null>} Claims object or null if no user
 */
export async function getIdTokenClaims(forceRefresh = false) {
  if (!auth.currentUser) {
    return null
  }

  try {
    const idTokenResult = await auth.currentUser.getIdTokenResult(forceRefresh)
    return idTokenResult.claims
  } catch (error) {
    console.error('[useAdminClaims] Error getting ID token claims:', error)
    return null
  }
}

/**
 * Check if current user is an admin
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin() {
  const claims = await getIdTokenClaims()
  if (!claims) return false

  // Check for admin custom claim set by Firebase Admin SDK
  // The claim should be set via admin.auth().setCustomUserClaims(uid, { admin: true })
  return !!claims.admin || !!claims.role
}

/**
 * Check if current user is a super admin
 * @returns {Promise<boolean>}
 */
export async function checkIsSuperAdmin() {
  const claims = await getIdTokenClaims()
  if (!claims) return false

  // Check for super_admin role in custom claims
  return !!claims.super_admin ||
         (claims.role && claims.role === 'super_admin') ||
         (claims.permissions && claims.permissions.includes('super-admin'))
}

/**
 * Get the user's admin role from custom claims
 * @returns {Promise<string|null>}
 */
export async function getAdminRole() {
  const claims = await getIdTokenClaims()
  if (!claims) return null

  return claims.role || claims.adminRole || null
}

/**
 * Get user's permissions from custom claims
 * @returns {Promise<string[]>}
 */
export async function getPermissions() {
  const claims = await getIdTokenClaims()
  if (!claims) return []

  return claims.permissions || []
}

/**
 * Vue 3 composable function for admin claims
 * @returns {Object} Admin state and helpers
 * @returns {Function} returns.isAdmin - Check if user is admin
 * @returns {Function} returns.isSuperAdmin - Check if user is super admin
 * @returns {Function} returns.getRole - Get admin role
 * @returns {Function} returns.refreshClaims - Refresh claims from server
 */
export function useAdminClaims() {
  const isAdmin = async () => await checkIsAdmin()
  const isSuperAdmin = async () => await checkIsSuperAdmin()
  const getRole = async () => await getAdminRole()
  const refreshClaims = async () => await getIdTokenClaims(true)

  return {
    isAdmin,
    isSuperAdmin,
    getRole,
    refreshClaims
  }
}
