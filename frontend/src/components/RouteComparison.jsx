import React, { useState } from 'react';
import { GitCompare, Play, Leaf, Clock, MapPin, Zap, Shield, Star, ChevronDown, ChevronUp } from 'lucide-react';
import * as api from '../services/api';

const MODE_LABELS = {
  fastest: { label: 'Fastest', icon: '⚡', desc: 'Minimum travel time' },
  shortest: { label: 'Shortest', icon: '📏', desc: 'Minimum distance' },
  eco: { label: 'Eco', icon: '🌱', desc: 'Low environmental impact' },
  low_congestion: { label: 'Low Congestion', icon: '🛤️', desc: 'Avoids traffic' },
};

export default function RouteComparison({ fromNode, toNode, accessibility, onSelectRoute }) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runComparison = async () => {
    if (!fromNode || !toNode) { setError('Select origin & destination'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.compareRoutes({
        from_node: fromNode, to_node: toNode,
        modes: ['fastest', 'shortest', 'eco', 'low_congestion'],
        accessibility: accessibility || null,
      });
      setResult(res);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-colors">
        <span className="font-bold text-sm text-emerald-900 flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-emerald-600" /> Smart Route Comparison
        </span>
        {expanded ? <ChevronUp className="h-4 w-4 text-emerald-400" /> : <ChevronDown className="h-4 w-4 text-emerald-400" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-500">Compare Fastest, Shortest, Eco-Friendly and Low-Congestion routes side by side.</p>
          
          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          
          <button onClick={runComparison} disabled={loading}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5">
            {loading ? 'Comparing...' : <><Play className="h-3.5 w-3.5" /> Compare Routes</>}
          </button>

          {result && (
            <div className="space-y-2">
              {/* Recommendation */}
              {result.recommended && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                  <Star className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Recommended: {MODE_LABELS[result.recommended]?.label}</p>
                    <p className="text-[10px] text-emerald-700">{result.recommendation_reason}</p>
                  </div>
                </div>
              )}

              {/* Route Cards */}
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(result.routes).map(([mode, route]) => {
                  const m = MODE_LABELS[mode] || { label: mode, icon: '🔹' };
                  const isRec = result.recommended === mode;
                  return (
                    <div key={mode}
                      onClick={() => onSelectRoute && onSelectRoute(route)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${isRec ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm flex items-center gap-1.5">
                          <span>{m.icon}</span> {m.label}
                          {isRec && <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full ml-1">★ Best</span>}
                        </span>
                        <span className={`font-bold text-sm ${route.found ? 'text-slate-900' : 'text-red-500'}`}>
                          {route.found ? route.eta_display : 'No route'}
                        </span>
                      </div>
                      {route.found && (
                        <div className="grid grid-cols-4 gap-1 text-[10px] text-slate-600">
                          <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {route.eta_display}</div>
                          <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {route.distance?.toFixed(0)}m</div>
                          <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> {route.execution_time_ms?.toFixed(2)}ms</div>
                          <div className="flex items-center gap-1"><Leaf className="h-3 w-3" /> Eco: {route.eco_score?.score ?? '?'}</div>
                        </div>
                      )}
                      {route.found && route.accessibility_info && (
                        <div className="mt-1 text-[10px] text-slate-400">
                          {route.accessibility_info.wheelchair_accessible ? '♿ Accessible' : '⚠ Not fully accessible'}
                          {route.accessibility_info.stairs_segments > 0 && ` · ${route.accessibility_info.stairs_segments} stairs`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
