import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapMarkers from './MapMarkers';
import RouteLayer from './RouteLayer';

// Helper component to center map on selected place
function MapCenterer({ selectedPlace, focusCoords }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPlace) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], 18, { duration: 1.5 });
    } else if (focusCoords) {
      map.flyTo(focusCoords, 17, { duration: 1.5 });
    }
  }, [selectedPlace, focusCoords, map]);
  return null;
}

export default function CampusMap({ 
  places = [], 
  route = null, 
  incidents = [], 
  parkingZones = [],
  activeDispatches = [],
  selectedPlace = null, 
  onPlaceClick = null,
  focusCoords = null,
  showTraffic = false
}) {
  const center = [28.5450, 77.1926]; // Campus center

  return (
    <MapContainer 
      center={center} 
      zoom={16} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      <MapCenterer selectedPlace={selectedPlace} focusCoords={focusCoords} />
      
      <MapMarkers 
        places={places} 
        incidents={incidents}
        parkingZones={parkingZones}
        activeDispatches={activeDispatches}
        onPlaceClick={onPlaceClick} 
      />
      
      {route && <RouteLayer route={route} />}
    </MapContainer>
  );
}
