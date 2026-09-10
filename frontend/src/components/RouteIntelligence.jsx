import React from 'react';
import { Brain, AlertTriangle, MapPin, Zap, Shield, Leaf } from 'lucide-react';

export default function RouteIntelligence({ route }) {
  if (!route?.intelligence) return null;
  const intel = route.intelligence;
  const eco = route.eco_score;
  const a11y = route.accessibility_info;

  const ecoColor = eco?.score < 25 ? 'text-green-600' : eco?.score < 50 ? 'text-emerald-600' : eco?.score < 75 ? 'text-amber-600' : 'text-red-600';
  const ecoBg = eco?.score < 25 ? 'bg-green-50' : eco?.score < 50 ? 'bg-emerald-50' : eco?.score < 75 ? 'bg-amber-50' : 'bg-red-50';

  return (
    <div className="space-y-3 mt-4">
      {/* Why This Route */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-2 mb-2">
          <Brain className="h-4 w-4" /> Why This Route?
        </h4>
        <p className="text-xs text-indigo-800 leading-relaxed">{intel.summary}</p>
        
        {intel.major_junctions?.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-semibold text-indigo-700">Key junctions: </span>
            <span className="text-xs text-indigo-600">{intel.major_junctions.join(' → ')}</span>
          </div>
        )}
        
        {intel.closed_roads_avoided?.length > 0 && (
          <div className="mt-2 flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
            <span className="text-xs text-red-700">Avoided closed: {intel.closed_roads_avoided.join(', ')}</span>
          </div>
        )}
        
        {intel.congested_segments?.length > 0 && (
          <div className="mt-1 flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <span className="text-xs text-amber-700">
              Congestion: {intel.congested_segments.map(s => `${s.road} (${s.level})`).join(', ')}
            </span>
          </div>
        )}

        <div className="mt-2 flex gap-3 text-xs text-indigo-600">
          <span><Zap className="h-3 w-3 inline" /> {intel.nodes_explored} nodes explored</span>
          <span>{intel.execution_time_ms?.toFixed(2)}ms</span>
        </div>
      </div>

      {/* Eco Score */}
      {eco && eco.score !== undefined && (
        <div className={`${ecoBg} rounded-lg p-3 border`}>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-green-600" /> Eco Impact
            </h4>
            <span className={`font-bold text-lg ${ecoColor}`}>{eco.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${eco.score < 25 ? 'bg-green-500' : eco.score < 50 ? 'bg-emerald-500' : eco.score < 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(eco.score, 100)}%` }} />
            </div>
            <span className={`text-xs font-semibold ${ecoColor}`}>{eco.label}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{eco.note}</p>
        </div>
      )}

      {/* Accessibility */}
      {a11y && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1.5 mb-2">
            <Shield className="h-4 w-4" /> Accessibility
          </h4>
          <div className="grid grid-cols-2 gap-1 text-xs text-blue-800">
            <span>♿ Wheelchair: {a11y.wheelchair_accessible ? '✅ Yes' : '❌ No'}</span>
            <span>🪜 Stairs: {a11y.stairs_segments} segment(s)</span>
            <span>🛗 Lifts: {a11y.lift_segments} segment(s)</span>
            <span>⛰️ Steep: {a11y.steep_segments} segment(s)</span>
          </div>
        </div>
      )}
    </div>
  );
}
