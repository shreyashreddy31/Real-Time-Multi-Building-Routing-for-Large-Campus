import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users } from 'lucide-react';

export default function PlaceCard({ place, onClick }) {
  const navigate = useNavigate();
  const isOpen = place.status === 'open';

  const crowdColors = {
    low: 'bg-green-500',
    moderate: 'bg-yellow-500',
    high: 'bg-orange-500',
    extreme: 'bg-red-500'
  };

  return (
    <div 
      className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
      onClick={() => onClick && onClick(place)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900 leading-tight">{place.name}</h3>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{place.category}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">{place.description}</p>

      <div className="space-y-2 mb-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{place.hours || 'Hours not listed'}</span>
        </div>
        {place.crowd_level && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <span className="capitalize">{place.crowd_level} Crowd</span>
              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${crowdColors[place.crowd_level] || 'bg-slate-300'}`} style={{ width: place.crowd_level === 'low' ? '25%' : place.crowd_level === 'moderate' ? '50%' : place.crowd_level === 'high' ? '75%' : '100%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/navigate?to=${place.id}`);
        }}
        className="w-full mt-auto py-2 px-4 bg-slate-50 text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
      >
        <MapPin className="h-4 w-4" /> Navigate Here
      </button>
    </div>
  );
}
