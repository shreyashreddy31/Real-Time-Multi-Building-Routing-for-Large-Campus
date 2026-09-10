import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigation as NavIcon, Users, Settings, AlertCircle, Shield, Leaf } from 'lucide-react';
import CampusMap from '../map/CampusMap';
import RoutePanel from '../components/RoutePanel';
import RouteIntelligence from '../components/RouteIntelligence';
import SimulationPanel from '../components/SimulationPanel';
import RouteComparison from '../components/RouteComparison';
import { useCampusStore, useNavigationStore } from '../stores/campusStore';

export default function Navigation() {
  const [searchParams] = useSearchParams();
  const { nodes } = useCampusStore();
  const navStore = useNavigationStore();

  const [fromNode, setFromNode] = useState(searchParams.get('from') || '');
  const [toNode, setToNode] = useState(searchParams.get('to') || '');
  const [algorithm, setAlgorithm] = useState('astar');
  const [routeType, setRouteType] = useState('fastest');
  const [avoidCrowds, setAvoidCrowds] = useState(false);
  const [error, setError] = useState('');

  // Accessibility preferences
  const [a11yEnabled, setA11yEnabled] = useState(false);
  const [a11yPrefs, setA11yPrefs] = useState({ avoid_stairs: false, prefer_lifts: false, wheelchair_only: false });

  // Simulation overlay
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    if (searchParams.get('to')) {
      navStore.setNavigationParams({ toNode: searchParams.get('to') });
    }
  }, [searchParams]);

  const handleCalculate = async () => {
    setError('');
    if (!fromNode || !toNode) { setError('Please select both origin and destination.'); return; }
    if (fromNode === toNode) { setError('Origin and destination cannot be the same.'); return; }
    
    navStore.setNavigationParams({ fromNode, toNode, algorithm, routeType, avoidCrowds });
    await navStore.calculateRoute();
  };

  const sortedNodes = [...nodes].sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Build the map route — prefer simulated route if available
  const mapRoute = simResult?.simulated_route || navStore.currentRoute;

  return (
    <div className="flex h-[calc(100vh-4rem)] relative overflow-hidden flex-col md:flex-row">
      
      {/* Left Panel */}
      <div className="w-full md:w-[420px] h-1/2 md:h-full bg-white border-r border-slate-200 shadow-xl z-20 flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
            <NavIcon className="h-5 w-5 text-primary" /> Route Planner
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute top-9 left-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white shadow-sm shrink-0"></div>
                  <select 
                    value={fromNode} 
                    onChange={e => setFromNode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="" disabled>Choose starting point...</option>
                    {sortedNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white shadow-sm shrink-0"></div>
                  <select 
                    value={toNode} 
                    onChange={e => setToNode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="" disabled>Choose destination...</option>
                    {sortedNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button 
              onClick={handleCalculate}
              disabled={navStore.isNavigating}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {navStore.isNavigating ? 'Calculating...' : 'Get Directions'}
            </button>
          </div>
        </div>

        <div className="p-5 border-b border-slate-100 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Settings className="h-4 w-4"/> Route Type</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { val: 'fastest', label: 'Fastest', icon: '⚡' },
              { val: 'shortest', label: 'Shortest', icon: '📏' },
              { val: 'eco', label: 'Eco', icon: '🌱' },
              { val: 'low-congestion', label: 'Low Traffic', icon: '🛤️' },
            ].map(rt => (
              <label key={rt.val} className={`border rounded-lg p-2 text-center text-xs cursor-pointer transition-colors ${routeType === rt.val ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                <input type="radio" name="rtype" value={rt.val} checked={routeType === rt.val} onChange={e => setRouteType(e.target.value)} className="hidden"/>
                <div>{rt.icon}</div>
                {rt.label}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 p-2 bg-slate-50 rounded-lg border border-slate-100 mb-2">
            <input type="checkbox" checked={avoidCrowds} onChange={e => setAvoidCrowds(e.target.checked)} className="rounded text-primary focus:ring-primary"/>
            <Users className="h-4 w-4 text-slate-500" /> Avoid Crowded Areas
          </label>

          {/* Accessibility Preferences */}
          <div className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 p-2 bg-blue-50 rounded-lg border border-blue-100 mb-1">
              <input type="checkbox" checked={a11yEnabled} onChange={e => setA11yEnabled(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500"/>
              <Shield className="h-4 w-4 text-blue-500" /> Accessibility Mode
            </label>
            {a11yEnabled && (
              <div className="ml-2 space-y-1 mt-1 animate-in slide-in-from-top-2">
                {[
                  { key: 'avoid_stairs', label: '🪜 Avoid stairs' },
                  { key: 'prefer_lifts', label: '🛗 Prefer lifts/elevators' },
                  { key: 'wheelchair_only', label: '♿ Wheelchair accessible only' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 text-xs text-slate-600 p-1.5 bg-white rounded border border-blue-50 cursor-pointer hover:bg-blue-50">
                    <input type="checkbox" checked={a11yPrefs[opt.key]} onChange={e => setA11yPrefs({...a11yPrefs, [opt.key]: e.target.checked})} className="rounded text-blue-500 focus:ring-blue-400"/>
                    {opt.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">
          {navStore.rerouteAlert && (
            <div className="p-3 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg flex items-start gap-2 shadow-sm">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold text-sm">Route Updated!</p>
                <p className="text-xs">Your route has been recalculated due to real-time traffic conditions.</p>
              </div>
              <button onClick={() => navStore.clearRerouteAlert()} className="ml-auto text-amber-500 hover:text-amber-800 font-bold">&times;</button>
            </div>
          )}

          {navStore.currentRoute && (
            <>
              <RoutePanel route={navStore.currentRoute} />
              <RouteIntelligence route={navStore.currentRoute} />
            </>
          )}

          {/* Simulation Panel */}
          <SimulationPanel fromNode={fromNode} toNode={toNode} algorithm={algorithm} onSimResult={setSimResult} />

          {/* Smart Route Comparison */}
          <RouteComparison 
            fromNode={fromNode} toNode={toNode}
            accessibility={a11yEnabled ? a11yPrefs : null}
            onSelectRoute={(route) => navStore.setNavigationParams({ currentRoute: route })}
          />

          {!navStore.currentRoute && !navStore.isNavigating && !simResult && (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <NavIcon className="h-12 w-12 opacity-20" />
              <p className="text-sm">Enter origin and destination to plan your route.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-1/2 md:h-full z-0">
        <CampusMap 
          route={mapRoute}
        />
        {simResult && (
          <div className="absolute top-3 right-3 z-10 bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            ⚗️ Simulation Mode
          </div>
        )}
      </div>
    </div>
  );
}
