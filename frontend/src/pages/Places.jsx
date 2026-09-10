import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useCampusStore } from '../stores/campusStore';
import PlaceCard from '../components/PlaceCard';

const CATEGORIES = ['All', 'Academic', 'Dining', 'Recreation', 'Services', 'Emergency', 'Transport', 'Residential'];

export default function Places() {
  const { places } = useCampusStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaces = places.filter(place => {
    const matchesCategory = activeCategory === 'All' || (place.category && place.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (place.description && place.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campus Directory</h1>
          <p className="text-slate-500 mt-1">Browse all facilities, buildings, and points of interest.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search places..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-6 hide-scrollbar gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === category 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlaces.map(place => (
          <PlaceCard key={place.id} place={place} />
        ))}
        {filteredPlaces.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            No places found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
