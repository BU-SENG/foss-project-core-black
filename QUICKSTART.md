# Quick Start Guide

## Getting Started in 30 Seconds

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app opens at `http://localhost:5173/`

### 3. Try It Out

#### Option A: Click on the Map
- Click any building marker on the map to select your start point (it turns red)
- Click another building to set your destination
- The shortest route appears instantly with distance and time

#### Option B: Use Search
1. Type a building name in the search bar (e.g., "Library", "Engineering")
2. Click a result from the dropdown
3. Click another building to get the route

#### Option C: Use Your Location
- Click "📍 My Location" button
- The app finds the nearest building to you
- Click another building to generate a route

## Features Checklist

| Feature | Status | How to Try |
|---------|--------|-----------|
| Interactive Map | ✅ | Pan, zoom, click markers |
| Search with Autocomplete | ✅ | Type in search bar, arrow keys to navigate |
| Route Generation | ✅ | Click two buildings |
| Building Info Popups | ✅ | Click any marker |
| Walking Time Estimate | ✅ | Check route panel after selecting route |
| Responsive Design | ✅ | Resize browser to see mobile layout |
| Geolocation | ✅ | Click "My Location" button |
| Error Handling | ✅ | Try invalid actions |
| Accessibility | ✅ | Use keyboard only (Tab, Enter, Arrow keys) |
| Dark Popup Styles | ✅ | Click a marker to see styled popup |

## Available Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm lint
```

## Keyboard Shortcuts

### Search Bar
| Key | Action |
|-----|--------|
| ↑/↓ | Navigate search results |
| Enter | Select highlighted result |
| Escape | Close dropdown |
| Tab | Move to next element |

### Map
| Action | Method |
|--------|--------|
| Zoom In | Scroll up / Pinch out |
| Zoom Out | Scroll down / Pinch in |
| Pan | Drag map / Swipe on mobile |
| Click Marker | Select building |

## Component Overview

### MapComponent
- Displays the Leaflet map
- Renders building markers
- Shows route polylines
- Handles marker interactions

### SearchComponent
- Autocomplete search input
- Dropdown results
- Keyboard navigation
- Real-time filtering

### RouteComponent
- Displays route information
- Shows distance and time
- Lists waypoints
- Clear button

### ErrorComponent
- Error messages
- Auto-dismiss
- Accessible alerts

## Pathfinding Details

The app uses **Dijkstra's Algorithm** to find the shortest walking route between buildings.

**How it works:**
1. Each building is a node in a graph
2. Distances are calculated using the Haversine formula
3. Algorithm finds the path with minimum total distance
4. Assumes average walking speed of 1.4 m/s for time estimates

**Complexity:** O(n²) where n = number of buildings

## Campus Data

The app includes 10 buildings with mock locations around Boston:

- Engineering Block
- Science Building
- Library
- Student Center
- Administration Building
- Arts Building
- Sports Complex
- Dormitory A
- Health Center
- Computer Science Center

Each building has:
- GPS coordinates
- Department
- Description
- Operating hours
- Facility list

## Customization

### Add More Buildings
Edit `src/data/buildings.json`:
```json
{
  "id": 11,
  "name": "New Building",
  "department": "Department Name",
  "coordinates": [42.3380, -71.0905],
  "description": "Building description",
  "hours": "Operating hours",
  "rooms": ["Room 1", "Room 2"]
}
```

### Change Map Center
Edit `src/components/MapComponent.jsx`:
```javascript
const map = L.map('map').setView([42.3382, -71.0903], 16);
// Change coordinates above
```

### Customize Colors
Edit `src/styles/map.css`:
```css
.custom-marker {
  background-color: #YOUR_COLOR;
  border-color: #YOUR_BORDER_COLOR;
}
```

## Troubleshooting

### Map Not Loading?
- Check browser console for errors (F12)
- Ensure internet connection (needs OpenStreetMap)
- Clear browser cache

### Search Not Working?
- Ensure building names match exactly (case-insensitive)
- Check `buildings.json` for correct building names

### Route Not Calculating?
- Ensure you select two different buildings
- Check browser console for errors

### Geolocation Not Working?
- Allow location permission when prompted
- Use HTTPS (or localhost) for production
- Check privacy settings

## Performance Tips

- App loads quickly with Vite
- Map is optimized with LeafletJS
- Route calculations are instant (< 100ms)
- Works well on mobile with 4G+

## Browser Compatibility

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile browsers

❌ Internet Explorer (not supported)

## Next Steps

1. Explore the codebase: `src/components/`, `src/utils/`
2. Try modifying the campus data
3. Add more features (see FEATURES.md)
4. Deploy to production

## Need Help?

- Check the console (F12) for error messages
- Read the full documentation in FEATURES.md
- Review component comments in source files
- Check GitHub issues for common problems

---

Happy navigating! 🗺️
