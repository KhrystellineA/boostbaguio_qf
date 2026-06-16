import { describe, it, expect, vi } from 'vitest'
import { fuzzyMatch, buildOSRMUrl } from './useRouteGeneration'

// Mock the Firebase imports
vi.mock('src/boot/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
}))

vi.mock('./useFirebase', () => ({
  useFirestore: () => ({ db: {} }),
}))

describe('useRouteGeneration', () => {
  describe('fuzzyMatch', () => {
    const mockPlaces = [
      { id: '1', name: 'Burnham Park', latitude: 16.4122, longitude: 120.5948 },
      { id: '2', name: 'SM City Baguio', latitude: 16.4101, longitude: 120.5991 },
      { id: '3', name: 'Botanical Garden', latitude: 16.4146, longitude: 120.6133 },
      { id: '4', name: 'Wright Park', latitude: 16.4184, longitude: 120.6179 },
      { id: '5', name: 'The Mansion', latitude: 16.4172, longitude: 120.62 },
      { id: '6', name: 'Baguio City Market', latitude: 16.4158, longitude: 120.5959 },
    ]

    it('returns null if targetName is empty', () => {
      expect(fuzzyMatch('', mockPlaces)).toBeNull()
      expect(fuzzyMatch(null, mockPlaces)).toBeNull()
      expect(fuzzyMatch(undefined, mockPlaces)).toBeNull()
    })

    it('returns null if places array is empty or invalid', () => {
      expect(fuzzyMatch('Burnham Park', [])).toBeNull()
      expect(fuzzyMatch('Burnham Park', null)).toBeNull()
    })

    it('finds an exact match (case insensitive)', () => {
      const match = fuzzyMatch('BURNHAM PARK', mockPlaces)
      expect(match).not.toBeNull()
      expect(match.name).toBe('Burnham Park')
    })

    it('finds a partial match (target contains place name)', () => {
      const match = fuzzyMatch('SM Baguio', mockPlaces)
      expect(match).not.toBeNull()
      expect(match.name).toBe('SM City Baguio')
    })

    it('finds a partial match (place name contains target)', () => {
      const match = fuzzyMatch('Botanical', mockPlaces)
      expect(match).not.toBeNull()
      expect(match.name).toBe('Botanical Garden')
    })

    it('finds a match using normalized strings (ignoring punctuation)', () => {
      const match = fuzzyMatch('Wright-Park!', mockPlaces)
      expect(match).not.toBeNull()
      expect(match.name).toBe('Wright Park')
    })

    it('finds a match using Levenshtein distance similarity', () => {
      const match = fuzzyMatch('The Mansyon', mockPlaces)
      expect(match).not.toBeNull()
      expect(match.name).toBe('The Mansion')
    })

    it('returns null if no match is above similarity threshold', () => {
      const match = fuzzyMatch('Random Unknown Place', mockPlaces)
      expect(match).toBeNull()
    })
  })

  describe('buildOSRMUrl', () => {
    it('throws error if waypoints are empty', () => {
      expect(() => buildOSRMUrl([])).toThrow('No waypoints provided for route generation')
      expect(() => buildOSRMUrl(null)).toThrow('No waypoints provided for route generation')
    })

    it('builds a correct URL with coordinates in lng,lat format', () => {
      const waypoints = [
        { latitude: 16.4122, longitude: 120.5948 },
        { latitude: 16.4101, longitude: 120.5991 },
      ]

      const url = buildOSRMUrl(waypoints)

      expect(url).toContain('120.5948,16.4122')
      expect(url).toContain('120.5991,16.4101')
      expect(url).toContain('120.5948,16.4122;120.5991,16.4101')
      expect(url).toContain('overview=full')
      expect(url).toContain('geometries=geojson')
    })
  })
})
