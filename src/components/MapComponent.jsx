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
  userLocation,
  isTracking = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const headingMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const [routingLoaded, setRoutingLoaded] = useState(false);

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
  }, []); // only on mount during darkMode init

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
      } catch (err) {
        console.warn('Error removing tile layer', err);
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

    // Remove old building markers
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};

    // Render buildings as simple, subtle circle markers (no pin)
    buildings.forEach((building) => {
      const marker = L.circleMarker(building.coordinates, {
        radius: 6,
        color: '#6b7280',
        fillColor: '#ffffff',
        fillOpacity: 0.9,
        weight: 1,
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
      } catch (err) { console.warn('flyTo failed', err); }
    }
    if (marker) {
      marker.openPopup();
    }
  }, [focusBuilding, buildings]);

  // Update user location marker when location prop changes (from parent App)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Helper to create a pin SVG element for given color
    const createPinDiv = (color) => {
      const el = document.createElement('div');
      el.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="18" r="6" fill="${color}"/>
          <path d="M 20 40 L 14 24 L 26 24 Z" fill="${color}"/>
          <circle cx="20" cy="18" r="3" fill="white"/>
        </svg>
      `;
      return el;
    };

    // Clean up old markers
    if (userMarkerRef.current) {
      try { map.removeLayer(userMarkerRef.current); } catch (err) { console.warn('remove user marker failed', err); }
      userMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      try { map.removeLayer(accuracyCircleRef.current); } catch (err) { console.warn('remove accuracy circle failed', err); }
      accuracyCircleRef.current = null;
    }

    // Only render if tracking is active and we have location
    if (isTracking && userLocation) {
      const { lat, lng, accuracy } = userLocation;
      
      // Add accuracy circle
      accuracyCircleRef.current = L.circle([lat, lng], { 
        radius: accuracy, 
        color: '#2b6cb0', 
        opacity: 0.25 
      }).addTo(map);

      // Add user location marker (blue pin)
      const pinEl = createPinDiv('#3b82f6');
      userMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html: pinEl,
          className: 'user-pin-container',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current.bindPopup(
        `<strong>You are here</strong><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}<br/>Accuracy: ${Math.round(accuracy)}m`
      );
      userMarkerRef.current.openPopup();

      console.info(`User location displayed: [${lat.toFixed(6)}, ${lng.toFixed(6)}] ±${Math.round(accuracy)}m`);
      // Auto-center map on user location to ensure it's visible even with poor GPS accuracy
      map.setView([lat, lng], 18);
      }
  }, [userLocation, isTracking]);

  // Show heading arrow when on journey
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Remove existing heading marker
    if (headingMarkerRef.current) {
      try {
        map.removeLayer(headingMarkerRef.current);
      } catch (err) { console.warn('remove heading marker failed', err); }
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

  // Render red pin for the current journey destination (only one)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // remove existing destination marker
    if (destinationMarkerRef.current) {
      try { map.removeLayer(destinationMarkerRef.current); } catch (err) { console.warn('remove destination marker failed', err); }
      destinationMarkerRef.current = null;
    }

    if (journeyDestination) {
      const destBuilding = buildings.find((b) => b.id === journeyDestination);
      if (!destBuilding) return;

      const pinEl = document.createElement('div');
      pinEl.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="18" r="6" fill="#ef4444"/>
          <path d="M 20 40 L 14 24 L 26 24 Z" fill="#ef4444"/>
          <circle cx="20" cy="18" r="3" fill="white"/>
        </svg>
      `;

      destinationMarkerRef.current = L.marker(destBuilding.coordinates, {
        icon: L.divIcon({
          html: pinEl,
          className: 'destination-pin-container',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
        zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [journeyDestination, buildings]);

  return <div id="map" aria-label="Interactive campus map"></div>;
};

export default MapComponent;
