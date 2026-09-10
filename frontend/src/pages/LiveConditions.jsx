import React, { useState } from 'react';
import { AlertTriangle, Map, Filter } from 'lucide-react';
import IncidentCard from '../components/IncidentCard';
import CampusMap from '../map/CampusMap';
import { useTrafficStore } from '../stores/campusStore';

export default function LiveConditions() {
  const { incidents } = useTrafficStore();
  const [filterType, setFilterType] = useState('All');
  
  const activeIncidents = incidents.filter(i => i.status === 'active');
  const types = ['All', ...new Set(activeIncidents.map(i => i.type))];

  const filteredIncidents = filterType === 'All' 
    ? activeIncidents 
    : activeIncidents.filter(i => i.type === filterType);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
      {/* Left Panel */}
      <div className="w-full md:w-96 bg-slate-50 border-r border-slate-200 flex flex-col h-1/2 md:h-full">
        <div className="p-5 border-b border-slate-200 bg-white">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <AlertTriangle className="h-6 w-6 text-amber-500" /> Live Conditions
          </h1>
          <p className="text-sm text-slate-500 mt-1">Real-time alerts and campus traffic.</p>
          
          <div className="mt-4 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            {types.map(t => (
              <button 
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-colors ${filterType === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                <AlertTriangle className="h-6 w-6 text-slate-300" />
              </div>
              <p>No active incidents.</p>
            </div>
          ) : (
            filteredIncidents.map(inc => (
              <IncidentCard key={inc.id} incident={inc} />
            ))
          )}
        </div>
      </div>
      
      {/* Map Area */}
      <div className="flex-1 relative h-1/2 md:h-full">
        <CampusMap 
          incidents={activeIncidents}
          showTraffic={true}
        />
      </div>
    </div>
  );
}
