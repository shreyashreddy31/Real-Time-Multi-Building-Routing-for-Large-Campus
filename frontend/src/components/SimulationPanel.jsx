import React, { useState } from 'react';
import { FlaskConical, Play, RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as api from '../services/api';
import { useCampusStore } from '../stores/campusStore';

const SCENARIO_PRESETS = [
  { label: 'North Gate Closed', actions: [{ action: 'close_road', from_node: 'north_gate', to_node: 'north_junction' }] },
  { label: 'Heavy Traffic on Main Ave', actions: [{ action: 'heavy_traffic', from_node: 'main_gate', to_node: 'south_junction' }] },
  { label: 'Flood near Library', actions: [{ action: 'flood', from_node: 'library_junction', to_node: 'central_library' }] },
  { label: 'Construction + Road Closure', actions: [
    { action: 'construction', from_node: 'central_junction', to_node: 'east_junction' },
    { action: 'close_road', from_node: 'east_junction', to_node: 'east_gate' }
  ]},
  { label: 'Crowd Surge at Cafeteria', actions: [{ action: 'crowd_surge', from_node: 'cafeteria', to_node: 'central_junction' }] },
  { label: 'Severe Multi-Road Crisis', actions: [
    { action: 'close_road', from_node: 'north_gate', to_node: 'north_junction' },
    { action: 'severe_traffic', from_node: 'main_gate', to_node: 'south_junction' },
    { action: 'accident', from_node: 'central_junction', to_node: 'library_junction' }
  ]},
];

export default function SimulationPanel({ fromNode, toNode, algorithm, onSimResult }) {
  const { edges } = useCampusStore();
  const [expanded, setExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customActions, setCustomActions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCustomAction = () => {
    setCustomActions([...customActions, { action: 'close_road', from_node: '', to_node: '' }]);
  };

  const removeCustomAction = (idx) => {
    setCustomActions(customActions.filter((_, i) => i !== idx));
  };

  const runSimulation = async () => {
    if (!fromNode || !toNode) { setError('Select origin & destination first'); return; }
    const actions = selectedPreset !== null 
      ? SCENARIO_PRESETS[selectedPreset].actions 
      : customActions.filter(a => a.from_node && a.to_node);
    if (actions.length === 0) { setError('Add at least one scenario action'); return; }

    setLoading(true); setError('');
    try {
      const res = await api.simulateScenario({ from_node: fromNode, to_node: toNode, algorithm, actions });
      setResult(res);
      if (onSimResult) onSimResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSim = () => {
    setResult(null); setSelectedPreset(null); setCustomActions([]);
    if (onSimResult) onSimResult(null);
  };

  const comp = result?.comparison;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors">
        <span className="font-bold text-sm text-purple-900 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-purple-600" /> What-If Route Simulator
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-purple-400" /> : <ChevronDown className="h-4 w-4 text-purple-400" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Preset Scenarios */}
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block">Quick Scenarios</label>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIO_PRESETS.map((p, i) => (
                <button key={i} onClick={() => { setSelectedPreset(i); setCustomActions([]); }}
                  className={`text-xs p-2 rounded-lg border text-left transition-colors ${selectedPreset === i ? 'bg-purple-100 border-purple-400 text-purple-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Custom Actions</label>
              <button onClick={addCustomAction} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Add</button>
            </div>
            {customActions.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <select value={a.action} onChange={e => { const c=[...customActions]; c[i].action=e.target.value; setCustomActions(c); setSelectedPreset(null); }}
                  className="text-xs p-1.5 border rounded flex-1">
                  {['close_road','heavy_traffic','severe_traffic','accident','flood','construction','crowd_surge'].map(t => 
                    <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                  )}
                </select>
                <select value={a.from_node} onChange={e => { const c=[...customActions]; c[i].from_node=e.target.value; setCustomActions(c); setSelectedPreset(null); }}
                  className="text-xs p-1.5 border rounded flex-1">
                  <option value="">From...</option>
                  {edges.filter((e,idx,arr) => arr.findIndex(x=>x.from===e.from)===idx).map(e => 
                    <option key={e.from} value={e.from}>{e.from}</option>
                  )}
                </select>
                <select value={a.to_node} onChange={e => { const c=[...customActions]; c[i].to_node=e.target.value; setCustomActions(c); setSelectedPreset(null); }}
                  className="text-xs p-1.5 border rounded flex-1">
                  <option value="">To...</option>
                  {edges.filter(e => e.from === a.from_node).map(e => 
                    <option key={e.to} value={e.to}>{e.to}</option>
                  )}
                </select>
                <button onClick={() => removeCustomAction(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="flex gap-2">
            <button onClick={runSimulation} disabled={loading}
              className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
              {loading ? 'Simulating...' : <><Play className="h-3.5 w-3.5" /> Run Simulation</>}
            </button>
            {result && (
              <button onClick={resetSim} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 flex items-center gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>

          {/* Results */}
          {result && comp && (
            <div className="space-y-3">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-900">Simulation Result</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${comp.route_changed ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {comp.route_changed ? 'Route Changed' : 'Same Route'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <div className="text-slate-500">ETA Change</div>
                    <div className={`font-bold ${comp.eta_change_seconds > 0 ? 'text-red-600' : comp.eta_change_seconds < 0 ? 'text-green-600' : 'text-slate-700'}`}>
                      {comp.eta_change_display}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-slate-500">Cost Change</div>
                    <div className={`font-bold ${comp.cost_change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {comp.cost_change > 0 ? '+' : ''}{comp.cost_change.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-slate-500">Distance Δ</div>
                    <div className="font-bold text-slate-700">{comp.distance_change_meters > 0 ? '+' : ''}{comp.distance_change_meters.toFixed(0)}m</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="text-slate-500">Nodes Explored</div>
                    <div className="font-bold text-slate-700">{comp.current_nodes_explored} → {comp.simulated_nodes_explored}</div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-purple-600">
                  Actions: {result.actions_applied?.join('; ')}
                </div>
              </div>
              {!comp.simulated_route_found && (
                <div className="bg-red-50 text-red-700 text-xs p-2 rounded border border-red-200">
                  ⚠ No route found under simulated conditions — destination unreachable.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
