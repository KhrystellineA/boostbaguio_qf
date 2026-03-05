/**
 * Boost Baguio - Activity Logs Service
 *
 * Tracks admin actions and system events:
 * - Admin logins/logouts
 * - CRUD operations on resources (places, events, jeepneys, routes)
 * - Bulk operations
 * - Exports/imports
 * - System events
 */

import { db } from 'src/boot/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore'

/**
 * Log an admin activity
 * @param {Object} params - Activity parameters
 * @param {Object} params.admin - Admin user object { uid, name, email, role }
 * @param {string} params.action - Action type (create, update, delete, bulk_delete, login, logout, export, import)
 * @param {string} params.resource - Resource type (places, events, jeepneys, routes, admins, photos, users)
 * @param {string} params.description - Human-readable description of the action
 * @param {Object} [params.metadata] - Additional metadata about the action
 * @param {string} [params.ipAddress] - IP address of the admin
 * @param {string} [params.entityId] - ID of the affected entity
 */
export async function logActivity({
  admin,
  action,
  resource,
  description,
  metadata = null,
  ipAddress = null,
  entityId = null
}) {
  try {
    const logEntry = {
      admin: {
        uid: admin.uid,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      action,
      resource,
      description,
      metadata,
      ipAddress,
      entityId,
      timestamp: serverTimestamp()
    }

    await addDoc(collection(db, 'activity_logs'), logEntry)
    console.log('[Activity Log] Logged:', action, resource, description)
  } catch (error) {
    console.error('[Activity Log] Error logging activity:', error)
    // Don't throw - logging should not break the main operation
  }
}

/**
 * Log admin login
 */
export async function logAdminLogin(admin, ipAddress = null) {
  return logActivity({
    admin,
    action: 'login',
    resource: 'admins',
    description: `${admin.name} logged in`,
    ipAddress
  })
}

/**
 * Log admin logout
 */
export async function logAdminLogout(admin, ipAddress = null) {
  return logActivity({
    admin,
    action: 'logout',
    resource: 'admins',
    description: `${admin.name} logged out`,
    ipAddress
  })
}

/**
 * Log resource creation
 */
export async function logCreate(admin, resource, entityName, entityId = null, metadata = null) {
  return logActivity({
    admin,
    action: 'create',
    resource,
    description: `Created ${resource.slice(0, -1)}: ${entityName}`,
    entityId,
    metadata
  })
}

/**
 * Log resource update
 */
export async function logUpdate(admin, resource, entityName, entityId = null, metadata = null) {
  return logActivity({
    admin,
    action: 'update',
    resource,
    description: `Updated ${resource.slice(0, -1)}: ${entityName}`,
    entityId,
    metadata
  })
}

/**
 * Log resource deletion
 */
export async function logDelete(admin, resource, entityName, entityId = null) {
  return logActivity({
    admin,
    action: 'delete',
    resource,
    description: `Deleted ${resource.slice(0, -1)}: ${entityName}`,
    entityId
  })
}

/**
 * Log bulk deletion
 */
export async function logBulkDelete(admin, resource, count, entityIds = []) {
  return logActivity({
    admin,
    action: 'bulk_delete',
    resource,
    description: `Bulk deleted ${count} ${resource} items`,
    metadata: { count, entityIds }
  })
}

/**
 * Log export action
 */
export async function logExport(admin, resource, format = 'csv', metadata = null) {
  return logActivity({
    admin,
    action: 'export',
    resource,
    description: `Exported ${resource} to ${format.toUpperCase()}`,
    metadata: { format, ...metadata }
  })
}

/**
 * Log import action
 */
export async function logImport(admin, resource, count, metadata = null) {
  return logActivity({
    admin,
    action: 'import',
    resource,
    description: `Imported ${count} ${resource} items`,
    metadata: { count, ...metadata }
  })
}

/**
 * Get recent activity logs
 * @param {number} limitCount - Number of logs to retrieve
 */
export async function getRecentActivityLogs(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('[Activity Logs] Error getting recent logs:', error)
    return []
  }
}

/**
 * Get activity logs by admin
 * @param {string} adminUid - Admin UID to filter by
 * @param {number} limitCount - Number of logs to retrieve
 */
export async function getAdminActivityLogs(adminUid, limitCount = 50) {
  try {
    const q = query(
      collection(db, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return logs.filter(log => log.admin?.uid === adminUid)
  } catch (error) {
    console.error('[Activity Logs] Error getting admin logs:', error)
    return []
  }
}

export default {
  logActivity,
  logAdminLogin,
  logAdminLogout,
  logCreate,
  logUpdate,
  logDelete,
  logBulkDelete,
  logExport,
  logImport,
  getRecentActivityLogs,
  getAdminActivityLogs
}
