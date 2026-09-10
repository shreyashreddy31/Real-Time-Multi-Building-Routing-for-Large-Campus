import React from 'react';

export default function StatsCard({ icon: Icon, label, value, trend, trendLabel, colorClass = "text-primary bg-primary/10" }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
          {value}
          {trend && (
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '-'}
            </span>
          )}
        </div>
        {trendLabel && <div className="text-xs text-slate-400 mt-1">{trendLabel}</div>}
      </div>
    </div>
  );
}
