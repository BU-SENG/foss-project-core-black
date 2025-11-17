# Architecture & Component Diagram

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Container                         │
│  (Manages state: selectedMarkers, route, error)             │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
            ┌───────────┐ ┌─────────┐ ┌──────────┐
            │  Header   │ │   Map   │ │  Route   │
            │(Search &  │ │Component│ │ Component│
            │ Location) │ │         │ │(Info     │
            └───────────┘ └─────────┘ └──────────┘
                    │         │
                    ▼         ▼
            ┌──────────────────────────┐
            │  Error Component         │
            │  (Error display)         │
            └──────────────────────────┘
```

## Data Flow

```
User Action
    │
    ├─→ Click Marker
    │    └─→ handleMarkerClick()
    │         └─→ Update selectedMarkers
    │              └─→ Map re-renders
    │
    ├─→ Search Input
    │    └─→ onChange()
    │         └─→ Filter buildings
    │              └─→ Show dropdown results
    │
    ├─→ Select Search Result
    │    └─→ handleSearchResultSelect()
    │         └─→ handleMarkerClick()
    │              └─→ Continue flow...
    │
    └─→ Click "My Location"
         └─→ handleUseLocation()
              └─→ Get geolocation
                   └─→ Find nearest building
                        └─→ handleMarkerClick()
```

## Route Calculation Flow

```
User selects Start Building
         │
         ▼
Set routePoints.start = buildingId
Set selectedMarkers = [startId]

         │
User selects Destination Building
         │
         ▼
Check: different from start? (validation)
         │
    Yes ▼ No
        │  ├─→ Show error
        │  └─→ Return
        │
        ▼
Set routePoints.destination = buildingId
Set selectedMarkers = [startId, destId]

         │
         ▼
calculateRoute(startId, destId)
    │
    ├─→ setIsLoadingRoute(true)
    │
    ├─→ pathfinding.findShortestPath(startId, destId)
    │    └─→ Dijkstra's Algorithm
    │         └─→ Returns: {path, distance, time, found}
    │
    ├─→ Validate result
    │    ├─ If not found: setError()
    │    └─ If found: setRoute(result)
    │
    └─→ setIsLoadingRoute(false)

         │
         ▼
Route Panel displays:
├─ Distance in km
├─ Estimated walking time
├─ Ordered list of waypoints
└─ Clear button
```

## Component Dependency Tree

```
App
├── SearchComponent
│   ├── Input element
│   ├── Dropdown results
│   └── "No results" message
├── MapComponent
│   ├── Leaflet map instance
│   ├── Building markers
│   │   └── Popups (Building info)
│   └── Route polyline
├── RouteComponent
│   ├── Route header
│   ├── Distance/Time stats
│   ├── Waypoints list
│   └── Clear button
└── ErrorComponent
    ├── Error icon
    ├── Error message
    └── Close button
```

## State Management

```
App State:
├── selectedMarkers: Array<number>
│   └─ IDs of highlighted buildings (start + destination)
├── route: Object | null
│   ├─ path: Array<Building>
│   ├─ distance: number (meters)
│   ├─ time: Object
│   │   ├─ seconds: number
│   │   ├─ minutes: number
│   │   └─ formatted: string
│   └─ found: boolean
├── isLoadingRoute: boolean
│   └─ Shows spinner while calculating
├── error: string | null
│   └─ Error message text
└── routePoints: Object
    ├─ start: number | null
    └─ destination: number | null
```

## Pathfinding Algorithm

```
Dijkstra's Shortest Path
┌──────────────────────────┐
│ Input: start, destination│
└──────┬───────────────────┘
       │
       ▼
Initialize distances: all = Infinity except start = 0
Initialize visited: all = false
Initialize previous: all = null
       │
       ▼
While unvisited nodes exist:
    │
    ├─→ Find unvisited node with min distance
    ├─→ Mark as visited
    ├─→ Update distances to neighbors:
    │    newDist = currentDist + edgeWeight
    │    if (newDist < neighborDist):
    │        neighborDist = newDist
    │        previous[neighbor] = current
    │
    └─→ Continue...
       │
       ▼
Reconstruct path by backtracking from destination to start
       │
       ▼
Return {path, distance, time, found}
```

## CSS Organization

```
Global Styles (index.css)
├── CSS Variables (--primary-color, etc.)
├── Reset styles
├── Typography
├── Links
├── Buttons
├── Form elements
└── Accessibility

App Styles (App.css)
├── Container layout
├── Header positioning
├── Search bar wrapper
├── Instructions panel
└── Responsive breakpoints

Component Styles
├── map.css
│   ├── Map container
│   ├── Custom markers
│   ├── Popups
│   └── Leaflet overrides
├── search.css
│   ├── Search input
│   ├── Dropdown results
│   └── No results message
├── route.css
│   ├── Route panel
│   ├── Loading spinner
│   ├── Route information
│   ├── Waypoints list
│   └── Clear button
└── error.css
    ├── Error container
    ├── Error content
    ├── Error icon
    └── Close button
```

## Event Flow Diagram

```
┌─────────────────────────────────────┐
│     Interactive Elements            │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┬──────────┬────────────┐
    ▼             ▼          ▼            ▼
┌────────┐  ┌──────────┐  ┌────────┐  ┌─────────┐
│ Search │  │  Markers │  │Buttons │  │ Keyboard│
│  Input │  │ (onClick)│  │(onClick)  │ (onKey) │
└────────┘  └──────────┘  └────────┘  └─────────┘
    │             │          │            │
    │             │          │            │
    ├─────────────┼──────────┼────────────┤
    │             │          │            │
    ▼             ▼          ▼            ▼
  Filter      Handle      Handle        Handle
  Buildings   Marker      Button        Keyboard
              Click       Click         Event
    │             │          │            │
    └─────────────┼──────────┼────────────┘
                  │          │
                  ▼          ▼
            Update App State
         (selectedMarkers,
          route, error, etc.)
                  │
                  ▼
          Re-render Components
         (Controlled by state)
                  │
                  ▼
            Update DOM & Map
         (User sees changes)
```

## Mobile vs Desktop Layout

```
DESKTOP (> 900px)
┌──────────────────────────────────────┐
│  Search Bar + Locate Button          │◄─ Fixed header
├──────────────────────────────────────┤
│                                      │
│              LEAFLET MAP             │
│          (Full viewport)             │
│                                      │
│                      ┌─────────────┐ │
│                      │Route Panel  │ │◄─ Bottom-right
│                      │(Floating)   │ │
│                      └─────────────┘ │
│  ┌──────────────┐                    │
│  │Instructions  │                    │◄─ Bottom-left
│  │   Panel      │                    │
│  └──────────────┘                    │
└──────────────────────────────────────┘

MOBILE (< 600px)
┌──────────────────────────────────┐
│ Search Bar                        │◄─ Flexible layout
│ + Locate Button                  │
├──────────────────────────────────┤
│                                  │
│         LEAFLET MAP              │
│      (Full viewport)             │
│                                  │
├──────────────────────────────────┤
│  Instructions Panel              │◄─ Collapsible
│  (Scrollable, 35vh max)          │
├──────────────────────────────────┤
│  Route Panel (if visible)        │◄─ Bottom overlay
│  (Slides up from bottom)         │
└──────────────────────────────────┘
```

## Performance Optimization

```
Initial Load
    │
    ├─→ React renders App component
    │
    ├─→ useMemo creates PathfindingGraph (runs once)
    │    └─→ Builds adjacency list with distances
    │         └─→ O(n²) operation (only on mount)
    │
    └─→ MapComponent initializes Leaflet
         └─→ Loads map tiles from OpenStreetMap (cached)

Route Calculation
    │
    ├─→ Dijkstra's Algorithm: O(n²)
    │    └─→ For 10 buildings: ~100 operations (instant)
    │
    ├─→ Re-render affected components only
    │    └─→ React virtual DOM diffing
    │
    └─→ Leaflet updates polyline (GPU accelerated)

Subsequent Actions
    │
    └─→ State updates trigger selective re-renders
         └─→ Only affected components re-render
```

## Accessibility Tree

```
Web Page (document)
└── Main Container
    ├── Header (landmark)
    │   └── Search Bar Container
    │       ├── Search Input (searchbox)
    │       │   └── aria-label: "Search for buildings"
    │       │   └── aria-expanded: true/false
    │       │   └── aria-controls: "search-results"
    │       │   └── aria-autocomplete: "list"
    │       └── Location Button (button)
    │           └── aria-label: "Use my current location"
    │
    ├── Map Region (region)
    │   ├── Map Container (application)
    │   │   └── aria-label: "Interactive campus map"
    │   └── Markers (button + aria-label)
    │       └── Each marker is keyboard accessible
    │
    ├── Route Panel (region)
    │   └── aria-label: "Route information"
    │
    ├── Error Container (alert)
    │   └── aria-live: "assertive"
    │   └── aria-atomic: "true"
    │
    └── Instructions Panel (region)
        └── aria-label: "Instructions"
```

---

This diagram provides a comprehensive visual representation of the application's architecture, data flow, and component interactions.
