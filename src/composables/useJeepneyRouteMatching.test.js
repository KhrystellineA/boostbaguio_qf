import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useJeepneyRouteMatching } from './useJeepneyRouteMatching'

// Mock the Firebase imports
vi.mock('src/boot/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
  }
})

describe('useJeepneyRouteMatching', () => {
  let routeMatching

  beforeEach(() => {
    vi.clearAllMocks()
    routeMatching = useJeepneyRouteMatching()
  })

  describe('calculateDistance', () => {
    it('calculates distance between two identical points as 0', () => {
      const dist = routeMatching.calculateDistance([16.4122, 120.5948], [16.4122, 120.5948])
      expect(dist).toBe(0)
    })

    it('calculates correct approximate distance between two points', () => {
      // Distance between Burnham Park and SM City Baguio is ~500m
      const dist = routeMatching.calculateDistance([16.4122, 120.5948], [16.4101, 120.5991])
      expect(dist).toBeGreaterThan(400)
      expect(dist).toBeLessThan(600)
    })
  })

  describe('isNearRoute', () => {
    // Note: The function expects the point in [lat, lng] but the routeCoordinates in [lng, lat]
    const routeCoords = [
      [120.59, 16.41], // A
      [120.595, 16.415], // B
      [120.6, 16.42], // C
    ]

    it('returns false if route coordinates are empty', () => {
      const result = routeMatching.isNearRoute([16.4122, 120.5948], [])
      expect(result.isNear).toBe(false)
      expect(result.minDistance).toBe(Infinity)
      expect(result.nearestPoint).toBeNull()
    })

    it('identifies when a point is near the route (exact match on vertex)', () => {
      // Point exactly on B [lat, lng]
      const result = routeMatching.isNearRoute([16.415, 120.595], routeCoords, 100)
      expect(result.isNear).toBe(true)
      expect(result.minDistance).toBeLessThan(10)
    })

    it('identifies when a point is near the route (along the segment)', () => {
      // Point halfway between A and B [lat, lng]
      const result = routeMatching.isNearRoute([16.4125, 120.5925], routeCoords, 100)
      expect(result.isNear).toBe(true)
    })

    it('identifies when a point is NOT near the route', () => {
      // Point far away
      const result = routeMatching.isNearRoute([16.5, 120.7], routeCoords, 100)
      expect(result.isNear).toBe(false)
      expect(result.minDistance).toBeGreaterThan(100)
    })
  })

  describe('findSingleRide', () => {
    it('returns empty array if no jeepneys are loaded/found', async () => {
      routeMatching.jeepneys.value = [] // Mock empty db state

      // Mock loadJeepneys to return empty
      routeMatching.loadJeepneys = vi.fn().mockResolvedValue([])

      const start = [16.4122, 120.5948]
      const end = [16.4101, 120.5991]

      const result = await routeMatching.findSingleRide(start, end)
      expect(result).toEqual([])
    })
  })
})
// --rabbit --K
