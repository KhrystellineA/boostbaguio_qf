# Route Generation & Visualization - Integration Guide

## Overview

This implementation adds complete route generation and visualization capabilities to the Boost-Baguio project using:

- **OSRM (Open Source Routing Machine)** - Free, open-source routing engine
- **Leaflet** - Interactive maps
- **OpenStreetMap** - Map tiles

## Files Created/Modified

### New Files

1. **`src/composables/useRouteGeneration.js`**
   - Core route generation logic
   - Fuzzy matching for place names
   - OSRM API integration
   - Firestore places collection fetching

2. **`src/components/RouteMap.vue`**
   - Reusable Leaflet map component
   - Accepts routePoints as prop
   - Shows route polyline, waypoints, distance, duration
   - Built-in controls (zoom, fit, waypoints toggle)

### Modified Files

1. **`src/components/admin/RouteFormDialog.vue`**
   - Complete rewrite with route generation flow
   - Generate, preview, confirm, regenerate workflow
   - Integrated RouteMap component for preview
   - Real-time route validation

2. **`src/components/admin/JeepneyManagement.vue`**
   - Added route preview column in table
   - Route preview dialog with full map view
   - RouteMap component integration

3. **`src/pages/PagnaamPage.vue`**
   - Replaced manual Leaflet implementation with RouteMap component
   - Simplified map rendering logic

## How It Works

### Route Generation Flow

```
1. Admin fills in jeepney form:
   - Terminal Location (with lat/lng coordinates)
   - End Point (name only)
   - Tourist Spots Serviced (array of names)

2. Click "Generate Route" button:
   a. Fetch all places from Firestore
   b. Fuzzy-match end point name against places
   c. Fuzzy-match each tourist spot against places
   d. Build waypoints: Terminal → Tourist Spots → End Point
   e. Call OSRM API with waypoints
   f. Receive road-following route geometry

3. Preview route on map:
   - Shows complete route polyline
   - Displays all waypoints with markers
   - Shows distance and duration

4. Admin reviews and clicks "Confirm & Save":
   - Route coordinates saved to form
   - Ready to be saved to Firestore

5. Click "Create/Update":
   - Saves routePoints to jeepneys collection
```

### Coordinate System

**IMPORTANT**: Different systems use different coordinate orders:

- **OSRM/GeoJSON**: `[longitude, latitude]` (lng, lat)
- **Leaflet**: `[latitude, longitude]` (lat, lng)
- **Firestore**: Store as `[longitude, latitude]` (OSRM format)

The RouteMap component automatically converts from OSRM format to Leaflet format.

### Fuzzy Matching

The fuzzy matching algorithm:

1. First tries exact match (case-insensitive)
2. Then tries partial match (name contains target or vice versa)
3. Finally tries normalized match (removes special characters)

Example matches:

- "BenCab Museum" → "Bencab Museum" ✓
- "Burnham" → "Burnham Park" ✓
- "SM Baguio" → "SM City Baguio" ✓

## Firestore Data Structure

### jeepneys Collection

```javascript
{
  uniqueId: "JEEP-1772655271185-VN7LR485Y",
  jeepName: "Tuba A",
  terminalLocation: "Shagem St",
  terminalLat: 16.4136,
  terminalLng: 120.5934,
  endPoint: "Asin Rd",
  fareRegular: 13,
  farePWD: 11,
  fareSenior: 11,
  fareStudent: 11,
  operatingHours: { open: "6:00", close: "22:00" },
  isActive: true,
  imageUrl: "",
  imagePublicId: "",

  // NEW FIELDS FOR ROUTE
  routePoints: [[120.5934, 16.4136], [120.5940, 16.4140], ...], // Array of [lng, lat]
  routeDistance: 5420,  // meters
  routeDuration: 1200,  // seconds

  touristSpotsServiced: ["Burnham Park", "Igorot Park", "BenCab Museum"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### places Collection (Required for route generation)

```javascript
{
  name: "Burnham Park",
  latitude: 16.4023,
  longitude: 120.5960,
  category: "tourist_spot"  // or "landmark", "terminal", etc.
}
```

## Usage Instructions

### For Admin Dashboard Users

1. **Navigate to Admin Dashboard → Jeepney Management**
2. **Click "Add Jeepney" or edit existing**
3. **Fill in required fields:**
   - Jeepney Name
   - Terminal Location
   - Terminal Latitude/Longitude (use "Use Current Location" button)
   - End Point
4. **Click "Generate Route"**
   - Wait for route to be generated (2-5 seconds)
   - Review the route on the map
   - Check waypoints and distance
5. **Click "Confirm & Save Route"** if satisfied
6. **Click "Create" or "Update"** to save to database

### For Developers

#### Using the RouteMap Component

```vue
<template>
  <RouteMap
    :route-points="routePoints"
    :waypoints="waypoints"
    :distance="distance"
    :duration="duration"
    height="400px"
    :show-controls="true"
    :show-waypoints-info="true"
    :show-stats="true"
  />
</template>

<script>
import RouteMap from 'src/components/RouteMap.vue'

export default {
  components: { RouteMap },
  setup() {
    const routePoints = [
      [120.5934, 16.4136],
      [120.594, 16.414],
    ]
    const waypoints = [
      { name: 'Terminal', latitude: 16.4136, longitude: 120.5934 },
      { name: 'End Point', latitude: 16.414, longitude: 120.594 },
    ]
    const distance = 5420 // meters
    const duration = 1200 // seconds

    return { routePoints, waypoints, distance, duration }
  },
}
</script>
```

#### Using the useRouteGeneration Composable

```javascript
import { useRouteGeneration } from 'src/composables/useRouteGeneration'

