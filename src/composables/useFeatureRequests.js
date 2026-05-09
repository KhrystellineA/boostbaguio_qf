/**
 * Feature-request workflow.
 *
 * A places-admin or events-admin can ask the super admin to mark a specific
 * place or event as `featured`. Requests live in the `featureRequests`
 * collection and the super admin approves / rejects from the notifications
 * dropdown. Approval flips `featured: true` on the target doc.
 *
 * Schema (`featureRequests/{id}`):
 *   targetType:        'place' | 'event'
 *   targetId:          string  — id of the place/event doc
 *   targetName:        string  — denormalized for display in notifications
 *   requestedBy:       string  — admin uid
 *   requestedByName:   string
 *   requestedByRole:   string
 *   note:              string  (optional)
 *   status:            'pending' | 'approved' | 'rejected'
 *   createdAt:         serverTimestamp
 *   decidedAt:         serverTimestamp | null
 *   decidedBy:         string | null
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, auth } from 'src/boot/firebase'

const COLLECTION = 'featureRequests'

/**
 * Create a new pending request. Returns the new doc id.
 *
 * @param {{
 *   targetType: 'place' | 'event',
 *   targetId: string,
 *   targetName: string,
 *   note?: string,
 *   requestedByName?: string,
 *   requestedByRole?: string,
 * }} input
 */
export async function submitFeatureRequest(input) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to submit a request.')

  // Don't let two pending requests pile up for the same target.
  const existingQ = query(
    collection(db, COLLECTION),
    where('targetType', '==', input.targetType),
    where('targetId', '==', input.targetId),
    where('status', '==', 'pending')
  )
  const existing = await getDocs(existingQ)
  if (!existing.empty) {
    throw new Error('A pending request for this item already exists.')
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: input.targetName || '',
    note: (input.note || '').trim() || null,
    requestedBy: user.uid,
    requestedByName: input.requestedByName || user.displayName || user.email || 'Admin',
    requestedByRole: input.requestedByRole || null,
    status: 'pending',
    createdAt: serverTimestamp(),
    decidedAt: null,
    decidedBy: null,
  })
  return docRef.id
}

/**
 * Subscribe to all pending requests (super-admin only). Returns an
 * unsubscribe function.
 *
 * @param {(requests: Array<object>) => void} onChange
 */
export function watchPendingRequests(onChange) {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      onChange(list)
    },
    (err) => {
      console.error('[featureRequests] watch failed:', err)
      onChange([])
    }
  )
}

/**
 * Approve a request. Marks it approved AND flips `featured: true` on the
 * target place / event doc.
 */
export async function approveFeatureRequest(request) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to decide on a request.')
  if (!request?.id) throw new Error('Invalid request.')

  const targetCollection = request.targetType === 'event' ? 'events' : 'places'
  const targetRef = doc(db, targetCollection, request.targetId)
  const requestRef = doc(db, COLLECTION, request.id)

  await updateDoc(targetRef, { featured: true })
  await updateDoc(requestRef, {
    status: 'approved',
    decidedAt: serverTimestamp(),
    decidedBy: user.uid,
  })
}

/**
 * Reject a request. Leaves the target doc untouched; just marks the request
 * record as rejected.
 */
export async function rejectFeatureRequest(request) {
  const user = auth.currentUser
  if (!user) throw new Error('You must be signed in to decide on a request.')
  if (!request?.id) throw new Error('Invalid request.')
  await updateDoc(doc(db, COLLECTION, request.id), {
    status: 'rejected',
    decidedAt: serverTimestamp(),
    decidedBy: user.uid,
  })
}
