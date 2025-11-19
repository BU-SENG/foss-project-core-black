import '../styles/route.css';

/*
  RouteComponent
  - Displays route information, distance and estimated walking time.
  - Accepts a `route` object (path, distance, time) and controls to
    clear the route or start/stop the guided journey.
  - This is a presentational component; it does not calculate routes.
*/
const RouteComponent = ({ route, onClearRoute, isLoading, isTracking, userLocation, onStartJourney, onStopJourney, isOnJourney }) => {
  if (!route && !isLoading) return null;

  // Get destination building name if tracking
  const getDestinationName = () => {
    if (route?.destination?.name) return route.destination.name;
    return 'Destination';
  };

  return (
    <div className="route-panel" role="region" aria-label="Route information">
      {isLoading && (
        <div className="route-loading">
          <div className="spinner"></div>
          <p>Calculating route...</p>
        </div>
      )}

      {route && !isLoading && (
        <div className="route-info">
          <div className="route-header">
            <h3>Directions</h3>
            <button
              className="close-btn"
              onClick={onClearRoute}
              aria-label="Clear route"
              title="Close route panel"
            >
              ✕
            </button>
          </div>

          {/* From/To section */}
          <div className="route-endpoints">
            <div className="endpoint from">
              <span className="endpoint-label">📍 From:</span>
              <span className="endpoint-value">{isTracking && userLocation ? 'Your Location' : 'Start'}</span>
            </div>
            <div className="endpoint-arrow">→</div>
            <div className="endpoint to">
              <span className="endpoint-label">🔴 To:</span>
              <span className="endpoint-value">{getDestinationName()}</span>
            </div>
          </div>

          <div className="route-details">
            <div className="route-stat">
              <span className="stat-label">Distance:</span>
              <span className="stat-value">
                {(route.distance / 1000).toFixed(2)} km
              </span>
            </div>

            <div className="route-stat">
              <span className="stat-label">Estimated Time:</span>
              <span className="stat-value">{route.time.formatted}</span>
            </div>
          </div>

          <div className="route-path">
            <h4>Path</h4>
            <ol className="waypoints">
              {route.path.map((building, index) => (
                <li key={building.id || index} className="waypoint">
                  <span className="waypoint-number">{index + 1}</span>
                  <span className="waypoint-name">{building.name || (index === 0 ? 'Your Location' : 'Destination')}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Directions button - only show if tracking and route is from user location */}
          {isTracking && userLocation && route.fromUserLocation && !isOnJourney && (
            <button
              className="start-directions-btn"
              onClick={onStartJourney}
              aria-label="Start directions"
              title="Start journey with directions"
            >
              🚶 Start Directions
            </button>
          )}

          {/* Stop journey button - show if on journey */}
          {isOnJourney && (
            <button
              className="stop-directions-btn"
              onClick={onStopJourney}
              aria-label="Stop directions"
              title="Stop journey"
            >
              ⏹️ Stop Directions
            </button>
          )}

          <button
            className="clear-route-btn"
            onClick={onClearRoute}
            aria-label="Clear route and start over"
          >
            Clear Route
          </button>
        </div>
      )}
    </div>
  );
};

export default RouteComponent;