const { generateRoute, fuzzyMatch, fetchPlaces } = useRouteGeneration()

// Generate route
const result = await generateRoute({
  terminalLat: 16.4136,
  terminalLng: 120.5934,
  endPoint: 'Asin Rd',
  touristSpotsServiced: ['Burnham Park', 'Igorot Park'],
})

console.log(result.coordinates) // [[lng, lat], [lng, lat], ...]
console.log(result.distance) // meters
console.log(result.duration) // seconds
console.log(result.waypoints) // Array of matched waypoints
```

## OSRM API Details

### Public Demo Server

```
https://router.project-osrm.org/route/v1/driving/{coordinates}?overview=full&geometries=geojson
```

**Rate Limits:**

- Demo server has rate limits
- For production, consider self-hosting OSRM
- See: https://github.com/Project-OSRM/osrm-backend

### Request Format

```
/route/v1/driving/{longitude},{latitude};{longitude},{latitude};...
```

Example:

```
https://router.project-osrm.org/route/v1/driving/120.5934,16.4136;120.5960,16.4023;120.6012,16.4178?overview=full&geometries=geojson
```

### Response Format

```json
{
  "code": "Ok",
  "routes": [{
    "geometry": {
      "type": "LineString",
      "coordinates": [[120.5934, 16.4136], [120.5940, 16.4140], ...]
    },
    "distance": 5420,
    "duration": 1200
  }]
}
```

## Error Handling

### Common Errors

1. **"No places found in database"**
   - Solution: Add places to Firestore `places` collection
   - Include name, latitude, longitude, category

2. **"Could not find coordinates for end point"**
   - Solution: Add end point location to places collection
   - Or use fuzzy-matchable name

3. **"OSRM API error: 400"**
   - Check coordinate format (must be lng,lat not lat,lng)
   - Verify waypoints are valid coordinates

4. **"No routes found by OSRM"**
   - Waypoints might be too far apart
   - Check if waypoints are on land (not in ocean)
   - OSRM can't route across water without ferries

## Integration Checklist

### PagnaamPage.vue (Completed ✓)

- [x] Import RouteMap component
- [x] Replace manual map div with RouteMap
- [x] Add buildWaypoints function
- [x] Remove old Leaflet initialization code

### ApanamPage.vue (To Do)

- [ ] Import RouteMap component
- [ ] Add route visualization for navigation results
- [ ] Show selected jeepney route on map

### Required Firestore Setup

1. **Create `places` collection** with documents for:
   - All tourist spots
   - All terminals
   - All landmarks
   - All end points used by jeepneys

2. **Document structure:**

   ```javascript
   {
     name: "Place Name",
     latitude: 16.4023,
     longitude: 120.5960,
     category: "tourist_spot"  // or "terminal", "landmark", etc.
   }
   ```

3. **Update existing jeepneys:**
   - Run route generation for each jeepney
   - Or migrate existing route data if available

## Testing

### Test Scenarios

1. **Route Generation**
   - Create new jeepney with valid terminal and end point
   - Generate route
   - Verify route follows roads
   - Check distance and duration are reasonable

2. **Fuzzy Matching**
   - Test with partial names ("Burnham" → "Burnham Park")
   - Test with different capitalization ("bencab" → "BenCab Museum")
   - Test with extra words ("SM Baguio" → "SM City Baguio")

3. **Map Display**
   - Verify route displays correctly
   - Check waypoints show with markers
   - Test zoom and pan controls
   - Verify fit-to-route works

4. **Save/Load**
   - Save jeepney with route
   - Reload page
   - Verify route displays from saved data
   - Edit and regenerate route

## Production Considerations

### Performance

- **OSRM Caching**: Cache generated routes to avoid repeated API calls
- **Route Simplification**: Simplify route geometry for display if too many points
- **Lazy Loading**: Load map only when needed (dialog opens)

### Self-Hosting OSRM

For production with high traffic:

```bash
# Docker example
docker run -p 5000:5000 osrm/osrm-backend osrm-routes --port 5000
```

Update `buildOSRMUrl()` in `useRouteGeneration.js`:

```javascript
const OSRM_BASE_URL = 'http://your-server:5000/route/v1/driving'
```

### Rate Limiting

- Add debounce to route generation button
- Show loading state clearly
- Implement retry logic for failed requests

## Troubleshooting

### Route not displaying

1. Check browser console for errors
2. Verify routePoints format: `[[lng, lat], [lng, lat], ...]`
3. Check map container has height
4. Call `map.invalidateSize()` after dialog opens

### Fuzzy matching not working

1. Verify places collection has documents
2. Check place names match reasonably
3. Add missing places to Firestore

### Map not loading

1. Check Leaflet CSS is imported
2. Verify map container exists in DOM
3. Check for JavaScript errors in console

## Next Steps

1. **ApanamPage Integration**
   - Add route visualization to navigation results
   - Show route overlay when jeepney is selected

2. **Route Editing**
   - Allow manual adjustment of route points
   - Add drag-and-drop waypoint editing

3. **Multiple Routes**
   - Support multiple route options
   - Let admin choose best route

4. **Analytics**
   - Track route generation usage
   - Monitor OSRM API performance

## Support

For issues or questions:

- Check browser console for errors
- Review OSRM API documentation: https://project-osrm.org/
- Leaflet documentation: https://leafletjs.com/
