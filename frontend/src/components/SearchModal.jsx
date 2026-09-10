import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Building, Utensils, Activity, Stethoscope, Car, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const getIconForCategory = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('academic')) return Building;
  if (cat.includes('dining')) return Utensils;
  if (cat.includes('recreation')) return Activity;
  if (cat.includes('emergency') || cat.includes('hospital')) return Stethoscope;
  if (cat.includes('transport') || cat.includes('parking')) return Car;
  if (cat.includes('residential')) return Home;
  return MapPin;
};

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.searchPlaces(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (placeId) => {
    onClose();
    navigate(`/navigate?to=${placeId}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden mx-4">
        <div className="relative border-b border-slate-100 flex items-center px-4 py-4">
          <Search className="h-6 w-6 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 w-full bg-transparent border-none focus:ring-0 text-lg px-4 outline-none placeholder:text-slate-400"
            placeholder="Search places, buildings, facilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {isSearching ? (
              <div className="p-8 text-center text-slate-500">Searching...</div>
            ) : results.length > 0 ? (
              <ul className="space-y-1">
                {results.map((result) => {
                  const Icon = getIconForCategory(result.category);
                  return (
                    <li key={result.id}>
                      <button
                        onClick={() => handleSelect(result.id)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-4 transition-colors group"
                      >
                        <div className="h-10 w-10 bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary rounded-lg flex items-center justify-center transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{result.name}</div>
                          <div className="text-xs text-slate-500">{result.category}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
