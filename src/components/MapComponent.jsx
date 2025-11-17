import { useEffect, useRef, useState } from "react";
const REROUTE_THRESHOLD = 15; // meters to trigger reroute
import L from "leaflet";
import "../styles/map.css";

const MapComponent = ({
  buildings,
  markers,
  onMarkerClick,
  route,
  darkMode,
  focusBuilding,
  isOnJourney,
  journeyDestination,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const headingMarkerRef = useRef(null);
  const [routingLoaded, setRoutingLoaded] = useState(false);
  const [trackingActive, setTrackingActive] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentRouteDest, setCurrentRouteDest] = useState(null);
  const [lastTrackedPos, setLastTrackedPos] = useState(null);

  // Dynamically load Leaflet Routing Machine
  useEffect(() => {
    if (!window.L?.Routing) {
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js";
      script.onload = () => setRoutingLoaded(true);
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css";
      document.head.appendChild(link);
    } else {
      setRoutingLoaded(true);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current) {
      const map = L.map('map', {
        center: [6.889149, 3.72005],
        zoom: 18,
        zoomControl: false,
        attributionControl: true,
      });

      // initial tiles
      const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      const baseUrl = darkMode ? darkUrl : lightUrl;

      tileLayerRef.current = L.tileLayer(baseUrl, {
        maxZoom: 20,
        minZoom: 15,
        attribution: darkMode
          ? '&copy; <a href="https://carto.com/attributions">Carto</a> & OpenStreetMap'
          : '&copy; OpenStreetMap contributors',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      mapRef.current = map;
      mapInstanceRef.current = map;

      // Force redraw and fade-in
      setTimeout(() => {
        map.invalidateSize(true);
        document.getElementById('map')?.classList.add('map-loaded');
      }, 200);
    }
  }, []); // only on mount

  // Respond to darkMode changes by swapping tile layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const baseUrl = darkMode ? darkUrl : lightUrl;

    if (tileLayerRef.current) {
      try {
        map.removeLayer(tileLayerRef.current);
      } catch (e) {
        // ignore
      }
    }

    tileLayerRef.current = L.tileLayer(baseUrl, {
      maxZoom: 20,
      minZoom: 15,
      attribution: darkMode
        ? '&copy; <a href="https://carto.com/attributions">Carto</a> & OpenStreetMap'
        : '&copy; OpenStreetMap contributors',
    }).addTo(map);
  }, [darkMode]);

  // Add/update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    buildings.forEach((building) => {
      const isHighlighted = markers.includes(building.id);
      const isDestination = isHighlighted;
      
      // Create SVG pin markers
      const markerEl = document.createElement("div");
      
      if (isDestination) {
        // Red destination pin
        markerEl.innerHTML = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="18" r="6" fill="#ef4444"/>
            <path d="M 20 40 L 14 24 L 26 24 Z" fill="#ef4444"/>
            <circle cx="20" cy="18" r="3" fill="white"/>
          </svg>
        `;
        markerEl.className = "pin-marker-red";
      } else {
        // Blue regular pin
        markerEl.innerHTML = `
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="18" r="6" fill="#3b82f6"/>
            <path d="M 20 40 L 14 24 L 26 24 Z" fill="#3b82f6"/>
            <circle cx="20" cy="18" r="3" fill="white"/>
          </svg>
        `;
        markerEl.className = "pin-marker-blue";
      }

      const marker = L.marker(building.coordinates, {
        icon: L.divIcon({
          html: markerEl,
          className: isDestination ? 'destination-marker-container' : 'building-marker-container',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
        zIndexOffset: isDestination ? 999 : 0,
      }).addTo(map);

      const popupContent = `
        <div class="popup-content">
          <h3 class="popup-title">${building.name}</h3>
          <p class="popup-dept">Department: ${building.department}</p>
          <p class="popup-desc">${building.description}</p>
          <p class="popup-hours">Hours: ${building.hours}</p>
          <button class="popup-btn" data-building-id="${building.id}" aria-label="Select ${building.name} as destination">Select as Destination</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onMarkerClick(building.id);
        marker.openPopup();
      });

      markersRef.current[building.id] = marker;
    });
  }, [buildings, markers, onMarkerClick]);

  // Draw Route
  useEffect(() => {
    if (!mapInstanceRef.current || !routingLoaded || !route) return;

    const map = mapInstanceRef.current;

    if (routerRef.current) {
      map.removeControl(routerRef.current);
    }

    if (route?.path?.length > 1) {
      const waypoints = route.path.map((p) =>
        Array.isArray(p)
          ? L.latLng(p[0], p[1])
          : L.latLng(p.coordinates[0], p.coordinates[1])
      );

      routerRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        showAlternatives: false,
        createMarker: () => null,
        lineOptions: {
          styles: [
            {
              color: "#2563eb",
              opacity: 0.8,
              weight: 5,
              dashArray: "6, 6",
            },
          ],
        },
      }).addTo(map);

      map.fitBounds(L.latLngBounds(waypoints), { padding: [60, 60] });
    }
  }, [route, routingLoaded]);

  // Resize Handler
  useEffect(() => {
    const fixLayout = () => {
      mapInstanceRef.current?.invalidateSize(true);
    };
    window.addEventListener("resize", fixLayout);
    return () => window.removeEventListener("resize", fixLayout);
  }, []);

  // Focus building when requested by parent (search auto-zoom)
  useEffect(() => {
    if (!focusBuilding || !mapInstanceRef.current) return;
    const marker = markersRef.current[focusBuilding];
    const map = mapInstanceRef.current;
    const building = buildings.find((b) => b.id === focusBuilding);
    if (building) {
      try {
        map.flyTo(building.coordinates, 19, { duration: 0.8 });
      } catch (e) {}
    }
    if (marker) {
      marker.openPopup();
    }
  }, [focusBuilding]);

  // Location tracking logic (watchPosition, marker/circle management, rerouting)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Helper to update marker/circle
    const updateUserMarker = (lat, lng, accuracy) => {
      if (userMarkerRef.current) {
        try { map.removeLayer(userMarkerRef.current); } catch (e) {}
        userMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        try { map.removeLayer(accuracyCircleRef.current); } catch (e) {}
        accuracyCircleRef.current = null;
      }
      if (lat && lng) {
        accuracyCircleRef.current = L.circle([lat, lng], { radius: accuracy, color: '#2b6cb0', opacity: 0.25 }).addTo(map);
        userMarkerRef.current = L.circleMarker([lat, lng], { radius: 8, fillOpacity: 0.95, color: '#2b6cb0', weight: 1 }).addTo(map);
        userMarkerRef.current.bindPopup(`<strong>You are here</strong><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}<br/>Accuracy: ${Math.round(accuracy)}m`).openPopup();
      }
    };

    // Start tracking
    if (trackingActive && !watchId && navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy || 0;
          setUserLocation({ lat, lng, accuracy });
          updateUserMarker(lat, lng, accuracy);

          const newPos = L.latLng(lat, lng);
          if (!lastTrackedPos) setLastTrackedPos(newPos);

          // Only reroute if moved significantly
          if (currentRouteDest && lastTrackedPos && newPos.distanceTo(lastTrackedPos) >= REROUTE_THRESHOLD) {
            setLastTrackedPos(newPos);
            if (routerRef.current && typeof routerRef.current.setWaypoints === 'function') {
              try {
                routerRef.current.setWaypoints([newPos, L.latLng(currentRouteDest.lat, currentRouteDest.lng)]);
              } catch (e) {
                console.warn('Error updating route waypoints', e);
              }
            }
          }
        },
        err => {
          console.warn('watchPosition error', err);
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
      setWatchId(id);
    }

    // Stop tracking
    if (!trackingActive && watchId) {
      try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
      setWatchId(null);
      setLastTrackedPos(null);
    }

    // Clean up on unmount
    return () => {
      if (watchId) {
        try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
      }
    };
  }, [trackingActive, watchId, currentRouteDest, lastTrackedPos]);

  // Expose start/stop tracking for parent or UI button
  // Example: <button onClick={() => setTrackingActive(true)}>Start Tracking</button>
  // Example: <button onClick={() => setTrackingActive(false)}>Stop Tracking</button>

  // Show heading arrow when on journey
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Remove existing heading marker
    if (headingMarkerRef.current) {
      try {
        map.removeLayer(headingMarkerRef.current);
      } catch (e) {}
      headingMarkerRef.current = null;
    }

    // Add heading arrow if on journey and have destination
    if (isOnJourney && journeyDestination) {
      const building = buildings.find((b) => b.id === journeyDestination);
      if (!building) return;

      // Calculate bearing/heading from user to destination
      const φ1 = (userLocation.lat * Math.PI) / 180;
      const φ2 = (building.coordinates[0] * Math.PI) / 180;
      const Δλ = ((building.coordinates[1] - userLocation.lng) * Math.PI) / 180;

      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x =
        Math.cos(φ1) * Math.sin(φ2) -
        Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

      const bearing = (Math.atan2(y, x) * 180) / Math.PI;
      const normalizedBearing = (bearing + 360) % 360;

      // Create heading arrow marker
      const headingEl = document.createElement('div');
      headingEl.className = 'heading-arrow';
      headingEl.innerHTML = `↑`;
      headingEl.style.transform = `rotate(${normalizedBearing}deg)`;

      headingMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          html: headingEl,
          className: 'heading-arrow-container',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        }),
        zIndexOffset: 1001,
        keyboard: false,
      }).addTo(map);
    }
  }, [isOnJourney, journeyDestination, userLocation, buildings]);

  return <div id="map" aria-label="Interactive campus map"></div>;
};

export default MapComponent;
