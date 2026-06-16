import { fuzzyMatch } from './useRouteGeneration'

export function useDoubleRide() {
  /**
   * Find double ride (transfer) jeepney route options
   *
   * @param {Object} params - The parameters for finding double rides
   * @param {Array<number>} params.startCoords - [lat, lng] of starting location
   * @param {Array<number>} params.endCoords - [lat, lng] of destination
   * @param {Array<Object>} params.processedJeepneys - Array of jeepneys with pre-processed routeCoords
   * @param {Array<Object>} params.places - Array of places for fuzzy matching
   * @param {Function} params.calcDistanceGeo - Distance calculation function
   * @param {Function} params.isNearRoute - Function to check if a point is near a route polyline
   * @param {Function} params.findNearestDropoff - Function to find the nearest drop-off point
   * @param {string} params.toLocationLabel - Label of the destination location
   * @param {number} params.MAX_WALK_TO_BOARD - Max walking distance to board (meters)
   * @param {number} params.DEST_NEAR_ROUTE_THRESHOLD - Max distance from drop-off to destination (meters)
   * @param {number} params.TRANSFER_NEAR_ROUTE_THRESHOLD - Max distance for transfer walking (meters)
   * @returns {Array<Object>} - Array of double ride route options
   */
  const findDoubleRides = ({
    startCoords,
    endCoords,
    processedJeepneys,
    places,
    calcDistanceGeo,
    isNearRoute,
    findNearestDropoff,
    toLocationLabel,
    MAX_WALK_TO_BOARD,
    DEST_NEAR_ROUTE_THRESHOLD,
    TRANSFER_NEAR_ROUTE_THRESHOLD,
  }) => {
    const doubleRides = []

    const startJeepneys = processedJeepneys.filter(({ jeepney, routeCoords }) => {
      if (!routeCoords) return false
      if (!jeepney.terminalLat || !jeepney.terminalLng) return false
      return (
        calcDistanceGeo(startCoords, [jeepney.terminalLat, jeepney.terminalLng]) <=
        MAX_WALK_TO_BOARD
      )
    })

    const destJeepneys = processedJeepneys.filter(({ routeCoords }) => {
      if (!routeCoords) return false
      return isNearRoute(endCoords, routeCoords, DEST_NEAR_ROUTE_THRESHOLD).isNear
    })

    for (const first of startJeepneys) {
      for (const second of destJeepneys) {
        if (first.jeepney.id === second.jeepney.id) continue

        // Candidate transfer points: first jeepney's serviced spots + terminal
        const candidateSpots = []
        for (const name of first.jeepney.touristSpotsServiced || []) {
          const place = fuzzyMatch(name, places)
          if (place) {
            candidateSpots.push({
              name: place.name,
              coords: [place.latitude, place.longitude],
            })
          }
        }
        if (first.jeepney.terminalLat && first.jeepney.terminalLng) {
          candidateSpots.push({
            name: first.jeepney.terminalLocation || 'Terminal',
            coords: [first.jeepney.terminalLat, first.jeepney.terminalLng],
          })
        }

        let bestTransfer = null
        for (const spot of candidateSpots) {
          const near = isNearRoute(spot.coords, second.routeCoords, TRANSFER_NEAR_ROUTE_THRESHOLD)
          if (near.isNear) {
            if (!bestTransfer || near.minDistance < bestTransfer.walkDistance) {
              bestTransfer = { spot, walkDistance: near.minDistance }
            }
          }
        }
        if (!bestTransfer) continue

        const startDist = first.jeepney.terminalLat
          ? calcDistanceGeo(startCoords, [first.jeepney.terminalLat, first.jeepney.terminalLng])
          : 0

        const destNearSecond = isNearRoute(endCoords, second.routeCoords, DEST_NEAR_ROUTE_THRESHOLD)

        let secondDropoff = findNearestDropoff(
          second.jeepney,
          places,
          endCoords,
          destNearSecond.nearestPoint
        )

        if (secondDropoff && secondDropoff.name === 'nearest stop to your destination') {
          secondDropoff = { ...secondDropoff, name: toLocationLabel || 'my stop' }
        }

        const walkFromDropoff = secondDropoff ? calcDistanceGeo(secondDropoff.coords, endCoords) : 0

        // The user's spec: ride-2 is boarded at JEEPNEY-2's TERMINAL, not
        // mid-route. So we treat it as a fixed anchor and figure out the
        // ride-1 alight point as the closest point on jeepney-1's
        // polyline to that terminal. This guarantees the two ride
        // polylines are visually disjoint, separated by a walking leg.
        const firstBoardingPoint = first.jeepney.terminalLat
          ? [first.jeepney.terminalLat, first.jeepney.terminalLng]
          : null
        const secondBoardingPoint = second.jeepney.terminalLat
          ? [second.jeepney.terminalLat, second.jeepney.terminalLng]
          : bestTransfer.spot.coords
        const firstDropoffPoint =
          isNearRoute(secondBoardingPoint, first.routeCoords, Infinity).nearestPoint ||
          bestTransfer.spot.coords

        doubleRides.push({
          rideType: 'double',
          priority: 'double',
          firstJeepney: { ...first.jeepney, startDistance: startDist },
          secondJeepney: { ...second.jeepney },
          firstRouteGeometry: first.routeCoords,
          secondRouteGeometry: second.routeCoords,
          firstBoardingPoint,
          firstDropoffPoint,
          secondBoardingPoint,
          boardingPoint: firstBoardingPoint,
          transferPoint: bestTransfer.spot.coords,
          transferName: bestTransfer.spot.name,
          walkToTransfer: bestTransfer.walkDistance,
          dropoff: secondDropoff,
          walkFromDropoff,
          totalWalkDistance: startDist + bestTransfer.walkDistance + walkFromDropoff,
          confidence: 0.7,
          routeName: `${first.jeepney.jeepName} → ${second.jeepney.jeepName}`,
          terminalStart: first.jeepney.terminalLocation,
          terminalEnd: secondDropoff?.name || second.jeepney.endPoint,
          fare: (first.jeepney.fareRegular || 0) + (second.jeepney.fareRegular || 0),
          estimatedDuration: 40,
        })
      }
    }

    doubleRides.sort((a, b) => a.totalWalkDistance - b.totalWalkDistance)
    return doubleRides
  }

  return {
    findDoubleRides,
  }
}
