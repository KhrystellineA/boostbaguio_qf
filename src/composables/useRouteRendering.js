import L from 'leaflet'

export function useRouteRendering() {
  /**
   * Helper to convert jeepney routeCoordinates from [lng, lat] pairs to [lat, lng]
   */
  const toLatLngList = (coords) =>
    Array.isArray(coords) ? coords.map(([lng, lat]) => [lat, lng]) : []

  /**
   * Helper to clip a [lat, lng] polyline to only show from a boarding point to a dropoff point
   */
  const clipPolyline = (polyline, fromCoord, toCoord, calcDistanceGeo) => {
    if (!polyline || polyline.length < 2 || !fromCoord || !toCoord) return polyline
    let fromIdx = 0,
      fromMin = Infinity
    let toIdx = polyline.length - 1,
      toMin = Infinity
    for (let i = 0; i < polyline.length; i++) {
      const dFrom = calcDistanceGeo(fromCoord, polyline[i])
      if (dFrom < fromMin) {
        fromMin = dFrom
        fromIdx = i
      }
      const dTo = calcDistanceGeo(toCoord, polyline[i])
      if (dTo < toMin) {
        toMin = dTo
        toIdx = i
      }
    }
    if (fromIdx > toIdx) [fromIdx, toIdx] = [toIdx, fromIdx]
    return polyline.slice(fromIdx, toIdx + 1)
  }

  /**
   * Render the route on the Leaflet map
   *
   * @param {Object} params - The parameters for rendering
   */
  const renderRouteMap = ({
    mapContainerId,
    routeMapRef,
    option,
    fromLocation,
    toLocation,
    walkingRoute,
    walkingRouteToDest,
    walkingRouteTransfer,
    calcDistanceGeo,
  }) => {
    if (!document.getElementById(mapContainerId)) return
    if (routeMapRef.value) {
      routeMapRef.value.remove()
    }

    routeMapRef.value = L.map(mapContainerId).setView([16.4122, 120.5948], 14)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(routeMapRef.value)

    const allBounds = []
    const startCoords = fromLocation?.coords
    const endCoords = toLocation?.coords

    const boardingCoords =
      option.boardingPoint ||
      (option.priority === 'single'
        ? [option.jeepney?.terminalLat, option.jeepney?.terminalLng]
        : [option.firstJeepney?.terminalLat, option.firstJeepney?.terminalLng])

    // 1. Walking start → boarding point.
    if (walkingRoute?.geometry?.length) {
      L.polyline(walkingRoute.geometry, {
        color: 'var(--q-positive)',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 12',
      }).addTo(routeMapRef.value)
      walkingRoute.geometry.forEach((c) => allBounds.push(c))
    } else if (startCoords && boardingCoords && boardingCoords[0]) {
      L.polyline([startCoords, boardingCoords], {
        color: 'var(--q-positive)',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 12',
      }).addTo(routeMapRef.value)
    }

    // 2. Jeepney ride 1
    const firstRideFullPolyline =
      option.priority === 'single'
        ? toLatLngList(option.routeGeometry)
        : toLatLngList(option.firstRouteGeometry)
    const firstClipEnd =
      option.priority === 'single'
        ? option.dropoff?.coords
        : option.firstDropoffPoint || option.transferPoint

    const firstRidePolyline = clipPolyline(
      firstRideFullPolyline,
      boardingCoords,
      firstClipEnd,
      calcDistanceGeo
    )
    if (firstRidePolyline.length >= 2) {
      L.polyline(firstRidePolyline, {
        color: 'var(--q-primary)',
        weight: 5,
        opacity: 0.9,
      }).addTo(routeMapRef.value)
      firstRidePolyline.forEach((c) => allBounds.push(c))
    } else if (
      option.priority === 'single' &&
      boardingCoords &&
      boardingCoords[0] &&
      endCoords &&
      endCoords.length === 2
    ) {
      L.polyline([boardingCoords, endCoords], {
        color: 'var(--q-primary)',
        weight: 5,
        opacity: 0.9,
      }).addTo(routeMapRef.value)
    }

    // Double-ride extras
    if (option.priority === 'double') {
      const firstDropoff = option.firstDropoffPoint || option.transferPoint
      const secondBoarding = option.secondBoardingPoint || option.transferPoint

      // 2b. Transfer walk
      if (firstDropoff && secondBoarding) {
        if (walkingRouteTransfer?.geometry?.length) {
          L.polyline(walkingRouteTransfer.geometry, {
            color: 'var(--q-warning)',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 12',
          }).addTo(routeMapRef.value)
          walkingRouteTransfer.geometry.forEach((c) => allBounds.push(c))
        } else {
          L.polyline([firstDropoff, secondBoarding], {
            color: 'var(--q-warning)',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 12',
          }).addTo(routeMapRef.value)
          allBounds.push(firstDropoff, secondBoarding)
        }
      }

      // 2c. Jeepney ride 2
      const secondRideFullPolyline = toLatLngList(option.secondRouteGeometry)
      const secondRidePolylineRaw = clipPolyline(
        secondRideFullPolyline,
        secondBoarding,
        option.dropoff?.coords,
        calcDistanceGeo
      )
      const SECOND_LINE_OFFSET = 0.00005
      const secondRidePolyline = secondRidePolylineRaw.map(([lat, lng]) => [
        lat + SECOND_LINE_OFFSET,
        lng + SECOND_LINE_OFFSET,
      ])
      if (secondRidePolyline.length >= 2) {
        L.polyline(secondRidePolyline, {
          color: 'var(--q-accent)',
          weight: 5,
          opacity: 0.9,
        }).addTo(routeMapRef.value)
        secondRidePolyline.forEach((c) => allBounds.push(c))
      }
    }

    // 3. Walking drop-off → destination
    if (walkingRouteToDest?.geometry?.length) {
      L.polyline(walkingRouteToDest.geometry, {
        color: '#E65100',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 12',
      }).addTo(routeMapRef.value)
      walkingRouteToDest.geometry.forEach((c) => allBounds.push(c))
    } else if (option.dropoff?.coords && endCoords && endCoords.length === 2) {
      L.polyline([option.dropoff.coords, endCoords], {
        color: '#E65100',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 12',
      }).addTo(routeMapRef.value)
    }

    // Markers
    if (startCoords) {
      L.marker(startCoords, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:var(--q-positive);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(routeMapRef.value)
        .bindPopup('<b>Start</b>')
      allBounds.push(startCoords)
    }

    const addMarker = (coord, color, popup) => {
      if (!coord || coord[0] == null || coord[1] == null) return
      L.marker(coord, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style='background-color:${color};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(routeMapRef.value)
        .bindPopup(popup)
      allBounds.push(coord)
    }

    const COLOR_BLUE = 'var(--q-primary)'
    const COLOR_WARNING = 'var(--q-warning)'
    const COLOR_ACCENT = 'var(--q-accent)'
    const COLOR_RED = 'var(--q-negative)'

    if (option.priority === 'double') {
      const terminal1Label = option.firstJeepney?.terminalLocation || 'Terminal 1'
      const terminal2Label = option.secondJeepney?.terminalLocation || 'Terminal 2'
      addMarker(
        boardingCoords,
        COLOR_BLUE,
        `<b>Board ${option.firstJeepney?.jeepName || 'jeepney 1'}</b><br>${terminal1Label}`
      )
      addMarker(
        option.firstDropoffPoint || option.transferPoint,
        COLOR_WARNING,
        `<b>Get off ${option.firstJeepney?.jeepName || 'jeepney 1'}</b><br>Walk to ${terminal2Label}`
      )
      addMarker(
        option.secondBoardingPoint || option.transferPoint,
        COLOR_ACCENT,
        `<b>Board ${option.secondJeepney?.jeepName || 'jeepney 2'}</b><br>${terminal2Label}`
      )
      if (option.dropoff?.coords) {
        addMarker(
          option.dropoff.coords,
          COLOR_RED,
          `<b>Get off ${option.secondJeepney?.jeepName || 'jeepney 2'}</b><br>${option.dropoff.name}`
        )
      }
    } else {
      if (boardingCoords && boardingCoords[0]) {
        const boardingLabel = option.boardingLabel || 'Board jeepney here'
        addMarker(boardingCoords, COLOR_BLUE, `<b>Board jeepney</b><br>${boardingLabel}`)
      }
      if (option.dropoff?.coords) {
        addMarker(option.dropoff.coords, COLOR_RED, `<b>Get off at ${option.dropoff.name}</b>`)
      }
    }

    if (endCoords && endCoords.length === 2) {
      L.marker(endCoords, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:var(--q-negative);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);'></div>",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .addTo(routeMapRef.value)
        .bindPopup('<b>Destination</b>')
      allBounds.push(endCoords)
    }

    if (allBounds.length >= 2) {
      routeMapRef.value.fitBounds(
        allBounds.filter((c) => c && c[0]),
        { padding: [40, 40] }
      )
    }
  }

  return {
    renderRouteMap,
  }
}
// --rabbit
