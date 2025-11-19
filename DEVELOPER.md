# Developer Guide — FOSS Project Core (Campus Navigator)

This document is a short orientation for developers who want to extend or maintain this project.

## Project overview

- Tech: React (Vite), Leaflet for mapping and Leaflet Routing Machine for routing.
- Purpose: Render a campus map with building markers, allow searching for buildings, and show walking routes and live navigation from the user's current location.
- Key data: `src/data/buildings.json` – static building dataset used across the app.

## Important files and responsibilities

- `src/App.jsx` — Application root. Holds app-level state (selected markers, route, user location, tracking state, UI flags). Provides handlers for geolocation and route calculations and renders main UI parts.

- `src/components/MapComponent.jsx` — Map presentation layer. Handles map initialization, tile layers, rendering building markers and popups, drawing routes via Leaflet Routing Machine, and showing the user's location and heading arrow. Keep map-side effects and DOM interactions here.

- `src/components/SearchComponent.jsx` — Reusable search box. Parent provides the building list and a `searchBuildings` function.

- `src/components/RouteComponent.jsx` — Small presentational panel that shows route summary and controls (start/stop/clear).

- `src/components/LocationDebugPanel.jsx` — Small panel that (when present) displays raw GPS values and debugging info.

- `src/utils/pathfinding.js` — Optional pathfinding utilities and a Dijkstra implementation for campus-only shortest paths (can be used if you want offline routing without an external routing service).

- `src/data/buildings.json` — Canonical list of buildings. Each building object looks like:

```json
{
  "id": "building-1",
  "name": "Example Building",
  "coordinates": [6.889149, 3.72005],
  "department": "Department",
  "description": "Short description",
  "hours": "9am - 5pm"
}
```

## Running the project locally

1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

3. Open the URL printed by Vite (usually `http://localhost:5173`).

## Developer tips & extension points

- Routing
  - The app includes Leaflet Routing Machine (LRM) to query a routing backend (OSRM by default via the routing machine). LRM is loaded dynamically inside `MapComponent.jsx`.
  - If you need offline routing, use `src/utils/pathfinding.js` (Dijkstra) against the `buildings.json` graph or build a pedestrian graph and implement A*/Dijkstra over it.

- Offline caching
  - The app reads `buildings.json`. For larger datasets, move from `localStorage` to IndexedDB (e.g. using `idb` library) for reliability and quota.

- Geolocation & permissions
  - For dev testing, Chrome DevTools → Sensors → set custom geolocation to simulate coordinates and accuracy.
  - Use `navigator.permissions.query({ name: 'geolocation' })` to inspect permissions and gently prompt the user before auto-starting tracking.

- Map performance
  - Avoid storing map layers or Leaflet objects in React state; use refs instead (`useRef`) to keep DOM/manipulation outside React render cycle.
  - Batch marker creation where possible and avoid recreating all markers every frame. Consider clustering if the dataset grows.

- Styling
  - Styles live in `src/styles/*.css` under semantic filenames (map.css, route.css, search.css). Keep presentational tweaks there.

## Common pitfalls

- Calling `setState` synchronously inside `useEffect` without proper dependencies can trigger extra renders — prefer event-driven updates (e.g. call setState in callbacks).
- Avoid empty `catch {}` blocks — log or surface errors so future devs can debug.
- When adding third-party scripts (LRM), ensure you cleanup if necessary and guard `window.L` checks.

## How to add a new feature (example: waypoint snapping)

1. Add a small helper in `src/utils/` that takes a raw GPS coordinate and returns the nearest building or path node.
2. Call the helper before creating route waypoints so user location snaps to the nearest walkable node.
3. Add unit tests for the helper (you can add a simple Jest config or run node scripts for quick checks).

## Contact & contribution

- Add a short note here explaining the preferred workflow and branches if working in a team.

---
This file is intended to give contributors enough context to get the project running and to understand where key behavior lives. If you'd like, I can also scaffold a `CONTRIBUTING.md` with PR guidelines and a `DEMO.md` showing manual test cases.
