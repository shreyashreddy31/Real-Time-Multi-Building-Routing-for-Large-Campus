import React, { useState } from 'react';
import CampusMap from '../map/CampusMap';
import { useCampusStore, useTrafficStore, useParkingStore, useEmergencyStore } from '../stores/campusStore';
import { Layers, MapPin, AlertTriangle, Car, Users, Filter, X } from 'lucide-react';

export default function ExploreCampus() {
  const { places } = useCampusStore();
  const { incidents } = useTrafficStore();
  const { parkingZones } = useParkingStore();
  const { activeDispatches } = useEmergencyStore();

  const [layers, setLayers] = useState({
    buildings: true,
    incidents: true,
    parking: true,
    traffic: false,
    crowds: false
  });

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleLayer = (layer) => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));

  return (
    <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Sidebar */}
      <div className={`absolute md:relative z-20 h-full w-80 bg-white border-r border-slate-200 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Map Layers</h2>
          <button className="md:hidden p-1 text-slate-400 hover:text-slate-600" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Features</h3>
            
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" checked={layers.buildings} onChange={() => toggleLayer('buildings')} className="rounded text-primary focus:ring-primary h-4 w-4" />
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium">Buildings & Places</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" checked={layers.incidents} onChange={() => toggleLayer('incidents')} className="rounded text-primary focus:ring-primary h-4 w-4" />
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Active Incidents</span>
            </label>
            
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
              <input type="checkbox" checked={layers.parking} onChange={() => toggleLayer('parking')} className="rounded text-primary focus:ring-primary h-4 w-4" />
              <Car className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium">Parking Zones</span>
            </label>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Overlays</h3>
            
            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer opacity-50 cursor-not-allowed">
              <input type="checkbox" disabled checked={layers.traffic} onChange={() => toggleLayer('traffic')} className="rounded text-primary focus:ring-primary h-4 w-4" />
              <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
              <span className="text-sm font-medium">Traffic Conditions (WIP)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <button 
          className={`absolute top-4 left-4 z-20 bg-white p-2 rounded-md shadow-md md:hidden ${isSidebarOpen ? 'hidden' : 'block'}`}
          onClick={() => setIsSidebarOpen(true)}
        >
          <Layers className="h-5 w-5 text-slate-600" />
        </button>

        <CampusMap 
          places={layers.buildings ? places : []}
          incidents={layers.incidents ? incidents : []}
          parkingZones={layers.parking ? parkingZones : []}
          activeDispatches={activeDispatches}
          selectedPlace={selectedPlace}
          onPlaceClick={setSelectedPlace}
        />
      </div>
    </div>
  );
}
