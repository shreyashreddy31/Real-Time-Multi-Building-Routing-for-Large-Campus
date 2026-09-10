import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Map, AlertTriangle, Car, Activity, ChevronRight, ShieldAlert } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { useCampusStore, useTrafficStore, useParkingStore } from '../stores/campusStore';
import PlaceCard from '../components/PlaceCard';

export default function Home() {
  const navigate = useNavigate();
  const { networkInfo, places } = useCampusStore();
  const { incidents } = useTrafficStore();
  const { parkingZones } = useParkingStore();

  const activeIncidents = incidents.filter(i => i.status === 'active');
  const availableParking = parkingZones.reduce((acc, zone) => acc + (zone.total_spaces - zone.occupied), 0);
  
  const popularPlaces = places.slice(0, 6); // Just grab first 6 for demo

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-primary to-purple-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium">Live Campus Tracking Active</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-slide-up">
            Navigate Meridian <br className="hidden md:block"/> Smart Campus
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mb-10 animate-slide-up" style={{animationDelay: '100ms'}}>
            Find the fastest route through a campus that changes in real time. Avoiding crowds, traffic, and construction effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '200ms'}}>
            <button 
              onClick={() => navigate('/navigate')}
              className="px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Compass className="h-5 w-5" /> Start Navigation
            </button>
            <button 
              onClick={() => navigate('/explore')}
              className="px-8 py-4 bg-primary-600 border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Map className="h-5 w-5" /> Explore Map
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Shortcut */}
      <div className="bg-danger text-white py-3 px-4 shadow-md cursor-pointer hover:bg-red-600 transition-colors" onClick={() => navigate('/emergency')}>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 font-semibold text-sm md:text-base">
          <ShieldAlert className="h-5 w-5 animate-pulse" />
          Emergency? Dispatch a response vehicle and get the fastest cleared route now. &rarr;
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
        
        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard icon={Map} label="Total Locations" value={networkInfo?.node_count || '-'} colorClass="text-blue-600 bg-blue-100" />
          <StatsCard icon={Activity} label="Road Segments" value={networkInfo?.edge_count || '-'} colorClass="text-emerald-600 bg-emerald-100" />
          <StatsCard icon={AlertTriangle} label="Active Incidents" value={activeIncidents.length} colorClass="text-amber-600 bg-amber-100" />
          <StatsCard icon={Car} label="Available Parking" value={availableParking} colorClass="text-purple-600 bg-purple-100" />
        </section>

        {/* Popular Destinations */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular Destinations</h2>
              <p className="text-slate-500">Frequently visited places on campus right now.</p>
            </div>
            <Link to="/places" className="text-primary font-medium hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPlaces.map(place => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
