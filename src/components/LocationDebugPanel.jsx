
import '../styles/location-debug.css';

const LocationDebugPanel = ({ userLocation, isTracking }) => {
  if (!userLocation) return null;

  const { lat, lng, accuracy } = userLocation;
  
  // Babcock University campus center
  const campusLat = 6.8905;
  const campusLng = 3.7200;
  
  // Calculate distance from campus center
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (campusLat * Math.PI) / 180;
  const Δφ = ((campusLat - lat) * Math.PI) / 180;
  const Δλ = ((campusLng - lng) * Math.PI) / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + 
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceFromCampus = Math.round(R * c);

  // Determine if location seems valid (roughly at Babcock campus)
  const isNearCampus = distanceFromCampus < 3000; // Within 3km of campus
  const hasGoodAccuracy = accuracy < 100;

  return (
    <div className={`location-debug-panel ${!isTracking ? 'inactive' : ''}`}>
      <div className="debug-header">
        <h4>📍 Location Debug Info</h4>
        <span className={`status-badge ${isTracking ? 'tracking' : 'idle'}`}>
          {isTracking ? 'TRACKING' : 'IDLE'}
        </span>
      </div>

      <div className="debug-content">
        <div className="debug-row">
          <span className="label">Coordinates:</span>
          <span className="value mono">{lat.toFixed(6)}°, {lng.toFixed(6)}°</span>
        </div>

        <div className="debug-row">
          <span className="label">Accuracy Radius:</span>
          <span className={`value ${hasGoodAccuracy ? 'good' : 'poor'}`}>
            ±{Math.round(accuracy)}m
            {hasGoodAccuracy && ' ✅' || ' ⚠️'}
          </span>
        </div>

        <div className="debug-row">
          <span className="label">From Campus Center:</span>
          <span className={`value ${isNearCampus ? 'good' : 'poor'}`}>
            {distanceFromCampus > 1000 ? (distanceFromCampus / 1000).toFixed(1) + 'km' : distanceFromCampus + 'm'}
            {isNearCampus ? ' ✅' : ' ⚠️'}
          </span>
        </div>

        <div className="debug-row">
          <span className="label">GPS Quality:</span>
          <span className="value">
            {accuracy < 50 && '✅ Excellent (Indoor GPS)'}
            {accuracy >= 50 && accuracy < 100 && '✅ Good'}
            {accuracy >= 100 && accuracy < 500 && '⚠️ Fair - Try opening a map app to improve'}
            {accuracy >= 500 && '⚠️ Poor - Enable GPS and go outside'}
          </span>
        </div>

        <div className="debug-hint">
          💡 <strong>GPS Accuracy Guide:</strong><br/>
          • Excellent: &lt;50m (GPS + WiFi)<br/>
          • Good: 50-100m (GPS)<br/>
          • Fair: 100-500m (GPS weak)<br/>
          • Poor: &gt;500m (IP-based)
        </div>

        <div className="debug-actions">
          <button 
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(`${lat},${lng}`)}
            title="Copy coordinates"
          >
            📋 Copy Coords
          </button>
          <a
            href={`https://www.google.com/maps/@${lat},${lng},19z`}
            target="_blank"
            rel="noopener noreferrer"
            className="maps-btn"
            title="View on Google Maps"
          >
            🗺️ Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default LocationDebugPanel;

