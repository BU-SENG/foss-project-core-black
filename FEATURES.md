# Campus Navigation Application

A modern, interactive React-based campus navigation system that helps students and visitors find buildings, search for locations, and generate optimal walking routes between campus destinations.

## Features

### ✨ Core Features

1. **Interactive Campus Map Display**
   - Real-time map rendering using LeafletJS
   - Zoom, pan, and drag capabilities
   - Custom color-coded markers for building locations
   - Click markers to view building information
   - Responsive design for mobile and desktop

2. **Smart Search & Autocomplete**
   - Search buildings by name, department, or keyword
   - Real-time autocomplete suggestions
   - Dropdown search results
   - Keyboard navigation support (Arrow keys, Enter, Escape)

3. **Route Generation (Pathfinding)**
   - Dijkstra's algorithm implementation for shortest path calculation
   - Select start and destination buildings
   - Visual route display on the map
   - Distance and walking time estimation
   - Step-by-step waypoint directions

4. **Building Information Popups**
   - Detailed building metadata
   - Department information
   - Operating hours
   - Quick selection from popup
   - Accessible popup design

5. **Geolocation Support**
   - Find nearest building to current location
   - One-click navigation to nearest campus building
   - Browser geolocation integration

6. **Responsive Design**
   - Mobile-first approach
   - Tablet and desktop optimization
   - Touch-friendly interface
   - Adaptive UI components

7. **Error Handling & Validation**
   - User-friendly error messages
   - Route calculation error handling
   - Invalid input handling
   - Location permission requests

8. **Accessibility**
   - ARIA labels and roles for screen readers
   - Keyboard navigation support
   - High contrast colors (WCAG AA compliant)
   - Focus indicators for interactive elements
   - Semantic HTML structure

## Project Structure

```
src/
├── components/
│   ├── MapComponent.jsx          # Leaflet map integration
│   ├── SearchComponent.jsx       # Search bar with autocomplete
│   ├── RouteComponent.jsx        # Route display and info panel
│   └── ErrorComponent.jsx        # Error message display
├── utils/
│   └── pathfinding.js           # Dijkstra's algorithm implementation
├── data/
│   └── buildings.json           # Campus buildings database
├── styles/
│   ├── map.css                  # Map component styles
│   ├── search.css               # Search component styles
│   ├── route.css                # Route component styles
│   └── error.css                # Error component styles
├── App.jsx                      # Main application component
├── App.css                      # Global application styles
├── main.jsx                     # React entry point
└── index.css                    # Global styles
```

## Getting Started

### Prerequisites

- Node.js v20.14.0+
- npm or yarn
- Modern web browser with geolocation support (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/BU-SENG/foss-project-core-black.git

# Navigate to project directory
cd foss-project-core-black

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How to Use

### Finding a Route

1. **Select Start Point:**
   - Click on a building marker on the map, or
   - Use the search bar to find a building, or
   - Click "My Location" to use geolocation

2. **Select Destination:**
   - Click on another building marker, or
   - Search for a destination building

3. **View Route:**
   - The shortest walking path is automatically calculated
   - Distance and estimated walking time are displayed
   - Step-by-step waypoints are shown in the route panel
   - The route is visualized on the map with a blue dashed line

4. **Clear Route:**
   - Click "Clear Route" button to start a new search

### Keyboard Navigation

- **Search Bar:**
  - `↑/↓` - Navigate results
  - `Enter` - Select result
  - `Escape` - Close dropdown
  - `Tab` - Move between elements

- **Map:**
  - `Click` on markers to select
  - `Zoom` - Scroll wheel or pinch (mobile)
  - `Pan` - Drag map

## Technical Stack

### Frontend
- **React 19.2.0** - UI framework
- **Vite 5.0.0** - Build tool and dev server
- **Leaflet 1.9.4** - Interactive map library
- **LeafletJS** - Map rendering and interaction
- **OpenStreetMap** - Map tiles

### Algorithms
- **Dijkstra's Algorithm** - Shortest path calculation
- **Haversine Formula** - Distance calculation between coordinates

### Styling
- **CSS3** - Modern CSS with variables
- **Responsive Design** - Mobile-first approach
- **CSS Grid & Flexbox** - Layout system

### Tools
- **ESLint** - Code quality
- **Vite** - Fast build and dev server
- **npm** - Package management

## Building Information

The campus includes 10 buildings with the following details:

- **Engineering Block** - Engineering department
- **Science Building** - Natural Sciences (Chemistry, Biology, Physics)
- **Library** - Main library with research facilities
- **Student Center** - Student hub with cafeteria
- **Administration Building** - Administrative offices
- **Arts Building** - Arts and Humanities
- **Sports Complex** - Gymnasium, pool, fitness center
- **Dormitory A** - Student housing
- **Health Center** - Medical and counseling services
- **Computer Science Center** - CS labs and research

Each building includes:
- GPS coordinates
- Department information
- Building description
- Operating hours
- Facility list

## API Reference

### PathfindingGraph Class

```javascript
import { PathfindingGraph } from './utils/pathfinding';

const pathfinding = new PathfindingGraph(buildings);

// Find shortest path between two buildings
const route = pathfinding.findShortestPath(startBuildingId, endBuildingId);
// Returns: { path: [...buildings], distance: meters, time: {...}, found: boolean }

// Search buildings
const results = pathfinding.searchBuildings('library');

// Get building by name
const building = pathfinding.getBuildingByName('Engineering');

// Calculate distance between coordinates
const distance = pathfinding.haversineDistance([lat1, lon1], [lat2, lon2]);
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- ✅ WCAG 2.1 AA compliant
- ✅ Screen reader support (ARIA labels)
- ✅ Keyboard navigation
- ✅ High contrast colors
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ Alt text for interactive elements

## Performance

- **Map Rendering:** Optimized with LeafletJS
- **Route Calculation:** Dijkstra's algorithm with O(n²) complexity
- **Search:** Linear search with memoized pathfinding graph
- **Bundle Size:** ~400KB (including Leaflet)

## Future Enhancements

- [ ] Multi-floor building maps
- [ ] Real-time navigation with turn-by-turn directions
- [ ] Indoor positioning system (IPS)
- [ ] Custom map tiles with campus branding
- [ ] Favorite buildings/history
- [ ] Alternative route suggestions
- [ ] Accessible building information (elevators, ramps, parking)
- [ ] Weather integration
- [ ] Campus events overlay
- [ ] Offline map support
- [ ] WebGL map renderer for better performance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.

## Credits

- Built with [React](https://react.dev)
- Maps powered by [LeafletJS](https://leafletjs.com) and [OpenStreetMap](https://www.openstreetmap.org)
- Build tool: [Vite](https://vitejs.dev)
- Developed by the SENG team at BU

---

**Last Updated:** November 2025
