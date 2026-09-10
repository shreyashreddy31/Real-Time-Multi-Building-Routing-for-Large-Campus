import React, { useState } from 'react';
import { Car, MapPin, Navigation as NavIcon, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useParkingStore } from '../stores/campusStore';
import CampusMap from '../map/CampusMap';

export default function Parking() {
  const { parkingZones } = useParkingStore();
  const navigate = useNavigate();
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filteredZones = showAvailableOnly 
    ? parkingZones.filter(z => (z.total_spaces - z.occupied) > 0)
    : parkingZones;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      <div className="w-full lg:w-[500px] h-1/2 lg:h-full bg-slate-50 border-r border-slate-200 flex flex-col z-10">
        <div className="p-6 border-b border-slate-200 bg-white">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-2"><Car className="h-6 w-6 text-primary" /> Parking</h1>
          <p className="text-slate-500 text-sm mb-4">Real-time availability across campus.</p>
          
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100">
            <input 
              type="checkbox" 
              checked={showAvailableOnly}
              onChange={e => setShowAvailableOnly(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            Show only available parking
          </label>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredZones.map(zone => {
            const available = zone.total_spaces - zone.occupied;
            const percent = (zone.occupied / zone.total_spaces) * 100;
            const isFull = available === 0;
            const colorClass = isFull ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-green-500';
            const textClass = isFull ? 'text-red-600' : percent > 80 ? 'text-amber-600' : 'text-green-600';

            return (
              <div key={zone.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{zone.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 uppercase font-semibold">
                      {zone.type} Parking
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${textClass}`}>
                    {available}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Capacity</span>
                    <span>{zone.occupied} / {zone.total_spaces}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    {zone.ev_spaces > 0 && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <Zap className="h-3.5 w-3.5" /> {zone.ev_spaces} EV
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/navigate?to=${zone.nearby_node}`)}
                    disabled={isFull}
                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                  >
                    <NavIcon className="h-4 w-4" /> Navigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 relative h-1/2 lg:h-full z-0">
        <CampusMap parkingZones={filteredZones} />
      </div>
    </div>
  );
}
