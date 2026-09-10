import React from 'react';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

export default function IncidentCard({ incident, onClick }) {
  const getSeverityColor = (sev) => {
    switch (sev.toLowerCase()) {
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-600 text-white border-red-700 shadow-md shadow-red-500/20';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('construction')) return '🚧';
    if (t.includes('accident')) return '💥';
    if (t.includes('flood')) return '🌊';
    if (t.includes('tree')) return '🌳';
    if (t.includes('crowd')) return '🧑‍🤝‍🧑';
    if (t.includes('pothole')) return '🕳️';
    return '⚠️';
  };

  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
      onClick={() => onClick && onClick(incident)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="icon">{getTypeIcon(incident.type)}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getSeverityColor(incident.severity)}`}>
            {incident.severity}
          </span>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(incident.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
      
      <h4 className="font-semibold text-slate-900 text-sm mb-1 capitalize">{incident.type.replace('_', ' ')}</h4>
      
      <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-2">
        <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <span className="font-medium">{incident.road_name || `${incident.from_name} ↔ ${incident.to_name}`}</span>
      </div>
      
      {incident.description && (
        <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          {incident.description}
        </p>
      )}
    </div>
  );
}
