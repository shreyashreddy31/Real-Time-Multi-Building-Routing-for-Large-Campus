import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('academic')) return { emoji: '🏢', color: 'bg-blue-500' };
  if (cat.includes('dining')) return { emoji: '🍔', color: 'bg-orange-500' };
  if (cat.includes('recreation')) return { emoji: '⚽', color: 'bg-green-500' };
  if (cat.includes('emergency') || cat.includes('hospital')) return { emoji: '🏥', color: 'bg-red-500' };
  if (cat.includes('transport') || cat.includes('parking')) return { emoji: '🚌', color: 'bg-purple-500' };
  if (cat.includes('residential')) return { emoji: '🏠', color: 'bg-teal-500' };
  return { emoji: '📍', color: 'bg-slate-600' };
};

const createPlaceIcon = (place) => {
  const { emoji, color } = getCategoryIcon(place.category);
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="group relative flex flex-col items-center justify-center w-8 h-8 -mt-4 -ml-4 cursor-pointer transition-transform hover:scale-110 hover:z-50">
        <div class="${color} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md border-2 border-white z-10">
          ${emoji}
        </div>
        <div class="absolute top-9 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
          ${place.name}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const createIncidentIcon = (severity) => {
  const isCritical = severity.toLowerCase() === 'critical';
  const color = isCritical ? 'bg-red-600' : 'bg-orange-500';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute inset-0 ${color} rounded-full opacity-40 animate-ping"></div>
        <div class="relative ${color} text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-white z-10">
          ⚠️
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const createParkingIcon = (zone) => {
  const percent = zone.occupied / zone.total_spaces;
  const color = percent > 0.9 ? 'bg-red-500' : percent > 0.6 ? 'bg-yellow-500' : 'bg-green-500';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative flex flex-col items-center justify-center -mt-4 -ml-4 hover:scale-110 transition-transform cursor-pointer group">
        <div class="${color} text-white w-8 h-8 rounded flex items-center justify-center font-bold text-xs shadow-md border border-white z-10">
          P
        </div>
        <div class="absolute top-9 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-20">
          ${zone.total_spaces - zone.occupied} / ${zone.total_spaces} spaces
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};


export default function MapMarkers({ places, incidents = [], parkingZones = [], activeDispatches = [], onPlaceClick }) {
  const navigate = useNavigate();

  return (
    <>
      {places.map((place) => (
        <Marker 
          key={place.id} 
          position={[place.lat, place.lng]} 
          icon={createPlaceIcon(place)}
          eventHandlers={{ click: () => onPlaceClick && onPlaceClick(place) }}
        >
          <Popup className="custom-popup">
            <div className="p-1 min-w-[200px]">
              <h3 className="font-bold text-slate-900 mb-1">{place.name}</h3>
              <p className="text-xs text-slate-500 mb-2 uppercase">{place.category}</p>
              {place.hours && <p className="text-xs text-slate-600 mb-2">🕒 {place.hours}</p>}
              <button 
                onClick={() => navigate(`/navigate?to=${place.id}`)}
                className="w-full bg-primary text-white text-xs py-1.5 rounded-md hover:bg-primary/90 transition-colors font-semibold"
              >
                Navigate Here
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {incidents.filter(i => i.status === 'active').map((incident) => {
        // Find rough location (midpoint of road) - for now, just place it if we have coords, or use a heuristic.
        // Assuming the backend might send lat/lng for incidents later, or we map node IDs.
        // As a fallback, we won't render if no lat/lng exists directly on incident, but in a real app we'd map it.
        // We will skip rendering on map if no coords provided by incident obj.
        return null; 
      })}

      {parkingZones.map((zone) => (
        <Marker 
          key={zone.id} 
          position={[zone.lat, zone.lng]} 
          icon={createParkingIcon(zone)}
        >
           <Popup>
            <div className="p-1 text-center">
              <h3 className="font-bold">{zone.name}</h3>
              <p className="text-sm font-medium mt-1 text-slate-600">Available: {zone.total_spaces - zone.occupied}</p>
              <button 
                onClick={() => navigate(`/parking`)}
                className="mt-2 text-primary text-xs font-semibold hover:underline"
              >
                View Details
              </button>
            </div>
           </Popup>
        </Marker>
      ))}
    </>
  );
}
