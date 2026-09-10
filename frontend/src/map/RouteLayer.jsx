import React, { useEffect, useState } from 'react';
import { Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons for start and end
const createDivIcon = (color, label) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative flex items-center justify-center w-8 h-8">
           <div class="absolute inset-0 bg-${color}-500 rounded-full opacity-30 animate-ping"></div>
           <div class="relative bg-${color}-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">${label}</div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const startIcon = createDivIcon('blue', 'A');
const endIcon = createDivIcon('green', 'B');

export default function RouteLayer({ route }) {
  const map = useMap();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (route && route.coordinates && route.coordinates.length > 0) {
      const bounds = L.latLngBounds(route.coordinates);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [route, map]);

  if (!route || !route.coordinates || route.coordinates.length === 0) return null;

  return (
    <>
      {/* Background thicker line for glow effect */}
      <Polyline 
        positions={route.coordinates} 
        pathOptions={{ color: '#4F46E5', weight: 8, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }} 
      />
      
      {/* Main route line */}
      <Polyline 
        positions={route.coordinates} 
        pathOptions={{ 
          color: '#4F46E5', 
          weight: 4, 
          opacity: 1, 
          lineCap: 'round', 
          lineJoin: 'round',
          dashArray: isAnimating ? '10, 10' : null,
          className: isAnimating ? 'animate-pulse' : ''
        }} 
      />

      <Marker position={route.coordinates[0]} icon={startIcon} />
      <Marker position={route.coordinates[route.coordinates.length - 1]} icon={endIcon} />
    </>
  );
}
