import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGeocoding } from './useGeocoding'

// Mock fetch globally
global.fetch = vi.fn()

describe('useGeocoding', () => {
  let geocoding

  beforeEach(() => {
    vi.clearAllMocks()
    geocoding = useGeocoding()
  })

  describe('searchLocations', () => {
    it('returns empty array for empty query', async () => {
      const results = await geocoding.searchLocations('')
      expect(results).toEqual([])
    })

    it('returns formatted results on successful API call', async () => {
      const mockNominatimResponse = [
        {
          place_id: 1,
          lat: '16.4122',
          lon: '120.5948',
          display_name: 'Burnham Park, Baguio, Cordillera Administrative Region, 2600, Philippines',
        },
      ]

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockNominatimResponse),
      })

      const results = await geocoding.searchLocations('Burnham Park')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('Burnham+Park'),
        expect.anything()
      )

      expect(results.length).toBe(1)
      expect(results[0].label).toBe('Burnham Park')
      expect(results[0].lat).toBe(16.4122)
      expect(results[0].lng).toBe(120.5948)
    })

    it('handles API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      // The composable currently catches the error and returns an empty array
      const results = await geocoding.searchLocations('Error Place')
      expect(results).toEqual([])
    })
  })

  describe('reverseGeocode', () => {
    it('returns label from coordinates', async () => {
      const mockResponse = {
        display_name: 'Session Road, Baguio, Cordillera Administrative Region, 2600, Philippines',
        address: {
          road: 'Session Road',
          city: 'Baguio',
        },
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await geocoding.reverseGeocode(16.4122, 120.5948)

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('lat=16.4122&lon=120.5948'))
      expect(result.label).toBe('Session Road') // It prefers road over full display_name
    })

    it('returns "Unknown location" when API returns no address', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: 'Unable to geocode' }),
      })

      const result = await geocoding.reverseGeocode(0, 0)
      expect(result.label).toBe('Unknown location')
    })
  })
})
