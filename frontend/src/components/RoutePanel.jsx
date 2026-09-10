import React from 'react';
import { Route, Clock, MapPin, Activity, Zap } from 'lucide-react';

export default function RoutePanel({ route }) {
  if (!route || !route.found) return (
    <div className="p-6 text-center text-slate-500">
      Route not found or calculation failed.
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-primary/5 p-4 border-b border-primary/10">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-bold text-primary">{route.eta_display}</div>
            <div className="text-slate-600 font-medium">{(route.distance).toFixed(0)} meters</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase font-semibold">Algorithm</div>
            <div className="text-sm font-bold text-slate-700 capitalize">{route.algorithm}</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">Cost: <span className="font-semibold text-slate-900">{route.cost.toFixed(1)}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">Exec: <span className="font-semibold text-slate-900">{route.execution_time_ms.toFixed(2)}ms</span></span>
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Route className="h-5 w-5 text-primary" /> Directions
        </h4>
        <div className="space-y-4">
          {route.instructions.map((inst, idx) => (
            <div key={idx} className="flex gap-3 relative">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-xs font-bold text-slate-500 z-10">
                  {idx + 1}
                </div>
                {idx !== route.instructions.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 absolute top-6 bottom-[-16px]"></div>
                )}
              </div>
              <div className="pt-0.5 pb-2 text-sm text-slate-700">{inst}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
