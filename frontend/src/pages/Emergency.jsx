import React, { useState } from 'react';
import { ShieldAlert, MapPin, Navigation as NavIcon, Clock } from 'lucide-react';
import CampusMap from '../map/CampusMap';
import { useCampusStore, useEmergencyStore } from '../stores/campusStore';
import * as api from '../services/api';

const VEHICLES = [
  { id: 'ambulance', label: 'Ambulance', emoji: '🚑', color: 'bg-red-500' },
  { id: 'fire', label: 'Fire Engine', emoji: '🚒', color: 'bg-orange-500' },
  { id: 'police', label: 'Police', emoji: '🚓', color: 'bg-blue-600' },
  { id: 'security', label: 'Campus Security', emoji: '🛡️', color: 'bg-slate-700' },
];

export default function Emergency() {
  const { nodes } = useCampusStore();
  const { activeDispatches, addDispatch } = useEmergencyStore();
  
  const [vehicle, setVehicle] = useState('ambulance');
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [error, setError] = useState('');
  
  const activeDispatch = activeDispatches[0]; // Just tracking the latest one for the UI primary display

  const handleDispatch = async () => {
    setError('');
    if (!fromNode || !toNode) {
      setError('Select start and end locations.');
      return;
    }
    setIsDispatching(true);
    try {
      const response = await api.dispatchEmergency({
        vehicle_type: vehicle,
        from_node: fromNode,
        to_node: toNode
      });
      addDispatch(response);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-50 text-red-900 p-6 rounded-2xl border border-red-200 mb-8 flex items-start gap-4 shadow-sm">
        <ShieldAlert className="h-8 w-8 text-red-600 shrink-0 animate-pulse mt-1" />
        <div>
          <h1 className="text-2xl font-bold mb-1">Emergency Dispatch Protocol</h1>
          <p className="text-red-700/80">
            This module ignores typical traffic constraints and calculates the absolute fastest physical path. 
            In a real scenario, this would alert security to manually clear barricades if necessary.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold text-lg mb-4">1. Select Unit</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {VEHICLES.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVehicle(v.id)}
                  className={`p-3 rounded-lg border-2 text-center flex flex-col items-center justify-center gap-2 transition-all ${
                    vehicle === v.id 
                      ? `border-${v.color.replace('bg-', '')} ${v.color} text-white shadow-md` 
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{v.emoji}</span>
                  <span className="font-medium text-sm">{v.label}</span>
                </button>
              ))}
            </div>

            <h2 className="font-semibold text-lg mb-4">2. Route Details</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Location (From)</label>
                <select 
                  value={fromNode} 
                  onChange={e => setFromNode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select dispatch origin...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Location (To)</label>
                <select 
                  value={toNode} 
                  onChange={e => setToNode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select destination...</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm mb-4 font-medium">{error}</div>}

            <button 
              onClick={handleDispatch}
              disabled={isDispatching}
              className="w-full py-4 bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isDispatching ? 'DISPATCHING...' : 'DISPATCH NOW'}
            </button>
          </div>

          {activeDispatch && (
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> LATEST RESPONSE</h3>
                <span className="text-xs uppercase bg-slate-800 px-2 py-1 rounded border border-slate-700">{activeDispatch.priority}</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Unit</span>
                  <span className="font-semibold capitalize">{activeDispatch.vehicle_type}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">ETA</span>
                  <span className="font-bold text-red-400">{activeDispatch.route.eta_display}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-400">Distance</span>
                  <span className="font-semibold">{(activeDispatch.route.distance).toFixed(0)}m</span>
                </div>
              </div>
            </div>
          )}

          {activeDispatches.length > 1 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold mb-3 text-sm text-slate-700">Other Active Dispatches</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {activeDispatches.slice(1).map(d => (
                  <div key={d.dispatch_id} className="p-2 border rounded bg-slate-50 text-xs flex justify-between">
                    <span className="capitalize font-semibold">{d.vehicle_type}</span>
                    <span className="text-slate-500">{d.route.eta_display}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] relative">
          {activeDispatch ? (
            <CampusMap route={activeDispatch.route} activeDispatches={[activeDispatch]} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <MapPin className="h-16 w-16 mb-4 opacity-20" />
              <p>Map tracking will appear here upon dispatch.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
