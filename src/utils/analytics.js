/**
 * Boost Baguio - Analytics Tracking Service
 * 
 * Tracks user interactions for analytics:
 * - Place searches
 * - Place saves/bookmarks
 * - Place visits (completed commutes)
 * - Foot traffic (real-time location)
 * - Popular times by day/hour
 */

import { db } from 'src/boot/firebase'
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, query, where, getDocs, increment } from 'firebase/firestore'

/**
 * Track a place search
 * @param {string} placeId - The place that was searched
 * @param {string} userId - User who performed the search
 */
export async function trackSearch(placeId, userId = 'anonymous') {
  try {
    await addDoc(collection(db, 'analytics_searches'), {
      placeId,
      userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay() // 0-6 (Sunday-Saturday)
    })
  } catch (error) {
    console.error('[Analytics] Error tracking search:', error)
  }
}

/**
 * Track a place save/bookmark
 * @param {string} placeId - The place that was saved
 * @param {string} userId - User who saved the place
 */
export async function trackSave(placeId, userId = 'anonymous') {
  try {
    await addDoc(collection(db, 'analytics_saves'), {
      placeId,
      userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    })

    // Also increment save count on the place itself
    const placeRef = doc(db, 'places', placeId)
    await updateDoc(placeRef, {
      saveCount: increment(1)
    })
  } catch (error) {
    console.error('[Analytics] Error tracking save:', error)
  }
}

/**
 * Track a completed commute/visit to a place
 * @param {string} placeId - The destination place
 * @param {string} userId - User who completed the commute
 * @param {object} routeData - Route information
 */
export async function trackVisit(placeId, userId = 'anonymous', routeData = {}) {
  try {
    await addDoc(collection(db, 'analytics_visits'), {
      placeId,
      userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      routeData,
      completed: true
    })

    // Also increment visit count on the place itself
    const placeRef = doc(db, 'places', placeId)
    await updateDoc(placeRef, {
      visitCount: increment(1)
    })
  } catch (error) {
    console.error('[Analytics] Error tracking visit:', error)
  }
}

/**
 * Track user's current location for foot traffic
 * Call this periodically (e.g., every 30 seconds) when user is at a place
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} userId - User ID
 * @param {string} placeId - Nearest place ID (if known)
 */
export async function trackLocation(lat, lng, userId = 'anonymous', placeId = null) {
  try {
    await addDoc(collection(db, 'analytics_foot_traffic'), {
      lat,
      lng,
      placeId,
      userId,
      timestamp: serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    })
  } catch (error) {
    console.error('[Analytics] Error tracking location:', error)
  }
}

/**
 * Get popular places by different metrics
 * @param {string} metric - 'searches' | 'saves' | 'visits'
 * @param {number} limit - Number of results to return
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 */
export async function getPopularPlaces(metric = 'visits', limit = 10, startDate = null, endDate = null) {
  try {
    const collectionName = `analytics_${metric}`
    const q = query(collection(db, collectionName))
    const snapshot = await getDocs(q)
    
    // Count by placeId
    const placeCounts = {}
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const placeId = data.placeId
      
      // Apply date filters if provided
      if (startDate && data.date < startDate) return
      if (endDate && data.date > endDate) return
      
      placeCounts[placeId] = (placeCounts[placeId] || 0) + 1
    })
    
    // Sort by count
    const sorted = Object.entries(placeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
    
    return sorted.map(([placeId, count]) => ({ placeId, count }))
  } catch (error) {
    console.error('[Analytics] Error getting popular places:', error)
    return []
  }
}

/**
 * Get foot traffic for a specific place
 * @param {string} placeId - Place ID
 * @param {string} date - Date (YYYY-MM-DD)
 */
export async function getPlaceFootTraffic(placeId, date = null) {
  try {
    const q = query(
      collection(db, 'analytics_foot_traffic'),
      where('placeId', '==', placeId)
    )
    
    const snapshot = await getDocs(q)
    const traffic = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      
      // Apply date filter if provided
      if (date && data.date !== date) return
      
      traffic.push({
        timestamp: data.timestamp?.toDate(),
        hour: data.hour,
        dayOfWeek: data.dayOfWeek
      })
    })
    
    return traffic
  } catch (error) {
    console.error('[Analytics] Error getting foot traffic:', error)
    return []
  }
}

/**
 * Get popular times by day and hour for a place
 * @param {string} placeId - Place ID
 */
export async function getPopularTimes(placeId) {
  try {
    const traffic = await getPlaceFootTraffic(placeId)
    
    // Group by day and hour
    const popularTimes = {}
    
    for (let day = 0; day < 7; day++) {
      popularTimes[day] = {}
      for (let hour = 0; hour < 24; hour++) {
        popularTimes[day][hour] = 0
      }
    }
    
    traffic.forEach(point => {
      if (popularTimes[point.dayOfWeek] && popularTimes[point.dayOfWeek][point.hour] !== undefined) {
        popularTimes[point.dayOfWeek][point.hour]++
      }
    })
    
    return popularTimes
  } catch (error) {
    console.error('[Analytics] Error getting popular times:', error)
    return {}
  }
}

/**
 * Get real-time foot traffic (last 30 minutes)
 * @param {string} placeId - Optional: filter by place
 */
export async function getRealTimeTraffic(placeId = null) {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    
    const q = query(collection(db, 'analytics_foot_traffic'))
    const snapshot = await getDocs(q)
    
    const recentTraffic = []
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const timestamp = data.timestamp?.toDate()
      
      if (!timestamp || timestamp < thirtyMinutesAgo) return
      if (placeId && data.placeId !== placeId) return
      
      recentTraffic.push({
        placeId: data.placeId,
        lat: data.lat,
        lng: data.lng,
        timestamp,
        userId: data.userId
      })
    })
    
    return recentTraffic
  } catch (error) {
    console.error('[Analytics] Error getting real-time traffic:', error)
    return []
  }
}

/**
 * Get analytics summary for dashboard
 */
export async function getAnalyticsSummary() {
  try {
    const [searches, saves, visits, footTraffic] = await Promise.all([
      getDocs(collection(db, 'analytics_searches')),
      getDocs(collection(db, 'analytics_saves')),
      getDocs(collection(db, 'analytics_visits')),
      getDocs(collection(db, 'analytics_foot_traffic'))
    ])
    
    const today = new Date().toISOString().split('T')[0]
    
    return {
      totalSearches: searches.size,
      totalSaves: saves.size,
      totalVisits: visits.size,
      totalFootTraffic: footTraffic.size,
      todaySearches: searches.docs.filter(d => d.data().date === today).length,
      todaySaves: saves.docs.filter(d => d.data().date === today).length,
      todayVisits: visits.docs.filter(d => d.data().date === today).length
    }
  } catch (error) {
    console.error('[Analytics] Error getting summary:', error)
    return {
      totalSearches: 0,
      totalSaves: 0,
      totalVisits: 0,
      totalFootTraffic: 0,
      todaySearches: 0,
      todaySaves: 0,
      todayVisits: 0
    }
  }
}

export default {
  trackSearch,
  trackSave,
  trackVisit,
  trackLocation,
  getPopularPlaces,
  getPlaceFootTraffic,
  getPopularTimes,
  getRealTimeTraffic,
  getAnalyticsSummary
}
