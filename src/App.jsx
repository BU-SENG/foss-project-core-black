import { useState, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import SearchComponent from './components/SearchComponent';
import RouteComponent from './components/RouteComponent';
import ErrorComponent from './components/ErrorComponent';
import LocationDebugPanel from './components/LocationDebugPanel';
import buildingsData from './data/buildings.json';
import './App.css';

/*
  App.jsx - Application root and state container

  Responsibilities:
  - Maintain app-level state: selected markers, route, user location, tracking
    status, UI flags, and error messages.
  - Provide handlers for geolocation permission, starting/stopping tracking,
    and initiating route calculations.
  - Render main UI: search, map, route panel and debug panel.

  Notes for contributors:
  - Keep heavy map side-effects inside `MapComponent.jsx` (presentation layer).
  - `buildingsData` is a static JSON bundle in `src/data/buildings.json`.
    Its shape is [{ id, name, coordinates: [lat, lng], department, description, hours }, ...]
*/

function App() {
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [route, setRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState(null);
  const [routePoints, setRoutePoints] = useState({
    start: null,
    destination: null
  });
  const [darkMode, setDarkMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [focusBuilding, setFocusBuilding] = useState(null);
  const [isOnJourney, setIsOnJourney] = useState(false);
  const [journeyDestination, setJourneyDestination] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Search function for buildings
  const searchBuildings = (query) => {
    const lowerQuery = query.toLowerCase();
    return buildingsData.buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(lowerQuery) ||
        b.department.toLowerCase().includes(lowerQuery) ||
        b.description.toLowerCase().includes(lowerQuery)
    );
  };

  // Get building by ID
  const getBuildingById = (id) => {
    // Simple lookup helper used by multiple route-related routines
    return buildingsData.buildings.find((b) => b.id === id);
  };

  // Handle marker click
  const handleMarkerClick = (buildingId) => {
    // If start point is not selected, select it
    if (!routePoints.start) {
      setRoutePoints((prev) => ({
        ...prev,
        start: buildingId
      }));
      setSelectedMarkers([buildingId]);
      setError(null);
      return;
    }

    // If destination is not selected, select it and calculate route
    if (!routePoints.destination) {
      if (buildingId === routePoints.start) {
        setError('Start and destination must be different buildings');
        return;
      }

      setRoutePoints((prev) => ({
        ...prev,
        destination: buildingId
      }));
      setSelectedMarkers([routePoints.start, buildingId]);
      // calculateRoute constructs a route object that MapComponent will
      // render. It uses building IDs and distance helpers below.
      calculateRoute(routePoints.start, buildingId);
    }
  };

  // Calculate route using Leaflet Routing Machine
  const calculateRoute = (startId, destinationId) => {
    setIsLoadingRoute(true);
    setError(null);

    try {
      const startBuilding = getBuildingById(startId);
      const destBuilding = getBuildingById(destinationId);

      if (!startBuilding || !destBuilding) {
        setError('One or both buildings not found');
        setIsLoadingRoute(false);
        return;
      }

      // Build a simple `route` object containing waypoints and helpers.
      // Note: MapComponent uses Leaflet Routing Machine (LRM) to draw the
      // route. Here we only prepare the data structure.
      const routePath = [startBuilding, destBuilding];

      setRoute({
        path: routePath,
        distance: calculateDistance(
          startBuilding.coordinates,
          destBuilding.coordinates
        ),
        time: estimateWalkingTime(
          calculateDistance(
            startBuilding.coordinates,
            destBuilding.coordinates
          )
        ),
        found: true
      });

      setIsLoadingRoute(false);
    } catch (err) {
      setError('An error occurred while calculating the route');
      setIsLoadingRoute(false);
    }
  };

  // Calculate Haversine distance
  const calculateDistance = (coord1, coord2) => {
    const R = 6371000; // Earth's radius in meters
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Estimate walking time
  const estimateWalkingTime = (distance) => {
    const walkingSpeed = 1.4; // meters per second
    const seconds = Math.round(distance / walkingSpeed);
    const minutes = Math.round(seconds / 60);

    return {
      seconds,
      minutes,
      formatted: `${minutes} min`
    };
  };

  // Handle search result selection
  const handleSearchResultSelect = (building) => {
    // If user is tracking, create route FROM user location TO selected building
    if (isTracking && userLocation) {
      // Use user location as start point
      setRoutePoints({
        start: null, // user location is special, not a building
        destination: building.id
      });
      setSelectedMarkers([building.id]);
      
      // Calculate route from user location to building
      try {
        const destBuilding = getBuildingById(building.id);
        const userCoords = [userLocation.lat, userLocation.lng];
        const distance = calculateDistance(userCoords, destBuilding.coordinates);
        const time = estimateWalkingTime(distance);

        setRoute({
          path: [{ coordinates: userCoords }, destBuilding],
          distance,
          time,
          found: true,
          fromUserLocation: true
        });
      } catch (err) {
        setError('Could not calculate route from your location');
      }
      
      // Also focus on the building in the map and clear any error state
      setFocusBuilding(building.id);
      setError(null);
    } else {
      // Not tracking: just zoom to building
      setFocusBuilding(building.id);
      setError(null);
    }
  };

  // Clear route
  const handleClearRoute = () => {
    setRoute(null);
    setRoutePoints({ start: null, destination: null });
    setSelectedMarkers([]);
    setError(null);
    setIsOnJourney(false);
    setJourneyDestination(null);
  };

  // Start journey (directions)
  const handleStartJourney = () => {
    if (!route || !route.fromUserLocation) {
      setError('Route must be from your current location to start journey');
      return;
    }
    setIsOnJourney(true);
    setJourneyDestination(routePoints.destination);
    const destName = getBuildingById(routePoints.destination)?.name || 'Destination';
    setError(`🚶 Journey started! Follow the arrow towards ${destName}`);
  };

  // Stop journey
  const handleStopJourney = () => {
    setIsOnJourney(false);
    setJourneyDestination(null);
    setError(null);
  };

  // Use geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Toggle tracking: if already tracking, stop it
    if (isTracking && watchId != null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
      setError(null);
      return;
    }

    // Show loading message
    setError('📍 Getting your location...');

    // Use getCurrentPosition to request location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        
        // Check if accuracy is reasonable (less than 100m is good GPS)
        let accuracyMsg = '';
        if (accuracy < 50) {
          accuracyMsg = '✅ Excellent GPS signal';
        } else if (accuracy < 100) {
          accuracyMsg = '✅ Good GPS signal';
        } else if (accuracy < 500) {
          accuracyMsg = '⚠️ Weak GPS signal (try going outside)';
        } else {
          accuracyMsg = '⚠️ Very weak signal - using approximate location';
        }
        
        setError(`✅ Location acquired!\n${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°\nAccuracy: ±${Math.round(accuracy)}m\n${accuracyMsg}`);

        // Now start watching for continuous updates with improved settings
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
            setUserLocation({ lat, lng, accuracy: acc });
            setIsTracking(true);
            
            // Show accuracy quality feedback
            let quality = '';
            if (acc < 50) {
              quality = '✅ Excellent';
            } else if (acc < 100) {
              quality = '✅ Good';
            } else if (acc < 500) {
              quality = '⚠️ Fair';
            } else {
              quality = '⚠️ Poor';
            }
            
            setError(`📍 Tracking enabled\n${lat.toFixed(6)}°, ${lng.toFixed(6)}°\nAccuracy: ±${Math.round(acc)}m (${quality})`);
          },
          (error) => {
            let errorMsg = '';
            if (error.code === 1) {
              errorMsg = '❌ Location permission denied.\nPlease check your browser settings:\n• Chrome/Edge: Settings → Privacy → Site Settings → Location\n• Firefox: Preferences → Privacy → Permissions → Location\n• Safari: Develop → Allow/Deny requests';
            } else if (error.code === 2) {
              errorMsg = '❌ Position unavailable.\nEnsure:\n• GPS is enabled on your device\n• You\'re in an area with GPS signal\n• Try going outside';
            } else if (error.code === 3) {
              errorMsg = '❌ Location request timed out.\n• Check your GPS signal\n• Try again (GPS may need 10-30s to acquire)';
            } else {
              errorMsg = '❌ ' + error.message;
            }
            setError(errorMsg);
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0, // Always get fresh location
            timeout: 30000  // Wait up to 30 seconds for GPS
          }
        );

        setWatchId(id);
        setIsTracking(true);
      },
      (error) => {
        // This error handler triggers when permission is denied or location unavailable
        let errorMsg = '';
        if (error.code === 1) {
          errorMsg = '❌ Permission Denied\n\nYour browser location permission is disabled.\n\n📍 To fix this:\n1. Look for a location icon or shield icon in your address bar\n2. Click it and select "Allow" for this site\n3. Or go to browser settings → Privacy → Location and enable it\n4. Then click "📍 Track Me" again';
        } else if (error.code === 2) {
          errorMsg = '❌ Position Unavailable\n\nYour device cannot determine location.\n\n📍 To fix this:\n• Enable GPS on your device\n• Go outside for better signal\n• Close other location-using apps\n• Try again';
        } else if (error.code === 3) {
          errorMsg = '❌ Location Timeout\n\nTook too long to get your location.\n\n📍 To fix this:\n• Ensure GPS is enabled\n• Move to open area (away from buildings)\n• Wait for GPS to initialize (10-30 seconds)\n• Try clicking "📍 Track Me" again';
        } else {
          errorMsg = '❌ ' + error.message;
        }
        setError(errorMsg);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  };

  const handleToggleTheme = () => setDarkMode((d) => !d);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="search-bar-wrapper">
          <SearchComponent
            buildings={buildingsData.buildings}
            onResultSelect={handleSearchResultSelect}
            searchBuildings={searchBuildings}
          />
          <button
            className="theme-toggle-btn"
            onClick={handleToggleTheme}
            aria-label="Toggle map theme"
            title="Toggle light / dark map"
          >
            {darkMode ? '🌙 Dark' : '🌤️ Light'}
          </button>

          <button
            className="locate-btn"
            onClick={handleUseLocation}
            aria-label={isTracking ? 'Stop tracking' : 'Use my current location'}
            title={isTracking ? 'Stop live tracking' : 'Start live tracking'}
          >
            {isTracking ? '⏸️ Stop' : '📍 Track Me'}
          </button>

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            title="Open menu"
          >
            ☰
          </button>
        </div>

        {/* Hamburger Menu */}
        {menuOpen && (
          <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
            <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
              <div className="menu-header">
                <h2>How to Use Navigator</h2>
                <button 
                  className="menu-close"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              
              <div className="menu-content">
                <ol>
                  <li><strong>Enable Location Tracking:</strong> Click the "📍 Track Me" button to access your GPS location. Your browser will ask for permission.</li>
                  <li><strong>Allow Location Permission:</strong> Click "Allow" when your browser asks "Allow this site to access your location?"</li>
                  <li><strong>View Your Location:</strong> Once tracking is enabled, a blue pin shows your current location on the map with an accuracy circle.</li>
                  <li><strong>Search for a Building:</strong> Use the search bar to find a building (e.g., "Amphitheatre", "Guest House"). Results appear as you type.</li>
                  <li><strong>Select Destination:</strong> Click on a search result to select that building as your destination (marked with a red pin).</li>
                  <li><strong>View Route:</strong> A route panel appears showing:
                    <ul>
                      <li>From: Your Location (blue pin)</li>
                      <li>To: Building Name (red pin)</li>
                      <li>Distance and estimated walking time</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="map-wrapper">
        <LocationDebugPanel userLocation={userLocation} isTracking={isTracking} />
        
        <MapComponent
          buildings={buildingsData.buildings}
          markers={selectedMarkers}
          onMarkerClick={handleMarkerClick}
          route={route}
          darkMode={darkMode}
          userLocation={userLocation}
          isTracking={isTracking}
          focusBuilding={focusBuilding}
          isOnJourney={isOnJourney}
          journeyDestination={journeyDestination}
        />

        <RouteComponent
          route={route}
          onClearRoute={handleClearRoute}
          isLoading={isLoadingRoute}
          isTracking={isTracking}
          userLocation={userLocation}
          onStartJourney={handleStartJourney}
          onStopJourney={handleStopJourney}
          isOnJourney={isOnJourney}
        />

        <ErrorComponent
          message={error}
          onDismiss={() => setError(null)}
        />
      </div>
    </div>
  );
}

export default App;
