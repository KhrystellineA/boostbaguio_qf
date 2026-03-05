# 🗺️ PAGNAAM Route Map Visualization

This document explains the route map visualization feature added to the PAGNAAM (Jeepney Routes) page.

## Overview

The PAGNAAM page now includes an interactive map visualization that displays:
- **Route Path**: A polyline showing the actual route taken by each jeepney
- **Terminal Markers**: Markers for both the starting and ending terminals
- **Interactive Popups**: Click on markers or the route line for more information

## Features

### 1. Route Polyline Visualization

When a user selects a jeepney route card, the map displays:

```javascript
// Route path as a dashed green polyline
const routePath = L.polyline(routeCoordinates, {
  color: '#2E5D3E',    // Primary green color
  weight: 5,           // Line thickness
  opacity: 0.8,        // Slight transparency
  dashArray: '10, 10', // Dashed line pattern
  lineCap: 'round'     // Rounded line ends
})
```

### 2. Terminal Markers

Two markers are displayed:
- **Starting Terminal**: Green marker at the route origin
- **Destination Terminal**: Green marker at the route endpoint

Each marker shows a popup with the terminal name when clicked.

### 3. Smart Map Bounds

The map automatically adjusts to show:
- The entire route path if coordinates are available
- Both terminals if only endpoint coordinates exist

## Data Structure

### Required Fields

To enable route visualization, jeepney documents in Firestore should include:

```javascript
{
  // Route path coordinates (array of objects with lat/lng properties)
  routeCoordinates: [
    { lat: 16.4109, lng: 120.5964 },  // Starting point
    { lat: 16.4125, lng: 120.5975 },  // Waypoint 1
    { lat: 16.4145, lng: 120.5985 },  // Waypoint 2
    { lat: 16.4205, lng: 120.6015 },  // End point
  ],
  
  // Terminal coordinates (for markers)
  terminalCoordinates: { lat: 16.4109, lng: 120.5964 },     // Starting terminal
  destinationCoordinates: { lat: 16.4205, lng: 120.6015 },  // Ending terminal
  
  // Alternative coordinate fields (supported)
  originCoordinates: { lat: 16.4109, lng: 120.5964 },       // Same as terminalCoordinates
}
```

**Note:** Coordinates use objects with `lat` and `lng` properties (not nested arrays) because Firestore doesn't support nested arrays.

### Fallback Behavior

If `routeCoordinates` is not provided:
- The map will display markers for both terminals
- The map bounds will be calculated to show both endpoints
- No route polyline will be drawn

## How to Add Route Coordinates

### Option 1: Using the Seed Script

Run the provided seed script to add sample route coordinates:

```bash
node seed-jeepney-routes.js
```

This will:
- Check for existing jeepney data
- Offer to update existing routes or add new sample routes
- Add realistic Baguio City route coordinates

### Option 2: Manual Entry via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to Firestore Database
3. Select the `jeepneys` collection
4. Edit a jeepney document
5. Add the `routeCoordinates` array field with [lat, lng] pairs

### Option 3: Using Admin Dashboard

If you have an admin dashboard with route editing capabilities:
1. Navigate to Jeepney Management
2. Edit a route
3. Use the map picker to add route points
4. Save the route

## Coordinate Collection

### Using Google Maps

1. Right-click on a location
2. Copy the coordinates (latitude, longitude)
3. Format as `{ lat: 16.4109, lng: 120.5964 }` for the object

### Using Leaflet Map

```javascript
// Click event to get coordinates
map.on('click', function(e) {
  console.log(`{ lat: ${e.latlng.lat.toFixed(4)}, lng: ${e.latlng.lng.toFixed(4)} }`)
})
```

### Best Practices

- **Accuracy**: Use at least 4-6 coordinate points for accurate route representation
- **Road Following**: Place points along the actual road path
- **Key Points**: Include coordinates for:
  - Starting terminal
  - Major turns/intersections
  - Landmarks along the route
  - Ending terminal

## Example Routes

### Session Road - Loakan Route

```javascript
routeCoordinates: [
  { lat: 16.4109, lng: 120.5964 },  // Session Road (starting point)
  { lat: 16.4125, lng: 120.5975 },  // Session Road - Upper
  { lat: 16.4145, lng: 120.5985 },  // Leonard Wood Road
  { lat: 16.4165, lng: 120.5995 },  // Loakan Road
  { lat: 16.4185, lng: 120.6005 },  // Loakan - Near Airport
  { lat: 16.4205, lng: 120.6015 },  // Loakan Terminal
]
```

### Burnham - SM Baguio Route

```javascript
routeCoordinates: [
  { lat: 16.4075, lng: 120.5935 },  // SM Baguio
  { lat: 16.4085, lng: 120.5945 },  // SM Access Road
  { lat: 16.4095, lng: 120.5955 },  // Harrison Road
  { lat: 16.4105, lng: 120.5965 },  // Burnham Park - North
  { lat: 16.4115, lng: 120.5975 },  // Burnham Lake
  { lat: 16.4125, lng: 120.5985 },  // Burnham Park - South
]
```

## Testing the Feature

### Development Mode

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the PAGNAAM page:
   ```
   http://localhost:9000/pagnaam
   ```

3. Click on any jeepney route card
4. Verify the map displays:
   - ✅ Route polyline (dashed green line)
   - ✅ Starting terminal marker
   - ✅ Destination terminal marker
   - ✅ Proper map bounds

### Troubleshooting

**Issue**: Map doesn't show route polyline

**Solutions**:
1. Check if `routeCoordinates` field exists in the document
2. Verify coordinates are in `{ lat: number, lng: number }` format
3. Ensure coordinates are valid (within Philippines bounds)
4. Check browser console for errors
5. Verify Firestore document was saved correctly (nested arrays not supported)

**Issue**: Map shows wrong location

**Solutions**:
1. Verify latitude and longitude values are not swapped
2. Check for typos in coordinate values
3. Ensure coordinates use decimal degrees (not DMS)

## Visual Customization

### Changing Route Line Style

Edit the polyline options in `PagnaamPage.vue`:

```javascript
const routePath = L.polyline(routeCoordinates, {
  color: '#2E5D3E',    // Change route color
  weight: 5,           // Change line thickness
  opacity: 0.8,        // Change transparency
  dashArray: '10, 10', // Change dash pattern (use null for solid line)
  lineCap: 'round'     // Line end style
})
```

### Style Options

- **Solid Line**: `dashArray: null`
- **Dotted Line**: `dashArray: '5, 10'`
- **Thicker Line**: `weight: 8`
- **Different Color**: `color: '#FF0000'` (red)

## Performance Considerations

- **Coordinate Limit**: Keep route coordinates under 100 points for optimal performance
- **Map Rendering**: Leaflet efficiently renders polylines, but complex routes may impact mobile performance
- **Data Transfer**: Each coordinate pair adds to document size (~20 bytes per pair)

## Future Enhancements

Potential improvements:
- [ ] Real-time traffic overlay
- [ ] Multiple route options
- [ ] Turn-by-turn directions
- [ ] Elevation profile
- [ ] Route distance calculation
- [ ] Estimated travel time
- [ ] Waypoint tooltips with street names

## Related Files

- `src/pages/PagnaamPage.vue` - Main page component with map visualization
- `seed-jeepney-routes.js` - Script to seed route coordinates
- `DATABASE_SETUP.md` - Database schema documentation

## Support

For issues or questions about the route visualization feature, please refer to the Leaflet.js documentation: https://leafletjs.com/reference.html#polyline

---

**Last Updated**: March 5, 2026
**Version**: 1.0.0
